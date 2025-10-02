// teste_conexao.js - Script para testar a conexão com o banco Snoopy
const { pool } = require('./db');

async function testarConexao() {
    try {
        console.log('🔍 Testando conexão com o banco de dados...');
        
        // Teste básico de conexão
        const client = await pool.connect();
        console.log('✅ Conexão estabelecida com sucesso!');
        
        // Verificar nome do banco
        const dbResult = await client.query('SELECT current_database()');
        console.log(`📊 Banco atual: ${dbResult.rows[0].current_database}`);
        
        // Verificar se as tabelas existem
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);
        
        console.log('📋 Tabelas encontradas:');
        tablesResult.rows.forEach(row => {
            console.log(`   - ${row.table_name}`);
        });
        
        // Verificar dados na tabela pessoa
        try {
            const pessoaResult = await client.query('SELECT COUNT(*) FROM pessoa');
            console.log(`👥 Registros na tabela pessoa: ${pessoaResult.rows[0].count}`);
        } catch (err) {
            console.log('❌ Tabela pessoa não encontrada ou vazia');
        }
        
        // Verificar dados na tabela produto
        try {
            const produtoResult = await client.query('SELECT COUNT(*) FROM produto');
            console.log(`🧸 Registros na tabela produto: ${produtoResult.rows[0].count}`);
        } catch (err) {
            console.log('❌ Tabela produto não encontrada ou vazia');
        }
        
        client.release();
        console.log('✅ Teste concluído com sucesso!');
        
    } catch (err) {
        console.error('❌ Erro na conexão:');
        console.error('Detalhes:', err.message);
        console.error('\n💡 Possíveis soluções:');
        console.error('1. Verifique se o PostgreSQL está rodando');
        console.error('2. Confirme se o banco "snoopy" foi criado');
        console.error('3. Verifique as credenciais no arquivo db.js');
        console.error('4. Execute o script setup_banco_snoopy.sql');
    } finally {
        await pool.end();
        process.exit();
    }
}

// Executar teste
testarConexao();