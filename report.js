// report.js
document.getElementById('export-report').onclick = async () => {
  const user = auth.currentUser;
  if (!user) return Swal.fire('Erro', 'Faça login!', 'error');
  Swal.fire({ title: 'Gerando...', text: 'Aguarde...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
  const [agua, energia, estoque] = await Promise.all([
    db.collection('agua').where('uid', '==', user.uid).get(),
    db.collection('energia').where('uid', '==', user.uid).get(),
    db.collection('estoque').where('uid', '==', user.uid).get()
  ]);
  const wb = XLSX.utils.book_new();
  const data = [
    ['Relatório Geral - GestãoApp', '', '', `Data: ${new Date().toLocaleString('pt-BR')}`],
    [],
    ['Água'],
    ...agua.docs.map(d => [d.data().data, d.data().pontos.A, d.data().pontos.B]),
    [],
    ['Energia'],
    ...energia.docs.map(d => [d.data().data, d.data().valor]),
    [],
    ['Estoque'],
    ...estoque.docs.map(d => [d.data().data, d.data().quantidade])
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Relatorio_Geral');
  XLSX.writeFile(wb, `relatorio_geral_${new Date().toISOString().split('T')[0]}.xlsx`);
  Swal.fire('Sucesso', 'Relatório gerado!', 'success');
};
