/* ============================================================
   SUREAL — Cart System
   localStorage-based persistent cart
   ============================================================ */

const Cart = (() => {
  const STORAGE_KEY = 'sureal_cart';

  /* ——— State ——— */
  let items = [];
  let listeners = [];

  /* ——— Init ——— */
  function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { items = JSON.parse(saved); } catch { items = []; }
    }
    updateUI();
  }

  /* ——— Persistence ——— */
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    notify();
    updateUI();
  }

  /* ——— Listeners ——— */
  function subscribe(fn) {
    listeners.push(fn);
    return () => { listeners = listeners.filter(l => l !== fn); };
  }

  function notify() {
    listeners.forEach(fn => fn(items));
  }

  /* ——— Core Actions ——— */
  function add(product, size, qty = 1) {
    const key = `${product.id}-${size}`;
    const existing = items.find(i => i.key === key);

    if (existing) {
      existing.qty += qty;
    } else {
      items.push({
        key,
        id:    product.id,
        name:  product.name,
        price: product.price,
        size,
        qty,
        image: product.images?.[0] || null,
        placeholder: product.placeholder
      });
    }

    save();
    showToast(`${product.name} added to cart`, 'success');
    openDrawer();
  }

  function remove(key) {
    items = items.filter(i => i.key !== key);
    save();
  }

  function updateQty(key, delta) {
    const item = items.find(i => i.key === key);
    if (!item) return;
    item.qty = Math.max(1, item.qty + delta);
    save();
  }

  function clear() {
    items = [];
    save();
  }

  /* ——— Getters ——— */
  function getItems()   { return [...items]; }
  function getCount()   { return items.reduce((s, i) => s + i.qty, 0); }
  function getSubtotal(){ return items.reduce((s, i) => s + i.price * i.qty, 0); }

  /* ——— UI Updates ——— */
  function updateUI() {
    const count = getCount();

    /* Nav badge */
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count;
      el.classList.toggle('visible', count > 0);
    });

    /* Render drawer items */
    renderDrawer();
  }

  function renderDrawer() {
    const container = document.getElementById('cart-items-list');
    const emptyEl   = document.getElementById('cart-empty');
    const footerEl  = document.getElementById('cart-footer');
    const subtotalEl = document.getElementById('cart-subtotal-value');

    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = '';
      emptyEl  && emptyEl.classList.remove('hidden');
      footerEl && footerEl.classList.add('hidden');
      return;
    }

    emptyEl  && emptyEl.classList.add('hidden');
    footerEl && footerEl.classList.remove('hidden');

    container.innerHTML = items.map(item => `
      <div class="cart-item" data-key="${item.key}">
        <div class="cart-item-img">
          ${item.image
            ? `<img src="${item.image}" alt="${item.name}" onerror="this.parentElement.innerHTML='<div class=\\'product-img-placeholder\\'><span class=\\'placeholder-label\\'>${item.placeholder||'ITEM'}</span></div>'">`
            : `<div class="product-img-placeholder"><span class="placeholder-label" style="font-size:14px;">${item.placeholder || 'ITEM'}</span></div>`
          }
        </div>
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-variant">Size: ${item.size}</div>
          <div class="cart-item-price">${formatPrice(item.price * item.qty)}</div>
          <div class="cart-qty-wrap">
            <button class="cart-qty-btn" onclick="Cart.updateQty('${item.key}', -1)">−</button>
            <span class="cart-qty-val">${item.qty}</span>
            <button class="cart-qty-btn" onclick="Cart.updateQty('${item.key}', 1)">+</button>
          </div>
          <button class="cart-item-remove t-caption" onclick="Cart.remove('${item.key}')">
            Remove
          </button>
        </div>
      </div>
    `).join('');

    if (subtotalEl) {
      subtotalEl.textContent = formatPrice(getSubtotal());
    }
  }

  /* ——— Drawer ——— */
  function openDrawer() {
    document.getElementById('cart-overlay')?.classList.add('open');
    document.getElementById('cart-drawer')?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    document.getElementById('cart-overlay')?.classList.remove('open');
    document.getElementById('cart-drawer')?.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ——— Toast ——— */
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-dot ${type}"></div>
      <div class="toast-msg">${message}</div>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('visible'));
    });

    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  /* ——— Public API ——— */
  return {
    init, add, remove, updateQty, clear,
    getItems, getCount, getSubtotal,
    openDrawer, closeDrawer,
    subscribe, showToast
  };
})();

/* Auto-init when DOM ready */
document.addEventListener('DOMContentLoaded', () => Cart.init());

/* Expose globally */
window.Cart = Cart;
window.showToast = Cart.showToast.bind(Cart);
