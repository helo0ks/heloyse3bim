// Script para testar o download de imagens
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function testarDownloadImagem() {
  try {
    console.log('Testando download de imagem...');
    
    // URL de uma imagem de teste do Snoopy
    const imageUrl = 'https://upload.wikimedia.org/wikipedia/en/5/53/Snoopy_Peanuts.png';
    
    const response = await axios({
      method: 'GET',
      url: imageUrl,
      responseType: 'stream',
      timeout: 10000
    });
    
    const nomeArquivo = 'teste_produto_999.png';
    const caminhoCompleto = path.join(__dirname, '../frontend/img', nomeArquivo);
    
    // Criar diretório se não existir
    const diretorioImg = path.dirname(caminhoCompleto);
    if (!fs.existsSync(diretorioImg)) {
      fs.mkdirSync(diretorioImg, { recursive: true });
    }
    
    const writer = fs.createWriteStream(caminhoCompleto);
    response.data.pipe(writer);
    
    writer.on('finish', () => {
      console.log('✅ Imagem baixada com sucesso!');
      console.log('📁 Salva em:', caminhoCompleto);
      console.log('🌐 Acessível em: http://localhost:3001/img/' + nomeArquivo);
    });
    
    writer.on('error', (error) => {
      console.log('❌ Erro ao salvar imagem:', error.message);
    });
    
  } catch (error) {
    console.log('❌ Erro ao baixar imagem:', error.message);
  }
}

// Executar teste
testarDownloadImagem();