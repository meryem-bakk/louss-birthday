/* =========================================================
   cake.js — 03 · Build your cake
   The cake is an SVG drawn in code. Every choice re-draws
   only its own layer, with a small animation.
   ========================================================= */
function initCakeBuilder() {
  const svg = document.getElementById('cakeSvg');
  const stage = document.getElementById('cakeStage');
  const builder = document.getElementById('cakeBuilder');
  const panel = document.getElementById('cakePanel');
  const actions = document.getElementById('cakeActions');
  const finishBtn = document.getElementById('cakeFinish');
  const hintEl = document.getElementById('cakeHint');
  const wishEl = document.getElementById('cakeWish');
  const doneCard = document.getElementById('cakeDone');
  const AGE = Math.max(1, Math.min(40, parseInt(CONFIG.age, 10) || 1));

  /* ---------- Options (labels, colours) ---------- */
  const CAKES = [
    { id: 'vanilla', label: 'Vanilla', body: '#F6E3C1', top: '#FBEFD9', layer: '#E8C795' },
    { id: 'chocolate', label: 'Chocolate', body: '#8A5A44', top: '#A06C53', layer: '#5E3B2C' },
    { id: 'strawberry', label: 'Strawberry', body: '#F4BCC4', top: '#F9D3D8', layer: '#E58F9E' },
    { id: 'redvelvet', label: 'Red Velvet', body: '#B5485A', top: '#C25E6E', layer: '#FFF3EA' }
  ];
  const FROSTINGS = [
    { id: 'vanilla', label: 'Vanilla', color: '#FFF7EA' },
    { id: 'chocolate', label: 'Chocolate', color: '#6E4535' },
    { id: 'strawberry', label: 'Strawberry', color: '#F7C9D1' },
    { id: 'pink', label: 'Pink cream', color: '#F1A7BB' }
  ];
  const TOPPINGS = [
    { id: 'strawberries', label: 'Strawberries', icon: '🍓' },
    { id: 'cherries', label: 'Cherries', icon: '🍒' },
    { id: 'macarons', label: 'Macarons', swatch: 'linear-gradient(#F5C2CF 0 40%, #FFF6EA 40% 60%, #D9CBEF 60%)' },
    { id: 'sprinkles', label: 'Sprinkles', swatch: 'conic-gradient(#F5C2CF, #D9CBEF, #CFE0C8, #FBE3B4, #F5C2CF)' },
    { id: 'flowers', label: 'Small flowers', icon: '🌸' },
    { id: 'chocolate', label: 'Chocolate pieces', icon: '🍫' }
  ];
  const CANDLE_STYLES = [
    { id: 'none', label: 'None', swatch: 'repeating-linear-gradient(135deg, #fff 0 5px, #F5DDE3 5px 7px)' },
    { id: 'simple', label: 'Simple', swatch: 'linear-gradient(90deg, #FFF6EA 35%, #F1E2D0 35% 65%, #FFF6EA 65%)' },
    { id: 'colorful', label: 'Colourful', swatch: 'repeating-linear-gradient(45deg, #F5C2CF 0 5px, #fff 5px 8px, #D9CBEF 8px 13px, #fff 13px 16px)' },
    { id: 'star', label: 'Stars', icon: '⭐' },
    { id: 'number', label: `Number ${AGE}`, icon: String(AGE) }
  ];
  const CANDLE_COUNTS = [
    { id: '1', label: '1', icon: '1' },
    { id: '3', label: '3', icon: '3' },
    { id: '5', label: '5', icon: '5' },
    { id: 'age', label: `Your age (${AGE})`, icon: '♡' }
  ];
  const DECORATIONS = [
    { id: 'ribbons', label: 'Ribbons', icon: '🎀' },
    { id: 'hearts', label: 'Hearts', icon: '💗' },
    { id: 'flowers', label: 'Flowers', icon: '🌷' },
    { id: 'stars', label: 'Stars', icon: '✨' },
    { id: 'pearls', label: 'Pearls', swatch: 'radial-gradient(circle at 35% 35%, #fff, #E6D8CC)' }
  ];
  const TABS = [
    { id: 'cake', label: 'Cake' },
    { id: 'frosting', label: 'Frosting' },
    { id: 'toppings', label: 'Toppings' },
    { id: 'candles', label: 'Candles' },
    { id: 'decor', label: 'Decorations' }
  ];
  const PASTELS = ['#F5C2CF', '#D9CBEF', '#CFE0C8', '#FBE3B4', '#FFFFFF'];

  const state = { cake: null, frosting: null, toppings: new Set(), candleStyle: 'none', candleCount: 'age', decor: new Set() };
  let tab = 'cake', finished = false;

  /* ---------- Geometry ---------- */
  const T = {
    bottom: { cx: 160, rx: 105, ry: 20, top: 182, bot: 256 },
    top: { cx: 160, rx: 70, ry: 13.5, top: 118, bot: 182 }
  };
  const DRIPS_BOTTOM = [8, 16, 10, 20, 9, 14, 18, 8, 15, 11, 19, 9];
  const DRIPS_TOP = [7, 13, 8, 15, 9, 12, 7, 14, 10];
  const f1 = (n) => +n.toFixed(1);
  const $ = (id) => svg.querySelector('#' + id);
  // y of the front edge of a tier at a given x, for a horizontal "line" at y0
  const arcY = (t, x, y0) => y0 + t.ry * Math.sqrt(Math.max(0, 1 - ((x - t.cx) / t.rx) ** 2));
  const bodyPath = (t) => `M${t.cx - t.rx},${t.top} L${t.cx - t.rx},${t.bot} A${t.rx},${t.ry} 0 0 0 ${t.cx + t.rx},${t.bot} L${t.cx + t.rx},${t.top} Z`;
  const at = (x, y, inner) => `<g transform="translate(${f1(x)},${f1(y)})"><g class="pop">${inner}</g></g>`;
  const starPath = (cx, cy, R, r) => {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, rad = i % 2 ? r : R;
      d += `${i ? 'L' : 'M'}${f1(cx + rad * Math.cos(a))},${f1(cy + rad * Math.sin(a))}`;
    }
    return d + 'Z';
  };

  /* ---------- SVG skeleton ---------- */
  svg.innerHTML = `
    <defs>
      <linearGradient id="cake-shade" x1="0" x2="1">
        <stop offset="0" stop-color="#000" stop-opacity=".14"/><stop offset=".3" stop-color="#000" stop-opacity="0"/>
        <stop offset=".65" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".16"/>
      </linearGradient>
      <pattern id="cake-stripes" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
        <rect width="2.4" height="6" fill="#fff" opacity=".75"/>
      </pattern>
      <radialGradient id="cake-flame" cx=".5" cy=".7" r=".6">
        <stop offset="0" stop-color="#FFF8D6"/><stop offset=".5" stop-color="#FFD36B"/><stop offset="1" stop-color="#F59A4B"/>
      </radialGradient>
      <radialGradient id="cake-glow"><stop offset="0" stop-color="#FFE7A3" stop-opacity=".75"/><stop offset="1" stop-color="#FFE7A3" stop-opacity="0"/></radialGradient>
      <radialGradient id="cake-pearl" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#E6D8CC"/></radialGradient>
      <linearGradient id="cake-plate" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F3E9E3"/></linearGradient>
    </defs>
    <g>
      <path d="M134,282 C140,296 128,306 112,311 L208,311 C192,306 180,296 186,282 Z" fill="#F7EEE9"/>
      <ellipse cx="160" cy="311" rx="50" ry="6" fill="#EFE3DC"/>
      <ellipse cx="160" cy="265" rx="132" ry="26" fill="#EADBD3"/>
      <ellipse cx="160" cy="260" rx="132" ry="26" fill="url(#cake-plate)"/>
    </g>
    <g id="cakeGhost"></g>
    <g id="cakeBottom"></g><g id="frostBottom"></g><g id="sprinkBottom"></g><g id="decoBottom"></g>
    <g id="cakeTop"></g><g id="frostTop"></g><g id="sprinkTop"></g><g id="decoTop"></g>
    <g id="toppingsBack"></g><g id="candles"></g><g id="toppingsFront"></g>`;

  /* ---------- Layers ---------- */
  function ghost(t) {
    const dash = 'fill="rgba(255,255,255,.6)" stroke="#E9B8C4" stroke-width="1.5" stroke-dasharray="5 6"';
    return `<path d="${bodyPath(t)}" ${dash}/><ellipse cx="${t.cx}" cy="${t.top}" rx="${t.rx}" ry="${t.ry}" ${dash}/>`;
  }
  function tierBody(t, f, layers) {
    const x1 = t.cx - t.rx, x2 = t.cx + t.rx;
    const stripes = layers.map((k) => {
      const y = f1(t.top + (t.bot - t.top) * k);
      return `<path d="M${x1},${y} A${t.rx},${t.ry} 0 0 0 ${x2},${y}" fill="none" stroke="${f.layer}" stroke-width="5"/>`;
    }).join('');
    return `<path d="${bodyPath(t)}" fill="${f.body}"/>${stripes}<path d="${bodyPath(t)}" fill="url(#cake-shade)"/>
      <ellipse cx="${t.cx}" cy="${t.top}" rx="${t.rx}" ry="${t.ry}" fill="${f.top}"/>`;
  }
  function renderCake(animate) {
    const f = CAKES.find((c) => c.id === state.cake);
    $('cakeGhost').innerHTML = f ? '' : ghost(T.bottom) + ghost(T.top);
    $('cakeBottom').innerHTML = f ? `<g class="pop">${tierBody(T.bottom, f, [0.42, 0.74])}</g>` : '';
    $('cakeTop').innerHTML = f ? `<g class="pop">${tierBody(T.top, f, [0.58])}</g>` : '';
    if (f && animate) {
      gsap.fromTo(svg.querySelectorAll('#cakeBottom .pop, #cakeTop .pop'),
        { autoAlpha: 0, scaleY: 0.5, transformOrigin: '50% 100%' },
        { autoAlpha: 1, scaleY: 1, duration: 0.7, stagger: 0.18, ease: 'back.out(1.7)' });
    }
  }

  // Frosting = top surface + drips running down the front
  function dripPath(t, depths) {
    const n = depths.length, x1 = t.cx - t.rx, w = (2 * t.rx) / n;
    let d = `M${x1},${t.top} `;
    for (let i = 0; i < n; i++) {
      const xa = x1 + i * w, xb = xa + w, xm = (xa + xb) / 2;
      const ya = arcY(t, xa, t.top), yb = arcY(t, xb, t.top), ym = arcY(t, xm, t.top) + depths[i];
      d += `L${f1(xa)},${f1(ya + 2)} C${f1(xa + w * 0.15)},${f1(ya + 4)} ${f1(xm - w * 0.35)},${f1(ym)} ${f1(xm)},${f1(ym)} `
        + `C${f1(xm + w * 0.35)},${f1(ym)} ${f1(xb - w * 0.15)},${f1(yb + 4)} ${f1(xb)},${f1(yb + 2)} `;
    }
    return d + `L${t.cx + t.rx},${t.top} A${t.rx},${t.ry} 0 0 0 ${x1},${t.top} Z`;
  }
  function renderFrosting(animate) {
    const f = FROSTINGS.find((x) => x.id === state.frosting);
    [['frostBottom', T.bottom, DRIPS_BOTTOM], ['frostTop', T.top, DRIPS_TOP]].forEach(([id, t, drips]) => {
      $(id).innerHTML = f ? `<g class="pop"><path d="${dripPath(t, drips)}" fill="${f.color}"/>
        <ellipse cx="${t.cx}" cy="${t.top - 1}" rx="${t.rx - 10}" ry="${t.ry - 5}" fill="#fff" opacity=".2"/></g>` : '';
    });
    if (f && animate) {
      gsap.fromTo(svg.querySelectorAll('#frostBottom .pop, #frostTop .pop'),
        { autoAlpha: 0, scaleY: 0.15, transformOrigin: '50% 0%' },
        { autoAlpha: 1, scaleY: 1, duration: 1.1, stagger: 0.2, ease: 'power2.out' });
    }
  }

  function renderSprinkles(animate) {
    const on = state.toppings.has('sprinkles');
    [['sprinkBottom', T.bottom, 40], ['sprinkTop', T.top, 24]].forEach(([id, t, n], k) => {
      if (!on) { $(id).innerHTML = ''; return; }
      const rnd = FX.rng(11 + k);
      let s = '';
      for (let i = 0; i < n; i++) {
        const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()), rot = Math.round(rnd() * 180);
        const x = t.cx + (t.rx - 9) * r * Math.cos(a), y = t.top + (t.ry - 3) * r * Math.sin(a);
        if (t === T.bottom && ((x - T.top.cx) / T.top.rx) ** 2 + ((y - T.bottom.top) / T.top.ry) ** 2 < 1.1) continue;
        s += `<rect x="-3" y="-1" width="6" height="2" rx="1" fill="${['#F1A7BB', '#C9B6E4', '#A8B9A3', '#F6CF62', '#9E5267'][i % 5]}" transform="translate(${f1(x)},${f1(y)}) rotate(${rot})"/>`;
      }
      $(id).innerHTML = `<g class="pop">${s}</g>`;
    });
    if (on && animate) {
      gsap.fromTo(svg.querySelectorAll('#sprinkBottom .pop, #sprinkTop .pop'),
        { autoAlpha: 0, y: -16 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.15 });
    }
  }

  /* ---------- Toppings ---------- */
  const ring = (t, R, Ry, degs, extra) => degs.map((d) => ({
    x: t.cx + R * Math.cos((d * Math.PI) / 180),
    y: t.top + Ry * Math.sin((d * Math.PI) / 180),
    ...extra
  }));
  const SLOTS = [
    ...ring(T.top, 52, 8.5, [200, 240, 300, 340], { back: true, s: 0.85 }),
    ...ring(T.top, 52, 8.5, [20, 60, 120, 160], { s: 0.9 }),
    ...ring(T.bottom, 88, 16.5, [10, 36, 62, 90, 118, 144, 170], { s: 1 })
  ];
  const TOPPING_ART = {
    strawberries: () => `<path d="M0,0 C-7,-2 -10,-10 -8,-15 C-6,-19 6,-19 8,-15 C10,-10 7,-2 0,0Z" fill="#E0566F"/>
      <path d="M-6,-16 L-2,-19 L0,-22 L2,-19 L6,-16 L0,-17Z" fill="#7FA36F"/>
      <g fill="#FFE6A8"><circle cx="-3" cy="-11" r=".9"/><circle cx="3" cy="-9" r=".9"/><circle cx="0" cy="-5" r=".9"/><circle cx="-4" cy="-6" r=".8"/><circle cx="4" cy="-14" r=".8"/></g>`,
    cherries: () => `<path d="M0,-12 Q2,-22 9,-25" stroke="#6E8B5E" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <circle cx="0" cy="-6.5" r="6.5" fill="#B8324B"/><circle cx="-2.2" cy="-8.8" r="1.8" fill="#fff" opacity=".55"/>`,
    macarons: (i) => {
      const c = ['#F5C2CF', '#D9CBEF', '#CFE0C8', '#FBE3B4'][i % 4];
      return `<rect x="-10" y="-7" width="20" height="7" rx="3.5" fill="${c}"/><rect x="-9" y="-10" width="18" height="3.5" rx="1.5" fill="#FFF6EA"/>
        <rect x="-10" y="-17" width="20" height="8" rx="4" fill="${c}"/><rect x="-7" y="-15.5" width="8" height="2" rx="1" fill="#fff" opacity=".5"/>`;
    },
    flowers: (i) => {
      const c = ['#F5C2CF', '#FFFFFF', '#D9CBEF'][i % 3];
      return [0, 72, 144, 216, 288].map((a) => {
        const r = (a * Math.PI) / 180;
        return `<circle cx="${f1(3.8 * Math.sin(r))}" cy="${f1(-7 - 3.8 * Math.cos(r))}" r="3.6" fill="${c}" stroke="#EADBD3" stroke-width=".4"/>`;
      }).join('') + '<circle cy="-7" r="2.4" fill="#F2C14E"/>';
    },
    chocolate: (i) => (i % 2
      ? '<g transform="rotate(-12)"><rect x="-6" y="-11" width="12" height="10" rx="1.5" fill="#5B3A2E"/><rect x="-4.5" y="-9.5" width="4.5" height="3.5" fill="#7A5242"/></g>'
      : '<path d="M-7,0 L-2,-15 L7,-3Z" fill="#6B4232"/><path d="M-2,-15 L7,-3 L3,-2Z" fill="#8A5A44"/>')
  };
  function renderToppings(newId) {
    const active = TOPPINGS.filter((t) => t.id !== 'sprinkles' && state.toppings.has(t.id)).map((t) => t.id);
    let back = '', front = '';
    if (active.length) {
      SLOTS.map((p, i) => ({ ...p, i, type: active[i % active.length] }))
        .sort((a, b) => a.y - b.y)
        .forEach((it) => {
          const g = `<g transform="translate(${f1(it.x)},${f1(it.y)}) scale(${it.s})"><g class="pop" data-type="${it.type}">${TOPPING_ART[it.type](it.i)}</g></g>`;
          if (it.back) back += g; else front += g;
        });
    }
    $('toppingsBack').innerHTML = back;
    $('toppingsFront').innerHTML = front;
    if (newId) {
      gsap.fromTo(svg.querySelectorAll(`.pop[data-type="${newId}"]`),
        { autoAlpha: 0, y: -40, scale: 0.4, transformOrigin: '50% 100%' },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.06, ease: 'back.out(1.8)' });
    }
  }

  /* ---------- Candles ---------- */
  function flame(y) {
    return `<line x1="0" y1="${f1(y)}" x2="0" y2="${f1(y - 3)}" stroke="#5A4A4A" stroke-width="1" stroke-linecap="round"/>
      <g class="flame" transform="translate(0,${f1(y - 2.5)})">
        <ellipse class="flame__glow" cx="0" cy="-6" rx="8" ry="10" fill="url(#cake-glow)"/>
        <path class="flame__fire" d="M0,-12 C3.4,-7.5 3.8,-3.6 2.8,-1.4 C1.8,.8 -1.8,.8 -2.8,-1.4 C-3.8,-3.6 -3.4,-7.5 0,-12Z" fill="url(#cake-flame)"/>
      </g>`;
  }
  function candle(style, i, n) {
    const w = n > 20 ? 4 : n > 10 ? 5 : 6.5, h = n > 20 ? 20 : n > 10 ? 24 : 30;
    if (style === 'star') {
      const r = w * 1.3;
      return `<rect x="-.9" y="${f1(-h + r)}" width="1.8" height="${f1(h - r)}" fill="#E8D7B0"/>
        <path d="${starPath(0, -h + r * 0.2, r, r * 0.45)}" fill="#F6CF62" stroke="#E2AE3D" stroke-width=".6"/>${flame(-h - r * 0.75)}`;
    }
    const fill = style === 'colorful' ? ['#F5C2CF', '#D9CBEF', '#CFE0C8', '#FBE3B4', '#BFE0EA'][i % 5] : '#FFF6EA';
    const rect = (extra) => `<rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="${f1(w / 3)}" ${extra}/>`;
    return rect(`fill="${fill}" stroke="#E7D6C4" stroke-width=".6"`)
      + (style === 'colorful' ? rect('fill="url(#cake-stripes)"') : '')
      + flame(-h);
  }
  function candlePositions(n) {
    const t = T.top;
    if (n === 1) return [{ x: t.cx, y: t.top }];
    const pts = [];
    if (n <= 7) {
      for (let i = 0; i < n; i++) {
        const a = Math.PI / 2 + (i * 2 * Math.PI) / n;
        pts.push({ x: t.cx + 32 * Math.cos(a), y: t.top + 5.5 * Math.sin(a) });
      }
    } else {
      for (let i = 0; i < n; i++) { // sunflower spiral → evenly spread
        const r = Math.sqrt((i + 0.5) / n), th = i * 2.39996;
        pts.push({ x: t.cx + 46 * r * Math.cos(th), y: t.top + 8 * r * Math.sin(th) });
      }
    }
    return pts.sort((a, b) => a.y - b.y);
  }
  function renderCandles(animate) {
    const g = $('candles');
    const style = state.candleStyle;
    let html = '';
    if (style === 'number') {
      const digits = String(AGE).split('');
      digits.forEach((d, i) => {
        const x = T.top.cx + (i - (digits.length - 1) / 2) * 30;
        html += at(x, T.top.top + 5, `<text x="0" y="0" text-anchor="middle" font-family="'Cormorant Garamond', Georgia, serif"
          font-weight="600" font-size="52" fill="${['#F5C2CF', '#D9CBEF'][i % 2]}" stroke="#9E5267" stroke-width="1.4" paint-order="stroke">${d}</text>${flame(-38)}`);
      });
    } else if (style !== 'none') {
      const n = state.candleCount === 'age' ? AGE : +state.candleCount;
      candlePositions(n).forEach((p, i) => { html += at(p.x, p.y, candle(style, i, n)); });
    }
    g.innerHTML = html;
    if (animate && html) {
      const els = g.querySelectorAll('.pop');
      gsap.fromTo(els, { autoAlpha: 0, y: -90 },
        { autoAlpha: 1, y: 0, duration: 0.9, stagger: Math.min(0.08, 1.2 / els.length), ease: 'power2.out' });
    }
  }

  /* ---------- Decorations ---------- */
  function band(t, y0, h, color, line) {
    const x1 = t.cx - t.rx, x2 = t.cx + t.rx;
    return `<g class="pop"><path d="M${x1},${y0} A${t.rx},${t.ry} 0 0 0 ${x2},${y0} L${x2},${y0 + h} A${t.rx},${t.ry} 0 0 1 ${x1},${y0 + h} Z" fill="${color}"/>
      <path d="M${x1},${y0 + h / 2} A${t.rx},${t.ry} 0 0 0 ${x2},${y0 + h / 2}" fill="none" stroke="${line}" stroke-width="1" opacity=".6"/></g>`;
  }
  const bow = (x, y) => at(x, y, `<path d="M0,0 C-6,-12 -22,-12 -21,-1 C-20,9 -6,8 0,0Z" fill="#E7A9BA"/>
    <path d="M0,0 C6,-12 22,-12 21,-1 C20,9 6,8 0,0Z" fill="#E7A9BA"/>
    <path d="M-2,2 L-9,20 L-4,17 L-1,21Z M2,2 L9,20 L4,17 L1,21Z" fill="#D88FA3"/><circle r="4.2" fill="#D88FA3"/>`);
  const heart = (c) => `<path d="M0,5 C-9,-1 -6,-9 0,-4.5 C6,-9 9,-1 0,5Z" fill="${c}"/>`;
  const pearlRow = (t, y0, n, r) => Array.from({ length: n }, (_, i) => {
    const x = t.cx - t.rx + 4 + ((2 * t.rx - 8) * i) / (n - 1);
    return at(x, arcY(t, x, y0) - r * 0.6, `<circle r="${r}" fill="url(#cake-pearl)"/>`);
  }).join('');
  const rosette = (c, dark) => `<path d="M-6,1 C-17,-2 -19,8 -10,10Z" fill="#A8B9A3"/><path d="M6,2 C16,0 18,9 9,10Z" fill="#94A88E"/>
    <circle cy="-2" r="9" fill="${c}" stroke="${dark}" stroke-width=".6"/>
    <path d="M-4,-3 C-4,-8 4,-8 4,-3 C4,1 -2,2 -2,-2 C-2,-4 1,-5 1,-3" fill="none" stroke="${dark}" stroke-width="1.3" stroke-linecap="round"/>`;
  const cluster = (list) => list.map(([x, y, s], i) => {
    const [c, d] = [['#F5C2CF', '#D88FA3'], ['#FFFDF8', '#E2CFC4'], ['#E9B8C4', '#C77E94']][i % 3];
    return at(x, y, `<g transform="scale(${s})">${rosette(c, d)}</g>`);
  }).join('');

  function renderDecor(newId) {
    const has = (k) => state.decor.has(k);
    const wrap = (id, inner) => `<g data-deco="${id}">${inner}</g>`;
    let bottom = '', top = '';
    if (has('ribbons')) {
      bottom += wrap('ribbons', band(T.bottom, 228, 11, '#E7A9BA', '#D88FA3') + bow(160, 228 + T.bottom.ry + 5.5));
      top += wrap('ribbons', band(T.top, 164, 6, '#E7A9BA', '#D88FA3'));
    }
    if (has('hearts')) bottom += wrap('hearts', [78, 119, 160, 201, 242].map((x) => at(x, arcY(T.bottom, x, 212), heart('#D97A93'))).join(''));
    if (has('stars')) {
      top += wrap('stars', [98, 129, 160, 191, 222].map((x, i) => at(x, arcY(T.top, x, 150),
        `<path d="${starPath(0, 0, 5.5, 2.4)}" fill="${i % 2 ? '#FFFFFF' : '#F6CF62'}" stroke="#E2AE3D" stroke-width=".5"/>`)).join(''));
    }
    if (has('pearls')) {
      bottom += wrap('pearls', pearlRow(T.bottom, 256, 23, 3.1));
      top += wrap('pearls', pearlRow(T.top, 182, 16, 2.4));
    }
    if (has('flowers')) {
      bottom += wrap('flowers', cluster([[250, 276, 1], [234, 282, 0.78], [264, 283, 0.7]]));
      top += wrap('flowers', cluster([[98, 197, 1], [112, 202, 0.75], [85, 203, 0.7]]));
    }
    $('decoBottom').innerHTML = bottom;
    $('decoTop').innerHTML = top;
    if (newId) {
      gsap.fromTo(svg.querySelectorAll(`[data-deco="${newId}"] .pop`),
        { autoAlpha: 0, scale: 0, transformOrigin: '50% 50%' },
        { autoAlpha: 1, scale: 1, duration: 0.6, stagger: 0.05, ease: 'back.out(2)' });
    }
  }

  /* ---------- Panel ---------- */
  const isOn = (kind, v) => ({
    cake: state.cake === v,
    frosting: state.frosting === v,
    toppings: state.toppings.has(v),
    candleStyle: state.candleStyle === v,
    candleCount: state.candleCount === v,
    decor: state.decor.has(v)
  })[kind];
  const tabHasChoice = (id) => ({
    cake: !!state.cake,
    frosting: !!state.frosting,
    toppings: state.toppings.size > 0,
    candles: state.candleStyle !== 'none',
    decor: state.decor.size > 0
  })[id];

  function chips(kind, list, look = () => ({})) {
    return `<div class="options">${list.map((o) => {
      const l = { swatch: o.swatch, icon: o.icon, ...look(o) };
      return `<button class="chip" type="button" data-kind="${kind}" data-value="${o.id}" aria-pressed="${isOn(kind, o.id)}">
        <span class="chip__swatch" style="${l.swatch ? `background:${l.swatch}` : ''}" aria-hidden="true">${l.icon || ''}</span>${o.label}</button>`;
    }).join('')}</div>`;
  }

  panel.innerHTML = `<div class="tabs" role="tablist" aria-label="Cake options">${TABS.map((t) =>
    `<button class="tab" type="button" role="tab" data-tab="${t.id}">${t.label}</button>`).join('')}</div>
    <div class="panel__body"></div>`;
  const body = panel.querySelector('.panel__body');

  function renderTabs() {
    panel.querySelectorAll('.tab').forEach((b) => {
      const id = b.dataset.tab, active = id === tab;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-selected', active);
      b.innerHTML = TABS.find((t) => t.id === id).label + (tabHasChoice(id) ? '<span class="tab__dot" aria-hidden="true"></span>' : '');
    });
  }
  function renderBody() {
    if (tab === 'cake') body.innerHTML = '<p class="panel__label">Choose a flavour</p>' + chips('cake', CAKES, (c) => ({ swatch: c.body }));
    if (tab === 'frosting') body.innerHTML = '<p class="panel__label">Choose a frosting</p>' + chips('frosting', FROSTINGS, (c) => ({ swatch: c.color }));
    if (tab === 'toppings') body.innerHTML = '<p class="panel__label">Pick as many as you like</p>' + chips('toppings', TOPPINGS);
    if (tab === 'decor') body.innerHTML = '<p class="panel__label">Finishing touches</p>' + chips('decor', DECORATIONS);
    if (tab === 'candles') {
      body.innerHTML = '<p class="panel__label">Candle style</p>' + chips('candleStyle', CANDLE_STYLES)
        + '<div data-count-row><p class="panel__label">How many?</p>' + chips('candleCount', CANDLE_COUNTS) + '</div>';
    }
    syncChips();
  }
  function syncChips() {
    body.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', isOn(c.dataset.kind, c.dataset.value)));
    const row = body.querySelector('[data-count-row]');
    if (row) row.hidden = state.candleStyle === 'none' || state.candleStyle === 'number';
  }
  function hint(msg) { hintEl.textContent = msg; }
  const toggle = (set, v) => (set.has(v) ? set.delete(v) : set.add(v));

  panel.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('[data-tab]');
    if (tabBtn) { tab = tabBtn.dataset.tab; renderTabs(); renderBody(); return; }
    const chip = e.target.closest('.chip');
    if (!chip || finished) return;
    const { kind, value } = chip.dataset;
    switch (kind) {
      case 'cake':
        if (state.cake === value) return;
        state.cake = value; renderCake(true); break;
      case 'frosting':
        state.frosting = state.frosting === value ? null : value; renderFrosting(!!state.frosting); break;
      case 'toppings':
        toggle(state.toppings, value);
        if (value === 'sprinkles') renderSprinkles(state.toppings.has(value));
        else renderToppings(state.toppings.has(value) ? value : null);
        break;
      case 'candleStyle': state.candleStyle = value; renderCandles(true); break;
      case 'candleCount': state.candleCount = value; renderCandles(true); break;
      case 'decor':
        toggle(state.decor, value); renderDecor(state.decor.has(value) ? value : null); break;
    }
    FX.sound.play('pop');
    syncChips();
    renderTabs();
    hint('');
  });

  /* ---------- Finish ---------- */
  finishBtn.addEventListener('click', () => {
    if (finished) return;
    if (!state.cake) {
      hint('Choose a cake flavour first ♡');
      FX.shake(finishBtn);
      tab = 'cake'; renderTabs(); renderBody();
      return;
    }
    finish();
  });

  function finish() {
    finished = true;
    const hasCandles = state.candleStyle !== 'none';
    gsap.to([panel, actions], {
      autoAlpha: 0, y: 16, duration: 0.5,
      onComplete() { panel.hidden = true; actions.hidden = true; builder.classList.add('is-finished'); }
    });
    window.scrollTo({ top: 0, behavior: FX.REDUCED ? 'auto' : 'smooth' });
    APP.snapshots.cake = FX.cloneSvg(svg, 'final');

    const tl = gsap.timeline({ delay: 0.5 });
    if (hasCandles) {
      tl.call(() => { wishEl.textContent = 'Make a wish… ✨'; })
        .fromTo(wishEl, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.9 })
        .to(wishEl, { autoAlpha: 0, duration: 0.6 }, '+=1.4')
        .call(blowOut)
        .to(stage, { scale: 1.04, duration: 0.6, ease: 'sine.out' }, '+=0.7');
    } else {
      tl.to(stage, { scale: 1.04, duration: 0.6, ease: 'sine.out' });
    }
    tl.call(celebrate).to(stage, { scale: 1, duration: 0.8, ease: 'sine.inOut' }, '+=0.2');
  }

  function blowOut() {
    FX.sound.play('blow');
    svg.classList.add('is-out');
    const smokes = [];
    svg.querySelectorAll('.flame').forEach((fl) => {
      const s = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      s.setAttribute('class', 'smoke');
      s.setAttribute('r', '3');
      s.setAttribute('cy', '-6');
      s.setAttribute('fill', '#D8CFCB');
      fl.parentNode.insertBefore(s, fl);
      s.setAttribute('transform', fl.getAttribute('transform'));
      smokes.push(s);
    });
    gsap.fromTo(smokes, { autoAlpha: 0.7, transformOrigin: '50% 50%' }, { autoAlpha: 0, y: '-=28', scale: 2.4, duration: 1.6, stagger: 0.02, ease: 'power1.out' });
  }

  function celebrate() {
    FX.confetti.burstAt(stage, { count: 140 });
    FX.petals.burst(12);
    FX.sound.play('success');
    APP.completeStep('cake');
    doneCard.hidden = false;
    gsap.fromTo(doneCard.children, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.5, delay: 0.4 });
  }

  /* ---------- Start ---------- */
  renderCake(false);
  renderTabs();
  renderBody();
  hint('Start by choosing a flavour ♡');
}
