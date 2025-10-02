# CRUD de Pedidos - Sistema Snoopy

## 📋 Visão Geral

O CRUD de Pedidos é um sistema completo para gerenciamento de pedidos na Loja Snoopy, integrando-se com todas as tabelas relacionadas do banco de dados.

## 🎯 Funcionalidades

### ✅ Operações CRUD Completas
- **Criar** novos pedidos com produtos e formas de pagamento
- **Ler** lista de pedidos e detalhes individuais
- **Atualizar** pedidos existentes
- **Deletar** pedidos (com remoção em cascata de dados relacionados)

### 🔗 Integrações com Tabelas

#### 📊 Tabelas Relacionadas:
1. **Pedido** - Tabela principal
2. **Cliente** - Via `pessoa` (clientes do sistema)
3. **Funcionario** - Via `pessoa` (funcionários responsáveis)
4. **PedidoHasProduto** - Produtos do pedido com quantidade e preço
5. **Pagamento** - Dados de pagamento do pedido
6. **PagamentoHasFormaPagamento** - Formas de pagamento utilizadas
7. **FormaDePagamento** - Métodos de pagamento disponíveis

## 🛠️ Estrutura Técnica

### Backend - Controller (`pedidoController.js`)
```javascript
// Principais endpoints
exports.listarPedidos()           // GET /pedidos
exports.buscarPedidoPorId()       // GET /pedidos/:id
exports.cadastrarPedido()         // POST /pedidos
exports.editarPedido()            // PUT /pedidos/:id
exports.excluirPedido()           // DELETE /pedidos/:id

// Endpoints auxiliares para dropdowns
exports.listarClientes()          // GET /pedidos/auxiliar/clientes
exports.listarFuncionarios()      // GET /pedidos/auxiliar/funcionarios
exports.listarProdutosPedido()    // GET /pedidos/auxiliar/produtos
exports.listarFormasPagamento()   // GET /pedidos/auxiliar/formas-pagamento
```

### Frontend - Interface
- **Seletor de CRUD**: Opção "Gerenciar Pedidos" no dropdown
- **Formulário Dinâmico**: Adição/remoção de produtos e formas de pagamento
- **Tabela de Listagem**: Exibição completa com ações de editar/excluir
- **Dropdowns Inteligentes**: Carregamento automático de dados relacionados

## 📝 Como Usar

### 1. Acessar o CRUD
1. Faça login como administrador
2. Acesse `produtos.html` 
3. Selecione "Gerenciar Pedidos" no dropdown

### 2. Criar Novo Pedido
1. Preencha os campos obrigatórios:
   - **Data do Pedido**
   - **Cliente** (dropdown)
   - **Funcionário Responsável** (dropdown)

2. **Adicionar Produtos**:
   - Clique em "+ Adicionar Produto"
   - Selecione produto (preço preenche automaticamente)
   - Defina quantidade
   - Ajuste preço se necessário
   - Use "Remover" para excluir itens

3. **Definir Pagamento**:
   - Informe valor total
   - Clique em "+ Adicionar Forma de Pagamento"
   - Selecione método de pagamento
   - Informe valor pago
   - Pode usar múltiplas formas de pagamento

4. Clique em **"Cadastrar/Atualizar Pedido"**

### 3. Editar Pedido Existente
1. Digite o **ID do Pedido**
2. Clique em **"Buscar por ID"**
3. Modifique os campos desejados
4. Clique em **"Cadastrar/Atualizar Pedido"**

### 4. Visualizar e Gerenciar
- **Tabela de Pedidos**: Lista todos os pedidos com informações principais
- **Ações**: Botões "Editar" e "Excluir" para cada pedido
- **Filtros**: Ordenação por data (mais recentes primeiro)

## 🔧 Recursos Avançados

### 💡 Funcionalidades Inteligentes
- **Preenchimento Automático**: Preço do produto preenche automaticamente
- **Validação de Dados**: Campos obrigatórios e formatos corretos
- **Transações Seguras**: Operações em transação para consistência de dados
- **Remoção em Cascata**: Exclusão limpa todos os dados relacionados

### 🎨 Interface Responsiva
- **Design Rosa/Pink**: Consistente com tema da aplicação
- **Botões Intuitivos**: Cores diferenciadas (verde para adicionar, vermelho para remover)
- **Layout Flexível**: Adapta-se a diferentes tamanhos de tela
- **Feedback Visual**: Mensagens de erro e sucesso

## 📊 Estrutura do Banco de Dados

### Relacionamentos:
```sql
Pedido
├── ClientePessoaCpfPessoa → Cliente → pessoa
├── FuncionarioPessoaCpfPessoa → Funcionario → pessoa
├── PedidoHasProduto → produto
├── Pagamento
    └── PagamentoHasFormaPagamento → FormaDePagamento
```

### Campos Principais:
- **Pedido**: `idPedido`, `dataDoPedido`, `ClientePessoaCpfPessoa`, `FuncionarioPessoaCpfPessoa`
- **PedidoHasProduto**: `ProdutoIdProduto`, `quantidade`, `precoUnitario`
- **Pagamento**: `valorTotalPagamento`, `dataPagamento`
- **PagamentoHasFormaPagamento**: `valorPago`

## 🚀 Status de Implementação

### ✅ Concluído
- [x] Controller completo com todas as operações
- [x] Rotas configuradas e funcionando
- [x] Interface de usuário completa
- [x] Integração com todas as tabelas relacionadas
- [x] Validações e tratamento de erros
- [x] Estilos CSS personalizados
- [x] Formas de pagamento pré-cadastradas
- [x] Sistema de transações para consistência

### 🎯 Funcionalidades Extras
- **Busca Avançada**: Por cliente, funcionário, data, etc.
- **Relatórios**: Vendas por período, produtos mais vendidos
- **Notificações**: Pedidos pendentes, pagamentos em atraso
- **Impressão**: Recibos e relatórios de pedidos

## 🌐 Endpoints da API

### Principais
- `GET /pedidos` - Lista todos os pedidos
- `GET /pedidos/:id` - Busca pedido por ID
- `POST /pedidos` - Cria novo pedido
- `PUT /pedidos/:id` - Atualiza pedido
- `DELETE /pedidos/:id` - Remove pedido

### Auxiliares
- `GET /pedidos/auxiliar/clientes` - Lista clientes
- `GET /pedidos/auxiliar/funcionarios` - Lista funcionários  
- `GET /pedidos/auxiliar/produtos` - Lista produtos disponíveis
- `GET /pedidos/auxiliar/formas-pagamento` - Lista formas de pagamento

---

**🎉 O CRUD de Pedidos está totalmente funcional e integrado ao sistema Snoopy!**

Agora você pode gerenciar pedidos completos com produtos, clientes, funcionários e formas de pagamento em uma interface única e intuitiva.