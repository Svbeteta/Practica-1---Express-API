const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET /health
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Practica#1_ExpressAPI',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// GET /db-check -> SELECT 1
router.get('/db-check', async (req, res) => {
  try {
    const result = await pool.query('SELECT 1 AS ok');
    res.json({ db: result.rows?.[0]?.ok === 1 ? 'up' : 'unknown', raw: result.rows });
  } catch (err) {
    console.error('db-check error:', err.message);
    res.status(500).json({ db: 'down', error: err.message });
  }
});

module.exports = router;
