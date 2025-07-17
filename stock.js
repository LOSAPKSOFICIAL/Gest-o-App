// -------- CONFIG --------
const pontos = ['A', 'B', 'C', 'D'];
const estoqueSection = document.getElementById('estoque');
let categorias = []; // Será carregado do banco

// -------- INTERFACE PRINCIPAL --------
estoqueSection.innerHTML = `
  <h2>Cadastro de Estoque</h2>
  <button id="novo-produto-btn">+ Novo Produto/Categoria</button>
  <div id="categorias-edicao"></div>
  <form id="form-estoque">
    <label>Data: <input type="date" id="estoque-data" required value="${formatDate(new Date())}"></label>
    <div id="produtos-estoque"></div>
    <button type="submit">Salvar Estoque</button>
  </form>
  <div id="estoque-resumo"></div>
`;

// -------- MODAL NOVA CATEGORIA --------
function showNovoProdutoModal() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Novo Produto/Categoria</h3>
      <input type="text" id="nova-categoria-nome" placeholder="Nome da categoria">
      <button id="salvar-nova-categoria">Salvar</button>
      <button id="cancelar-nova-categoria">Cancelar</button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('salvar-nova-categoria').onclick = async () => {
    const nome = document.getElementById('nova-categoria-nome').value.trim();
    if (nome && !categorias.some(c => c.nome === nome)) {
      categorias.push({ nome });
      await salvarCategorias();
      await renderCategoriasEdicao();
      await renderProdutosEstoque();
    }
    modal.remove();
  };
  document.getElementById('cancelar-nova-categoria').onclick = () => modal.remove();
}
document.getElementById('novo-produto-btn').onclick = showNovoProdutoModal;

// -------- EDITAR/REMOVER CATEGORIA --------
async function renderCategoriasEdicao() {
  const div = document.getElementById('categorias-edicao');
  div.innerHTML = '<h4>Categorias/Produtos:</h4><ul>' +
    categorias.map((cat, idx) => `
      <li>
        <input type="text" value="${cat.nome}" data-idx="${idx}" class="edit-nome-cat">
        <button class="del-cat" data-idx="${idx}">🗑️</button>
      </li>
    `).join('') + '</ul>';
  // Editar nome
  div.querySelectorAll('.edit-nome-cat').forEach(input => {
    input.onchange = async function() {
      const idx = +this.dataset.idx;
      categorias[idx].nome = this.value;
      await salvarCategorias();
      await renderProdutosEstoque();
    };
  });
  // Remover categoria
  div.querySelectorAll('.del-cat').forEach(btn => {
    btn.onclick = async function() {
      const idx = +this.dataset.idx;
      categorias.splice(idx, 1);
      await salvarCategorias();
      await renderCategoriasEdicao();
      await renderProdutosEstoque();
    };
  });
}

// -------- INPUTS DE PRODUTOS (ESTOQUE) --------
async function renderProdutosEstoque() {
  let html = '';
  categorias.forEach(cat => {
    html += `
      <div class="categoria-linha" data-cat="${cat.nome}">
        <strong>${cat.nome}</strong>
        ${pontos.map(ponto => `
          <label>${ponto}:
            <input type="number" min="0" step="1" id="qtd-${cat.nome}-${ponto}" placeholder="Quantidade">
            <select id="un-${cat.nome}-${ponto}">
              <option value="unidade">Unidade</option>
              <option value="pacote">Pacote</option>
              <option value="pacote_unidade">Pacote + Unidade</option>
            </select>
            <input type="number" min="0" step="1" id="qtd-extra-${cat.nome}-${ponto}" placeholder="Qtd Unidades (Pacote + Unidade)" style="display:none;">
          </label>
        `).join('')}
      </div>
    `;
  });
  document.getElementById('produtos-estoque').innerHTML = html;
  // Mostra/oculta input extra
  categorias.forEach(cat => {
    pontos.forEach(ponto => {
      document.getElementById(`un-${cat.nome}-${ponto}`).onchange = (e) => {
        const extra = document.getElementById(`qtd-extra-${cat.nome}-${ponto}`);
        extra.style.display = e.target.value === "pacote_unidade" ? "inline" : "none";
      };
    });
  });
}

