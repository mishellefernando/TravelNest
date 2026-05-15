/* ============================================================
   TravelNest – Budget Planner + Random Generator + Wishlist
   Depends on: data.js (DESTINATIONS constant)
   ============================================================ */
'use strict';

const PLAN_KEY   = 'tn_plans';
const WISH_KEY   = 'tn_wishlist';

/* ── Populate destination select ───────────────────────────── */
const destSelect = document.getElementById('bpDestination');
DESTINATIONS.forEach(d => {
  const opt = document.createElement('option');
  opt.value   = d.id;
  opt.textContent = `${d.name}, ${d.country}`;
  destSelect.appendChild(opt);
});

/* ============================================================
   BUDGET PLANNER
   ============================================================ */
const budgetForm   = document.getElementById('budgetForm');
const budgetResult = document.getElementById('budgetResult');
const bpTotal      = document.getElementById('bpTotal');
const bpSub        = document.getElementById('bpSub');
const bpStatus     = document.getElementById('bpStatus');
const bpBar        = document.getElementById('bpBar');
const bpSave       = document.getElementById('bpSave');

const MAX_DAILY = 600; // $600/day = 100% on bar

function getTier(daily) {
  if (daily < 100)  return { label: '💚 Budget / Low',   cls: 'low' };
  if (daily < 300)  return { label: '💛 Moderate',        cls: 'moderate' };
  return              { label: '💜 Luxury',               cls: 'luxury' };
}

let currentPlan = null;

budgetForm.addEventListener('submit', e => {
  e.preventDefault();

  const destId = destSelect.value;
  const days   = parseInt(document.getElementById('bpDays').value,  10);
  const daily  = parseFloat(document.getElementById('bpBudget').value);

  if (!destId || !days || !daily || days < 1 || daily < 1) return;

  const dest  = DESTINATIONS.find(d => d.id === destId);
  const total = days * daily;
  const tier  = getTier(daily);
  const pct   = Math.min(100, Math.round((daily / MAX_DAILY) * 100));

  bpTotal.textContent = `$${total.toLocaleString()} USD`;
  bpSub.textContent   = `${dest.name} · ${days} day${days !== 1 ? 's' : ''} · $${daily}/day`;

  bpStatus.textContent = tier.label;
  bpStatus.className   = `status-badge ${tier.cls}`;

  bpBar.className     = `progress-fill ${tier.cls}`;
  setTimeout(() => { bpBar.style.width = pct + '%'; }, 50);

  budgetResult.classList.add('visible');

  currentPlan = { destId, destName: dest.name, country: dest.country, days, daily, total, tier: tier.cls };
});

/* Save plan */
bpSave.addEventListener('click', () => {
  if (!currentPlan) return;

  const plans = getPlans();
  plans.unshift({ ...currentPlan, id: Date.now() });
  localStorage.setItem(PLAN_KEY, JSON.stringify(plans.slice(0, 10))); // keep last 10
  renderPlans();
  bpSave.textContent = '✓ Saved!';
  setTimeout(() => { bpSave.textContent = '💾 Save Plan'; }, 2000);
});

function getPlans() {
  try { return JSON.parse(localStorage.getItem(PLAN_KEY)) || []; } catch { return []; }
}

function renderPlans() {
  const plans    = getPlans();
  const wrap     = document.getElementById('savedPlansWrap');
  const listEl   = document.getElementById('savedPlansList');

  if (plans.length === 0) { wrap.style.display = 'none'; return; }

  wrap.style.display = 'block';
  listEl.innerHTML = plans.map(p => `
    <div class="saved-plan-item">
      <div>
        <div class="sp-info">${p.destName}</div>
        <div class="sp-meta">${p.days} days · $${p.daily}/day · $${p.total.toLocaleString()} total</div>
      </div>
      <button class="sp-del" data-id="${p.id}" aria-label="Remove plan for ${p.destName}">🗑</button>
    </div>`).join('');

  listEl.querySelectorAll('.sp-del').forEach(btn => {
    btn.addEventListener('click', () => {
      const updated = getPlans().filter(p => p.id !== Number(btn.dataset.id));
      localStorage.setItem(PLAN_KEY, JSON.stringify(updated));
      renderPlans();
    });
  });
}

