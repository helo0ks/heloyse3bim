const jwt = require('jsonwebtoken');

async function testarListarPedidos() {
  try {
    // Gerar token JWT para o teste (admin)
    const token = jwt.sign({ cpf: '11111111111', email: 'admin@email.com', tipo: 'admin' }, 'segredo', { expiresIn: '2h' });
    
    console.log('Testando endpoint de listar pedidos...');
    
    // Fazer requisição para o endpoint
    const response = await fetch('http://localhost:3001/pedidos', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    });
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Quantidade de pedidos retornados:', result.length);
      
      if (result.length > 0) {
        console.log('\n=== PRIMEIRO PEDIDO RETORNADO ===');
        console.log(JSON.stringify(result[0], null, 2));
      }
    } else {
      const error = await response.text();
      console.log('❌ Erro:', error);
    }
    
  } catch (error) {
    console.error('Erro no teste:', error);
  } finally {
    process.exit(0);
  }
}

testarListarPedidos();