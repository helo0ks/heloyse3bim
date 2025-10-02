const { pool } = require('./db');

async function adicionarColunaCategoria() {
  try {
    console.log('Adicionando coluna categoria à tabela produto...');
    
    // Adicionar coluna categoria se não existir
    await pool.query(`
      ALTER TABLE produto 
      ADD COLUMN IF NOT EXISTS categoria VARCHAR(100) DEFAULT 'Pelúcia'
    `);
    
    console.log('Coluna categoria adicionada com sucesso!');
    
    // Atualizar registros existentes que não têm categoria
    const result = await pool.query(`
      UPDATE produto 
      SET categoria = 'Pelúcia' 
      WHERE categoria IS NULL
    `);
    
    console.log(`${result.rowCount} registros atualizados com categoria padrão.`);
    
    // Verificar a estrutura atual
    const colunas = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'produto' 
      ORDER BY ordinal_position
    `);
    
    console.log('\nEstrutura atual da tabela produto:');
    colunas.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})${col.column_default ? ' default: ' + col.column_default : ''}`);
    });
    
  } catch (error) {
    console.error('Erro ao adicionar coluna categoria:', error);
  } finally {
    await pool.end();
  }
}

adicionarColunaCategoria();