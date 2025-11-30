// Middleware para verificar JWT e manter usuário logado
const jwt = require('jsonwebtoken');

// Opções de cookie para limpar
const clearCookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/'
};

exports.verifyToken = (req, res, next) => {
  // Prioriza cookie, depois header Authorization
  let token = req.cookies?.token;
  
  // Se não tiver no cookie, tenta no header
  if (!token && req.headers['authorization']) {
    token = req.headers['authorization'].replace('Bearer ', '');
  }
  
  if (!token) {
    return res.status(401).json({ 
      sucesso: false, 
      mensagem: 'Token não fornecido. Faça login novamente.',
      code: 'NO_TOKEN'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'segredo');
    req.user = decoded;
    next();
  } catch (err) {
    // Se o cookie existe mas é inválido, limpa o cookie
    if (req.cookies?.token) {
      res.clearCookie('token', clearCookieOptions);
    }
    
    // Diferentes tipos de erro JWT
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        sucesso: false, 
        mensagem: 'Sessão expirada. Faça login novamente.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(401).json({ 
      sucesso: false, 
      mensagem: 'Token inválido. Faça login novamente.',
      code: 'INVALID_TOKEN'
    });
  }
};

// Middleware para verificar se o usuário é admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.tipo === 'admin') {
    next();
  } else {
    return res.status(403).json({ sucesso: false, mensagem: 'Acesso restrito a administradores.' });
  }
};
