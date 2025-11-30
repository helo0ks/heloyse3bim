// Teste automatizado: substituição de imagem via API admin
// Requer Node 18+ (fetch/Blob/FormData nativos)
// Uso:
//   set TOKEN=SEU_JWT_ADMIN && node scripts/testar_substituicao_imagem.js 1 "C:\\path\\img1.jpg" "C:\\path\\img2.png"

const fs = require('fs');

async function main() {
  const token = process.env.TOKEN;
  const [idArg, img1Path, img2Path] = process.argv.slice(2);
  if (!token) {
    console.error('Erro: defina a variável de ambiente TOKEN com um JWT de admin');
    process.exit(1);
  }
  if (!idArg || !img1Path || !img2Path) {
    console.error('Uso: node scripts/testar_substituicao_imagem.js <id> <img1Path> <img2Path>');
    process.exit(1);
  }
  const id = Number(idArg);

  const putImagem = async (id, imgPath, mime) => {
    const bytes = fs.readFileSync(imgPath);
    const blob = new Blob([bytes], { type: mime });
    const fd = new FormData();
    fd.append('nome', 'Nome teste');
    fd.append('descricao', 'Desc teste');
    fd.append('preco', '99.90');
    fd.append('estoque', '10');
    fd.append('imagemArquivo', blob, imgPath.split('\\').pop());

    const resp = await fetch(`http://localhost:3001/admin-api/produtos/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    console.log(`PUT ${imgPath} -> ${resp.status} ${resp.statusText}`);
    const text = await resp.text();
    console.log('Resposta:', text);
  };

  const mime1 = img1Path.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
  const mime2 = img2Path.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

  await putImagem(id, img1Path, mime1);
  await putImagem(id, img2Path, mime2);

  console.log(`Abra no navegador para validar: http://localhost:3001/admin-api/produtos/${id}/imagem`);
}

main().catch(err => { console.error(err); process.exit(1); });
