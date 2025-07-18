// stock.js
document.getElementById('form-estoque').onsubmit = async (e) => {
  e.preventDefault();
  const data = document.getElementById('estoque-data').value;
  const quantidade = parseInt(document.getElementById('estoque-quantidade').value);
  const user = auth.currentUser;
  if (!user) return Swal.fire('Erro', 'Faça login!', 'error');
  Swal.fire({ title: 'Salvando...', text: 'Aguarde...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
  await db.collection('estoque').add({ uid: user.uid, data, quantidade });
  Swal.fire('Sucesso', 'Estoque salvo!', 'success').then(() => loadEstoque());
};

async function loadEstoque() {
  const user = auth.currentUser;
  if (!user) return;
  const snap = await db.collection('estoque').where('uid', '==', user.uid).orderBy('data', 'desc').limit(30).get();
  const rows = snap.docs.map(doc => doc.data());
  document.getElementById('estoque-list').innerHTML = rows.map(d => `
    <div class="card"><div class="card-title">${formatDate(new Date(d.data))}</div><div class="card-subtitle">Quantidade: ${d.quantidade}</div></div>
  `).join('');
  if (rows.length > 1) {
    const ctx = document.getElementById('estoque-chart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: rows.map(r => r.data),
        datasets: [{ label: 'Quantidade', data: rows.map(r => r.quantidade), borderColor: '#4a6fa5', fill: false }]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });
  }
}
auth.onAuthStateChanged(loadEstoque);
