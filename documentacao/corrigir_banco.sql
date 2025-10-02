-- corrigir_banco.sql - Script para corrigir a estrutura do banco
-- Execute este script no pgAdmin para corrigir as tabelas

-- 1. DROPAR TABELAS COM ESTRUTURA INCORRETA
DROP TABLE IF EXISTS pessoa CASCADE;
DROP TABLE IF EXISTS produto CASCADE;

-- 2. RECRIAR TABELA PESSOA COM ESTRUTURA CORRETA
CREATE TABLE pessoa (
    cpf VARCHAR(14) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'cliente',
    reset_token VARCHAR(100),
    reset_token_expires TIMESTAMP
);

-- 3. RECRIAR TABELA PRODUTO COM ESTRUTURA CORRETA  
CREATE TABLE produto (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco NUMERIC(10,2) NOT NULL,
    imagem VARCHAR(255),
    estoque INT NOT NULL DEFAULT 0
);

-- 4. INSERIR DADOS DE TESTE COM SENHAS VÁLIDAS

-- Hash bcrypt para senha "123456"
-- Usuários de teste
INSERT INTO pessoa (cpf, nome, email, senha, tipo) VALUES 
('123.456.789-00', 'Admin Sistema', 'admin@snoopy.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('111.111.111-11', 'Ana Silva', 'ana.silva@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cliente'),
('222.222.222-22', 'Bruno Costa', 'bruno.costa@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('333.333.333-33', 'Carlos Souza', 'carlos.souza@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cliente'),
('444.444.444-44', 'Daniela Lima', 'daniela.lima@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cliente');

-- Produtos de pelúcias Snoopy
INSERT INTO produto (nome, descricao, preco, imagem, estoque) VALUES 
('Snoopy Clássico', 'Pelúcia do Snoopy tradicional com 30cm de altura', 89.90, 'https://via.placeholder.com/200x200?text=Snoopy', 50),
('Woodstock', 'Pequena pelúcia do Woodstock, amigo do Snoopy', 45.90, 'https://via.placeholder.com/200x200?text=Woodstock', 100),
('Charlie Brown', 'Pelúcia do Charlie Brown com 25cm', 79.90, 'https://via.placeholder.com/200x200?text=Charlie', 35),
('Snoopy Joe Cool', 'Snoopy usando óculos escuros no estilo Joe Cool', 95.90, 'https://via.placeholder.com/200x200?text=JoeCool', 20),
('Snoopy Gigante', 'Pelúcia grande do Snoopy com 60cm de altura', 199.90, 'https://via.placeholder.com/200x200?text=SnoopyGigante', 15);

-- 5. VERIFICAR SE TUDO FOI CRIADO CORRETAMENTE
SELECT 'Estrutura corrigida com sucesso!' as status;
SELECT COUNT(*) as total_pessoas FROM pessoa;
SELECT COUNT(*) as total_produtos FROM produto;