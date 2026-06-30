const CAT_KEY = 'shoo_categories';

const defaultCategories = [
  {
    key: 'Shoes',
    label: 'Shoes',
    sub: 'Sneakers & Running',
    image: '',
    glowClass: 'cat-glow-orange',
    svgClass: 'cat-shoes',
    svg: `<svg viewBox="0 0 220 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="110" cy="88" rx="90" ry="10" fill="rgba(0,0,0,0.25)"/>
      <path d="M18 72 C18 72 30 48 55 42 L90 36 L130 32 C152 30 168 34 178 44 C184 50 186 58 180 65 C176 70 165 74 148 75 L25 76 C20 76 16 74 18 72Z" fill="url(#shoeGrad)"/>
      <path d="M55 42 L62 22 C64 16 72 14 78 18 L95 36" fill="url(#shoeGrad2)"/>
      <path d="M25 76 L148 75" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
      <defs>
        <linearGradient id="shoeGrad" x1="18" y1="32" x2="186" y2="76" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#f5a623"/><stop offset="100%" stop-color="#e8553e"/></linearGradient>
        <linearGradient id="shoeGrad2" x1="55" y1="14" x2="95" y2="42" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#f5c842"/><stop offset="100%" stop-color="#f5a623"/></linearGradient>
      </defs>
    </svg>`
  },
  {
    key: 'T-Shirts',
    label: 'T-Shirts',
    sub: 'Casual & Sport',
    image: '',
    glowClass: 'cat-glow-blue',
    svgClass: 'cat-shirts',
    svg: `<svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 30 C60 30 50 20 40 20 L10 38 C8 40 8 44 10 46 L28 58 L28 155 C28 158 30 160 33 160 L167 160 C170 160 172 158 172 155 L172 58 L190 46 C192 44 192 40 190 38 L160 20 C150 20 140 30 140 30 C130 42 70 42 60 30Z" fill="url(#shirtGrad)"/>
      <path d="M60 30 C70 42 130 42 140 30" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
      <defs><linearGradient id="shirtGrad" x1="10" y1="20" x2="190" y2="160" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient></defs>
    </svg>`
  },
  {
    key: 'Shorts',
    label: 'Shorts',
    sub: 'Training & Street',
    image: '',
    glowClass: 'cat-glow-green',
    svgClass: 'cat-shorts',
    svg: `<svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 20 L180 20 C180 20 165 110 155 130 C148 145 138 150 128 150 L105 150 L105 80 L95 80 L95 150 L72 150 C62 150 52 145 45 130 C35 110 20 20 20 20Z" fill="url(#shortsGrad)"/>
      <path d="M20 20 L180 20" stroke="rgba(255,255,255,0.4)" stroke-width="3"/>
      <defs><linearGradient id="shortsGrad" x1="20" y1="20" x2="180" y2="150" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#22c55e"/><stop offset="100%" stop-color="#15803d"/></linearGradient></defs>
    </svg>`
  },
  {
    key: 'Pants',
    label: 'Pants',
    sub: 'Joggers & Trackpants',
    image: '',
    glowClass: 'cat-glow-purple',
    svgClass: 'cat-pants',
    svg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M25 20 L175 20 C175 20 162 120 158 160 C156 178 148 188 138 190 L108 190 L105 110 L95 110 L92 190 L62 190 C52 188 44 178 42 160 C38 120 25 20 25 20Z" fill="url(#pantsGrad)"/>
      <path d="M25 20 L175 20" stroke="rgba(255,255,255,0.4)" stroke-width="3"/>
      <defs><linearGradient id="pantsGrad" x1="25" y1="20" x2="175" y2="190" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#a855f7"/><stop offset="100%" stop-color="#7e22ce"/></linearGradient></defs>
    </svg>`
  },
  {
    key: 'Slides',
    label: 'Slides',
    sub: 'Sandals & Clogs',
    image: '',
    glowClass: 'cat-glow-red',
    svgClass: 'cat-slides',
    svg: `<svg viewBox="0 0 220 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="110" cy="90" rx="88" ry="10" fill="rgba(0,0,0,0.2)"/>
      <rect x="22" y="68" width="176" height="18" rx="9" fill="url(#slideBase)"/>
      <path d="M55 68 C55 68 52 45 58 40 L85 36 L135 36 C145 36 150 40 150 48 L150 68Z" fill="url(#slideStrap)"/>
      <defs>
        <linearGradient id="slideBase" x1="22" y1="68" x2="198" y2="86" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#e8553e"/><stop offset="100%" stop-color="#c0392b"/></linearGradient>
        <linearGradient id="slideStrap" x1="55" y1="36" x2="150" y2="68" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#f5a623"/><stop offset="100%" stop-color="#e8553e"/></linearGradient>
      </defs>
    </svg>`
  },
  {
    key: 'Caps',
    label: 'Caps',
    sub: 'Snapback & Dad Hat',
    image: '',
    glowClass: 'cat-glow-yellow',
    svgClass: 'cat-caps',
    svg: `<svg viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="110" cy="105" rx="80" ry="10" fill="rgba(0,0,0,0.2)"/>
      <path d="M30 78 C30 78 35 38 75 28 C90 24 110 24 130 28 C165 36 175 68 175 78Z" fill="url(#capTop)"/>
      <rect x="20" y="76" width="150" height="16" rx="8" fill="url(#capBrim)"/>
      <defs>
        <linearGradient id="capTop" x1="30" y1="24" x2="175" y2="78" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#eab308"/><stop offset="100%" stop-color="#a16207"/></linearGradient>
        <linearGradient id="capBrim" x1="20" y1="76" x2="170" y2="92" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#1a1a1a"/><stop offset="100%" stop-color="#2a2a2a"/></linearGradient>
      </defs>
    </svg>`
  },
  {
    key: 'Outerwear',
    label: 'Outerwear',
    sub: 'Half-Zip & Jackets',
    image: '',
    glowClass: 'cat-glow-teal',
    svgClass: 'cat-outerwear',
    svg: `<svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 28 C60 28 48 18 36 18 L8 38 C6 40 6 44 8 46 L26 58 L26 158 C26 161 28 163 31 163 L84 163 L84 80 L90 80 L90 163 L110 163 L110 80 L116 80 L116 163 L169 163 C172 163 174 161 174 158 L174 58 L192 46 C194 44 194 40 192 38 L164 18 C152 18 140 28 140 28 C130 40 70 40 60 28Z" fill="url(#jacketGrad)"/>
      <path d="M90 80 L110 80" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
      <defs><linearGradient id="jacketGrad" x1="8" y1="18" x2="194" y2="163" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#14b8a6"/><stop offset="100%" stop-color="#0f766e"/></linearGradient></defs>
    </svg>`
  }
];

function loadCategories() {
  try {
    const saved = JSON.parse(localStorage.getItem(CAT_KEY));
    if (saved && saved.length) {
      // Merge saved images/subs into defaults (keep svg/glowClass from defaults)
      return defaultCategories.map(def => {
        const s = saved.find(x => x.key === def.key);
        return s ? { ...def, image: s.image || '', sub: s.sub || def.sub } : def;
      });
    }
  } catch(e) {}
  return defaultCategories;
}
