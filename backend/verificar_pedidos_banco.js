const { pool } = require('./db');

async function verificarPedidos() {
  try {
    console.log('=== VERIFICANDO PEDIDOS NO BANCO ===\n');
    
    // Contar total de pedidos
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM Pedido');
    console.log(`Total de pedidos no banco: ${totalResult.rows[0].total}`);
    
    // Listar últimos 5 pedidos
    const pedidosResult = await pool.query(`
      SELECT 
        p.idPedido,
        p.dataDoPedido,
        p.ClientePessoaCpfPessoa,
        cliente.nome as nomeCliente,
        p.FuncionarioPessoaCpfPessoa,
        funcionario.nome as nomeFuncionario,
        COALESCE(pag.valorTotalPagamento, 0) as valorTotal,
        pag.dataPagamento
      FROM Pedido p
      LEFT JOIN Cliente c ON p.ClientePessoaCpfPessoa = c.PessoaCpfPessoa
      LEFT JOIN pessoa cliente ON c.PessoaCpfPessoa = cliente.cpf
      LEFT JOIN Funcionario f ON p.FuncionarioPessoaCpfPessoa = f.PessoaCpfPessoa
      LEFT JOIN pessoa funcionario ON f.PessoaCpfPessoa = funcionario.cpf
      LEFT JOIN Pagamento pag ON p.idPedido = pag.PedidoIdPedido
      ORDER BY p.dataDoPedido DESC, p.idPedido DESC
      LIMIT 5
    `);
    
    console.log('\n=== ÚLTIMOS 5 PEDIDOS ===');
    pedidosResult.rows.forEach((pedido, index) => {
      console.log(`${index + 1}. Pedido #${pedido.idpedido}`);
      console.log(`   Data: ${pedido.datadopedido}`);
      console.log(`   Cliente: ${pedido.nomecliente} (${pedido.clientepessoacpfpessoa})`);
      console.log(`   Funcionário: ${pedido.nomefuncionario} (${pedido.funcionariopessoacpfpessoa})`);
      console.log(`   Valor: R$ ${pedido.valortotal}`);
      console.log(`   Data Pagamento: ${pedido.datapagamento || 'Não pago'}`);
      console.log('   ---');
    });
    
    // Verificar produtos dos pedidos
    const produtosPedidoResult = await pool.query(`
      SELECT 
        php.PedidoIdPedido,
        p.nome as nomeProduto,
        php.quantidade,
        php.precoUnitario
      FROM PedidoHasProduto php
      JOIN produto p ON php.ProdutoIdProduto = p.id
      ORDER BY php.PedidoIdPedido DESC
      LIMIT 10
    `);
    
    console.log('\n=== PRODUTOS DOS ÚLTIMOS PEDIDOS ===');
    produtosPedidoResult.rows.forEach((item) => {
      console.log(`Pedido #${item.pedidoidpedido}: ${item.nomeproduto} - Qtd: ${item.quantidade} - Preço: R$ ${item.precounitario}`);
    });
    
    // Verificar pagamentos
    const pagamentosResult = await pool.query(`
      SELECT 
        pag.idPagamento,
        pag.PedidoIdPedido,
        pag.valorTotalPagamento,
        pag.dataPagamento,
        fp.nomeFormaPagamento,
        phfp.valorPago
      FROM Pagamento pag
      LEFT JOIN PagamentoHasFormaPagamento phfp ON pag.idPagamento = phfp.PagamentoIdPedido
      LEFT JOIN FormaDePagamento fp ON phfp.FormaPagamentoIdFormaPagamento = fp.idFormaPagamento
      ORDER BY pag.dataPagamento DESC
      LIMIT 5
    `);
    
    console.log('\n=== ÚLTIMOS PAGAMENTOS ===');
    pagamentosResult.rows.forEach((pag, index) => {
      console.log(`${index + 1}. Pagamento #${pag.idpagamento} - Pedido #${pag.pedidoidpedido}`);
      console.log(`   Valor: R$ ${pag.valortotalpagamento}`);
      console.log(`   Data: ${pag.datapagamento}`);
      console.log(`   Forma: ${pag.nomeformapagamento || 'Não informado'}`);
      console.log(`   Valor Pago: R$ ${pag.valorpago || 0}`);
      console.log('   ---');
    });
    
  } catch (error) {
    console.error('Erro ao verificar pedidos:', error);
  } finally {
    process.exit(0);
  }
}

verificarPedidos();