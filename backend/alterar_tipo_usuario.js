const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'snoopy',
  password: 'batatabb2008',
  port: 5432,
});

async function alterarTipoUsuario() {
  try {
    console.log('👥 Listando usuários disponíveis...');
    
    // Primeiro, mostrar todos os usuários
    const usuarios = await pool.query('SELECT cpf, nome, email, tipo FROM pessoa ORDER BY nome');
    
    console.log('📋 Usuários cadastrados:');
    usuarios.rows.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.nome} (${user.cpf}) - ${user.email} - Tipo: ${user.tipo}`);
    });
    
    console.log('\n🔧 Exemplo de comandos para alterar tipo de usuário:');
    console.log('');
    
    // Mostrar exemplos para cada usuário cliente
    const clientes = usuarios.rows.filter(user => user.tipo === 'cliente');
    
    if (clientes.length > 0) {
      console.log('💡 Para transformar CLIENTE em ADMIN:');
      clientes.forEach(cliente => {
        console.log(`   UPDATE pessoa SET tipo = 'admin' WHERE cpf = '${cliente.cpf}'; -- ${cliente.nome}`);
      });
    }
    
    const admins = usuarios.rows.filter(user => user.tipo === 'admin');
    
    if (admins.length > 0) {
      console.log('\n💡 Para transformar ADMIN em CLIENTE:');
      admins.forEach(admin => {
        console.log(`   UPDATE pessoa SET tipo = 'cliente' WHERE cpf = '${admin.cpf}'; -- ${admin.nome}`);
      });
    }
    
    console.log('\n📝 Como usar:');
    console.log('   1. Copie um dos comandos acima');
    console.log('   2. Execute no seu cliente PostgreSQL (pgAdmin, psql, etc.)');
    console.log('   3. Ou modifique este script para executar automaticamente');
    
    await pool.end();
  } catch (err) {
    console.error('❌ Erro:', err);
    await pool.end();
  }
}

alterarTipoUsuario();