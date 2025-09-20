const express = require('express');
const { pool } = require('../db');
const authMiddleware = require("../middleware/auth");

const router = express.Router();
const AUTHOR_TAG_PREFIX = '--author:';

router.get('/latest', async (req, res) => {
  try {
    const limit = Math.min(
      Math.max(parseInt(req.query.limit ?? '10', 10) || 10, 1),
      100
    );

    const { rows } = await pool.query(
      `SELECT "id_message","id_user","body","created_at"
       FROM "MESSAGE"
       ORDER BY "created_at" DESC
       LIMIT $1`,
      [limit]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener mensajes.' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const text = (req.query.text ?? req.query.q ?? '').toString().trim();
    if (!text) return res.status(400).json({ error: 'Falta parámetro text.' });

    const { rows } = await pool.query(
      `SELECT "id_message","id_user","body","created_at"
         FROM "MESSAGE"
        WHERE "body" ILIKE $1
        ORDER BY "id_message"`,
      [`%${text}%`]
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error en búsqueda.' });
  }
});


router.post("/", authMiddleware, async (req, res) => {
  try {
    const { body } = req.body || {};
    const id_user = req.user.id_user; 

    if (!body) {
      return res.status(400).json({ error: "Falta el cuerpo del mensaje." });
    }

    const insert = await pool.query(
      `INSERT INTO "MESSAGE" ("id_user","body","created_at")
       VALUES ($1,$2,NOW())
       RETURNING id_message, id_user, body, created_at`,
      [id_user, body]
    );

    return res.status(201).json(insert.rows[0]);
  } catch (err) {
    console.error("message creation error:", err);
    return res.status(500).json({ error: "Error al crear mensaje." });
  }
});

module.exports = router;


router.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("Buscando mensajes de usuario:", userId);

    const { rows } = await pool.query(
      `SELECT m.id_message, m.body, m.created_at,
              u.username, u.display_name
       FROM "MESSAGE" m
       JOIN "USER" u ON m.id_user = u.id_user
       WHERE m.id_user = $1
       ORDER BY m.created_at DESC`,
      [userId]
    );

    console.log("✅ Mensajes encontrados:", rows.length);
    return res.json(rows);
  } catch (err) {
    console.error("error en GET /messages/user/:id:", err);
    return res.status(500).json({ error: "Error al obtener mensajes del usuario." });
  }
});


router.get('/following/:id', async (req, res) => {
  try {
    const followerId = parseInt(req.params.id, 10);
    if (Number.isNaN(followerId)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const limit = Math.min(
      Math.max(parseInt(req.query.limit ?? '100', 10) || 100, 1),
      200
    );

    const { rows } = await pool.query(
      `SELECT m."id_message", m."id_user", m."body", m."created_at"
         FROM "MESSAGE" m
         JOIN "FOLLOW"  f
           ON m."id_user" = f."id_followee"
        WHERE f."id_follower" = $1
        ORDER BY m."created_at" DESC
        LIMIT $2`,
      [followerId, limit]
    );
    console.log(`Mensajes de seguidos para ${followerId}: ${rows.length}`);

    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error en mensajes de seguidos.' });
  }
});


module.exports = router;