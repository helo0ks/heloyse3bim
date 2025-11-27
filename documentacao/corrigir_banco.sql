-- corrigir_banco.sql - Script para corrigir a estrutura do banco
-- Execute este script no pgAdmin para corrigir as tabelas

-- 1. SCRIPT SEGURO E NÃO-DESTRUTIVO
-- Este script cria tabelas se não existirem e adiciona colunas/constraints
-- necessárias sem dropar tabelas já em uso. Use no pgAdmin ou via script
-- backend/corrigir_banco.js.

BEGIN;

-- Endereco: cria se não existir
CREATE TABLE IF NOT EXISTS Endereco (
        idEndereco SERIAL PRIMARY KEY,
        logradouro VARCHAR(100),
        numero VARCHAR(10),
        referencia VARCHAR(45),
        cep VARCHAR(9),
        CidadeIdCidade INT
);

-- Pessoa: cria se não existir
CREATE TABLE IF NOT EXISTS pessoa (
        cpf VARCHAR(14) PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        tipo VARCHAR(20) NOT NULL DEFAULT 'cliente',
        reset_token VARCHAR(100),
        reset_token_expires TIMESTAMP
);

-- Adicionar coluna de endereço em `pessoa`, se não existir, e FK para Endereco
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='pessoa' AND column_name='enderecoidendereco'
    ) THEN
        ALTER TABLE pessoa ADD COLUMN enderecoidendereco INT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname='pessoa_endereco_fkey'
    ) THEN
        ALTER TABLE pessoa
            ADD CONSTRAINT pessoa_endereco_fkey
            FOREIGN KEY (enderecoidendereco) REFERENCES Endereco(idEndereco);
    END IF;
END$$;

-- Produto: cria se não existir e garante coluna `categoria` (não destructivo)
CREATE TABLE IF NOT EXISTS produto (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        descricao TEXT,
        preco NUMERIC(10,2) NOT NULL,
        imagem VARCHAR(255),
        estoque INT NOT NULL DEFAULT 0,
        categoria VARCHAR(100)
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='produto' AND column_name='categoria'
    ) THEN
        ALTER TABLE produto ADD COLUMN categoria VARCHAR(100);
    END IF;
END$$;

COMMIT;

-- Nota: Não incluí inserts automáticos para evitar duplicação de dados em bancos
-- já em uso. Se quiser inserir dados de teste somente em ambientes de dev,
-- execute os INSERTs manualmente ou use um bloco que verifique existência.