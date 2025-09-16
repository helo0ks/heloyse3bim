-- Apaga a tabela pessoa se já existir (cuidado: remove todos os dados!)
DROP TABLE IF EXISTS pessoa;
-- Script para criar a tabela pessoa (usuários) no PostgreSQL
CREATE TABLE IF NOT EXISTS pessoa (
    cpf VARCHAR(14) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'cliente',
    reset_token VARCHAR(100),
    reset_token_expires TIMESTAMP
);

-- Exemplo de admin (senha: admin123, gere o hash com bcrypt para produção)
-- INSERT INTO pessoa (nome, cpf, email, senha, tipo) VALUES ('Admin', '000.000.000-00', 'admin@admin.com', '$2b$10$hashaqui', 'admin');
