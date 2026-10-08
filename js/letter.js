/* =========================================================
   letter.js — 01 · The letter
   Envelope lifts, flap opens, the sheet slides out,
   unfolds and the words appear one by one.
   (The text itself lives in CONFIG.letter → js/config.js)
   ========================================================= */
function initLetter() {
  const L = CONFIG.letter;
  const fmt = FX.fmt;
  const section = document.getElementById('letter');
  const stage = section.querySelector('.envelope-stage');
  const envelope = section.querySelector('#envelope');
  const sheet = section.querySelector('#letterSheet');
  const paper = sheet.querySelector('.letter__paper');
  const next = sheet.querySelector('.letter__next');

  // Fill the letter from the config
  sheet.querySelector('.letter__greeting').textContent = fmt(L.greeting);
  const body = sheet.querySelector('.letter__body');
  L.paragraphs.forEach((text) => {
    const p = document.createElement('p');
    p.textContent = fmt(text);
    body.appendChild(p);
  });
  sheet.querySelector('.letter__signoff').textContent = fmt(L.signoff);
  sheet.querySelector('.letter__signature').textContent = fmt(L.signature);

  let opened = false;
  envelope.addEventListener('click', openEnvelope);

  function openEnvelope() {
    if (opened) return;
    opened = true;
    envelope.classList.add('is-open');
    envelope.setAttribute('aria-expanded', 'true');
    FX.sound.play('pop');

    const flap = envelope.querySelector('.envelope__flap');
    const inner = envelope.querySelector('.envelope__paper');
    const seal = envelope.querySelector('.envelope__seal');

    gsap.timeline()
      .to(envelope, { y: -14, scale: 1.03, duration: 0.6 })                                  // 1. lift
      .to(seal, { scale: 0, autoAlpha: 0, duration: 0.35, ease: 'back.in(2)' }, '-=0.2')
      .to(flap, { rotationX: 180, duration: 0.85, ease: 'power2.inOut' })                     // 2. flap opens
      .set(flap, { zIndex: 1 }, '-=0.4')
      .to(inner, { yPercent: -62, duration: 1, ease: 'power2.inOut' }, '+=0.05')             // 3. sheet slides out
      .to(stage, { autoAlpha: 0, y: 30, duration: 0.6, ease: 'power2.in' }, '+=0.25')
      .call(revealLetter);
  }

  function revealLetter() {
    stage.hidden = true;
    sheet.hidden = false;
    window.scrollTo(0, 0);

    const lines = paper.querySelectorAll('.letter__date, .letter__greeting, .letter__body p, .letter__signoff, .letter__signature');
    gsap.set(lines, { autoAlpha: 0, y: 10 });
    gsap.set(next, { autoAlpha: 0, y: 16 });

    gsap.timeline()
      .fromTo(paper,                                                                             // 4. the sheet unfolds
        { autoAlpha: 0, scaleY: 0.08, rotationX: -70, y: -30, transformOrigin: '50% 0%' },
        { autoAlpha: 1, scaleY: 1, rotationX: 0, y: 0, duration: 1.4, ease: 'power3.out' })
      .call(() => FX.petals.burst(16))                                                           // 6. petals
      .to(lines, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.28 }, '-=0.4')                  // 5. words appear
      .to(next, { autoAlpha: 1, y: 0, duration: 0.8 }, '+=0.2')
      .call(() => APP.completeStep('letter'));
  }
}
