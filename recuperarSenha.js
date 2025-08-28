// recuperarSenha.js
// Lógica para recuperação de senha via e-mail e token

document.addEventListener('DOMContentLoaded', function() {
  const forgotLink = document.getElementById('esqueceu-senha');
  if (forgotLink) {
    forgotLink.addEventListener('click', function(e) {
      e.preventDefault();
      const email = document.getElementById('email').value;
      if (!email) {
        alert('Por favor, preencha o campo de e-mail para recuperar a senha.');
        return;
      }
      // Aqui você pode fazer uma chamada para a API de recuperação de senha
      // Exemplo:
      fetch('/api/recuperar-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      .then(res => res.json())
      .then(data => {
        if (data.sucesso) {
          alert('Um link para redefinir sua senha foi enviado para seu e-mail.');
        } else {
          alert('E-mail não encontrado ou erro ao enviar o link.');
        }
      })
      .catch(() => {
        alert('Erro ao tentar recuperar a senha.');
      });
    });
  }
});
