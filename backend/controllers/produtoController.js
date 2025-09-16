// Buscar produto por ID
exports.buscarProdutoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM produto WHERE id = $1', [id]);
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
    const result = await pool.query(
      'UPDATE produto SET nome = $1, descricao = $2, preco = $3, imagem = $4, estoque = $5 WHERE id = $6 RETURNING *',
      [nome, descricao, preco, imagem, estoque, id]
    );
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
const { pool } = require('../db');

// Cadastrar novo produto (com ID manual)
exports.cadastrarProduto = async (req, res) => {
  try {
    const { id, nome, descricao, preco, imagem, estoque } = req.body;
    const result = await pool.query(
      'INSERT INTO produto (id, nome, descricao, preco, imagem, estoque) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, nome, descricao, preco, imagem, estoque]
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
    const result = await pool.query('SELECT * FROM produto');
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Erro ao listar produtos' });
  }
};