renderPlans();

/* ============================================================
   RANDOM GENERATOR
   ============================================================ */
const genBtn     = document.getElementById('genBtn');
const genAgain   = document.getElementById('genAgain');
const genSave    = document.getElementById('genSave');
const genResult  = document.getElementById('genResult');

let lastDest = null;

function getRandomDest() {
  const type      = document.getElementById('genType').value;
  const budgetTier = document.getElementById('genBudget').value;

  let pool = DESTINATIONS.filter(d => {
    const matchType   = !type || d.travelTypes.includes(type);
    const matchBudget = !budgetTier || d.budgetTier === budgetTier ||
      (budgetTier === 'budget' && d.budgetTier === 'budget') ||
      (budgetTier === 'moderate' && ['budget', 'moderate'].includes(d.budgetTier)) ||
      (budgetTier === 'luxury' && ['moderate', 'luxury'].includes(d.budgetTier));
    return matchType && matchBudget;
  });

  // Fallback to full pool if no matches
  if (pool.length === 0) pool = DESTINATIONS;

  // Avoid same destination twice in a row when pool allows
  if (pool.length > 1 && lastDest) {
    pool = pool.filter(d => d.id !== lastDest.id);
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

function showGenResult(dest, animate) {
  lastDest = dest;

  document.getElementById('genImg').style.backgroundImage = `url('${dest.image}')`;
  document.getElementById('genName').textContent    = dest.name;
  document.getElementById('genCountry').textContent = `📍 ${dest.country} · ${dest.continent}`;
  document.getElementById('genExcerpt').textContent = dest.description.substring(0, 120) + '…';

  genResult.classList.remove('animate');
  genResult.classList.add('visible');

  if (animate) {
    void genResult.offsetWidth; // force reflow
    genResult.classList.add('animate');
  }

  genSave.textContent = '♡ Wishlist';
  genSave.disabled    = isWishlisted(dest.id);
  if (isWishlisted(dest.id)) genSave.textContent = '✓ Saved';
}

genBtn.addEventListener('click', () => showGenResult(getRandomDest(), true));
genAgain.addEventListener('click', () => showGenResult(getRandomDest(), true));

/* ============================================================
   WISHLIST
   ============================================================ */
function getWishlist() {
  try { return JSON.parse(localStorage.getItem(WISH_KEY)) || []; } catch { return []; }
}

function isWishlisted(id) {
  return getWishlist().some(w => w.id === id);
}

function renderWishlist() {
  const list    = getWishlist();
  const listEl  = document.getElementById('wishlistList');
  const emptyEl = document.getElementById('wishlistEmpty');

  emptyEl.style.display = list.length === 0 ? 'block' : 'none';

  listEl.innerHTML = list.map(w => `
    <li class="wishlist-item">
      <span class="wi-flag">✈</span>
      <div class="wi-info">
        <div class="wi-name">${w.name}</div>
        <div class="wi-country">${w.country} · ${w.continent}</div>
      </div>
      <button class="wi-del" data-id="${w.id}" aria-label="Remove ${w.name} from wishlist">✕</button>
    </li>`).join('');

  listEl.querySelectorAll('.wi-del').forEach(btn => {
    btn.addEventListener('click', () => {
      const updated = getWishlist().filter(w => w.id !== btn.dataset.id);
      localStorage.setItem(WISH_KEY, JSON.stringify(updated));
      renderWishlist();
      if (lastDest && lastDest.id === btn.dataset.id) {
        genSave.textContent = '♡ Wishlist';
        genSave.disabled    = false;
      }
    });
  });
}

genSave.addEventListener('click', () => {
  if (!lastDest || isWishlisted(lastDest.id)) return;

  const list = getWishlist();
  list.push({ id: lastDest.id, name: lastDest.name, country: lastDest.country, continent: lastDest.continent });
  localStorage.setItem(WISH_KEY, JSON.stringify(list));
  renderWishlist();
  genSave.textContent = '✓ Saved';
  genSave.disabled    = true;
});

renderWishlist();
