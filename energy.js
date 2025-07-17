const energiaSection = document.getElementById('energia');
energiaSection.innerHTML = `
  <h2>⚡ Medição de Energia</h2>
  <form id="form-energia">
    <label>Data: <input type="date" id="energia-data" required value="${formatDate(new Date())}"></label>
    <label>Consumo (kWh): <input type="number" id="energia-valor" step="0.01" min="0" required></label>
    <button type="submit">Salvar Medição</button>
  </form>
  <div id="energia-list" class="card-list"></div>
  <canvas id="energia-chart" height="120"></canvas>
`;

document.getElementById('form-energia').onsubmit = async (e) => {
  e.preventDefault();
  const data = document.getElementById('energia-data').value;
  const valor = parseFloat(document.getElementById('energia-valor').value);
  const user = auth.currentUser;
  if (!user) return alert("Faça login!");
  await db.collection('energia').add({
    uid: user.uid,
    data,
    valor
  });
  alert('Salvo!');
  loadEnergia();
};

async function loadEnergia() {
  const user = auth.currentUser;
  if (!user) return;
  const snap = await db.collection('energia')
    .where('uid', '==', user.uid)
    .orderBy('data', 'desc')
    .limit(30).get();
  const rows = [];
  snap.forEach(doc => rows.push(doc.data()));

  // Render cards
  const list = document.getElementById('energia-list');
  list.innerHTML = rows.map(d => `
    <div class="card">
      <div class="card-title">${formatDate(d.data)}</div>
      <div class="card-subtitle">Consumo: <b>${d.valor} kWh</b></div>
    </div>
  `).join('');

  // Render gráfico se houver diferença de datas
  if (rows.length > 1) {
    const labels = rows.map(r => r.data).reverse();
    const dataV = rows.map(r => r.valor).reverse();
    if (window.energiaChart) window.energiaChart.destroy();
    window.energiaChart = new Chart(document.getElementById('energia-chart').getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Energia', data: dataV, borderColor: '#e74c3c', fill: false }
        ]
      },
      options: {
        plugins: { legend: { labels: { color: document.body.classList.contains('dark') ? "#e3e3e3" : "#222" }}},
        scales: { x: { ticks: { color: document.body.classList.contains('dark') ? "#e3e3e3" : "#222" } }, y: { ticks: { color: document.body.classList.contains('dark') ? "#e3e3e3" : "#222" } } }
      }
    });
  }
}
auth.onAuthStateChanged(loadEnergia);
