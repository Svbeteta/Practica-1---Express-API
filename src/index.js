require('dotenv').config();
const express = require('express');
const { pool } = require('./db');

const app = express();
app.use(express.json());

// Rutas
const router = require('./routes');
app.use('/', router);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});

// Cierre ordenado
function shutdown(signal) {
  console.log(`\nRecibido ${signal}. Cerrando...`);
  server.close(async () => {
    await pool.end().catch(() => {});
    console.log('Servidor y pool cerrados. Bye!');
    process.exit(0);
  });
}
['SIGINT','SIGTERM'].forEach(s => process.on(s, () => shutdown(s)));

module.exports = { app };

