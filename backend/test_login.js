const http = require('http');

const data = JSON.stringify({ email: 'admin@snoopy.com', senha: '123456' });

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/auth/login',
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
