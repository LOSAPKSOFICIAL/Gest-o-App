// auth.js
function showLogin() {
  document.getElementById('login-modal').innerHTML = `
    <div class="login-modal-bg">
      <form class="login-card" onsubmit="event.preventDefault(); doLogin();">
        <h2>Bem-vindo 👋</h2>
        <p style="opacity: 0.8;">Sistema de Gestão - Faça login para continuar</p>
        <input type="email" id="login-email" placeholder="Email" autocomplete="username" required>
        <input type="password" id="login-pass" placeholder="Senha" autocomplete="current-password" required>
        <button id="login-btn" type="submit">Entrar</button>
        <div id="login-err" style="color: var(--danger); font-size: 0.9em; margin-top: 0.5em;"></div>
      </form>
    </div>
  `;
}

function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value.trim();
  const loginBtn = document.getElementById('login-btn');
  const errorDiv = document.getElementById('login-err');

  // Validação básica no front-end
  if (!email || !pass) {
    errorDiv.textContent = 'Por favor, preencha email e senha.';
    return;
  }

  // Mostra o alerta de carregamento
  Swal.fire({
    title: 'Carregando...',
    text: 'Buscando informações, aguarde.',
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  // Desativa o botão durante o login
  loginBtn.disabled = true;
  loginBtn.textContent = 'Entrando...';

  auth.signInWithEmailAndPassword(email, pass)
    .then(() => {
      // Fecha o alerta de carregamento
      Swal.close();
      // Opcional: Mostra alerta de sucesso
      Swal.fire({
        icon: 'success',
        title: 'Login bem-sucedido!',
        text: 'Bem-vindo ao Sistema de Gestão!',
        showConfirmButton: false,
        timer: 1500
      });
      errorDiv.textContent = '';
    })
    .catch(error => {
      // Fecha o alerta de carregamento
      Swal.close();
      // Traduz e exibe mensagens de erro amigáveis
      let errorMessage;
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Email inválido. Verifique o formato.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Usuário não encontrado.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Senha incorreta.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
          break;
        default:
          errorMessage = 'Erro ao fazer login: ' + error.message;
      }
      errorDiv.textContent = errorMessage;
    })
    .finally(() => {
      // Reativa o botão
      loginBtn.disabled = false;
      loginBtn.textContent = 'Entrar';
    });
}

// Monitora mudanças no estado de autenticação
auth.onAuthStateChanged(user => {
  if (!user) {
    showLogin();
    document.getElementById('logout-btn').style.display = 'none';
    document.getElementById('user-info').textContent = '';
  } else {
    document.getElementById('login-modal').innerHTML = '';
    document.getElementById('user-info').textContent = `Olá, ${user.email.split('@')[0]}`;
    document.getElementById('logout-btn').style.display = 'inline-block';
  }
});
