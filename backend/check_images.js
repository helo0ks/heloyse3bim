const { pool } = require('./db');

pool.query('SELECT id, nome, imagem FROM produto ORDER BY id', (err, res) => {
  if (err) {
    console.log('DB Error:', err.message);
  } else {
    console.log('Produtos no banco:');
    res.rows.forEach(p => {
      console.log(`  ID: ${p.id}, Nome: ${p.nome}, Imagem: ${p.imagem}`);
    });
  }
  pool.end();
});
