let cart = [];
let currentCategory = 'all';
let currentSort = 'default';
let searchQuery = '';

// ── SVG PRODUCT VISUALS ──
function getProductSVG(p) {
  const gradId = `g${p.id}`;
  const colors = getBrandColors(p);
  const svgs = {
    'Shoes': `<svg viewBox="0 0 220 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="110" cy="92" rx="88" ry="9" fill="rgba(0,0,0,0.2)"/>
      <path d="M18 72 C18 72 30 46 58 40 L95 34 L132 30 C155 28 170 34 180 44 C186 52 186 60 178 67 C172 71 158 74 140 75 L24 76 C19 76 16 74 18 72Z" fill="url(#${gradId}a)"/>
      <path d="M58 40 L65 20 C67 14 75 13 80 17 L98 34" fill="url(#${gradId}b)"/>
      <path d="M120 52 L168 48" stroke="rgba(255,255,255,0.25)" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M24 76 L140 75" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
      <defs>
        <linearGradient id="${gradId}a" x1="18" y1="28" x2="186" y2="76" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="${colors[0]}"/><stop offset="100%" stop-color="${colors[1]}"/>
        </linearGradient>
        <linearGradient id="${gradId}b" x1="58" y1="13" x2="98" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="${colors[2]}"/><stop offset="100%" stop-color="${colors[0]}"/>
        </linearGradient>
      </defs>
    </svg>`,
    'T-Shirts': `<svg viewBox="0 0 200 175" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M58 28 C58 28 48 18 36 18 L8 38 C6 40 6 44 8 46 L26 58 L26 155 C26 158 28 160 31 160 L169 160 C172 160 174 158 174 155 L174 58 L192 46 C194 44 194 40 192 38 L164 18 C152 18 142 28 142 28 C132 42 68 42 58 28Z" fill="url(#${gradId}a)"/>
      <path d="M58 28 C68 42 132 42 142 28" stroke="rgba(255,255,255,0.25)" stroke-width="2"/>
      <path d="M80 95 L120 95" stroke="rgba(255,255,255,0.15)" stroke-width="10" stroke-linecap="round"/>
      <defs>
        <linearGradient id="${gradId}a" x1="8" y1="18" x2="194" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="${colors[0]}"/><stop offset="100%" stop-color="${colors[1]}"/>
        </linearGradient>
      </defs>
    </svg>`,
    'Shorts': `<svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 18 L182 18 C182 18 168 112 158 132 C150 148 140 152 128 152 L106 152 L106 82 L94 82 L94 152 L72 152 C60 152 50 148 42 132 C32 112 18 18 18 18Z" fill="url(#${gradId}a)"/>
      <rect x="18" y="18" width="164" height="14" rx="7" fill="rgba(255,255,255,0.2)"/>
      <defs>
        <linearGradient id="${gradId}a" x1="18" y1="18" x2="182" y2="152" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="${colors[0]}"/><stop offset="100%" stop-color="${colors[1]}"/>
        </linearGradient>
      </defs>
    </svg>`,
    'Pants': `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 18 L178 18 C178 18 165 118 160 162 C158 180 148 190 136 192 L108 192 L105 112 L95 112 L92 192 L64 192 C52 190 42 180 40 162 C35 118 22 18 22 18Z" fill="url(#${gradId}a)"/>
      <rect x="22" y="18" width="156" height="14" rx="7" fill="rgba(255,255,255,0.2)"/>
      <defs>
        <linearGradient id="${gradId}a" x1="22" y1="18" x2="178" y2="192" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="${colors[0]}"/><stop offset="100%" stop-color="${colors[1]}"/>
        </linearGradient>
      </defs>
    </svg>`,
    'Slides': `<svg viewBox="0 0 220 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="110" cy="94" rx="88" ry="9" fill="rgba(0,0,0,0.2)"/>
      <rect x="22" y="70" width="176" height="20" rx="10" fill="url(#${gradId}b)"/>
      <path d="M55 70 C55 70 52 46 60 40 L90 36 L132 36 C144 36 150 42 150 52 L150 70Z" fill="url(#${gradId}a)"/>
      <path d="M60 53 L148 53" stroke="rgba(255,255,255,0.3)" stroke-width="3" stroke-linecap="round"/>
      <defs>
        <linearGradient id="${gradId}a" x1="52" y1="36" x2="150" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="${colors[2]}"/><stop offset="100%" stop-color="${colors[0]}"/>
        </linearGradient>
        <linearGradient id="${gradId}b" x1="22" y1="70" x2="198" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="${colors[0]}"/><stop offset="100%" stop-color="${colors[1]}"/>
        </linearGradient>
      </defs>
    </svg>`,
    'Caps': `<svg viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="110" cy="108" rx="78" ry="9" fill="rgba(0,0,0,0.2)"/>
      <path d="M32 80 C32 80 38 36 80 26 C93 22 110 22 127 26 C168 36 178 70 178 80Z" fill="url(#${gradId}a)"/>
      <rect x="22" y="78" width="148" height="16" rx="8" fill="url(#${gradId}b)"/>
      <path d="M88 50 Q110 44 132 50" stroke="rgba(255,255,255,0.2)" stroke-width="2" fill="none"/>
      <defs>
        <linearGradient id="${gradId}a" x1="32" y1="22" x2="178" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="${colors[0]}"/><stop offset="100%" stop-color="${colors[1]}"/>
        </linearGradient>
        <linearGradient id="${gradId}b" x1="22" y1="78" x2="170" y2="94" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#111"/><stop offset="100%" stop-color="#222"/>
        </linearGradient>
      </defs>
    </svg>`,
    'Outerwear': `<svg viewBox="0 0 200 175" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M58 26 C58 26 46 16 34 16 L6 36 C4 38 4 42 6 44 L24 56 L24 158 C24 161 26 163 29 163 L82 163 L82 80 L90 80 L90 163 L110 163 L110 80 L118 80 L118 163 L171 163 C174 163 176 161 176 158 L176 56 L194 44 C196 42 196 38 194 36 L166 16 C154 16 142 26 142 26 C130 40 70 40 58 26Z" fill="url(#${gradId}a)"/>
      <path d="M82 26 L82 163M118 26 L118 163" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
      <path d="M90 80 L110 80" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
      <defs>
        <linearGradient id="${gradId}a" x1="6" y1="16" x2="196" y2="163" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="${colors[0]}"/><stop offset="100%" stop-color="${colors[1]}"/>
        </linearGradient>
      </defs>
    </svg>`
  };
  return svgs[p.category] || svgs['T-Shirts'];
}

