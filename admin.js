// ============================================================
// MELATOZ — admin.js
// Panel de administración con Supabase Auth + CRUD en la nube
// ============================================================

// ── State ──────────────────────────────────────────────────
let adminProducts = [];
let editingId     = null;

// ── Auth ───────────────────────────────────────────────────
async function doLogin(email, pass) {
  const { error } = await db.auth.signInWithPassword({ email, password: pass });
  return error ? error.message : null;
}

async function doLogout() {
  await db.auth.signOut();
  showLogin();
}

async function getSession() {
  const { data } = await db.auth.getSession();
  return data?.session ?? null;
}

// ── UI toggle ──────────────────────────────────────────────
function showLogin() {
  document.getElementById('login-screen').style.display  = 'flex';
  document.getElementById('admin-screen').style.display  = 'none';
}

function showAdmin() {
  document.getElementById('login-screen').style.display  = 'none';
  document.getElementById('admin-screen').style.display  = 'block';
  loadAndRender();
}

// ── Toast ──────────────────────────────────────────────────
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2800);
}

function setLoginLoading(on) {
  const btn = document.getElementById('btn-login');
  if (!btn) return;
  btn.disabled    = on;
  btn.textContent = on ? 'Ingresando…' : 'Ingresar';
}

// ── Load from Supabase ─────────────────────────────────────
async function loadAndRender() {
  const list = document.getElementById('admin-products-list');
  if (list) list.innerHTML = `<div class="empty-state"><p>Cargando productos…</p></div>`;

  const { data, error } = await db
    .from('products')
    .select('*')
    .order('destacado', { ascending: false })
    .order('id');

  if (error) {
    if (list) list.innerHTML = `<div class="empty-state"><p style="color:#B91C1C">Error al cargar: ${error.message}</p></div>`;
    return;
  }

  adminProducts = data || [];
  renderAdminProducts();
}

