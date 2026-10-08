/* =========================================================
   main.js — the journey: state, navigation between sections,
   landing intro, finale and background music.
   ========================================================= */
(function () {
  'use strict';

  const STEPS = ['letter', 'puzzle', 'cake', 'bouquet'];
  const LABELS = { letter: 'Letter', puzzle: 'Puzzle', cake: 'Cake', bouquet: 'Bouquet' };

  // A step only becomes true when its activity is really finished
  const completedSteps = { letter: false, puzzle: false, cake: false, bouquet: false };

  const initializers = { letter: initLetter, puzzle: initPuzzle, cake: initCakeBuilder, bouquet: initBouquetBuilder };
  const initialized = {};
  let current = 'landing';
  let busy = false;

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  window.APP = { completedSteps, snapshots: {}, showSection, completeStep, showFinale };

  /* ---------- Config → page ---------- */
  function applyConfig() {
    const get = (path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), CONFIG);
    $$('[data-config]').forEach((el) => {
      const v = get(el.dataset.config);
      if (v != null) el.textContent = FX.fmt(v);
    });
    document.title = `Happy Birthday, ${CONFIG.name} ♡`;
    const vars = { cream: '--cream', rose: '--rose', roseLight: '--rose-light', accent: '--accent', lavender: '--lavender', sage: '--sage', text: '--text' };
    Object.entries(CONFIG.colors || {}).forEach(([k, v]) => vars[k] && document.documentElement.style.setProperty(vars[k], v));
  }

  /* ---------- Navigation ---------- */
  function isUnlocked(id) {
    if (id === 'landing') return true;
    if (id === 'finale') return STEPS.every((s) => completedSteps[s]);
    const i = STEPS.indexOf(id);
    return i === 0 || completedSteps[STEPS[i - 1]];
  }

  function showSection(id) {
    if (id === current || busy || !isUnlocked(id)) return;
    busy = true;
    const from = document.getElementById(current);
    const to = document.getElementById(id);

    gsap.to(from, {
      autoAlpha: 0, y: -16, duration: 0.6, ease: 'power2.inOut',
      onComplete() {
        from.classList.remove('is-active');
        gsap.set(from, { clearProps: 'all' });
        window.scrollTo(0, 0);
        to.classList.add('is-active');
        current = id;
        document.body.dataset.section = id;
        updateNav();

        if (id === 'finale') initFinale();
        else if (!initialized[id] && initializers[id]) { initializers[id](); initialized[id] = true; }

        gsap.fromTo(to, { autoAlpha: 0, y: 20 }, {
          autoAlpha: 1, y: 0, duration: 0.9, ease: 'power2.out',
          onComplete() {
            busy = false;
            gsap.set(to, { clearProps: 'transform' });
            const h = to.querySelector('[tabindex="-1"]');
            if (h) h.focus({ preventScroll: true });
          }
        });
      }
    });
  }

  function showFinale() { showSection('finale'); }

  function completeStep(step) {
    if (completedSteps[step]) return;
    completedSteps[step] = true;
    updateNav();
    const i = STEPS.indexOf(step), next = STEPS[i + 1];
    if (next) {
      const btn = $(`.step-btn[data-step="${next}"]`);
      btn.classList.remove('is-unlocking');
      void btn.offsetWidth;
      btn.classList.add('is-unlocking');
      FX.toast(`Step 0${i + 2} — ${LABELS[next]} unlocked ✨`);
    } else {
      FX.toast('Your last surprise is unlocked 🎁');
    }
  }

  function updateNav() {
    $$('.step-btn').forEach((btn) => {
      const id = btn.dataset.step, locked = !isUnlocked(id);
      btn.classList.toggle('is-current', id === current);
      btn.classList.toggle('is-done', completedSteps[id]);
      btn.disabled = locked;
      if (id === current) btn.setAttribute('aria-current', 'step'); else btn.removeAttribute('aria-current');
    });
  }

  /* ---------- Landing ---------- */
  function playIntro() {
    const els = ['.hero__art', '.hero__kicker', '.hero__title', '.hero__subtitle', '.hero .btn'].map((s) => $(s));
    gsap.set(els, { autoAlpha: 0 });
    document.documentElement.classList.remove('preload');
    gsap.timeline({ delay: 0.2 })
      .fromTo(els[0], { autoAlpha: 0, scale: 0.9, y: 10 }, { autoAlpha: 1, scale: 1, y: 0, duration: 1.4, ease: 'power3.out' })
      .fromTo(els[1], { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.8 }, '-=0.8')
      .fromTo(els[2], { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1.3, ease: 'power3.out' }, '-=0.5')
      .fromTo(els[3], { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 1 }, '-=0.6')
      .fromTo(els[4], { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.9 }, '-=0.5');

    // Very light parallax on desktop
    if (!FX.REDUCED && window.matchMedia('(hover: hover)').matches) {
      window.addEventListener('mousemove', (e) => {
        if (current !== 'landing') return;
        const dx = e.clientX / window.innerWidth - 0.5, dy = e.clientY / window.innerHeight - 0.5;
        gsap.to('.hero__art', { x: dx * 14, y: dy * 10, duration: 1.4, overwrite: 'auto' });
        gsap.to('.blob--rose', { x: dx * -30, y: dy * -20, duration: 2, overwrite: 'auto' });
      });
    }
  }

  /* ---------- Finale ---------- */
  function initFinale() {
    const cakeHost = $('#finaleCake'), bqHost = $('#finaleBouquet');
    cakeHost.innerHTML = APP.snapshots.cake || '';
    bqHost.innerHTML = APP.snapshots.bouquet || '';
    cakeHost.hidden = !APP.snapshots.cake;
    bqHost.hidden = !APP.snapshots.bouquet;

    const photo = CONFIG.finalPhoto || CONFIG.puzzleImage;
    $('#finalePhoto').hidden = !photo;
    if (photo) $('#finalePhoto img').src = photo;

    const msg = $('#finaleMessage');
    msg.innerHTML = '';
    CONFIG.finale.lines.forEach((t) => {
      const p = document.createElement('p');
      p.textContent = FX.fmt(t);
      msg.appendChild(p);
    });
    const last = document.createElement('p');
    last.className = 'finale-last';
    last.textContent = FX.fmt(CONFIG.finale.last);
    msg.appendChild(last);

    const sky = $('#finaleSky');
    if (!sky.childElementCount) {
      for (let i = 0; i < 28; i++) {
        const s = document.createElement('span');
        s.className = 'finale-star';
        s.textContent = i % 3 ? '✦' : '✧';
        s.style.left = `${Math.random() * 100}%`;
        s.style.top = `${Math.random() * 100}%`;
        s.style.fontSize = `${8 + Math.random() * 14}px`;
        s.style.color = ['#E9B8C4', '#C9B6E4', '#F2D59B', '#FFFFFF'][i % 4];
        s.style.animationDelay = `${-Math.random() * 3.2}s`;
        sky.appendChild(s);
      }
    }

    const gifts = $$('.finale-gifts > :not([hidden])');
    gsap.timeline({ delay: 0.5 })
      .fromTo(gifts, { autoAlpha: 0, y: 30, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1.2, stagger: 0.25, ease: 'power3.out' })
      .fromTo('.finale-title', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 1.4, ease: 'power3.out' }, '-=0.4')
      .call(() => { FX.confetti.rain(140); FX.petals.burst(26); FX.sound.play('success'); })
      .fromTo(msg.children, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 1.2 }, '+=0.3')
      .call(() => FX.confetti.burstAt(last, { count: 90 }))
      .fromTo(['.finale-sign', '#replay'], { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, stagger: 0.4 }, '+=0.2');
  }

  /* ---------- Music ----------
     Never starts on its own: only after a tap on 🔊.
     Plays CONFIG.music; if the file is missing, falls back to
     a soft music-box "Happy Birthday" made with Web Audio. */
  const MusicBox = (() => {
    const N = { G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99 };
    const SONG = [
      ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
      ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
      ['G4', 0.75], ['G4', 0.25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 2],
      ['F5', 0.75], ['F5', 0.25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 3]
    ];
    const BEAT = 0.52;
    let master = null, timer = null, playing = false;

    function pluck(c, out, f, t, beats) {
      const dur = Math.min(2.4, beats * BEAT + 1.2);
      [[f, 0.16], [f * 2, 0.04], [f * 3.01, 0.015]].forEach(([freq, vol]) => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g).connect(out);
        o.start(t);
        o.stop(t + dur + 0.05);
      });
    }
    function schedule(c, out, t0) {
      let t = t0;
      SONG.forEach(([n, b]) => { pluck(c, out, N[n] * 2, t, b); t += b * BEAT; });
      const next = t + BEAT * 5;
      timer = setTimeout(() => { if (playing) schedule(c, out, next); }, Math.max(0, (next - c.currentTime - 1) * 1000));
    }
    function start() {
      const c = FX.sound.getCtx();
      if (!c || playing) return;
      playing = true;
      master = c.createGain();
      master.gain.setValueAtTime(0.0001, c.currentTime);
      master.gain.exponentialRampToValueAtTime(0.6, c.currentTime + 1.2);
      const delay = c.createDelay(), fb = c.createGain(), lp = c.createBiquadFilter();
      delay.delayTime.value = 0.33;
      fb.gain.value = 0.28;
      lp.type = 'lowpass';
      lp.frequency.value = 2200;
      master.connect(c.destination);
      master.connect(delay);
      delay.connect(lp);
      lp.connect(fb);
      fb.connect(delay);
      lp.connect(c.destination);
      schedule(c, master, c.currentTime + 0.25);
    }
    function stop() {
      if (!playing) return;
      playing = false;
      clearTimeout(timer);
      const c = FX.sound.ctx, m = master;
      m.gain.cancelScheduledValues(c.currentTime);
      m.gain.setValueAtTime(Math.max(m.gain.value, 0.0001), c.currentTime);
      m.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.6);
      setTimeout(() => m.disconnect(), 800);
    }
    return { start, stop };
  })();

  const Music = (() => {
    const btn = $('#soundToggle');
    let on = false, audio = null, useBox = !CONFIG.music;

    function setUI() {
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', on);
      btn.setAttribute('aria-label', on ? 'Turn music off' : 'Turn music on');
    }
    async function start() {
      on = true;
      FX.sound.enabled = true;
      FX.sound.getCtx();
      setUI();
      if (!useBox) {
        try {
          if (!audio) { audio = new Audio(CONFIG.music); audio.loop = true; }
          gsap.killTweensOf(audio);
          audio.volume = 0;
          await audio.play();
          if (!on) { audio.pause(); return; }
          gsap.to(audio, { volume: CONFIG.musicVolume ?? 0.5, duration: 1.5 });
          return;
        } catch (e) {
          useBox = true; // file missing or unreadable → music box
        }
      }
      if (on) MusicBox.start();
    }
    function stop() {
      on = false;
      FX.sound.enabled = false;
      setUI();
      if (audio && !audio.paused) {
        gsap.killTweensOf(audio);
        gsap.to(audio, { volume: 0, duration: 0.6, onComplete: () => { if (!on) audio.pause(); } });
      }
      MusicBox.stop();
    }
    btn.addEventListener('click', () => (on ? stop() : start()));
  })();

  /* ---------- Boot ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    applyConfig();
    updateNav();

    document.addEventListener('click', (e) => {
      const go = e.target.closest('[data-goto]');
      if (go) showSection(go.dataset.goto);
      const step = e.target.closest('.step-btn');
      if (step && !step.disabled) showSection(step.dataset.step);
    });
    $('#replay').addEventListener('click', () => window.location.reload());

    playIntro();
  });
})();
