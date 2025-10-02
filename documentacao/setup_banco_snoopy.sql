-- =============================================
-- SETUP BANCO SNOOPY - COMANDOS ESSENCIAIS
-- =============================================
-- 
-- Execute estes comandos no PostgreSQL para configurar o banco

-- 1. CRIAR BANCO (execute como superuser)
-- CREATE DATABASE snoopy;

-- 2. CONECTAR AO BANCO snoopy e executar o restante

-- 3. CRIAR APENAS AS TABELAS ESSENCIAIS PARA O SISTEMA
DROP TABLE IF EXISTS pessoa CASCADE;
DROP TABLE IF EXISTS produto CASCADE;

-- Tabela de usuários (essencial para login)
CREATE TABLE pessoa (
    cpf VARCHAR(14) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'cliente',
    reset_token VARCHAR(100),
    reset_token_expires TIMESTAMP
);

-- Tabela de produtos (essencial para o CRUD)
CREATE TABLE produto (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco NUMERIC(10,2) NOT NULL,
    imagem VARCHAR(255),
    estoque INT NOT NULL DEFAULT 0
);

-- 4. INSERIR DADOS BÁSICOS

-- Usuário administrador padrão
INSERT INTO pessoa (cpf, nome, email, senha, tipo) VALUES 
('123.456.789-00', 'Admin Sistema', 'admin@snoopy.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Alguns produtos de exemplo
INSERT INTO produto (nome, descricao, preco, imagem, estoque) VALUES 
('Snoopy Clássico', 'Pelúcia do Snoopy tradicional com 30cm de altura', 89.90, 'https://via.placeholder.com/200x200?text=Snoopy', 50),
('Woodstock', 'Pequena pelúcia do Woodstock, amigo do Snoopy', 45.90, 'https://via.placeholder.com/200x200?text=Woodstock', 100),
('Charlie Brown', 'Pelúcia do Charlie Brown com 25cm', 79.90, 'https://via.placeholder.com/200x200?text=Charlie', 35);

-- PRONTO! Agora você pode:
-- - Fazer login com: admin@snoopy.com / senha: password
-- - Gerenciar produtos e pessoas através da interface web
-- - O hash da senha corresponde a 'password' - altere após o primeiro login!

SELECT 'Banco configurado com sucesso!' as status;