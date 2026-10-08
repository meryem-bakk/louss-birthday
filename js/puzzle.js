/* =========================================================
   puzzle.js — 02 · The puzzle
   Pieces are swapped by drag & drop (mouse + touch, via
   Pointer Events) or by tapping two pieces. Keyboard: Enter.
   ========================================================= */
function initPuzzle() {
  const clamp = (v) => Math.max(1, Math.min(6, parseInt(v, 10) || 4));
  const COLS = clamp(CONFIG.puzzleCols || CONFIG.puzzleSize);
  const ROWS = clamp(CONFIG.puzzleRows || CONFIG.puzzleSize);
  const COUNT = COLS * ROWS;
  const board = document.getElementById('puzzleBoard');
  const movesEl = document.getElementById('puzzleMoves');
  const doneCard = document.getElementById('puzzleDone');
  const peekBtn = document.getElementById('puzzlePeek');
  const restartBtn = document.getElementById('puzzleRestart');
  board.style.setProperty('--cols', COLS);
  board.style.setProperty('--rows', ROWS);

  let order = [];   // order[slot] = id of the piece sitting in that slot
  const pieces = []; // pieces[id] = element
  let moves = 0, solved = false, selected = null, drag = null, target = null, peekTimer;

  const peek = document.createElement('div');
  peek.className = 'puzzle-peek';
  board.appendChild(peek);

  board.classList.add('is-loading'); // hidden until the photo's real shape is known
  prepareImage(CONFIG.puzzleImage).then(build);

  /* ---------- Setup ---------- */
  function build(url) {
    peek.style.backgroundImage = `url("${url}")`;
    board.classList.remove('is-loading');
    for (let id = 0; id < COUNT; id++) {
      const row = Math.floor(id / COLS), col = id % COLS;
      const el = document.createElement('div');
      el.className = 'piece';
      el.dataset.id = id;
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', `Piece ${id + 1}`);
      const corner = { 0: 'tl', [COLS - 1]: 'tr', [COLS * (ROWS - 1)]: 'bl', [COUNT - 1]: 'br' }[id];
      if (corner) el.dataset.corner = corner;
      const img = document.createElement('div');
      img.className = 'piece__img';
      img.style.backgroundImage = `url("${url}")`;
      img.style.backgroundSize = `${COLS * 100}% ${ROWS * 100}%`;
      img.style.backgroundPosition = `${COLS > 1 ? (col / (COLS - 1)) * 100 : 0}% ${ROWS > 1 ? (row / (ROWS - 1)) * 100 : 0}%`;
      el.appendChild(img);
      board.appendChild(el);
      pieces.push(el);
    }
    shuffle(false);

    board.addEventListener('pointerdown', onDown);
    board.addEventListener('pointermove', onMove);
    board.addEventListener('pointerup', onUp);
    board.addEventListener('pointercancel', onUp);
    board.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('piece')) {
        e.preventDefault();
        tap(e.target);
      }
    });
    restartBtn.addEventListener('click', () => shuffle(true));
    peekBtn.addEventListener('click', togglePeek);

    gsap.fromTo(board.querySelectorAll('.piece__img'),
      { autoAlpha: 0, scale: 0.6 },
      { autoAlpha: 1, scale: 1, duration: 0.6, stagger: { each: 0.03, from: 'random' }, ease: 'back.out(1.6)', clearProps: 'transform' });
  }

  // Keeps the photo's own shape (between 3:4 and 3:2): the board takes the same ratio.
  // Photos outside that range are cropped around the centre. Resolves to the image URL.
  function prepareImage(src) {
    const MIN = 3 / 4, MAX = 3 / 2;
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth, h = img.naturalHeight;
        const ratio = w && h ? Math.min(MAX, Math.max(MIN, w / h)) : 1;
        board.style.aspectRatio = String(ratio);
        if (!w || !h || Math.abs(w / h - ratio) < 0.01 || /\.svg(\?|$)/i.test(src)) return resolve(src);
        try {
          const cw = Math.min(w, h * ratio), ch = cw / ratio, scale = Math.min(1, 1200 / cw);
          const c = document.createElement('canvas');
          c.width = Math.round(cw * scale);
          c.height = Math.round(ch * scale);
          c.getContext('2d').drawImage(img, (w - cw) / 2, (h - ch) / 2, cw, ch, 0, 0, c.width, c.height);
          c.toBlob((blob) => resolve(blob ? URL.createObjectURL(blob) : src), 'image/jpeg', 0.88);
        } catch (e) {
          resolve(src);
        }
      };
      img.onerror = () => resolve(src);
      img.src = src;
    });
  }

  /* ---------- Positions ---------- */
  const slotOf = (el) => order.indexOf(+el.dataset.id);
  // A piece in its right place is locked (glows softly) — makes the puzzle gentler
  const isHome = (el) => slotOf(el) === +el.dataset.id;

  function slotAt(x, y) {
    const r = board.getBoundingClientRect();
    if (x < r.left || x > r.right || y < r.top || y > r.bottom) return -1;
    const col = Math.min(COLS - 1, Math.floor(((x - r.left) / r.width) * COLS));
    const row = Math.min(ROWS - 1, Math.floor(((y - r.top) / r.height) * ROWS));
    return row * COLS + col;
  }

  // Moves a piece to a slot; if `from` (a previous rect) is given, it glides there (FLIP)
  function place(el, slot, from) {
    el.style.transition = 'none';
    el.style.left = `${((slot % COLS) * 100) / COLS}%`;
    el.style.top = `${(Math.floor(slot / COLS) * 100) / ROWS}%`;
    el.style.transform = '';
    if (!from) return;
    const now = el.getBoundingClientRect();
    const dx = from.left - now.left, dy = from.top - now.top;
    if (!dx && !dy) return;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
    el.getBoundingClientRect(); // force reflow
    el.style.transition = 'transform .42s cubic-bezier(.22,.8,.3,1)';
    el.style.transform = '';
    el.classList.add('is-moving');
    setTimeout(() => el.classList.remove('is-moving'), 450);
  }

  function swap(a, b, rectA) {
    const ra = rectA || a.getBoundingClientRect(), rb = b.getBoundingClientRect();
    const sa = slotOf(a), sb = slotOf(b);
    order[sa] = +b.dataset.id;
    order[sb] = +a.dataset.id;
    place(a, sb, ra);
    place(b, sa, rb);
    moves++;
    movesEl.textContent = moves;
    FX.sound.play('pop');
    [a, b].forEach((el) => {
      if (isHome(el)) {
        setTimeout(() => { el.classList.remove('is-correct'); void el.offsetWidth; el.classList.add('is-correct', 'is-home'); }, 380);
      }
    });
    if (order.every((id, slot) => id === slot)) {
      solved = true;
      setTimeout(celebrate, 480);
    }
  }

  /* ---------- Tap / keyboard ---------- */
  function clearSelected() {
    if (selected) selected.classList.remove('is-selected');
    selected = null;
  }
  function tap(el) {
    if (solved || isHome(el)) return;
    if (!selected) { selected = el; el.classList.add('is-selected'); return; }
    if (selected === el) { clearSelected(); return; }
    const first = selected;
    clearSelected();
    swap(first, el);
  }

  /* ---------- Drag & drop ---------- */
  function setTarget(el) {
    if (target === el) return;
    if (target) target.classList.remove('is-target');
    target = el;
    if (target) target.classList.add('is-target');
  }
  function onDown(e) {
    if (solved || drag || e.button > 0) return;
    const el = e.target.closest('.piece');
    if (!el || isHome(el)) return;
    e.preventDefault();
    drag = { el, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, moved: false, id: e.pointerId };
    board.setPointerCapture(e.pointerId);
  }
  function onMove(e) {
    if (!drag || e.pointerId !== drag.id) return;
    drag.dx = e.clientX - drag.x0;
    drag.dy = e.clientY - drag.y0;
    if (!drag.moved) {
      if (Math.hypot(drag.dx, drag.dy) < 6) return;
      drag.moved = true;
      drag.el.classList.add('is-dragging');
      clearSelected();
    }
    drag.el.style.transition = 'none';
    drag.el.style.transform = `translate(${drag.dx}px, ${drag.dy}px) scale(1.06)`;
    const s = slotAt(e.clientX, e.clientY);
    const over = s >= 0 ? pieces[order[s]] : null;
    setTarget(over && over !== drag.el && !isHome(over) ? over : null);
  }
  function onUp(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag;
    drag = null;
    if (!d.moved) { if (e.type === 'pointerup') tap(d.el); return; }
    d.el.classList.remove('is-dragging');
    d.el.style.transform = `translate(${d.dx}px, ${d.dy}px)`;
    const rect = d.el.getBoundingClientRect();
    const over = target;
    setTarget(null);
    if (over && e.type === 'pointerup') swap(d.el, over, rect);
    else place(d.el, slotOf(d.el), rect); // glide back home
  }

  /* ---------- Controls ---------- */
  function shuffle(animate) {
    solved = false;
    board.classList.remove('is-solved');
    doneCard.hidden = true;
    moves = 0;
    movesEl.textContent = 0;
    clearSelected();
    const ids = [...Array(COUNT).keys()];
    do {
      for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
      }
    } while (ids.filter((v, i) => v === i).length > Math.max(1, Math.floor(COUNT / 6)));
    const rects = animate ? pieces.map((p) => p.getBoundingClientRect()) : [];
    order = ids;
    order.forEach((id, slot) => place(pieces[id], slot, rects[id]));
    pieces.forEach((el) => el.classList.toggle('is-home', isHome(el)));
  }

  function togglePeek() {
    clearTimeout(peekTimer);
    const on = board.classList.toggle('is-peeking');
    if (on) peekTimer = setTimeout(() => board.classList.remove('is-peeking'), 2200);
  }

  function celebrate() {
    board.classList.remove('is-peeking');
    board.classList.add('is-solved');
    FX.sound.play('success');
    FX.confetti.burstAt(board, { count: 110 });
    FX.petals.burst(14);
    gsap.fromTo(board, { scale: 1 }, { scale: 1.03, duration: 0.5, yoyo: true, repeat: 1, ease: 'sine.inOut' });
    APP.completeStep('puzzle');
    doneCard.hidden = false;
    gsap.fromTo(doneCard.children, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.25, delay: 0.6 });
    setTimeout(() => doneCard.scrollIntoView({ behavior: FX.REDUCED ? 'auto' : 'smooth', block: 'center' }), 900);
  }
}
