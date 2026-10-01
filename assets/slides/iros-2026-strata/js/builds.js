/**
 * builds.js — click-to-reveal builds (Keynote "builds", Beamer "overlays").
 *
 * AUTHORING
 * ---------
 * Put `data-b` on anything you want to appear on a click instead of with the
 * slide:
 *
 *     <div data-b>appears on the 1st click</div>
 *     <div data-b>appears on the 2nd click</div>
 *
 * Give two elements the SAME number and they appear together:
 *
 *     <img data-b="1" ...>        <-- these two
 *     <div data-b="1">...</div>   <-- appear on the same click
 *     <div data-b="2">...</div>   <-- then this one
 *
 * You can mix them: a bare `data-b` takes the next free number after the
 * highest explicit one seen so far, in document order. Numbers do not have to
 * be contiguous — `1, 2, 5` is three clicks, not five.
 *
 * Anything without `data-b` is on the slide from the start, as usual.
 *
 * BEHAVIOUR
 * ---------
 *   right / space / page-down   next build, then next slide
 *   left / page-up              previous build, then previous slide
 *   click (left 25% / rest)     same as left / right
 *   down / up                   skip the builds, jump slide to slide
 *
 * Entering a slide forwards starts it unbuilt; entering it backwards shows it
 * fully built, so stepping back never replays a build you already did.
 *
 * Revealed elements keep their space in the layout the whole time
 * (visibility, not display), so nothing on the slide moves as builds land.
 *
 * Printing reveals everything — see the @media print rule in deck.css.
 */

(() => {
  const ATTR = 'data-b';
  const STEP = 'data-b-step';      // resolved integer step, written on mount
  const READY = 'data-b-on';       // present once revealed

  let stage = null;
  let slides = [];
  let index = -1;                  // current slide index
  let step = 0;                    // builds revealed on the current slide

  /* ---------------------------------------------------------------- setup */

  function resolveSteps(slide) {
    // Assign every data-b element an integer step, in document order.
    // A bare data-b continues from the highest number already handed out.
    let next = 0;
    slide.querySelectorAll('[' + ATTR + ']').forEach((el) => {
      const raw = (el.getAttribute(ATTR) || '').trim();
      let n;
      if (raw === '') {
        n = ++next;
      } else {
        n = parseInt(raw, 10);
        if (!Number.isFinite(n)) n = ++next;
        next = Math.max(next, n);
      }
      el.setAttribute(STEP, String(n));
    });
    const steps = [...slide.querySelectorAll('[' + STEP + ']')]
      .map((el) => parseInt(el.getAttribute(STEP), 10));
    // the ordered list of distinct steps this slide has
    return [...new Set(steps)].sort((a, b) => a - b);
  }

  const stepsOf = new WeakMap();   // slide -> [1, 2, 3...]

  function buildCount(slide) {
    if (!slide) return 0;
    if (!stepsOf.has(slide)) stepsOf.set(slide, resolveSteps(slide));
    return stepsOf.get(slide).length;
  }

  function applyStep(slide, n) {
    if (!slide) return;
    const order = stepsOf.get(slide) || [];
    const shown = new Set(order.slice(0, n));
    slide.querySelectorAll('[' + STEP + ']').forEach((el) => {
      const s = parseInt(el.getAttribute(STEP), 10);
      if (shown.has(s)) el.setAttribute(READY, '');
      else el.removeAttribute(READY);
    });
  }

  /* ------------------------------------------------------------ navigation */

  function forward() {
    const slide = slides[index];
    if (step < buildCount(slide)) {
      step += 1;
      applyStep(slide, step);
      return true;          // consumed
    }
    return false;           // let deck-stage change slide
  }

  function backward() {
    const slide = slides[index];
    if (step > 0) {
      step -= 1;
      applyStep(slide, step);
      return true;
    }
    return false;
  }

  /* ----------------------------------------------------------- key / click */

  const NEXT = new Set(['ArrowRight', 'PageDown', ' ', 'Spacebar']);
  const PREV = new Set(['ArrowLeft', 'PageUp']);

  function onKey(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || '')) return;

    if (NEXT.has(e.key)) {
      if (forward()) { e.preventDefault(); e.stopImmediatePropagation(); }
    } else if (PREV.has(e.key)) {
      if (backward()) { e.preventDefault(); e.stopImmediatePropagation(); }
    }
    // ArrowDown / ArrowUp fall through to deck-stage untouched, so they are
    // the "skip the builds" escape hatch.
  }

  function onClick(e) {
    const back = e.clientX < window.innerWidth * 0.25;
    const consumed = back ? backward() : forward();
    if (consumed) { e.preventDefault(); e.stopImmediatePropagation(); }
  }

  /* -------------------------------------------------------------- lifecycle */

  function onSlideChange(e) {
    const d = e.detail || {};
    const prevIndex = index;
    index = typeof d.index === 'number' ? d.index : index;
    const slide = slides[index];
    buildCount(slide);                      // make sure steps are resolved

    const movingBack = prevIndex > -1 && index < prevIndex;
    step = movingBack ? buildCount(slide) : 0;
    applyStep(slide, step);
  }

  function init() {
    stage = document.querySelector('deck-stage');
    if (!stage) return;
    slides = [...stage.children].filter((el) => el.nodeType === 1);

    slides.forEach((s) => { buildCount(s); applyStep(s, 0); });

    stage.addEventListener('slidechange', onSlideChange);
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('click', onClick, true);

    // deck-stage fires `slidechange` on mount with reason 'init'; if we missed
    // it (script order), sync to whatever it restored from localStorage.
    if (index < 0) {
      const active = slides.findIndex(
        (s) => getComputedStyle(s).visibility !== 'hidden');
      index = active < 0 ? 0 : active;
      step = 0;
      applyStep(slides[index], 0);
    }
    document.documentElement.setAttribute('data-builds', 'on');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
