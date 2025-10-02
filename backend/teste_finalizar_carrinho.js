const { pool } = require('./db');
const jwt = require('jsonwebtoken');

async function testarFinalizarCarrinho() {
  try {
    // Buscar um usuário cliente para teste
    const clienteResult = await pool.query(`
      SELECT p.cpf, p.nome, p.email 
      FROM pessoa p 
      JOIN Cliente c ON p.cpf = c.PessoaCpfPessoa 
      WHERE p.tipo = 'cliente' 
      LIMIT 1
    `);
    
    if (clienteResult.rows.length === 0) {
      console.log('Nenhum cliente encontrado no banco');
      return;
    }
    
    const cliente = clienteResult.rows[0];
    console.log('Cliente encontrado:', cliente);
    
    // Buscar um produto para teste
    const produtoResult = await pool.query('SELECT id, nome, preco FROM produto WHERE estoque > 0 LIMIT 1');
    
    if (produtoResult.rows.length === 0) {
      console.log('Nenhum produto com estoque encontrado');
      return;
    }
    
    const produto = produtoResult.rows[0];
    console.log('Produto encontrado:', produto);
    
    // Buscar uma forma de pagamento
    const formaPagamentoResult = await pool.query('SELECT idFormaPagamento FROM FormaDePagamento LIMIT 1');
    
    if (formaPagamentoResult.rows.length === 0) {
      console.log('Nenhuma forma de pagamento encontrada');
      return;
    }
    
    const formaPagamento = formaPagamentoResult.rows[0].idformapagamento;
    console.log('Forma de pagamento ID:', formaPagamento);
    
    // Gerar token JWT para o teste
    const token = jwt.sign({ cpf: cliente.cpf, email: cliente.email, tipo: 'cliente' }, 'segredo', { expiresIn: '2h' });
    
    // Dados para o teste
    const dadosTeste = {
      clienteCpf: cliente.cpf,
      itensCarrinho: [{
        id: produto.id,
        nome: produto.nome,
        preco: parseFloat(produto.preco),
        quantidade: 1
      }],
      formaPagamento: formaPagamento,
      valorTotal: parseFloat(produto.preco)
    };
    
    console.log('Dados do teste:', JSON.stringify(dadosTeste, null, 2));
    
    // Fazer requisição para o endpoint
    const response = await fetch('http://localhost:3001/pedidos/finalizar-carrinho', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(dadosTeste)
    });
    
    const result = await response.text();
    console.log('Status:', response.status);
    console.log('Resposta:', result);
    
    if (response.ok) {
      console.log('✅ Teste de finalização do carrinho executado com sucesso!');
    } else {
      console.log('❌ Erro no teste:', result);
    }
    
  } catch (error) {
    console.error('Erro no teste:', error);
  } finally {
    process.exit(0);
  }
}

testarFinalizarCarrinho();