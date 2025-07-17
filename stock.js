const pontos = ['ESTOQUE A', 'ESTOQUE B', 'ESTOQUE C', 'ESTOQUE D'];
const estoqueSection = document.getElementById('estoque');
let categorias = [];
estoqueSection.innerHTML = `
  <h2>📦 Cadastro de Estoque</h2>
  <button id="novo-produto-btn" class="accent-btn">+ Novo Produto/Categoria</button>
  <div id="categorias-edicao"></div>
  <form id="form-estoque">
    <label>Data: <input type="date" id="estoque-data" required value="${formatDate(new Date())}"></label>
    <div id="produtos-estoque"></div>
    <button type="submit">Salvar Estoque</button>
  </form>
  <div id="estoque-list" class="card-list"></div>
  <canvas id="estoque-chart" height="120"></canvas>
`;

function showNovoProdutoModal() {
  const modal = document.createElement('div');
  modal.className = 'login-modal-bg';
  modal.innerHTML = `
    <form class="login-card" onsubmit="return false;">
      <h3>Nova Categoria/Produto</h3>
      <input type="text" id="nova-categoria-nome" placeholder="Nome da categoria" required>
      <button id="salvar-nova-categoria">Salvar</button>
      <button id="cancelar-nova-categoria" type="button" style="background:var(--danger);">Cancelar</button>
    </form>
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

async function renderCategoriasEdicao() {
  const div = document.getElementById('categorias-edicao');
  div.innerHTML = '<h4>Categorias/Produtos:</h4><ul>' +
    categorias.map((cat, idx) => `
      <li>
        <input type="text" value="${cat.nome}" data-idx="${idx}" class="edit-nome-cat">
        <button class="del-cat" data-idx="${idx}">🗑️</button>
      </li>
    `).join('') + '</ul>';
  div.querySelectorAll('.edit-nome-cat').forEach(input => {
    input.onchange = async function() {
      const idx = +this.dataset.idx;
      categorias[idx].nome = this.value;
      await salvarCategorias();
      await renderProdutosEstoque();
    };
  });
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

async function renderProdutosEstoque() {
  let html = '';
  categorias.forEach(cat => {
    html += `
      <div class="categoria-linha" data-cat="${cat.nome}">
        <strong>${cat.nome}</strong>
        ${pontos.map(ponto => `
          <label>${ponto}:
            <input type="number" min="0" step="1" id="qtd-${cat.nome}-${ponto}" placeholder="Qtd">
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
  categorias.forEach(cat => {
    pontos.forEach(ponto => {
      document.getElementById(`un-${cat.nome}-${ponto}`).onchange = (e) => {
        const extra = document.getElementById(`qtd-extra-${cat.nome}-${ponto}`);
        extra.style.display = e.target.value === "pacote_unidade" ? "inline" : "none";
      };
    });
  });
}

async function salvarCategorias() {
  const user = auth.currentUser;
  if (!user) return;
  await db.collection('categorias').doc(user.uid).set({
    categorias
  });
}

async function carregarCategorias() {
  const user = auth.currentUser;
  if (!user) return;
  const doc = await db.collection('categorias').doc(user.uid).get();
  categorias = doc.exists ? doc.data().categorias : [];
  await renderCategoriasEdicao();
  await renderProdutosEstoque();
}

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

async function loadEstoque() {
  const user = auth.currentUser;
  if (!user) return;
  const snap = await db.collection('estoque')
    .where('uid', '==', user.uid)
    .orderBy('data', 'desc')
    .limit(30).get();
  const rows = [];
  snap.forEach(doc => rows.push(doc.data()));

  // Render cards
  const list = document.getElementById('estoque-list');
  list.innerHTML = rows.map(d => `
    <div class="card">
      <div class="card-title">${formatDate(d.data)}</div>
      <div>
        ${d.produtos.map(p => `
          <div style="margin-bottom:4px;">
            <span class="card-subtitle">${p.categoria} ${p.ponto}:</span>
            <b>${p.quantidade + (p.unidade === "pacote_unidade" ? " + " + p.extra : "")}</b> ${p.unidade}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  // Render gráfico total por categoria/ponto (exemplo: quantidade total por data)
  if (rows.length > 1 && categorias.length > 0) {
    const labels = rows.map(r => r.data).reverse();
    const datasets = categorias.map(cat => ({
      label: cat.nome,
      data: labels.map(date =>
        rows.find(r => r.data === date)?.produtos
          .filter(p => p.categoria === cat.nome)
          .reduce((sum, p) => sum + p.quantidade + (p.unidade === "pacote_unidade" ? p.extra : 0), 0) || 0
      ),
      borderColor: '#' + Math.floor(Math.random()*16777215).toString(16), fill:false
    }));
    if (window.estoqueChart) window.estoqueChart.destroy();
    window.estoqueChart = new Chart(document.getElementById('estoque-chart').getContext('2d'), {
      type: 'line',
      data: { labels, datasets },
      options: {
        plugins: { legend: { labels: { color: document.body.classList.contains('dark') ? "#e3e3e3" : "#222" }}},
        scales: { x: { ticks: { color: document.body.classList.contains('dark') ? "#e3e3e3" : "#222" } }, y: { ticks: { color: document.body.classList.contains('dark') ? "#e3e3e3" : "#222" } } }
      }
    });
  }
}

auth.onAuthStateChanged(async (user) => {
  if (!user) return;
  await carregarCategorias();
  await loadEstoque();
});
