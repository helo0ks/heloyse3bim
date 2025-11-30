// Funções CRUD para pessoas (admin)
// Requer autenticação de administrador. Se não autenticado/autoriza, redireciona ao login.
const apiUrl = 'http://localhost:3001/admin-api/pessoas';

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
        credentials: 'include'
    });
    
    if (response.status === 401) {
        alert('Sessão expirada. Faça login novamente.');
        window.location.href = '../login.html';
        return null;
    }
    
    return response;
}

function ensureAdmin() {
    const isLoggedIn = getCookie('isLoggedIn') === 'true';
    const tipo = getCookie('userType') || localStorage.getItem('tipo');
    if (!isLoggedIn || tipo !== 'admin') {
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
    const resp = await fetchAuth(apiUrl);
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
    await fetchAuth(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pessoa)
    });
}

async function atualizarPessoa(pessoa) {
    await fetchAuth(`${apiUrl}/${pessoa.cpf}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pessoa)
    });
}

async function deletarPessoa(cpf) {
    await fetchAuth(`${apiUrl}/${cpf}`, {
        method: 'DELETE'
    });
    listarPessoas();
}

async function editarPessoa(cpf) {
    const resp = await fetchAuth(`${apiUrl}/${cpf}`);
    if (!resp) return;
    const pessoa = await resp.json();
    document.getElementById('cpf').value = pessoa.cpf;
    document.getElementById('nome').value = pessoa.nome;
    document.getElementById('email').value = pessoa.email;
    document.getElementById('tipo').value = pessoa.tipo;
    document.getElementById('senha').value = '';
    document.getElementById('formPessoa').dataset.editando = 'true';
}
