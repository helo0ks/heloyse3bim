// Funções CRUD para produtos (admin)
const apiUrl = 'http://localhost:3001/admin-api/produtos';
const imagemAtualInfo = document.getElementById('imagemAtualInfo');

// Helper para fazer requisições autenticadas via cookie httpOnly
// O token JWT é enviado automaticamente pelo navegador via cookie
async function fetchAuth(url, options = {}) {
    const defaultOptions = {
        credentials: 'include' // Envia cookie httpOnly automaticamente
    };
    
    const response = await fetch(url, { 
        ...options, 
        ...defaultOptions,
        headers: { ...options.headers }
    });
    
    // Se receber 401, redireciona para login
    if (response.status === 401) {
        alert('Sessão expirada. Faça login novamente.');
        window.location.href = 'login.html';
        return null;
    }
    
    return response;
}

function atualizarImagemAtualInfo(path) {
    if (!imagemAtualInfo) return;
    if (path) {
        const baseUrl = path.startsWith('http') ? path : `http://localhost:3001${path}`;
        const urlAbsoluta = `${baseUrl}?t=${Date.now()}`; // cache-buster para evitar imagem antiga
        imagemAtualInfo.innerHTML = `Imagem atual: <a href="${urlAbsoluta}" target="_blank" rel="noopener">abrir em nova aba</a>`;
    } else {
        imagemAtualInfo.textContent = 'Sem imagem carregada';
    }
}

atualizarImagemAtualInfo(null);

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

function ensureAdmin() {
    const isLoggedIn = getCookie('isLoggedIn') === 'true';
    const tipo = getCookie('userType') || localStorage.getItem('tipo');
    if (!isLoggedIn || tipo !== 'admin') {
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
    const arquivo = document.getElementById('imagemArquivo')?.files?.[0] || null;
    const form = new FormData();
    form.append('nome', document.getElementById('nome').value);
    form.append('descricao', document.getElementById('descricao').value);
    form.append('preco', parseFloat(document.getElementById('preco').value));
    form.append('estoque', parseInt(document.getElementById('estoque').value));
    if (arquivo) form.append('imagemArquivo', arquivo);
    await cadastrarProduto(form);
    this.reset();
    atualizarImagemAtualInfo(null);
    listarProdutos();
});

async function listarProdutos() {
    const resp = await fetchAuth(apiUrl);
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
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>${produto.imagem ? `<img src="http://localhost:3001${produto.imagem}?t=${Date.now()}" alt="img" width="50">` : ''}</td>
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
    await fetchAuth(apiUrl, {
        method: 'POST',
        body: formData
    });
}

async function deletarProduto(id) {
    await fetchAuth(`${apiUrl}/${id}`, {
        method: 'DELETE'
    });
    listarProdutos();
}

async function editarProduto(id) {
    const resp = await fetchAuth(`${apiUrl}/${id}`);
    if (!resp) return;
    const produto = await resp.json();
    document.getElementById('nome').value = produto.nome;
    document.getElementById('descricao').value = produto.descricao;
    document.getElementById('preco').value = produto.preco;
    // Removido campo URL
    atualizarImagemAtualInfo(produto.imagem);
    document.getElementById('estoque').value = produto.estoque;
    // Ao submeter, faz PUT ao invés de POST
    document.getElementById('formProduto').onsubmit = async function(e) {
        e.preventDefault();
            const arquivo = document.getElementById('imagemArquivo')?.files?.[0] || null;
            const form = new FormData();
            form.append('nome', document.getElementById('nome').value);
            form.append('descricao', document.getElementById('descricao').value);
            form.append('preco', parseFloat(document.getElementById('preco').value));
            form.append('estoque', parseInt(document.getElementById('estoque').value));
            if (arquivo) form.append('imagemArquivo', arquivo);
            await fetchAuth(`${apiUrl}/${id}`, {
            method: 'PUT',
                body: form
        });
        this.reset();
        atualizarImagemAtualInfo(null);
        this.onsubmit = defaultSubmit;
        listarProdutos();
    };
}

// Fluxo padrão já usa upload via FormData; não há envio por URL
