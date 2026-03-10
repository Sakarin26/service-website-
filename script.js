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
