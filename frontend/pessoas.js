// Funções CRUD para pessoas (admin)
// Requer autenticação de administrador. Se não autenticado/autoriza, redireciona ao login.
const apiUrl = 'http://localhost:3001/admin-api/pessoas';

function ensureAdmin() {
    const token = localStorage.getItem('token');
    const tipo = localStorage.getItem('tipo');
    if (!token || tipo !== 'admin') {
        alert('Acesso restrito. Faça login como administrador.');
        window.location.href = '../login.html';
        return false;
    }
    return true;
}

window.onload = function() {
    if (!ensureAdmin()) return;
    listarPessoas();
};

document.getElementById('formPessoa').addEventListener('submit', async function(e) {
    e.preventDefault();
    const pessoa = {
        cpf: document.getElementById('cpf').value,
        nome: document.getElementById('nome').value,
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
    const resp = await fetch(apiUrl, {
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
    await fetch(apiUrl, {
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
    await fetch(`${apiUrl}/${pessoa.cpf}`, {
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
    await fetch(`${apiUrl}/${cpf}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
    });
    listarPessoas();
}

async function editarPessoa(cpf) {
    const token = localStorage.getItem('token');
    const resp = await fetch(`${apiUrl}/${cpf}`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const pessoa = await resp.json();
    document.getElementById('cpf').value = pessoa.cpf;
    document.getElementById('nome').value = pessoa.nome;
    document.getElementById('email').value = pessoa.email;
    document.getElementById('tipo').value = pessoa.tipo;
    document.getElementById('senha').value = '';
    document.getElementById('formPessoa').dataset.editando = 'true';
}
