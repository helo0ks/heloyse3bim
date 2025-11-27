# 📦 Migração: Armazenamento de Imagens em BLOB

**Data:** 27 de Novembro de 2025  
**Versão:** 2.0  
**Status:** Completo e pronto para produção

---

## 📋 Resumo da Migração

### ❌ Sistema Anterior (Filesystem)
- Imagens armazenadas em `frontend/img/produto_{id}.jpg`
- Problemas: Sem backup automático, escalabilidade limitada, sincronização em múltiplos servidores difícil

### ✅ Sistema Novo (BLOB no Banco)
- Imagens armazenadas como BYTEA na coluna `imagem_binaria`
- Benefícios: Backup automático, transações ACID, escalabilidade, sem sincronização de arquivos

---

## 🚀 Passos de Implementação

### 1️⃣ Executar Migração SQL

```bash
# PostgreSQL CLI
psql -U postgres -d snoopy -f documentacao/migrar_para_blob.sql

# Ou via pgAdmin:
# - Abra o banco 'snoopy'
# - Execute o arquivo: documentacao/migrar_para_blob.sql
```

**Resultado:** Serão criadas 2 novas colunas:
- `imagem_binaria` (BYTEA) - armazena os bytes da imagem
- `imagem_tipo` (VARCHAR) - armazena o tipo MIME (image/jpeg, image/png, etc)

### 2️⃣ Verificar Estrutura

```sql
\d produto

-- Você verá:
-- imagem_binaria | bytea           | 
-- imagem_tipo    | character varying(50) |
```

### 3️⃣ Migrar Imagens Existentes (Opcional)

Se já tem imagens em `frontend/img/`, execute:

```bash
cd backend
node migrar_imagens_filesystem_para_blob.js
```

Este script irá:
- Ler cada arquivo em `frontend/img/`
- Converter para Buffer BYTEA
- Inserir no banco com o tipo MIME correto

### 4️⃣ Reiniciar o Backend

```bash
npm start
```

---

## 📝 Arquivos Modificados

### ✏️ Backend

**`backend/controllers/produtoController.js`**
- ❌ Removida: Função `baixarESalvarImagem()` (filesystem)
- ✅ Adicionada: Função `baixarImagemComoBuffer()` (retorna {buffer, tipo})
- ✅ Adicionada: Função `buscarImagemProduto()` (serve imagem BLOB)
- ✅ Atualizada: `cadastrarProduto()` - salva BLOB no banco
- ✅ Atualizada: `editarProduto()` - atualiza BLOB opcionalmente
- ✅ Atualizada: `excluirProduto()` - remove BLOB automaticamente
- ✅ Atualizada: `listarProdutos()` - não inclui BLOB na resposta (metadados apenas)
- ✅ Atualizada: `listarProdutosPublicos()` - retorna URL `/admin-api/produtos/{id}/imagem`

**`backend/routes/produto.js`**
- ✅ Adicionado: `GET /:id/imagem` - endpoint público para servir imagem

**`backend/db.js`**
- Sem mudanças (já usa `process.env`)

**`documentacao/migrar_para_blob.sql`**
- ✅ Criado: Script SQL para criar colunas BLOB

**`backend/migrar_imagens_filesystem_para_blob.js`**
- ✅ Criado: Script Node.js para migração de arquivos existentes

---

## 🔌 API Endpoints

### 📥 Cadastrar Produto com Imagem

```http
POST /admin-api/produtos
Authorization: Bearer {token}
Content-Type: application/json

{
  "id": 1,
  "nome": "Pelúcia Snoopy",
  "descricao": "Pelúcia de 30cm macia",
  "preco": 99.90,
  "estoque": 50,
  "imagem": "https://example.com/snoopy.jpg"
}
```

**Response:**
```json
{
  "id": 1,
  "nome": "Pelúcia Snoopy",
  "descricao": "Pelúcia de 30cm macia",
  "preco": 99.90,
  "estoque": 50,
  "imagem_tipo": "image/jpeg"
}
```

### 🖼️ Buscar Imagem (Público)

```http
GET /admin-api/produtos/1/imagem

Response: Binário da imagem com header
Content-Type: image/jpeg
Cache-Control: public, max-age=31536000
```

### 📂 Listar Produtos Públicos

```http
GET /produtos/publicos

Response:
{
  "sucesso": true,
  "dados": [
    {
      "id": 1,
      "nome": "Pelúcia Snoopy",
      "preco": 99.90,
      "estoque": 50,
      "imagem": "/admin-api/produtos/1/imagem",  // ← URL para buscar imagem
      "categoria": "Pelúcia"
    }
  ],
  "total": 1
}
```

### ✏️ Editar Produto (Com Nova Imagem)

```http
PUT /admin-api/produtos/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "Pelúcia Snoopy Premium",
  "preco": 149.90,
  "imagem": "https://example.com/nova-imagem.png"
}
```

### ✏️ Editar Produto (Sem Mudar Imagem)

```http
PUT /admin-api/produtos/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "Pelúcia Snoopy Premium",
  "preco": 149.90
  // Não inclua "imagem" para manter a atual
}
```

