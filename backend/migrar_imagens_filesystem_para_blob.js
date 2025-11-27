// migrar_imagens_filesystem_para_blob.js
// 
// Script para migrar imagens já existentes em arquivos para BLOB no banco
// 
// Uso: node migrar_imagens_filesystem_para_blob.js
//
// Este script:
// 1. Lista todos os arquivos em frontend/img/
// 2. Para cada arquivo "produto_*.jpg", lê como Buffer
// 3. Insere no banco na coluna imagem_binaria
// 4. (Opcional) Remove o arquivo após sucesso

const { pool } = require('./db');
const fs = require('fs');
const path = require('path');

async function migrarImagens() {
  try {
    console.log('🔄 Iniciando migração de imagens para BLOB...\n');

    const imgDir = path.join(__dirname, '../frontend/img');
    
    if (!fs.existsSync(imgDir)) {
      console.log('⚠️  Diretório frontend/img não encontrado. Nenhuma imagem para migrar.');
      await pool.end();
      return;
    }

    const arquivos = fs.readdirSync(imgDir).filter(f => f.startsWith('produto_'));
    console.log(`📦 Encontrados ${arquivos.length} arquivo(s) para migrar\n`);

    if (arquivos.length === 0) {
      console.log('✅ Nenhuma imagem encontrada. Migração concluída.');
      await pool.end();
      return;
    }

    let sucesso = 0;
    let erro = 0;

    for (const arquivo of arquivos) {
      try {
        // Extrair ID do produto do nome do arquivo
        // Formato: produto_1.jpg -> id = 1
        const match = arquivo.match(/produto_(\d+)/);
        if (!match) {
          console.log(`⏭️  Pulando ${arquivo} (formato inválido)`);
          continue;
        }

        const produtoId = parseInt(match[1]);
        const caminhoCompleto = path.join(imgDir, arquivo);
        
        // Ler arquivo como Buffer
        const buffer = fs.readFileSync(caminhoCompleto);
        
        // Determinar tipo MIME
        const ext = path.extname(arquivo).toLowerCase();
        let tipoMime = 'image/jpeg'; // padrão
        if (ext === '.png') tipoMime = 'image/png';
        else if (ext === '.gif') tipoMime = 'image/gif';
        else if (ext === '.webp') tipoMime = 'image/webp';
        
        // Atualizar registro no banco
        const result = await pool.query(
          'UPDATE produto SET imagem_binaria = $1, imagem_tipo = $2 WHERE id = $3 RETURNING id',
          [buffer, tipoMime, produtoId]
        );

        if (result.rowCount === 0) {
          console.log(`⚠️  ${arquivo}: Produto ID ${produtoId} não encontrado no banco`);
          erro++;
        } else {
          console.log(`✅ ${arquivo} -> Migrado para BLOB (ID: ${produtoId}, Tipo: ${tipoMime}, Tamanho: ${buffer.length} bytes)`);
          sucesso++;
        }

      } catch (err) {
        console.error(`❌ Erro ao processar ${arquivo}:`, err.message);
        erro++;
      }
    }

    console.log(`\n📊 Resultado: ${sucesso} sucesso(s), ${erro} erro(s)`);

    // Perguntar se deseja remover arquivos
    if (sucesso > 0) {
      console.log('\n💡 Dica: Você pode remover os arquivos de imagem após confirmar que tudo funciona:');
      console.log('   Windows: rd /s /q frontend\\img');
      console.log('   Linux/Mac: rm -rf frontend/img');
    }

  } catch (err) {
    console.error('❌ Erro durante migração:', err.message || err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrarImagens();
