/* ── INTERACTIONS.JS — SHOO SPORTS LB ── */

// ── PAGE LOADER ──
(function() {
  const loader = document.getElementById('pageLoader');
  if (!loader) return;
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 1200);
  });
})();

// ── CUSTOM CURSOR ──
(function() {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  const hoverTargets = 'a, button, .product-card, .cat-card, .brand-card, .btn-spotlight, .contact-card, .filter-tab, select';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) {
      ring.classList.add('hovered');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) {
      ring.classList.remove('hovered');
    }
  });
})();

// ── SCROLL REVEAL ──
(function() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
        const index = siblings.indexOf(el);
        const delay = index * 80;
        setTimeout(() => {
          el.classList.add('revealed');
        }, delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  function observeRevealElements() {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
      observer.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeRevealElements);
  } else {
    observeRevealElements();
  }
})();

// ── 3D CARD TILT ──
(function() {
  function applyTilt(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 6;
    const rotateX = -((y - centerY) / centerY) * 6;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(4px)`;
  }

  function resetTilt(e) {
    e.currentTarget.style.transform = '';
  }

  function bindTilt() {
    document.querySelectorAll('.product-card').forEach(card => {
      if (!card._tiltBound) {
        card.addEventListener('mousemove', applyTilt);
        card.addEventListener('mouseleave', resetTilt);
        card._tiltBound = true;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindTilt();
    // re-bind after products render
    const grid = document.getElementById('productsGrid');
    if (grid) {
      const mo = new MutationObserver(bindTilt);
      mo.observe(grid, { childList: true });
    }
  });
})();

// ── STAT COUNTERS ──
(function() {
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start = performance.now();
    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.count-up[data-target]').forEach(el => observer.observe(el));
  });
})();

// ── PARALLAX HERO ──
(function() {
  const orbs = document.querySelectorAll('.hero-orb');
  if (!orbs.length) return;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    orbs.forEach((orb, i) => {
      const speed = 0.3 * (i + 1) * 0.5;
      orb.style.transform = `translateY(${scrollY * speed}px)`;
    });
  }, { passive: true });
})();

// ── MAGNETIC BUTTONS ──
(function() {
  function applyMagnetic(e) {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  }

  function resetMagnetic(e) {
    e.currentTarget.style.transform = '';
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
      btn.addEventListener('mousemove', applyMagnetic);
      btn.addEventListener('mouseleave', resetMagnetic);
    });
  });
})();
