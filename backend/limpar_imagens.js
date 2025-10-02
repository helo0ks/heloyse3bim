const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost', 
  database: 'snoopy',
  password: 'batatabb2008',
  port: 5432,
});

async function limparImagensInvalidas() {
  try {
    console.log('Limpando imagens inválidas...');
    
    // Atualizar produtos com imagens inválidas para NULL
    const result = await pool.query(`
      UPDATE produto 
      SET imagem = NULL 
      WHERE imagem = 'img/snoopy-bg.png' OR imagem = '' OR imagem IS NULL
    `);
    
    console.log(`✓ ${result.rowCount} produtos atualizados (imagens removidas)`);
    
    // Verificar produtos atualizados
    const produtos = await pool.query('SELECT id, nome, imagem FROM produto ORDER BY id');
    
    console.log('\n📦 Produtos atualizados:');
    produtos.rows.forEach(produto => {
      console.log(`- ID ${produto.id}: ${produto.nome} (imagem: ${produto.imagem || 'nenhuma'})`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
  }
}

limparImagensInvalidas();