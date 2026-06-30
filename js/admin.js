// ── AUTH ──
const ADMIN_PASS = 'shoo2024';

function doLogin() {
  const val = document.getElementById('loginPass').value;
  if (val === ADMIN_PASS) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminWrap').style.display = 'flex';
    initAdmin();
  } else {
    const err = document.getElementById('loginError');
    err.textContent = 'Incorrect password. Try again.';
    err.style.color = '#ef4444';
    document.getElementById('loginPass').value = '';
  }
}

function logout() {
  document.getElementById('adminWrap').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('loginPass').value = '';
}

// ── DATA ──
// Load from localStorage or fall back to products.js
function loadData() {
  const saved = localStorage.getItem('shoo_products');
  if (saved) {
    try { return JSON.parse(saved); } catch(e) {}
  }
  return JSON.parse(JSON.stringify(products)); // deep copy from products.js
}

function saveData(data) {
  localStorage.setItem('shoo_products', JSON.stringify(data));
}

let data = [];

function initAdmin() {
  data = loadData();
  renderProductsTable();
  renderStockList();
  renderForm();
}

// ── TABS ──
function showTab(name, btn) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const titles = { products: ['Products', 'Manage your product catalog'], stock: ['Stock Management', 'Click any number to update stock'], add: ['Add Product', 'Add a new product to the store'], spotlight: ['Spotlight Carousel', 'Choose and order which products appear in the featured section'], orders: ['Orders', 'Manage incoming orders'] };
  document.getElementById('tabTitle').textContent = titles[name][0];
  document.getElementById('tabSub').textContent = titles[name][1];
  document.getElementById('topbarActions').style.display = name === 'products' ? 'flex' : 'none';
  if (name === 'add') resetForm();
  if (name === 'spotlight') renderSpotlightAdmin();
}

// ── PRODUCTS TABLE ──
let tableFilter = '';
let categoryFilter = '';

