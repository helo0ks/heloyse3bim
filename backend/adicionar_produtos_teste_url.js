// Script para testar produtos com imagens de URL
const { pool } = require('./db');

async function adicionarProdutosComImagens() {
  try {
    console.log('🛒 Adicionando produtos com imagens de URL...');

    const produtos = [
      {
        id: 100,
        nome: 'Snoopy Dormindo',
        descricao: 'Pelúcia do Snoopy em posição de descanso',
        preco: 45.99,
        imagem: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=300&fit=crop',
        estoque: 10
      },
      {
        id: 101,
        nome: 'Woodstock Voando',
        descricao: 'Pelúcia do Woodstock em voo',
        preco: 29.99,
        imagem: 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=300&h=300&fit=crop',
        estoque: 15
      },
      {
        id: 102,
        nome: 'Charlie Brown',
        descricao: 'Pelúcia do Charlie Brown clássico',
        preco: 39.99,
        imagem: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
        estoque: 8
      }
    ];

    for (const produto of produtos) {
      try {
        // Verificar se o produto já existe
        const existe = await pool.query('SELECT id FROM produto WHERE id = $1', [produto.id]);
        
        if (existe.rows.length > 0) {
          console.log(`⚠️  Produto ID ${produto.id} já existe, pulando...`);
          continue;
        }

        // Inserir produto (o controller vai baixar a imagem automaticamente)
        await pool.query(
          'INSERT INTO produto (id, nome, descricao, preco, imagem, estoque) VALUES ($1, $2, $3, $4, $5, $6)',
          [produto.id, produto.nome, produto.descricao, produto.preco, produto.imagem, produto.estoque]
        );

        console.log(`✅ Produto "${produto.nome}" adicionado com ID ${produto.id}`);
        console.log(`   URL da imagem: ${produto.imagem}`);
        
      } catch (error) {
        console.log(`❌ Erro ao adicionar produto ${produto.nome}:`, error.message);
      }
    }

    console.log('\n🎉 Processo concluído!');
    console.log('💡 As imagens serão baixadas automaticamente quando você usar o CRUD no frontend.');
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  } finally {
    process.exit(0);
  }
}

// Executar
adicionarProdutosComImagens();