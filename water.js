const aguaSection = document.getElementById('agua');
aguaSection.innerHTML = `
  <h2>💧 Medição de Água</h2>
  <form id="form-agua">
    <label>Data: <input type="date" id="agua-data" required value="${formatDate(new Date())}"></label>
    <label>Ponto A (m³): <input type="number" id="agua-a" step="0.01" min="0" required></label>
    <label>Ponto B (m³): <input type="number" id="agua-b" step="0.01" min="0" required></label>
    <button type="submit">Salvar Medição</button>
  </form>
  <div id="agua-list" class="card-list"></div>
  <canvas id="agua-chart" height="120"></canvas>
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
  const rows = [];
  snap.forEach(doc => rows.push(doc.data()));

  // Render cards
  const list = document.getElementById('agua-list');
  list.innerHTML = rows.map(d => `
    <div class="card">
      <div class="card-title">${formatDate(d.data)}</div>
      <div class="card-subtitle">Ponto A: <b>${d.pontos.A} m³</b> | Ponto B: <b>${d.pontos.B} m³</b></div>
    </div>
  `).join('');

  // Render gráfico SEMANAL se houver diferença de datas
  if (rows.length > 1) {
    const labels = rows.map(r => r.data).reverse();
    const dataA = rows.map(r => r.pontos.A).reverse();
    const dataB = rows.map(r => r.pontos.B).reverse();
    if (window.aguaChart) window.aguaChart.destroy();
    window.aguaChart = new Chart(document.getElementById('agua-chart').getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Ponto A', data: dataA, borderColor: '#2196f3', fill: false },
          { label: 'Ponto B', data: dataB, borderColor: '#44d3a6', fill: false }
        ]
      },
      options: {
        plugins: { legend: { labels: { color: document.body.classList.contains('dark') ? "#e3e3e3" : "#222" }}},
        scales: { x: { ticks: { color: document.body.classList.contains('dark') ? "#e3e3e3" : "#222" } }, y: { ticks: { color: document.body.classList.contains('dark') ? "#e3e3e3" : "#222" } } }
      }
    });
  }
}
auth.onAuthStateChanged(loadAgua);
