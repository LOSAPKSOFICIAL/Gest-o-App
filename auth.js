// Autenticação Firebase básica (pode expandir para 2FA, etc.)
function showLogin() {
  document.body.innerHTML = `
    <div class="login-screen">
      <h2>Login</h2>
      <input type="email" id="login-email" placeholder="Email">
      <input type="password" id="login-pass" placeholder="Senha">
      <button onclick="doLogin()">Entrar</button>
      <div id="login-err"></div>
    </div>
  `;
}
function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value.trim();
  auth.signInWithEmailAndPassword(email, pass)
    .catch(e => document.getElementById('login-err').textContent = e.message);
}
auth.onAuthStateChanged(user => {
  if (!user) showLogin();
  else document.getElementById('user-info').textContent = `Olá, ${user.email}`;
});