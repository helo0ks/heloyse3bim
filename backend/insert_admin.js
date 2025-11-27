// insert_admin.js
// Insere um novo usuário admin com dados fornecidos
// Usage: node insert_admin.js --nome "teste" --email "teste4@email.com" --password "teste4" [--cpf "XXX.XXX.XXX-XX"]
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

function generateRandomCPF() {
  const pad = (n) => String(n).padStart(2, '0');
  const rand = () => Math.floor(Math.random() * 100);
  return `${pad(rand())}.${pad(rand())}.${pad(rand())}-${pad(rand() % 100)}`;
}

(async function main() {
  const args = parseArgs();
  const nome = args.nome || 'teste';
  const email = args.email || 'teste4@email.com';
  const password = args.password || 'teste4';
  const cpf = args.cpf || generateRandomCPF();

  console.log(`\nInserindo novo usuário admin:`);
  console.log(`  Nome: ${nome}`);
  console.log(`  Email: ${email}`);
  console.log(`  CPF: ${cpf}`);
  console.log(`  Tipo: admin`);
  console.log(`  Senha: ${password}\n`);

  try {
    // Verificar se email já existe
    const checkEmail = await pool.query('SELECT cpf FROM pessoa WHERE email = $1', [email]);
    if (checkEmail.rows.length > 0) {
      console.error(`❌ Email ${email} já está registrado.`);
      process.exitCode = 2;
      await pool.end();
      return;
    }

    // Verificar se CPF já existe
    const checkCPF = await pool.query('SELECT cpf FROM pessoa WHERE cpf = $1', [cpf]);
    if (checkCPF.rows.length > 0) {
      console.error(`❌ CPF ${cpf} já está registrado.`);
      process.exitCode = 2;
      await pool.end();
      return;
    }

    // Hash da senha
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    // Insert
    const res = await pool.query(
      'INSERT INTO pessoa (cpf, nome, email, senha, tipo) VALUES ($1, $2, $3, $4, $5) RETURNING cpf, nome, email, tipo',
      [cpf, nome, email, hash, 'admin']
    );

    console.log('✅ Usuário admin inserido com sucesso:');
    console.log(`  CPF: ${res.rows[0].cpf}`);
    console.log(`  Nome: ${res.rows[0].nome}`);
    console.log(`  Email: ${res.rows[0].email}`);
    console.log(`  Tipo: ${res.rows[0].tipo}\n`);
  } catch (err) {
    console.error('❌ Erro ao inserir usuário:', err.message || err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
