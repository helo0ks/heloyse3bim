const express = require('express');
const router = express.Router();

const produtoController = require('../controllers/produtoController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');


// Todas as rotas de produto protegidas para admin

// CRUD Produtos

router.post('/', verifyToken, isAdmin, produtoController.cadastrarProduto);
router.get('/', verifyToken, isAdmin, produtoController.listarProdutos);
router.get('/:id', verifyToken, isAdmin, produtoController.buscarProdutoPorId);
router.put('/:id', verifyToken, isAdmin, produtoController.editarProduto);
router.delete('/:id', verifyToken, isAdmin, produtoController.excluirProduto);

module.exports = router;
