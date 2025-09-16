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
        // Armazena o token e tipo do usuário
        localStorage.setItem('token', data.token);
        localStorage.setItem('tipo', data.usuario.tipo);
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