// ── Format ─────────────────────────────────────────────────
function formatAdminPrice(n) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// ── Render product list ────────────────────────────────────
function renderAdminProducts() {
  const list    = document.getElementById('admin-products-list');
  const countEl = document.getElementById('product-count');
  if (!list) return;

  if (countEl) countEl.textContent = adminProducts.length;

  if (adminProducts.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D4B8F0" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v8M8 12h8"/></svg>
        <p>No hay productos. ¡Agrega el primero!</p>
      </div>`;
    return;
  }

  list.innerHTML = '';
  adminProducts.forEach(p => {
    const card = document.createElement('div');
    card.className = 'admin-product-card' + (!p.disponible ? ' inactive' : '');
    card.dataset.id = p.id;

    const promoValid = p.promo_activa && p.precio_oferta && p.precio_oferta < p.precio;
    const promoChip  = promoValid
      ? `<span class="admin-chip chip-promo">-${Math.round((1 - p.precio_oferta / p.precio) * 100)}% → $${formatAdminPrice(p.precio_oferta)}</span>`
      : (p.promo_activa ? '<span class="admin-chip chip-promo" style="opacity:.5">Promo (sin precio)</span>' : '');

    card.innerHTML = `
      ${p.imagen
        ? `<img src="${p.imagen}" alt="${p.nombre}" class="admin-product-img"
             onerror="this.outerHTML='<div class=admin-product-img-placeholder>Sin img</div>'" />`
        : `<div class="admin-product-img-placeholder">Sin imagen</div>`
      }
      <div class="admin-product-info">
        <h3>${p.nombre}</h3>
        <div class="admin-product-meta">
          <span class="admin-chip chip-price">$${formatAdminPrice(p.precio)}</span>
          <span class="admin-chip ${p.stock ? 'chip-stock' : 'chip-nostock'}">${p.stock ? 'Con stock' : 'Sin stock'}</span>
          ${!p.disponible ? '<span class="admin-chip chip-hidden">Oculto</span>' : ''}
          <span class="admin-chip chip-cat">${p.categoria}</span>
          ${p.etiqueta ? `<span class="admin-chip" style="background:#EDE0FA;color:#5B2D8E">${p.etiqueta}</span>` : ''}
          ${promoChip}
        </div>
        <p style="font-size:.82rem;color:#7B6A95;line-height:1.5">${p.descripcion || ''}</p>
        <div class="admin-product-actions">
          <button class="btn-edit"           data-action="edit"    data-id="${p.id}">✏️ Editar</button>
          <button class="btn-toggle-stock"   data-action="stock"   data-id="${p.id}">${p.stock ? '✕ Sin stock' : '✓ Activar stock'}</button>
          <button class="btn-toggle-visible" data-action="visible" data-id="${p.id}">${p.disponible ? '👁 Ocultar' : '👁 Mostrar'}</button>
          <button class="btn-delete"         data-action="delete"  data-id="${p.id}">🗑 Eliminar</button>
        </div>
      </div>
    `;
    list.appendChild(card);
  });

  list.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      switch (btn.dataset.action) {
        case 'edit':    openEditModal(id);  break;
        case 'stock':   toggleStock(id);    break;
        case 'visible': toggleVisible(id);  break;
        case 'delete':  deleteProduct(id);  break;
      }
    });
  });
}

// ── Product actions ────────────────────────────────────────
async function toggleStock(id) {
  const p = adminProducts.find(x => x.id === id);
  if (!p) return;
  const newVal = !p.stock;

  const { error } = await db.from('products').update({ stock: newVal }).eq('id', id);
  if (error) { showToast('Error: ' + error.message); return; }

  p.stock = newVal;
  renderAdminProducts();
  showToast(newVal ? `✓ "${p.nombre}" con stock` : `✕ "${p.nombre}" sin stock`);
}

async function toggleVisible(id) {
  const p = adminProducts.find(x => x.id === id);
  if (!p) return;
  const newVal = !p.disponible;

  const { error } = await db.from('products').update({ disponible: newVal }).eq('id', id);
  if (error) { showToast('Error: ' + error.message); return; }

  p.disponible = newVal;
  renderAdminProducts();
  showToast(newVal ? `👁 "${p.nombre}" ahora visible` : `🙈 "${p.nombre}" ocultado`);
}

async function deleteProduct(id) {
  const p = adminProducts.find(x => x.id === id);
  if (!p) return;
  if (!confirm(`¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`)) return;

  const { error } = await db.from('products').delete().eq('id', id);
  if (error) { showToast('Error: ' + error.message); return; }

  adminProducts = adminProducts.filter(x => x.id !== id);
  renderAdminProducts();
  showToast('🗑 Producto eliminado');
}

// ── Modal ──────────────────────────────────────────────────
function openAddModal() {
  editingId = null;
  document.getElementById('modal-title').textContent = 'Agregar producto';
  clearForm();
  document.getElementById('modal-overlay').classList.add('open');
}

function openEditModal(id) {
  const p = adminProducts.find(x => x.id === id);
  if (!p) return;
  editingId = id;
  document.getElementById('modal-title').textContent = 'Editar producto';
  fillForm(p);
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  editingId = null;
}

function clearForm() {
  ['f-nombre','f-marca','f-dosis','f-cantidad','f-sabor','f-precio','f-etiqueta','f-descripcion','f-imagen',
   'f-precio-oferta','f-texto-promo','f-promo-inicio','f-promo-fin']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('f-categoria').value     = 'adultos';
  document.getElementById('f-stock').checked       = true;
  document.getElementById('f-disponible').checked  = true;
  document.getElementById('f-destacado').checked   = false;
  document.getElementById('f-promo-activa').checked = false;
  updateDescuentoPreview();
}

function fillForm(p) {
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v ?? ''; };
  set('f-nombre',      p.nombre);
  set('f-marca',       p.marca);
  set('f-dosis',       p.dosis);
  set('f-cantidad',    p.cantidad);
  set('f-sabor',       p.sabor);
  set('f-precio',      p.precio);
  set('f-etiqueta',    p.etiqueta);
  set('f-descripcion', p.descripcion);
  set('f-imagen',      p.imagen);
  set('f-categoria',   p.categoria || 'adultos');
  document.getElementById('f-stock').checked       = !!p.stock;
  document.getElementById('f-disponible').checked  = !!p.disponible;
  document.getElementById('f-destacado').checked   = !!p.destacado;
  // Promo fields
  document.getElementById('f-promo-activa').checked = !!p.promo_activa;
  set('f-precio-oferta', p.precio_oferta ?? '');
  set('f-texto-promo',   p.texto_promo ?? '');
  set('f-promo-inicio',  p.promo_inicio ? p.promo_inicio.slice(0, 16) : '');
  set('f-promo-fin',     p.promo_fin    ? p.promo_fin.slice(0, 16)    : '');
  updateDescuentoPreview();
}

function getFormData() {
  const precioOfertaRaw = parseFloat(document.getElementById('f-precio-oferta').value);
  const precioOferta    = isNaN(precioOfertaRaw) || precioOfertaRaw <= 0 ? null : Math.round(precioOfertaRaw);

  return {
    nombre:        document.getElementById('f-nombre').value.trim(),
    marca:         document.getElementById('f-marca').value.trim() || 'Natrol',
    dosis:         document.getElementById('f-dosis').value.trim(),
    cantidad:      parseInt(document.getElementById('f-cantidad').value) || 0,
    sabor:         document.getElementById('f-sabor').value.trim(),
    precio:        parseFloat(document.getElementById('f-precio').value) || 0,
    etiqueta:      document.getElementById('f-etiqueta').value.trim(),
    descripcion:   document.getElementById('f-descripcion').value.trim(),
    imagen:        document.getElementById('f-imagen').value.trim(),
    imagenes:      [document.getElementById('f-imagen').value.trim()].filter(Boolean),
    categoria:     document.getElementById('f-categoria').value,
    stock:         document.getElementById('f-stock').checked,
    disponible:    document.getElementById('f-disponible').checked,
    destacado:     document.getElementById('f-destacado').checked,
    // Promo
    promo_activa:  document.getElementById('f-promo-activa').checked,
    precio_oferta: precioOferta,
    texto_promo:   document.getElementById('f-texto-promo').value.trim() || 'Oferta',
    promo_inicio:  document.getElementById('f-promo-inicio').value || null,
    promo_fin:     document.getElementById('f-promo-fin').value    || null,
  };
}

function updateDescuentoPreview() {
  const preview = document.getElementById('f-descuento-preview');
  if (!preview) return;
  const precio  = parseFloat(document.getElementById('f-precio')?.value) || 0;
  const oferta  = parseFloat(document.getElementById('f-precio-oferta')?.value) || 0;
  if (precio > 0 && oferta > 0 && oferta < precio) {
    const pct = Math.round((1 - oferta / precio) * 100);
    preview.textContent = `${pct}% de descuento — ahorro ${formatAdminPrice(precio - oferta)}`;
    preview.className = 'hint promo-preview valid';
  } else if (precio > 0 && oferta > 0 && oferta >= precio) {
    preview.textContent = '⚠ El precio oferta debe ser menor al precio normal';
    preview.className = 'hint promo-preview invalid';
  } else {
    preview.textContent = '—';
    preview.className = 'hint promo-preview';
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const data = getFormData();

  if (!data.nombre)      { alert('El nombre es obligatorio.'); return; }
  if (!data.precio)      { alert('El precio es obligatorio.'); return; }
  if (!data.descripcion) { alert('La descripción es obligatoria.'); return; }
  if (data.promo_activa && data.precio_oferta !== null && data.precio_oferta >= data.precio) {
    alert('El precio de oferta debe ser menor al precio normal. Corrígelo antes de guardar.');
    return;
  }

  const saveBtn = document.querySelector('#product-form .btn-save');
  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Guardando…'; }

  if (editingId !== null) {
    const { error } = await db.from('products').update(data).eq('id', editingId);
    if (error) {
      showToast('Error: ' + error.message);
      if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Guardar producto'; }
      return;
    }
    const idx = adminProducts.findIndex(p => p.id === editingId);
    if (idx !== -1) adminProducts[idx] = { ...adminProducts[idx], ...data };
    showToast('✅ Producto actualizado');
  } else {
    const { data: inserted, error } = await db.from('products').insert(data).select().single();
    if (error) {
      showToast('Error: ' + error.message);
      if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Guardar producto'; }
      return;
    }
    adminProducts.unshift(inserted);
    showToast('✅ Producto agregado');
  }

  renderAdminProducts();
  closeModal();
  if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Guardar producto'; }
}

// ── Init ───────────────────────────────────────────────────
async function initAdmin() {
  const session = await getSession();
  if (session) {
    showAdmin();
  } else {
    showLogin();
  }

  // Login
  const loginBtn = document.getElementById('btn-login');
  loginBtn?.addEventListener('click', async () => {
    const email = document.getElementById('login-email').value.trim();
    const pass  = document.getElementById('login-pass').value;
    const errEl = document.getElementById('login-error');

    if (!email || !pass) {
      if (errEl) { errEl.textContent = 'Completa el correo y la contraseña.'; errEl.style.display = 'block'; }
      return;
    }

    setLoginLoading(true);
    const errorMsg = await doLogin(email, pass);
    setLoginLoading(false);

    if (!errorMsg) {
      if (errEl) errEl.style.display = 'none';
      showAdmin();
    } else {
      if (errEl) { errEl.textContent = 'Credenciales incorrectas.'; errEl.style.display = 'block'; }
      document.getElementById('login-pass').value = '';
    }
  });

  ['login-email', 'login-pass'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') loginBtn?.click();
    });
  });

  // Logout
  document.getElementById('btn-logout')?.addEventListener('click', doLogout);

  // Add product
  document.getElementById('btn-add-product')?.addEventListener('click', openAddModal);

  // Modal close
  document.getElementById('btn-modal-close')?.addEventListener('click', closeModal);
  document.getElementById('btn-modal-cancel')?.addEventListener('click', closeModal);
  document.getElementById('modal-overlay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });

  // Form submit
  document.getElementById('product-form')?.addEventListener('submit', handleFormSubmit);

  // Live promo preview: recalculate when precio or precio_oferta change
  ['f-precio', 'f-precio-oferta'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateDescuentoPreview);
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}
