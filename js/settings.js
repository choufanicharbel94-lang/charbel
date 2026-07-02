/* ── SITE SETTINGS — theme, content & section layout ── */
/* Shared by index.html (applies everything) and admin.html (reads/writes via the Design tab). */

const FONT_PAIRINGS = {
  'bebas-inter': {
    label: 'Bebas Neue / Inter', display: "'Bebas Neue', sans-serif", body: "'Inter', sans-serif",
    google: 'family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;900'
  },
  'anton-manrope': {
    label: 'Anton / Manrope', display: "'Anton', sans-serif", body: "'Manrope', sans-serif",
    google: 'family=Anton&family=Manrope:wght@300;400;500;600;700;800'
  },
  'archivo-work': {
    label: 'Archivo Black / Work Sans', display: "'Archivo Black', sans-serif", body: "'Work Sans', sans-serif",
    google: 'family=Archivo+Black&family=Work+Sans:wght@300;400;500;600;700'
  },
  'league-space': {
    label: 'League Gothic / Space Grotesk', display: "'League Gothic', sans-serif", body: "'Space Grotesk', sans-serif",
    google: 'family=League+Gothic&family=Space+Grotesk:wght@300;400;500;600;700'
  }
};

const SECTION_LABELS = {
  marquee: 'Brand Marquee', speedstats: 'Speed Stats', categories: 'Categories',
  spotlight: 'Spotlight Carousel', brands: 'Top Brands', energy: 'Energy Banner',
  about: 'About', contact: 'Contact'
};

const DEFAULT_SETTINGS = {
  theme: { accent: '#f5a623', accent2: '#e8553e', font: 'bebas-inter' },
  content: {
    brandName: 'SHOO', brandMark: '!', brandSub: 'SPORTS',
    heroBadge: 'Now Delivering All Over Lebanon',
    heroEyebrow: 'EST. 2018 · HARET SAIDA, LEBANON',
    heroLine1: 'BRING', heroAccent: 'POWER', heroLine2: 'TO YOUR STEPS',
    heroSub: 'Premium sneakers, streetwear & sportswear.\nDelivery available all over Lebanon.',
    aboutEyebrow: 'Who We Are', aboutTitle: 'Shoo Sports LB',
    aboutPara1: "Since 2018, Shoo Sports has been Lebanon's go-to destination for premium sneakers and sportswear. Located in the heart of Haret Saida, we carry the latest drops from On Running, Nike, Gymshark, Adidas, and more.",
    aboutPara2: "We believe every step should feel powerful — that's why we stock only authentic, quality gear for athletes, sneakerheads, and streetwear lovers alike.",
    footerTagline: 'Bring Power To Your Steps',
    waNumber: '96176123456', igHandle: 'shoosports.lb', ttHandle: 'shoosports.lb',
    location: 'Haret Saida, Lebanon'
  },
  sections: {
    order: ['marquee', 'speedstats', 'categories', 'spotlight', 'brands', 'energy', 'about', 'contact'],
    visible: { marquee: true, speedstats: true, categories: true, spotlight: true, brands: true, energy: true, about: true, contact: true }
  }
};

function deepMerge(base, override) {
  const out = Array.isArray(base) ? base.slice() : { ...base };
  if (!override) return out;
  Object.keys(override).forEach(key => {
    const val = override[key];
    if (val && typeof val === 'object' && !Array.isArray(val) && typeof out[key] === 'object' && !Array.isArray(out[key])) {
      out[key] = deepMerge(out[key], val);
    } else if (val !== undefined) {
      out[key] = val;
    }
  });
  return out;
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem('shoo_site_settings') || 'null');
    return deepMerge(DEFAULT_SETTINGS, saved);
  } catch (e) {
    return deepMerge(DEFAULT_SETTINGS, null);
  }
}

function saveSettings(settings) {
  localStorage.setItem('shoo_site_settings', JSON.stringify(settings));
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent2', theme.accent2);

  const pairing = FONT_PAIRINGS[theme.font] || FONT_PAIRINGS['bebas-inter'];
  root.style.setProperty('--font-display', pairing.display);
  root.style.setProperty('--font-body', pairing.body);

  if (theme.font !== 'bebas-inter') {
    let link = document.getElementById('dynamicFontLink');
    if (!link) {
      link = document.createElement('link');
      link.id = 'dynamicFontLink';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?${pairing.google}&display=swap`;
  }
}

function applyContent(content) {
  document.querySelectorAll('[data-field]').forEach(el => {
    const key = el.dataset.field;
    if (content[key] != null && content[key] !== '') el.textContent = content[key];
  });

  const heroSub = document.getElementById('heroSubText');
  if (heroSub && content.heroSub) {
    heroSub.innerHTML = content.heroSub.split('\n').map(line => line).join('<br/>');
  }

  const wa = content.waNumber, ig = content.igHandle, tt = content.ttHandle;
  const waHref = `https://wa.me/${wa}`;
  const igHref = `https://www.instagram.com/${ig}`;
  const ttHref = `https://www.tiktok.com/@${tt}`;
  ['contactWaLink', 'footerWaLink'].forEach(id => { const el = document.getElementById(id); if (el) el.href = waHref; });
  ['contactIgLink', 'footerIgLink'].forEach(id => { const el = document.getElementById(id); if (el) el.href = igHref; });
  ['contactTtLink', 'footerTtLink'].forEach(id => { const el = document.getElementById(id); if (el) el.href = ttHref; });
}

function applySections(sections) {
  const order = sections.order || DEFAULT_SETTINGS.sections.order;
  const visible = sections.visible || DEFAULT_SETTINGS.sections.visible;

  order.forEach(key => {
    const el = document.querySelector(`[data-section="${key}"]`);
    if (!el) return;
    document.body.appendChild(el);
    el.style.display = visible[key] === false ? 'none' : '';
  });

  const footer = document.querySelector('.footer');
  if (footer) document.body.appendChild(footer);
}

function applySettings(settings) {
  applyTheme(settings.theme);
  applyContent(settings.content);
  applySections(settings.sections);
}
