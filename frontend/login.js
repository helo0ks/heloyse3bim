// login.js - Lógica de login e redirecionamento por tipo de usuário
const apiUrl = 'http://localhost:3001/auth/login';

document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const mensagemErro = document.getElementById('mensagem-erro');
    mensagemErro.style.display = 'none';

    try {
        const resp = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        const data = await resp.json();
        if (!resp.ok) {
            mensagemErro.textContent = data.message || 'Erro ao fazer login';
            mensagemErro.style.display = 'block';
            return;
        }
        // Armazena o token e dados do usuário em localStorage e cookies
        localStorage.setItem('token', data.token);
        localStorage.setItem('tipo', data.usuario.tipo);
        
        // Salva informações em cookies que duram 7 dias
        setCookie('authToken', data.token, 7);
        setCookie('userType', data.usuario.tipo, 7);
        setCookie('userName', data.usuario.nome || data.usuario.email, 7);
        setCookie('userCpf', data.usuario.cpf, 7);
        setCookie('isLoggedIn', 'true', 7);
        
        // Redireciona conforme o tipo
        if (data.usuario.tipo === 'admin') {
            window.location.href = 'produtos.html';
        } else {
            window.location.href = 'index.html'; // ou página do cliente
        }
    } catch (err) {
        mensagemErro.textContent = 'Erro de conexão com o servidor';
        mensagemErro.style.display = 'block';
    }
});

// Funções para gerenciar cookies
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
