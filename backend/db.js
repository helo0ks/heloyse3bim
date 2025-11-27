// db.js - conexão com PostgreSQL
const { Pool } = require('pg');
require('dotenv').config();

// Usar variáveis de ambiente em produção. Valores padrão ajudam em dev local.
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'snoopy',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

module.exports = { pool };
