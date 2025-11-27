const http = require('http');

function generateCpf() {
  const t = Date.now().toString();
  // usar 11 dígitos a partir do timestamp para formar CPF
  const digits = (t + '00000000000').slice(0, 11);
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function postJson(path, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: process.env.PORT || 3001,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = http.request(options, (res) => {
      let resp = '';
      res.on('data', (chunk) => resp += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(resp || '{}');
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: resp });
        }
      });
    });
    req.on('error', (err) => reject(err));
    req.write(body);
    req.end();
  });
}

(async ()=>{
  const cpf = generateCpf();
  const timestamp = Date.now();
  const email = `autotest+${timestamp}@example.com`;
  const senha = 'TestPass123!';
  const nome = 'Auto Test User';
  console.log('Tentando registrar usuário:');
  console.log({ cpf, nome, email });

  try {
    const reg = await postJson('/auth/register', { cpf, nome, email, senha });
    console.log('Registro status:', reg.status);
    console.log('Registro body:', reg.body);

    if (reg.status === 200 || (reg.body && reg.body.sucesso)) {
      console.log('\nTentando login com as mesmas credenciais...');
      const log = await postJson('/auth/login', { email, senha });
      console.log('Login status:', log.status);
      console.log('Login body:', log.body);
    } else {
      console.log('\nRegistro não realizado — tentando login de qualquer forma (caso já exista)...');
      const log = await postJson('/auth/login', { email, senha });
      console.log('Login status:', log.status);
      console.log('Login body:', log.body);
    }
  } catch (err) {
    console.error('Erro nos requests:', err);
  }
})();
