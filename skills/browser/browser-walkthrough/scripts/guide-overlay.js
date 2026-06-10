() => {
  const MODE = __MODE__;
  const TITLE = __TITLE__;
  const SPECS = __SPECS__;

  const SEQ_COLORS = ['#ff2d95', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#14b8a6', '#d946ef'];
  const OPT_COLOR = '#ff8800';
  const ONE_COLOR = '#ff2d95';
  const colorFor = (i) => MODE === 'seq' ? SEQ_COLORS[i % SEQ_COLORS.length] : (MODE === 'opt' ? OPT_COLOR : ONE_COLOR);
  const labelFor = (i) => MODE === 'seq' ? String(i + 1) : (MODE === 'opt' ? String.fromCharCode(65 + i) : '👉');

  if (window.__ccHl && typeof window.__ccHl.cleanup === 'function') {
    try { window.__ccHl.cleanup(); } catch (e) {}
  }
  document.querySelectorAll('[data-cc-hl]').forEach(x => {
    x.style.outline = '';
    x.style.outlineOffset = '';
    x.style.boxShadow = '';
    x.removeAttribute('data-cc-hl');
  });
  document.querySelectorAll('.cc-hl-badge, .cc-hl-card, .cc-hl-banner').forEach(x => x.remove());
  ['cc-hl-style', 'cc-hl-panel'].forEach(id => { const e = document.getElementById(id); if (e) e.remove(); });

  const style = document.createElement('style');
  style.id = 'cc-hl-style';
  style.textContent = [
    '.cc-hl-badge { position:fixed; z-index:999999; min-width:28px; height:28px; padding:0 8px; border-radius:14px; color:#fff; font:bold 13px/28px -apple-system,system-ui,sans-serif; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.35); pointer-events:none; white-space:nowrap; transition:transform .15s; }',
    '.cc-hl-panel { position:fixed; z-index:999998; top:72px; right:16px; width:320px; max-height:calc(100vh - 92px); display:flex; flex-direction:column; background:#fff; border-radius:12px; box-shadow:0 10px 32px rgba(0,0,0,0.22); font:13px/1.4 -apple-system,system-ui,sans-serif; color:#222; overflow:hidden; }',
    '.cc-hl-panel.collapsed .cc-hl-body { display:none; }',
    '.cc-hl-panel-head { padding:10px 12px; border-bottom:1px solid #eee; display:flex; gap:8px; align-items:center; font-weight:700; flex-shrink:0; background:#fafafa; }',
    '.cc-hl-panel-head .cc-title { flex:1; font-size:14px; color:#222; }',
    '.cc-hl-panel-head button { background:transparent; border:0; color:#666; cursor:pointer; font-size:15px; padding:2px 6px; line-height:1; }',
    '.cc-hl-panel-head button:hover { color:#000; }',
    '.cc-hl-body { padding:4px 12px 12px; overflow:auto; }',
    '.cc-hl-item { display:flex; gap:10px; padding:10px 0; cursor:pointer; border-bottom:1px dashed #eee; }',
    '.cc-hl-item:last-child { border-bottom:0; }',
    '.cc-hl-item:hover { background:#fafafa; }',
    '.cc-hl-item .cc-dot { flex:0 0 26px; width:26px; height:26px; border-radius:50%; color:#fff; font:bold 12px/26px -apple-system,system-ui,sans-serif; text-align:center; }',
    '.cc-hl-item .cc-text { flex:1; min-width:0; }',
    '.cc-hl-item .cc-hh { font-weight:600; font-size:13px; color:#222; }',
    '.cc-hl-item .cc-dd { font-size:12px; color:#555; margin-top:4px; line-height:1.5; white-space:pre-wrap; word-break:break-word; }'
  ].join('\n');
  document.head.appendChild(style);

  const panel = document.createElement('div');
  panel.id = 'cc-hl-panel';
  panel.className = 'cc-hl-panel';
  panel.innerHTML = '<div class="cc-hl-panel-head">' +
    '<span class="cc-title"></span>' +
    '<button data-fold title="접기/펴기">▾</button>' +
    '<button data-close title="닫기">×</button>' +
    '</div>' +
    '<div class="cc-hl-body"></div>';
  panel.querySelector('.cc-title').textContent = TITLE || '가이드';
  document.body.appendChild(panel);
  const body = panel.querySelector('.cc-hl-body');

  const foldBtn = panel.querySelector('[data-fold]');
  foldBtn.addEventListener('click', () => {
    const col = panel.classList.toggle('collapsed');
    foldBtn.textContent = col ? '▸' : '▾';
  });

  const pairs = [];
  SPECS.forEach((spec, i) => {
    const el = document.querySelector('[data-cc-step="' + (i + 1) + '"]');
    if (!el) return;
    const color = colorFor(i);
    const label = labelFor(i);
    el.style.outline = '3px solid ' + color;
    el.style.outlineOffset = '2px';
    el.setAttribute('data-cc-hl', '1');

    const badge = document.createElement('div');
    badge.className = 'cc-hl-badge';
    badge.style.background = color;
    badge.textContent = label;
    document.body.appendChild(badge);

    const item = document.createElement('div');
    item.className = 'cc-hl-item';
    const desc = spec.desc ? String(spec.desc).replace(/\\n/g, '\n') : '';
    item.innerHTML = '<div class="cc-dot"></div><div class="cc-text"><div class="cc-hh"></div>' + (desc ? '<div class="cc-dd"></div>' : '') + '</div>';
    const dot = item.querySelector('.cc-dot');
    dot.style.background = color;
    dot.textContent = label;
    item.querySelector('.cc-hh').textContent = spec.heading || '';
    if (desc) item.querySelector('.cc-dd').textContent = desc;
    item.addEventListener('click', () => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const orig = el.style.boxShadow;
      let c = 0;
      const iv = setInterval(() => {
        el.style.boxShadow = c % 2 === 0 ? ('0 0 28px 8px ' + color) : orig;
        c++;
        if (c > 5) { clearInterval(iv); el.style.boxShadow = orig; }
      }, 150);
    });
    body.appendChild(item);

    pairs.push({ el, badge, color });
  });

  const update = () => {
    pairs.forEach(({ el, badge }) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) { badge.style.display = 'none'; return; }
      badge.style.display = '';
      badge.style.top = Math.max(2, r.top - 14) + 'px';
      badge.style.left = Math.max(2, r.left - 14) + 'px';
    });
  };
  let raf = null;
  const schedule = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = null; update(); });
  };
  update();
  window.addEventListener('scroll', schedule, true);
  window.addEventListener('resize', schedule);
  const mo = new MutationObserver(schedule);
  mo.observe(document.body, { subtree: true, attributes: true, childList: true });

  const cleanup = () => {
    window.removeEventListener('scroll', schedule, true);
    window.removeEventListener('resize', schedule);
    mo.disconnect();
    pairs.forEach(({ el, badge }) => {
      el.style.outline = '';
      el.style.outlineOffset = '';
      el.style.boxShadow = '';
      el.removeAttribute('data-cc-hl');
      el.removeAttribute('data-cc-step');
      badge.remove();
    });
    panel.remove();
    const s = document.getElementById('cc-hl-style'); if (s) s.remove();
    window.__ccHl = undefined;
  };
  panel.querySelector('[data-close]').addEventListener('click', cleanup);
  window.__ccHl = { cleanup, update };

  if (pairs.length > 0) pairs[0].el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
