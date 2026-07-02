let cart = [];
let currentCategory = 'all';
let currentSort = 'default';
let searchQuery = '';

// ── RENDER PRODUCTS ──
function renderProducts(list) {
  const grid = document.getElementById('productsGrid');
  const noResults = document.getElementById('noResults');
  if (!list.length) { grid.innerHTML = ''; noResults.style.display = 'block'; return; }
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
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'" />
        <div class="product-brand-logo">${p.brand}</div>
        <div class="quick-view">Quick View</div>
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
            return `<span class="size-chip ${qty === 0 ? 'size-oos' : ''}">${s}</span>`;
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
  document.querySelectorAll('.filter-tab').forEach(t => {
    if ((cat === 'all' && t.textContent === 'All') || t.textContent === cat) t.classList.add('active');
  });
  renderProducts(getFilteredProducts());
  if (cat !== 'all') document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

function filterProducts() {
  searchQuery = document.getElementById('searchInput').value.toLowerCase();
  renderProducts(getFilteredProducts());
}

function sortProducts(val) {
  currentSort = val;
  renderProducts(getFilteredProducts());
}

// ── PRODUCT MODAL ──
function openModal(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const modal = document.getElementById('productModal');
  document.getElementById('modalInner').innerHTML = `
    <div class="modal-left">
      <img src="${p.image}" alt="${p.name}" class="modal-img" id="modalMainImg" onerror="this.style.background='#222'" />
      ${p.badge ? `<span class="product-badge badge-${p.badge.toLowerCase().replace(/\s/g,'-')}">${p.badge}</span>` : ''}
    </div>
    <div class="modal-right">
      <p class="modal-brand">${p.brand}</p>
      <h2 class="modal-name">${p.name}</h2>
      <p class="modal-desc">${p.description}</p>
      <div class="modal-price">$${p.price}</div>
      <div class="modal-section">
        <label class="modal-label">Color</label>
        <div class="modal-colors">
          ${p.colors.map((c,i) => `<button class="modal-color-btn ${i===0?'active':''}" onclick="selectColor(this,${p.id})" data-color="${c}">${c}</button>`).join('')}
        </div>
      </div>
      <div class="modal-section">
        <label class="modal-label">Size <span id="selectedSizeLabel"></span></label>
        <div class="modal-sizes">
          ${p.sizes.map(s => {
            const qty = p.availability[s] || 0;
            return `<button class="modal-size-btn ${qty===0?'oos':''}" data-size="${s}" data-qty="${qty}"
              onclick="${qty>0?'selectSize(this)':''}" ${qty===0?'disabled':''}>
              ${s}<span class="qty-tip">${qty===0?'✗':qty<=3?`${qty}✓`:'✓'}</span>
            </button>`;
          }).join('')}
        </div>
      </div>
      <div class="modal-section">
        <label class="modal-label">Stock by Size</label>
        <div class="size-availability-table">
          ${p.sizes.map(s => {
            const qty = p.availability[s] || 0;
            return `<div class="avail-row ${qty===0?'avail-out':qty<=3?'avail-low':'avail-good'}">
              <span>${s}</span>
              <div class="avail-bar"><div class="avail-fill" style="width:${Math.min(qty*10,100)}%"></div></div>
              <span>${qty===0?'Out of Stock':qty<=3?`${qty} left`:`${qty} in stock`}</span>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn-modal-cart" onclick="addToCartFromModal(${p.id})">Add to Cart</button>
        <button class="btn-modal-whatsapp" onclick="whatsappProduct(${p.id})">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
          WhatsApp
        </button>
      </div>
    </div>`;
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
function selectColor(btn, productId) {
  document.querySelectorAll('.modal-color-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const color = btn.dataset.color;
  const p = products.find(x => x.id === productId);
  if (p && p.colorImages && p.colorImages[color]) {
    const img = document.getElementById('modalMainImg');
    if (img) { img.src = p.colorImages[color]; }
  }
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
  addToCart(id, selectedSizeBtn.dataset.size, selectedColorBtn ? selectedColorBtn.textContent : '');
  closeModal();
  openCart();
}

function addToCart(id, size, color) {
  const p = products.find(x => x.id === id);
  const key = `${id}-${size}-${color}`;
  const existing = cart.find(i => i.key === key);
  if (existing) existing.qty++;
  else cart.push({ key, id, name: p.name, brand: p.brand, price: p.price, size, color, qty: 1, image: p.image });
  updateCartUI();
}

function removeFromCart(key) {
  cart = cart.filter(i => i.key !== key);
  updateCartUI();
}

function changeQty(key, delta) {
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.key !== key);
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
      <img src="${i.image}" alt="${i.name}" class="cart-item-img" onerror="this.style.background='#222'" />
      <div class="cart-item-info">
        <span class="cart-item-name">${i.name}</span>
        <span class="cart-item-meta">${i.color} · Size ${i.size}</span>
        <div class="cart-item-qty-row">
          <button class="qty-btn" onclick="changeQty('${i.key}',-1)">−</button>
          <span class="qty-val">${i.qty}</span>
          <button class="qty-btn" onclick="changeQty('${i.key}',1)">+</button>
          <span class="cart-item-price">$${i.price * i.qty}</span>
        </div>
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

// ── CHECKOUT ──
let checkoutStep = 1;
let checkoutData = {};

function openCheckout() {
  if (!cart.length) { showToast('Your cart is empty', 'error'); return; }
  closeCart();
  checkoutStep = 1;
  checkoutData = {};
  document.getElementById('checkoutModal').classList.add('active');
  document.getElementById('checkoutOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
  renderCheckoutStep();
}

function closeCheckout() {
  document.getElementById('checkoutModal').classList.remove('active');
  document.getElementById('checkoutOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

function renderCheckoutStep() {
  const total = cart.reduce((a, i) => a + i.price * i.qty, 0);
  const stepIndicator = `
    <div class="checkout-steps">
      ${['Info','Payment','Confirm'].map((s,i) => `
        <div class="step-dot ${checkoutStep > i+1 ? 'done' : checkoutStep === i+1 ? 'active' : ''}">
          <span>${checkoutStep > i+1 ? '✓' : i+1}</span>
          <label>${s}</label>
        </div>
        ${i < 2 ? '<div class="step-line '+(checkoutStep > i+1 ? 'done' : '')+'"></div>' : ''}
      `).join('')}
    </div>`;

  let body = '';

  if (checkoutStep === 1) {
    body = `
      <h2 class="checkout-title">Delivery Info</h2>
      <div class="checkout-form">
        <div class="form-row">
          <div class="form-group">
            <label>Full Name *</label>
            <input type="text" id="f_name" placeholder="Ahmad Khalil" value="${checkoutData.name||''}" />
          </div>
          <div class="form-group">
            <label>Phone Number *</label>
            <input type="tel" id="f_phone" placeholder="+961 71 123 456" value="${checkoutData.phone||''}" />
          </div>
        </div>
        <div class="form-group">
          <label>Email (optional)</label>
          <input type="email" id="f_email" placeholder="ahmad@email.com" value="${checkoutData.email||''}" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>City / Area *</label>
            <select id="f_city">
              <option value="">Select city...</option>
              ${['Beirut','Saida','Tripoli','Tyre','Nabatieh','Sidon','Byblos','Jounieh','Zahle','Baalbek','Aley','Chouf','Other'].map(c =>
                `<option value="${c}" ${checkoutData.city===c?'selected':''}>${c}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Area / District *</label>
            <input type="text" id="f_area" placeholder="Haret Saida, Achrafieh..." value="${checkoutData.area||''}" />
          </div>
        </div>
        <div class="form-group">
          <label>Street & Building *</label>
          <input type="text" id="f_address" placeholder="Main St, Building XYZ, Floor 3" value="${checkoutData.address||''}" />
        </div>
        <div class="form-group">
          <label>Delivery Notes</label>
          <textarea id="f_notes" placeholder="Landmark, additional instructions..." rows="2">${checkoutData.notes||''}</textarea>
        </div>
      </div>
      <div class="checkout-order-mini">
        <p class="order-mini-label">Your order (${cart.reduce((a,i)=>a+i.qty,0)} items) — <strong>$${total}</strong></p>
      </div>
      <button class="btn-checkout-next" onclick="goStep2()">Continue to Payment →</button>`;
  }

  else if (checkoutStep === 2) {
    body = `
      <h2 class="checkout-title">Payment Method</h2>
      <div class="payment-options">
        <label class="pay-option ${checkoutData.payMethod==='card'?'selected':''}">
          <input type="radio" name="payMethod" value="card" ${checkoutData.payMethod==='card'?'checked':''} onchange="selectPayMethod('card')" />
          <div class="pay-icon">💳</div>
          <div class="pay-info"><strong>Pay by Card</strong><p>Visa, Mastercard, AMEX</p></div>
          <div class="pay-check">✓</div>
        </label>
        <label class="pay-option ${checkoutData.payMethod==='cod'?'selected':''}">
          <input type="radio" name="payMethod" value="cod" ${checkoutData.payMethod==='cod'?'checked':''} onchange="selectPayMethod('cod')" />
          <div class="pay-icon">💵</div>
          <div class="pay-info"><strong>Cash on Delivery</strong><p>Pay when your order arrives</p></div>
          <div class="pay-check">✓</div>
        </label>
        <label class="pay-option ${checkoutData.payMethod==='whatsapp'?'selected':''}">
          <input type="radio" name="payMethod" value="whatsapp" ${checkoutData.payMethod==='whatsapp'?'checked':''} onchange="selectPayMethod('whatsapp')" />
          <div class="pay-icon" style="background:rgba(37,211,102,0.15)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
          </div>
          <div class="pay-info"><strong>Order via WhatsApp</strong><p>Confirm & pay through chat</p></div>
          <div class="pay-check">✓</div>
        </label>
      </div>

      <div id="cardFormWrap" style="display:${checkoutData.payMethod==='card'?'block':'none'}">
        <div class="card-form">
          <div class="card-preview" id="cardPreview">
            <div class="card-chip">
              <svg width="30" height="24" viewBox="0 0 30 24"><rect x="0" y="0" width="30" height="24" rx="4" fill="#d4a017"/><rect x="8" y="6" width="14" height="12" rx="2" fill="none" stroke="#a07800" stroke-width="1.5"/><line x1="15" y1="6" x2="15" y2="18" stroke="#a07800" stroke-width="1.5"/><line x1="8" y1="12" x2="22" y2="12" stroke="#a07800" stroke-width="1.5"/></svg>
            </div>
            <div class="card-number-display" id="cardNumDisplay">•••• •••• •••• ••••</div>
            <div class="card-bottom">
              <div><span class="card-label">CARD HOLDER</span><div class="card-holder-display" id="cardHolderDisplay">FULL NAME</div></div>
              <div><span class="card-label">EXPIRES</span><div id="cardExpDisplay">MM/YY</div></div>
            </div>
          </div>
          <div class="form-group">
            <label>Card Number *</label>
            <input type="text" id="f_cardnum" placeholder="1234 5678 9012 3456" maxlength="19" oninput="formatCardNum(this)" value="${checkoutData.cardnum||''}" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Cardholder Name *</label>
              <input type="text" id="f_cardholder" placeholder="Ahmad Khalil" oninput="document.getElementById('cardHolderDisplay').textContent=this.value.toUpperCase()||'FULL NAME'" value="${checkoutData.cardholder||''}" />
            </div>
            <div class="form-group">
              <label>Expiry *</label>
              <input type="text" id="f_expiry" placeholder="MM/YY" maxlength="5" oninput="formatExpiry(this)" value="${checkoutData.expiry||''}" />
            </div>
            <div class="form-group">
              <label>CVV *</label>
              <input type="password" id="f_cvv" placeholder="•••" maxlength="4" value="${checkoutData.cvv||''}" />
            </div>
          </div>
        </div>
      </div>

      <div class="checkout-nav">
        <button class="btn-checkout-back" onclick="checkoutStep=1;renderCheckoutStep()">← Back</button>
        <button class="btn-checkout-next" onclick="goStep3()">Review Order →</button>
      </div>`;
  }

  else if (checkoutStep === 3) {
    const payLabels = { card: '💳 Card Payment', cod: '💵 Cash on Delivery', whatsapp: '💬 WhatsApp' };
    body = `
      <h2 class="checkout-title">Order Review</h2>
      <div class="review-grid">
        <div class="review-section">
          <h4>Delivery To</h4>
          <p>${checkoutData.name}</p>
          <p>${checkoutData.phone}</p>
          <p>${checkoutData.address}, ${checkoutData.area}</p>
          <p>${checkoutData.city}, Lebanon</p>
          ${checkoutData.notes ? `<p class="review-notes">"${checkoutData.notes}"</p>` : ''}
        </div>
        <div class="review-section">
          <h4>Payment</h4>
          <p>${payLabels[checkoutData.payMethod]}</p>
          ${checkoutData.payMethod==='card' ? `<p>${checkoutData.cardnum} · ${checkoutData.expiry}</p>` : ''}
        </div>
      </div>
      <div class="review-items">
        <h4>Items</h4>
        ${cart.map(i => `
          <div class="review-item">
            <img src="${i.image}" alt="${i.name}" />
            <div><span>${i.name}</span><span>${i.color} · Size ${i.size} · ×${i.qty}</span></div>
            <span class="review-item-price">$${i.price * i.qty}</span>
          </div>`).join('')}
        <div class="review-total">
          <span>Delivery</span><span>Free 🚚</span>
        </div>
        <div class="review-total grand">
          <span>Total</span><span>$${total}</span>
        </div>
      </div>
      <div class="checkout-nav">
        <button class="btn-checkout-back" onclick="checkoutStep=2;renderCheckoutStep()">← Back</button>
        <button class="btn-place-order" onclick="placeOrder()">
          ${checkoutData.payMethod==='whatsapp' ? 'Send WhatsApp Order' : checkoutData.payMethod==='cod' ? 'Place Order (COD)' : 'Pay Now $'+total}
        </button>
      </div>`;
  }

  document.getElementById('checkoutBody').innerHTML = stepIndicator + body;
  if (checkoutData.payMethod === 'card' && checkoutStep === 2) {
    setTimeout(() => {
      const n = document.getElementById('f_cardnum');
      if (n) { document.getElementById('cardNumDisplay').textContent = n.value || '•••• •••• •••• ••••'; }
      const h = document.getElementById('f_cardholder');
      if (h) { document.getElementById('cardHolderDisplay').textContent = h.value.toUpperCase() || 'FULL NAME'; }
      const e = document.getElementById('f_expiry');
      if (e) { document.getElementById('cardExpDisplay').textContent = e.value || 'MM/YY'; }
    }, 50);
  }
}

function selectPayMethod(method) {
  checkoutData.payMethod = method;
  document.querySelectorAll('.pay-option').forEach(el => el.classList.remove('selected'));
  event.currentTarget.closest('.pay-option').classList.add('selected');
  const cardWrap = document.getElementById('cardFormWrap');
  if (cardWrap) cardWrap.style.display = method === 'card' ? 'block' : 'none';
}

function formatCardNum(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 16);
  input.value = v.replace(/(.{4})/g, '$1 ').trim();
  const display = document.getElementById('cardNumDisplay');
  if (display) display.textContent = input.value || '•••• •••• •••• ••••';
}

function formatExpiry(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 4);
  if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
  input.value = v;
  const display = document.getElementById('cardExpDisplay');
  if (display) display.textContent = v || 'MM/YY';
}

