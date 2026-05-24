/* ============================================================
   SUREAL — Animations & Interactions
   Scroll reveals, cursor, tilt, parallax
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     LOADER
     ============================================================ */
  const loader      = document.getElementById('loader');
  const loaderBar   = document.getElementById('loader-bar');
  const loaderLabel = document.getElementById('loader-label');

  if (loader) {
    let progress = 0;
    const labels = ['INITIALIZING...', 'LOADING ASSETS...', 'CRAFTING EXPERIENCE...', 'READY'];

    const tick = setInterval(() => {
      progress += Math.random() * 18 + 8;
      if (progress >= 100) { progress = 100; clearInterval(tick); }

      if (loaderBar)   loaderBar.style.width   = progress + '%';
      if (loaderLabel) loaderLabel.textContent = labels[Math.floor(progress / 34)] || 'READY';

      if (progress === 100) {
        setTimeout(() => {
          loader.classList.add('hidden');
          document.body.classList.add('loaded');
          triggerHeroAnimations();
        }, 300);
      }
    }, 80);
  } else {
    document.body.classList.add('loaded');
    triggerHeroAnimations();
  }

  /* ============================================================
     CUSTOM CURSOR
     ============================================================ */
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');

  if (dot && ring && !('ontouchstart' in window)) {
    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left  = mx + 'px';
      dot.style.top   = my + 'px';
    });

    /* Ring follows with smooth lag */
    (function ringFollow() {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(ringFollow);
    })();

    /* Hover state */
    const hoverEls = 'a, button, [data-cursor="hover"], .product-card, .filter-pill, .size-btn';
    document.addEventListener('mouseover', e => {
      if (e.target.closest(hoverEls)) ring.classList.add('hovering');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(hoverEls)) ring.classList.remove('hovering');
    });

    document.addEventListener('mousedown', () => {
      dot.style.transform  = 'translate(-50%, -50%) scale(0.6)';
      ring.style.transform = 'translate(-50%, -50%) scale(0.85)';
    });
    document.addEventListener('mouseup', () => {
      dot.style.transform  = 'translate(-50%, -50%) scale(1)';
      ring.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  }

  /* ============================================================
     SCROLL PROGRESS BAR
     ============================================================ */
  const progressBar = document.querySelector('.scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const total    = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (scrolled / total * 100) + '%';
    }, { passive: true });
  }

  /* ============================================================
     NAVIGATION — scroll detection + mobile
     ============================================================ */
  const nav         = document.querySelector('.nav');
  const hamburger   = document.querySelector('.hamburger');
  const mobileNav   = document.querySelector('.mobile-nav');

  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });

    mobileNav.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ============================================================
     INTERSECTION OBSERVER — REVEAL ANIMATIONS
     ============================================================ */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        /* Trigger stagger children */
        if (entry.target.classList.contains('stagger-in')) {
          entry.target.classList.add('visible');
        }
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
  });

  document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-in, .clip-reveal, .clip-reveal-bottom'
  ).forEach(el => revealObserver.observe(el));

  /* ============================================================
     HERO TEXT ANIMATION
     ============================================================ */
  function triggerHeroAnimations() {
    document.querySelectorAll('[data-hero-word]').forEach((el, i) => {
      el.style.animationDelay = (i * 0.12) + 's';
      el.classList.add('animate');
    });

    document.querySelectorAll('[data-fade-in]').forEach((el, i) => {
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, parseInt(el.dataset.fadeIn) || i * 120);
    });
  }

  /* ============================================================
     PRODUCT CARD 3D TILT
     ============================================================ */
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const rotX   = dy * -5;
      const rotY   = dx *  5;

      card.style.transform = `translateY(-6px) perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s var(--ease-smooth)';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });
  });

  /* ============================================================
     PARALLAX (hero images, section backgrounds)
     ============================================================ */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length) {
    window.addEventListener('scroll', () => {
      const sy = window.scrollY;
      parallaxEls.forEach(el => {
        const speed  = parseFloat(el.dataset.parallax) || 0.3;
        const rect   = el.getBoundingClientRect();
        const offset = (rect.top + sy) * speed;
        el.style.transform = `translateY(${offset * 0.1}px)`;
      });
    }, { passive: true });
  }

  /* ============================================================
     MAGNETIC BUTTONS
     ============================================================ */
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect  = el.getBoundingClientRect();
      const cx    = rect.left + rect.width / 2;
      const cy    = rect.top  + rect.height / 2;
      const dx    = e.clientX - cx;
      const dy    = e.clientY - cy;
      el.style.transform = `translate(${dx * 0.3}px, ${dy * 0.3}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });

  /* ============================================================
     BUTTON RIPPLE EFFECT
     ============================================================ */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const rect   = btn.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height) * 2;
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      Object.assign(ripple.style, {
        width:  size + 'px',
        height: size + 'px',
        left:   (e.clientX - rect.left  - size/2) + 'px',
        top:    (e.clientY - rect.top   - size/2) + 'px'
      });
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });

  /* ============================================================
     COUNTER ANIMATION
     ============================================================ */
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.count) || 0;
      const suffix = el.dataset.suffix || '';
      let current  = 0;
      const step   = target / 60;

      const tick = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(tick); }
        el.textContent = Math.floor(current) + suffix;
      }, 16);

      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

  /* ============================================================
     SPLIT TEXT (large headings)
     ============================================================ */
  document.querySelectorAll('[data-split]').forEach(el => {
    const text  = el.textContent;
    const words = text.split(' ');
    el.innerHTML = words.map((word, i) => `
      <span class="split-word" style="display:inline-block; overflow:hidden; margin-right:0.3em; vertical-align:bottom;">
        <span class="split-word-inner" style="display:inline-block; animation: hero-word-in 0.9s var(--ease-smooth) ${i * 0.1}s both;">
          ${word}
        </span>
      </span>
    `).join('');
  });

  /* ============================================================
     MARQUEE PAUSE ON HOVER (handled by CSS)
     SMOOTH SCROLL for anchor links
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ============================================================
     IMAGE LAZY LOAD with fade-in
     ============================================================ */
  const imgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.onload = () => img.classList.add('loaded');
        delete img.dataset.src;
      }
      imgObserver.unobserve(img);
    });
  }, { rootMargin: '200px' });

  document.querySelectorAll('img[data-src]').forEach(img => imgObserver.observe(img));

  /* ============================================================
     ACTIVE NAV LINK (based on current page)
     ============================================================ */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ============================================================
     FORM — floating label effect
     ============================================================ */
  document.querySelectorAll('.form-input').forEach(input => {
    const group = input.closest('.form-group');
    if (!group) return;
    const label = group.querySelector('.form-label');
    if (!label) return;

    if (input.value) label.classList.add('filled');
    input.addEventListener('input', () => {
      label.classList.toggle('filled', input.value.length > 0);
    });
  });

});

/* ============================================================
   GLOBAL UTILITY: smooth page navigation
   ============================================================ */
function navigateTo(url) {
  document.body.style.opacity = '0';
  document.body.style.transform = 'translateY(-8px)';
  document.body.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  setTimeout(() => { window.location.href = url; }, 280);
}
