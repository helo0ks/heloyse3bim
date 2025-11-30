// produtos_pessoas.js - CRUD integrado de produtos, pessoas e cargos

// Helper para ler cookie
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
    }
    return null;
}

// Helper para fazer requisições autenticadas via cookie httpOnly
async function fetchAuth(url, options = {}) {
    const response = await fetch(url, { 
        ...options, 
        credentials: 'include' // Envia cookie httpOnly automaticamente
    });
    
    if (response.status === 401) {
        alert('Sessão expirada. Faça login novamente.');
        window.location.href = 'login.html';
        return null;
    }
    
    return response;
}

// Verificação de segurança - apenas admins (usando cookies)
function verificarPermissaoAdmin() {
    const isLoggedIn = getCookie('isLoggedIn') === 'true';
    const tipo = getCookie('userType') || localStorage.getItem('tipo');
    if (!isLoggedIn || tipo !== 'admin') {
        alert('Sessão expirada ou sem permissão. Redirecionando para login...');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// --- APIs (admin) ---
const apiProdutos = 'http://localhost:3001/admin-api/produtos';
const apiPessoas = 'http://localhost:3001/admin-api/pessoas';
const apiCargos = 'http://localhost:3001/admin-api/cargo';
const apiPedidos = 'http://localhost:3001/pedidos';

// Alternância de seções
const crudSelect = document.getElementById('crudSelect');
const secaoProdutos = document.getElementById('secaoProdutos');
const secaoPessoas = document.getElementById('secaoPessoas');
const secaoCargo = document.getElementById('secaoCargo');
const secaoPedidos = document.getElementById('secaoPedidos');
const imagemAtualInfo = document.getElementById('imagemAtualInfo');

function atualizarImagemAtualInfo(path) {
    if (!imagemAtualInfo) return;
    if (path) {
        const baseUrl = path.startsWith('http') ? path : `http://localhost:3001${path}`;
        const urlAbsoluta = `${baseUrl}?t=${Date.now()}`; // cache-buster
        imagemAtualInfo.innerHTML = `Imagem atual: <a href="${urlAbsoluta}" target="_blank" rel="noopener">abrir em nova aba</a>`;
    } else {
        imagemAtualInfo.textContent = 'Sem imagem carregada';
    }
}

atualizarImagemAtualInfo(null);

crudSelect.onchange = () => {
    const selectedValue = crudSelect.value;
    if (selectedValue === 'produtos') {
        secaoProdutos.style.display = '';
        secaoPessoas.style.display = 'none';
        secaoCargo.style.display = 'none';
        secaoPedidos.style.display = 'none';
    } else if (selectedValue === 'relatorios') {
        // Redireciona para a página de relatórios
        window.location.href = 'relatorios.html';
    } else if (selectedValue === 'pessoas') {
        secaoProdutos.style.display = 'none';
        secaoPessoas.style.display = '';
        secaoCargo.style.display = 'none';
        secaoPedidos.style.display = 'none';
    } else if (selectedValue === 'cargo') {
        secaoProdutos.style.display = 'none';
        secaoPessoas.style.display = 'none';
        secaoCargo.style.display = '';
        secaoPedidos.style.display = 'none';
    } else if (selectedValue === 'pedidos') {
        secaoProdutos.style.display = 'none';
        secaoPessoas.style.display = 'none';
        secaoCargo.style.display = 'none';
        secaoPedidos.style.display = '';
    }
};


// --- CRUD PRODUTOS ---
window.onload = function() {
    // Aguardar o authManager carregar antes de fazer as requisições
    setTimeout(() => {
        listarProdutos();
        listarPessoas();
        listarCargos();
        carregarDadosAuxiliaresPedidos();
        listarPedidos();
    }, 100);
    
    // Inicializar o estado do CRUD selector
    const selectedValue = crudSelect.value;
    if (selectedValue === 'produtos') {
        secaoProdutos.style.display = '';
        secaoPessoas.style.display = 'none';
        secaoCargo.style.display = 'none';
        secaoPedidos.style.display = 'none';
    } else if (selectedValue === 'relatorios') {
        window.location.href = 'relatorios.html';
    } else if (selectedValue === 'pessoas') {
        secaoProdutos.style.display = 'none';
        secaoPessoas.style.display = '';
        secaoCargo.style.display = 'none';
        secaoPedidos.style.display = 'none';
    } else if (selectedValue === 'cargo') {
        secaoProdutos.style.display = 'none';
        secaoPessoas.style.display = 'none';
        secaoCargo.style.display = '';
        secaoPedidos.style.display = 'none';
    } else if (selectedValue === 'pedidos') {
        secaoProdutos.style.display = 'none';
        secaoPessoas.style.display = 'none';
        secaoCargo.style.display = 'none';
        secaoPedidos.style.display = '';
    }
};

// Buscar por ID (opcional para verificar se produto existe)
document.getElementById('btnBuscarId').onclick = async function() {
    const id = document.getElementById('id').value;
    if (!id) return alert('Digite um ID para buscar!');
    try {
        const resp = await fetchAuth(`${apiProdutos}/${id}`);
        if (!resp) return;
        if (resp.ok) {
            const produto = await resp.json();
            document.getElementById('nome').value = produto.nome;
            document.getElementById('descricao').value = produto.descricao;
            document.getElementById('preco').value = produto.preco;
            atualizarImagemAtualInfo(produto.imagem);
            document.getElementById('estoque').value = produto.estoque;
            document.getElementById('formProduto').dataset.editando = 'true';
            document.getElementById('msgIdNaoExiste').style.display = 'none';
        } else {
            // Não existe, limpa campos para cadastro
            document.getElementById('formProduto').reset();
            document.getElementById('id').value = id;
            document.getElementById('formProduto').dataset.editando = '';
            document.getElementById('msgIdNaoExiste').style.display = 'inline';
            atualizarImagemAtualInfo(null);
        }
    } catch (e) {
        alert('Erro ao buscar produto!');
    }
};

document.getElementById('formProduto').addEventListener('submit', async function(e) {
    e.preventDefault();
    const arquivo = document.getElementById('imagemArquivo').files[0] || null;
    const form = new FormData();
    form.append('id', parseInt(document.getElementById('id').value));
    form.append('nome', document.getElementById('nome').value);
    form.append('descricao', document.getElementById('descricao').value);
    form.append('preco', parseFloat(document.getElementById('preco').value));
    form.append('estoque', parseInt(document.getElementById('estoque').value));
    if (arquivo) form.append('imagemArquivo', arquivo);
    
    if (this.dataset.editando === 'true') {
        await atualizarProduto(form);
    } else {
        await cadastrarProduto(form);
    }
    
    this.reset();
    this.dataset.editando = '';
    document.getElementById('msgIdNaoExiste').style.display = 'none';
    atualizarImagemAtualInfo(null);
    listarProdutos();
});

async function listarProdutos() {
    const resp = await fetchAuth(apiProdutos);
    if (!resp) return;
    const produtos = await resp.json();
    const tbody = document.querySelector('#tabelaProdutos tbody');
    tbody.innerHTML = '';
    produtos.forEach(produto => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${produto.id}</td>
            <td>${produto.nome}</td>
            <td>${produto.descricao || ''}</td>
            <td>R$ ${(Number(produto.preco) || 0).toFixed(2)}</td>
            <td>${produto.imagem ? `<img src="http://localhost:3001${produto.imagem}?t=${Date.now()}" alt="img" width="50" onerror="this.style.display='none'">` : '<span class="sem-imagem">Sem imagem</span>'}</td>
            <td>${produto.estoque}</td>
            <td>
                <button onclick="editarProduto(${produto.id})">Editar</button>
                <button onclick="deletarProduto(${produto.id})">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function cadastrarProduto(formData) {
    if (!verificarPermissaoAdmin()) return;
    
    await fetchAuth(apiProdutos, {
        method: 'POST',
        body: formData
    });
}

async function atualizarProduto(formData) {
    if (!verificarPermissaoAdmin()) return;
    
    const id = formData.get('id');
    await fetchAuth(`${apiProdutos}/${id}`, {
        method: 'PUT',
        body: formData
    });
}

async function deletarProduto(id) {
    if (!verificarPermissaoAdmin()) return;
    
    await fetchAuth(`${apiProdutos}/${id}`, {
        method: 'DELETE'
    });
    listarProdutos();
}

window.editarProduto = async function(id) {
    const resp = await fetchAuth(`${apiProdutos}/${id}`);
    if (!resp) return;
    const produto = await resp.json();
    document.getElementById('id').value = produto.id;
    document.getElementById('nome').value = produto.nome;
    document.getElementById('descricao').value = produto.descricao;
    document.getElementById('preco').value = produto.preco;
    atualizarImagemAtualInfo(produto.imagem);
    document.getElementById('estoque').value = produto.estoque;
    document.getElementById('formProduto').dataset.editando = 'true';
    document.getElementById('msgIdNaoExiste').style.display = 'none';
};

// --- CRUD PESSOAS ---
document.getElementById('formPessoa').addEventListener('submit', async function(e) {
    e.preventDefault();
    const pessoa = {
        cpf: document.getElementById('cpf').value,
        nome: document.getElementById('nomePessoa').value,
        email: document.getElementById('email').value,
        senha: document.getElementById('senha').value,
        tipo: document.getElementById('tipo').value
    };
    if (this.dataset.editando === 'true') {
        await atualizarPessoa(pessoa);
    } else {
        await cadastrarPessoa(pessoa);
    }
    this.reset();
    this.dataset.editando = '';
    listarPessoas();
});

// Buscar pessoa por CPF
document.getElementById('btnBuscarCpf').onclick = async function() {
    const cpf = document.getElementById('cpf').value;
    if (!cpf) return alert('Digite um CPF para buscar!');
    
    try {
        const resp = await fetchAuth(`${apiPessoas}/${cpf}`);
        if (!resp) return;
        
        if (resp.ok) {
            const pessoa = await resp.json();
            document.getElementById('nomePessoa').value = pessoa.nome;
            document.getElementById('email').value = pessoa.email;
            document.getElementById('tipo').value = pessoa.tipo;
            document.getElementById('senha').value = '';
            document.getElementById('formPessoa').dataset.editando = 'true';
            document.getElementById('msgCpfNaoExiste').style.display = 'none';
        } else {
            document.getElementById('msgCpfNaoExiste').style.display = 'inline';
            // Limpar campos se não encontrou
            document.getElementById('nomePessoa').value = '';
            document.getElementById('email').value = '';
            document.getElementById('tipo').value = 'cliente';
            document.getElementById('senha').value = '';
            document.getElementById('formPessoa').dataset.editando = '';
        }
    } catch (error) {
        console.error('Erro ao buscar pessoa:', error);
        alert('Erro ao buscar pessoa');
    }
};

async function listarPessoas() {
    const resp = await fetchAuth(apiPessoas);
    if (!resp) return;
    const pessoas = await resp.json();
    const tbody = document.querySelector('#tabelaPessoas tbody');
    tbody.innerHTML = '';
    pessoas.forEach(pessoa => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${pessoa.cpf}</td>
            <td>${pessoa.nome}</td>
            <td>${pessoa.email}</td>
            <td>${pessoa.tipo}</td>
            <td>
                <button onclick="editarPessoa('${pessoa.cpf}')">Editar</button>
                <button onclick="deletarPessoa('${pessoa.cpf}')">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function cadastrarPessoa(pessoa) {
    if (!verificarPermissaoAdmin()) return;
    
    await fetchAuth(apiPessoas, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pessoa)
    });
}

async function atualizarPessoa(pessoa) {
    if (!verificarPermissaoAdmin()) return;
    
    await fetchAuth(`${apiPessoas}/${pessoa.cpf}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pessoa)
    });
}

async function deletarPessoa(cpf) {
    if (!verificarPermissaoAdmin()) return;
    
    await fetchAuth(`${apiPessoas}/${cpf}`, {
        method: 'DELETE'
    });
    listarPessoas();
}

window.editarPessoa = async function(cpf) {
    const resp = await fetchAuth(`${apiPessoas}/${cpf}`);
    if (!resp) return;
    const pessoa = await resp.json();
    document.getElementById('cpf').value = pessoa.cpf;
    document.getElementById('nomePessoa').value = pessoa.nome;
    document.getElementById('email').value = pessoa.email;
    document.getElementById('tipo').value = pessoa.tipo;
    document.getElementById('senha').value = '';
    document.getElementById('formPessoa').dataset.editando = 'true';
};

// --- CRUD CARGOS ---

// Listar cargos
async function listarCargos() {
    try {
        const resp = await fetch(apiCargos);
        const cargos = await resp.json();
        const tbody = document.querySelector('#tabelaCargos tbody');
        tbody.innerHTML = '';
        cargos.forEach(cargo => {
            tbody.innerHTML += `
                <tr>
                    <td>${cargo.idcargo}</td>
                    <td>${cargo.nomecargo}</td>
                    <td>
                        <button onclick="editarCargo(${cargo.idcargo})">Editar</button>
                        <button onclick="deletarCargo(${cargo.idcargo})" class="btn-danger">Deletar</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Erro ao listar cargos:', error);
        alert('Erro ao carregar cargos');
    }
}

// Form submit para cargo
document.getElementById('formCargo').onsubmit = async function(e) {
    e.preventDefault();
    
    if (!verificarPermissaoAdmin()) return;
    
    const idCargo = document.getElementById('idCargo').value;
    const nomeCargo = document.getElementById('nomeCargo').value;
    
    const data = { idCargo: parseInt(idCargo), nomeCargo };
    
    try {
        const isEditing = this.dataset.editando === 'true';
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${apiCargos}/${idCargo}` : apiCargos;
        
        const resp = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (resp.ok) {
            alert(isEditing ? 'Cargo atualizado!' : 'Cargo cadastrado!');
            this.reset();
            this.dataset.editando = 'false';
            listarCargos();
        } else {
            const error = await resp.json();
            alert('Erro: ' + error.error);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao salvar cargo');
    }
};

// Buscar cargo por ID
document.getElementById('btnBuscarIdCargo').onclick = async function() {
    const id = document.getElementById('idCargo').value;
    if (!id) return alert('Digite um ID para buscar!');
    
    try {
        const resp = await fetch(`${apiCargos}/${id}`);
        
        if (resp.ok) {
            const cargo = await resp.json();
            document.getElementById('nomeCargo').value = cargo.nomecargo;
            document.getElementById('formCargo').dataset.editando = 'true';
            document.getElementById('msgIdCargoNaoExiste').style.display = 'none';
        } else {
            document.getElementById('msgIdCargoNaoExiste').style.display = 'inline';
            // Limpar campo se não encontrou
            document.getElementById('nomeCargo').value = '';
            document.getElementById('formCargo').dataset.editando = '';
        }
    } catch (error) {
        console.error('Erro ao buscar cargo:', error);
        alert('Erro ao buscar cargo');
    }
};

// Deletar cargo
async function deletarCargo(id) {
    if (!verificarPermissaoAdmin()) return;
    
    if (confirm('Deseja deletar este cargo?')) {
        try {
            const resp = await fetch(`${apiCargos}/${id}`, { method: 'DELETE' });
            if (resp.ok) {
                alert('Cargo deletado!');
                listarCargos();
            } else {
                const error = await resp.json();
                alert('Erro: ' + error.error);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao deletar cargo');
        }
    }
}

// Editar cargo
window.editarCargo = async function(id) {
    try {
        const resp = await fetch(`${apiCargos}/${id}`);
        const cargo = await resp.json();
        document.getElementById('idCargo').value = cargo.idcargo;
        document.getElementById('nomeCargo').value = cargo.nomecargo;
        document.getElementById('formCargo').dataset.editando = 'true';
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao carregar cargo para edição');
    }
};

// --- CRUD PEDIDOS ---

// Variáveis globais para pedidos
let clientesPedidos = [];
let funcionariosPedidos = [];
let produtosPedidos = [];
let formasPagamentoPedidos = [];

// Carregar dados auxiliares para pedidos
async function carregarDadosAuxiliaresPedidos() {
    try {
        // Carregar clientes
        const respClientes = await fetchAuth(`${apiPedidos}/auxiliar/clientes`);
        if (!respClientes) return;
        clientesPedidos = await respClientes.json();

        // Carregar funcionários
        const respFuncionarios = await fetchAuth(`${apiPedidos}/auxiliar/funcionarios`);
        if (!respFuncionarios) return;
        funcionariosPedidos = await respFuncionarios.json();

        // Carregar produtos
        const respProdutos = await fetchAuth(`${apiPedidos}/auxiliar/produtos`);
        if (!respProdutos) return;
        produtosPedidos = await respProdutos.json();

        // Carregar formas de pagamento
        const respFormas = await fetchAuth(`${apiPedidos}/auxiliar/formas-pagamento`);
        if (!respFormas) return;
        formasPagamentoPedidos = await respFormas.json();

        // Preencher dropdowns
        preencherDropdownClientes();
        preencherDropdownFuncionarios();
        preencherDropdownProdutos();
        preencherDropdownFormasPagamento();

    } catch (error) {
        console.error('Erro ao carregar dados auxiliares:', error);
    }
}

function preencherDropdownClientes() {
    const select = document.getElementById('clientePedido');
    select.innerHTML = '<option value="">Selecione um cliente</option>';
    clientesPedidos.forEach(cliente => {
        const option = document.createElement('option');
        option.value = cliente.cpf;
        option.textContent = `${cliente.nome} (${cliente.email})`;
        select.appendChild(option);
    });
}

function preencherDropdownFuncionarios() {
    const select = document.getElementById('funcionarioPedido');
    select.innerHTML = '<option value="">Selecione um funcionário</option>';
    funcionariosPedidos.forEach(funcionario => {
        const option = document.createElement('option');
        option.value = funcionario.cpf;
        option.textContent = `${funcionario.nome} (${funcionario.email})`;
        select.appendChild(option);
    });
}

function preencherDropdownProdutos() {
    const selects = document.querySelectorAll('.produto-select');
    selects.forEach(select => {
        select.innerHTML = '<option value="">Selecione um produto</option>';
        produtosPedidos.forEach(produto => {
            const option = document.createElement('option');
            option.value = produto.id;
            option.textContent = `${produto.nome} - R$ ${parseFloat(produto.preco).toFixed(2)} (Estoque: ${produto.estoque})`;
            option.dataset.preco = produto.preco;
            select.appendChild(option);
        });
    });
}

function preencherDropdownFormasPagamento() {
    const selects = document.querySelectorAll('.forma-pagamento-select');
    selects.forEach(select => {
        select.innerHTML = '<option value="">Selecione uma forma de pagamento</option>';
        formasPagamentoPedidos.forEach(forma => {
            const option = document.createElement('option');
            option.value = forma.idformapagamento;
            option.textContent = forma.nomeformapagamento;
            select.appendChild(option);
        });
    });
}

// Adicionar produto ao pedido
document.getElementById('btnAdicionarProduto').onclick = function() {
    const container = document.getElementById('produtosPedido');
    const div = document.createElement('div');
    div.className = 'produto-item';
    div.innerHTML = `
        <select class="produto-select" name="produto">
            <option value="">Selecione um produto</option>
        </select>
        <input type="number" class="quantidade-input" placeholder="Qtd" min="1" value="1">
        <input type="number" class="preco-input" placeholder="Preço Unit." step="0.01" min="0">
        <input type="number" class="subtotal-input" placeholder="Subtotal" step="0.01" readonly>
        <button type="button" class="btn-remover-produto">Remover</button>
    `;
    container.appendChild(div);
    
    // Preencher dropdown do novo produto
    const novoSelect = div.querySelector('.produto-select');
    produtosPedidos.forEach(produto => {
        const option = document.createElement('option');
        option.value = produto.id;
        option.textContent = `${produto.nome} - R$ ${parseFloat(produto.preco).toFixed(2)} (Estoque: ${produto.estoque})`;
        option.dataset.preco = produto.preco;
        novoSelect.appendChild(option);
    });

    // Evento para preencher preço automaticamente
    novoSelect.onchange = function() {
        const precoInput = div.querySelector('.preco-input');
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption.dataset.preco) {
            precoInput.value = parseFloat(selectedOption.dataset.preco).toFixed(2);
        }
        // Calcular valor total após seleção
        calcularValorTotalPedido();
    };

    // Eventos para calcular total quando quantidade ou preço mudarem
    div.querySelector('.quantidade-input').oninput = calcularValorTotalPedido;
    div.querySelector('.preco-input').oninput = calcularValorTotalPedido;

    // Evento para remover produto
    div.querySelector('.btn-remover-produto').onclick = function() {
        div.remove();
        // Recalcular total após remoção
        calcularValorTotalPedido();
    };
};

// Adicionar forma de pagamento
document.getElementById('btnAdicionarFormaPagamento').onclick = function() {
    const container = document.getElementById('formasPagamento');
    const div = document.createElement('div');
    div.className = 'forma-pagamento-item';
    div.innerHTML = `
        <select class="forma-pagamento-select" name="formaPagamento">
            <option value="">Selecione uma forma de pagamento</option>
        </select>
        <input type="number" class="valor-pago-input" placeholder="Valor Pago" step="0.01" min="0">
        <button type="button" class="btn-remover-forma">Remover</button>
    `;
    container.appendChild(div);
    
    // Preencher dropdown da nova forma de pagamento
    const novoSelect = div.querySelector('.forma-pagamento-select');
    formasPagamentoPedidos.forEach(forma => {
        const option = document.createElement('option');
        option.value = forma.idformapagamento;
        option.textContent = forma.nomeformapagamento;
        novoSelect.appendChild(option);
    });

    // Evento para remover forma de pagamento
    div.querySelector('.btn-remover-forma').onclick = function() {
        div.remove();
        // Redistribuir valores após remoção
        distribuirValorFormasPagamento();
    };
    
    // Distribuir valor total se for a primeira forma de pagamento
    distribuirValorFormasPagamento();
};

// Função para calcular valor total automaticamente
function calcularValorTotalPedido() {
    const produtosItems = document.querySelectorAll('#produtosPedido .produto-item');
    let valorTotal = 0;
    
    produtosItems.forEach(item => {
        const quantidadeInput = item.querySelector('.quantidade-input');
        const precoInput = item.querySelector('.preco-input');
        const subtotalInput = item.querySelector('.subtotal-input');
        
        const quantidade = parseFloat(quantidadeInput.value) || 0;
        const precoUnitario = parseFloat(precoInput.value) || 0;
        const subtotal = quantidade * precoUnitario;
        
        // Atualizar subtotal individual
        if (subtotalInput) {
            subtotalInput.value = subtotal.toFixed(2);
        }
        
        valorTotal += subtotal;
    });
    
    // Atualizar campo de valor total
    const valorTotalInput = document.getElementById('valorTotalPagamento');
    if (valorTotalInput) {
        valorTotalInput.value = valorTotal.toFixed(2);
    }
    
    // Distribuir valor total automaticamente se houver apenas uma forma de pagamento
    distribuirValorFormasPagamento();
    
    return valorTotal;
}

// Função para distribuir valor total nas formas de pagamento
function distribuirValorFormasPagamento() {
    const valorTotal = parseFloat(document.getElementById('valorTotalPagamento').value) || 0;
    const formasItems = document.querySelectorAll('#formasPagamento .forma-pagamento-item');
    
    // Se houver apenas uma forma de pagamento, coloca o valor total nela
    if (formasItems.length === 1 && valorTotal > 0) {
        const valorPagoInput = formasItems[0].querySelector('.valor-pago-input');
        if (valorPagoInput && !valorPagoInput.value) {
            valorPagoInput.value = valorTotal.toFixed(2);
        }
    }
}

// Eventos de produto - preencher preço automaticamente e calcular total
document.addEventListener('change', function(e) {
    if (e.target.classList.contains('produto-select')) {
        const precoInput = e.target.parentElement.querySelector('.preco-input');
        const selectedOption = e.target.options[e.target.selectedIndex];
        if (selectedOption.dataset.preco) {
            precoInput.value = parseFloat(selectedOption.dataset.preco).toFixed(2);
        }
        // Calcular valor total após seleção de produto
        calcularValorTotalPedido();
    }
    
    // Calcular valor total quando quantidade ou preço mudarem
    if (e.target.classList.contains('quantidade-input') || e.target.classList.contains('preco-input')) {
        calcularValorTotalPedido();
    }
});

// Remover produtos e formas de pagamento iniciais
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-remover-produto')) {
        e.target.parentElement.remove();
        // Recalcular total após remoção
        calcularValorTotalPedido();
    }
    if (e.target.classList.contains('btn-remover-forma')) {
        e.target.parentElement.remove();
    }
});

// Buscar pedido por ID
document.getElementById('btnBuscarPedido').onclick = async function() {
    const id = document.getElementById('idPedido').value;
    if (!id) return alert('Digite um ID para buscar!');
    
    try {
        const resp = await fetchAuth(`${apiPedidos}/${id}`);
        if (!resp) return;
        
        if (resp.ok) {
            const pedido = await resp.json();
            
            // Preencher campos básicos
            document.getElementById('dataDoPedido').value = pedido.datadopedido;
            document.getElementById('clientePedido').value = pedido.clientepessoacpfpessoa;
            document.getElementById('funcionarioPedido').value = pedido.funcionariopessoacpfpessoa;
            document.getElementById('valorTotalPagamento').value = pedido.valortotal || '';
            
            // Limpar produtos e formas de pagamento
            document.getElementById('produtosPedido').innerHTML = '';
            document.getElementById('formasPagamento').innerHTML = '';
            
            // Preencher produtos
            if (pedido.produtos && pedido.produtos.length > 0) {
                pedido.produtos.forEach(produto => {
                    document.getElementById('btnAdicionarProduto').click();
                    const ultimoItem = document.querySelector('#produtosPedido .produto-item:last-child');
                    ultimoItem.querySelector('.produto-select').value = produto.produtoidproduto;
                    ultimoItem.querySelector('.quantidade-input').value = produto.quantidade;
                    ultimoItem.querySelector('.preco-input').value = parseFloat(produto.precounitario).toFixed(2);
                });
            }
            
            // Preencher formas de pagamento
            if (pedido.formaspagamento && pedido.formaspagamento.length > 0) {
                pedido.formaspagamento.forEach(forma => {
                    document.getElementById('btnAdicionarFormaPagamento').click();
                    const ultimoItem = document.querySelector('#formasPagamento .forma-pagamento-item:last-child');
                    ultimoItem.querySelector('.forma-pagamento-select').value = forma.idformapagamento;
                    ultimoItem.querySelector('.valor-pago-input').value = parseFloat(forma.valorpago).toFixed(2);
                });
            }
            
            document.getElementById('formPedido').dataset.editando = 'true';
            document.getElementById('msgPedidoNaoExiste').style.display = 'none';
        } else {
            // Não existe, limpa campos para cadastro
            document.getElementById('formPedido').reset();
            document.getElementById('idPedido').value = id;
            document.getElementById('formPedido').dataset.editando = '';
            document.getElementById('msgPedidoNaoExiste').style.display = 'inline';
            
            // Limpar produtos e formas de pagamento
            document.getElementById('produtosPedido').innerHTML = `
                <div class="produto-item">
                    <select class="produto-select" name="produto">
                        <option value="">Selecione um produto</option>
                    </select>
                    <input type="number" class="quantidade-input" placeholder="Qtd" min="1" value="1">
                    <input type="number" class="preco-input" placeholder="Preço Unit." step="0.01" min="0">
                    <input type="number" class="subtotal-input" placeholder="Subtotal" step="0.01" readonly>
                    <button type="button" class="btn-remover-produto">Remover</button>
                </div>
            `;
            document.getElementById('formasPagamento').innerHTML = `
                <div class="forma-pagamento-item">
                    <select class="forma-pagamento-select" name="formaPagamento">
                        <option value="">Selecione uma forma de pagamento</option>
                    </select>
                    <input type="number" class="valor-pago-input" placeholder="Valor Pago" step="0.01" min="0">
                    <button type="button" class="btn-remover-forma">Remover</button>
                </div>
            `;
            preencherDropdownProdutos();
            preencherDropdownFormasPagamento();
        }
    } catch (e) {
        alert('Erro ao buscar pedido!');
    }
};

// Form de pedido
document.getElementById('formPedido').onsubmit = async function(e) {
    e.preventDefault();
    
    // Coletar produtos
    const produtosItems = document.querySelectorAll('#produtosPedido .produto-item');
    const produtos = [];
    produtosItems.forEach(item => {
        const produtoId = item.querySelector('.produto-select').value;
        const quantidade = item.querySelector('.quantidade-input').value;
        const precoUnitario = item.querySelector('.preco-input').value;
        
        if (produtoId && quantidade && precoUnitario) {
            produtos.push({
                ProdutoIdProduto: parseInt(produtoId),
                quantidade: parseInt(quantidade),
                precoUnitario: parseFloat(precoUnitario)
            });
        }
    });
    
    // Coletar formas de pagamento
    const formasItems = document.querySelectorAll('#formasPagamento .forma-pagamento-item');
    const formasPagamento = [];
    formasItems.forEach(item => {
        const formaId = item.querySelector('.forma-pagamento-select').value;
        const valorPago = item.querySelector('.valor-pago-input').value;
        
        if (formaId && valorPago) {
            formasPagamento.push({
                FormaPagamentoIdFormaPagamento: parseInt(formaId),
                valorPago: parseFloat(valorPago)
            });
        }
    });
    
    const pedido = {
        dataDoPedido: document.getElementById('dataDoPedido').value,
        ClientePessoaCpfPessoa: document.getElementById('clientePedido').value,
        FuncionarioPessoaCpfPessoa: document.getElementById('funcionarioPedido').value,
        produtos: produtos,
        valorTotalPagamento: parseFloat(document.getElementById('valorTotalPagamento').value) || 0,
        formasPagamento: formasPagamento
    };
    
    if (this.dataset.editando === 'true') {
        pedido.idPedido = parseInt(document.getElementById('idPedido').value);
        await atualizarPedido(pedido);
    } else {
        await cadastrarPedido(pedido);
    }
    
    this.reset();
    this.dataset.editando = '';
    document.getElementById('msgPedidoNaoExiste').style.display = 'none';
    listarPedidos();
};

async function listarPedidos() {
    try {
        console.log('=== CARREGANDO PEDIDOS ===');
        
        const resp = await fetchAuth(apiPedidos);
        if (!resp) return;
        
        console.log('Status da resposta:', resp.status);
        
        if (!resp.ok) {
            throw new Error(`Erro HTTP: ${resp.status}`);
        }
        
        const pedidos = await resp.json();
        console.log('Pedidos recebidos:', pedidos.length);
        console.log('Primeiro pedido:', pedidos[0]);
        
        const tbody = document.querySelector('#tabelaPedidos tbody');
        if (!tbody) {
            console.error('Elemento tbody não encontrado!');
            return;
        }
        
        tbody.innerHTML = '';
        
        if (pedidos.length === 0) {
            console.log('Nenhum pedido encontrado');
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="7">Nenhum pedido encontrado</td>';
            tbody.appendChild(tr);
            return;
        }
        
        pedidos.forEach(pedido => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${pedido.idpedido}</td>
                <td>${new Date(pedido.datadopedido).toLocaleDateString('pt-BR')}</td>
                <td>${pedido.nomecliente || 'N/A'}</td>
                <td>${pedido.nomefuncionario || 'N/A'}</td>
                <td>R$ ${(parseFloat(pedido.valortotal) || 0).toFixed(2)}</td>
                <td>${pedido.datapagamento ? new Date(pedido.datapagamento).toLocaleDateString('pt-BR') : 'Não pago'}</td>
                <td>
                    <button onclick="editarPedido(${pedido.idpedido})">Editar</button>
                    <button onclick="deletarPedido(${pedido.idpedido})">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        const tbody = document.querySelector('#tabelaPedidos tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7">Erro ao carregar pedidos</td></tr>';
        }
    }
}

async function cadastrarPedido(pedido) {
    if (!verificarPermissaoAdmin()) return;
    
    await fetchAuth(apiPedidos, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido)
    });
}

async function atualizarPedido(pedido) {
    if (!verificarPermissaoAdmin()) return;
    
    await fetchAuth(`${apiPedidos}/${pedido.idPedido}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido)
    });
}

window.deletarPedido = async function(id) {
    if (!verificarPermissaoAdmin()) return;
    
    if (confirm('Tem certeza que deseja excluir este pedido?')) {
        try {
            const resp = await fetchAuth(`${apiPedidos}/${id}`, {
                method: 'DELETE'
            });
            if (!resp) return;
            
            if (resp.ok) {
                alert('Pedido excluído com sucesso!');
                listarPedidos();
            } else {
                alert('Erro ao excluir pedido');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao excluir pedido');
        }
    }
};

window.editarPedido = async function(id) {
    document.getElementById('idPedido').value = id;
    document.getElementById('btnBuscarPedido').click();
};
