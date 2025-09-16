const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { pool } = require('../db');

// Utilitário para gerar token de redefinição
function generateResetToken() {
  return require('crypto').randomBytes(32).toString('hex');
}

exports.login = async (req, res) => {
  const { email, senha } = req.body;
  try {
    const result = await pool.query('SELECT * FROM pessoa WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
    }
    const user = result.rows[0];
    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      return res.status(401).json({ sucesso: false, mensagem: 'Senha incorreta.' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, tipo: user.tipo }, process.env.JWT_SECRET || 'segredo', { expiresIn: '2h' });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.json({ sucesso: true, token, usuario: { id: user.id, nome: user.nome, email: user.email, tipo: user.tipo } });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao fazer login.' });
  }
};

exports.register = async (req, res) => {
  const { cpf, nome, email, senha } = req.body;
  try {
    // Verifica se já existe CPF ou email cadastrado
    const existeCpf = await pool.query('SELECT * FROM pessoa WHERE cpf = $1', [cpf]);
    if (existeCpf.rows.length > 0) {
      return res.status(400).json({ sucesso: false, mensagem: 'CPF já cadastrado.' });
    }
    const existeEmail = await pool.query('SELECT * FROM pessoa WHERE email = $1', [email]);
    if (existeEmail.rows.length > 0) {
      return res.status(400).json({ sucesso: false, mensagem: 'E-mail já cadastrado.' });
    }
    const hash = await bcrypt.hash(senha, 10);
    await pool.query('INSERT INTO pessoa (cpf, nome, email, senha, tipo) VALUES ($1, $2, $3, $4, $5)', [cpf, nome, email, hash, 'cliente']);
    res.json({ sucesso: true, mensagem: 'Cadastro realizado com sucesso!' });
  } catch (err) {
    console.log('Erro no cadastro:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao cadastrar.' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const result = await pool.query('SELECT * FROM pessoa WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'E-mail não encontrado.' });
    }
    const user = result.rows[0];
    const token = generateResetToken();
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutos
    await pool.query('UPDATE pessoa SET reset_token = $1, reset_token_expires = $2 WHERE id = $3', [token, expires, user.id]);

    // Configurar o transporte de e-mail (ajuste para seu provedor)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    const resetUrl = `http://localhost:3000/resetar-senha.html?token=${token}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Recuperação de senha - Loja Snoopy',
      html: `<p>Olá, ${user.nome}!<br>Para redefinir sua senha, clique no link abaixo:<br><a href="${resetUrl}">${resetUrl}</a><br>Este link expira em 30 minutos.</p>`
    });
    res.json({ sucesso: true, mensagem: 'E-mail de recuperação enviado.' });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao enviar e-mail.' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, novaSenha } = req.body;
  try {
    const result = await pool.query('SELECT * FROM pessoa WHERE reset_token = $1 AND reset_token_expires > NOW()', [token]);
    if (result.rows.length === 0) {
      return res.status(400).json({ sucesso: false, mensagem: 'Token inválido ou expirado.' });
    }
    const hash = await bcrypt.hash(novaSenha, 10);
    await pool.query('UPDATE pessoa SET senha = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2', [hash, result.rows[0].id]);
    res.json({ sucesso: true, mensagem: 'Senha redefinida com sucesso!' });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao redefinir senha.' });
  }
};