function goStep2() {
  const name = document.getElementById('f_name').value.trim();
  const phone = document.getElementById('f_phone').value.trim();
  const city = document.getElementById('f_city').value;
  const area = document.getElementById('f_area').value.trim();
  const address = document.getElementById('f_address').value.trim();
  if (!name || !phone || !city || !area || !address) { showToast('Please fill all required fields', 'error'); return; }
  checkoutData = { ...checkoutData, name, phone, email: document.getElementById('f_email').value, city, area, address, notes: document.getElementById('f_notes').value };
  checkoutStep = 2;
  renderCheckoutStep();
}

function goStep3() {
  if (!checkoutData.payMethod) { showToast('Please select a payment method', 'error'); return; }
  if (checkoutData.payMethod === 'card') {
    const cardnum = document.getElementById('f_cardnum').value.trim();
    const cardholder = document.getElementById('f_cardholder').value.trim();
    const expiry = document.getElementById('f_expiry').value.trim();
    const cvv = document.getElementById('f_cvv').value.trim();
    if (!cardnum || !cardholder || !expiry || !cvv) { showToast('Please fill all card details', 'error'); return; }
    checkoutData = { ...checkoutData, cardnum, cardholder, expiry, cvv };
  }
  checkoutStep = 3;
  renderCheckoutStep();
}

