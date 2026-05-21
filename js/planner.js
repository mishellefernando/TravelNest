'use strict';

let PLAN_KEY = 'tn_plans';
let WISH_KEY = 'tn_wishlist';
let lastGeneratedDestination = null;

function getElement(id) {
  return document.getElementById(id);
}

function populateDestinationSelect() {
  let destinationSelect = getElement('bpDestination');
  if (!destinationSelect) {
    return;
  }

  for (let i = 0; i < DESTINATIONS.length; i += 1) {
    let destination = DESTINATIONS[i];
    let option = document.createElement('option');
    option.value = destination.id;
    option.textContent = destination.name + ', ' + destination.country;
    destinationSelect.appendChild(option);
  }
}

function getBudgetTier(daily) {
  if (daily < 100) {
    return { label: '💚 Budget / Low', cls: 'low' };
  }
  if (daily < 300) {
    return { label: '💛 Moderate', cls: 'moderate' };
  }
  return { label: '💜 Luxury', cls: 'luxury' };
}

function loadPlans() {
  try {
    let saved = localStorage.getItem(PLAN_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function savePlans(plans) {
  localStorage.setItem(PLAN_KEY, JSON.stringify(plans.slice(0, 10)));
}

function renderPlans() {
  let plans = loadPlans();
  let wrap = getElement('savedPlansWrap');
  let listEl = getElement('savedPlansList');

  if (!wrap || !listEl) {
    return;
  }

  if (plans.length === 0) {
    wrap.style.display = 'none';
    return;
  }

  wrap.style.display = 'block';
  listEl.innerHTML = '';

  for (let i = 0; i < plans.length; i += 1) {
    let plan = plans[i];
    let item = document.createElement('div');
    item.className = 'saved-plan-item';

    let info = document.createElement('div');
    let name = document.createElement('div');
    name.className = 'sp-info';
    name.textContent = plan.destName;

    let meta = document.createElement('div');
    meta.className = 'sp-meta';
    meta.textContent = plan.days + ' days · $' + plan.daily + '/day · $' + plan.total.toLocaleString() + ' total';

    info.appendChild(name);
    info.appendChild(meta);

    let button = document.createElement('button');
    button.className = 'sp-del';
    button.dataset.id = plan.id;
    button.setAttribute('aria-label', 'Remove plan for ' + plan.destName);
    button.textContent = '🗑';
    button.addEventListener('click', function (event) {
      let id = Number(event.target.dataset.id);
      let updatedPlans = [];
      let existingPlans = loadPlans();
      for (let j = 0; j < existingPlans.length; j += 1) {
        if (existingPlans[j].id !== id) {
          updatedPlans.push(existingPlans[j]);
        }
      }
      savePlans(updatedPlans);
      renderPlans();
    });

    item.appendChild(info);
    item.appendChild(button);
    listEl.appendChild(item);
  }
}

function handleBudgetSubmit(event) {
  event.preventDefault();

  let destinationSelect = getElement('bpDestination');
  let daysInput = getElement('bpDays');
  let budgetInput = getElement('bpBudget');
  let resultSection = getElement('budgetResult');
  let totalText = getElement('bpTotal');
  let summaryText = getElement('bpSub');
  let statusBadge = getElement('bpStatus');
  let progressBar = getElement('bpBar');

  if (!destinationSelect || !daysInput || !budgetInput || !resultSection || !totalText || !summaryText || !statusBadge || !progressBar) {
    return;
  }

  let destId = destinationSelect.value;
  let days = parseInt(daysInput.value, 10);
  let daily = parseFloat(budgetInput.value);

  if (!destId || !days || !daily || days < 1 || daily < 1) {
    return;
  }

  let chosenDestination = null;
  for (let i = 0; i < DESTINATIONS.length; i += 1) {
    if (DESTINATIONS[i].id === destId) {
      chosenDestination = DESTINATIONS[i];
      break;
    }
  }

  if (!chosenDestination) {
    return;
  }

  let totalCost = days * daily;
  let tier = getBudgetTier(daily);
  let percent = Math.min(100, Math.round((daily / 600) * 100));

  totalText.textContent = '$' + totalCost.toLocaleString() + ' USD';
  summaryText.textContent = chosenDestination.name + ' · ' + days + ' day' + (days !== 1 ? 's' : '') + ' · $' + daily + '/day';
  statusBadge.textContent = tier.label;
  statusBadge.className = 'status-badge ' + tier.cls;
  progressBar.className = 'progress-fill ' + tier.cls;
  progressBar.style.width = '0%';

  setTimeout(function () {
    progressBar.style.width = percent + '%';
  }, 50);

  resultSection.classList.add('visible');

  currentPlan = {
    destId: destId,
    destName: chosenDestination.name,
    country: chosenDestination.country,
    days: days,
    daily: daily,
    total: totalCost,
    tier: tier.cls,
  };
}

function saveCurrentPlan() {
  if (!currentPlan) {
    return;
  }

  let plans = loadPlans();
  plans.unshift({
    id: Date.now(),
    destId: currentPlan.destId,
    destName: currentPlan.destName,
    country: currentPlan.country,
    days: currentPlan.days,
    daily: currentPlan.daily,
    total: currentPlan.total,
    tier: currentPlan.tier,
  });
  savePlans(plans);
  renderPlans();

  let saveButton = getElement('bpSave');
  if (saveButton) {
    saveButton.textContent = '✓ Saved!';
    setTimeout(function () {
      saveButton.textContent = '💾 Save Plan';
    }, 2000);
  }
}

function doesTypeMatch(destination, type) {
  return type === '' || destination.travelTypes.indexOf(type) !== -1;
}

function doesBudgetMatch(destination, budgetTier) {
  if (budgetTier === '' || destination.budgetTier === budgetTier) {
    return true;
  }
  if (budgetTier === 'moderate') {
    return destination.budgetTier === 'budget' || destination.budgetTier === 'moderate';
  }
  if (budgetTier === 'luxury') {
    return destination.budgetTier === 'moderate' || destination.budgetTier === 'luxury';
  }
  return false;
}

function getRandomDestination() {
  let typeValue = getElement('genType').value;
  let budgetValue = getElement('genBudget').value;
  let pool = [];

  for (let i = 0; i < DESTINATIONS.length; i += 1) {
    let destination = DESTINATIONS[i];
    if (doesTypeMatch(destination, typeValue) && doesBudgetMatch(destination, budgetValue)) {
      pool.push(destination);
    }
  }

  if (pool.length === 0) {
    for (let j = 0; j < DESTINATIONS.length; j += 1) {
      pool.push(DESTINATIONS[j]);
    }
  }

  if (pool.length > 1 && lastGeneratedDestination) {
    let filteredPool = [];
    for (let k = 0; k < pool.length; k += 1) {
      if (pool[k].id !== lastGeneratedDestination.id) {
        filteredPool.push(pool[k]);
      }
    }
    if (filteredPool.length > 0) {
      pool = filteredPool;
    }
  }

  let index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

function showGeneratedDestination(destination, animate) {
  lastGeneratedDestination = destination;

  let imageBox = getElement('genImg');
  let nameEl = getElement('genName');
  let countryEl = getElement('genCountry');
  let excerptEl = getElement('genExcerpt');
  let resultBox = getElement('genResult');
  let saveButton = getElement('genSave');

  if (!imageBox || !nameEl || !countryEl || !excerptEl || !resultBox || !saveButton) {
    return;
  }

  imageBox.style.backgroundImage = 'url(\'' + destination.image + '\')';
  nameEl.textContent = destination.name;
  countryEl.textContent = '📍 ' + destination.country + ' · ' + destination.continent;
  excerptEl.textContent = destination.description.substring(0, 120) + '…';

  resultBox.classList.remove('animate');
  resultBox.classList.add('visible');

  if (animate) {
    void resultBox.offsetWidth;
    resultBox.classList.add('animate');
  }

  saveButton.textContent = '♡ Wishlist';
  saveButton.disabled = isWishlisted(destination.id);
  if (saveButton.disabled) {
    saveButton.textContent = '✓ Saved';
  }
}

function loadWishlist() {
  try {
    let saved = localStorage.getItem(WISH_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function isWishlisted(id) {
  let wishlist = loadWishlist();
  for (let i = 0; i < wishlist.length; i += 1) {
    if (wishlist[i].id === id) {
      return true;
    }
  }
  return false;
}

function renderWishlist() {
  let list = loadWishlist();
  let listEl = getElement('wishlistList');
  let emptyEl = getElement('wishlistEmpty');

  if (!listEl || !emptyEl) {
    return;
  }

  if (list.length === 0) {
    emptyEl.style.display = 'block';
  } else {
    emptyEl.style.display = 'none';
  }

  listEl.innerHTML = '';

  for (let i = 0; i < list.length; i += 1) {
    let itemData = list[i];
    let li = document.createElement('li');
    li.className = 'wishlist-item';

    let flag = document.createElement('span');
    flag.className = 'wi-flag';
    flag.textContent = '✈';

    let info = document.createElement('div');
    info.className = 'wi-info';

    let name = document.createElement('div');
    name.className = 'wi-name';
    name.textContent = itemData.name;

    let country = document.createElement('div');
    country.className = 'wi-country';
    country.textContent = itemData.country + ' · ' + itemData.continent;

    info.appendChild(name);
    info.appendChild(country);

    let removeButton = document.createElement('button');
    removeButton.className = 'wi-del';
    removeButton.dataset.id = itemData.id;
    removeButton.setAttribute('aria-label', 'Remove ' + itemData.name + ' from wishlist');
    removeButton.textContent = '✕';
    removeButton.addEventListener('click', function (event) {
      let id = event.target.dataset.id;
      let updated = [];
      let currentList = loadWishlist();
      for (let j = 0; j < currentList.length; j += 1) {
        if (currentList[j].id !== id) {
          updated.push(currentList[j]);
        }
      }
      localStorage.setItem(WISH_KEY, JSON.stringify(updated));
      renderWishlist();

      if (lastGeneratedDestination && lastGeneratedDestination.id === id) {
        let saveBtn = getElement('genSave');
        if (saveBtn) {
          saveBtn.textContent = '♡ Wishlist';
          saveBtn.disabled = false;
        }
      }
    });

    li.appendChild(flag);
    li.appendChild(info);
    li.appendChild(removeButton);
    listEl.appendChild(li);
  }
}

function addCurrentDestinationToWishlist() {
  if (!lastGeneratedDestination || isWishlisted(lastGeneratedDestination.id)) {
    return;
  }

  let list = loadWishlist();
  list.push({
    id: lastGeneratedDestination.id,
    name: lastGeneratedDestination.name,
    country: lastGeneratedDestination.country,
    continent: lastGeneratedDestination.continent,
  });
  localStorage.setItem(WISH_KEY, JSON.stringify(list));
  renderWishlist();

  let saveButton = getElement('genSave');
  if (saveButton) {
    saveButton.textContent = '✓ Saved';
    saveButton.disabled = true;
  }
}

function initializePlannerPage() {
  populateDestinationSelect();

  let budgetForm = getElement('budgetForm');
  if (budgetForm) {
    budgetForm.addEventListener('submit', handleBudgetSubmit);
  }

  let saveButton = getElement('bpSave');
  if (saveButton) {
    saveButton.addEventListener('click', saveCurrentPlan);
  }

  let generateButton = getElement('genBtn');
  if (generateButton) {
    generateButton.addEventListener('click', function () {
      showGeneratedDestination(getRandomDestination(), true);
    });
  }

  let generateAgain = getElement('genAgain');
  if (generateAgain) {
    generateAgain.addEventListener('click', function () {
      showGeneratedDestination(getRandomDestination(), true);
    });
  }

  let wishlistButton = getElement('genSave');
  if (wishlistButton) {
    wishlistButton.addEventListener('click', addCurrentDestinationToWishlist);
  }

  renderPlans();
  renderWishlist();
}

let currentPlan = null;
window.addEventListener('DOMContentLoaded', initializePlannerPage);
