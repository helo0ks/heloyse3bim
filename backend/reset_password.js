// reset_password.js
// Usage: node reset_password.js --email user@example.com --password newpass
// Updates the `senha` field for the user with the provided email (hashes with bcrypt).
const { pool } = require('./db');
const bcrypt = require('bcrypt');

function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach((a, i, arr) => {
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true;
      args[key] = val;
    }
  });
  return args;
}

(async function main(){
  const args = parseArgs();
  const email = args.email;
  const password = args.password;

  if (!email || !password) {
    console.error('Uso: node reset_password.js --email user@example.com --password newpass');
    process.exit(1);
  }

  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    const res = await pool.query('UPDATE pessoa SET senha = $1 WHERE email = $2 RETURNING id, nome, email', [hash, email]);
    if (res.rowCount === 0) {
      console.error('Nenhum usuário encontrado com o email informado.');
      process.exitCode = 2;
    } else {
      console.log('Senha atualizada com sucesso para:');
      console.log(res.rows[0]);
    }
  } catch (err) {
    console.error('Erro ao atualizar senha:', err.message || err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
