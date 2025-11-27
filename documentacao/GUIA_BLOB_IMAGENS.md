// =====================================================
// INSTRUÇÕES: Migração para Armazenamento de Imagens em BLOB
// =====================================================
//
// Data: 27 de Novembro de 2025
// Versão: 2.0 - Banco de Dados
//
// =====================================================
// PASSO 1: EXECUTAR MIGRAÇÃO SQL
// =====================================================
//
// 1. Abra pgAdmin ou psql
// 2. Conecte ao banco de dados 'snoopy'
// 3. Execute o arquivo: documentacao/migrar_para_blob.sql
//
// Comando (via terminal):
// psql -U postgres -d snoopy -f documentacao/migrar_para_blob.sql
//
// =====================================================
// PASSO 2: VERIFICAR ESTRUTURA ATUALIZADA
// =====================================================
//
// Após executar a migração, verifique se as colunas foram criadas:
//
// \d produto
//
// Você deve ver:
//   - imagem_binaria | bytea
//   - imagem_tipo    | character varying(50)
//
// =====================================================
// PASSO 3: REMOVER ARQUIVOS ANTIGOS (OPCIONAL)
// =====================================================
//
// Após confirmar que as imagens estão no banco, você pode deletar
// os arquivos físicos em: frontend/img/
//
// Comando Windows:
// rd /s /q frontend\img
//
// Comando Linux/Mac:
// rm -rf frontend/img
//
// =====================================================
// PASSO 4: REINICIAR O SERVIDOR
// =====================================================
//
// Parar e iniciar o backend:
//
// npm start
//
// =====================================================
// COMO USAR A NOVA API
// =====================================================
//
// ✅ CADASTRAR NOVO PRODUTO COM IMAGEM
// -----------
// POST /admin-api/produtos
// Authorization: Bearer {token}
//
// Body (JSON):
// {
//   "id": 123,
//   "nome": "Pelúcia Snoopy",
//   "descricao": "Pelúcia macia do Snoopy",
//   "preco": 99.90,
//   "estoque": 50,
//   "imagem": "https://example.com/snoopy.jpg"  // URL da imagem
// }
//
// Response:
// {
//   "id": 123,
//   "nome": "Pelúcia Snoopy",
//   "descricao": "Pelúcia macia do Snoopy",
//   "preco": 99.90,
//   "estoque": 50,
//   "imagem_tipo": "image/jpeg"  // Tipo MIME detectado
// }
//
// ✅ BUSCAR IMAGEM PARA EXIBIR
// --------
// GET /admin-api/produtos/{id}/imagem
// (Sem autenticação - pública)
//
// Response: Binário da imagem com header Content-Type correto
//
// Uso no HTML:
// <img src="/admin-api/produtos/123/imagem" alt="Produto 123">
//
// ✅ LISTAR PRODUTOS PÚBLICOS (COM URLS DE IMAGEM)
// -----
// GET /produtos/publicos
//
// Response:
// {
//   "sucesso": true,
//   "dados": [
//     {
//       "id": 1,
//       "nome": "Pelúcia",
//       "descricao": "...",
//       "preco": 99.90,
//       "quantidade": 10,
//       "imagem": "/admin-api/produtos/1/imagem",  // URL para buscar imagem
//       "categoria": "Pelúcia"
//     }
//   ],
//   "total": 1
// }
//
// ✅ EDITAR PRODUTO (COM NOVA IMAGEM)
// ---------
// PUT /admin-api/produtos/{id}
// Authorization: Bearer {token}
//
// Body (JSON):
// {
//   "nome": "Pelúcia Snoopy 2",
//   "descricao": "Nova descrição",
//   "preco": 149.90,
//   "estoque": 100,
//   "imagem": "https://example.com/nova-imagem.png"
// }
//
// Nota: Se não enviar "imagem", a anterior será mantida.
//
// ✅ EDITAR PRODUTO (SEM MUDAR IMAGEM)
// --------
// PUT /admin-api/produtos/{id}
// Authorization: Bearer {token}
//
// Body (JSON):
// {
//   "nome": "Novo Nome",
//   "descricao": "Nova descrição",
//   "preco": 149.90,
//   "estoque": 100
//   // Não incluir "imagem" para manter a existente
// }
//
// ✅ DELETAR PRODUTO (E SUA IMAGEM)
// ---------
// DELETE /admin-api/produtos/{id}
// Authorization: Bearer {token}
//
// Response:
// { "message": "Produto excluído com sucesso" }
//
// Nota: A imagem é deletada automaticamente do banco ao excluir o produto.
//
// =====================================================
// MUDANÇAS RESUMIDAS
// =====================================================
//
// ❌ ANTES (Sistema de Arquivos):
//    - Imagens: frontend/img/produto_{id}.jpg
//    - Nomes: "produto_1.jpg", "produto_2.jpg", etc
//    - Problema: espaço em disco, sincronização, múltiplos servidores
//
// ✅ AGORA (BLOB no Banco):
//    - Imagens: Coluna "imagem_binaria" (BYTEA)
//    - Tipo MIME: Coluna "imagem_tipo" (VARCHAR)
//    - Benefícios: backup automático, escalabilidade, transações
//
// =====================================================
// EXEMPLO PRÁTICO COMPLETO (JavaScript Frontend)
// =====================================================
//
// // 1. Buscar e exibir produtos
// async function carregarProdutos() {
//   const response = await fetch('http://localhost:3001/produtos/publicos');
//   const { dados } = await response.json();
//   
//   dados.forEach(produto => {
//     const img = document.createElement('img');
//     img.src = `http://localhost:3001${produto.imagem}`;  // URL da imagem no servidor
//     img.alt = produto.nome;
//     document.body.appendChild(img);
//   });
// }
//
// // 2. Adicionar novo produto (admin)
// async function adicionarProduto(dados) {
//   const token = localStorage.getItem('token');
//   
//   const response = await fetch('http://localhost:3001/admin-api/produtos', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${token}`
//     },
//     body: JSON.stringify({
//       id: 999,
//       nome: dados.nome,
//       descricao: dados.descricao,
//       preco: dados.preco,
//       estoque: dados.estoque,
//       imagem: dados.urlImagem  // URL da imagem
//     })
//   });
//
//   const produto = await response.json();
//   console.log('Produto criado:', produto);
// }
//
// =====================================================
// DÚVIDAS FREQUENTES
// =====================================================
//
// P: Como migro imagens que já estão em arquivos para BLOB?
// R: Execute o script backend/migrar_imagens_filesystem_para_blob.js (será criado)
//
// P: A qualidade das imagens será reduzida?
// R: Não. BYTEA no PostgreSQL armazena dados binários exatamente como estão.
//
// P: Qual é o tamanho máximo de imagem?
// R: PostgreSQL suporta até ~1GB por coluna. Recomenda-se limite de 10-50MB por imagem.
//
// P: Posso continuar usando URLs de imagem?
// R: Não. A coluna "imagem" (VARCHAR) foi removida. Use "imagem_binaria" (BYTEA).
//
// P: O endpoint /img/ ainda funciona?
// R: Não. Substitua por /admin-api/produtos/{id}/imagem
//
// P: Como cachear imagens no cliente?
// R: O endpoint já inclui Cache-Control: public, max-age=31536000 (1 ano)
//
// =====================================================
