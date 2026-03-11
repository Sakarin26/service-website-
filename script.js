/* script.js — einzelne, robuste Version (Theme, Panels, Preise, Demo-Toast, Meme-Generator, mobile-ready) */
document.addEventListener('DOMContentLoaded', function () {
  /* -----------------------
     THEME (dark / light)
  ------------------------*/
  const themeBtn = document.getElementById('themeToggle');
  const root = document.documentElement;
  function applyStoredTheme() {
    const stored = localStorage.getItem('demo_theme');
    if (stored === 'light') {
      root.classList.add('light'); root.classList.remove('dark');
      if (themeBtn) themeBtn.textContent = 'Light';
    } else {
      root.classList.remove('light'); root.classList.add('dark');
      if (themeBtn) themeBtn.textContent = 'Dark';
    }
  }
  applyStoredTheme();
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isLight = root.classList.toggle('light');
      root.classList.toggle('dark', !isLight);
      localStorage.setItem('demo_theme', isLight ? 'light' : 'dark');
      themeBtn.textContent = isLight ? 'Light' : 'Dark';
    });
  }

  /* -----------------------
     PANELS: view-plans toggle
  ------------------------*/
  const viewButtons = Array.from(document.querySelectorAll('.view-plans'));
  viewButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      const svc = btn.getAttribute('data-svc');
      const panel = document.getElementById('plans-' + svc);
      if (!panel) return;
      const isHidden = panel.getAttribute('aria-hidden') === 'true';
      panel.setAttribute('aria-hidden', isHidden ? 'false' : 'true');
      btn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
      if (isHidden) panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    // keyboard accessibility
    btn.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); btn.click(); }
    });
  });

  /* -----------------------
     PRICE CALC for services
  ------------------------*/
  const multiplierMap = { now: 1.40, soon: 1.10, week: 1.00, month: 0.80 };
  function updatePricesForService(serviceId) {
    const panel = document.getElementById('plans-' + serviceId);
    if (!panel) return;
    const name = 'time-' + serviceId; // e.g. time-svc-1
    const selectedRadio = document.querySelector(`input[name="${name}"]:checked`);
    const value = selectedRadio ? selectedRadio.value : 'week';
    const multiplier = multiplierMap[value] || 1.0;
    panel.querySelectorAll('.plan-card').forEach(pc => {
      const base = parseFloat(pc.querySelector('.price')?.getAttribute('data-price-base') || '0');
      const newPrice = Math.round(base * multiplier);
      const priceValue = pc.querySelector('.price .price-value');
      if (priceValue) priceValue.textContent = `${newPrice} €`;
      else {
        const priceEl = pc.querySelector('.price');
        if (priceEl) priceEl.textContent = `Preis: ${newPrice} €`;
      }
    });
  }
  Array.from(document.querySelectorAll('.service-card')).forEach(sc => {
    const svcId = sc.getAttribute('data-service-id');
    // radios named like time-svc-1 etc.
    const radios = sc.querySelectorAll(`input[name="time-${svcId}"]`);
    radios.forEach(r => r.addEventListener('change', () => updatePricesForService(svcId)));
    updatePricesForService(svcId);
  });

  /* -----------------------
     DEMO SELECT toast
  ------------------------*/
  function showToast(text) {
    let container = document.getElementById('demo-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'demo-toast-container';
      Object.assign(container.style, { position: 'fixed', right: '20px', bottom: '20px', zIndex: '9999' });
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.textContent = text;
    Object.assign(toast.style, {
      background: 'linear-gradient(90deg, rgba(111,66,193,0.95), rgba(124,92,255,0.85))',
      color: '#fff', padding: '12px 16px', borderRadius: '10px',
      boxShadow: '0 8px 30px rgba(11,6,40,0.6)', marginTop: '10px', fontWeight: '800',
      opacity: '0', transform: 'translateY(8px)', transition: 'all .28s ease'
    });
    container.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'translateY(0)'; });
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(8px)'; setTimeout(() => toast.remove(), 320); }, 3000);
  }
  document.querySelectorAll('.demo-select').forEach(btn => {
    btn.addEventListener('click', function () {
      const card = btn.closest('.service-card');
      const svcId = card ? card.getAttribute('data-service-id') : 'unknown';
      const plan = btn.getAttribute('data-plan') || 'basic';
      const sel = document.querySelector(`input[name="time-${svcId}"]:checked`);
      const timeVal = sel ? sel.value : 'week';
      const planCard = btn.closest('.plan-card');
      const priceText = planCard ? (planCard.querySelector('.price .price-value')?.textContent || planCard.querySelector('.price')?.textContent || '') : '';
      showToast(`(Demo) ${svcId} · ${plan} · ${timeVal} · ${priceText}`);
    });
  });

  /* -----------------------
     Robust Meme Generator (mobile + desktop)
     - single handler
     - pointer/touch/click safe
  ------------------------*/
  const MEMES = [
    { title: '67 — Die Glückszahl', body: 'Ein sehr zufälliges Meme: 67 🎉\nImmer ein Grund zu lächeln.' , sticker: '🔢' },
    { title: 'Skibidi', body: 'Skibidi-Vibes! Tanz in Gedanken 😄', sticker: '🕺' },
    { title: 'Dancing Cat', body: 'Die tanzende Katze sagt Hallo! 🐱💃', sticker: '🐱' },
    { title: 'Surprised', body: 'Wenn du gerade eine unerwartete Idee hattest… 😯', sticker: '😯' },
    { title: 'Boop', body: 'Boop the snoot — niedlich und harmlos. 🫧', sticker: '🫧' },
    { title: 'Banana', body: 'Bananen sind glücklich. 🍌', sticker: '🍌' },
    { title: 'Tiny Dog', body: 'Kleiner Hund, große Persönlichkeit. 🐶', sticker: '🐶' },
    { title: 'Noice', body: 'Wenn alles stimmt — Noice. 👍', sticker: '👌' },
    { title: 'Hello', body: 'Hallo! Freundliches Demo-Meme. 😊', sticker: '👋' },
    { title: 'Friendly Bot', body: 'Ich bin ein netter Bot. Beep boop 🤖', sticker: '🤖' }
  ];

  const btn = document.getElementById('meme-gen-btn');
  const input = document.getElementById('meme-number');
  const egg = document.getElementById('meme-egg');
  const eggArea = document.getElementById('egg-area');
  const result = document.getElementById('meme-result');

  // sanity check
  if (!btn || !input || !egg || !eggArea || !result) {
    // do not crash the app if generator not present
    console.warn('MemeGenerator: Elemente fehlen', { btn: !!btn, input: !!input, egg: !!egg, eggArea: !!eggArea, result: !!result });
  } else {
    // debounce to prevent double triggers
    let lastTrigger = 0;
    const GAP = 700;

    function canTrigger() {
      const now = Date.now();
      if (now - lastTrigger < GAP) return false;
      lastTrigger = now;
      return true;
    }

    function createFragments(cx, cy, count = 12) {
      const rect = eggArea.getBoundingClientRect();
      const created = [];
      for (let i = 0; i < count; i++) {
        const f = document.createElement('div');
        f.className = 'fragment';
        const ang = Math.random() * Math.PI * 2;
        const dist = 40 + Math.random() * 80;
        const tx = Math.round(Math.cos(ang) * dist) + 'px';
        const ty = Math.round(Math.sin(ang) * dist) + 'px';
        const rot = (Math.random() * 360).toFixed(0) + 'deg';
        f.style.setProperty('--tx', tx);
        f.style.setProperty('--ty', ty);
        f.style.setProperty('--rot', rot);
        const x = cx - rect.left - 8;
        const y = cy - rect.top - 8;
        f.style.left = x + 'px';
        f.style.top = y + 'px';
        eggArea.appendChild(f);
        created.push(f);
      }
      setTimeout(() => created.forEach(x => x.remove()), 1400);
    }

    function showMeme(obj) {
      result.innerHTML = '';
      const card = document.createElement('div');
      card.className = 'meme-card';
      const title = document.createElement('div');
      title.className = 'meme-title';
      title.textContent = (obj.sticker ? obj.sticker + ' ' : '') + obj.title;
      const body = document.createElement('div');
      body.className = 'meme-body';
      body.textContent = obj.body;
      card.appendChild(title);
      card.appendChild(body);
      result.appendChild(card);
    }

    function doGenerate(ev) {
      if (!canTrigger()) return;
      if (ev && ev.type === 'touchstart') ev.preventDefault();

      btn.disabled = true;
      btn.classList.add('pressed');

      let num = parseInt(input.value, 10);
      if (Number.isNaN(num)) num = Math.floor(Math.random() * 101);

      egg.classList.remove('exploded');
      void egg.offsetWidth;
      egg.classList.add('bounce');

      setTimeout(() => {
        const r = egg.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;

        createFragments(cx, cy, 14);
        egg.classList.add('exploded');

        const idx = Math.abs(num) % MEMES.length;
        const chosen = MEMES[idx];

        setTimeout(() => {
          showMeme(chosen);
          btn.disabled = false;
          btn.classList.remove('pressed');
        }, 420);

        setTimeout(() => egg.classList.remove('bounce'), 900);
      }, 560);
    }

    // Use PointerEvent when available (unifies touch/mouse/stylus)
    if (window.PointerEvent) {
      btn.addEventListener('pointerdown', function (e) { doGenerate(e); }, { passive: false });
    } else {
      btn.addEventListener('touchstart', function (e) { doGenerate(e); }, { passive: false });
      btn.addEventListener('click', function (e) { doGenerate(e); }, { passive: true });
    }
    // extra click fallback (safe because of debounce)
    btn.addEventListener('click', function (e) { doGenerate(e); }, { passive: true });

    // Enter in input triggers generate
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') { ev.preventDefault(); doGenerate(ev); }
    });
  }

  /* end DOMContentLoaded */
});
