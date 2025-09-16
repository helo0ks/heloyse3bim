-- Apaga a tabela produto se já existir (cuidado: remove todos os dados!)
DROP TABLE IF EXISTS produto;
-- Script para criar a tabela produto (pelúcias) no PostgreSQL
CREATE TABLE IF NOT EXISTS produto (
    id INT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco NUMERIC(10,2) NOT NULL,
    imagem VARCHAR(255),
    estoque INT NOT NULL DEFAULT 0
);

-- Exemplo de inserção de produto
-- INSERT INTO produto (nome, descricao, preco, imagem, estoque) VALUES ('Pelúcia Snoopy Clássico', 'Pelúcia macia do Snoopy', 99.90, 'snoopy-classico.jpg', 10);
