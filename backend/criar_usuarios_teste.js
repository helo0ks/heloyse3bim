const { Pool } = require('pg');

// Configuração do banco (cópia do db.js)
const pool = new Pool({
  user: 'postgres',
  host: 'localhost', 
  database: 'snoopy',
  password: 'batatabb2008',
  port: 5432,
});
const bcrypt = require('bcrypt');

async function criarUsuarioTeste() {
  try {
    console.log('Criando usuário de teste...');
    
    const usuarios = [
      {
        nome: 'Admin Teste',
        email: 'admin@teste.com',
        senha: '123456',
        cpf: '11111111111',
        tipo: 'admin'
      },
      {
        nome: 'Cliente Teste',
        email: 'cliente@teste.com',
        senha: '123456',
        cpf: '22222222222',
        tipo: 'cliente'
      }
    ];
    
    for (const usuario of usuarios) {
      // Verificar se o usuário já existe
      const existeQuery = await pool.query('SELECT cpf FROM pessoa WHERE email = $1', [usuario.email]);
      
      if (existeQuery.rows.length > 0) {
        console.log(`⚠️  Usuário ${usuario.email} já existe`);
        continue;
      }
      
      // Hash da senha
      const senhaHash = await bcrypt.hash(usuario.senha, 10);
      
      // Inserir usuário
      const result = await pool.query(`
        INSERT INTO pessoa (cpf, nome, email, senha, tipo)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING cpf, nome, email, tipo
      `, [usuario.cpf, usuario.nome, usuario.email, senhaHash, usuario.tipo]);
      
      console.log(`✓ Usuário criado: ${result.rows[0].nome} (${result.rows[0].email}) - Tipo: ${result.rows[0].tipo} - CPF: ${result.rows[0].cpf}`);
    }
    
    console.log('\n🎉 Usuários de teste criados com sucesso!');
    console.log('\n📝 Credenciais de teste:');
    console.log('Admin: admin@teste.com / 123456');
    console.log('Cliente: cliente@teste.com / 123456');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuários:', error);
  } finally {
    await pool.end();
  }
}

criarUsuarioTeste();