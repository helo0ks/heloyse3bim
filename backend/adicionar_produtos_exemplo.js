const { pool } = require('./db');

async function adicionarProdutosExemplo() {
  try {
    console.log('Adicionando produtos de exemplo...');
    
    const produtos = [
      {
        nome: 'Pelúcia Snoopy Clássico',
        descricao: 'Pelúcia do amado Snoopy em tamanho médio, perfeita para abraçar!',
        preco: 89.90,
        categoria: 'Pelúcia',
        estoque: 15,
        imagem: null // Sem imagem para evitar erros
      },
      {
        nome: 'Snoopy Aviador',
        descricao: 'Snoopy vestido de aviador da Primeira Guerra Mundial, uma peça única!',
        preco: 129.90,
        categoria: 'Pelúcia Especial',
        estoque: 8,
        imagem: null // Sem imagem para evitar erros
      },
      {
        nome: 'Woodstock Fofo',
        descricao: 'O melhor amigo do Snoopy em uma adorável pelúcia amarela.',
        preco: 45.90,
        categoria: 'Pelúcia',
        estoque: 20,
        imagem: null // Sem imagem para evitar erros
      },
      {
        nome: 'Snoopy Gigante',
        descricao: 'Pelúcia gigante do Snoopy, ideal para decoração e abraços!',
        preco: 199.90,
        categoria: 'Pelúcia Grande',
        estoque: 5,
        imagem: null // Sem imagem para evitar erros
      },
      {
        nome: 'Charlie Brown',
        descricao: 'O dono do Snoopy em uma pelúcia carinhosa e detalhada.',
        preco: 79.90,
        categoria: 'Pelúcia',
        estoque: 12,
        imagem: null // Sem imagem para evitar erros
      },
      {
        nome: 'Snoopy Natalino',
        descricao: 'Snoopy com roupa natalina, perfeito para as festas!',
        preco: 99.90,
        categoria: 'Pelúcia Temática',
        estoque: 10,
        imagem: null // Sem imagem para evitar erros
      }
    ];
    
    for (const produto of produtos) {
      // Verificar se o produto já existe
      const existeQuery = await pool.query('SELECT id FROM produto WHERE nome = $1', [produto.nome]);
      
      let result;
      if (existeQuery.rows.length > 0) {
        // Atualizar produto existente
        result = await pool.query(`
          UPDATE produto 
          SET descricao = $2, preco = $3, categoria = $4, estoque = $5, imagem = $6
          WHERE nome = $1
          RETURNING id, nome
        `, [produto.nome, produto.descricao, produto.preco, produto.categoria, produto.estoque, produto.imagem]);
        console.log(`↻ Produto atualizado: ${result.rows[0].nome} (ID: ${result.rows[0].id})`);
      } else {
        // Inserir novo produto
        result = await pool.query(`
          INSERT INTO produto (nome, descricao, preco, categoria, estoque, imagem)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id, nome
        `, [produto.nome, produto.descricao, produto.preco, produto.categoria, produto.estoque, produto.imagem]);
        console.log(`✓ Produto adicionado: ${result.rows[0].nome} (ID: ${result.rows[0].id})`);
      }

    }
    
    console.log('\n🎉 Todos os produtos foram adicionados com sucesso!');
    
    // Verificar total de produtos
    const total = await pool.query('SELECT COUNT(*) as total FROM produto');
    console.log(`📦 Total de produtos na loja: ${total.rows[0].total}`);
    
  } catch (error) {
    console.error('❌ Erro ao adicionar produtos:', error);
  } finally {
    await pool.end();
  }
}

adicionarProdutosExemplo();