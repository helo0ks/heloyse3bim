const http = require('http');

const user = {
  nome: 'Teste Usuário',
  cpf: '777.777.777-00',
  email: 'teste.usuario@example.com',
  senha: 'minhasenha123'
};

const data = JSON.stringify(user);

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  console.log('Status:', res.statusCode);
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    try{
      console.log('Body:', JSON.parse(body));
    }catch(e){
      console.log('Body raw:', body);
    }
  });
});

req.on('error', (err) => console.error('Request error', err));
req.write(data);
req.end();
