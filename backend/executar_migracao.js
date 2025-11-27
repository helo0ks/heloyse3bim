// executar_migracao.js - Executa as mudanças SQL necessárias
const { pool } = require('./db');

async function executarMigracao() {
  try {
    console.log('🔄 Iniciando migração do banco de dados...\n');

    // 1. Adicionar coluna imagem_binaria
    console.log('1️⃣  Adicionando coluna imagem_binaria (BYTEA)...');
    await pool.query(`
      ALTER TABLE produto
      ADD COLUMN IF NOT EXISTS imagem_binaria BYTEA;
    `);
    console.log('   ✅ Coluna imagem_binaria criada\n');

    // 2. Adicionar coluna imagem_tipo
    console.log('2️⃣  Adicionando coluna imagem_tipo (VARCHAR)...');
    await pool.query(`
      ALTER TABLE produto
      ADD COLUMN IF NOT EXISTS imagem_tipo VARCHAR(50);
    `);
    console.log('   ✅ Coluna imagem_tipo criada\n');

    // 3. Criar índice
    console.log('3️⃣  Criando índice em produto(id)...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_produto_id ON produto(id);
    `);
    console.log('   ✅ Índice criado\n');

    // 4. Verificar estrutura
    console.log('4️⃣  Verificando estrutura atualizada...');
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'produto' 
      AND column_name IN ('imagem_binaria', 'imagem_tipo')
      ORDER BY column_name;
    `);

    if (result.rows.length === 2) {
      console.log('   ✅ Estrutura verificada com sucesso:');
      result.rows.forEach(r => {
        console.log(`      - ${r.column_name}: ${r.data_type}`);
      });
    } else {
      console.log('   ⚠️  Aviso: Nem todas as colunas foram criadas');
    }

    console.log('\n✨ Migração concluída com sucesso!\n');
    console.log('📌 Próximos passos:');
    console.log('   1. Reiniciar o servidor: npm start');
    console.log('   2. Testar cadastro com imagem');
    console.log('   3. (Opcional) Migrar imagens existentes: node migrar_imagens_filesystem_para_blob.js\n');

  } catch (err) {
    console.error('❌ Erro durante migração:', err.message || err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

executarMigracao();
