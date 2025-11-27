-- =====================================================
-- MIGRAÇÃO: Adicionar suporte a imagens BLOB no banco
-- =====================================================
-- 
-- Este script adiciona uma coluna BYTEA (equivalente BLOB em PostgreSQL)
-- para armazenar imagens diretamente no banco de dados.
--
-- INSTRUÇÕES:
-- 1. Execute este script no seu banco de dados PostgreSQL
-- 2. Substitua o controller de produto pela nova versão
-- 3. Reinicie o servidor backend
--
-- =====================================================

-- Adicionar coluna imagem_binaria (BYTEA) à tabela produto
ALTER TABLE produto
ADD COLUMN imagem_binaria BYTEA,
ADD COLUMN imagem_tipo VARCHAR(50);

-- (OPCIONAL) Manter a coluna imagem_varchar para referências, mas não será mais usada
-- ALTER TABLE produto RENAME COLUMN imagem TO imagem_varchar_legacy;

-- Criar índice para melhorar performance em buscas
CREATE INDEX IF NOT EXISTS idx_produto_id ON produto(id);

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
-- 
-- 1. A coluna 'imagem_binaria' armazena os bytes da imagem (BYTEA)
-- 2. A coluna 'imagem_tipo' armazena o tipo MIME (image/jpeg, image/png, etc)
-- 3. A coluna 'imagem' original continua por compatibilidade (se necessário, delete depois)
-- 4. O nome do arquivo agora será apenas o ID + extensão (1.jpg, 2.png, etc)
--
-- Para verificar a estrutura atualizada:
-- \d produto
--
-- Para limpar dados legados (após confirmar que tudo funciona):
-- UPDATE produto SET imagem = NULL WHERE imagem LIKE 'img/produto_%';
-- 
-- =====================================================
