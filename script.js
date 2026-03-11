/* script.js — Interaktivität für index.html (Theme, Panels, dynamische Demo-Preise) */

document.addEventListener('DOMContentLoaded', function () {

  /* --------------------------
     THEME (dark / light) handling
     stored in localStorage 'demo_theme' as 'dark' or 'light'
     default: dark purple
     -------------------------- */
  const themeBtn = document.getElementById('themeToggle');
  const root = document.documentElement;

  function applyStoredTheme() {
    const stored = localStorage.getItem('demo_theme');
    if (stored === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
      if (themeBtn) themeBtn.textContent = 'Light';
    } else {
      // default dark
      root.classList.remove('light');
      root.classList.add('dark');
      if (themeBtn) themeBtn.textContent = 'Dark';
    }
  }
  applyStoredTheme();

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      const isLight = root.classList.toggle('light');
      root.classList.toggle('dark', !isLight);
      localStorage.setItem('demo_theme', isLight ? 'light' : 'dark');
      themeBtn.textContent = isLight ? 'Light' : 'Dark';
    });
  }

  /* --------------------------
     Show / hide plans panels
     Buttons: .view-plans (data-svc => id suffix)
     Panels: #plans-svc-1, #plans-svc-2, aria-expanded toggle
     -------------------------- */
  const viewButtons = Array.from(document.querySelectorAll('.view-plans'));
  viewButtons.forEach(btn => {
    btn.addEventListener('click', function (ev) {
      const svc = btn.getAttribute('data-svc'); // e.g. "svc-1"
      const panel = document.getElementById('plans-' + svc);
      if (!panel) return;
      const isHidden = panel.getAttribute('aria-hidden') === 'true';
      panel.setAttribute('aria-hidden', isHidden ? 'false' : 'true');
      btn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
      // smooth scroll to panel when opening
      if (isHidden) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  /* --------------------------
     Price calculation per service
     Each plan-card has data-price-base attribute
     Radios per service: name like "time-svc-1" or "time-svc-2"
     Multiplier mapping (best effort):
       - now  => 1.40  (höchster Preis)
       - soon => 1.10  (bisschen günstiger)
       - week => 1.00  (Basis)
       - month=> 0.80  (günstig)
     If an unknown value appears, fallback multiplier = 1.0
     -------------------------- */
  const multiplierMap = {
    now: 1.40,
    soon: 1.10,
    week: 1.00,
    month: 0.80
  };

  function updatePricesForService(serviceId) {
    // find panel for this service
    const panel = document.getElementById('plans-' + serviceId);
    if (!panel) return;
    // determine selected radio for this service
    const radios = document.querySelectorAll(`input[name="time-${serviceId}"], input[name="time-${serviceId}"], input[name="time-${serviceId}"]`);
    // Actually in your HTML radios are named "time-svc-1" etc. so build that:
    const radiosReal = document.querySelectorAll(`input[name="time-${serviceId}"], input[name="time-${serviceId}"], input[name="time-${serviceId}"]`);
    // fallback: try name with svc prefix (original HTML uses name="time-svc-1")
    const radiosFallback = document.querySelectorAll(`input[name="time-${serviceId}"], input[name="time-${serviceId}"], input[name="time-${serviceId}"]`);
    // Simpler: use the HTML pattern 'time-' + serviceId (e.g., time-svc-1)
    const name = 'time-' + serviceId;
    const selectedRadio = document.querySelector(`input[name="${name}"]:checked`);
    const value = selectedRadio ? selectedRadio.value : 'week';
    const multiplier = multiplierMap[value] || 1.0;

    // update every .plan-card inside panel
    const planCards = panel.querySelectorAll('.plan-card');
    planCards.forEach(pc => {
      const base = parseFloat(pc.querySelector('.price')?.getAttribute('data-price-base') || pc.getAttribute('data-price-base') || '0');
      const newPrice = Math.round(base * multiplier);
      // find .price-value inside .price
      const priceValue = pc.querySelector('.price .price-value');
      if (priceValue) {
        priceValue.textContent = `${newPrice} €`;
      } else {
        // fallback: update .price text content
        const priceEl = pc.querySelector('.price');
        if (priceEl) priceEl.textContent = `Preis: ${newPrice} €`;
      }
    });
  }

  // initialize price values for all services on load
  const serviceCards = Array.from(document.querySelectorAll('.service-card'));
  serviceCards.forEach(sc => {
    const svcId = sc.getAttribute('data-service-id'); // e.g. svc-1
    // attach change listeners to radios within this card
    const radios = sc.querySelectorAll('input[type="radio"][name^="time-"]');
    radios.forEach(r => {
      r.addEventListener('change', function () {
        // recompute prices for this service
        updatePricesForService(svcId);
      });
    });
    // initial update
    updatePricesForService(svcId);
  });

  /* --------------------------
     Demo select buttons (.demo-select)
     show a small temporary toast that selection recorded (demo only)
     -------------------------- */
  function showToast(text) {
    // create toast container if needed
    let container = document.getElementById('demo-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'demo-toast-container';
      container.style.position = 'fixed';
      container.style.right = '20px';
      container.style.bottom = '20px';
      container.style.zIndex = '9999';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.textContent = text;
    toast.style.background = 'linear-gradient(90deg, rgba(111,66,193,0.95), rgba(124,92,255,0.85))';
    toast.style.color = '#fff';
    toast.style.padding = '12px 16px';
    toast.style.borderRadius = '10px';
    toast.style.boxShadow = '0 8px 30px rgba(11,6,40,0.6)';
    toast.style.marginTop = '10px';
    toast.style.fontWeight = '800';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.style.transition = 'all 0.28s ease';
    container.appendChild(toast);
    // animate in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });
    // remove after 3s
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      setTimeout(() => toast.remove(), 320);
    }, 3000);
  }

  const demoSelectButtons = Array.from(document.querySelectorAll('.demo-select'));
  demoSelectButtons.forEach(btn => {
    btn.addEventListener('click', function (ev) {
      // find service ancestor
      const card = btn.closest('.service-card');
      const svcId = card ? card.getAttribute('data-service-id') : 'unknown';
      const plan = btn.getAttribute('data-plan') || 'basic';
      // determine currently selected radio value for this service
      const sel = document.querySelector(`input[name="time-${svcId}"]:checked`);
      const timeVal = sel ? sel.value : 'week';
      // compute shown price value for the clicked plan
      const planCard = btn.closest('.plan-card');
      const priceText = planCard ? (planCard.querySelector('.price .price-value')?.textContent || planCard.querySelector('.price')?.textContent || '') : '';
      showToast(`(Demo) ${svcId} · ${plan} · ${timeVal} · ${priceText}`);
    });
  });

  /* Accessibility: keyboard toggle for view-plans (Enter/Space) */
  viewButtons.forEach(btn => {
    btn.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        btn.click();
      }
    });
  });

  /* Final safety: ensure panels states are synchronized with aria-expanded */
  viewButtons.forEach(btn => {
    const svc = btn.getAttribute('data-svc');
    const panel = document.getElementById('plans-' + svc);
    if (panel && panel.getAttribute('aria-hidden') === 'true') {
      btn.setAttribute('aria-expanded', 'false');
    } else if (panel) {
      btn.setAttribute('aria-expanded', 'true');
    }
  });

});
/* ===== Random Meme Generator (Demo) ===== */
(function(){
  // sichere Meme-Liste (nur harmlose, spaßige Begriffe + emojis)
  const MEMES = [
    { key: '67', title: '67 — Die Glückszahl', body: 'Ein sehr zufälliges Meme: 67 🎉\nImmer ein Grund zu lächeln.' , sticker: '🔢' },
    { key: 'skibidi', title: 'Skibidi', body: 'Skibidi-Vibes! Mach die Tanzbewegung (nur in Gedanken) 😄', sticker: '🕺' },
    { key: 'dancing-cat', title: 'Dancing Cat', body: 'Die tanzende Katze sagt Hallo! 🐱💃', sticker: '🐱' },
    { key: 'surprised', title: 'Überraschter Blick', body: 'Wenn du gerade eine unerwartete Idee hattest… 😯', sticker: '😯' },
    { key: 'boop', title: 'Boop!', body: 'Boop the snoot — niedlich und harmlos. 🫧', sticker: '🫧' },
    { key: 'banana', title: 'Banana Time', body: 'Bananen sind glücklich. 🍌', sticker: '🍌' },
    { key: 'tiny-dog', title: 'Tiny Dog Energy', body: 'Kleiner Hund, große Persönlichkeit. 🐶', sticker: '🐶' },
    { key: 'math-67', title: '67 mal Spaß', body: 'Rechne 67 * guter Laune = Lächeln 😄', sticker: '✖️' },
    { key: 'mirror', title: 'Morning Mirror', body: 'Schau in den Spiegel — du siehst fantastisch aus! ✨', sticker: '🪞' },
    { key: 'noice', title: 'Noice', body: 'Wenn alles richtig gut läuft — Noice. 👍', sticker: '👌' },
    { key: 'sketch', title: 'Random Sketch', body: 'Ein abstraktes Kunstwerk in deinem Kopf. 🎨', sticker: '🖌️' },
    { key: 'tiny-planet', title: 'Tiny Planet', body: 'Reise in Gedanken zu einem Mini-Planeten 🌍', sticker: '🌍' },
    { key: 'cat-mood', title: 'Cat Mood', body: 'Kaffee + Katze = perfekter Start. ☕🐈', sticker: '☕' },
    { key: 'hello', title: 'Einfach Hallo', body: 'Hallo! Dies ist ein freundliches Demo-Meme. 😊', sticker: '👋' },
    { key: 'robot', title: 'Friendly Bot', body: 'Ich bin ein netter Bot. Beep boop 🤖', sticker: '🤖' }
  ];

  // DOM
  const btn = document.getElementById('meme-gen-btn');
  const input = document.getElementById('meme-number');
  const egg = document.getElementById('meme-egg');
  const eggArea = document.getElementById('egg-area');
  const result = document.getElementById('meme-result');

  if (!btn || !egg || !eggArea || !result) return;

  // helper: random int
  function randInt(max) { return Math.floor(Math.random() * max); }

  // create fragments for explosion
  function createFragments(centerX, centerY, count = 10) {
    const frags = [];
    for (let i = 0; i < count; i++) {
      const f = document.createElement('div');
      f.className = 'fragment';
      // random direction
      const angle = (Math.PI * 2) * Math.random();
      const dist = 60 + Math.random() * 80;
      const tx = Math.round(Math.cos(angle) * dist) + 'px';
      const ty = Math.round(Math.sin(angle) * dist) + 'px';
      const rot = (Math.random() * 360).toFixed(0) + 'deg';
      // CSS custom props used by keyframe final transform
      f.style.setProperty('--tx', tx);
      f.style.setProperty('--ty', ty);
      f.style.setProperty('--rot', rot);
      // start position: center of egg area (we add relative offsets)
      // position relative to eggArea
      const rect = eggArea.getBoundingClientRect();
      const x = centerX - rect.left - 8; // adjust half fragment size
      const y = centerY - rect.top - 8;
      f.style.left = x + 'px';
      f.style.top = y + 'px';
      eggArea.appendChild(f);
      frags.push(f);
    }
    // remove after animation
    setTimeout(() => frags.forEach(el => el.remove()), 1200);
  }

  // show meme card
  function showMemeCard(obj) {
    result.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'meme-card';
    const title = document.createElement('div');
    title.className = 'meme-title';
    title.textContent = obj.title + ' ' + (obj.sticker || '');
    const body = document.createElement('div');
    body.className = 'meme-body';
    body.textContent = obj.body;
    card.appendChild(title);
    card.appendChild(body);
    result.appendChild(card);
  }

  // main action
  btn.addEventListener('click', function () {
    // visual: button "eier" (shake)
    btn.disabled = true;
    btn.style.transform = 'scale(0.98)';

    // read number
    let num = parseInt(input.value, 10);
    if (isNaN(num)) num = Math.floor(Math.random() * 101);

    // egg bounce
    egg.classList.remove('exploded');
    void egg.offsetWidth; // reflow
    egg.classList.add('bounce');

    // after short delay, egg explodes
    setTimeout(() => {
      // compute center of egg for fragments
      const rect = egg.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // create fragments and fade egg
      createFragments(centerX, centerY, 12);
      egg.classList.add('exploded');

      // pick meme: use provided number as seed: index = num % MEMES.length
      const idx = Math.abs(num) % MEMES.length;
      const chosen = MEMES[idx];

      // small delay to reveal meme card after explosion
      setTimeout(() => {
        showMemeCard(chosen);
        // re-enable button
        btn.disabled = false;
        btn.style.transform = '';
      }, 420);

      // cleanup bounce class
      setTimeout(() => egg.classList.remove('bounce'), 900);
    }, 580);
  });

  // Accessibility: Enter on input triggers generate
  input && input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      btn.click();
    }
  });

})();
