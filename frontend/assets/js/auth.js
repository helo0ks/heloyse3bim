// auth.js - Sistema de autenticação e gerenciamento de menu
class AuthManager {
    constructor() {
        this.init();
    }

    // Inicializa o sistema de autenticação
    init() {
        this.updateNavigation();
        this.setupEventListeners();
    }

    // Funções para gerenciar cookies
    setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    }

    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    deleteCookie(name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }

    // Verifica se o usuário está logado
    isLoggedIn() {
        return this.getCookie('isLoggedIn') === 'true' && this.getCookie('authToken');
    }

    // Pega informações do usuário
    getUserInfo() {
        if (!this.isLoggedIn()) return null;
        
        return {
            token: this.getCookie('authToken'),
            type: this.getCookie('userType'),
            name: this.getCookie('userName'),
            cpf: this.getCookie('userCpf')
        };
    }

    // Faz logout
    logout() {
        // Remove cookies
        this.deleteCookie('authToken');
        this.deleteCookie('userType');
        this.deleteCookie('userName');
        this.deleteCookie('userCpf');
        this.deleteCookie('isLoggedIn');
        
        // Remove localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('tipo');
        
        // Limpar carrinho
        localStorage.removeItem('carrinho');
        
        // Se a função de limpeza do carrinho estiver disponível, chamá-la
        if (typeof window.limparCarrinhoSilencioso === 'function') {
            window.limparCarrinhoSilencioso();
        }
        
        // Redireciona para a página inicial
        window.location.href = 'index.html';
    }

    // Atualiza a navegação baseada no status de login
    updateNavigation() {
        const nav = document.querySelector('header nav');
        if (!nav) return;

        if (this.isLoggedIn()) {
            const userInfo = this.getUserInfo();
            nav.innerHTML = this.getLoggedInNavigation(userInfo);
        } else {
            nav.innerHTML = this.getLoggedOutNavigation();
        }
    }

    // HTML da navegação para usuários logados
    getLoggedInNavigation(userInfo) {
        const isAdmin = userInfo.type === 'admin';
        // Origem do painel admin. Por enquanto usa localhost:3001. Em produção, pode ser separado.
        const ADMIN_ORIGIN = 'http://localhost:3001';
        return `
            <span class="user-welcome">Olá, ${userInfo.name}!</span>
            <a href="index.html">Início</a>
            ${isAdmin ? `<a href="${ADMIN_ORIGIN}/produtos.html" class="admin-link">Gerenciar</a>` : ''}
            <a href="carrinho.html" id="nav-carrinho">Carrinho</a>
            <a href="#" id="logout-btn" class="logout-btn">Sair</a>
        `;
    }

    // HTML da navegação para usuários não logados
    getLoggedOutNavigation() {
        return `
            <a href="index.html">Início</a>
            <a href="login.html">Entrar</a>
            <a href="cadastro/cadastro.html">Cadastrar</a>
            <a href="carrinho.html" id="nav-carrinho">Carrinho</a>
        `;
    }

    // Configura event listeners
    setupEventListeners() {
        // Event listener para o botão de logout
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'logout-btn') {
                e.preventDefault();
                if (confirm('Tem certeza que deseja sair?\n\nSeu carrinho será limpo ao fazer logout.')) {
                    this.logout();
                }
            }
        });

        // Atualiza contador do carrinho se existir
        this.updateCartCounter();
    }

    // Atualiza contador do carrinho
    updateCartCounter() {
        const navCarrinho = document.getElementById('nav-carrinho');
        if (navCarrinho) {
            const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
            const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
            
            if (totalItens > 0) {
                navCarrinho.textContent = `Carrinho (${totalItens})`;
            } else {
                navCarrinho.textContent = 'Carrinho';
            }
        }
    }

    // Protege páginas que requerem login
    requireLogin() {
        if (!this.isLoggedIn()) {
            alert('Você precisa fazer login para acessar esta página.');
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // Protege páginas de admin
    requireAdmin() {
        if (!this.isLoggedIn()) {
            alert('Você precisa fazer login como administrador para acessar esta página.');
            window.location.href = 'login.html';
            return false;
        }

        const userInfo = this.getUserInfo();
        if (userInfo.type !== 'admin') {
            alert('Acesso negado!\n\nApenas administradores podem acessar o gerenciamento dos CRUDs.\n\nVocê está logado como: ' + (userInfo.type || 'cliente'));
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }

    // Redireciona usuários já logados das páginas de login/cadastro
    redirectIfLoggedIn() {
        if (this.isLoggedIn()) {
            const userInfo = this.getUserInfo();
            const ADMIN_ORIGIN = 'http://localhost:3001';
            if (userInfo.type === 'admin') {
                window.location.href = `${ADMIN_ORIGIN}/produtos.html`;
            } else {
                window.location.href = 'index.html';
            }
        }
    }
}

// Instancia o gerenciador de autenticação quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    window.authManager = new AuthManager();
});

// Função global para fazer logout (compatibilidade)
function logout() {
    if (window.authManager) {
        window.authManager.logout();
    }
}