/* =========================================================
   bouquet.js — 04 · Compose your bouquet
   Flowers drop into pre-arranged "slots" (big blooms in the
   centre, light ones at the edges) so the bouquet is always
   harmonious. Each flower can be nudged a little by dragging.
   ========================================================= */
function initBouquetBuilder() {
  const svg = document.getElementById('bouquetSvg');
  const stage = document.getElementById('bouquetStage');
  const builder = document.getElementById('bouquetBuilder');
  const panel = document.getElementById('bouquetPanel');
  const actions = document.getElementById('bouquetActions');
  const finishBtn = document.getElementById('bouquetFinish');
  const hintEl = document.getElementById('bouquetHint');
  const doneCard = document.getElementById('bouquetDone');
  const B = { x: 200, y: 430 }; // where all the stems meet, under the ribbon
  const f1 = (n) => +n.toFixed(1);
  const $ = (id) => svg.querySelector('#' + id);

  /* ---------- Flowers ---------- */
  const petals = (n, draw) => Array.from({ length: n }, (_, i) => draw((i * 360) / n, i)).join('');
  const blossom = (x, y, s, c) => `<g transform="translate(${x},${y}) scale(${s})">${petals(5, (a) =>
    `<ellipse cx="0" cy="-5.5" rx="4.6" ry="6" fill="${c.main}" stroke="${c.dark}" stroke-width=".5" transform="rotate(${a})"/>`)}
    <circle r="2" fill="${c.dark}"/></g>`;

  const FLOWERS = [
    {
      id: 'rose', label: 'Roses', icon: '🌹', pref: 'center', size: 1.45,
      colors: { pink: ['#F2B5C4', '#D98BA0'], red: ['#C2475E', '#93303F'], white: ['#FBF4EE', '#E2D3C8'] },
      draw: (c) => `<circle r="27" fill="${c.dark}"/>
        ${petals(5, (a) => `<ellipse cx="0" cy="-12" rx="14" ry="12" fill="${c.main}" transform="rotate(${a})"/>`)}
        <circle r="15" fill="${c.main}" stroke="${c.dark}" stroke-width="1"/>
        <path d="M-8,0 C-8,-9 8,-9 8,-1 C8,6 -4,8 -5,1 C-5,-4 3,-5 3,0" fill="none" stroke="${c.dark}" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M-15,6 C-10,16 10,16 15,6" fill="none" stroke="${c.dark}" stroke-width="1.6" opacity=".7"/>`
    },
    {
      id: 'tulip', label: 'Tulips', icon: '🌷', pref: 'center', size: 1.45,
      colors: { pink: ['#F4A7BA', '#DE7C97'], yellow: ['#F6D776', '#E0B544'], purple: ['#B79AD6', '#8F72B6'] },
      draw: (c) => `<g transform="translate(0,8)">
        <path d="M-15,-2 C-17,-18 -11,-27 -5,-27 L0,-16 L5,-27 C11,-27 17,-18 15,-2 C13,12 -13,12 -15,-2Z" fill="${c.main}"/>
        <path d="M-7,-16 C-6,-28 6,-28 7,-16 C8,-4 -8,-4 -7,-16Z" fill="${c.dark}" opacity=".55"/>
        <path d="M-15,-2 C-12,8 -4,10 0,10" fill="none" stroke="${c.dark}" stroke-width="1.2" opacity=".5"/></g>`
    },
    {
      id: 'sunflower', label: 'Sunflowers', icon: '🌻', pref: 'center', size: 1.35,
      colors: { golden: ['#F2C14E', '#E0A23A'], lemon: ['#F7E07B', '#E8C951'], rust: ['#E09A5A', '#C27838'] },
      draw: (c) => petals(16, (a) => `<ellipse cx="0" cy="-15" rx="5" ry="9" fill="${c.dark}" transform="rotate(${a + 11.25})"/>`)
        + petals(16, (a) => `<ellipse cx="0" cy="-18" rx="5.5" ry="11" fill="${c.main}" transform="rotate(${a})"/>`)
        + `<circle r="11" fill="#6B4A2E"/><circle r="7" fill="#8A6440"/>
        <g fill="#5A3D25"><circle cx="-3" cy="-2" r="1"/><circle cx="2" cy="-4" r="1"/><circle cx="3" cy="2" r="1"/><circle cx="-2" cy="3" r="1"/></g>`
    },
    {
      id: 'daisy', label: 'Daisies', icon: '🌼', pref: 'center', size: 1.4,
      colors: { white: ['#FFFFFF', '#E6DDD5'], pink: ['#F7CFD9', '#E8A9BA'], lilac: ['#E2D6F3', '#C5B1E2'] },
      draw: (c) => petals(14, (a) => `<ellipse cx="0" cy="-13" rx="3.8" ry="11" fill="${c.main}" stroke="${c.dark}" stroke-width=".6" transform="rotate(${a})"/>`)
        + '<circle r="6.5" fill="#F2C14E"/><circle r="3" fill="#E6A93A"/>'
    },
    {
      id: 'cherry', label: 'Cherry blossoms', icon: '🌸', pref: 'edge', size: 1.45,
      colors: { pale: ['#F8D7E0', '#E9AFC0'], white: ['#FFF7F9', '#EBCFD7'], deep: ['#EE9CB4', '#D27694'] },
      draw: (c) => `<path d="M-20,16 C-8,6 4,2 18,-14" stroke="#8A6A5C" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        ${blossom(-10, 7, 1, c)}${blossom(5, -3, 1.1, c)}${blossom(15, -15, 0.85, c)}${blossom(-4, -14, 0.8, c)}`
    },
    {
      id: 'lavender', label: 'Lavender', icon: '💜', pref: 'edge', size: 1.15,
      colors: { lavender: ['#B7A2E0', '#9B84CC'], purple: ['#8E73C2', '#6F56A3'], white: ['#EDE6F7', '#D3C6EA'] },
      draw: (c) => [[-12, 50], [0, 62], [12, 50]].map(([rot, len]) => {
        let buds = `<path d="M0,0 L0,${-len}" stroke="#8FA587" stroke-width="1.6"/>`;
        for (let i = 0; i < 11; i++) {
          const y = -10 - i * ((len - 12) / 10), k = 1 - i * 0.05;
          buds += `<ellipse cx="${i % 2 ? 2.6 : -2.6}" cy="${f1(y)}" rx="${f1(3.6 * k)}" ry="${f1(5 * k)}" fill="${i % 2 ? c.main : c.dark}"/>`;
        }
        return `<g transform="rotate(${rot})">${buds}</g>`;
      }).join('')
    }
  ];
  const FLOWER = Object.fromEntries(FLOWERS.map((f) => [f.id, f]));
  const colorOf = (f) => { const [main, dark] = FLOWER[f.type].colors[f.color]; return { main, dark }; };

  const PAPERS = [
    { id: 'cream', label: 'Cream', front: '#FFF4E8', back: '#F1E1CF', line: '#E3CDB6' },
    { id: 'kraft', label: 'Kraft', front: '#E9D3B6', back: '#D8BD9B', line: '#C9A882' },
    { id: 'blush', label: 'Blush', front: '#F7DCE3', back: '#EDC3CF', line: '#E0A9B9' },
    { id: 'lavender', label: 'Lavender', front: '#ECE4F4', back: '#D9CCE9', line: '#C5B3DD' },
    { id: 'sage', label: 'Sage', front: '#E3EBDD', back: '#C9D6C2', line: '#AFC1A7' }
  ];
  const RIBBONS = [
    { id: 'none', label: 'None' },
    { id: 'blush', label: 'Blush', color: '#E7A9BA', dark: '#D08AA0' },
    { id: 'burgundy', label: 'Berry', color: '#9E5267', dark: '#7E3E51' },
    { id: 'sage', label: 'Sage', color: '#A8B9A3', dark: '#8DA087' },
    { id: 'lilac', label: 'Lilac', color: '#C9B6E4', dark: '#AE98D0' },
    { id: 'cream', label: 'Cream', color: '#FFF6EA', dark: '#E6D5C2' }
  ];

  // Slots: [x, y, scale]. Order = where the next flower goes.
  const SLOTS = [
    [200, 205, 1.12], [152, 222, 1.02], [248, 222, 1.02], [200, 155, 1], [158, 170, 0.95], [242, 170, 0.95],
    [124, 262, 0.95], [276, 262, 0.95], [200, 262, 1], [110, 205, 0.9], [290, 205, 0.9], [150, 124, 0.85],
    [250, 124, 0.85], [200, 108, 0.85], [88, 160, 0.8], [312, 160, 0.8], [166, 288, 0.88], [234, 288, 0.88]
  ].map(([x, y, s]) => [x, y + 24, s]); // nestled into the paper
  const CENTER_ORDER = [0, 1, 2, 3, 4, 5, 8, 6, 7, 9, 10, 11, 12, 13, 16, 17, 14, 15];
  const EDGE_ORDER = [11, 12, 14, 15, 9, 10, 13, 6, 7, 16, 17, 3, 4, 5, 1, 2, 0, 8];

  const state = {
    flowers: [], // { type, color, slot, dx, dy, tilt }
    type: 'rose',
    color: Object.fromEntries(FLOWERS.map((f) => [f.id, Object.keys(f.colors)[0]])),
    greenery: false,
    filler: false,
    paper: 'cream',
    ribbon: 'none'
  };
  let paneId = 'flowers', finished = false, drag = null;

  /* ---------- SVG skeleton ---------- */
  svg.innerHTML = `
    <g id="bqAll" data-anim-root>
      <g id="bqLeaves"></g>
      <path id="bqPaperBack" class="bq-paper" d="M88,236 C120,212 150,226 170,214 C190,206 214,222 232,212 C256,202 286,226 312,234 L246,402 L154,402 Z"/>
      <g id="bqFiller"></g>
      <g id="bqStems"></g>
      <g id="bqFlowers"></g>
      <path id="bqPaperFront" class="bq-paper" d="M64,300 C120,330 280,330 336,300 L232,474 Q200,486 168,474 Z"/>
      <g id="bqFolds" fill="none" stroke-width="1.2" opacity=".55">
        <path d="M122,318 L180,476"/><path d="M278,318 L220,476"/><path d="M64,300 C120,330 280,330 336,300" stroke="#fff" stroke-width="2" opacity=".7"/>
      </g>
      <g id="bqRibbon"></g>
    </g>`;

  /* ---------- Drawing ---------- */
  const point = (f) => { const [x, y] = SLOTS[f.slot]; return { x: x + f.dx, y: y + f.dy }; };
  function headTransform(f) {
    const { x, y } = point(f);
    const lean = (Math.atan2(x - B.x, B.y - y) * 180) / Math.PI * 0.6 + f.tilt;
    return `translate(${f1(x)},${f1(y)}) rotate(${f1(lean)}) scale(${f1(SLOTS[f.slot][2] * FLOWER[f.type].size * 100) / 100})`;
  }
  function stemPath(f) {
    const { x, y } = point(f);
    return `M${B.x},${B.y} Q${f1((B.x + x) / 2 + (x - B.x) * 0.12)},${f1((B.y + y) / 2)} ${f1(x)},${f1(y)}`;
  }
  function sprig(angle, len, color) {
    const a = (angle * Math.PI) / 180;
    const ex = B.x + Math.sin(a) * len, ey = B.y - Math.cos(a) * len;
    let s = `<path d="M${B.x},${B.y} Q${f1(B.x + Math.sin(a) * len * 0.5 + Math.cos(a) * 12)},${f1(B.y - Math.cos(a) * len * 0.5)} ${f1(ex)},${f1(ey)}" stroke="#8FA587" stroke-width="2" fill="none"/>`;
    for (let i = 1; i <= 6; i++) {
      const t = 0.3 + i * 0.11, px = B.x + Math.sin(a) * len * t, py = B.y - Math.cos(a) * len * t;
      const dir = angle - 90 + (i % 2 ? 50 : -50), rx = 11 - i * 0.7, d = (dir * Math.PI) / 180;
      s += `<ellipse cx="${f1(px + Math.cos(d) * rx)}" cy="${f1(py + Math.sin(d) * rx)}" rx="${f1(rx)}" ry="${f1(5.8 - i * 0.35)}" fill="${color}" transform="rotate(${f1(dir)} ${f1(px + Math.cos(d) * rx)} ${f1(py + Math.sin(d) * rx)})"/>`;
    }
    return s;
  }
  const popIn = (els, from = '50% 50%') => gsap.fromTo(els,
    { autoAlpha: 0, scale: 0.4, transformOrigin: from },
    { autoAlpha: 1, scale: 1, duration: 0.8, ease: 'back.out(1.6)' });

  function renderLeaves(animate) {
    const base = [[-34, 150], [6, 165], [36, 145]].map(([a, l]) => sprig(a, l, '#C9D6C3')).join('');
    const full = state.greenery
      ? [[-42, 236], [-27, 256], [-11, 266], [12, 266], [28, 254], [43, 234]].map(([a, l], i) => sprig(a, l, ['#A8B9A3', '#B9C8B3', '#94A88E'][i % 3])).join('')
      : '';
    $('bqLeaves').innerHTML = `<g opacity=".5">${base}</g>${full ? `<g class="pop">${full}</g>` : ''}`;
    if (animate && full) popIn(svg.querySelector('#bqLeaves .pop'), '50% 100%');
  }
  function renderFiller(animate) {
    if (!state.filler) { $('bqFiller').innerHTML = ''; return; }
    const rnd = FX.rng(7);
    let s = '';
    for (let i = 0; i < 14; i++) {
      const a = ((-46 + i * (92 / 13) + (rnd() - 0.5) * 6) * Math.PI) / 180, L = 200 + rnd() * 55;
      const x = B.x + Math.sin(a) * L, y = B.y - Math.cos(a) * L;
      s += `<path d="M${B.x},${B.y} Q${f1((B.x + x) / 2)},${f1((B.y + y) / 2 + 10)} ${f1(x)},${f1(y)}" stroke="#A3B59C" stroke-width="1" fill="none"/>
        <g transform="translate(${f1(x)},${f1(y)})">${[[0, 0], [-6, -4], [5, -5], [-3, -10], [6, 3], [-7, 4]].map(([dx, dy]) =>
          `<circle cx="${dx}" cy="${dy}" r="${f1(2.3 + rnd() * 1.2)}" fill="#FFFDF8" stroke="#EADFD6" stroke-width=".5"/>`).join('')}</g>`;
    }
    $('bqFiller').innerHTML = `<g class="pop">${s}</g>`;
    if (animate) popIn(svg.querySelector('#bqFiller .pop'), '50% 100%');
  }
  function renderPaper() {
    const p = PAPERS.find((x) => x.id === state.paper);
    // attribute = kept in the finale copy, style = smooth colour transition
    [['bqPaperFront', p.front], ['bqPaperBack', p.back]].forEach(([id, c]) => {
      $(id).setAttribute('fill', c);
      $(id).style.fill = c;
    });
    $('bqFolds').setAttribute('stroke', p.line);
  }
  function renderRibbon(animate) {
    const r = RIBBONS.find((x) => x.id === state.ribbon);
    if (!r.color) { $('bqRibbon').innerHTML = ''; return; }
    $('bqRibbon').innerHTML = `<g class="pop">
      <path d="M140,428 Q200,444 260,428 L256,442 Q200,458 144,442 Z" fill="${r.color}" stroke="${r.dark}" stroke-width=".6"/>
      <path d="M198,440 C186,420 158,418 160,434 C162,450 186,450 198,440Z" fill="${r.color}" stroke="${r.dark}" stroke-width=".8"/>
      <path d="M202,440 C214,420 242,418 240,434 C238,450 214,450 202,440Z" fill="${r.color}" stroke="${r.dark}" stroke-width=".8"/>
      <path d="M196,444 L180,482 L188,478 L192,486 L200,446Z M204,444 L220,482 L212,478 L208,486 L200,446Z" fill="${r.color}" stroke="${r.dark}" stroke-width=".8"/>
      <ellipse cx="200" cy="441" rx="7" ry="6" fill="${r.dark}"/></g>`;
    if (animate) popIn(svg.querySelector('#bqRibbon .pop'));
  }
  function renderFlowers(newIndex) {
    const items = state.flowers.map((f, i) => ({ f, i })).sort((a, b) => SLOTS[a.f.slot][1] - SLOTS[b.f.slot][1]);
    $('bqStems').innerHTML = items.map(({ f, i }) => `<path class="bq-stem" data-i="${i}" d="${stemPath(f)}"/>`).join('');
    $('bqFlowers').innerHTML = items.map(({ f, i }) =>
      `<g class="bq-flower" data-i="${i}" transform="${headTransform(f)}"><g class="pop">${FLOWER[f.type].draw(colorOf(f))}</g></g>`).join('');
    if (newIndex == null) return;
    const head = svg.querySelector(`.bq-flower[data-i="${newIndex}"] .pop`);
    const stem = svg.querySelector(`.bq-stem[data-i="${newIndex}"]`);
    gsap.fromTo(head, { autoAlpha: 0, scale: 0, rotation: -30, transformOrigin: '50% 50%' },
      { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.9, delay: 0.15, ease: 'back.out(1.8)' });
    if (stem && stem.getTotalLength && !FX.REDUCED) {
      const len = stem.getTotalLength();
      stem.style.strokeDasharray = len;
      stem.style.strokeDashoffset = len;
      gsap.to(stem, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out', onComplete: () => { stem.style.strokeDasharray = ''; } });
    }
  }

  /* ---------- Actions ---------- */
  function hint(msg) { hintEl.textContent = msg; }
  function addFlower() {
    if (state.flowers.length >= SLOTS.length) { hint('Your bouquet is full — and it looks lovely ♡'); return; }
    const used = new Set(state.flowers.map((f) => f.slot));
    const order = FLOWER[state.type].pref === 'edge' ? EDGE_ORDER : CENTER_ORDER;
    const slot = order.find((i) => !used.has(i));
    state.flowers.push({ type: state.type, color: state.color[state.type], slot, dx: 0, dy: 0, tilt: (Math.random() - 0.5) * 14 });
    renderFlowers(state.flowers.length - 1);
    FX.sound.play('pop');
    hint('');
    updateCount();
  }
  function undo() {
    if (!state.flowers.length) return;
    const i = state.flowers.length - 1;
    const head = svg.querySelector(`.bq-flower[data-i="${i}"] .pop`);
    state.flowers.pop();
    updateCount();
    gsap.to(head, { autoAlpha: 0, scale: 0.3, transformOrigin: '50% 50%', duration: 0.35, ease: 'power2.in', onComplete: () => renderFlowers() });
  }
  function updateCount() {
    const el = panel.querySelector('[data-count]');
    if (el) el.textContent = `${state.flowers.length} / ${SLOTS.length} flowers`;
  }

  /* ---------- Drag (nudge a flower) ---------- */
  function unitsPerPx() {
    const r = svg.getBoundingClientRect();
    return 1 / Math.min(r.width / 400, r.height / 475);
  }
  svg.addEventListener('pointerdown', (e) => {
    const el = e.target.closest('.bq-flower');
    if (!el || finished) return;
    e.preventDefault();
    const i = +el.dataset.i, f = state.flowers[i];
    drag = { el, f, id: e.pointerId, x0: e.clientX, y0: e.clientY, dx0: f.dx, dy0: f.dy, k: unitsPerPx(), stem: svg.querySelector(`.bq-stem[data-i="${i}"]`) };
    svg.setPointerCapture(e.pointerId);
    el.classList.add('is-dragging');
  });
  svg.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    let dx = drag.dx0 + (e.clientX - drag.x0) * drag.k;
    let dy = drag.dy0 + (e.clientY - drag.y0) * drag.k;
    const max = 30, len = Math.hypot(dx, dy);
    if (len > max) { dx *= max / len; dy *= max / len; }
    drag.f.dx = dx;
    drag.f.dy = dy;
    drag.el.setAttribute('transform', headTransform(drag.f));
    drag.stem.setAttribute('d', stemPath(drag.f));
  });
  const endDrag = () => { if (drag) { drag.el.classList.remove('is-dragging'); drag = null; } };
  svg.addEventListener('pointerup', endDrag);
  svg.addEventListener('pointercancel', endDrag);

  /* ---------- Panel ---------- */
  const swatchBtn = (group, id, label, bg, on) =>
    `<button class="swatch-btn" type="button" data-${group}="${id}" aria-pressed="${on}" aria-label="${label}">
      <span class="swatch ${bg ? '' : 'swatch--none'}" style="${bg ? `background:${bg}` : ''}"></span><span class="swatch__label">${label}</span></button>`;

  panel.innerHTML = `
    <div class="tabs" role="tablist" aria-label="Bouquet options">
      <button class="tab" type="button" role="tab" data-pane="flowers">Flowers</button>
      <button class="tab" type="button" role="tab" data-pane="finish">Finishing touches</button>
    </div>
    <div class="panel__body" data-body="flowers">
      <div class="flower-grid">${FLOWERS.map((f) => `<button class="flower-card" type="button" data-flower="${f.id}">
        <span class="flower-card__icon" aria-hidden="true">${f.icon}</span><span>${f.label}</span></button>`).join('')}</div>
      <p class="panel__label">Colour</p>
      <div class="swatches" data-swatches></div>
      <div class="bq-row">
        <button class="btn btn--small" type="button" data-action="add">Add to bouquet ＋</button>
        <button class="btn btn--ghost btn--small" type="button" data-action="undo">Undo ↶</button>
        <span class="bq-count" data-count></span>
      </div>
    </div>
    <div class="panel__body" data-body="finish" hidden>
      <p class="panel__label">Greenery & little flowers</p>
      <div class="options">
        <button class="chip" type="button" data-toggle="greenery"><span class="chip__swatch" aria-hidden="true">🌿</span>Leaves</button>
        <button class="chip" type="button" data-toggle="filler"><span class="chip__swatch" aria-hidden="true">✿</span>Little flowers</button>
      </div>
      <p class="panel__label">Wrapping paper</p>
      <div class="swatches">${PAPERS.map((p) => swatchBtn('paper', p.id, p.label, p.front, false)).join('')}</div>
      <p class="panel__label">Ribbon</p>
      <div class="swatches">${RIBBONS.map((r) => swatchBtn('ribbon', r.id, r.label, r.color, false)).join('')}</div>
    </div>`;

  function syncPanel() {
    panel.querySelectorAll('.tab').forEach((t) => {
      const on = t.dataset.pane === paneId;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on);
    });
    panel.querySelectorAll('[data-body]').forEach((b) => { b.hidden = b.dataset.body !== paneId; });
    panel.querySelectorAll('[data-flower]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.flower === state.type));
    const f = FLOWER[state.type];
    panel.querySelector('[data-swatches]').innerHTML = Object.entries(f.colors).map(([name, [main]]) =>
      swatchBtn('color', name, name[0].toUpperCase() + name.slice(1), main, state.color[state.type] === name)).join('');
    panel.querySelectorAll('[data-toggle]').forEach((b) => b.setAttribute('aria-pressed', !!state[b.dataset.toggle]));
    panel.querySelectorAll('[data-paper]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.paper === state.paper));
    panel.querySelectorAll('[data-ribbon]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.ribbon === state.ribbon));
    updateCount();
  }

  panel.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t || finished) return;
    const d = t.dataset;
    if (d.pane) paneId = d.pane;
    else if (d.flower) state.type = d.flower;
    else if (d.color) state.color[state.type] = d.color;
    else if (d.action === 'add') addFlower();
    else if (d.action === 'undo') undo();
    else if (d.toggle) {
      state[d.toggle] = !state[d.toggle];
      if (d.toggle === 'greenery') renderLeaves(true); else renderFiller(true);
      FX.sound.play('pop');
    } else if (d.paper) { state.paper = d.paper; renderPaper(); }
    else if (d.ribbon) { state.ribbon = d.ribbon; renderRibbon(true); FX.sound.play('pop'); }
    syncPanel();
  });

  /* ---------- Finish ---------- */
  finishBtn.addEventListener('click', () => {
    if (finished) return;
    if (state.flowers.length < 3) {
      hint(`Add at least ${3 - state.flowers.length} more flower${state.flowers.length === 2 ? '' : 's'} ♡`);
      FX.shake(finishBtn);
      paneId = 'flowers';
      syncPanel();
      return;
    }
    finish();
  });

  function finish() {
    finished = true;
    endDrag();
    svg.classList.add('is-final');
    if (state.ribbon === 'none') { state.ribbon = 'burgundy'; renderRibbon(true); } // every bouquet deserves a bow
    gsap.to([panel, actions], {
      autoAlpha: 0, y: 16, duration: 0.5,
      onComplete() { panel.hidden = true; actions.hidden = true; builder.classList.add('is-finished'); }
    });
    window.scrollTo({ top: 0, behavior: FX.REDUCED ? 'auto' : 'smooth' });

    setTimeout(() => { APP.snapshots.bouquet = FX.cloneSvg(svg, 'final'); }, 900);
    gsap.timeline({ delay: 0.5 })
      .to(stage, { scale: 1.05, duration: 1.2, ease: 'sine.inOut' })
      .call(() => {
        FX.petals.burst(26);
        FX.confetti.burstAt(stage, { count: 70, spread: 0.8 });
        FX.sound.play('chime');
        if (!FX.REDUCED) gsap.to($('bqAll'), { rotation: 1.6, transformOrigin: '50% 92%', duration: 1.6, yoyo: true, repeat: 5, ease: 'sine.inOut' });
      })
      .to(stage, { scale: 1, duration: 1, ease: 'sine.inOut' }, '+=0.4')
      .call(showMessage);
  }

  function showMessage() {
    APP.completeStep('bouquet');
    doneCard.hidden = false;
    gsap.fromTo(doneCard.children, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 1.1 });
  }

  /* ---------- Start ---------- */
  renderLeaves(false);
  renderPaper();
  syncPanel();
  hint('Choose a flower, a colour, then “Add” ♡');
}