// -------- SALVAR CATEGORIAS NO BANCO --------
async function salvarCategorias() {
  const user = auth.currentUser;
  if (!user) return;
  await db.collection('categorias').doc(user.uid).set({
    categorias
  });
}

// -------- CARREGAR CATEGORIAS DO BANCO --------
async function carregarCategorias() {
  const user = auth.currentUser;
  if (!user) return;
  const doc = await db.collection('categorias').doc(user.uid).get();
  categorias = doc.exists ? doc.data().categorias : [];
  await renderCategoriasEdicao();
  await renderProdutosEstoque();
}

// -------- SUBMIT DO FORMULÁRIO DE ESTOQUE --------
document.getElementById('form-estoque').onsubmit = async (e) => {
  e.preventDefault();
  const data = document.getElementById('estoque-data').value;
  const produtos = [];
  categorias.forEach(cat => {
    pontos.forEach(ponto => {
      const qtd = parseInt(document.getElementById(`qtd-${cat.nome}-${ponto}`).value) || 0;
      const unidade = document.getElementById(`un-${cat.nome}-${ponto}`).value;
      let extraQtd = 0;
      if (unidade === "pacote_unidade") {
        extraQtd = parseInt(document.getElementById(`qtd-extra-${cat.nome}-${ponto}`).value) || 0;
      }
      if (qtd || extraQtd) {
        produtos.push({
          categoria: cat.nome,
          ponto,
          quantidade: qtd,
          unidade,
          extra: extraQtd
        });
      }
    });
  });
  const user = auth.currentUser;
  if (!user) return alert("Faça login!");
  await db.collection('estoque').add({
    uid: user.uid,
    data,
    produtos
  });
  alert('Salvo!');
  loadEstoque();
};

// -------- RESUMO DO ESTOQUE --------
async function loadEstoque() {
  const user = auth.currentUser;
  if (!user) return;
  const snap = await db.collection('estoque')
    .where('uid', '==', user.uid)
    .orderBy('data', 'desc')
    .limit(16).get();
  const rows = [];
  snap.forEach(doc => rows.push(doc.data()));
  // Soma por categoria e ponto
  let resumo = {};
  categorias.forEach(cat => {
    resumo[cat.nome] = pontos.map(ponto => {
      // Último registro daquele ponto/categoria
      const estoquePonto = rows.find(r => r.produtos.some(prod => prod.categoria === cat.nome && prod.ponto === ponto));
      if (!estoquePonto) return 0;
      const prod = estoquePonto.produtos.find(prod => prod.categoria === cat.nome && prod.ponto === ponto);
      let total = prod.quantidade;
      if (prod.unidade === "pacote_unidade") total += prod.extra;
      return total;
    });
  });
  // Mostra resumo
  let html = '<h3>Resumo Atual de Estoque (por ponto)</h3><table><tr><th>Categoria</th>';
  pontos.forEach(p => html += `<th>${p}</th>`);
  html += '</tr>';
  categorias.forEach(cat => {
    html += `<tr><td>${cat.nome}</td>`;
    resumo[cat.nome].forEach(val => html += `<td>${val}</td>`);
    html += '</tr>';
  });
  html += '</table>';
  document.getElementById('estoque-resumo').innerHTML = html;
}

// -------- INICIALIZAÇÃO --------
auth.onAuthStateChanged(async (user) => {
  if (!user) return;
  await carregarCategorias();
  await loadEstoque();
});

// -------- CSS MODAL --------
const style = document.createElement('style');
style.innerHTML = `
  .modal { position:fixed;top:0;left:0;width:100vw;height:100vh;background:#0006;display:flex;align-items:center;justify-content:center;z-index:9999; }
  .modal-content { background:white;padding:2em;border-radius:8px;min-width:250px; }
`;
document.head.appendChild(style);