function placeOrder() {
  const total = cart.reduce((a, i) => a + i.price * i.qty, 0);
  if (checkoutData.payMethod === 'whatsapp') {
    const lines = cart.map(i => `• ${i.name} (${i.color}, Size ${i.size}) ×${i.qty} — $${i.price*i.qty}`).join('\n');
    const msg = encodeURIComponent(`🛍️ New Order from Shoo Sports Website\n\n${lines}\n\n📦 Total: $${total}\n\n👤 ${checkoutData.name}\n📞 ${checkoutData.phone}\n📍 ${checkoutData.address}, ${checkoutData.area}, ${checkoutData.city}\n\n${checkoutData.notes ? '📝 Notes: '+checkoutData.notes : ''}`);
    window.open(`https://wa.me/96176123456?text=${msg}`, '_blank');
  }
  showOrderSuccess(checkoutData.payMethod);
}

function showOrderSuccess(method) {
  const icons = { card: '💳', cod: '📦', whatsapp: '💬' };
  const msgs = { card: 'Your payment is being processed.', cod: 'Pay cash when your order arrives.', whatsapp: 'Check WhatsApp to confirm with the store.' };
  document.getElementById('checkoutBody').innerHTML = `
    <div class="order-success">
      <div class="success-icon">✓</div>
      <h2>Order Placed!</h2>
      <p>Thank you, <strong>${checkoutData.name}</strong>!</p>
      <p>${msgs[method]}</p>
      <p class="success-delivery">🚚 Delivering to <strong>${checkoutData.area}, ${checkoutData.city}</strong></p>
      <div class="success-ref">Order ref: #SH${Date.now().toString().slice(-6)}</div>
      <button class="btn-checkout-next" onclick="closeCheckout();cart=[];updateCartUI()">Continue Shopping</button>
    </div>`;
}

