const multer = require('multer');

// Usamos armazenamento em memória: recebemos o Buffer diretamente
const storage = multer.memoryStorage();

// Aceitar apenas imagens comuns e limitar tamanho (por exemplo, 10MB)
const fileFilter = (req, file, cb) => {
  if (/^image\/(jpeg|png|gif|webp)$/.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo inválido. Envie uma imagem jpeg/png/gif/webp.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = { upload };
