// Script para adicionar formas de pagamento no banco
const { pool } = require('./db');

async function adicionarFormasPagamento() {
  try {
    console.log('🏦 Adicionando formas de pagamento...');

    const formasPagamento = [
      'Dinheiro',
      'Cartão de Crédito',
      'Cartão de Débito',
      'PIX',
      'Transferência Bancária',
      'Boleto Bancário',
      'Cheque'
    ];

    for (const forma of formasPagamento) {
      try {
        // Verificar se já existe
        const existe = await pool.query('SELECT idFormaPagamento FROM FormaDePagamento WHERE nomeFormaPagamento = $1', [forma]);
        
        if (existe.rows.length > 0) {
          console.log(`⚠️  Forma de pagamento "${forma}" já existe, pulando...`);
          continue;
        }

        // Inserir nova forma de pagamento
        await pool.query(
          'INSERT INTO FormaDePagamento (nomeFormaPagamento) VALUES ($1)',
          [forma]
        );

        console.log(`✅ Forma de pagamento "${forma}" adicionada com sucesso`);
        
      } catch (error) {
        console.log(`❌ Erro ao adicionar forma de pagamento "${forma}":`, error.message);
      }
    }

    console.log('\n🎉 Processo concluído!');
    
    // Listar todas as formas de pagamento cadastradas
    const resultado = await pool.query('SELECT * FROM FormaDePagamento ORDER BY nomeFormaPagamento');
    console.log('\n📋 Formas de pagamento cadastradas:');
    resultado.rows.forEach(forma => {
      console.log(`   ${forma.idformapagamento} - ${forma.nomeformapagamento}`);
    });
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  } finally {
    process.exit(0);
  }
}

// Executar
adicionarFormasPagamento();