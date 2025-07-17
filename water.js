// Lógica da Medição de Água (dois pontos por data)
const aguaSection = document.getElementById('agua');
aguaSection.innerHTML = `
  <h2>Medição de Água</h2>
  <form id="form-agua">
    <label>Data: <input type="date" id="agua-data" required value="${formatDate(new Date())}"></label><br>
    <label>Ponto A (m³): <input type="number" id="agua-a" step="0.01" min="0" required></label><br>
    <label>Ponto B (m³): <input type="number" id="agua-b" step="0.01" min="0" required></label><br>
    <button type="submit">Salvar Medição</button>
  </form>
  <div id="agua-list"></div>
  <canvas id="agua-chart" height="100"></canvas>
`;

document.getElementById('form-agua').onsubmit = async (e) => {
  e.preventDefault();
  const data = document.getElementById('agua-data').value;
  const pontoA = parseFloat(document.getElementById('agua-a').value);
  const pontoB = parseFloat(document.getElementById('agua-b').value);
  const user = auth.currentUser;
  if (!user) return alert("Faça login!");
  await db.collection('agua').add({
    uid: user.uid,
    data,
    pontos: { A: pontoA, B: pontoB }
  });
  alert('Salvo!');
  loadAgua();
};

async function loadAgua() {
  const user = auth.currentUser;
  if (!user) return;
  const snap = await db.collection('agua')
    .where('uid', '==', user.uid)
    .orderBy('data', 'desc')
    .limit(30).get();
  const list = document.getElementById('agua-list');
  let html = '<h3>Últimas medições</h3><ul>';
  const rows = [];
  snap.forEach(doc => {
    const d = doc.data();
    rows.push(d);
    html += `<li>${d.data}: A=${d.pontos.A} m³, B=${d.pontos.B} m³</li>`;
  });
  html += '</ul>';
  list.innerHTML = html;
  drawAguaChart(rows.reverse());
}
async function drawAguaChart(rows) {
  if (!window.Chart) return;
  const ctx = document.getElementById('agua-chart').getContext('2d');
  if (window.aguaChart) window.aguaChart.destroy();
  window.aguaChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: rows.map(r => r.data),
      datasets: [
        { label: 'Ponto A', data: rows.map(r => r.pontos.A), borderColor: 'blue', fill: false },
        { label: 'Ponto B', data: rows.map(r => r.pontos.B), borderColor: 'green', fill: false }
      ]
    }
  });
}
auth.onAuthStateChanged(loadAgua);