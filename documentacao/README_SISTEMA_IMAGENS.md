# Sistema de Gerenciamento de Imagens de Produtos

## 📖 Como Funciona

O sistema agora baixa automaticamente as imagens dos produtos quando você adiciona URLs no CRUD e as salva localmente na pasta `frontend/img/` com nomes baseados no ID do produto.

## 🚀 Funcionalidades

### ✅ Cadastro de Produtos
- Quando você cadastra um produto com uma URL de imagem (http:// ou https://), o sistema:
  1. Baixa a imagem automaticamente
  2. Salva na pasta `frontend/img/` 
  3. Renomeia como `produto_{ID}.{extensão}` (ex: `produto_100.jpg`)
  4. Atualiza o banco de dados com o caminho local

### ✅ Edição de Produtos
- Se você alterar a URL da imagem de um produto existente:
  1. O sistema baixa a nova imagem
  2. Substitui a imagem anterior
  3. Mantém o mesmo nome baseado no ID

### ✅ Exclusão de Produtos
- Quando um produto é excluído:
  1. Remove o registro do banco de dados
  2. Deleta automaticamente o arquivo de imagem correspondente

## 🛠️ Detalhes Técnicos

### Formato das Imagens
- **Extensões suportadas**: .jpg, .jpeg, .png, .gif, .webp
- **Detecção automática** da extensão baseada no Content-Type da resposta HTTP
- **Extensão padrão**: .jpg (caso não seja possível detectar)

### Nomeação dos Arquivos
```
produto_{ID_DO_PRODUTO}.{extensão}
```
Exemplos:
- `produto_100.jpg`
- `produto_101.png` 
- `produto_102.webp`

### Acesso às Imagens
As imagens ficam disponíveis em:
```
http://localhost:3001/img/produto_{ID}.{extensão}
```

## 💡 Como Usar

### 1. No CRUD de Produtos
1. Acesse `produtos.html`
2. No campo **Imagem**, cole uma URL completa (ex: `https://exemplo.com/imagem.jpg`)
3. Clique em **Cadastrar** ou **Atualizar**
4. ✅ A imagem será baixada automaticamente!

### 2. Visualização
- **Na tabela de produtos**: As imagens aparecem automaticamente
- **Na loja principal**: Os produtos mostram as imagens baixadas
- **Fallback**: Se houver erro, mostra a imagem padrão do Snoopy

## 🧪 Teste do Sistema

### Produtos de Exemplo Adicionados
Foram adicionados produtos com IDs 100, 101 e 102 com URLs de teste. Para testar:

1. Acesse o CRUD de produtos
2. Busque pelo ID 100, 101 ou 102  
3. Clique em **Editar** e depois **Atualizar**
4. A imagem será baixada e salva localmente!

### Script de Teste Manual
```bash
cd backend
node testar_download_imagem.js
```

## 🔧 Resolução de Problemas

### ❓ Imagem não aparece
- Verifique se a URL está correta e acessível
- Confirme se o servidor backend está rodando na porta 3001
- Verifique se a pasta `frontend/img/` existe

### ❓ Erro de download
- URLs devem começar com `http://` ou `https://`
- Timeout de 10 segundos para downloads
- Se falhar, mantém a URL original no banco

### ❓ Imagem muito grande
- O sistema baixa imagens de qualquer tamanho
- Recomendação: usar URLs com imagens otimizadas (300x300px ou similar)

## 📁 Estrutura de Arquivos

```
frontend/
  img/
    produto_100.jpg    ← Imagens dos produtos
    produto_101.png
    produto_102.webp
    snoopy-bg.png      ← Imagem padrão (fallback)

backend/
  controllers/
    produtoController.js  ← Lógica de download de imagens
```

## 🎯 Próximos Passos

- ✅ Sistema funcionando
- ✅ Download automático implementado  
- ✅ Remoção de imagens ao excluir produtos
- ✅ Fallback para erros de download
- ✅ Integração com frontend completa

**Agora você pode usar URLs de imagens no CRUD e elas serão automaticamente baixadas e organizadas! 🎉**