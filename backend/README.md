# Backend

## Imagens de Produtos: Upload-Only
- O backend aceita imagens apenas via upload (multipart/form-data) usando o campo `imagemArquivo`.
- `POST /admin-api/produtos` exige `imagemArquivo` e retorna 400 se o arquivo não for enviado.
- `PUT /admin-api/produtos/:id` atualiza a imagem somente se `imagemArquivo` for incluído; caso contrário, mantém a existente.
- As imagens são armazenadas como BLOB (`imagem_binaria`) e servidas em `GET /admin-api/produtos/:id/imagem` com o MIME correto.

## Middleware de Upload
- Implementado com Multer (`memoryStorage`). Tipos aceitos: `jpeg`, `png`, `gif`, `webp`. Limite: 10MB.

## Considerações de Banco
- A tabela `produto` deve conter colunas `imagem_binaria BYTEA` e `imagem_tipo TEXT/VARCHAR`.
- A coluna `imagem` é usada como referência baseada no `id` para compor a URL pública.
Coloque aqui o código Node.js/Express e a conexão com o banco PostgreSQL.
