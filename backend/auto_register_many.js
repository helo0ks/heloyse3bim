const http = require('http');

function generateCpf(seed) {
  const t = (Date.now() + seed).toString();
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
  const count = parseInt(process.argv[2], 10) || 10;
  console.log(`Registrando ${count} usuários de teste...`);
  const results = [];
  for (let i = 0; i < count; i++) {
    const seed = i + Math.floor(Math.random()*1000);
    const cpf = generateCpf(seed);
    const timestamp = Date.now() + i;
    const email = `autotest+${timestamp}+${i}@example.com`;
    const senha = 'TestPass123!';
    const nome = `Auto Test User ${timestamp}-${i}`;
    try {
      const reg = await postJson('/auth/register', { cpf, nome, email, senha });
      results.push({ i, cpf, email, status: reg.status, body: reg.body });
      // small delay
      await new Promise(r => setTimeout(r, 150));
    } catch (err) {
      results.push({ i, cpf, email, error: String(err) });
    }
  }
  console.log('\nResumo:');
  results.forEach(r => {
    if(r.error) console.log(`#${r.i} ${r.email} -> ERRO: ${r.error}`);
    else console.log(`#${r.i} ${r.email} -> ${r.status} ${JSON.stringify(r.body)} `);
  });
})();