function getBrandColors(p) {
  const palettes = {
    'On Running':           ['#2d7dd2','#1a5fa8','#5fa8e8'],
    'Nike':                 ['#f5a623','#e8553e','#f5c842'],
    'Gymshark':             ['#1a1a2e','#16213e','#0f3460'],
    'Adidas':               ['#111111','#333333','#555555'],
    'Crocs':                ['#4caf50','#388e3c','#81c784'],
    'Vans':                 ['#c0392b','#922b21','#e74c3c'],
    'Jordan':               ['#e74c3c','#c0392b','#f1948a'],
    'Alexander McQueen':    ['#c9a227','#a07818','#f5e27a'],
    'New Era':              ['#1a3a5c','#0f2540','#2e5f8a'],
    'Fear of God Essentials':['#8d6e63','#6d4c41','#bcaaa4'],
    'Shoo Exclusive':       ['#f5a623','#e8553e','#f5c842'],
  };
  return palettes[p.brand] || ['#555','#333','#777'];
}

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
    const colors = getBrandColors(p);
    return `
    <div class="product-card ${stockStatus === 'out' ? 'sold-out' : ''}" data-id="${p.id}">
      ${p.badge ? `<span class="product-badge badge-${p.badge.toLowerCase().replace(/\s/g,'-')}">${p.badge}</span>` : ''}
      <div class="product-thumb" onclick="openModal(${p.id})" style="background:linear-gradient(135deg,${colors[1]}22,${colors[0]}18)">
        <div class="product-svg-wrap">${getProductSVG(p)}</div>
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
    <div class="modal-left" style="background:linear-gradient(135deg,${getBrandColors(p)[1]}33,${getBrandColors(p)[0]}22)">
      <div class="modal-thumb">
        <div class="modal-svg-wrap">${getProductSVG(p)}</div>
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
