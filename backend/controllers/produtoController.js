// Buscar produto por ID
exports.buscarProdutoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM produto WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Erro ao buscar produto' });
  }
};
// Editar produto existente
exports.editarProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, preco, imagem, estoque } = req.body;
    
    // Se a imagem mudou e é uma URL, baixar e salvar nova imagem
    let imagemLocal = imagem;
    if (imagem && (imagem.startsWith('http://') || imagem.startsWith('https://'))) {
      imagemLocal = await baixarESalvarImagem(imagem, id);
    }
    
    const result = await pool.query(
      'UPDATE produto SET nome = $1, descricao = $2, preco = $3, imagem = $4, estoque = $5 WHERE id = $6 RETURNING *',
      [nome, descricao, preco, imagemLocal, estoque, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Erro ao editar produto' });
  }
};

// Excluir produto
exports.excluirProduto = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar produto para obter caminho da imagem
    const produtoResult = await pool.query('SELECT imagem FROM produto WHERE id = $1', [id]);
    
    const result = await pool.query('DELETE FROM produto WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    // Remover arquivo de imagem se existir
    if (produtoResult.rows.length > 0 && produtoResult.rows[0].imagem) {
      const imagemPath = produtoResult.rows[0].imagem;
      if (imagemPath.startsWith('img/')) {
        const caminhoCompleto = path.join(__dirname, '../../frontend', imagemPath);
        try {
          if (fs.existsSync(caminhoCompleto)) {
            fs.unlinkSync(caminhoCompleto);
            console.log('Imagem removida:', caminhoCompleto);
          }
        } catch (error) {
          console.log('Erro ao remover imagem:', error.message);
        }
      }
    }
    
    res.json({ message: 'Produto excluído com sucesso' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Erro ao excluir produto' });
  }
};
const { pool } = require('../db');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Função para baixar e salvar imagem
async function baixarESalvarImagem(imageUrl, produtoId) {
  try {
    if (!imageUrl || imageUrl.trim() === '') {
      return '';
    }

    // Verificar se a URL é válida
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      return imageUrl; // Se não for URL, retorna como está
    }

    // Fazer download da imagem
    const response = await axios({
      method: 'GET',
      url: imageUrl,
      responseType: 'stream',
      timeout: 10000 // 10 segundos de timeout
    });

    // Obter extensão do arquivo a partir da URL ou Content-Type
    let extensao = '.jpg'; // padrão
    const contentType = response.headers['content-type'];
    if (contentType) {
      if (contentType.includes('png')) extensao = '.png';
      else if (contentType.includes('gif')) extensao = '.gif';
      else if (contentType.includes('webp')) extensao = '.webp';
      else if (contentType.includes('jpeg') || contentType.includes('jpg')) extensao = '.jpg';
    }

    // Definir caminho do arquivo
    const nomeArquivo = `produto_${produtoId}${extensao}`;
    const caminhoCompleto = path.join(__dirname, '../../frontend/img', nomeArquivo);

    // Criar diretório se não existir
    const diretorioImg = path.dirname(caminhoCompleto);
    if (!fs.existsSync(diretorioImg)) {
      fs.mkdirSync(diretorioImg, { recursive: true });
    }

    // Salvar arquivo
    const writer = fs.createWriteStream(caminhoCompleto);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        // Retornar caminho relativo para usar no frontend
        resolve(`img/${nomeArquivo}`);
      });
      writer.on('error', reject);
    });

  } catch (error) {
    console.log('Erro ao baixar imagem:', error.message);
    return imageUrl; // Se der erro, retorna a URL original
  }
}

// Cadastrar novo produto (com ID manual)
exports.cadastrarProduto = async (req, res) => {
  try {
    const { id, nome, descricao, preco, imagem, estoque } = req.body;
    
    // Baixar e salvar imagem se for uma URL
    const imagemLocal = await baixarESalvarImagem(imagem, id);
    
    const result = await pool.query(
      'INSERT INTO produto (id, nome, descricao, preco, imagem, estoque) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, nome, descricao, preco, imagemLocal, estoque]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Erro ao cadastrar produto' });
  }
};

// Listar todos os produtos
exports.listarProdutos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM produto');
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Erro ao listar produtos' });
  }
};

// Listar produtos públicos (sem autenticação) - para a loja
exports.listarProdutosPublicos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nome, descricao, preco, imagem, estoque as quantidade, 
             CASE 
               WHEN categoria IS NULL THEN 'Pelúcia' 
               ELSE categoria 
             END as categoria
      FROM produto 
      WHERE estoque > 0 
      ORDER BY nome
    `);
    
    res.json({
      sucesso: true,
      dados: result.rows,
      total: result.rows.length
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ 
      sucesso: false,
      mensagem: 'Erro ao listar produtos públicos' 
    });
  }
};
