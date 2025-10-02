# 🔧 SOLUÇÃO PARA ERRO 500 - ESTRUTURA DO BANCO INCORRETA

## 🚨 Problema Identificado
O erro 500 acontece porque a estrutura das tabelas no banco está incorreta:

**Tabela `pessoa` atual:**
- `cpfpessoa`, `nomepessoa`, `datanascimentopessoa`, `enderecoidendereco`

**Tabela `pessoa` esperada pelo sistema:**
- `cpf`, `nome`, `email`, `senha`, `tipo`, `reset_token`, `reset_token_expires`

## ⚡ SOLUÇÃO RÁPIDA

### 1. Abra o pgAdmin
### 2. Conecte ao banco `snoopy`
### 3. Execute o script `corrigir_banco.sql`

**Caminho do arquivo:** `documentacao/corrigir_banco.sql`

### 4. Reinicie o servidor backend

```bash
# No terminal, no diretório backend:
node app.js
```

## 🧪 TESTE A CORREÇÃO

### Login com usuários pré-criados:
- **Email:** `admin@snoopy.com` | **Senha:** `password`
- **Email:** `bruno.costa@email.com` | **Senha:** `123456`
- **Email:** `ana.silva@email.com` | **Senha:** `123456`

### Produtos já cadastrados:
- Snoopy Clássico (R$ 89,90)
- Woodstock (R$ 45,90)
- Charlie Brown (R$ 79,90)
- Snoopy Joe Cool (R$ 95,90)
- Snoopy Gigante (R$ 199,90)

## 📋 VERIFICAÇÃO

Após executar o script, você deve conseguir:
1. ✅ Fazer login sem erro
2. ✅ Cadastrar novos usuários
3. ✅ Cadastrar/editar produtos
4. ✅ Ver a lista de pessoas e produtos

## 🔄 ALTERNATIVA - BANCO LIMPO

Se preferir começar do zero, execute este comando no pgAdmin:

```sql
-- DROPA E RECRIA O BANCO COMPLETO
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

Depois execute o arquivo `corrigir_banco.sql` ou `setup_banco_snoopy.sql`.

## 🆘 EM CASO DE DÚVIDAS

Execute o teste de verificação:
```bash
node verificar_estrutura.js
```

Isso mostrará a estrutura atual das tabelas e você poderá comparar com o que é esperado.

---
**IMPORTANTE:** O erro 500 será resolvido assim que a estrutura das tabelas estiver correta!