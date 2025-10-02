const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const produtoRoutes = require('./routes/produto');
const pessoaRoutes = require('./routes/pessoa');
const cargoRoutes = require('./routes/cargoRoutes');
const pedidoRoutes = require('./routes/pedido');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Servir arquivos estáticos da pasta img
app.use('/img', express.static('../frontend/img'));

app.use('/auth', authRoutes);
app.use('/produtos', produtoRoutes);  
app.use('/pessoas', pessoaRoutes);
app.use('/cargo', cargoRoutes);
app.use('/pedidos', pedidoRoutes);

app.get('/', (req, res) => {
  res.send('API Loja de Pelúcias Snoopy rodando!');
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});
