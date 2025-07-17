// Lógica da Medição de Energia (um ponto por data)
const energiaSection = document.getElementById('energia');
energiaSection.innerHTML = `
  <h2>Medição de Energia</h2>
  <form id="form-energia">
    <label>Data: <input type="date" id="energia-data" required value="${formatDate(new Date())}"></label><br>
    <label>Consumo (kWh): <input type="number" id="energia-valor" step="0.01" min="0" required></label><br>
    <button type="submit">Salvar Medição</button>
  </form>
  <div id="energia-list"></div>
  <canvas id="energia-chart" height="100"></canvas>
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
  const list = document.getElementById('energia-list');
  let html = '<h3>Últimas medições</h3><ul>';
  const rows = [];
  snap.forEach(doc => {
    const d = doc.data();
    rows.push(d);
    html += `<li>${d.data}: ${d.valor} kWh</li>`;
  });
  html += '</ul>';
  list.innerHTML = html;
  drawEnergiaChart(rows.reverse());
}
async function drawEnergiaChart(rows) {
  if (!window.Chart) return;
  const ctx = document.getElementById('energia-chart').getContext('2d');
  if (window.energiaChart) window.energiaChart.destroy();
  window.energiaChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: rows.map(r => r.data),
      datasets: [
        { label: 'Energia', data: rows.map(r => r.valor), borderColor: 'orange', fill: false }
      ]
    }
  });
}
auth.onAuthStateChanged(loadEnergia);