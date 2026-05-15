/* ============================================================
   TravelNest – Destination Explorer
   Depends on: data.js (DESTINATIONS constant)
   ============================================================ */
'use strict';

const grid         = document.getElementById('destGrid');
const searchInput  = document.getElementById('searchInput');
const continentSel = document.getElementById('continentFilter');
const typeSel      = document.getElementById('typeFilter');
const countEl      = document.getElementById('filterCount');
const backdrop     = document.getElementById('modalBackdrop');
const modalClose   = document.getElementById('modalClose');

/* ── Render cards ──────────────────────────────────────────── */
function renderCards(list) {
  grid.innerHTML = '';

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="dest-empty">
        <span class="empty-icon">🔍</span>
        <h3>No destinations found</h3>
        <p>Try adjusting your search or filters.</p>
      </div>`;
    countEl.textContent = '0 results';
    return;
  }

  countEl.textContent = `${list.length} destination${list.length !== 1 ? 's' : ''}`;

  list.forEach(dest => {
    const card = document.createElement('div');
    card.className = 'dest-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${dest.name}, ${dest.country}`);

    card.innerHTML = `
      <div class="dest-card-img" style="background-image:url('${dest.image}')">
        <span class="dest-card-continent">${dest.continent}</span>
      </div>
      <div class="dest-card-body">
        <h3>${dest.name}</h3>
        <p class="dest-country">📍 ${dest.country}</p>
        <p class="dest-excerpt">${dest.description}</p>
        <div class="dest-tags">
          ${dest.travelTypes.map(t => `<span class="dest-tag">${t}</span>`).join('')}
        </div>
      </div>`;

    card.addEventListener('click', () => openModal(dest));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openModal(dest); });
    grid.appendChild(card);
  });
}

/* ── Filter logic ──────────────────────────────────────────── */
function applyFilters() {
  const query     = searchInput.value.trim().toLowerCase();
  const continent = continentSel.value;
  const type      = typeSel.value;

  const filtered = DESTINATIONS.filter(d => {
    const matchSearch    = !query || d.name.toLowerCase().includes(query) || d.country.toLowerCase().includes(query);
    const matchContinent = !continent || d.continent === continent;
    const matchType      = !type || d.travelTypes.includes(type);
    return matchSearch && matchContinent && matchType;
  });

  renderCards(filtered);
}

searchInput.addEventListener('input', applyFilters);
continentSel.addEventListener('change', applyFilters);
typeSel.addEventListener('change', applyFilters);

/* ── Modal ─────────────────────────────────────────────────── */
function openModal(dest) {
  document.getElementById('modalTitle').textContent = `${dest.name}, ${dest.country}`;
  document.getElementById('modalImg').style.backgroundImage = `url('${dest.image}')`;
  document.getElementById('modalImg').setAttribute('aria-label', `Photo of ${dest.name}`);
  document.getElementById('modalDesc').textContent = dest.description;

  // Meta tags
  const metaEl = document.getElementById('modalMeta');
  metaEl.innerHTML = [
    dest.continent,
    ...dest.travelTypes,
  ].map(t => `<span class="meta-tag">${t}</span>`).join('');

  // Attractions
  const attrEl = document.getElementById('modalAttractions');
  attrEl.innerHTML = dest.attractions
    .map(a => `<li>${a}</li>`)
    .join('');

  // Cost table body
  const tbody = document.getElementById('modalCostBody');
  const { categories, budget, moderate, luxury } = dest.costs;

  const rows = categories.map((cat, i) => `
    <tr>
      <td>${cat}</td>
      <td class="col-budget">$${budget[i]}</td>
      <td class="col-mod">$${moderate[i]}</td>
      <td class="col-luxury">$${luxury[i]}</td>
    </tr>`).join('');

  // Totals row
  const sum = arr => arr.reduce((a, b) => a + b, 0);
  const totalsRow = `
    <tr>
      <td>Total /day</td>
      <td class="col-budget">$${sum(budget)}</td>
      <td class="col-mod">$${sum(moderate)}</td>
      <td class="col-luxury">$${sum(luxury)}</td>
    </tr>`;

  tbody.innerHTML = rows + totalsRow;

  // Open
  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
  modalClose.focus();
}

function closeModal() {
  backdrop.classList.remove('open');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ── Init ──────────────────────────────────────────────────── */
renderCards(DESTINATIONS);