### 🗑️ Deletar Produto

```http
DELETE /admin-api/produtos/1
Authorization: Bearer {token}

Response: { "message": "Produto excluído com sucesso" }
```

---

## 🎨 Uso no Frontend

### HTML

```html
<!-- Exibir imagem de um produto -->
<img src="/admin-api/produtos/1/imagem" alt="Pelúcia Snoopy">
```

### JavaScript

```javascript
// Carregar produtos e exibir
async function carregarProdutos() {
  const response = await fetch('http://localhost:3001/produtos/publicos');
  const { dados } = await response.json();
  
  dados.forEach(produto => {
    const img = document.createElement('img');
    img.src = `http://localhost:3001${produto.imagem}`;
    img.alt = produto.nome;
    document.body.appendChild(img);
  });
}

carregarProdutos();
```

---

## ⚙️ Configuração da Rota

A rota `/admin-api/produtos/:id/imagem` é **pública** (sem autenticação) para que qualquer pessoa possa visualizar as imagens dos produtos na loja.

Se quiser **proteger** esse endpoint, adicione `verifyToken` em `backend/routes/produto.js`:

```javascript
// Para proteger (apenas usuários logados):
router.get('/:id/imagem', verifyToken, produtoController.buscarImagemProduto);

// Para manter público:
router.get('/:id/imagem', produtoController.buscarImagemProduto);  // Atual
```

---

## 🧹 Limpeza Pós-Migração

Após confirmar que tudo funciona, você pode remover os arquivos de imagem antigos:

### Windows
```bash
rd /s /q frontend\img
```

### Linux/Mac
```bash
rm -rf frontend/img
```

---

## 🔍 Verificação Rápida

### 1. Verificar dados no banco

```sql
SELECT id, nome, imagem_tipo, length(imagem_binaria) as tamanho_bytes
FROM produto
WHERE imagem_binaria IS NOT NULL;

-- Resultado esperado:
-- id | nome           | imagem_tipo  | tamanho_bytes
-- 1  | Pelúcia Snoopy | image/jpeg   | 45234
```

### 2. Testar API via cURL

```bash
# Buscar imagem (salva como arquivo)
curl -o snoopy.jpg http://localhost:3001/admin-api/produtos/1/imagem

# Verificar tipo de imagem
curl -I http://localhost:3001/admin-api/produtos/1/imagem
# Content-Type: image/jpeg
```

### 3. Verificar no Frontend

```javascript
// No console do navegador
fetch('/admin-api/produtos/1/imagem')
  .then(r => r.blob())
  .then(blob => console.log('Tamanho:', blob.size, 'Tipo:', blob.type));
```

---

## 📊 Comparação: Antes vs Depois

| Aspecto | Antes (Filesystem) | Depois (BLOB) |
|---------|-------------------|---------------|
| Armazenamento | `frontend/img/produto_{id}.jpg` | Coluna `imagem_binaria` (BYTEA) |
| Nome arquivo | `produto_1.jpg`, `produto_2.jpg` | ID apenas (metadados no banco) |
| Backup | Manual | Automático (com DB) |
| Múltiplos servidores | Sincronização necessária | Centralizado no DB |
| Transações | Não | Sim (ACID) |
| Limite de tamanho | Espaço em disco | ~1GB por coluna |
| Endpoint URL | `/img/produto_1.jpg` | `/admin-api/produtos/1/imagem` |
| Cache | Filesystem | HTTP headers (1 ano) |

---

## ⚠️ Observações Importantes

1. **Tipos MIME detectados automaticamente:**
   - `image/jpeg` (padrão)
   - `image/png`
   - `image/gif`
   - `image/webp`

2. **Tamanho máximo recomendado:** 10-50MB por imagem

3. **A coluna `imagem` (VARCHAR) foi mantida** para compatibilidade. Remova depois se preferir.

4. **Performance:** BLOB no banco é eficiente até ~1000 imagens. Para volumes maiores, considere cloud storage (S3, etc).

5. **Segurança:** Imagens são servidas com Content-Type correto, evitando XSS.

---

## 🆘 Troubleshooting

### Erro: "coluna 'imagem_binaria' não existe"

Solução: Execute o script SQL de migração:
```bash
psql -U postgres -d snoopy -f documentacao/migrar_para_blob.sql
```

### Erro: "Imagem não encontrada" ao acessar `/admin-api/produtos/1/imagem`

Causas:
1. Produto não existe (verifique ID)
2. Imagem não foi inserida (verifique se arquivo estava disponível na URL)
3. Banco não foi migrado (execute SQL)

### Imagens aparecem como "quebradas" no frontend

Solução: Verifique se a URL está correta:
```javascript
// ❌ Errado
<img src="/img/produto_1.jpg">

// ✅ Correto
<img src="/admin-api/produtos/1/imagem">
```

---

## 📞 Suporte

Para dúvidas sobre implementação:
- Verifique `documentacao/GUIA_BLOB_IMAGENS.md`
- Consulte exemplos em `backend/controllers/produtoController.js`
- Execute testes via `curl` ou Postman

---

**Migração concluída com sucesso! 🎉**
