const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'snoopy',
  password: 'batatabb2008',
  port: 5432,
});

async function corrigirBanco() {
  try {
    console.log('🔧 Iniciando correção do banco de dados...');
    
    // Ler o arquivo SQL de correção
    const sqlPath = path.join(__dirname, '..', 'documentacao', 'corrigir_banco.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Executar o SQL
    await pool.query(sqlContent);
    
    console.log('✅ Banco de dados corrigido com sucesso!');
    
    // Verificar se a estrutura está correta
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'pessoa' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Nova estrutura da tabela pessoa:');
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    await pool.end();
  } catch (err) {
    console.error('❌ Erro ao corrigir banco:', err);
    await pool.end();
  }
}

corrigirBanco();