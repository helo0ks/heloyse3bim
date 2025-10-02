const { pool } = require('./db');

async function migrarClientes() {
  const client = await pool.connect();
  
  try {
    console.log('Iniciando migração de clientes...');
    
    // Buscar todas as pessoas com tipo 'cliente' que não estão na tabela Cliente
    const clientesSemRegistro = await client.query(`
      SELECT p.cpf, p.nome, p.email 
      FROM pessoa p 
      LEFT JOIN Cliente c ON p.cpf = c.PessoaCpfPessoa 
      WHERE p.tipo = 'cliente' AND c.PessoaCpfPessoa IS NULL
    `);
    
    if (clientesSemRegistro.rows.length === 0) {
      console.log('Todos os clientes já estão registrados na tabela Cliente.');
      return;
    }
    
    console.log(`Encontrados ${clientesSemRegistro.rows.length} clientes para migrar...`);
    
    await client.query('BEGIN');
    
    // Inserir cada cliente na tabela Cliente
    for (const cliente of clientesSemRegistro.rows) {
      await client.query('INSERT INTO Cliente (PessoaCpfPessoa) VALUES ($1)', [cliente.cpf]);
      console.log(`Cliente migrado: ${cliente.nome} (CPF: ${cliente.cpf})`);
    }
    
    await client.query('COMMIT');
    console.log('Migração concluída com sucesso!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro durante a migração:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

migrarClientes();