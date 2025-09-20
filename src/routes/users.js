const express = require('express');
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth'); 

const router = express.Router();
const AUTHOR_TAG_PREFIX = '--author:'; 

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT "id_user","username","display_name","email","dob","bio","created_at","updated_at"
       FROM "USER"
       WHERE "id_user" = $1`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    return res.json(rows[0]);
  } catch (err) {
    console.error('get user error:', err);
    return res.status(500).json({ error: 'Error al obtener usuario.' });
  }
});

router.post('/:id/follow/:targetId', authMiddleware, async (req, res) => {
  const follower = parseInt(req.params.id, 10);
  const followee = parseInt(req.params.targetId, 10);

  if (Number.isNaN(follower) || Number.isNaN(followee)) {
    return res.status(400).json({ error: 'IDs inválidos.' });
  }
  if (follower !== req.user.id_user) {
    return res.status(403).json({ error: 'No puedes seguir en nombre de otro usuario.' });
  }
  if (follower === followee) {
    return res.status(400).json({ error: 'No puedes seguirte a ti mismo.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO "FOLLOWER" ("id_follower","id_followee")
       VALUES ($1,$2)
       ON CONFLICT ("id_follower","id_followee") DO NOTHING`,
      [follower, followee]
    );

    const ins = await client.query(
      `INSERT INTO "FOLLOW" ("id_follower","id_followee")
       VALUES ($1,$2)
       ON CONFLICT ("id_follower","id_followee") DO NOTHING
       RETURNING "id_follower","id_followee","follow_date"`,
      [follower, followee]
    );

    await client.query('COMMIT');

    if (ins.rowCount === 0) {
      return res.status(200).json({
        follower,
        followee,
        message: 'Ya seguías a este usuario.'
      });
    }

    return res.status(200).json({
      follower,
      followee,
      message: 'Ahora sigues a este usuario.'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('follow error:', err);
    return res.status(500).json({ error: 'Error al seguir.' });
  } finally {
    client.release();
  }
});

router.delete('/:id/follow/:targetId', authMiddleware, async (req, res) => {
  try {
    const follower = parseInt(req.params.id, 10);
    const followee = parseInt(req.params.targetId, 10);

    if (Number.isNaN(follower) || Number.isNaN(followee)) {
      return res.status(400).json({ error: 'IDs inválidos.' });
    }
    if (follower !== req.user.id_user) {
      return res.status(403).json({ error: 'No puedes dejar de seguir en nombre de otro usuario.' });
    }

    const del = await pool.query(
      `DELETE FROM "FOLLOW" WHERE "id_follower"=$1 AND "id_followee"=$2`,
      [follower, followee]
    );

    await pool.query(
      `DELETE FROM "FOLLOWER" WHERE "id_follower"=$1 AND "id_followee"=$2`,
      [follower, followee]
    );

    if (del.rowCount === 0) {
      return res.status(404).json({ error: 'No lo seguías.' });
    }

    return res.json({ follower, followee, message: 'Has dejado de seguir a este usuario.' });
  } catch (err) {
    console.error('unfollow error:', err);
    return res.status(500).json({ error: 'Error al dejar de seguir.' });
  }
});


router.get('/:id/messages', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  try {
    const pattern = `%${AUTHOR_TAG_PREFIX}${id}%`;
    const { rows } = await pool.query(
      `SELECT "id_message","id_user","body","created_at"
       FROM "MESSAGE"
       WHERE "body" ILIKE $1
       ORDER BY "created_at" DESC`,
      [pattern]
    );
    return res.json(rows);
  } catch (err) {
    console.error('get user messages error:', err);
    return res.status(500).json({ error: 'Error al obtener mensajes.' });
  }
});


router.delete('/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido.' });
  }
  if (id !== req.user.id_user) {
    return res.status(403).json({ error: 'Solo puedes borrar tu propio usuario.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`DELETE FROM "FOLLOW" WHERE "id_follower"=$1 OR "id_followee"=$1`, [id]);
    await client.query(`DELETE FROM "FOLLOWER" WHERE "id_follower"=$1 OR "id_followee"=$1`, [id]);
    await client.query(`DELETE FROM "MESSAGE" WHERE "id_user"=$1`, [id]); // evita violar FK
    const del = await client.query(`DELETE FROM "USER" WHERE "id_user"=$1`, [id]);

    await client.query('COMMIT');

    if (del.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    return res.json({ message: 'Usuario eliminado.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('delete user error:', err);
    return res.status(500).json({ error: 'Error al eliminar usuario.' });
  } finally {
    client.release();
  }
});

module.exports = router;
