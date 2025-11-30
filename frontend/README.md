# Frontend

## Upload de Imagens (somente upload)
- A partir desta versão, o cadastro e edição de produtos não aceita mais URLs de imagem.
- As imagens devem ser enviadas via upload de arquivo pelo campo `imagemArquivo`.
- A página `produtos.html` e o CRUD integrado (`produtos_pessoas.js`) já utilizam `FormData` para enviar `multipart/form-data` com o arquivo.
- Após salvar, a imagem do produto é servida pelo backend em `http://localhost:3001/admin-api/produtos/{id}/imagem`.

## Dicas de uso
- Para atualizar a imagem, entre em Editar, selecione um novo arquivo e salve.
- Se nenhum arquivo for selecionado ao editar, a imagem atual será mantida.
Coloque aqui os arquivos HTML, CSS e JS do seu projeto.
