// Middleware para verificar se o usuário é admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.tipo === 'admin') {
    next();
  } else {
    return res.status(403).json({ sucesso: false, mensagem: 'Acesso restrito a administradores.' });
  }
};
// Middleware para verificar JWT e manter usuário logado
const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ sucesso: false, mensagem: 'Token não fornecido.' });
  }
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'segredo');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ sucesso: false, mensagem: 'Token inválido.' });
  }
};
