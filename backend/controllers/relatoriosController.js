const { pool } = require('../db');

// Relatório de Vendas: produtos mais vendidos com quantidade e receita total
exports.relatorioVendas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        pr.id as produto_id,
        pr.nome as produto,
        SUM(php.quantidade) AS quantidadeVendida,
        SUM(php.quantidade * php.precoUnitario) AS receitaTotal
      FROM PedidoHasProduto php
      JOIN produto pr ON php.ProdutoIdProduto = pr.id
      GROUP BY pr.id, pr.nome
      ORDER BY receitaTotal DESC, pr.nome ASC
    `);

    // Formatar conforme especificação desejada
    const dados = result.rows.map(r => ({
      produto: r.produto,
      quantidadeVendida: Number(r.quantidadevendida) || 0,
      receitaTotal: Number(r.receitatotal) || 0
    }));
    
    // Calcular totais gerais
    const totalQuantidade = dados.reduce((acc, d) => acc + d.quantidadeVendida, 0);
    const totalReceita = dados.reduce((acc, d) => acc + d.receitaTotal, 0);
    
    res.json({
      produtos: dados,
      totais: {
        totalQuantidade,
        totalReceita
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Erro ao gerar relatório de vendas' });
  }
};

// Relatório de Vendas por Período (dia/semana/mês)
exports.relatorioVendasPeriodo = async (req, res) => {
  try {
    const { periodo } = req.query; // 'dia', 'semana', 'mes'
    
    let dateFormat;
    let groupBy;
    
    switch (periodo) {
      case 'semana':
        dateFormat = "TO_CHAR(DATE_TRUNC('week', p.dataDoPedido), 'YYYY-MM-DD')";
        groupBy = "DATE_TRUNC('week', p.dataDoPedido)";
        break;
      case 'mes':
        dateFormat = "TO_CHAR(p.dataDoPedido, 'YYYY-MM')";
        groupBy = "TO_CHAR(p.dataDoPedido, 'YYYY-MM')";
        break;
      default: // dia
        dateFormat = "TO_CHAR(p.dataDoPedido, 'YYYY-MM-DD')";
        groupBy = "TO_CHAR(p.dataDoPedido, 'YYYY-MM-DD')";
    }
    
    const result = await pool.query(`
      SELECT 
        ${dateFormat} as periodo,
        COUNT(DISTINCT p.idPedido) as totalPedidos,
        SUM(php.quantidade) as totalItens,
        SUM(php.quantidade * php.precoUnitario) as receitaTotal
      FROM Pedido p
      JOIN PedidoHasProduto php ON p.idPedido = php.PedidoIdPedido
      GROUP BY ${groupBy}
      ORDER BY ${groupBy} DESC
      LIMIT 30
    `);
    
    const dados = result.rows.map(r => ({
      periodo: r.periodo,
      totalPedidos: Number(r.totalpedidos) || 0,
      totalItens: Number(r.totalitens) || 0,
      receitaTotal: Number(r.receitatotal) || 0
    }));
    
    // Inverter para ordem cronológica
    dados.reverse();
    
    res.json(dados);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Erro ao gerar relatório de vendas por período' });
  }
};

// Relatório de Clientes: com compra, sem compra e valor gasto
exports.relatorioClientes = async (req, res) => {
  try {
    // Clientes que já possuem pedidos COM valor total gasto
    const comCompra = await pool.query(`
      SELECT 
        p.cpf AS cpf, 
        p.nome, 
        p.email,
        COUNT(DISTINCT ped.idPedido) as totalPedidos,
        COALESCE(SUM(php.quantidade * php.precoUnitario), 0) as valorTotalGasto
      FROM pessoa p
      JOIN Cliente c ON p.cpf = c.PessoaCpfPessoa
      JOIN Pedido ped ON ped.ClientePessoaCpfPessoa = c.PessoaCpfPessoa
      LEFT JOIN PedidoHasProduto php ON ped.idPedido = php.PedidoIdPedido
      GROUP BY p.cpf, p.nome, p.email
      ORDER BY valorTotalGasto DESC
    `);

    // Todos os clientes
    const todosClientes = await pool.query(`
      SELECT p.cpf AS cpf, p.nome, p.email
      FROM pessoa p
      JOIN Cliente c ON p.cpf = c.PessoaCpfPessoa
    `);

    // Mapear CPFs com compra
    const cpfsComCompra = new Set(comCompra.rows.map(r => r.cpf));

    // Filtrar clientes sem compra
    const semCompra = todosClientes.rows.filter(r => !cpfsComCompra.has(r.cpf))
      .sort((a, b) => a.nome.localeCompare(b.nome));

    // Calcular totais
    const totalGastoGeral = comCompra.rows.reduce((acc, r) => acc + Number(r.valortotalgasto || 0), 0);
    const totalPedidosGeral = comCompra.rows.reduce((acc, r) => acc + Number(r.totalpedidos || 0), 0);

    res.json({
      clientesComCompra: comCompra.rows.map(r => ({
        id: r.cpf,
        nome: r.nome,
        email: r.email,
        totalPedidos: Number(r.totalpedidos) || 0,
        valorTotalGasto: Number(r.valortotalgasto) || 0
      })),
      clientesSemCompra: semCompra.map(r => ({
        id: r.cpf,
        nome: r.nome,
        email: r.email,
        totalPedidos: 0,
        valorTotalGasto: 0
      })),
      totais: {
        totalClientes: todosClientes.rows.length,
        comCompra: comCompra.rows.length,
        semCompra: semCompra.length,
        totalGastoGeral,
        totalPedidosGeral,
        ticketMedio: comCompra.rows.length > 0 ? totalGastoGeral / totalPedidosGeral : 0
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Erro ao gerar relatório de clientes' });
  }
};
