let cart = [];
let currentCategory = 'all';
let currentSort = 'default';
let searchQuery = '';

// ── RENDER ──
function renderProducts(list) {
  const grid = document.getElementById('productsGrid');
  const noResults = document.getElementById('noResults');
  if (!list.length) {
    grid.innerHTML = '';
    noResults.style.display = 'block';
    return;
  }
  noResults.style.display = 'none';
  grid.innerHTML = list.map(p => {
    const totalStock = Object.values(p.availability).reduce((a, b) => a + b, 0);
    const stockStatus = totalStock === 0 ? 'out' : totalStock <= 5 ? 'low' : 'in';
    const stockLabel = totalStock === 0 ? 'Out of Stock' : totalStock <= 5 ? `Only ${totalStock} left` : 'In Stock';
    const stockClass = stockStatus === 'out' ? 'stock-out' : stockStatus === 'low' ? 'stock-low' : 'stock-in';
    return `
    <div class="product-card ${stockStatus === 'out' ? 'sold-out' : ''}" data-id="${p.id}">
      ${p.badge ? `<span class="product-badge badge-${p.badge.toLowerCase().replace(/\s/g,'-')}">${p.badge}</span>` : ''}
      <div class="product-thumb" onclick="openModal(${p.id})">
        <div class="product-emoji">${p.emoji}</div>
        <div class="product-brand-logo">${p.brand}</div>
      </div>
      <div class="product-info">
        <div class="product-meta">
          <span class="product-brand">${p.brand}</span>
          <span class="product-category-tag">${p.category}</span>
        </div>
        <h3 class="product-name" onclick="openModal(${p.id})">${p.name}</h3>
        <div class="product-colors">
          ${p.colors.map(c => `<span class="color-chip">${c}</span>`).join('')}
        </div>
        <div class="product-sizes-preview">
          <span class="sizes-label">Sizes:</span>
          ${p.sizes.slice(0, 5).map(s => {
            const qty = p.availability[s] || 0;
            return `<span class="size-chip ${qty === 0 ? 'size-oos' : ''}" title="${qty === 0 ? 'Out of stock' : qty + ' left'}">${s}</span>`;
          }).join('')}
          ${p.sizes.length > 5 ? `<span class="size-more">+${p.sizes.length - 5}</span>` : ''}
        </div>
        <div class="product-footer">
          <span class="product-price">$${p.price}</span>
          <div class="product-actions">
            <span class="stock-badge ${stockClass}">${stockLabel}</span>
            <button class="btn-add-cart ${stockStatus === 'out' ? 'disabled' : ''}"
              onclick="${stockStatus !== 'out' ? `quickAdd(${p.id})` : ''}"
              ${stockStatus === 'out' ? 'disabled' : ''}>
              ${stockStatus === 'out' ? 'Sold Out' : '+ Add'}
            </button>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');
}

function getFilteredProducts() {
  let list = [...products];
  if (currentCategory !== 'all') list = list.filter(p => p.category === currentCategory);
  if (searchQuery) list = list.filter(p =>
    p.name.toLowerCase().includes(searchQuery) ||
    p.brand.toLowerCase().includes(searchQuery) ||
    p.category.toLowerCase().includes(searchQuery)
  );
  if (currentSort === 'price-asc') list.sort((a, b) => a.price - b.price);
  else if (currentSort === 'price-desc') list.sort((a, b) => b.price - a.price);
  else if (currentSort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
}

function filterByCategory(cat) {
  currentCategory = cat;
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(t => {
    if ((cat === 'all' && t.textContent === 'All') || t.textContent === cat) t.classList.add('active');
  });
  renderProducts(getFilteredProducts());
  if (cat !== 'all') {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
  }
}

function filterProducts() {
  searchQuery = document.getElementById('searchInput').value.toLowerCase();
  renderProducts(getFilteredProducts());
}

function sortProducts(val) {
  currentSort = val;
  renderProducts(getFilteredProducts());
}

// ── MODAL ──
function openModal(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const modal = document.getElementById('productModal');
  const inner = document.getElementById('modalInner');
  inner.innerHTML = `
    <div class="modal-left">
      <div class="modal-thumb">
        <div class="modal-emoji">${p.emoji}</div>
        <div class="modal-brand-bg">${p.brand}</div>
      </div>
      ${p.badge ? `<span class="product-badge badge-${p.badge.toLowerCase().replace(/\s/g,'-')}">${p.badge}</span>` : ''}
    </div>
    <div class="modal-right">
      <p class="modal-brand">${p.brand}</p>
      <h2 class="modal-name">${p.name}</h2>
      <p class="modal-desc">${p.description}</p>
      <div class="modal-price">$${p.price}</div>

      <div class="modal-section">
        <label class="modal-label">Color</label>
        <div class="modal-colors" id="modalColors">
          ${p.colors.map((c, i) => `<button class="modal-color-btn ${i === 0 ? 'active' : ''}" onclick="selectColor(this)">${c}</button>`).join('')}
        </div>
      </div>

      <div class="modal-section">
        <label class="modal-label">Size <span id="selectedSizeLabel"></span></label>
        <div class="modal-sizes" id="modalSizes">
          ${p.sizes.map(s => {
            const qty = p.availability[s] || 0;
            return `<button class="modal-size-btn ${qty === 0 ? 'oos' : ''}"
              data-size="${s}" data-qty="${qty}"
              onclick="${qty > 0 ? 'selectSize(this)' : ''}"
              ${qty === 0 ? 'disabled' : ''}>
              ${s}
              <span class="qty-tip">${qty === 0 ? '✗' : qty <= 3 ? `${qty} left` : '✓'}</span>
            </button>`;
          }).join('')}
        </div>
      </div>

      <div class="modal-section">
        <label class="modal-label">Availability</label>
        <div class="size-availability-table">
          ${p.sizes.map(s => {
            const qty = p.availability[s] || 0;
            return `<div class="avail-row ${qty === 0 ? 'avail-out' : qty <= 3 ? 'avail-low' : 'avail-good'}">
              <span>${s}</span>
              <div class="avail-bar"><div class="avail-fill" style="width:${Math.min(qty * 10, 100)}%"></div></div>
              <span>${qty === 0 ? 'Out of Stock' : qty <= 3 ? `${qty} left` : `${qty} in stock`}</span>
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn-modal-cart" onclick="addToCartFromModal(${p.id})">Add to Cart</button>
        <button class="btn-modal-whatsapp" onclick="whatsappProduct(${p.id})">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
          Order via WhatsApp
        </button>
      </div>
    </div>
  `;
  modal.classList.add('active');
  document.getElementById('modalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('productModal').classList.remove('active');
  document.getElementById('modalOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

function selectSize(btn) {
  document.querySelectorAll('.modal-size-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  document.getElementById('selectedSizeLabel').textContent = `— ${btn.dataset.size}`;
}

function selectColor(btn) {
  document.querySelectorAll('.modal-color-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// ── CART ──
function quickAdd(id) {
  const p = products.find(x => x.id === id);
  const defaultSize = p.sizes.find(s => (p.availability[s] || 0) > 0);
  if (!defaultSize) return;
  addToCart(id, defaultSize, p.colors[0]);
  showToast(`${p.name} added to cart!`);
}

function addToCartFromModal(id) {
  const selectedSizeBtn = document.querySelector('.modal-size-btn.selected');
  const selectedColorBtn = document.querySelector('.modal-color-btn.active');
  if (!selectedSizeBtn) { showToast('Please select a size', 'error'); return; }
  const size = selectedSizeBtn.dataset.size;
  const color = selectedColorBtn ? selectedColorBtn.textContent : '';
  addToCart(id, size, color);
  closeModal();
  openCart();
}

function addToCart(id, size, color) {
  const p = products.find(x => x.id === id);
  const key = `${id}-${size}-${color}`;
  const existing = cart.find(i => i.key === key);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ key, id, name: p.name, brand: p.brand, price: p.price, size, color, qty: 1, emoji: p.emoji });
  }
  updateCartUI();
}

function removeFromCart(key) {
  cart = cart.filter(i => i.key !== key);
  updateCartUI();
}

function updateCartUI() {
  const count = cart.reduce((a, i) => a + i.qty, 0);
  document.getElementById('cartCount').textContent = count;
  const itemsEl = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  if (!cart.length) {
    itemsEl.innerHTML = `<div class="cart-empty"><span>🛒</span><p>Your cart is empty</p></div>`;
    footer.style.display = 'none';
    return;
  }
  footer.style.display = 'block';
  const total = cart.reduce((a, i) => a + i.price * i.qty, 0);
  document.getElementById('cartTotal').textContent = `$${total}`;
  itemsEl.innerHTML = cart.map(i => `
    <div class="cart-item">
      <div class="cart-item-emoji">${i.emoji}</div>
      <div class="cart-item-info">
        <span class="cart-item-name">${i.name}</span>
        <span class="cart-item-meta">${i.color} · Size ${i.size}</span>
        <span class="cart-item-price">$${i.price} × ${i.qty}</span>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${i.key}')">✕</button>
    </div>
  `).join('');
}

function openCart() {
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

function whatsappOrder() {
  const lines = cart.map(i => `• ${i.name} (${i.color}, Size ${i.size}) x${i.qty} — $${i.price * i.qty}`).join('\n');
  const total = cart.reduce((a, i) => a + i.price * i.qty, 0);
  const msg = encodeURIComponent(`Hi Shoo Sports! I'd like to order:\n\n${lines}\n\nTotal: $${total}\n\nPlease confirm availability and delivery details. Thank you!`);
  window.open(`https://wa.me/96176123456?text=${msg}`, '_blank');
}

function whatsappProduct(id) {
  const p = products.find(x => x.id === id);
  const selectedSizeBtn = document.querySelector('.modal-size-btn.selected');
  const size = selectedSizeBtn ? selectedSizeBtn.dataset.size : 'TBD';
  const msg = encodeURIComponent(`Hi Shoo Sports! I'm interested in:\n\n• ${p.name} — Size ${size} — $${p.price}\n\nIs it available? Thank you!`);
  window.open(`https://wa.me/96176123456?text=${msg}`, '_blank');
}

// ── TOAST ──
function showToast(msg, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2500);
}

// ── NAVBAR ──
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 50) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
});

function toggleSearch() {
  const bar = document.getElementById('searchBar');
  bar.classList.toggle('active');
  if (bar.classList.contains('active')) document.getElementById('searchInput').focus();
}

function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  renderProducts(products);
});
