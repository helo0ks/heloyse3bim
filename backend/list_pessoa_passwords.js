// list_pessoa_passwords.js
// Lista cpf, nome, email e senha (hash) da tabela `pessoa`.
const { pool } = require('./db');

(async function listPasswords() {
  try {
    const res = await pool.query("SELECT cpf, nome, email, senha, tipo FROM pessoa ORDER BY cpf");
    if (!res.rows.length) {
      console.log('Nenhum registro encontrado na tabela pessoa.');
      return;
    }

    console.log('\nUsuários cadastrados:\n');
    res.rows.forEach(r => {
      console.log(`CPF: ${r.cpf}`);
      console.log(`Nome: ${r.nome}`);
      console.log(`Email: ${r.email}`);
      console.log(`Tipo: ${r.tipo || 'cliente'}`);
      console.log(`Senha (hash): ${r.senha}`);
      console.log('---');
    });
  } catch (err) {
    console.error('Erro ao consultar a tabela pessoa:', err.message || err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
