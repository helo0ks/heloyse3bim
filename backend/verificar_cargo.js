const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'snoopy',
  password: 'batatabb2008',
  port: 5432,
});

async function verificarTabelaCargo() {
  try {
    console.log('🔍 Verificando se a tabela cargo existe...');
    
    // Verificar se a tabela existe
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'cargo'
      );
    `);
    
    if (tableExists.rows[0].exists) {
      console.log('✅ Tabela cargo encontrada!');
      
      // Verificar estrutura da tabela
      const structure = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'cargo' 
        ORDER BY ordinal_position;
      `);
      
      console.log('📋 Estrutura da tabela cargo:');
      structure.rows.forEach(row => {
        console.log(`   - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
      
      // Ver dados
      const data = await pool.query('SELECT * FROM cargo LIMIT 5');
      console.log(`\n📊 Dados na tabela cargo (${data.rows.length} registros):`);
      data.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ID: ${row.idcargo || row.id} | Nome: ${row.nomecargo || row.nome}`);
      });
      
    } else {
      console.log('❌ Tabela cargo não encontrada!');
      console.log('💡 Criando tabela cargo...');
      
      await pool.query(`
        CREATE TABLE cargo (
          idCargo SERIAL PRIMARY KEY,
          nomeCargo VARCHAR(100) NOT NULL
        );
      `);
      
      console.log('✅ Tabela cargo criada!');
      
      // Inserir dados de teste
      await pool.query(`
        INSERT INTO cargo (nomeCargo) VALUES 
        ('Gerente'),
        ('Vendedor'),
        ('Caixa'),
        ('Estoquista')
      `);
      
      console.log('✅ Dados de teste inseridos!');
    }
    
    await pool.end();
  } catch (err) {
    console.error('❌ Erro:', err);
    await pool.end();
  }
}

verificarTabelaCargo();