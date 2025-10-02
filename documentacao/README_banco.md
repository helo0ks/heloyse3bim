# Configuração do Banco de Dados Snoopy

## Pré-requisitos
- PostgreSQL instalado e funcionando
- Usuário com permissões para criar bancos

## Passo a Passo

### 1. Criar o Banco de Dados
```sql
-- Execute este comando como superuser (postgres)
CREATE DATABASE snoopy;
```

### 2. Conectar ao Banco Snoopy
```bash
psql -U postgres -d snoopy
```

### 3. Executar um dos scripts SQL

#### Opção A: Setup Básico (Recomendado para desenvolvimento)
```bash
\i setup_banco_snoopy.sql
```

#### Opção B: Setup Completo (com todas as tabelas e dados)
```bash
\i snoopy.sql
```

### 4. Verificar se as tabelas foram criadas
```sql
\dt
```

Você deve ver pelo menos as tabelas:
- `pessoa`
- `produto`

### 5. Configuração do Backend
O arquivo `backend/db.js` já está configurado para usar:
- **Database**: `snoopy`
- **User**: `postgres`
- **Password**: `batatabb2008`
- **Host**: `localhost`
- **Port**: `5432`

### 6. Testando a Conexão

#### Iniciar o backend:
```bash
cd backend
npm start
```

#### Fazer login com usuário padrão:
- **Email**: `admin@snoopy.com`
- **Senha**: `password`

## Estrutura das Tabelas Principais

### Tabela `pessoa`
```sql
CREATE TABLE pessoa (
    cpf VARCHAR(14) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'cliente',
    reset_token VARCHAR(100),
    reset_token_expires TIMESTAMP
);
```

### Tabela `produto`
```sql
CREATE TABLE produto (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco NUMERIC(10,2) NOT NULL,
    imagem VARCHAR(255),
    estoque INT NOT NULL DEFAULT 0
);
```

## Troubleshooting

### Erro de conexão:
1. Verifique se o PostgreSQL está rodando
2. Confirme as credenciais no arquivo `backend/db.js`
3. Verifique se o banco `snoopy` existe

### Erro de tabela não encontrada:
1. Execute o script SQL novamente
2. Verifique se está conectado no banco correto: `SELECT current_database();`

### Problemas de autenticação:
1. Verifique se o usuário admin foi criado
2. Teste o login com as credenciais padrão
3. Se necessário, recrie o hash da senha:
   ```javascript
   const bcrypt = require('bcrypt');
   const hash = bcrypt.hashSync('password', 10);
   console.log(hash);
   ```

## Scripts Disponíveis

- **`snoopy.sql`**: Script completo com todas as tabelas e dados de exemplo
- **`setup_banco_snoopy.sql`**: Script básico apenas com tabelas essenciais
- **`criar_tabela_pessoa.sql`**: Script individual para tabela pessoa  
- **`criar_tabela_produto.sql`**: Script individual para tabela produto