function renderProductsTable() {
  let list = data.filter(p => {
    const matchSearch = !tableFilter || p.name.toLowerCase().includes(tableFilter) || p.brand.toLowerCase().includes(tableFilter);
    const matchCat = !categoryFilter || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const tbody = document.getElementById('productsTableBody');
  tbody.innerHTML = list.map(p => {
    const totalStock = Object.values(p.availability).reduce((a,b) => a+b, 0);
    const stockClass = totalStock === 0 ? 'stock-out' : totalStock <= 5 ? 'stock-low' : 'stock-ok';
    return `
    <tr>
      <td>
        <div class="product-cell">
          <img src="${p.image || ''}" alt="${p.name}" class="table-thumb" onerror="this.style.display='none'" />
          <span class="product-cell-name">${p.name}</span>
        </div>
      </td>
      <td><span class="cat-tag">${p.category}</span></td>
      <td class="brand-cell">${p.brand}</td>
      <td class="price-cell">
        <span class="price-val" onclick="quickEditPrice(${p.id})">$${p.price}</span>
        <button class="btn-tiny" onclick="quickEditPrice(${p.id})" title="Edit price">✏️</button>
      </td>
      <td><span class="stock-val ${stockClass}">${totalStock}</span></td>
      <td>${p.badge ? `<span class="badge-tag badge-${p.badge.toLowerCase()}">${p.badge}</span>` : '<span class="no-badge">—</span>'}</td>
      <td>
        <div class="action-btns">
          <button class="btn-action btn-edit" onclick="editProduct(${p.id})">Edit</button>
          <button class="btn-action btn-stock" onclick="showStockForProduct(${p.id})">Stock</button>
          <button class="btn-action btn-delete" onclick="confirmDelete(${p.id})">Delete</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function filterTable(val) { tableFilter = val.toLowerCase(); renderProductsTable(); }
function filterCategory(val) { categoryFilter = val; renderProductsTable(); }

// ── QUICK PRICE EDIT ──
function quickEditPrice(id) {
  const p = data.find(x => x.id === id);
  openEditModal(`Edit Price — ${p.name}`, `
    <div class="form-group">
      <label>Price (USD)</label>
      <input type="number" id="qPrice" value="${p.price}" min="0" class="big-input" />
    </div>
    <button class="btn-save-modal" onclick="saveQuickPrice(${id})">Save Price</button>
  `);
}

function saveQuickPrice(id) {
  const val = parseFloat(document.getElementById('qPrice').value);
  if (isNaN(val) || val < 0) { adminToast('Invalid price', 'error'); return; }
  const p = data.find(x => x.id === id);
  p.price = val;
  saveData(data);
  renderProductsTable();
  closeEditModal();
  adminToast(`Price updated to $${val}`);
}

// ── STOCK LIST TAB ──
let stockFilter = '';
let stockCatFilter = '';

function renderStockList() {
  let list = data.filter(p => {
    const matchSearch = !stockFilter || p.name.toLowerCase().includes(stockFilter) || p.brand.toLowerCase().includes(stockFilter);
    const matchCat = !stockCatFilter || p.category === stockCatFilter;
    return matchSearch && matchCat;
  });

  document.getElementById('stockList').innerHTML = list.map(p => {
    const total = Object.values(p.availability).reduce((a,b)=>a+b,0);
    return `
    <div class="stock-card">
      <div class="stock-card-header">
        <img src="${p.image||''}" alt="${p.name}" class="stock-thumb" onerror="this.style.display='none'" />
        <div class="stock-card-info">
          <h4>${p.name}</h4>
          <span>${p.brand} · ${p.category}</span>
        </div>
        <div class="stock-total ${total===0?'st-out':total<=5?'st-low':'st-ok'}">
          ${total} total
        </div>
      </div>
      <div class="stock-sizes">
        ${p.sizes.map(s => {
          const qty = p.availability[s] || 0;
          const cls = qty === 0 ? 'sz-out' : qty <= 3 ? 'sz-low' : 'sz-ok';
          return `
          <div class="size-row">
            <span class="size-label">${s}</span>
            <div class="size-bar-wrap">
              <div class="size-bar ${cls}" style="width:${Math.min(qty*8,100)}%"></div>
            </div>
            <input type="number" class="stock-input ${cls}" value="${qty}" min="0"
              onchange="updateStock(${p.id},'${s}',this.value)"
              onfocus="this.select()" />
            <div class="stock-quick-btns">
              <button onclick="adjustStock(${p.id},'${s}',-1)">−</button>
              <button onclick="adjustStock(${p.id},'${s}',1)">+</button>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }).join('');
}

function filterStock(val) { stockFilter = val.toLowerCase(); renderStockList(); }
function filterStockCategory(val) { stockCatFilter = val; renderStockList(); }

function updateStock(id, size, val) {
  const qty = Math.max(0, parseInt(val) || 0);
  const p = data.find(x => x.id === id);
  p.availability[size] = qty;
  saveData(data);
  renderProductsTable();
  renderStockList();
  adminToast(`Stock updated: ${p.name} · ${size} → ${qty}`);
}

function adjustStock(id, size, delta) {
  const p = data.find(x => x.id === id);
  const current = p.availability[size] || 0;
  const newVal = Math.max(0, current + delta);
  p.availability[size] = newVal;
  saveData(data);
  renderProductsTable();
  renderStockList();
}

function showStockForProduct(id) {
  const navBtn = document.querySelector('.nav-item:nth-child(2)');
  showTab('stock', navBtn);
  stockFilter = data.find(x=>x.id===id)?.name.toLowerCase() || '';
  renderStockList();
  document.querySelector('.stock-filter input').value = data.find(x=>x.id===id)?.name || '';
}

// ── ADD / EDIT PRODUCT FORM ──
const sizeSets = {
  'Shoes':     ['36','37','38','39','40','41','42','43','44','45','46'],
  'T-Shirts':  ['XS','S','M','L','XL','XXL'],
  'Shorts':    ['XS','S','M','L','XL','XXL'],
  'Pants':     ['XS','S','M','L','XL','XXL'],
  'Slides':    ['36','37','38','39','40','41','42','43','44','45'],
  'Caps':      ['One Size'],
  'Outerwear': ['XS','S','M','L','XL','XXL'],
};

function resetForm() {
  document.getElementById('editId').value = '';
  document.getElementById('pName').value = '';
  document.getElementById('pBrand').value = '';
  document.getElementById('pCategory').value = '';
  document.getElementById('pPrice').value = '';
  document.getElementById('pBadge').value = '';
  document.getElementById('pDesc').value = '';
  document.getElementById('pImage').value = '';
  document.getElementById('pColors').value = '';
  document.getElementById('imgPreview').style.display = 'none';
  document.getElementById('colorImagesEditor').innerHTML = '';
  document.getElementById('colorImagesGroup').style.display = 'none';
  document.getElementById('sizesEditor').innerHTML = '';
  document.querySelector('.btn-save-product').textContent = 'Save Product';
  document.querySelector('.product-form h2') && (document.querySelector('.product-form h2').textContent = 'Add Product');
}

function renderForm() {
  // just keep the form as-is, resetForm is called on tab switch
}

function updateSizeSuggestions() {
  const cat = document.getElementById('pCategory').value;
  const editor = document.getElementById('sizesEditor');
  if (!cat) return;
  const sizes = sizeSets[cat] || [];
  // Only auto-populate if empty
  if (editor.children.length === 0) {
    editor.innerHTML = '';
    sizes.forEach(s => addSizeRow(s, 0));
  }
}

function addSizeRow(size='', qty=0) {
  const div = document.createElement('div');
  div.className = 'size-editor-row';
  div.innerHTML = `
    <input type="text" class="size-name-input" placeholder="Size" value="${size}" />
    <input type="number" class="size-qty-input" placeholder="Qty" value="${qty}" min="0" />
    <button onclick="this.parentElement.remove()" class="btn-remove-size">✕</button>`;
  document.getElementById('sizesEditor').appendChild(div);
}

function previewImage() {
  const url = document.getElementById('pImage').value;
  const img = document.getElementById('imgPreview');
  if (url) { img.src = url; img.style.display = 'block'; }
  else img.style.display = 'none';
}

function handleImageUpload(input, urlFieldId, previewId) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const dataUrl = e.target.result;
    document.getElementById(urlFieldId).value = dataUrl;
    const img = document.getElementById(previewId);
    img.src = dataUrl;
    img.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

function handleColorImageUpload(input, color) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const dataUrl = e.target.result;
    const urlInput = input.closest('.color-img-row').querySelector('.color-img-url');
    urlInput.value = dataUrl;
    const preview = input.closest('.color-img-row').querySelector('.color-img-preview');
    preview.src = dataUrl;
    preview.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

function updateColorImages(existingMap) {
  const colorsVal = document.getElementById('pColors').value;
  const colors = colorsVal.split(',').map(c => c.trim()).filter(Boolean);
  const group = document.getElementById('colorImagesGroup');
  const editor = document.getElementById('colorImagesEditor');

  if (!colors.length) { group.style.display = 'none'; return; }
  group.style.display = 'block';

  // Preserve existing values
  const currentMap = {};
  editor.querySelectorAll('.color-img-row').forEach(row => {
    const c = row.dataset.color;
    const url = row.querySelector('.color-img-url').value;
    if (c && url) currentMap[c] = url;
  });
  const map = existingMap || currentMap;

  editor.innerHTML = colors.map(c => {
    const val = map[c] || '';
    return `
    <div class="color-img-row" data-color="${c}">
      <span class="color-img-label">${c}</span>
      <div class="color-img-inputs">
        <input type="text" class="color-img-url" placeholder="Image URL or upload →" value="${val}"
          oninput="previewColorImg(this)" />
        <label class="btn-upload-img btn-upload-sm" title="Upload from device">
          ↑
          <input type="file" accept="image/*" style="display:none" onchange="handleColorImageUpload(this,'${c}')" />
        </label>
        ${val ? `<img class="color-img-preview" src="${val}" style="display:block" onerror="this.style.display='none'" />` :
                 `<img class="color-img-preview" src="" style="display:none" />`}
      </div>
    </div>`;
  }).join('');
}

function previewColorImg(input) {
  const url = input.value;
  const preview = input.closest('.color-img-row').querySelector('.color-img-preview');
  preview.src = url;
  preview.style.display = url ? 'block' : 'none';
}

function getColorImages() {
  const map = {};
  document.querySelectorAll('#colorImagesEditor .color-img-row').forEach(row => {
    const c = row.dataset.color;
    const url = row.querySelector('.color-img-url').value.trim();
    if (c && url) map[c] = url;
  });
  return map;
}

function editProduct(id) {
  const p = data.find(x => x.id === id);
  if (!p) return;
  showTab('add', null);
  document.querySelector('.nav-item:nth-child(3)').classList.add('active');
  setTimeout(() => {
    document.getElementById('editId').value = id;
    document.getElementById('pName').value = p.name;
    document.getElementById('pBrand').value = p.brand;
    document.getElementById('pCategory').value = p.category;
    document.getElementById('pPrice').value = p.price;
    document.getElementById('pBadge').value = p.badge || '';
    document.getElementById('pDesc').value = p.description || '';
    document.getElementById('pImage').value = p.image || '';
    document.getElementById('pColors').value = p.colors.join(', ');
    previewImage();
    updateColorImages(p.colorImages || {});
    const editor = document.getElementById('sizesEditor');
    editor.innerHTML = '';
    p.sizes.forEach(s => addSizeRow(s, p.availability[s] || 0));
    document.querySelector('.btn-save-product').textContent = 'Update Product';
    document.getElementById('tabTitle').textContent = `Editing: ${p.name}`;
  }, 50);
}

function saveProduct() {
  const name    = document.getElementById('pName').value.trim();
  const brand   = document.getElementById('pBrand').value.trim();
  const cat     = document.getElementById('pCategory').value;
  const price   = parseFloat(document.getElementById('pPrice').value);
  const badge   = document.getElementById('pBadge').value;
  const desc    = document.getElementById('pDesc').value.trim();
  const image   = document.getElementById('pImage').value.trim();
  const colors  = document.getElementById('pColors').value.split(',').map(c=>c.trim()).filter(Boolean);
  const colorImages = getColorImages();

  if (!name || !brand || !cat || isNaN(price)) {
    adminToast('Please fill all required fields', 'error'); return;
  }

  const sizeRows = document.querySelectorAll('.size-editor-row');
  const sizes = [];
  const availability = {};
  sizeRows.forEach(row => {
    const s = row.querySelector('.size-name-input').value.trim();
    const q = parseInt(row.querySelector('.size-qty-input').value) || 0;
    if (s) { sizes.push(s); availability[s] = q; }
  });

  if (sizes.length === 0) { adminToast('Add at least one size', 'error'); return; }

  const editId = document.getElementById('editId').value;

  if (editId) {
    // Update existing
    const idx = data.findIndex(x => x.id === parseInt(editId));
    if (idx > -1) {
      data[idx] = { ...data[idx], name, brand, category: cat, price, badge, description: desc, image, colors, colorImages, sizes, availability };
      adminToast(`"${name}" updated!`);
    }
  } else {
    // Add new
    const newId = Math.max(...data.map(p=>p.id), 0) + 1;
    data.push({ id: newId, name, brand, category: cat, price, badge, description: desc, image, colors: colors.length ? colors : ['Default'], colorImages, sizes, availability });
    adminToast(`"${name}" added to store!`);
  }

  saveData(data);
  renderProductsTable();
  renderStockList();
  resetForm();
  showTab('products', document.querySelector('.nav-item'));
}

// ── DELETE ──
let pendingDeleteId = null;

function confirmDelete(id) {
  const p = data.find(x => x.id === id);
  pendingDeleteId = id;
  document.getElementById('confirmMsg').textContent = `Delete "${p.name}"? This cannot be undone.`;
  document.getElementById('confirmOverlay').classList.add('active');
  document.getElementById('confirmBox').classList.add('active');
  document.getElementById('confirmDeleteBtn').onclick = doDelete;
}

function doDelete() {
  data = data.filter(x => x.id !== pendingDeleteId);
  saveData(data);
  renderProductsTable();
  renderStockList();
  closeConfirm();
  adminToast('Product deleted.');
}

function closeConfirm() {
  document.getElementById('confirmOverlay').classList.remove('active');
  document.getElementById('confirmBox').classList.remove('active');
  pendingDeleteId = null;
}

// ── EDIT MODAL ──
function openEditModal(title, body) {
  document.getElementById('editModalTitle').textContent = title;
  document.getElementById('editModalBody').innerHTML = body;
  document.getElementById('editOverlay').classList.add('active');
  document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
  document.getElementById('editOverlay').classList.remove('active');
  document.getElementById('editModal').classList.remove('active');
}

// ── TOAST ──
function adminToast(msg, type='success') {
  const t = document.getElementById('adminToast');
  t.textContent = msg;
  t.className = `admin-toast show ${type==='error'?'toast-error':''}`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ── SPOTLIGHT ADMIN ──
const SP_KEY = 'shoo_spotlight';
let spSelectedIds = [];
let spPoolFilter = '';

function loadSpotlightIds() {
  try { return JSON.parse(localStorage.getItem(SP_KEY)) || null; } catch(e) { return null; }
}

function renderSpotlightAdmin() {
  const saved = loadSpotlightIds();
  // Validate saved ids still exist in data
  spSelectedIds = saved ? saved.filter(id => data.find(p => p.id === id)) : autoSpotlightIds();
  renderSpPool();
  renderSpSelected();
}

function autoSpotlightIds() {
  const badged = data.filter(p => p.badge);
  const rest   = data.filter(p => !p.badge);
  return [...badged, ...rest].slice(0, 6).map(p => p.id);
}

function renderSpPool() {
  const pool = document.getElementById('spPool');
  const q = spPoolFilter.toLowerCase();
  const list = data.filter(p =>
    (!q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q))
  );
  pool.innerHTML = list.map(p => {
    const inSpot = spSelectedIds.includes(p.id);
    const total = Object.values(p.availability).reduce((a,b)=>a+b,0);
    return `
    <div class="sp-pool-item ${inSpot ? 'sp-in-spotlight' : ''}" onclick="spToggleProduct(${p.id})">
      <img src="${p.image||''}" alt="${p.name}" onerror="this.style.display='none'" />
      <div class="sp-pool-info">
        <span class="sp-pool-name">${p.name}</span>
        <span class="sp-pool-meta">${p.brand} · ${p.category} · $${p.price}</span>
      </div>
      <div class="sp-pool-status">
        ${inSpot ? '<span class="sp-in-badge">★ In Spotlight</span>' : '<span class="sp-add-badge">+ Add</span>'}
      </div>
    </div>`;
  }).join('');
}

function renderSpSelected() {
  const el = document.getElementById('spSelected');
  document.getElementById('spCount').textContent = `${spSelectedIds.length} / 6`;

  if (!spSelectedIds.length) {
    el.innerHTML = '<p class="sp-empty-hint">No products selected. Click products on the left to add them.</p>';
    return;
  }

  el.innerHTML = spSelectedIds.map((id, idx) => {
    const p = data.find(x => x.id === id);
    if (!p) return '';
    return `
    <div class="sp-sel-item" draggable="true" data-id="${id}"
      ondragstart="spDragStart(event,${idx})" ondragover="spDragOver(event)" ondrop="spDrop(event,${idx})" ondragend="spDragEnd()">
      <div class="sp-sel-drag">⠿</div>
      <span class="sp-sel-num">${idx + 1}</span>
      <img src="${p.image||''}" alt="${p.name}" onerror="this.style.display='none'" />
      <div class="sp-sel-info">
        <span class="sp-sel-name">${p.name}</span>
        <span class="sp-sel-meta">${p.brand} · $${p.price}${p.badge ? ' · '+p.badge : ''}</span>
      </div>
      <button class="sp-sel-remove" onclick="spRemove(${id})">✕</button>
    </div>`;
  }).join('');
}

function filterSpPool(val) { spPoolFilter = val; renderSpPool(); }

function spToggleProduct(id) {
  if (spSelectedIds.includes(id)) {
    spRemove(id); return;
  }
  if (spSelectedIds.length >= 6) { adminToast('Max 6 products in spotlight', 'error'); return; }
  spSelectedIds.push(id);
  renderSpPool();
  renderSpSelected();
}

function spRemove(id) {
  spSelectedIds = spSelectedIds.filter(x => x !== id);
  renderSpPool();
  renderSpSelected();
}

function resetSpotlight() {
  spSelectedIds = autoSpotlightIds();
  localStorage.removeItem(SP_KEY);
  renderSpPool();
  renderSpSelected();
  adminToast('Reset to automatic selection');
}

function saveSpotlight() {
  localStorage.setItem(SP_KEY, JSON.stringify(spSelectedIds));
  adminToast('Spotlight saved! Store updated.');
}

// drag-and-drop reorder
let spDragIdx = null;
function spDragStart(e, idx) { spDragIdx = idx; e.currentTarget.classList.add('sp-dragging'); }
function spDragEnd() { document.querySelectorAll('.sp-sel-item').forEach(el => el.classList.remove('sp-dragging','sp-drag-over')); }
function spDragOver(e) { e.preventDefault(); e.currentTarget.classList.add('sp-drag-over'); }
function spDrop(e, toIdx) {
  e.preventDefault();
  if (spDragIdx === null || spDragIdx === toIdx) return;
  const moved = spSelectedIds.splice(spDragIdx, 1)[0];
  spSelectedIds.splice(toIdx, 0, moved);
  spDragIdx = null;
  renderSpSelected();
  renderSpPool();
}
