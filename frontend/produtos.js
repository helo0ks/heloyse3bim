// Funções CRUD para produtos (admin)
const apiUrl = 'http://localhost:3001/admin-api/produtos';

function ensureAdmin() {
    const token = localStorage.getItem('token');
    const tipo = localStorage.getItem('tipo');
    if (!token || tipo !== 'admin') {
        alert('Acesso restrito. Faça login como administrador.');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Carregar produtos ao abrir a página
window.onload = function() { if (ensureAdmin()) listarProdutos(); };

document.getElementById('formProduto').addEventListener('submit', async function(e) {
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
});

async function listarProdutos() {
    const token = localStorage.getItem('token');
    const resp = await fetch(apiUrl, {
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
            <td>R$ ${produto.preco.toFixed(2)}</td>
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
    await fetch(apiUrl, {
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
    await fetch(`${apiUrl}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
    });
    listarProdutos();
}

async function editarProduto(id) {
    const token = localStorage.getItem('token');
    const resp = await fetch(`${apiUrl}/${id}`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const produto = await resp.json();
    document.getElementById('nome').value = produto.nome;
    document.getElementById('descricao').value = produto.descricao;
    document.getElementById('preco').value = produto.preco;
    document.getElementById('imagem').value = produto.imagem;
    document.getElementById('estoque').value = produto.estoque;
    // Ao submeter, faz PUT ao invés de POST
    document.getElementById('formProduto').onsubmit = async function(e) {
        e.preventDefault();
        const produtoAtualizado = {
            nome: document.getElementById('nome').value,
            descricao: document.getElementById('descricao').value,
            preco: parseFloat(document.getElementById('preco').value),
            imagem: document.getElementById('imagem').value,
            estoque: parseInt(document.getElementById('estoque').value)
        };
        await fetch(`${apiUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(produtoAtualizado)
        });
        this.reset();
        this.onsubmit = defaultSubmit;
        listarProdutos();
    };
}

// Função padrão para submit
async function defaultSubmit(e) {
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
document.getElementById('formProduto').onsubmit = defaultSubmit;
