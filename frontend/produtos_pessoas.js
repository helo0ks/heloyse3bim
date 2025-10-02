// produtos_pessoas.js - CRUD integrado de produtos, pessoas e cargos

// Verificação de segurança - apenas admins
function verificarPermissaoAdmin() {
    if (!window.authManager || !window.authManager.isLoggedIn()) {
        alert('Sessão expirada. Redirecionando para login...');
        window.location.href = 'login.html';
        return false;
    }
    
    const userInfo = window.authManager.getUserInfo();
    if (userInfo.type !== 'admin') {
        alert('Acesso negado! Apenas administradores podem gerenciar os dados.');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// --- APIs ---
const apiProdutos = 'http://localhost:3001/produtos';
const apiPessoas = 'http://localhost:3001/pessoas';
const apiCargos = 'http://localhost:3001/cargo';

// Alternância de seções
const crudSelect = document.getElementById('crudSelect');
const secaoProdutos = document.getElementById('secaoProdutos');
const secaoPessoas = document.getElementById('secaoPessoas');
const secaoCargo = document.getElementById('secaoCargo');

crudSelect.onchange = () => {
    const selectedValue = crudSelect.value;
    if (selectedValue === 'produtos') {
        secaoProdutos.style.display = '';
        secaoPessoas.style.display = 'none';
        secaoCargo.style.display = 'none';
    } else if (selectedValue === 'pessoas') {
        secaoProdutos.style.display = 'none';
        secaoPessoas.style.display = '';
        secaoCargo.style.display = 'none';
    } else if (selectedValue === 'cargo') {
        secaoProdutos.style.display = 'none';
        secaoPessoas.style.display = 'none';
        secaoCargo.style.display = '';
    }
};


// --- CRUD PRODUTOS ---
window.onload = function() {
    listarProdutos();
    listarPessoas();
    listarCargos();
    
    // Inicializar o estado do CRUD selector
    const selectedValue = crudSelect.value;
    if (selectedValue === 'produtos') {
        secaoProdutos.style.display = '';
        secaoPessoas.style.display = 'none';
        secaoCargo.style.display = 'none';
    } else if (selectedValue === 'pessoas') {
        secaoProdutos.style.display = 'none';
        secaoPessoas.style.display = '';
        secaoCargo.style.display = 'none';
    } else if (selectedValue === 'cargo') {
        secaoProdutos.style.display = 'none';
        secaoPessoas.style.display = 'none';
        secaoCargo.style.display = '';
    }
};

// Buscar por ID (opcional para verificar se produto existe)
document.getElementById('btnBuscarId').onclick = async function() {
    const id = document.getElementById('id').value;
    if (!id) return alert('Digite um ID para buscar!');
    const token = localStorage.getItem('token');
    try {
        const resp = await fetch(`${apiProdutos}/${id}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (resp.ok) {
            const produto = await resp.json();
            document.getElementById('nome').value = produto.nome;
            document.getElementById('descricao').value = produto.descricao;
            document.getElementById('preco').value = produto.preco;
            document.getElementById('imagem').value = produto.imagem;
            document.getElementById('estoque').value = produto.estoque;
            document.getElementById('formProduto').dataset.editando = 'true';
            document.getElementById('msgIdNaoExiste').style.display = 'none';
        } else {
            // Não existe, limpa campos para cadastro
            document.getElementById('formProduto').reset();
            document.getElementById('id').value = id;
            document.getElementById('formProduto').dataset.editando = '';
            document.getElementById('msgIdNaoExiste').style.display = 'inline';
        }
    } catch (e) {
        alert('Erro ao buscar produto!');
    }
};

document.getElementById('formProduto').addEventListener('submit', async function(e) {
    e.preventDefault();
    const produto = {
        id: parseInt(document.getElementById('id').value),
        nome: document.getElementById('nome').value,
        descricao: document.getElementById('descricao').value,
        preco: parseFloat(document.getElementById('preco').value),
        imagem: document.getElementById('imagem').value,
        estoque: parseInt(document.getElementById('estoque').value)
    };
    
    if (this.dataset.editando === 'true') {
        await atualizarProduto(produto);
    } else {
        await cadastrarProduto(produto);
    }
    
    this.reset();
    this.dataset.editando = '';
    document.getElementById('msgIdNaoExiste').style.display = 'none';
    listarProdutos();
});

async function listarProdutos() {
    const token = localStorage.getItem('token');
    const resp = await fetch(apiProdutos, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
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
            <td>${produto.imagem && produto.imagem.trim() && produto.imagem !== '' ? `<img src="${produto.imagem.startsWith('img/') ? 'http://localhost:3001/' + produto.imagem : produto.imagem}" alt="img" width="50" onerror="this.style.display='none'">` : '<span class="sem-imagem">Sem imagem</span>'}</td>
            <td>${produto.estoque}</td>
            <td>
                <button onclick="editarProduto(${produto.id})">Editar</button>
                <button onclick="deletarProduto(${produto.id})">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function cadastrarProduto(produto) {
    if (!verificarPermissaoAdmin()) return;
    
    const token = localStorage.getItem('token');
    await fetch(apiProdutos, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(produto)
    });
}

async function atualizarProduto(produto) {
    if (!verificarPermissaoAdmin()) return;
    
    const token = localStorage.getItem('token');
    await fetch(`${apiProdutos}/${produto.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(produto)
    });
}

async function deletarProduto(id) {
    if (!verificarPermissaoAdmin()) return;
    
    const token = localStorage.getItem('token');
    await fetch(`${apiProdutos}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
    });
    listarProdutos();
}

window.editarProduto = async function(id) {
    const token = localStorage.getItem('token');
    const resp = await fetch(`${apiProdutos}/${id}`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const produto = await resp.json();
    document.getElementById('id').value = produto.id;
    document.getElementById('nome').value = produto.nome;
    document.getElementById('descricao').value = produto.descricao;
    document.getElementById('preco').value = produto.preco;
    document.getElementById('imagem').value = produto.imagem;
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
        const token = localStorage.getItem('token');
        const resp = await fetch(`${apiPessoas}/${cpf}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        
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
    const token = localStorage.getItem('token');
    const resp = await fetch(apiPessoas, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
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
    
    const token = localStorage.getItem('token');
    await fetch(apiPessoas, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(pessoa)
    });
}

async function atualizarPessoa(pessoa) {
    if (!verificarPermissaoAdmin()) return;
    
    const token = localStorage.getItem('token');
    await fetch(`${apiPessoas}/${pessoa.cpf}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(pessoa)
    });
}

async function deletarPessoa(cpf) {
    if (!verificarPermissaoAdmin()) return;
    
    const token = localStorage.getItem('token');
    await fetch(`${apiPessoas}/${cpf}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
    });
    listarPessoas();
}

window.editarPessoa = async function(cpf) {
    const token = localStorage.getItem('token');
    const resp = await fetch(`${apiPessoas}/${cpf}`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
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
