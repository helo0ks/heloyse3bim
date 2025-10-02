// Carrinho - Gerenciamento do carrinho de compras
let carrinho = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    carregarCarrinho();
    configurarEventos();
    exibirCarrinho();
    
    // Escutar mudanças no localStorage (para quando o carrinho for limpo em outras abas)
    window.addEventListener('storage', function(e) {
        if (e.key === 'carrinho') {
            carregarCarrinho();
            exibirCarrinho();
        }
    });
});

// Carregar carrinho do localStorage
function carregarCarrinho() {
    const carrinhoSalvo = localStorage.getItem('carrinho');
    carrinho = carrinhoSalvo ? JSON.parse(carrinhoSalvo) : [];
}

// Salvar carrinho no localStorage
function salvarCarrinho() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

// Configurar eventos
function configurarEventos() {
    const btnLimparCarrinho = document.getElementById('limpar-carrinho');
    const btnFinalizarCompra = document.getElementById('finalizar-compra');
    
    if (btnLimparCarrinho) {
        btnLimparCarrinho.addEventListener('click', limparCarrinho);
    }
    
    if (btnFinalizarCompra) {
        btnFinalizarCompra.addEventListener('click', finalizarCompra);
    }
}

// Exibir carrinho na tela
function exibirCarrinho() {
    const carrinhoVazio = document.getElementById('carrinho-vazio');
    const carrinhoConteudo = document.getElementById('carrinho-conteudo');
    const carrinhoItens = document.getElementById('carrinho-itens');
    
    if (carrinho.length === 0) {
        carrinhoVazio.style.display = 'block';
        carrinhoConteudo.style.display = 'none';
        return;
    }
    
    carrinhoVazio.style.display = 'none';
    carrinhoConteudo.style.display = 'block';
    
    // Exibir itens
    carrinhoItens.innerHTML = carrinho.map(item => `
        <div class="carrinho-item" data-id="${item.id}">
            <div class="item-imagem">
                <img src="${item.imagem || 'img/snoopy-bg.png'}" alt="${item.nome}" onerror="this.src='img/snoopy-bg.png'">
            </div>
            <div class="item-detalhes">
                <h4 class="item-nome">${item.nome}</h4>
                <p class="item-preco-unitario">R$ ${parseFloat(item.preco).toFixed(2)} cada</p>
            </div>
            <div class="item-quantidade">
                <button class="btn-quantidade" onclick="alterarQuantidade(${item.id}, -1)">-</button>
                <span class="quantidade">${item.quantidade}</span>
                <button class="btn-quantidade" onclick="alterarQuantidade(${item.id}, 1)" 
                        ${item.quantidade >= item.estoqueDisponivel ? 'disabled' : ''}>+</button>
            </div>
            <div class="item-preco-total">
                <span>R$ ${(parseFloat(item.preco) * item.quantidade).toFixed(2)}</span>
            </div>
            <div class="item-remover">
                <button class="btn-remover" onclick="removerItem(${item.id})" title="Remover item">×</button>
            </div>
        </div>
    `).join('');
    
    // Atualizar valores
    atualizarValores();
}

// Alterar quantidade de um item
function alterarQuantidade(itemId, delta) {
    const item = carrinho.find(i => i.id === itemId);
    if (!item) return;
    
    const novaQuantidade = item.quantidade + delta;
    
    if (novaQuantidade <= 0) {
        removerItem(itemId);
        return;
    }
    
    if (novaQuantidade > item.estoqueDisponivel) {
        mostrarMensagem('Quantidade máxima atingida para este produto!', 'erro');
        return;
    }
    
    item.quantidade = novaQuantidade;
    salvarCarrinho();
    exibirCarrinho();
}

// Remover item do carrinho
function removerItem(itemId) {
    carrinho = carrinho.filter(item => item.id !== itemId);
    salvarCarrinho();
    exibirCarrinho();
    mostrarMensagem('Item removido do carrinho', 'sucesso');
}

// Limpar carrinho
function limparCarrinho() {
    if (confirm('Tem certeza que deseja limpar todo o carrinho?')) {
        carrinho = [];
        salvarCarrinho();
        exibirCarrinho();
        mostrarMensagem('Carrinho limpo com sucesso!', 'sucesso');
    }
}

// Limpar carrinho programaticamente (para logout)
function limparCarrinhoSilencioso() {
    carrinho = [];
    salvarCarrinho();
    if (typeof exibirCarrinho === 'function') {
        exibirCarrinho();
    }
}

// Função global para compatibilidade
window.limparCarrinhoSilencioso = limparCarrinhoSilencioso;

// Atualizar valores do resumo
function atualizarValores() {
    const subtotal = carrinho.reduce((total, item) => {
        return total + (parseFloat(item.preco) * item.quantidade);
    }, 0);
    
    const frete = 0; // Frete grátis por enquanto
    const total = subtotal + frete;
    
    document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
    document.getElementById('total').textContent = `R$ ${total.toFixed(2)}`;
}

// Finalizar compra
async function finalizarCompra() {
    if (carrinho.length === 0) {
        mostrarMensagem('Seu carrinho está vazio!', 'erro');
        return;
    }
    
    // Verificar se o usuário está logado
    const token = localStorage.getItem('token');
    if (!token) {
        if (confirm('Você precisa estar logado para finalizar a compra. Deseja fazer login agora?')) {
            window.location.href = 'login.html';
        }
        return;
    }
    
    try {
        const loading = document.getElementById('loading-carrinho');
        loading.style.display = 'block';
        
        // Simular processamento do pedido
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Aqui você pode implementar a integração com um sistema de pagamento
        // Por enquanto, vamos apenas simular sucesso
        
        loading.style.display = 'none';
        
        // Limpar carrinho após compra
        carrinho = [];
        salvarCarrinho();
        exibirCarrinho();
        
        mostrarMensagem('Pedido realizado com sucesso! Obrigado pela sua compra!', 'sucesso');
        
        // Opcional: redirecionar para página de confirmação
        setTimeout(() => {
            alert('Pedido confirmado! Você receberá um email com os detalhes.');
        }, 1000);
        
    } catch (error) {
        console.error('Erro ao finalizar compra:', error);
        document.getElementById('loading-carrinho').style.display = 'none';
        mostrarMensagem('Erro ao processar pedido. Tente novamente.', 'erro');
    }
}

// Mostrar mensagem
function mostrarMensagem(texto, tipo = 'info') {
    const mensagem = document.getElementById('mensagem-carrinho');
    mensagem.textContent = texto;
    mensagem.className = `mensagem ${tipo}`;
    mensagem.style.display = 'block';
    
    // Esconder após 5 segundos
    setTimeout(() => {
        mensagem.style.display = 'none';
    }, 5000);
}

// Utilitário para formatar preço
function formatarPreco(preco) {
    return `R$ ${parseFloat(preco).toFixed(2)}`;
}