const express = require('express');
const router = express.Router();

const relatoriosController = require('../controllers/relatoriosController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Rotas de relatórios (apenas admin)
router.get('/vendas', verifyToken, isAdmin, relatoriosController.relatorioVendas);
router.get('/vendas/periodo', verifyToken, isAdmin, relatoriosController.relatorioVendasPeriodo);
router.get('/clientes', verifyToken, isAdmin, relatoriosController.relatorioClientes);

module.exports = router;
