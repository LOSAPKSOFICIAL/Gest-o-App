document.getElementById('form-agua').onsubmit = async (e) => {
  e.preventDefault();
  const data = document.getElementById('agua-data').value;
  const pontoA = parseFloat(document.getElementById('agua-a').value);
  const pontoB = parseFloat(document.getElementById('agua-b').value);
  const user = auth.currentUser;
  if (!user) return Swal.fire('Erro', 'Faça login!', 'error');
  Swal.fire({ title: 'Salvando...', text: 'Aguarde...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
  await db.collection('agua').add({ uid: user.uid, data, pontos: { A: pontoA, B: pontoB } });
  Swal.fire('Sucesso', 'Medição salva!', 'success').then(() => loadAgua());
};

async function loadAgua() {
  const user = auth.currentUser;
  if (!user) return;
  const snap = await db.collection('agua').where('uid', '==', user.uid).orderBy('data', 'desc').limit(30).get();
  const rows = snap.docs.map(doc => doc.data());
  document.getElementById('agua-list').innerHTML = rows.map(d => `
    <div class="card"><div class="card-title">${formatDate(new Date(d.data))}</div><div class="card-subtitle">A: ${d.pontos.A} m³ | B: ${d.pontos.B} m³</div></div>
  `).join('');
  if (rows.length > 1) {
    const ctx = document.getElementById('agua-chart').getContext('2d');
    new Chart(ctx, { type: 'line', data: { labels: rows.map(r => r.data), datasets: [{ label: 'Ponto A', data: rows.map(r => r.pontos.A), borderColor: '#4a6fa5' }, { label: 'Ponto B', data: rows.map(r => r.pontos.B), borderColor: '#2ecc71' }] }, options: { responsive: true } });
  }
}
auth.onAuthStateChanged(loadAgua);
