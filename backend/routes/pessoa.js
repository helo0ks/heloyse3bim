const express = require('express');
const router = express.Router();
const pessoaController = require('../controllers/pessoaController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Todas as rotas protegidas para admin
router.get('/', verifyToken, isAdmin, pessoaController.listarPessoas);
router.get('/:cpf', verifyToken, isAdmin, pessoaController.buscarPessoa);
router.post('/', verifyToken, isAdmin, pessoaController.cadastrarPessoa);
router.put('/:cpf', verifyToken, isAdmin, pessoaController.atualizarPessoa);
router.delete('/:cpf', verifyToken, isAdmin, pessoaController.deletarPessoa);

module.exports = router;
