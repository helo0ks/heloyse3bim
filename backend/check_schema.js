const { pool } = require('./db');

(async () => {
  try {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='pessoa' ORDER BY ordinal_position");
    console.log('Colunas da tabela pessoa:');
    res.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`));
  } catch (err) {
    console.error('Erro:', err.message);
  } finally {
    await pool.end();
  }
})();