function whatsappOrder() { openCheckout(); }

function whatsappProduct(id) {
  const p = products.find(x => x.id === id);
  const selectedSizeBtn = document.querySelector('.modal-size-btn.selected');
  const size = selectedSizeBtn ? selectedSizeBtn.dataset.size : 'TBD';
  const msg = encodeURIComponent(`Hi Shoo Sports! 👋\n\nI'm interested in:\n• ${p.name} — Size ${size} — $${p.price}\n\nIs it available? Thank you!`);
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
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
});
function toggleSearch() {
  const bar = document.getElementById('searchBar');
  bar.classList.toggle('active');
  if (bar.classList.contains('active')) document.getElementById('searchInput').focus();
}
function toggleMenu() { document.getElementById('mobileMenu').classList.toggle('open'); }

// ── CATEGORIES GRID ──
function renderCategories() {
  const grid = document.getElementById('categoriesGrid');
  if (!grid) return;
  const cats = loadCategories();
  const counts = {};
  products.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
  const total = products.length;

  const allCard = `
  <div class="cat-card cat-all" onclick="filterByCategory('all')">
    <div class="cat-visual cat-all-visual">
      <div class="all-grid">
        <span class="all-mini shoe-mini"></span><span class="all-mini shirt-mini"></span>
        <span class="all-mini short-mini"></span><span class="all-mini cap-mini"></span>
      </div>
      <div class="cat-glow cat-glow-white"></div>
    </div>
    <div class="cat-info"><h3>All Items</h3><p>View Everything</p><span class="cat-count">${total} items</span></div>
  </div>`;

  grid.innerHTML = cats.map(c => {
    const cnt = counts[c.key] || 0;
    const visual = c.image
      ? `<img src="${c.image}" alt="${c.label}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" onerror="this.style.display='none'" />`
      : c.svg;
    return `
    <div class="cat-card ${c.svgClass}" onclick="filterByCategory('${c.key}')">
      <div class="cat-visual">${visual}<div class="cat-glow ${c.glowClass}"></div></div>
      <div class="cat-info"><h3>${c.label}</h3><p>${c.sub}</p><span class="cat-count">${cnt} items</span></div>
    </div>`;
  }).join('') + allCard;
}

