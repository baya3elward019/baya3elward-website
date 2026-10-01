/* ==========================================================================
   Site behaviour. Loaded once; per-page setup runs on every `astro:page-load`
   (Astro's client router swaps pages without a full reload).
   ========================================================================== */

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

/** Things to tear down before the next page swap. */
let cleanups: Array<() => void> = [];
const onCleanup = (fn: () => void) => cleanups.push(fn);

/* --------------------------------------------------------------------------
   Toast
   -------------------------------------------------------------------------- */
let toastTimer: number | undefined;
function toast(msg: string) {
  const el = $('.toast');
  if (!el) return;
  $('.toast-msg', el)!.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove('show'), 2200);
}

/* --------------------------------------------------------------------------
   Theme toggle — circular reveal from the button when supported
   -------------------------------------------------------------------------- */
function setTheme(next: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', next);
  try {
    localStorage.setItem('theme', next);
  } catch {}
  $('meta[name="theme-color"]')?.setAttribute('content', next === 'light' ? '#eef3fb' : '#04070f');
  window.dispatchEvent(new CustomEvent('themechange'));
}

function toggleTheme(btn: HTMLElement) {
  const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
  if (!doc.startViewTransition || reduceMotion()) return setTheme(next);

  const r = btn.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  document.documentElement.classList.add('theme-vt');
  const vt = doc.startViewTransition(() => setTheme(next));
  vt.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)', pseudoElement: '::view-transition-new(root)' },
      );
    })
    .catch(() => {});
  (vt as any).finished?.finally(() => document.documentElement.classList.remove('theme-vt'));
}

/* --------------------------------------------------------------------------
   Global delegated listeners (bound once)
   -------------------------------------------------------------------------- */
document.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;

  const themeBtn = t.closest<HTMLElement>('[data-theme-toggle]');
  if (themeBtn) return toggleTheme(themeBtn);

  const menuBtn = t.closest('[data-menu-toggle]');
  if (menuBtn) {
    const nav = $('[data-nav]')!;
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    return;
  }
  if (t.closest('.nav-links a')) closeMenu();

  const copyBtn = t.closest<HTMLElement>('[data-copy]');
  if (copyBtn) {
    navigator.clipboard?.writeText(copyBtn.dataset.copy!).then(
      () => toast(copyBtn.dataset.copyMsg ?? 'Copied to clipboard'),
      () => toast('Copy failed — select the text manually'),
    );
    return;
  }

  const lbTrigger = t.closest<HTMLElement>('[data-lb-open]');
  if (lbTrigger) {
    e.preventDefault();
    return openLightbox(lbTrigger);
  }
  const proseImg = t.closest<HTMLImageElement>('.prose img');
  if (proseImg && !proseImg.closest('a')) return openLightbox(proseImg);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
  if (e.key === '/' && !(e.target as HTMLElement).matches('input, textarea, select')) {
    const s = $<HTMLInputElement>('[data-filter-search]');
    if (s) {
      e.preventDefault();
      s.focus();
    }
  }
});

// cursor spotlight on glass cards
document.addEventListener(
  'pointermove',
  (e) => {
    const card = (e.target as HTMLElement).closest?.<HTMLElement>('.spot');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  },
  { passive: true },
);

function closeMenu() {
  const nav = $('[data-nav]');
  if (!nav?.classList.contains('is-open')) return;
  nav.classList.remove('is-open');
  const btn = $('[data-menu-toggle]');
  btn?.setAttribute('aria-expanded', 'false');
  btn?.setAttribute('aria-label', 'Open menu');
}

/* --------------------------------------------------------------------------
   Nav: scrolled state + reading progress
   -------------------------------------------------------------------------- */
