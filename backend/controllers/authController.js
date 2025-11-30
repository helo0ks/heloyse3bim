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
      return res.status(401).json({ sucesso: false, mensagem: 'Usuário não encontrado.', message: 'User not found.' });
    }
    const user = result.rows[0];
    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      return res.status(401).json({ sucesso: false, mensagem: 'Senha incorreta.', message: 'Invalid password.' });
    }
    const token = jwt.sign({ cpf: user.cpf, email: user.email, tipo: user.tipo }, process.env.JWT_SECRET || 'segredo', { expiresIn: '2h' });
    // Cookie seguro em produção; sameSite e secure dependem do ambiente
    const cookieOptions = {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 2 * 60 * 60 * 1000 // 2 horas
    };
    res.cookie('token', token, cookieOptions);
    res.json({ sucesso: true, token, usuario: { cpf: user.cpf, nome: user.nome, email: user.email, tipo: user.tipo } });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao fazer login.', message: 'Error during login.' });
  }
};

exports.register = async (req, res) => {
  const { cpf, nome, email, senha } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Verifica se já existe CPF ou email cadastrado
    const existeCpf = await client.query('SELECT * FROM pessoa WHERE cpf = $1', [cpf]);
    if (existeCpf.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ sucesso: false, mensagem: 'CPF já cadastrado.' });
    }
    const existeEmail = await client.query('SELECT * FROM pessoa WHERE email = $1', [email]);
    if (existeEmail.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ sucesso: false, mensagem: 'E-mail já cadastrado.' });
    }
    
    const hash = await bcrypt.hash(senha, 10);
    
    // Inserir na tabela pessoa
    await client.query('INSERT INTO pessoa (cpf, nome, email, senha, tipo) VALUES ($1, $2, $3, $4, $5)', [cpf, nome, email, hash, 'cliente']);
    
    // Inserir na tabela Cliente (relacionamento)
    await client.query('INSERT INTO Cliente (PessoaCpfPessoa) VALUES ($1)', [cpf]);
    
    await client.query('COMMIT');
    res.json({ sucesso: true, mensagem: 'Cadastro realizado com sucesso!' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.log('Erro no cadastro:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao cadastrar.' });
  } finally {
    client.release();
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
    // usar cpf como identificador (tabela pessoa usa cpf como PK)
    await pool.query('UPDATE pessoa SET reset_token = $1, reset_token_expires = $2 WHERE cpf = $3', [token, expires, user.cpf]);

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
    // atualizar por cpf
    await pool.query('UPDATE pessoa SET senha = $1, reset_token = NULL, reset_token_expires = NULL WHERE cpf = $2', [hash, result.rows[0].cpf]);
    res.json({ sucesso: true, mensagem: 'Senha redefinida com sucesso!' });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao redefinir senha.' });
  }
};

// Logout - limpa o cookie de autenticação
exports.logout = (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  };
  res.clearCookie('token', cookieOptions);
  res.json({ sucesso: true, mensagem: 'Logout realizado com sucesso.' });
};

// Verifica se o usuário está autenticado (para o frontend verificar sessão)
exports.checkSession = (req, res) => {
  // Se chegou aqui, o middleware verifyToken já validou
  res.json({ 
    sucesso: true, 
    usuario: req.user,
    mensagem: 'Sessão válida.' 
  });
};