// ── SPOTLIGHT CAROUSEL ──
let spIndex = 0;
let spItems = [];
let spAutoTimer = null;

function initSpotlight() {
  // Use admin-curated spotlight order if saved, otherwise auto-pick badged first
  let spItems_raw = null;
  try {
    const saved = localStorage.getItem('shoo_spotlight');
    if (saved) {
      const ids = JSON.parse(saved);
      spItems_raw = ids.map(id => products.find(p => p.id === id)).filter(Boolean);
    }
  } catch(e) {}
  if (!spItems_raw || !spItems_raw.length) {
    const badged = products.filter(p => p.badge);
    const rest = products.filter(p => !p.badge);
    spItems_raw = [...badged, ...rest].slice(0, 6);
  }
  spItems = spItems_raw;

  const track = document.getElementById('spotlightTrack');
  const dots = document.getElementById('spDots');
  if (!track || !spItems.length) return;

  track.innerHTML = spItems.map((p, i) => {
    const totalStock = Object.values(p.availability).reduce((a, b) => a + b, 0);
    const sizesHtml = p.sizes.slice(0, 7).map((s, si) => {
      const qty = p.availability[s] || 0;
      return `<span class="${si === 0 ? 'active' : ''} ${qty === 0 ? 'sp-sz-oos' : ''}" data-size="${s}">${s}</span>`;
    }).join('');
    return `
    <div class="sp-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
      <div class="spotlight-grid">
        <div class="spotlight-left">
          <p class="section-eyebrow">${p.category} · ${p.brand}</p>
          <h2 class="spotlight-title"><span class="spotlight-accent">${p.name}</span></h2>
          <p class="spotlight-desc">${p.description}</p>
          <div class="spotlight-price-row">
            <span class="spotlight-price">$${p.price}</span>
            ${p.badge ? `<span class="spotlight-badge">${p.badge}</span>` : ''}
            ${totalStock <= 5 && totalStock > 0 ? `<span class="sp-low-badge">Only ${totalStock} left</span>` : ''}
          </div>
          <div class="spotlight-sizes">${sizesHtml}</div>
          <div class="sp-colors">
            ${p.colors.map((c, ci) => `<button class="sp-color-chip ${ci === 0 ? 'active' : ''}">${c}</button>`).join('')}
          </div>
          <div class="sp-actions">
            <button class="btn-spotlight" onclick="openModal(${p.id})">Shop Now →</button>
            <button class="btn-sp-cart" onclick="quickAdd(${p.id})">+ Add to Cart</button>
          </div>
        </div>
        <div class="spotlight-right">
          <div class="spotlight-img-wrap">
            <img src="${p.image}" alt="${p.name}" />
            <div class="spotlight-ring ring1"></div>
            <div class="spotlight-ring ring2"></div>
            ${p.badge ? `<div class="spotlight-tag tag1">${p.badge}</div>` : ''}
            <div class="spotlight-tag tag2">${p.brand}</div>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');

  dots.innerHTML = spItems.map((_, i) =>
    `<button class="sp-dot ${i === 0 ? 'active' : ''}" onclick="spGoTo(${i})"></button>`
  ).join('');

  spStartAuto();
}

function spGoTo(idx) {
  const slides = document.querySelectorAll('.sp-slide');
  const dots = document.querySelectorAll('.sp-dot');
  slides[spIndex]?.classList.remove('active');
  dots[spIndex]?.classList.remove('active');
  spIndex = (idx + spItems.length) % spItems.length;
  slides[spIndex]?.classList.add('active');
  dots[spIndex]?.classList.add('active');
  const bgText = document.getElementById('spotlightBgText');
  if (bgText) bgText.textContent = spItems[spIndex]?.category?.toUpperCase() || 'FEATURED';
}

function spSlide(dir) {
  spResetAuto();
  spGoTo(spIndex + dir);
}

function spStartAuto() {
  spAutoTimer = setInterval(() => spGoTo(spIndex + 1), 5000);
}
function spResetAuto() {
  clearInterval(spAutoTimer);
  spStartAuto();
}

document.addEventListener('DOMContentLoaded', () => {
  // Use admin-saved data if available, otherwise fall back to default products
  const saved = localStorage.getItem('shoo_products');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      products.length = 0;
      parsed.forEach(p => products.push(p));
    } catch(e) {}
  }
  renderProducts(products);
  renderCategories();
  initSpotlight();

  const copyYear = document.getElementById('copyYear');
  if (copyYear) copyYear.textContent = new Date().getFullYear();
});
