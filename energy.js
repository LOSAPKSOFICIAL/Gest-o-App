// energy.js
document.getElementById('form-energia').onsubmit = async (e) => {
  e.preventDefault();
  const data = document.getElementById('energia-data').value;
  const valor = parseFloat(document.getElementById('energia-valor').value);
  const user = auth.currentUser;
  if (!user) return Swal.fire('Erro', 'Faça login!', 'error');
  Swal.fire({ title: 'Salvando...', text: 'Aguarde...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
  await db.collection('energia').add({ uid: user.uid, data, valor });
  Swal.fire('Sucesso', 'Medição salva!', 'success').then(() => loadEnergia());
};

async function loadEnergia() {
  const user = auth.currentUser;
  if (!user) return;
  const snap = await db.collection('energia').where('uid', '==', user.uid).orderBy('data', 'desc').limit(30).get();
  const rows = snap.docs.map(doc => doc.data());
  document.getElementById('energia-list').innerHTML = rows.map(d => `
    <div class="card"><div class="card-title">${formatDate(new Date(d.data))}</div><div class="card-subtitle">Consumo: ${d.valor} kWh</div></div>
  `).join('');
  if (rows.length > 1) {
    const ctx = document.getElementById('energia-chart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: rows.map(r => r.data),
        datasets: [{ label: 'Consumo', data: rows.map(r => r.valor), borderColor: '#4a6fa5', fill: false }]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });
  }
}
auth.onAuthStateChanged(loadEnergia);
