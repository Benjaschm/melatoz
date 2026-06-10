// ============================================================
// MELATOZ — script.js
// Carrito, productos, WhatsApp, UI interactions
// ============================================================

(async function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────
  let cart      = loadCart();
  let _products = [];   // cargados desde Supabase

  // ── Formatters ─────────────────────────────────────────────
  function formatPrice(n) {
    return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  // ── Promo helpers ──────────────────────────────────────────
  function isPromoActive(p) {
    if (!p.promo_activa) return false;
    const oferta = p.precio_oferta;
    if (!oferta || oferta <= 0 || oferta >= p.precio) return false;
    const now = new Date();
    if (p.promo_inicio && new Date(p.promo_inicio) > now) return false;
    if (p.promo_fin   && new Date(p.promo_fin)   < now) return false;
    return true;
  }

  function getEffectivePrice(p) {
    return isPromoActive(p) ? p.precio_oferta : p.precio;
  }

  function discountPct(p) {
    return Math.round((1 - p.precio_oferta / p.precio) * 100);
  }

  // ── LocalStorage ───────────────────────────────────────────
  function saveCart() {
    try { localStorage.setItem('melatoz_cart', JSON.stringify(cart)); } catch (e) {}
  }
  function loadCart() {
    try {
      const raw = localStorage.getItem('melatoz_cart');
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  // ── Product helpers ────────────────────────────────────────
  function getProductById(id) {
    return _products.find(p => p.id === id);
  }

  function getBadgeClass(etiqueta) {
    if (!etiqueta) return '';
    const map = {
      'kids':        'badge-kids',
      'más vendido': 'badge-best',
      'mejor valor': 'badge-value',
      'nuevo':       'badge-new',
      'sin stock':   'badge-out',
    };
    return map[etiqueta.toLowerCase()] || 'badge-default';
  }

  function createProductCard(product) {
    const inCart     = cart.find(i => i.id === product.id);
    const qty        = (typeof product.stock_cantidad === 'number') ? product.stock_cantidad : null;
    const outOfStock = !product.stock || qty === 0;

    const article = document.createElement('article');
    article.className = 'product-card reveal' + (outOfStock ? ' out-of-stock' : '');
    article.setAttribute('role', 'listitem');
    article.dataset.id       = product.id;
    article.dataset.category = product.categoria;

    const consultMsg = encodeURIComponent(
      `Hola! 👋 Vi en Melatoz que *${product.nombre} ${product.dosis}, ${product.cantidad} gomitas* aparece sin stock.\n¿Tienen disponibilidad próximamente?`
    );

    const imgHtml = product.imagen
      ? `<img
           src="${product.imagen}"
           alt="${product.nombre} ${product.dosis} ${product.cantidad} gomitas — Melatoz"
           class="product-img"
           loading="lazy"
           onerror="this.style.display='none';this.parentElement.classList.add('no-img-product')"
         />`
      : `<div class="product-img-placeholder">
           <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>
           <span>Imagen del producto</span>
         </div>`;

    const badgeClass = outOfStock ? 'badge-out' : getBadgeClass(product.etiqueta);
    const badgeText  = outOfStock ? 'Sin stock' : (product.etiqueta || '');
    const promoOn    = isPromoActive(product);
    const pct        = promoOn ? discountPct(product) : 0;
    const promoLabel = (product.texto_promo || 'Oferta').toUpperCase();

    const addBtnHtml = outOfStock
      ? `<button class="btn-wa-consult" onclick="window.open('https://wa.me/${WHATSAPP_NUMBER}?text=${consultMsg}','_blank')">
           <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
           Consultar disponibilidad
         </button>`
      : `<button class="btn-add-cart${inCart ? ' added' : ''}" data-id="${product.id}">
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
             ${inCart
               ? '<polyline points="20 6 9 17 4 12"/>'
               : '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.98-1.69L23 6H6"/>'}
           </svg>
           ${inCart ? 'En el carrito' : 'Agregar al carrito'}
         </button>`;

    const priceHtml = promoOn
      ? `<div class="product-price-wrap">
           <span class="price-original">${formatPrice(product.precio)}</span>
           <span class="price-sale">${formatPrice(product.precio_oferta)}</span>
           <span class="promo-pct-badge">-${pct}%</span>
         </div>`
      : `<p class="product-price">${formatPrice(product.precio)}</p>`;

    const hasLongDesc = product.descripcion && product.descripcion.length > 80;
    const verMasHtml  = hasLongDesc
      ? `<button class="btn-ver-detalles" data-id="${product.id}" aria-label="Ver detalles de ${product.nombre}">Ver más <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg></button>`
      : '';

    article.innerHTML = `
      <div class="product-img-wrap">
        ${imgHtml}
        ${badgeText ? `<span class="product-badge ${badgeClass}">${badgeText}</span>` : ''}
        <span class="stock-badge ${outOfStock ? 'stock-no' : (qty !== null && qty > 0 ? 'stock-low' : 'stock-ok')}">
          ${outOfStock ? '✕ Sin stock' : (qty !== null && qty > 0 ? `⚡ Quedan ${qty}` : '✓ Disponible')}
        </span>
        ${promoOn ? `<span class="promo-img-badge">${promoLabel}</span>` : ''}
      </div>
      <div class="product-body">
        <div class="product-meta">
          <span class="product-brand">${product.marca}</span>
          <span class="product-specs">${product.dosis} · ${product.cantidad} gomitas</span>
        </div>
        <h3 class="product-name">${product.nombre}</h3>
        <div class="product-desc-wrap">
          <p class="product-desc">${product.descripcion || ''}</p>
          ${verMasHtml}
        </div>
        ${priceHtml}
      </div>
      <div class="product-footer">
        ${addBtnHtml}
      </div>
    `;

    return article;
  }

  // ── Products: showcase (desktop) + carrusel (mobile) ───────
  let activeFilter    = 'todos';
  let activeProductId = null;

  function visibleProducts(filter) {
    const list = _products.filter(p => {
      if (!p.disponible) return false;
      if (filter === 'todos') return true;
      return p.categoria === filter;
    });
    list.sort((a, b) => {
      const ao = a.orden ?? Infinity;
      const bo = b.orden ?? Infinity;
      return ao !== bo ? ao - bo : a.id - b.id;
    });
    return list;
  }

  function bindCartAndDetailButtons(scope) {
    scope.querySelectorAll('.btn-add-cart').forEach(btn => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', () => addToCart(parseInt(btn.dataset.id)));
    });
    scope.querySelectorAll('.btn-ver-detalles').forEach(btn => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', () => {
        const product = getProductById(parseInt(btn.dataset.id));
        if (product) openProductModal(product);
      });
    });
  }

  function buildShowcase(visible, revealed) {
    const p = visible.find(x => x.id === activeProductId) || visible[0];

    const qty         = (typeof p.stock_cantidad === 'number') ? p.stock_cantidad : null;
    const outOfStock  = !p.stock || qty === 0;
    const promoOn     = isPromoActive(p);
    const pct         = promoOn ? discountPct(p) : 0;
    const promoLabel  = (p.texto_promo || 'Oferta').toUpperCase();
    const inCart      = cart.find(i => i.id === p.id);
    const hasLongDesc = p.descripcion && p.descripcion.length > 80;
    const badgeClass  = outOfStock ? 'badge-out' : getBadgeClass(p.etiqueta);
    const badgeText   = outOfStock ? 'Sin stock' : (p.etiqueta || '');
    const stockClass  = outOfStock ? 'stock-no' : (qty !== null && qty > 0 ? 'stock-low' : 'stock-ok');
    const stockText   = outOfStock ? '✕ Sin stock' : (qty !== null && qty > 0 ? `⚡ Quedan ${qty}` : '✓ Disponible');

    const consultMsg = encodeURIComponent(
      `Hola! 👋 Vi en Melatoz que *${p.nombre} ${p.dosis}, ${p.cantidad} gomitas* aparece sin stock.\n¿Tienen disponibilidad próximamente?`
    );

    const priceHtml = promoOn
      ? `<div class="product-price-wrap">
           <span class="price-original">${formatPrice(p.precio)}</span>
           <span class="price-sale">${formatPrice(p.precio_oferta)}</span>
           <span class="promo-pct-badge">-${pct}%</span>
         </div>`
      : `<p class="product-price">${formatPrice(p.precio)}</p>`;

    const ctaHtml = outOfStock
      ? `<button class="btn-wa-consult" onclick="window.open('https://wa.me/${WHATSAPP_NUMBER}?text=${consultMsg}','_blank')">
           <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
           Consultar disponibilidad
         </button>`
      : `<button class="btn-add-cart${inCart ? ' added' : ''}" data-id="${p.id}">
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
             ${inCart
               ? '<polyline points="20 6 9 17 4 12"/>'
               : '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.98-1.69L23 6H6"/>'}
           </svg>
           ${inCart ? 'En el carrito' : 'Agregar al carrito'}
         </button>`;

    const thumbsHtml = visible.length > 1
      ? `<div class="pshow-thumbs" role="tablist" aria-label="Elegir producto">
           ${visible.map(t => {
             const tq    = (typeof t.stock_cantidad === 'number') ? t.stock_cantidad : null;
             const tOut  = !t.stock || tq === 0;
             const tProm = isPromoActive(t);
             return `
               <button class="pshow-thumb${t.id === p.id ? ' active' : ''}${tOut ? ' thumb-out' : ''}"
                       role="tab" aria-selected="${t.id === p.id}" data-id="${t.id}">
                 <span class="pshow-thumb-img" aria-hidden="true">
                   ${t.imagen ? `<img src="${t.imagen}" alt="" loading="lazy">` : ''}
                 </span>
                 <span class="pshow-thumb-txt">
                   <strong>${t.cantidad} gomitas</strong>
                   <span>${t.dosis} · ${formatPrice(tProm ? t.precio_oferta : t.precio)}${tProm ? ` <em class="pshow-thumb-pct">-${discountPct(t)}%</em>` : ''}</span>
                 </span>
               </button>`;
           }).join('')}
         </div>`
      : '';

    const el = document.createElement('div');
    el.className = 'pshow' + (outOfStock ? ' pshow-out' : '') + ' reveal' + (revealed ? ' visible' : '');
    el.innerHTML = `
      <div class="pshow-stage">
        <div class="pshow-glow" aria-hidden="true"></div>
        ${p.imagen
          ? `<img src="${p.imagen}"
                  alt="${p.nombre} ${p.dosis} ${p.cantidad} gomitas — Melatoz"
                  class="pshow-img">`
          : `<div class="product-img-placeholder"><span>Imagen del producto</span></div>`}
        ${badgeText ? `<span class="product-badge ${badgeClass}">${badgeText}</span>` : ''}
        <span class="stock-badge ${stockClass}">${stockText}</span>
        ${promoOn ? `<span class="promo-img-badge">${promoLabel}</span>` : ''}
      </div>
      <div class="pshow-info">
        <div class="pshow-detail">
          <div class="product-meta">
            <span class="product-brand">${p.marca}</span>
            <span class="product-specs">${p.dosis} · ${p.cantidad} gomitas</span>
          </div>
          <h3 class="pshow-name">${p.nombre}</h3>
          <div class="pshow-desc-wrap">
            <p class="pshow-desc">${p.descripcion || ''}</p>
            ${hasLongDesc ? `<button class="btn-ver-detalles" data-id="${p.id}" aria-label="Ver detalles de ${p.nombre}">Ver más <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg></button>` : ''}
          </div>
          <div class="pshow-price">${priceHtml}</div>
          <div class="pshow-cta">${ctaHtml}</div>
        </div>
        ${thumbsHtml}
      </div>
    `;

    el.querySelectorAll('.pshow-thumb').forEach(btn => {
      btn.addEventListener('click', () => setActiveProduct(parseInt(btn.dataset.id)));
    });

    return el;
  }

  function setActiveProduct(id) {
    if (id === activeProductId) return;
    activeProductId = id;
    const grid = document.getElementById('products-grid');
    const old  = grid?.querySelector('.pshow');
    if (!old) return;
    const fresh = buildShowcase(visibleProducts(activeFilter), true);
    old.replaceWith(fresh);
    bindCartAndDetailButtons(fresh);
    fresh.querySelector('.pshow-thumb.active')?.focus({ preventScroll: true });
  }

  function buildCarousel(visible) {
    const wrap  = document.createElement('div');
    wrap.className = 'pcar';

    const track = document.createElement('div');
    track.className = 'pcar-track';
    track.setAttribute('role', 'list');
    track.setAttribute('aria-label', 'Productos, desliza para ver más');

    visible.forEach((p, i) => {
      const card = createProductCard(p);
      card.style.animationDelay = `${i * 0.07}s`;
      track.appendChild(card);
    });
    wrap.appendChild(track);

    if (visible.length > 1) {
      const dots = document.createElement('div');
      dots.className = 'pcar-dots';
      visible.forEach((_, i) => {
        const d = document.createElement('button');
        d.className = 'pcar-dot' + (i === 0 ? ' active' : '');
        d.setAttribute('aria-label', `Ver producto ${i + 1} de ${visible.length}`);
        d.addEventListener('click', () => {
          const card = track.children[i];
          if (!card) return;
          track.scrollTo({
            left: card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2,
            behavior: 'smooth',
          });
        });
        dots.appendChild(d);
      });
      wrap.appendChild(dots);

      let raf = null;
      track.addEventListener('scroll', () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = null;
          const center = track.scrollLeft + track.clientWidth / 2;
          let best = 0, bd = Infinity;
          [...track.children].forEach((c, i) => {
            const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - center);
            if (d < bd) { bd = d; best = i; }
          });
          dots.querySelectorAll('.pcar-dot').forEach((d, i) => d.classList.toggle('active', i === best));
        });
      }, { passive: true });
    }

    return wrap;
  }

  function renderProducts(filter = activeFilter) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    activeFilter = filter;

    const visible = visibleProducts(filter);
    grid.innerHTML = '';

    if (visible.length === 0) {
      grid.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:40px">No hay productos en esta categoría por ahora.</p>`;
      return;
    }

    if (!visible.some(p => p.id === activeProductId)) {
      const def = visible.find(p => isPromoActive(p)) || visible.find(p => p.destacado) || visible[0];
      activeProductId = def.id;
    }

    grid.appendChild(buildShowcase(visible, false));
    grid.appendChild(buildCarousel(visible));

    observeReveal();
    bindCartAndDetailButtons(grid);
  }

  // ── Cart operations ────────────────────────────────────────
  function addToCart(productId) {
    const product = getProductById(productId);
    if (!product || !product.stock) return;

    const maxQty = (typeof product.stock_cantidad === 'number') ? product.stock_cantidad : null;
    if (maxQty === 0) return;

    const existing = cart.find(i => i.id === productId);
    if (existing) {
      if (maxQty !== null && existing.qty >= maxQty) return;
      existing.qty += 1;
    } else {
      cart.push({ id: productId, qty: 1 });
    }

    saveCart();
    updateCartBadge();
    renderCartItems();

    const badge = document.getElementById('cart-count');
    if (badge) {
      badge.classList.remove('bump');
      requestAnimationFrame(() => badge.classList.add('bump'));
    }

    document.querySelectorAll(`.btn-add-cart[data-id="${productId}"]`).forEach(btn => {
      btn.classList.add('added');
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
        En el carrito
      `;
      btn.dataset.justAdded = 'true';
    });
  }

  function removeFromCart(productId) {
    cart = cart.filter(i => i.id !== productId);
    saveCart();
    updateCartBadge();
    renderCartItems();

    document.querySelectorAll(`.btn-add-cart[data-id="${productId}"]`).forEach(btn => {
      btn.classList.remove('added');
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.98-1.69L23 6H6"/>
        </svg>
        Agregar al carrito
      `;
    });
  }

  function updateCartQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    if (delta > 0) {
      const product = getProductById(productId);
      const maxQty = (typeof product?.stock_cantidad === 'number') ? product.stock_cantidad : null;
      if (maxQty !== null && item.qty >= maxQty) return;
    }
    item.qty += delta;
    if (item.qty <= 0) { removeFromCart(productId); return; }
    saveCart();
    updateCartBadge();
    renderCartItems();
  }

  function clearCart() {
    cart = [];
    saveCart();
    updateCartBadge();
    renderCartItems();

    document.querySelectorAll('.btn-add-cart.added').forEach(btn => {
      btn.classList.remove('added');
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.98-1.69L23 6H6"/>
        </svg>
        Agregar al carrito
      `;
    });
  }

  // ── Product detail modal ───────────────────────────────────
  function injectProductModal() {
    const el = document.createElement('div');
    el.innerHTML = `
      <div class="pdm-overlay" id="pdm-overlay"></div>
      <div class="pdm-modal" id="pdm-modal" role="dialog" aria-modal="true" aria-labelledby="pdm-modal-name">
        <div class="pdm-handle"></div>
        <div class="pdm-header">
          <span class="pdm-title">Detalle del producto</span>
          <button class="pdm-close" id="pdm-close" aria-label="Cerrar detalle">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="pdm-body" id="pdm-body"></div>
      </div>
    `;
    document.body.appendChild(el.firstElementChild);
    document.body.appendChild(el.firstElementChild);
    document.getElementById('pdm-overlay').addEventListener('click', closeProductModal);
    document.getElementById('pdm-close').addEventListener('click', closeProductModal);
  }

  function openProductModal(product) {
    const promoOn    = isPromoActive(product);
    const pct        = promoOn ? discountPct(product) : 0;
    const qty        = (typeof product.stock_cantidad === 'number') ? product.stock_cantidad : null;
    const outOfStock = !product.stock || qty === 0;
    const badgeClass = outOfStock ? 'badge-out' : getBadgeClass(product.etiqueta);
    const badgeText  = outOfStock ? 'Sin stock' : (product.etiqueta || '');
    const stockClass = outOfStock ? 'stock-no' : (qty !== null && qty > 0 ? 'stock-low' : 'stock-ok');
    const stockText  = outOfStock ? '✕ Sin stock' : (qty !== null && qty > 0 ? `⚡ Quedan ${qty}` : '✓ Disponible');
    const promoLabel = (product.texto_promo || 'Oferta').toUpperCase();

    const priceHtml = promoOn
      ? `<div class="product-price-wrap">
           <span class="price-original">${formatPrice(product.precio)}</span>
           <span class="price-sale">${formatPrice(product.precio_oferta)}</span>
           <span class="promo-pct-badge">-${pct}%</span>
         </div>`
      : `<p class="product-price">${formatPrice(product.precio)}</p>`;

    const inCart  = cart.find(i => i.id === product.id);
    const maxQty  = (typeof product.stock_cantidad === 'number') ? product.stock_cantidad : null;
    const atMax   = maxQty !== null && inCart && inCart.qty >= maxQty;
    const consultMsg = encodeURIComponent(
      `Hola! 👋 Vi en Melatoz que *${product.nombre} ${product.dosis}, ${product.cantidad} gomitas* aparece sin stock.\n¿Tienen disponibilidad próximamente?`
    );

    const waSVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>`;
    const cartSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.98-1.69L23 6H6"/></svg>`;
    const checkSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;

    const addBtnHtml = outOfStock
      ? `<button class="btn-wa-consult" onclick="window.open('https://wa.me/${WHATSAPP_NUMBER}?text=${consultMsg}','_blank')">${waSVG} Consultar disponibilidad</button>`
      : `<button class="btn-add-cart${inCart ? ' added' : ''}${atMax ? ' at-max' : ''}" id="pdm-add-btn" data-id="${product.id}" ${atMax ? 'disabled' : ''}>${inCart ? checkSVG : cartSVG} ${inCart ? (atMax ? `Máximo (${maxQty})` : 'En el carrito') : 'Agregar al carrito'}</button>`;

    document.getElementById('pdm-body').innerHTML = `
      <div class="pdm-img-wrap">
        ${product.imagen
          ? `<img src="${product.imagen}" alt="${product.nombre}" class="pdm-img" loading="lazy">`
          : `<div style="color:var(--purple-300);font-size:.85rem">Sin imagen</div>`}
        ${promoOn ? `<span class="promo-img-badge">${promoLabel}</span>` : ''}
      </div>
      <div class="pdm-badges">
        ${badgeText ? `<span class="product-badge pdm-badge-inline ${badgeClass}">${badgeText}</span>` : ''}
        <span class="stock-badge pdm-stock-inline ${stockClass}">${stockText}</span>
      </div>
      <div class="pdm-meta">
        <span class="product-brand">${product.marca}</span>
        <span class="product-specs">${product.dosis} · ${product.cantidad} gomitas</span>
      </div>
      <h2 class="pdm-name" id="pdm-modal-name">${product.nombre}</h2>
      <p class="pdm-desc">${product.descripcion || ''}</p>
      <div class="pdm-price-row">${priceHtml}</div>
      <div class="pdm-actions">${addBtnHtml}</div>
    `;

    if (!outOfStock) {
      document.getElementById('pdm-add-btn')?.addEventListener('click', () => {
        addToCart(product.id);
        closeProductModal();
      });
    }

    document.getElementById('pdm-overlay').classList.add('open');
    document.getElementById('pdm-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeProductModal() {
    document.getElementById('pdm-overlay')?.classList.remove('open');
    document.getElementById('pdm-modal')?.classList.remove('open');
    document.body.style.overflow = '';
  }

  function calculateTotal() {
    return cart.reduce((sum, item) => {
      const p = getProductById(item.id);
      return sum + (p ? getEffectivePrice(p) * item.qty : 0);
    }, 0);
  }

  function getTotalItems() {
    return cart.reduce((s, i) => s + i.qty, 0);
  }

  // ── Cart UI ────────────────────────────────────────────────
  function updateCartBadge() {
    const badge = document.getElementById('cart-count');
    if (!badge) return;
    const count = getTotalItems();
    badge.textContent = count;
    badge.classList.toggle('visible', count > 0);
  }

  function renderCartItems() {
    const list    = document.getElementById('cart-items');
    const empty   = document.getElementById('cart-empty');
    const footer  = document.getElementById('cart-footer');
    const total   = document.getElementById('cart-total-price');
    const countEl = document.getElementById('cart-item-count');

    if (!list) return;

    if (cart.length === 0) {
      list.style.display   = 'none';
      if (empty)  empty.style.display  = 'flex';
      if (footer) footer.style.display = 'none';
      return;
    }

    list.style.display = 'flex';
    if (empty)  empty.style.display  = 'none';
    if (footer) footer.style.display = 'flex';

    list.innerHTML = '';
    cart.forEach(item => {
      const p = getProductById(item.id);
      if (!p) return;

      const promoOn    = isPromoActive(p);
      const effPrice   = getEffectivePrice(p);
      const pct        = promoOn ? discountPct(p) : 0;
      const maxQty     = (typeof p.stock_cantidad === 'number') ? p.stock_cantidad : null;
      const atMax      = maxQty !== null && item.qty >= maxQty;

      const priceHtml = promoOn
        ? `<div class="cart-item-price-wrap">
             <span class="cart-item-price-sale">${formatPrice(effPrice * item.qty)}</span>
             <span class="cart-item-price-original">${formatPrice(p.precio * item.qty)}</span>
             <span class="cart-promo-tag">-${pct}% OFF</span>
           </div>`
        : `<span class="cart-item-price">${formatPrice(effPrice * item.qty)}</span>`;

      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        ${p.imagen
          ? `<img src="${p.imagen}" alt="${p.nombre}" class="cart-item-img"
               onerror="this.outerHTML='<div class=cart-item-img-placeholder>Sin imagen</div>'" />`
          : `<div class="cart-item-img-placeholder">Sin imagen</div>`
        }
        <div class="cart-item-details">
          <p class="cart-item-name">${p.nombre}</p>
          <p class="cart-item-sub">${p.dosis} · ${p.cantidad} gomitas</p>
          <div class="cart-item-controls">
            <div class="qty-controls">
              <button class="btn-qty" data-action="dec" data-id="${p.id}" aria-label="Disminuir cantidad">−</button>
              <span class="qty-value">${item.qty}</span>
              <button class="btn-qty${atMax ? ' at-max' : ''}" data-action="inc" data-id="${p.id}" aria-label="Aumentar cantidad" ${atMax ? 'disabled' : ''}>+</button>
            </div>
            ${atMax ? `<span class="cart-stock-max">máx. ${maxQty}</span>` : ''}
            ${priceHtml}
            <button class="btn-remove-item" data-id="${p.id}" aria-label="Eliminar producto">✕ quitar</button>
          </div>
        </div>
      `;
      list.appendChild(div);
    });

    list.querySelectorAll('.btn-qty').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        btn.dataset.action === 'inc' ? updateCartQty(id, +1) : updateCartQty(id, -1);
      });
    });
    list.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.id)));
    });

    if (total)   total.textContent   = formatPrice(calculateTotal());
    if (countEl) {
      const n = getTotalItems();
      countEl.textContent = n === 1 ? '1 producto' : `${n} productos`;
    }
  }

  // ── WhatsApp ───────────────────────────────────────────────
  function generateWhatsAppMessage() {
    if (cart.length === 0) {
      return encodeURIComponent(
        'Hola! 👋 Quiero consultar por las melatoninas disponibles en *Melatoz*. ¿Me pueden dar más información?'
      );
    }

    let msg = 'Hola! 👋 Quiero comprar en *Melatoz* los siguientes productos:\n\n';
    cart.forEach(item => {
      const p = getProductById(item.id);
      if (!p) return;
      if (isPromoActive(p)) {
        msg += `• *${p.nombre}* ${p.dosis}, ${p.cantidad} gomitas × ${item.qty} — Promo: ${formatPrice(p.precio_oferta)} CLP (antes ${formatPrice(p.precio)})\n`;
      } else {
        msg += `• *${p.nombre}* ${p.dosis}, ${p.cantidad} gomitas × ${item.qty} — ${formatPrice(p.precio)} CLP\n`;
      }
    });

    const total = calculateTotal();
    msg += `\n*Total estimado: ${formatPrice(total)} CLP*\n\n`;
    msg += '¿Me pueden confirmar disponibilidad, forma de pago y cómo coordinar la entrega? 🙏';

    return encodeURIComponent(msg);
  }

  function openWhatsAppCart() {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${generateWhatsAppMessage()}`, '_blank', 'noopener,noreferrer');
  }

  function updateWaFloat() {
    const btn = document.getElementById('wa-float');
    if (!btn) return;
    btn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${generateWhatsAppMessage()}`;
  }

  // ── Cart drawer ────────────────────────────────────────────
  function openCart() {
    document.getElementById('cart-drawer')?.classList.add('open');
    document.getElementById('cart-overlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    document.getElementById('cart-drawer')?.classList.remove('open');
    document.getElementById('cart-overlay')?.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ── Mobile menu ────────────────────────────────────────────
  let menuOpen = false;

  function openMenu() {
    menuOpen = true;
    document.getElementById('mobile-menu')?.classList.add('open');
    document.getElementById('mobile-overlay')?.classList.add('open');
    document.getElementById('menu-btn')?.classList.add('open');
    document.getElementById('menu-btn')?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menuOpen = false;
    document.getElementById('mobile-menu')?.classList.remove('open');
    document.getElementById('mobile-overlay')?.classList.remove('open');
    document.getElementById('menu-btn')?.classList.remove('open');
    document.getElementById('menu-btn')?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  // ── FAQ ────────────────────────────────────────────────────
  function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item   = btn.closest('.faq-item');
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(el => {
          el.classList.remove('open');
          el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // ── Filter tabs ────────────────────────────────────────────
  function initFilterTabs() {
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.filter-tab').forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        renderProducts(tab.dataset.filter);
      });
    });
  }

  // ── Scroll reveal ──────────────────────────────────────────
  let revealObserver;

  function observeReveal() {
    if (revealObserver) {
      document.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObserver.observe(el));
      return;
    }
    revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  }

  // ── Header scroll ──────────────────────────────────────────
  function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  // ── Stars ──────────────────────────────────────────────────
  function generateStars() {
    const container = document.getElementById('stars-container');
    if (!container) return;
    const count    = window.innerWidth < 768 ? 60 : 120;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      const size = Math.random() * 2 + 0.5;
      star.style.cssText = `
        left:${Math.random() * 100}%;top:${Math.random() * 100}%;
        width:${size}px;height:${size}px;opacity:${Math.random() * .6 + .2};
        --twinkle-dur:${(Math.random() * 3 + 2).toFixed(1)}s;
        --twinkle-delay:${(Math.random() * 4).toFixed(1)}s;
      `;
      fragment.appendChild(star);
    }
    container.appendChild(fragment);
  }

  // ── Smooth scroll ──────────────────────────────────────────
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const id     = link.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 68;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
        if (menuOpen) closeMenu();
      });
    });
  }

  // ── Dynamic content ────────────────────────────────────────
  function fillDynamicContent() {
    const yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    [document.getElementById('contact-schedule-wa'), document.getElementById('contact-schedule-text')]
      .forEach(el => { if (el) el.textContent = HORARIO_ATENCION; });

    if (INSTAGRAM_HANDLE) {
      const igUrl = `https://www.instagram.com/${INSTAGRAM_HANDLE}`;
      [document.getElementById('contact-ig-link'), document.getElementById('footer-ig-link')]
        .forEach(el => { if (el) el.href = igUrl; });
    }
  }

  // ── Empty cart browse ──────────────────────────────────────
  function initEmptyCartBrowse() {
    document.getElementById('cart-empty-browse')?.addEventListener('click', e => {
      e.preventDefault();
      closeCart();
      setTimeout(() => {
        const sec = document.getElementById('productos');
        if (sec) {
          const h = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 68;
          window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY - h, behavior: 'smooth' });
        }
      }, 300);
    });
  }

  // ── Bind events ────────────────────────────────────────────
  function bindEvents() {
    document.getElementById('cart-btn')?.addEventListener('click', openCart);
    document.getElementById('cart-close')?.addEventListener('click', closeCart);
    document.getElementById('cart-overlay')?.addEventListener('click', closeCart);
    document.getElementById('cart-clear-btn')?.addEventListener('click', () => {
      if (confirm('¿Vaciar el carrito?')) clearCart();
    });
    document.getElementById('cart-whatsapp-btn')?.addEventListener('click', openWhatsAppCart);
    document.getElementById('menu-btn')?.addEventListener('click', () => menuOpen ? closeMenu() : openMenu());
    document.getElementById('menu-close')?.addEventListener('click', closeMenu);
    document.getElementById('mobile-overlay')?.addEventListener('click', closeMenu);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeCart(); closeMenu(); closeProductModal(); }
    });
  }

  // ── Init ───────────────────────────────────────────────────
  async function init() {
    // Mostrar skeleton mientras carga
    const grid = document.getElementById('products-grid');
    if (grid) {
      grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted);font-size:.95rem">Cargando productos…</p>`;
    }

    // Cargar productos desde Supabase (fallback a products.js si falla)
    try {
      const { data, error } = await db
        .from('products')
        .select('*')
        .order('orden', { ascending: true, nullsFirst: false })
        .order('id');
      if (error) throw error;
      _products = data || [];
    } catch (err) {
      console.warn('[Melatoz] Supabase no disponible, usando products.js local.', err.message);
      _products = (typeof PRODUCTS !== 'undefined') ? [...PRODUCTS] : [];
    }

    injectProductModal();
    generateStars();
    renderProducts();
    renderCartItems();
    updateCartBadge();
    updateWaFloat();
    fillDynamicContent();
    initFAQ();
    initFilterTabs();
    bindEvents();
    initSmoothScroll();
    initHeaderScroll();
    observeReveal();
    initEmptyCartBrowse();

    setInterval(updateWaFloat, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
