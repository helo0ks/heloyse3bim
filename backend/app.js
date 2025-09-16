const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const produtoRoutes = require('./routes/produto');
const pessoaRoutes = require('./routes/pessoa');


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());


app.use('/auth', authRoutes);
app.use('/produtos', produtoRoutes);
app.use('/pessoas', pessoaRoutes);

app.get('/', (req, res) => {
  res.send('API Loja de Pelúcias Snoopy rodando!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
