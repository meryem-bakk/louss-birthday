/* =========================================================
   effects.js — shared helpers used by every step:
   GSAP safety net, floating petals, confetti, toasts,
   small sounds and a few utilities. Exposed as window.FX.
   ========================================================= */
(function () {
  'use strict';

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* ---------- GSAP safety net ----------
     If the CDN is unreachable the site still works:
     every tween simply jumps to its end state. */
  if (!window.gsap) window.gsap = createGsapFallback();
  gsap.defaults({ ease: 'power2.out', duration: 0.8 });
  if (REDUCED) gsap.globalTimeline.timeScale(2.5);

  function createGsapFallback() {
    const list = (t) => (typeof t === 'string' ? [...document.querySelectorAll(t)]
      : t && t.length !== undefined && !t.nodeType ? [...t] : [t]);
    const apply = (targets, v = {}) => list(targets).forEach((el) => {
      if (!el) return;
      if ('volume' in v) el.volume = v.volume;
      if (!el.style) return;
      if (v.clearProps) { el.style.cssText = ''; return; }
      if ('autoAlpha' in v) { el.style.opacity = v.autoAlpha; el.style.visibility = v.autoAlpha ? 'visible' : 'hidden'; }
      if ('opacity' in v) el.style.opacity = v.opacity;
      if ('zIndex' in v) el.style.zIndex = v.zIndex;
    });
    const done = (v) => v && typeof v.onComplete === 'function' && setTimeout(v.onComplete, 0);
    const g = {
      to(t, v) { apply(t, v); done(v); return g; },
      from(t, v) { done(v); return g; },
      fromTo(t, a, b) { apply(t, b); done(b); return g; },
      set(t, v) { apply(t, v); return g; },
      delayedCall(d, fn) { setTimeout(fn, d * 1000); return g; },
      killTweensOf() {}, defaults() {},
      globalTimeline: { timeScale() {} },
      timeline(opts = {}) {
        const tl = {
          to(t, v) { apply(t, v); done(v); return tl; },
          from() { return tl; },
          fromTo(t, a, b) { apply(t, b); done(b); return tl; },
          set(t, v) { apply(t, v); return tl; },
          call(fn) { fn(); return tl; }
        };
        setTimeout(() => opts.onComplete && opts.onComplete(), 0);
        return tl;
      }
    };
    return g;
  }

  /* ---------- Canvas helper ---------- */
  function fitCanvas(canvas, ctx) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth, h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
  }

  /* ---------- Floating petals (background) ---------- */
  const Petals = (() => {
    const COLORS = ['#F5DDE3', '#E9B8C4', '#F2C9D3', '#E9E1F1', '#FBE9EE', '#DCCFEA'];
    const canvas = document.getElementById('petalCanvas');
    const ctx = canvas.getContext('2d');
    let size = { w: 0, h: 0 }, items = [], raf = null, last = 0;

    function make(temp) {
      return {
        x: Math.random() * size.w,
        y: temp ? -20 - Math.random() * size.h * 0.6 : Math.random() * size.h,
        s: 5 + Math.random() * 6,
        vy: temp ? 0.9 + Math.random() * 1.2 : 0.22 + Math.random() * 0.35,
        vx: (Math.random() - 0.5) * 0.3,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.02,
        phase: Math.random() * Math.PI * 2,
        sway: 0.4 + Math.random() * 0.8,
        color: pick(COLORS),
        a: 0.45 + Math.random() * 0.35,
        temp
      };
    }
    function draw(p) {
      const s = p.s;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, 0.4 + Math.abs(Math.cos(p.phase * 0.7)) * 0.6); // gentle 3D flutter
      ctx.globalAlpha = p.a;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.9, -s * 0.6, s * 0.6, s * 0.8, 0, s);
      ctx.bezierCurveTo(-s * 0.6, s * 0.8, -s * 0.9, -s * 0.6, 0, -s);
      ctx.fill();
      ctx.restore();
    }
    function tick(t) {
      const dt = Math.min(48, t - (last || t)) / 16.67;
      last = t;
      ctx.clearRect(0, 0, size.w, size.h);
      for (let i = items.length - 1; i >= 0; i--) {
        const p = items[i];
        p.phase += 0.012 * dt;
        p.x += (p.vx + Math.sin(p.phase) * p.sway * 0.5) * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        if (p.y > size.h + 20 || p.x < -40 || p.x > size.w + 40) {
          if (p.temp) { items.splice(i, 1); continue; }
          Object.assign(p, make(false), { y: -20 });
        }
        draw(p);
      }
      raf = items.length && !document.hidden ? requestAnimationFrame(tick) : null;
    }
    function start() { if (!raf && items.length && !document.hidden) { last = 0; raf = requestAnimationFrame(tick); } }
    function init() {
      size = fitCanvas(canvas, ctx);
      window.addEventListener('resize', () => { size = fitCanvas(canvas, ctx); });
      document.addEventListener('visibilitychange', start);
      const count = REDUCED ? 0 : size.w < 640 ? 14 : 24;
      for (let i = 0; i < count; i++) items.push(make(false));
      start();
    }
    function burst(n = 18) {
      if (REDUCED) n = Math.min(n, 5);
      for (let i = 0; i < n; i++) items.push(make(true));
      start();
    }
    return { init, burst };
  })();

  /* ---------- Confetti ---------- */
  const Confetti = (() => {
    const COLORS = ['#E9B8C4', '#9E5267', '#F5DDE3', '#E9E1F1', '#A8B9A3', '#F2D59B', '#FFFFFF', '#C9B6E4'];
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    let size = { w: 0, h: 0 }, parts = [], raf = null, last = 0;

    function heart(s) {
      ctx.beginPath();
      ctx.moveTo(0, s * 0.35);
      ctx.bezierCurveTo(-s * 0.7, -s * 0.1, -s * 0.35, -s * 0.65, 0, -s * 0.25);
      ctx.bezierCurveTo(s * 0.35, -s * 0.65, s * 0.7, -s * 0.1, 0, s * 0.35);
      ctx.fill();
    }
    function spawn(x, y, vx, vy) {
      parts.push({
        x, y, vx, vy,
        size: 6 + Math.random() * 6,
        rot: Math.random() * 6,
        vr: (Math.random() - 0.5) * 0.25,
        tilt: Math.random() * 6,
        color: pick(COLORS),
        shape: pick(['rect', 'rect', 'circle', 'heart']),
        life: 0,
        max: 170 + Math.random() * 90
      });
    }
    function tick(t) {
      const dt = Math.min(48, t - (last || t)) / 16.67;
      last = t;
      ctx.clearRect(0, 0, size.w, size.h);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.vy = Math.min(p.vy + 0.09 * dt, 3.2);
        p.vx *= Math.pow(0.985, dt);
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        p.tilt += 0.08 * dt;
        p.life += dt;
        if (p.life > p.max || p.y > size.h + 30) { parts.splice(i, 1); continue; }
        const fade = Math.max(0, (p.life - p.max * 0.7) / (p.max * 0.3));
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.cos(p.tilt));
        ctx.globalAlpha = 1 - fade;
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') ctx.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.6);
        else if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(0, 0, p.size * 0.35, 0, Math.PI * 2); ctx.fill(); }
        else heart(p.size);
        ctx.restore();
      }
      raf = parts.length ? requestAnimationFrame(tick) : null;
    }
    function start() { if (!raf) { last = 0; raf = requestAnimationFrame(tick); } }
    function burst({ x = size.w / 2, y = size.h / 2, count = 90, spread = 1 } = {}) {
      if (REDUCED) count = Math.round(count / 3);
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2, sp = (2 + Math.random() * 6) * spread;
        spawn(x, y, Math.cos(a) * sp, Math.sin(a) * sp - 4);
      }
      start();
    }
    function rain(count = 120) {
      if (REDUCED) count = Math.round(count / 3);
      for (let i = 0; i < count; i++) {
        spawn(Math.random() * size.w, -20 - Math.random() * size.h * 0.5, (Math.random() - 0.5) * 1.5, 1 + Math.random() * 2);
      }
      start();
    }
    function init() {
      size = fitCanvas(canvas, ctx);
      window.addEventListener('resize', () => { size = fitCanvas(canvas, ctx); });
    }
    return { init, burst, rain };
  })();

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    gsap.killTweensOf(el);
    gsap.fromTo(el, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.6 });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => gsap.to(el, { autoAlpha: 0, y: 10, duration: 0.6 }), 3000);
  }

  /* ---------- Little sounds (only when the user turned sound on) ---------- */
  const Sound = {
    enabled: false,
    ctx: null,
    getCtx() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    },
    tone(freq, t0, dur = 0.6, vol = 0.1, type = 'sine') {
      const c = this.ctx, o = c.createOscillator(), g = c.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g).connect(c.destination);
      o.start(t0);
      o.stop(t0 + dur + 0.05);
    },
    whoosh(t0) {
      const c = this.ctx, len = 0.7, buf = c.createBuffer(1, c.sampleRate * len, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      src.buffer = buf;
      f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 0.6;
      g.gain.value = 0.12;
      src.connect(f).connect(g).connect(c.destination);
      src.start(t0);
    },
    play(name) {
      if (!this.enabled) return;
      const c = this.getCtx();
      if (!c) return;
      const t = c.currentTime + 0.01;
      if (name === 'pop') this.tone(880, t, 0.16, 0.05, 'triangle');
      else if (name === 'chime') [1046.5, 1318.5, 1568, 2093].forEach((f, i) => this.tone(f, t + i * 0.09, 0.9, 0.06));
      else if (name === 'success') [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, t + i * 0.12, 1.3, 0.07));
      else if (name === 'blow') this.whoosh(t);
    }
  };

  /* ---------- Utilities ---------- */
  // Replaces {name}, {age}, {from}, {birthday} with CONFIG values
  const fmt = (s) => String(s ?? '').replace(/\{(\w+)\}/g, (m, k) => (CONFIG[k] != null ? CONFIG[k] : m));

  // Small seeded random generator → decorations look the same every time
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function burstAt(el, opts = {}) {
    const r = el.getBoundingClientRect();
    Confetti.burst({ x: r.left + r.width / 2, y: r.top + r.height / 2, ...opts });
  }

  function shake(el) {
    el.classList.remove('is-shake');
    void el.offsetWidth;
    el.classList.add('is-shake');
  }

  // Copy of an SVG for the finale: unique ids + animation leftovers removed
  function cloneSvg(svg, suffix) {
    const c = svg.cloneNode(true);
    c.removeAttribute('id');
    c.classList.remove('is-out', 'is-final');
    c.querySelectorAll('[style]').forEach((el) => el.removeAttribute('style'));
    c.querySelectorAll('.pop, [data-anim-root]').forEach((el) => el.removeAttribute('transform'));
    c.querySelectorAll('.smoke').forEach((el) => el.remove());
    let html = c.outerHTML;
    [...c.querySelectorAll('[id]')].forEach(({ id }) => {
      html = html.split(`id="${id}"`).join(`id="${id}-${suffix}"`)
        .split(`url(#${id})`).join(`url(#${id}-${suffix})`)
        .split(`href="#${id}"`).join(`href="#${id}-${suffix}"`);
    });
    return html;
  }

  window.FX = { REDUCED, petals: Petals, confetti: Object.assign(Confetti, { burstAt }), toast, sound: Sound, fmt, rng, shake, cloneSvg };

  Petals.init();
  Confetti.init();
})();
