// produtos_pessoas.js - CRUD integrado de produtos e pessoas
// --- PRODUTOS ---
const apiProdutos = 'http://localhost:3001/produtos';
const apiPessoas = 'http://localhost:3001/pessoas';

// Alternância de seções
const btnProdutos = document.getElementById('btnProdutos');
const btnPessoas = document.getElementById('btnPessoas');
const secaoProdutos = document.getElementById('secaoProdutos');
const secaoPessoas = document.getElementById('secaoPessoas');

btnProdutos.onclick = () => {
    secaoProdutos.style.display = '';
    secaoPessoas.style.display = 'none';
    btnProdutos.style.background = '#e573b5';
    btnPessoas.style.background = '#f8bbd0';
};
btnPessoas.onclick = () => {
    secaoProdutos.style.display = 'none';
    secaoPessoas.style.display = '';
    btnProdutos.style.background = '#f8bbd0';
    btnPessoas.style.background = '#e573b5';
};


// --- CRUD PRODUTOS ---
window.onload = function() {
    listarProdutos();
    listarPessoas();
    bloquearCamposProduto(true);
};

function bloquearCamposProduto(bloquear) {
    const campos = ['nome', 'descricao', 'preco', 'imagem', 'estoque'];
    campos.forEach(id => {
        document.getElementById(id).disabled = bloquear;
    });
    document.querySelector('#formProduto button[type="submit"]').disabled = bloquear;
}

// Habilita campo de ID para digitação
document.getElementById('id').disabled = false;

// Buscar por ID
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
            editandoProdutoId = id;
            document.getElementById('formProduto').querySelector('button[type="submit"]').textContent = 'Salvar Alteração';
        } else {
            // Não existe, limpa campos para cadastro
            document.getElementById('formProduto').reset();
            document.getElementById('id').value = id;
            editandoProdutoId = null;
            document.getElementById('formProduto').querySelector('button[type="submit"]').textContent = 'Cadastrar Produto';
        }
        bloquearCamposProduto(false);
    } catch (e) {
        alert('Erro ao buscar produto!');
    }
};


let editandoProdutoId = null;

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
    const token = localStorage.getItem('token');
    if (editandoProdutoId) {
        await fetch(`${apiProdutos}/${editandoProdutoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(produto)
        });
        editandoProdutoId = null;
        this.querySelector('button[type="submit"]').textContent = 'Cadastrar Produto';
    } else {
        await cadastrarProduto(produto);
    }
    this.reset();
    bloquearCamposProduto(true);
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
            <td>${produto.imagem ? `<img src="${produto.imagem}" alt="img" width="50">` : ''}</td>
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

async function deletarProduto(id) {
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
    document.getElementById('nome').value = produto.nome;
    document.getElementById('descricao').value = produto.descricao;
    document.getElementById('preco').value = produto.preco;
    document.getElementById('imagem').value = produto.imagem;
    document.getElementById('estoque').value = produto.estoque;
    editandoProdutoId = id;
    document.getElementById('formProduto').querySelector('button[type="submit"]').textContent = 'Salvar Alteração';
};

async function defaultSubmitProduto(e) {
    e.preventDefault();
    const produto = {
        nome: document.getElementById('nome').value,
        descricao: document.getElementById('descricao').value,
        preco: parseFloat(document.getElementById('preco').value),
        imagem: document.getElementById('imagem').value,
        estoque: parseInt(document.getElementById('estoque').value)
    };
    await cadastrarProduto(produto);
    this.reset();
    listarProdutos();
}


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
