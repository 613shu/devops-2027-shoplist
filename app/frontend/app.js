const API = '/api';

const COLORS = {
  Produce: '#16a34a', Dairy: '#0ea5e9', Bakery: '#d97706',
  Pantry: '#9333ea', Household: '#db2777', Other: '#64748b'
};

let products = [];
let filter = 'all';

const $ = id => document.getElementById(id);
const money = n => `$${Number(n).toFixed(2)}`;
// Product names come from users, so never put them into HTML as is
const escape = s => String(s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

async function loadCategories() {
  let categories = Object.keys(COLORS);
  try {
    const response = await fetch(`${API}/categories`);
    if (response.ok) categories = await response.json();
  } catch (err) { /* keep the default list */ }
  $('category').innerHTML = categories
    .map(c => `<option value="${escape(c)}">${escape(c)}</option>`).join('');
}

async function loadProducts() {
  try {
    const response = await fetch(`${API}/products`);
    if (!response.ok) throw new Error(`backend returned ${response.status}`);
    products = await response.json();
    render();
  } catch (err) {
    products = [];
    render();
    $('empty').textContent = 'Backend unavailable. Check docker compose ps and docker compose logs backend.';
  }
  loadStats();
}

function visibleProducts() {
  const text = $('search').value.trim().toLowerCase();
  const list = products.filter(p =>
    (filter === 'all' || (filter === 'bought') === p.bought) &&
    p.name.toLowerCase().includes(text));
  const sorters = {
    new: (a, b) => b.id - a.id,
    name: (a, b) => a.name.localeCompare(b.name),
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    category: (a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
  };
  // Items still to buy first, bought ones at the bottom
  return list.sort((a, b) => (a.bought - b.bought) || sorters[$('sort').value](a, b));
}

function render() {
  const list = visibleProducts();
  $('product-list').innerHTML = list.map(p => {
    const color = COLORS[p.category] || COLORS.Other;
    return `<li class="${p.bought ? 'done' : ''}">
      <input type="checkbox" ${p.bought ? 'checked' : ''} onchange="toggleBought(${p.id}, this.checked)" aria-label="Bought">
      <div class="info">
        <div class="name">${escape(p.name)}</div>
        <div class="meta"><span class="chip" style="background:${color}1a;color:${color}">${escape(p.category)}</span>${p.quantity} × ${money(p.price)}</div>
      </div>
      <span class="cost">${money(p.price * p.quantity)}</span>
      <button class="delete" onclick="deleteProduct(${p.id})" aria-label="Delete">✕</button>
    </li>`;
  }).join('');
  $('empty').hidden = list.length > 0;
  $('empty').textContent = products.length ? 'No products match.' : 'Nothing here yet. Add your first product above.';

  const done = products.filter(p => p.bought).length;
  $('progress-text').textContent = `${done} of ${products.length} bought`;
  $('progress-bar').style.width = products.length ? `${(done / products.length) * 100}%` : '0';
}

// Stats come from a different service (Node.js). If it is down,
// the product list keeps working — that is the point of separate services.
async function loadStats() {
  const text = $('stats-text');
  try {
    const response = await fetch(`${API}/stats`);
    if (!response.ok) throw new Error(`stats returned ${response.status}`);
    const s = await response.json();
    text.textContent = '';
    $('stats-cards').innerHTML = [
      ['Items', `${s.bought ?? 0} / ${s.count}`],
      ['Total', money(s.total)],
      ['Left to spend', money(s.leftToSpend ?? s.total)],
      ['Most expensive', s.mostExpensive ? escape(s.mostExpensive.name) : '—']
    ].map(([label, value]) => `<div class="stat"><div class="label">${label}</div><div class="value">${value}</div></div>`).join('');
    const top = Math.max(1, ...(s.byCategory || []).map(c => c.total));
    $('stats-categories').innerHTML = (s.byCategory || []).map(c => {
      const color = COLORS[c.category] || COLORS.Other;
      return `<div class="bar"><span>${escape(c.category)}</span>
        <div class="track"><div class="fill" style="width:${(c.total / top) * 100}%;background:${color}"></div></div>
        <span class="amount">${money(c.total)}</span></div>`;
    }).join('');
  } catch (err) {
    text.textContent = 'Stats service unavailable — the product list still works.';
    $('stats-cards').innerHTML = '';
    $('stats-categories').innerHTML = '';
  }
}

// Status bar: is each service answering?
async function checkStatus() {
  const set = (id, up) => { $(id).className = `pill ${up ? 'up' : 'down'}`; };
  try {
    set('status-backend', (await fetch(`${API}/health`)).ok);
  } catch (err) { set('status-backend', false); }
  try {
    const r = await fetch(`${API}/stats`);
    // 502 from stats itself (JSON) means stats is up but the backend is not
    const body = r.ok ? null : await r.json().catch(() => null);
    set('status-stats', r.ok || (body && body.error === 'backend unavailable'));
  } catch (err) { set('status-stats', false); }
}

async function toggleBought(id, bought) {
  await fetch(`${API}/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bought })
  });
  loadProducts();
}

async function deleteProduct(id) {
  await fetch(`${API}/products/${id}`, { method: 'DELETE' });
  loadProducts();
}

$('add-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    name: $('name').value.trim(),
    price: parseFloat($('price').value),
    quantity: parseInt($('quantity').value, 10) || 1,
    category: $('category').value
  };
  const response = await fetch(`${API}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const error = $('form-error');
  if (!response.ok) {
    error.textContent = `Could not add the product (${response.status}). Check docker compose logs backend.`;
    error.hidden = false;
    return;
  }
  error.hidden = true;
  const category = $('category').value;
  e.target.reset();
  $('category').value = category;
  loadProducts();
});

$('search').addEventListener('input', render);
$('sort').addEventListener('change', render);
$('filter').addEventListener('click', (e) => {
  if (!e.target.dataset.filter) return;
  filter = e.target.dataset.filter;
  document.querySelectorAll('#filter button').forEach(b => b.classList.toggle('active', b === e.target));
  render();
});

loadCategories();
loadProducts();
checkStatus();
setInterval(checkStatus, 10000);
