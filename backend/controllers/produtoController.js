const { pool } = require('../db');
const axios = require('axios');

// =====================================================
// FUNÇÃO AUXILIAR: Baixar imagem como Buffer
// =====================================================
async function baixarImagemComoBuffer(imageUrl) {
  try {
    if (!imageUrl || imageUrl.trim() === '') {
      return null;
    }

    // Verificar se é URL válida
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      return null;
    }

    // Download da imagem como buffer
    const response = await axios({
      method: 'GET',
      url: imageUrl,
      responseType: 'arraybuffer',
      timeout: 10000 // 10 segundos
    });

    // Retornar {buffer, tipo}
    const contentType = response.headers['content-type'] || 'image/jpeg';
    return {
      buffer: Buffer.from(response.data),
      tipo: contentType
    };

  } catch (error) {
    console.log('Erro ao baixar imagem:', error.message);
    return null;
  }
}

// Buscar imagem de um produto
exports.buscarImagemProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT imagem_binaria, imagem_tipo FROM produto WHERE id = $1', [id]);
    
    if (result.rows.length === 0 || !result.rows[0].imagem_binaria) {
      return res.status(404).json({ message: 'Imagem não encontrada' });
    }

    const { imagem_binaria, imagem_tipo } = result.rows[0];
    
    // Enviar imagem com header MIME correto
    res.set('Content-Type', imagem_tipo || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=31536000'); // Cache de 1 ano
    res.send(imagem_binaria);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Erro ao buscar imagem' });
  }
};

// Buscar produto por ID
exports.buscarProdutoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT id, nome, descricao, preco, estoque, imagem_tipo FROM produto WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Erro ao buscar produto' });
  }
};
// Editar produto existente
exports.editarProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, preco, imagem, estoque } = req.body;

    // Baixar imagem se for URL
    let imagemBuffer = null;
    let imagemTipo = null;

    if (imagem && (imagem.startsWith('http://') || imagem.startsWith('https://'))) {
      const imagemData = await baixarImagemComoBuffer(imagem);
      if (imagemData) {
        imagemBuffer = imagemData.buffer;
        imagemTipo = imagemData.tipo;
      }
    }

    // Se imagem foi fornecida, atualizar. Caso contrário, manter a existente
    let queryText;
    let params;

    if (imagemBuffer !== null) {
      // Atualizar incluindo imagem
      queryText = 'UPDATE produto SET nome = $1, descricao = $2, preco = $3, imagem_binaria = $4, imagem_tipo = $5, estoque = $6 WHERE id = $7 RETURNING id, nome, descricao, preco, estoque, imagem_tipo';
      params = [nome, descricao, preco, imagemBuffer, imagemTipo, estoque, id];
    } else {
      // Atualizar sem mudar imagem
      queryText = 'UPDATE produto SET nome = $1, descricao = $2, preco = $3, estoque = $4 WHERE id = $5 RETURNING id, nome, descricao, preco, estoque, imagem_tipo';
      params = [nome, descricao, preco, estoque, id];
    }

    const result = await pool.query(queryText, params);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Erro ao editar produto' });
  }
};

// Excluir produto
exports.excluirProduto = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM produto WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    res.json({ message: 'Produto excluído com sucesso' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Erro ao excluir produto' });
  }
};

// Cadastrar novo produto (com upload de imagem como BLOB)
exports.cadastrarProduto = async (req, res) => {
  try {
    const { id, nome, descricao, preco, imagem, estoque } = req.body;

    // Baixar imagem se for URL e converter para Buffer
    let imagemBuffer = null;
    let imagemTipo = null;

    if (imagem) {
      const imagemData = await baixarImagemComoBuffer(imagem);
      if (imagemData) {
        imagemBuffer = imagemData.buffer;
        imagemTipo = imagemData.tipo;
      }
    }

    // INSERT com BLOB
    const result = await pool.query(
      'INSERT INTO produto (id, nome, descricao, preco, imagem_binaria, imagem_tipo, estoque) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, nome, descricao, preco, estoque, imagem_tipo',
      [id, nome, descricao, preco, imagemBuffer, imagemTipo, estoque]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Erro ao cadastrar produto' });
  }
};

// Listar todos os produtos
exports.listarProdutos = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nome, descricao, preco, estoque, imagem_tipo FROM produto ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Erro ao listar produtos' });
  }
};

// Listar produtos públicos (loja) - sem BLOB, apenas metadados
exports.listarProdutosPublicos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nome, descricao, preco, estoque as quantidade,
             CASE 
               WHEN imagem_tipo IS NOT NULL THEN '/admin-api/produtos/' || id || '/imagem'
               ELSE NULL 
             END as imagem,
             CASE 
               WHEN categoria IS NULL THEN 'Pelúcia' 
               ELSE categoria 
             END as categoria
      FROM produto 
      WHERE estoque > 0 
      ORDER BY nome
    `);
    
    res.json({
      sucesso: true,
      dados: result.rows,
      total: result.rows.length
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ 
      sucesso: false,
      mensagem: 'Erro ao listar produtos públicos' 
    });
  }
};
