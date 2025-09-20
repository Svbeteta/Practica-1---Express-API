const express = require('express');
const { pool } = require('../db');
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, display_name, email, password, dob, bio } = req.body || {};

    if (!username || !display_name || !email || !password || !dob) {
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    const dup = await pool.query(
      `SELECT 1 FROM "USER" WHERE email = $1 OR username = $2 LIMIT 1`,
      [email, username]
    );
    if (dup.rowCount > 0) {
      return res.status(409).json({ error: 'Email o username ya registrados.' });
    }

    const insert = await pool.query(
      `INSERT INTO "USER"
        ("username","display_name","email","password","dob","bio","created_at","updated_at")
       VALUES ($1,$2,$3,$4,$5::date,$6,NOW(),NOW())
       RETURNING id_user, username, display_name, email, dob, bio, created_at, updated_at`,
      [username, display_name, email, password, dob, bio ?? null]
    );

    return res.status(201).json(insert.rows[0]);
  } catch (err) {
    console.error('register error:', err); 
    return res.status(500).json({ error: 'Error al registrar usuario.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password son obligatorios.' });
    }

    const { rows } = await pool.query(
      `SELECT * FROM "USER" WHERE email = $1 AND password = $2 LIMIT 1`,
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const user = rows[0];
    delete user.password;

    const token = jwt.sign({ id_user: user.id_user }, SECRET, { expiresIn: "1h" });

    return res.json({ message: 'Login correcto', token, user });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
});

module.exports = router;