function initNav() {
  const nav = $('[data-nav]');
  const bar = $('[data-progress]');
  if (!nav) return;
  let ticking = false;
  const update = () => {
    ticking = false;
    nav.classList.toggle('is-scrolled', scrollY > 12);
    const max = document.documentElement.scrollHeight - innerHeight;
    bar?.style.setProperty('--p', String(max > 0 ? Math.min(1, scrollY / max) : 0));
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  update();
  addEventListener('scroll', onScroll, { passive: true });
  onCleanup(() => removeEventListener('scroll', onScroll));
}

/* --------------------------------------------------------------------------
   Text effects
   -------------------------------------------------------------------------- */
const GLYPHS = '!<>-_\\/[]{}=+*^?#01ABCDEF$%&';

function scramble(el: HTMLElement, duration = 1000): Promise<void> {
  const text = el.dataset.text ?? el.textContent ?? '';
  el.dataset.text = text;
  if (reduceMotion() || !text.trim()) return Promise.resolve();

  el.setAttribute('aria-label', text);
  el.setAttribute('data-scrambling', '');
  const chars = [...text];
  const reveal = chars.map((c) => (c === ' ' ? 0 : Math.random() * duration * 0.75 + duration * 0.15));
  const start = performance.now();

  return new Promise((resolve) => {
    const frame = (now: number) => {
      if (!el.isConnected) return resolve();
      const t = now - start;
      let html = '';
      let done = true;
      chars.forEach((c, i) => {
        if (t >= reveal[i]) html += escapeHtml(c);
        else {
          done = false;
          html += `<span class="glyph">${escapeHtml(GLYPHS[(Math.random() * GLYPHS.length) | 0])}</span>`;
        }
      });
      el.innerHTML = html;
      if (!done) requestAnimationFrame(frame);
      else {
        el.textContent = text;
        el.removeAttribute('data-scrambling');
        el.removeAttribute('aria-label');
        resolve();
      }
    };
    requestAnimationFrame(frame);
  });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

function typeLoop(el: HTMLElement) {
  let words: string[] = [];
  try {
    words = JSON.parse(el.dataset.words || '[]').filter(Boolean);
  } catch {}
  if (words.length < 2 || reduceMotion()) return;
  let w = 0;
  let i = words[0].length;
  let deleting = true;
  let timer = 0;
  const tick = () => {
    if (!el.isConnected) return;
    const word = words[w];
    if (deleting) {
      i--;
      el.textContent = word.slice(0, i);
      if (i <= 0) {
        deleting = false;
        w = (w + 1) % words.length;
      }
      timer = window.setTimeout(tick, 32);
    } else {
      const next = words[w];
      i++;
      el.textContent = next.slice(0, i);
      if (i >= next.length) {
        deleting = true;
        timer = window.setTimeout(tick, 2100);
      } else timer = window.setTimeout(tick, 55 + Math.random() * 60);
    }
  };
  timer = window.setTimeout(tick, 2400);
  onCleanup(() => clearTimeout(timer));
}

function countUp(el: HTMLElement) {
  const target = Number(el.dataset.count) || 0;
  if (reduceMotion() || target === 0) return;
  const start = performance.now();
  const dur = 1100;
  const step = (now: number) => {
    const p = Math.min(1, (now - start) / dur);
    el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
    if (p < 1 && el.isConnected) requestAnimationFrame(step);
  };
  el.textContent = '0';
  requestAnimationFrame(step);
}

/* --------------------------------------------------------------------------
   Boot screen (first visit per browser session)
   -------------------------------------------------------------------------- */
function runBoot(): Promise<void> {
  const root = document.documentElement;
  const boot = $('[data-boot]');
  if (!root.classList.contains('booting') || !boot) return Promise.resolve();

  const log = $('[data-boot-log]', boot)!;
  const bar = $('[data-boot-bar]', boot)!;
  const nameEl = $('[data-boot-name]', boot)!;
  let lines: string[] = [];
  try {
    lines = JSON.parse(boot.dataset.lines || '[]');
  } catch {}

  let skipped = false;
  let finish!: () => void;
  const done = new Promise<void>((r) => (finish = r));

  const end = () => {
    if (boot.classList.contains('is-leaving')) return;
    try {
      sessionStorage.setItem('booted', '1');
    } catch {}
    boot.classList.add('is-leaving');
    root.classList.remove('booting');
    removeEventListener('keydown', skip);
    boot.removeEventListener('click', skip);
    setTimeout(() => boot.classList.remove('is-leaving'), 750);
    finish();
  };
  const skip = () => {
    skipped = true;
    end();
  };
  addEventListener('keydown', skip);
  boot.addEventListener('click', skip);

  (async () => {
    for (let n = 0; n < lines.length && !skipped; n++) {
      const line = lines[n];
      const span = document.createElement('span');
      span.innerHTML = escapeHtml(line)
        .replace(/^\[ ok \]/, '<span class="ok">[ ok ]</span>')
        .replace(/^access granted$/, '<span class="grant">access granted</span>');
      log.appendChild(span);
      log.appendChild(document.createTextNode('\n'));
      bar.style.width = `${((n + 1) / lines.length) * 85}%`;
      await wait(170 + Math.random() * 120);
    }
    if (skipped) return;
    nameEl.classList.add('show');
    bar.style.width = '100%';
    await scramble(nameEl, 700);
    await wait(380);
    end();
  })();

  return done;
}
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* --------------------------------------------------------------------------
   Hero
   -------------------------------------------------------------------------- */
function startHero() {
  const hero = $('.hero');
  if (!hero) return;
  hero.classList.add('is-live');
  const name = $('[data-scramble]', hero);
  if (name) setTimeout(() => scramble(name, 1100), 120);
  const typing = $('[data-typing]', hero);
  if (typing) typeLoop(typing);
  $$('[data-count]', hero).forEach((el) => setTimeout(() => countUp(el), 500));

  // avatar parallax
  const rig = $('[data-parallax]', hero);
  if (rig && finePointer() && !reduceMotion()) {
    const move = (e: PointerEvent) => {
      const x = e.clientX / innerWidth - 0.5;
      const y = e.clientY / innerHeight - 0.5;
      rig.style.transform = `translate3d(${x * -18}px, ${y * -18}px, 0) rotateX(${y * 8}deg) rotateY(${x * -8}deg)`;
    };
    addEventListener('pointermove', move, { passive: true });
    onCleanup(() => removeEventListener('pointermove', move));
  }
}

/* --------------------------------------------------------------------------
   Scroll reveal
   -------------------------------------------------------------------------- */
function initReveal() {
  const els = $$('[data-reveal]');
  if (!els.length) return;
  if (!('IntersectionObserver' in window) || reduceMotion()) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  els.forEach((el) => io.observe(el));
  onCleanup(() => io.disconnect());
}

/* --------------------------------------------------------------------------
   3D tilt on project cards
   -------------------------------------------------------------------------- */
function initTilt() {
  if (!finePointer() || reduceMotion()) return;
  $$('[data-tilt]').forEach((card) => {
    const move = (e: PointerEvent) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${y * -5}deg) rotateY(${x * 6}deg) translateY(-4px)`;
    };
    const leave = () => (card.style.transform = '');
    card.addEventListener('pointermove', move);
    card.addEventListener('pointerleave', leave);
  });
}

/* --------------------------------------------------------------------------
   Lightbox
   -------------------------------------------------------------------------- */
let lbItems: { src: string; caption: string }[] = [];
let lbIndex = 0;

function openLightbox(trigger: HTMLElement) {
  const dlg = $<HTMLDialogElement>('[data-lightbox]');
  if (!dlg) return;
  if (trigger instanceof HTMLImageElement) {
    const imgs = $$<HTMLImageElement>('.prose img').filter((i) => !i.closest('a'));
    lbItems = imgs.map((i) => ({ src: i.currentSrc || i.src, caption: i.alt || '' }));
    lbIndex = imgs.indexOf(trigger);
  } else {
    const group = trigger.dataset.lbGroup;
    const all = group ? $$(`[data-lb-open][data-lb-group="${group}"]`) : [trigger];
    lbItems = all.map((t) => ({ src: t.dataset.src!, caption: t.dataset.caption ?? '' }));
    lbIndex = Math.max(0, all.indexOf(trigger));
  }
  showLb();
  if (!dlg.open) dlg.showModal();
}

function showLb() {
  const dlg = $('[data-lightbox]')!;
  const item = lbItems[lbIndex];
  const img = $<HTMLImageElement>('[data-lb-img]', dlg)!;
  img.src = item.src;
  img.alt = item.caption;
  $('[data-lb-caption]', dlg)!.textContent = item.caption + (lbItems.length > 1 ? `  (${lbIndex + 1}/${lbItems.length})` : '');
  const multi = lbItems.length > 1;
  $('[data-lb-prev]', dlg)!.hidden = !multi;
  $('[data-lb-next]', dlg)!.hidden = !multi;
}

function stepLb(d: number) {
  if (lbItems.length < 2) return;
  lbIndex = (lbIndex + d + lbItems.length) % lbItems.length;
  showLb();
}

function initLightbox() {
  const dlg = $<HTMLDialogElement>('[data-lightbox]');
  if (!dlg || dlg.dataset.ready) return;
  dlg.dataset.ready = '1';
  dlg.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('[data-lb-close]') || t === dlg || t.classList.contains('lb-frame')) dlg.close();
    else if (t.closest('[data-lb-prev]')) stepLb(-1);
    else if (t.closest('[data-lb-next]')) stepLb(1);
  });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') stepLb(-1);
    if (e.key === 'ArrowRight') stepLb(1);
  });
  let sx = 0;
  dlg.addEventListener('pointerdown', (e) => (sx = e.clientX), { passive: true });
  dlg.addEventListener('pointerup', (e) => {
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 50) stepLb(dx < 0 ? 1 : -1);
  });
}

/* --------------------------------------------------------------------------
   Code blocks → terminal windows with copy button
   -------------------------------------------------------------------------- */
const SHELL = ['bash', 'sh', 'shell', 'zsh', 'console', 'powershell', 'ps1', 'cmd', 'shellsession'];

function initCode() {
  $$<HTMLPreElement>('.prose pre').forEach((pre) => {
    if (pre.parentElement?.classList.contains('codewin')) return;
    const lang = (pre.dataset.language || 'text').toLowerCase();
    const isShell = SHELL.includes(lang);
    const win = document.createElement('div');
    win.className = `codewin${isShell ? ' is-shell' : ''}`;
    win.innerHTML = `
      <div class="term-bar">
        <span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="term-title">${isShell ? 'terminal' : escapeHtml(lang === 'plaintext' ? 'text' : lang)}</span>
        <button class="code-copy" type="button" aria-label="Copy code">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/></svg>
          <span>copy</span>
        </button>
      </div>`;
    pre.replaceWith(win);
    win.appendChild(pre);
    const btn = $<HTMLButtonElement>('.code-copy', win)!;
    btn.addEventListener('click', () => {
      navigator.clipboard?.writeText(pre.innerText.replace(/\n$/, '')).then(() => {
        btn.classList.add('is-done');
        $('span', btn)!.textContent = 'copied';
        setTimeout(() => {
          btn.classList.remove('is-done');
          $('span', btn)!.textContent = 'copy';
        }, 1600);
      });
    });
  });
}

/* --------------------------------------------------------------------------
   Table of contents highlight
   -------------------------------------------------------------------------- */
function initToc() {
  const links = $$<HTMLAnchorElement>('[data-toc-link]');
  if (!links.length) return;
  const map = new Map(links.map((a) => [a.dataset.tocLink!, a]));
  const heads = [...map.keys()].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          links.forEach((l) => l.classList.remove('is-active'));
          map.get(en.target.id)?.classList.add('is-active');
        }
      });
    },
    { rootMargin: '-15% 0px -70% 0px' },
  );
  heads.forEach((h) => io.observe(h));
  onCleanup(() => io.disconnect());
}

/* --------------------------------------------------------------------------
   Search / filter / sort on list pages
   -------------------------------------------------------------------------- */
function initFilters() {
  const box = $('[data-filters]');
  const list = $('[data-filter-list]');
  if (!list) return;
  const items = $$('[data-filter-item]', list);
  const empty = $('[data-filter-empty]');
  const search = box ? $<HTMLInputElement>('[data-filter-search]', box) : null;
  const sort = box ? $<HTMLSelectElement>('[data-filter-sort]', box) : null;
  const count = box ? $('[data-filter-count]', box) : null;
  const catBtns = box ? $$<HTMLButtonElement>('[data-filter-cat]', box) : [];
  const tagBtns = box ? $$<HTMLButtonElement>('[data-filter-tag]', box) : [];

  let q = '';
  let cat = '';
  const tags = new Set<string>();

  const apply = () => {
    let shown = 0;
    items.forEach((it) => {
      const okQ = !q || (it.dataset.search ?? '').includes(q);
      const okC = !cat || it.dataset.category === cat;
      const itTags = (it.dataset.tags ?? '').split('|');
      const okT = !tags.size || [...tags].some((t) => itTags.includes(t));
      const ok = okQ && okC && okT;
      it.classList.toggle('is-hidden', !ok);
      if (ok) {
        shown++;
        it.classList.add('is-in');
      }
    });
    if (empty) empty.hidden = shown > 0;
    if (count) count.textContent = q || cat || tags.size ? `${shown} of ${items.length} shown` : `${items.length} total`;
  };

  search?.addEventListener('input', () => {
    q = search.value.trim().toLowerCase();
    apply();
  });
  sort?.addEventListener('change', () => {
    const dir = sort.value === 'old' ? 1 : -1;
    items
      .sort((a, b) => dir * (Number(a.dataset.date) - Number(b.dataset.date)))
      .forEach((it) => list.appendChild(it));
  });
  catBtns.forEach((b) =>
    b.addEventListener('click', () => {
      cat = b.dataset.filterCat ?? '';
      catBtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      apply();
    }),
  );
  tagBtns.forEach((b) =>
    b.addEventListener('click', () => {
      const t = b.dataset.filterTag!;
      tags.has(t) ? tags.delete(t) : tags.add(t);
      b.setAttribute('aria-pressed', String(tags.has(t)));
      apply();
    }),
  );
  apply();
}

/* --------------------------------------------------------------------------
   Page-level scramble for titles (write-up / project headings, 404)
   -------------------------------------------------------------------------- */
function initTitleScramble() {
  $$('main [data-scramble]')
    .filter((el) => !el.closest('.hero'))
    .forEach((el) => scramble(el, 800));
}

/* --------------------------------------------------------------------------
   Animated network background (persists across page swaps)
   -------------------------------------------------------------------------- */
function initNetwork() {
  const canvas = $<HTMLCanvasElement>('#net-bg');
  if (!canvas || canvas.dataset.ready) return;
  canvas.dataset.ready = '1';
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  type Node = { x: number; y: number; vx: number; vy: number; r: number };
  type Packet = { a: Node; b: Node; t: number; v: number };
  let W = 0,
    H = 0,
    DPR = 1;
  let nodes: Node[] = [];
  let packets: Packet[] = [];
  let c1 = [62, 224, 255];
  let c2 = [139, 108, 255];
  const mouse = { x: -9999, y: -9999 };
  const LINK = 150;

  const toRgb = (css: string) => {
    ctx.fillStyle = '#000';
    ctx.fillStyle = css.trim();
    const v = ctx.fillStyle as string;
    if (v.startsWith('#')) return [1, 3, 5].map((i) => parseInt(v.slice(i, i + 2), 16));
    const m = v.match(/[\d.]+/g);
    return m ? m.slice(0, 3).map(Number) : [62, 224, 255];
  };
  const readColors = () => {
    const cs = getComputedStyle(document.documentElement);
    c1 = toRgb(cs.getPropertyValue('--accent'));
    c2 = toRgb(cs.getPropertyValue('--accent-2'));
  };

  const resize = () => {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth;
    H = innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const target = Math.max(26, Math.min(95, Math.round((W * H) / 15000)));
    while (nodes.length < target)
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.4 + 0.8,
      });
    nodes.length = target;
    packets = packets.filter((p) => nodes.includes(p.a) && nodes.includes(p.b));
  };

  const rgba = (c: number[], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  const draw = (animate: boolean) => {
    ctx.clearRect(0, 0, W, H);
    // move
    if (animate)
      for (const n of nodes) {
        const dx = n.x - mouse.x;
        const dy = n.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 140 * 140 && d2 > 1) {
          const f = (1 - Math.sqrt(d2) / 140) * 0.06;
          n.vx += (dx / Math.sqrt(d2)) * f;
          n.vy += (dy / Math.sqrt(d2)) * f;
        }
        n.vx *= 0.985;
        n.vy *= 0.985;
        const sp = Math.hypot(n.vx, n.vy);
        if (sp < 0.12) {
          n.vx += (Math.random() - 0.5) * 0.04;
          n.vy += (Math.random() - 0.5) * 0.04;
        }
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = W + 20;
        if (n.x > W + 20) n.x = -20;
        if (n.y < -20) n.y = H + 20;
        if (n.y > H + 20) n.y = -20;
      }

    // links
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < LINK * LINK) {
          const alpha = (1 - Math.sqrt(d2) / LINK) * 0.22;
          ctx.strokeStyle = rgba(c1, alpha);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          if (animate && packets.length < 16 && Math.random() < 0.0009) packets.push({ a, b, t: 0, v: 0.008 + Math.random() * 0.012 });
        }
      }
      // cursor links
      const mx = a.x - mouse.x;
      const my = a.y - mouse.y;
      const md = Math.hypot(mx, my);
      if (md < 190) {
        ctx.strokeStyle = rgba(c2, (1 - md / 190) * 0.5);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }

    // nodes
    for (const n of nodes) {
      ctx.fillStyle = rgba(c1, 0.7);
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // packets
    packets = packets.filter((p) => {
      p.t += p.v;
      if (p.t >= 1) return false;
      const x = p.a.x + (p.b.x - p.a.x) * p.t;
      const y = p.a.y + (p.b.y - p.a.y) * p.t;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 7);
      g.addColorStop(0, rgba(c1, 0.95));
      g.addColorStop(1, rgba(c1, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();
      return true;
    });
  };

  let raf = 0;
  let running = false;
  const loop = () => {
    draw(true);
    raf = requestAnimationFrame(loop);
  };
  const start = () => {
    if (running || reduceMotion()) return;
    running = true;
    raf = requestAnimationFrame(loop);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  readColors();
  resize();
  if (reduceMotion()) draw(false);
  else start();

  let rt = 0;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = window.setTimeout(() => {
      resize();
      if (!running) draw(false);
    }, 150);
  });
  addEventListener('themechange', () => {
    readColors();
    if (!running) draw(false);
  });
  addEventListener(
    'pointermove',
    (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    },
    { passive: true },
  );
  document.addEventListener('pointerleave', () => {
    mouse.x = mouse.y = -9999;
  });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
}

/* --------------------------------------------------------------------------
   Lifecycle
   -------------------------------------------------------------------------- */
let firstLoad = true;

document.addEventListener('astro:page-load', async () => {
  initNetwork();
  initLightbox();
  initNav();
  initReveal();
  initTilt();
  initCode();
  initToc();
  initFilters();
  initTitleScramble();

  if (firstLoad) {
    firstLoad = false;
    await runBoot();
  }
  startHero();
});

document.addEventListener('astro:before-swap', () => {
  closeMenu();
  cleanups.forEach((fn) => fn());
  cleanups = [];
  const dlg = $<HTMLDialogElement>('[data-lightbox]');
  if (dlg?.open) dlg.close();
});
