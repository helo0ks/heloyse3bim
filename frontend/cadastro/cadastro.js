 document.getElementById('cadastro-form').addEventListener('submit', async function(e) {
    const senha = document.getElementById('senha').value;
    const confirmar = document.getElementById('confirmar-senha').value;
    if (senha !== confirmar) {
      e.preventDefault();
      document.getElementById('mensagem-erro').style.display = 'block';
      document.getElementById('mensagem-erro').textContent = 'As senhas não coincidem.';
      return;
    }
    e.preventDefault();
    // Coletar dados do formulário
    const nome = document.getElementById('nome').value;
    const cpf = document.getElementById('cpf').value;
    const email = document.getElementById('email').value;
    // Enviar para o backend
    try {
      const resp = await fetch('http://localhost:3001/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, cpf, email, senha })
      });
      const data = await resp.json();
      if (data.sucesso) {
        window.location.href = '../login.html';
      } else {
        document.getElementById('mensagem-erro').style.display = 'block';
        document.getElementById('mensagem-erro').textContent = data.mensagem || 'Erro ao cadastrar.';
      }
    } catch (err) {
      document.getElementById('mensagem-erro').style.display = 'block';
      document.getElementById('mensagem-erro').textContent = 'Erro ao conectar ao servidor.';
    }
  });