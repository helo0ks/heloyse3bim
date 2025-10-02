// Teste do controller de pedidos
const pedidoController = require('./controllers/pedidoController');

console.log('Testando exports do pedidoController:');
console.log('listarPedidos:', typeof pedidoController.listarPedidos);
console.log('buscarPedidoPorId:', typeof pedidoController.buscarPedidoPorId);
console.log('cadastrarPedido:', typeof pedidoController.cadastrarPedido);
console.log('editarPedido:', typeof pedidoController.editarPedido);
console.log('excluirPedido:', typeof pedidoController.excluirPedido);
console.log('listarClientes:', typeof pedidoController.listarClientes);
console.log('listarFuncionarios:', typeof pedidoController.listarFuncionarios);
console.log('listarProdutosPedido:', typeof pedidoController.listarProdutosPedido);
console.log('listarFormasPagamento:', typeof pedidoController.listarFormasPagamento);

console.log('\n✅ Teste concluído!');