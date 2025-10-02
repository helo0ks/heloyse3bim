// db.js - conexão com PostgreSQL
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres', // ajuste conforme seu ambiente
  host: 'localhost',
  database: 'snoopy',
  password: 'batatabb2008', // ajuste conforme seu ambiente
  port: 5432,
});

module.exports = { pool };
