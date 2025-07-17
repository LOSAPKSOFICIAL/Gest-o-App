function showLogin() {
  document.getElementById('login-modal').innerHTML = `
    <div class="login-modal-bg">
      <form class="login-card" onsubmit="return false;">
        <h2>Bem-vindo 👋</h2>
        <p style="opacity:.8">Sistema de Gestão - Faça login para continuar</p>
        <input type="email" id="login-email" placeholder="Email" autocomplete="username" required>
        <input type="password" id="login-pass" placeholder="Senha" autocomplete="current-password" required>
        <button id="login-btn">Entrar</button>
        <div id="login-err" style="color:#e74c3c"></div>
      </form>
    </div>
  `;
  document.getElementById('login-btn').onclick = () => doLogin();
}
function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value.trim();
  auth.signInWithEmailAndPassword(email, pass)
    .catch(e => document.getElementById('login-err').textContent = e.message);
}
auth.onAuthStateChanged(user => {
  if (!user) {
    showLogin();
    document.getElementById('logout-btn').style.display = 'none';
    document.getElementById('user-info').textContent = '';
  } else {
    document.getElementById('login-modal').innerHTML = '';
    document.getElementById('user-info').textContent = `Olá, ${user.email}`;
    document.getElementById('logout-btn').style.display = 'inline-block';
  }
});
