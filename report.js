const relatorioSection = document.getElementById('relatorio');
relatorioSection.innerHTML = `
  <h2>📊 Relatórios</h2>
  <button onclick="gerarRelatorioXLSX()" class="accent-btn">Gerar XLSX (últimos 6 meses)</button>
  <div id="rel-resultado"></div>
`;

async function gerarRelatorioXLSX() {
  const user = auth.currentUser;
  if (!user) return alert("Faça login!");
  const since = new Date();
  since.setMonth(since.getMonth() - 6);
  const snap = await db.collection('agua')
    .where('uid', '==', user.uid)
    .where('data', '>=', formatDate(since))
    .orderBy('data').get();
  const dados = [];
  snap.forEach(doc => {
    const d = doc.data();
    dados.push({ data: d.data, 'Ponto A': d.pontos.A, 'Ponto B': d.pontos.B });
  });
  if (dados.length === 0) return alert("Sem dados!");
  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Medição Água");
  XLSX.writeFile(wb, "relatorio_agua.xlsx");
  document.getElementById('rel-resultado').textContent = "Relatório gerado!";
}
