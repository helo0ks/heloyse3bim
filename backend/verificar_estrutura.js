// verificar_estrutura.js - Script para verificar estrutura das tabelas
const { pool } = require('./db');

async function verificarEstrutura() {
    try {
        console.log('🔍 Verificando estrutura das tabelas...');
        
        const client = await pool.connect();
        
        // Verificar estrutura da tabela pessoa
        console.log('\n📋 Estrutura da tabela PESSOA:');
        const pessoaStructure = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'pessoa' 
            ORDER BY ordinal_position
        `);
        
        pessoaStructure.rows.forEach(col => {
            console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
        
        // Verificar estrutura da tabela produto
        console.log('\n🧸 Estrutura da tabela PRODUTO:');
        const produtoStructure = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'produto' 
            ORDER BY ordinal_position
        `);
        
        produtoStructure.rows.forEach(col => {
            console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
        
        // Verificar alguns dados de exemplo
        console.log('\n👥 Primeiros 3 registros da tabela pessoa:');
        const pessoaSample = await client.query('SELECT * FROM pessoa LIMIT 3');
        console.table(pessoaSample.rows);
        
        client.release();
        
    } catch (err) {
        console.error('❌ Erro:', err.message);
    } finally {
        await pool.end();
        process.exit();
    }
}

verificarEstrutura();