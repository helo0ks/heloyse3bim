const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'snoopy',
  password: 'batatabb2008',
  port: 5432,
});

async function verificarUsuarios() {
  try {
    console.log('👥 Verificando usuários cadastrados...');
    
    const result = await pool.query('SELECT cpf, nome, email, tipo FROM pessoa ORDER BY cpf');
    
    console.log(`📊 Total de usuários: ${result.rows.length}`);
    console.log('📋 Lista de usuários:');
    result.rows.forEach((user, index) => {
      console.log(`   ${index + 1}. CPF: ${user.cpf} | Nome: ${user.nome} | Email: ${user.email} | Tipo: ${user.tipo}`);
    });
    
    await pool.end();
  } catch (err) {
    console.error('❌ Erro ao verificar usuários:', err);
    await pool.end();
  }
}

verificarUsuarios();