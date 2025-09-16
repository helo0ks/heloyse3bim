const { pool } = require('../db');
const bcrypt = require('bcrypt');

// Listar todas as pessoas
exports.listarPessoas = async (req, res) => {
  try {
    const result = await pool.query('SELECT cpf, nome, email, tipo FROM pessoa');
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Erro ao listar pessoas' });
  }
};

// Buscar pessoa por CPF
exports.buscarPessoa = async (req, res) => {
  try {
    const { cpf } = req.params;
    const result = await pool.query('SELECT cpf, nome, email, tipo FROM pessoa WHERE cpf = $1', [cpf]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Pessoa não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Erro ao buscar pessoa' });
  }
};

// Cadastrar nova pessoa (admin pode criar qualquer tipo)
exports.cadastrarPessoa = async (req, res) => {
  try {
    const { cpf, nome, email, senha, tipo } = req.body;
    const existeCpf = await pool.query('SELECT * FROM pessoa WHERE cpf = $1', [cpf]);
    if (existeCpf.rows.length > 0) return res.status(400).json({ message: 'CPF já cadastrado.' });
    const existeEmail = await pool.query('SELECT * FROM pessoa WHERE email = $1', [email]);
    if (existeEmail.rows.length > 0) return res.status(400).json({ message: 'E-mail já cadastrado.' });
    const hash = await bcrypt.hash(senha, 10);
    await pool.query('INSERT INTO pessoa (cpf, nome, email, senha, tipo) VALUES ($1, $2, $3, $4, $5)', [cpf, nome, email, hash, tipo || 'cliente']);
    res.status(201).json({ message: 'Pessoa cadastrada com sucesso!' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Erro ao cadastrar pessoa' });
  }
};

// Atualizar pessoa
exports.atualizarPessoa = async (req, res) => {
  try {
    const { cpf } = req.params;
    const { nome, email, senha, tipo } = req.body;
    let query = 'UPDATE pessoa SET nome = $1, email = $2, tipo = $3';
    let params = [nome, email, tipo, cpf];
    if (senha) {
      const hash = await bcrypt.hash(senha, 10);
      query = 'UPDATE pessoa SET nome = $1, email = $2, tipo = $3, senha = $4 WHERE cpf = $5';
      params = [nome, email, tipo, hash, cpf];
    } else {
      query += ' WHERE cpf = $4';
    }
    const result = await pool.query(query, params);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Pessoa não encontrada' });
    res.json({ message: 'Pessoa atualizada com sucesso!' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Erro ao atualizar pessoa' });
  }
};

// Deletar pessoa
exports.deletarPessoa = async (req, res) => {
  try {
    const { cpf } = req.params;
    const result = await pool.query('DELETE FROM pessoa WHERE cpf = $1', [cpf]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Pessoa não encontrada' });
    res.json({ message: 'Pessoa excluída com sucesso!' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Erro ao excluir pessoa' });
  }
};
