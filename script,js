/* ===== Services demo: interaction (append this to script.js) ===== */

(function() {
// helper
function $(sel, ctx=document) { return ctx.querySelector(sel); }
function $all(sel, ctx=document) { return Array.from(ctx.querySelectorAll(sel)); }

// Toggle plans panel
$all('.view-plans').forEach(btn=>{
btn.addEventListener('click', function(){
const svc = btn.getAttribute('data-svc');
const panel = document.getElementById('plans-' + svc);
const expanded = btn.getAttribute('aria-expanded') === 'true';
if (panel) {
panel.classList.toggle('visible', !expanded);
panel.setAttribute('aria-hidden', expanded ? 'true' : 'false');
btn.setAttribute('aria-expanded', (!expanded).toString());
}
// update prices for current selection
updatePricesForService(svc);
});
});

// Update prices depending on selected time-option for that service
function updatePricesForService(svcId) {
const serviceCard = document.querySelector(`[data-service-id="${svcId}"]`);
if (!serviceCard) return;
// determine selected time
const radios = serviceCard.querySelectorAll(`input[type="radio"][name^="time-${svcId.replace('svc-','svc-')}"], input[type="radio"][name^="time-"]`);
// more robust: select by name pattern
const name = Array.from(serviceCard.querySelectorAll('input[type="radio"]'))[0]?.name;
let selectedValue = 'now';
if (name) {
const sel = serviceCard.querySelector(`input[name="${name}"]:checked`);
if (sel) selectedValue = sel.value;
} else {
// fallback
selectedValue = 'now';
}

// price multiplier per option (demo logic)
const multiplier = (selectedValue === 'now') ? 1.2
: (selectedValue === 'soon') ? 1.0
: (selectedValue === 'week') ? 0.9
: (selectedValue === 'month') ? 0.8
: 1.0;

$all(`#plans-${svcId} .plan-card`).forEach(card=>{
const priceEl = card.querySelector('.price .price-value');
const base = parseFloat(card.querySelector('.price').getAttribute('data-price-base')) || 0;
const newPrice = Math.round((base * multiplier) * 100) / 100;
if (priceEl) priceEl.textContent = `${newPrice} €`;
});
}

// Listen to radio changes to update prices live
document.addEventListener('change', function(e){
if (e.target && e.target.type === 'radio') {
// find service id ancestor
const svcCard = e.target.closest('.service-card');
if (svcCard) {
const svcId = svcCard.getAttribute('data-service-id');
updatePricesForService(svcId);
}
}
});

// Demo select action: show modal with selected option summary
function showModal(htmlContent) {
let modal = $('#demo-modal');
if (!modal) {
modal = document.createElement('div');
modal.id = 'demo-modal';
modal.className = 'modal-demo';
modal.innerHTML = `<div class="modal-inner" role="dialog" aria-modal="true">
<div id="modalContent"></div>
<div class="modal-actions">
<button id="modalClose" class="btn btn-secondary">Schließen</button>
</div>
</div>`;
document.body.appendChild(modal);
$('#modalClose').addEventListener('click', ()=> { modal.classList.remove('visible'); });
}
$('#modalContent').innerHTML = htmlContent;
modal.classList.add('visible');
}

$all('.demo-select').forEach(b=>{
b.addEventListener('click', function(){
const card = b.closest('.plan-card');
const planName = card.querySelector('h4')?.textContent || 'Plan';
const svcCard = b.closest('.service-card');
const svcTitle = svcCard.querySelector('.service-title h3')?.textContent || 'Dienst';
// find selected time
const name = svcCard.querySelector('input[type="radio"]')?.name;
const selected = svcCard.querySelector(`input[name="${name}"]:checked`)?.value || 'now';
// price
const priceVal = card.querySelector('.price .price-value')?.textContent || '';
// build HTML (demo)
const html = `<h3>Demo Zusammenfassung</h3>
<p><strong>Service:</strong> ${svcTitle}</p>
<p><strong>Plan:</strong> ${planName}</p>
<p><strong>Gewählte Zeit:</strong> ${selected}</p>
<p><strong>Preis (Demo):</strong> ${priceVal}</p>
<p class="muted">Hinweis: Dies ist eine Demo. Keine Buchung oder Preisverbindlichkeit.</p>`;
showModal(html);
});
});

// Close modal when clicking outside inner
document.addEventListener('click', function(e){
const modal = $('#demo-modal');
if (!modal) return;
const inner = modal.querySelector('.modal-inner');
if (modal.classList.contains('visible') && !inner.contains(e.target) && !e.target.classList.contains('demo-select')) {
modal.classList.remove('visible');
}
});

// initialize: update all services once
$all('.service-card').forEach(card => {
updatePricesForService(card.getAttribute('data-service-id'));
});

})();
