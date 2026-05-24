/* ============================================================
   SUREAL — Main Application Logic
   Shared functionality across all pages
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     CART DRAWER TOGGLE
     ============================================================ */
  document.querySelectorAll('[data-open-cart]').forEach(btn => {
    btn.addEventListener('click', () => Cart.openDrawer());
  });

  const cartOverlay = document.getElementById('cart-overlay');
  const cartClose   = document.getElementById('cart-close');

  cartOverlay?.addEventListener('click', () => Cart.closeDrawer());
  cartClose?.addEventListener('click',   () => Cart.closeDrawer());

  /* Keyboard: Escape closes drawer */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      Cart.closeDrawer();
      const mobileNav = document.querySelector('.mobile-nav');
      const hamburger = document.querySelector('.hamburger');
      if (mobileNav?.classList.contains('open')) {
        mobileNav.classList.remove('open');
        hamburger?.classList.remove('open');
        document.body.style.overflow = '';
      }
    }
  });

  /* ============================================================
     PRODUCT CARD RENDERING
     Renders product cards into any [data-products-grid]
     ============================================================ */
  function renderProductCard(product, options = {}) {
    const tagHTML = product.tag
      ? `<div class="product-tag ${product.tag === 'NEW' ? 'new' : product.tag === 'SALE' ? '' : ''}">${product.tag}</div>`
      : '';

    const imgHTML = (product.images && product.images[0])
      ? `<img src="${product.images[0]}"
              alt="${product.name}"
              loading="lazy"
              onerror="this.parentElement.innerHTML='<div class=\\'product-img-placeholder\\'><span class=\\'placeholder-label\\'>${product.placeholder}</span></div>'">`
      : `<div class="product-img-placeholder">
           <span class="placeholder-label">${product.placeholder}</span>
         </div>`;

    const priceHTML = product.originalPrice
      ? `<span class="product-price">${formatPrice(product.price)}</span>
         <span class="product-price-original">${formatPrice(product.originalPrice)}</span>`
      : `<span class="product-price">${formatPrice(product.price)}</span>`;

    const wishlisted = typeof Auth !== 'undefined' && Auth.isWishlisted(product.id);

    return `
      <div class="product-card reveal" data-product-id="${product.id}">
        <div class="product-img-wrap">
          ${tagHTML}
          ${imgHTML}
          <button class="product-wishlist ${wishlisted ? 'active' : ''}"
                  onclick="handleWishlist(event, '${product.id}')"
                  title="Save to wishlist">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${wishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          <div class="product-overlay">
            <button class="product-quick-add"
                    onclick="handleQuickAdd(event, '${product.id}')">
              Quick Add +
            </button>
          </div>
        </div>
        <div class="product-info">
          <a href="product.html?id=${product.id}">
            <div class="product-name">${product.name}</div>
          </a>
          <div class="product-price-wrap">${priceHTML}</div>
        </div>
      </div>
    `;
  }

  window.renderProductCard = renderProductCard;

  /* ============================================================
     QUICK ADD (picks first available size)
     ============================================================ */
  window.handleQuickAdd = function(e, productId) {
    e.preventDefault();
    e.stopPropagation();

    const product = getProductById(productId);
    if (!product) return;

    const availableSize = product.sizes.find(s => !product.unavailableSizes.includes(s));
    if (!availableSize) {
      Cart.showToast('This product is sold out.', 'error');
      return;
    }

    Cart.add(product, availableSize, 1);
  };

  /* ============================================================
     WISHLIST TOGGLE
     ============================================================ */
  window.handleWishlist = function(e, productId) {
    e.preventDefault();
    e.stopPropagation();

    if (typeof Auth === 'undefined') return;

    const added = Auth.toggleWishlist(productId);
    const btn   = e.currentTarget;

    btn.classList.toggle('active', added);

    const svg = btn.querySelector('path');
    if (svg) svg.setAttribute('fill', added ? 'currentColor' : 'none');

    Cart.showToast(
      added ? 'Added to wishlist' : 'Removed from wishlist',
      'info'
    );
  };

  /* ============================================================
     HOME PAGE — Render featured products
     ============================================================ */
  const featuredGrid = document.getElementById('featured-products-grid');
  if (featuredGrid && typeof getFeaturedProducts === 'function') {
    const featured = getFeaturedProducts();
    featuredGrid.innerHTML = featured.map(p => renderProductCard(p)).join('');

    /* Re-observe reveals */
    setTimeout(() => {
      document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
        const obs = new IntersectionObserver(entries => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              e.target.classList.add('visible');
              obs.unobserve(e.target);
            }
          });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        obs.observe(el);
      });
    }, 100);
  }

  /* ============================================================
     NEWSLETTER FORM
     ============================================================ */
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const email = input?.value?.trim();

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        Cart.showToast('Please enter a valid email.', 'error');
        return;
      }

      /* Save to localStorage (replace with API call) */
      const subs = JSON.parse(localStorage.getItem('sureal_subs') || '[]');
      if (!subs.includes(email)) {
        subs.push(email);
        localStorage.setItem('sureal_subs', JSON.stringify(subs));
      }

      Cart.showToast('Welcome to SUREAL. ✦', 'success');
      if (input) input.value = '';
    });
  });

  /* ============================================================
     CHECKOUT CTA (from cart drawer)
     ============================================================ */
  const checkoutBtn = document.getElementById('cart-checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (Cart.getCount() === 0) {
        Cart.showToast('Your cart is empty.', 'error');
        return;
      }
      Cart.closeDrawer();
      navigateTo('checkout.html');
    });
  }

});

/* ============================================================
   GLOBAL: formatPrice (shares with products.js)
   ============================================================ */
if (typeof window.formatPrice === 'undefined') {
  window.formatPrice = (price) => '€' + Number(price).toFixed(2);
}
