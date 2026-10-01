/**
 * anim.js — everything on the deck that moves.
 *
 *   1. Injects the generated illustrations (js/illus.js) into
 *      <div data-illus="name">.  This file is loaded at the END of <body>, so
 *      it runs before DOMContentLoaded and therefore before builds.js resolves
 *      its steps; `data-b` inside an illustration works like anywhere else.
 *
 *   2. Restarts every <video> on the slide you land on and pauses the rest.
 *
 *   3. <div data-anim="walk2d">  the point robot walking over the corner
 *      strata, with the stratum graph lighting up in step (slide 7).
 *
 *   4. <div class="walksync" data-walk="leap" data-video="vid-leap">
 *      the |A| staircase of a real plan, drawn from figures/*-walk.js, with a
 *      cursor locked to the video clock, so the frame on the left and the
 *      stratum on the right are always the same configuration.
 *
 * Printing shows every animation finished: full walk, no cursor.
 */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const ACC = '#E8702A', ACC_D = '#B9531A', INK = '#0A2F51';
  const MUTE = '#6A6A6A', GRID = '#E3EAF2';

  /* ------------------------------------------------------ 1. illustrations */
  document.querySelectorAll('[data-illus]').forEach((el) => {
    const k = el.getAttribute('data-illus');
    if (window.ILLUS && window.ILLUS[k]) el.innerHTML = window.ILLUS[k];
    else el.textContent = '[missing illustration ' + k + ']';
  });

  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };

  /* --------------------------------------------------------- 3. the 2D walk */
  const STRATUM_TEXT = {
    '0':  ['free space', 'dim 2'],
    '1':  ['on the floor', 'dim 1'],
    '2':  ['on the wall', 'dim 1'],
    '12': ['in the corner', 'dim 0'],
  };

  function walk2d(host) {
    const svg = host.querySelector('svg');
    const data = (window.ILLUS_DATA || {}).walk2d;
    if (!svg || !data) return null;
    const dot = svg.querySelector('#w2-dot');
    const trail = svg.querySelector('#w2-trail');
    const readout = host.parentElement.querySelector('[data-readout]');
    const SPEED = 115;              // px per second along the walk, one pass ~18 s
    const DWELL = 0.9;              // pause at every crossing
    const CORNER = 1.5;             // the 0-dim stratum is a single point
    const HOLD = 3.0;               // at the goal before looping

    // one timeline entry per piece: [t0, t1, stratum, pts, cumlen, event]
    const tl = [];
    let t = 0.4;
    data.segs.forEach((s, i) => {
      const ev = i;                 // crossing i happens as segment i starts
      // a crossing point lies in the closure of both strata, i.e. in the one
      // holding more contacts, so the pause there is labelled by that one
      const nA = (k) => (k === '0' ? 0 : k.length);
      const here = i > 0 && nA(data.segs[i - 1].st) > nA(s.st) ? data.segs[i - 1].st : s.st;
      if (i > 0) { tl.push({ t0: t, t1: t + DWELL, st: here, pts: [s.pts[0]], ev }); t += DWELL; }
      if (s.pts.length === 1) {
        tl.push({ t0: t, t1: t + CORNER, st: s.st, pts: s.pts, ev }); t += CORNER; return;
      }
      const cum = [0];
      for (let k = 1; k < s.pts.length; k++) {
        const [x0, y0] = s.pts[k - 1], [x1, y1] = s.pts[k];
        cum.push(cum[k - 1] + Math.hypot(x1 - x0, y1 - y0));
      }
      const dur = cum[cum.length - 1] / SPEED;
      tl.push({ t0: t, t1: t + dur, st: s.st, pts: s.pts, cum, ev }); t += dur;
    });
    const T = t + HOLD;

    const hot = (st) => svg.querySelectorAll('[data-st]').forEach((n) =>
      n.classList.toggle('hot', n.getAttribute('data-st') === st));
    const done = (n) => {
      svg.querySelectorAll('[data-edge]').forEach((e) =>
        e.classList.toggle('done', +e.getAttribute('data-edge') <= n));
      svg.querySelectorAll('[data-ev]').forEach((e) =>
        e.classList.toggle('done', +e.getAttribute('data-ev') <= n));
    };

    function at(time) {
      const trailPts = [];
      let cur = null;
      for (const p of tl) {
        if (time >= p.t1) { trailPts.push(...p.pts); cur = { st: p.st, x: p.pts.at(-1), ev: p.ev }; continue; }
        if (time < p.t0) break;
        if (!p.cum) { trailPts.push(p.pts[0]); cur = { st: p.st, x: p.pts[0], ev: p.ev }; break; }
        const s = (time - p.t0) / (p.t1 - p.t0) * p.cum.at(-1);
        let k = 1;
        while (k < p.cum.length - 1 && p.cum[k] < s) k++;
        const a = p.pts[k - 1], b = p.pts[k];
        const u = (s - p.cum[k - 1]) / Math.max(1e-9, p.cum[k] - p.cum[k - 1]);
        const x = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
        trailPts.push(...p.pts.slice(0, k), x);
        cur = { st: p.st, x, ev: p.ev };
        break;
      }
      if (!cur) cur = { st: '0', x: data.qs, ev: 0 };
      dot.setAttribute('cx', cur.x[0]); dot.setAttribute('cy', cur.x[1]);
      trail.setAttribute('points', (trailPts.length ? trailPts : [cur.x]).map((p) => p.join(',')).join(' '));
      hot(cur.st);
      done(cur.ev);
      if (readout) {
        const [where, dim] = STRATUM_TEXT[cur.st];
        readout.innerHTML = '<span class="ro-where">' + where + '</span><span class="ro-dim">' + dim + '</span>';
      }
    }

    let raf = 0, start = 0;
    const frame = (now) => {
      at(((now - start) / 1000) % T);
      raf = requestAnimationFrame(frame);
    };
    return {
      start() { svg.classList.add('playing'); start = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); },
      stop() { cancelAnimationFrame(raf); svg.classList.remove('playing'); },
    };
  }

  /* ------------------------------------------- 4. staircase synced to video */
  function walkChart(host) {
    const key = host.getAttribute('data-walk');
    const D = (window.WALK || {})[key];
    const video = document.getElementById(host.getAttribute('data-video'));
    if (!D) { host.textContent = '[missing walk data ' + key + ']'; return null; }

    const W = +host.getAttribute('data-w') || 900, H = +host.getAttribute('data-h') || 340;
    const M = { l: 78, r: 104, t: 16, b: 70 };
    const xs = (x) => M.l + (x - D.xmin) / (D.xmax - D.xmin) * (W - M.l - M.r);
    const y0 = D.ymin - 0.55, y1 = D.ymax + 0.45;
    const ys = (y) => M.t + (y1 - y) / (y1 - y0) * (H - M.t - M.b);
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, class: 'walk-svg' }, host);
    const txt = (x, y, s, o = {}) => {
      const e = el('text', Object.assign({ x, y, 'font-size': 24, fill: MUTE,
        'font-family': "'Source Sans 3', sans-serif", 'text-anchor': 'middle' }, o), svg);
      e.textContent = s; return e;
    };

    // horizontal grid, one line per contact count, with the stratum's
    // dimension written on the right so |A| and n - |A| read together
    for (let y = D.ymin; y <= D.ymax; y++) {
      el('line', { x1: M.l, x2: W - M.r, y1: ys(y), y2: ys(y), stroke: GRID, 'stroke-width': 1.5 }, svg);
      txt(M.l - 16, ys(y) + 8, String(y), { 'text-anchor': 'end', fill: INK });
      txt(W - M.r + 14, ys(y) + 8, 'dim ' + (D.n_dim - y), { 'text-anchor': 'start', 'font-size': 22 });
    }
    txt(24, (M.t + H - M.b) / 2, '# of contacts', { transform: `rotate(-90 24 ${(M.t + H - M.b) / 2})`, fill: INK });
    const step = D.xmax > 50 ? 20 : 2;
    for (let x = 0; x <= D.xmax + 1e-9; x += step) {
      el('line', { x1: xs(x), x2: xs(x), y1: H - M.b, y2: H - M.b + 7, stroke: '#9AA8B8', 'stroke-width': 1.5 }, svg);
      txt(xs(x), H - M.b + 32, String(x));
    }
    el('line', { x1: M.l, x2: W - M.r, y1: H - M.b, y2: H - M.b, stroke: '#9AA8B8', 'stroke-width': 1.5 }, svg);
    txt((M.l + W - M.r) / 2, H - 8, D.xlabel, { fill: INK });

    // the staircase, step-post
    const P = D.walk;
    let d = `M${xs(P[0][0])},${ys(P[0][1])}`;
    for (let k = 1; k < P.length; k++) d += `L${xs(P[k][0])},${ys(P[k - 1][1])}L${xs(P[k][0])},${ys(P[k][1])}`;
    d += `L${xs(D.xmax)},${ys(P.at(-1)[1])}`;
    const area = d + `L${xs(D.xmax)},${ys(y0)}L${xs(P[0][0])},${ys(y0)}Z`;
    const cid = 'clip-' + key;
    const clip = el('clipPath', { id: cid }, el('defs', {}, svg));
    const crect = el('rect', { x: 0, y: 0, width: W, height: H }, clip);
    el('path', { d: area, fill: ACC, 'fill-opacity': 0.08, class: 'walk-full' }, svg);
    el('path', { d, fill: 'none', stroke: ACC, 'stroke-width': 3, 'stroke-linejoin': 'round', class: 'walk-full' }, svg);
    const g = el('g', { 'clip-path': `url(#${cid})`, class: 'walk-trail' }, svg);
    el('path', { d: area, fill: ACC, 'fill-opacity': 0.14 }, g);
    el('path', { d, fill: 'none', stroke: ACC, 'stroke-width': 4, 'stroke-linejoin': 'round' }, g);

    // make / break marks, as in the paper's Figure 3
    // marks closer than a few pixels to the last one drawn at the same level
    // are skipped, so dense bursts of makes and breaks do not pile up
    let prev = P[0][1];
    const lastAt = {};
    for (let k = 1; k < P.length; k++) {
      const [x, y] = P[k];
      if (y === prev) continue;
      const cx = xs(x), cy = ys(y), r = D.xmax > 50 ? 6.5 : 8.5;
      const key = y + (y > prev ? 'u' : 'd');
      if (lastAt[key] !== undefined && cx - lastAt[key] < 3 * r) { prev = y; continue; }
      lastAt[key] = cx;
      if (y > prev) el('polygon', { points: `${cx},${cy - r} ${cx + r},${cy + r * 0.7} ${cx - r},${cy + r * 0.7}`, fill: ACC_D, stroke: '#fff', 'stroke-width': 1.2 }, svg);
      else el('polygon', { points: `${cx},${cy + r} ${cx + r},${cy - r * 0.7} ${cx - r},${cy - r * 0.7}`, fill: '#fff', stroke: ACC_D, 'stroke-width': 2 }, svg);
      prev = y;
    }
    const cursor = el('g', { class: 'walk-cursor' }, svg);
    const cl = el('line', { y1: M.t, y2: H - M.b, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '5 6' }, cursor);
    const cd = el('circle', { r: 11, fill: ACC, stroke: '#fff', 'stroke-width': 3.5 }, cursor);

    const panel = host.parentElement;
    const roA = panel.querySelector('[data-ro="A"]');
    const roDim = panel.querySelector('[data-ro="dim"]');
    const tips = [...panel.querySelectorAll('[data-tip]')];

    function show(i) {
      const f = D.frames[Math.max(0, Math.min(D.frames.length - 1, i))];
      const [x, y, mask] = f;
      crect.setAttribute('width', xs(x));
      cl.setAttribute('x1', xs(x)); cl.setAttribute('x2', xs(x));
      cd.setAttribute('cx', xs(x)); cd.setAttribute('cy', ys(y));
      if (roA) roA.textContent = y;
      if (roDim) roDim.textContent = D.n_dim - y;
      tips.forEach((t) => t.classList.toggle('on', !!(mask & (1 << +t.getAttribute('data-tip')))));
    }
    show(0);

    let raf = 0;
    const loop = () => {
      if (video) show(Math.floor(video.currentTime * D.fps));
      raf = requestAnimationFrame(loop);
    };
    return {
      start() { svg.classList.add('playing'); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); },
      stop() { cancelAnimationFrame(raf); svg.classList.remove('playing'); },
    };
  }

  /* ----------------------------------------------------- slide lifecycle */
  const players = new WeakMap();   // slide -> [{start, stop}]

  function playersOf(slide) {
    if (!players.has(slide)) {
      const list = [];
      slide.querySelectorAll('[data-anim="walk2d"]').forEach((h) => { const p = walk2d(h); if (p) list.push(p); });
      slide.querySelectorAll('.walksync').forEach((h) => { const p = walkChart(h); if (p) list.push(p); });
      players.set(slide, list);
    }
    return players.get(slide);
  }

  function enter(slide) {
    if (!slide) return;
    slide.querySelectorAll('video').forEach((v) => {
      v.muted = true;
      v.defaultPlaybackRate = v.playbackRate = +v.dataset.rate || 1;   // the staircase follows currentTime
      try { v.currentTime = 0; } catch (e) {}
      const p = v.play(); if (p && p.catch) p.catch(() => {});
    });
    playersOf(slide).forEach((p) => p.start());
  }
  function leave(slide) {
    if (!slide) return;
    slide.querySelectorAll('video').forEach((v) => v.pause());
    playersOf(slide).forEach((p) => p.stop());
  }

  function init() {
    const stage = document.querySelector('deck-stage');
    if (!stage) return;
    const slides = [...stage.children].filter((n) => n.nodeType === 1);
    slides.forEach((s) => playersOf(s));          // build every chart once
    // deep link: index.html#s=7 opens slide 7 (handy for rehearsing one slide)
    const m = /[#&]s=(\d+)/.exec(location.hash);
    if (m) stage.goTo(Math.max(0, Math.min(slides.length - 1, +m[1] - 1)));
    let current = slides[stage.index || 0];
    slides.forEach((s) => { if (s !== current) leave(s); });
    enter(current);
    stage.addEventListener('slidechange', (e) => {
      const next = e.detail && e.detail.slide;
      if (next === current) return;
      leave(current); current = next; enter(current);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
