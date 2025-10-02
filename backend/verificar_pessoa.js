const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost', 
  database: 'snoopy',
  password: 'batatabb2008',
  port: 5432,
});

async function verificarEstrutura() {
  try {
    console.log('Verificando estrutura da tabela pessoa...');
    
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'pessoa' 
      ORDER BY ordinal_position
    `);
    
    console.log('\nColunas da tabela pessoa:');
    result.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})${col.column_default ? ' default: ' + col.column_default : ''}`);
    });
    
    // Verificar se existe algum registro
    const count = await pool.query('SELECT COUNT(*) as total FROM pessoa');
    console.log(`\nTotal de registros na tabela: ${count.rows[0].total}`);
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await pool.end();
  }
}

verificarEstrutura();