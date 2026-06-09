'use strict';

function initializeDestinationExplorer() {
  let destGrid = document.getElementById('destGrid');
  let searchField = document.getElementById('searchInput');
  let continentFilter = document.getElementById('continentFilter');
  let typeFilter = document.getElementById('typeFilter');
  let resultCount = document.getElementById('filterCount');
  let backdrop = document.getElementById('modalBackdrop');
  let modalClose = document.getElementById('modalClose');

  if (!destGrid || !searchField || !continentFilter || !typeFilter || !resultCount || !backdrop || !modalClose) {
    return;
  }

  function sumArray(values) {
    let total = 0;
    for (let i = 0; i < values.length; i += 1) {
      total += values[i];
    }
    return total;
  }

  function createTagsHtml(tags) {
    let html = '';
    for (let i = 0; i < tags.length; i += 1) {
      html += '<span class="dest-tag">' + tags[i] + '</span>';
    }
    return html;
  }

  function renderCards(destinations) {
    destGrid.innerHTML = '';

    if (destinations.length === 0) {
      destGrid.innerHTML =
        '<div class="dest-empty">' +
        '<span class="empty-icon">🔍</span>' +
        '<h3>No destinations found</h3>' +
        '<p>Try adjusting your search or filters.</p>' +
        '</div>';
      resultCount.textContent = '0 results';
      return;
    }

    let countText = destinations.length + ' destination';
    if (destinations.length !== 1) {
      countText += 's';
    }
    resultCount.textContent = countText;

    for (let i = 0; i < destinations.length; i += 1) {
      let destination = destinations[i];
      let card = document.createElement('div');
      card.className = 'dest-card';
      card.setAttribute('role', 'listitem');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', destination.name + ', ' + destination.country);

      card.innerHTML =
        '<div class="dest-card-img" style="background-image:url(\'' + destination.image + '\')">' +
        '<span class="dest-card-continent">' + destination.continent + '</span>' +
        '</div>' +
        '<div class="dest-card-body">' +
        '<h3>' + destination.name + '</h3>' +
        '<p class="dest-country">📍 ' + destination.country + '</p>' +
        '<p class="dest-excerpt">' + destination.description + '</p>' +
        '<div class="dest-tags">' + createTagsHtml(destination.travelTypes) + '</div>' +
        '</div>';

      card.addEventListener('click', makeCardClickHandler(destination));
      card.addEventListener('keydown', makeCardKeyHandler(destination));
      destGrid.appendChild(card);
    }
  }

  function makeCardClickHandler(destination) {
    return function () {
      openModal(destination);
    };
  }

  function makeCardKeyHandler(destination) {
    return function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        openModal(destination);
      }
    };
  }

  function openModal(dest) {
    document.getElementById('modalTitle').textContent = dest.name + ', ' + dest.country;
    let modalImg = document.getElementById('modalImg');
    modalImg.style.backgroundImage = 'url(\'' + dest.image + '\')';
    modalImg.setAttribute('aria-label', 'Photo of ' + dest.name);
    document.getElementById('modalDesc').textContent = dest.description;

    let metaEl = document.getElementById('modalMeta');
    let metaHtml = '<span class="meta-tag">' + dest.continent + '</span>';
    for (let i = 0; i < dest.travelTypes.length; i += 1) {
      metaHtml += '<span class="meta-tag">' + dest.travelTypes[i] + '</span>';
    }
    metaEl.innerHTML = metaHtml;

    let attrEl = document.getElementById('modalAttractions');
    let attractionsHtml = '';
    for (let j = 0; j < dest.attractions.length; j += 1) {
      attractionsHtml += '<li>' + dest.attractions[j] + '</li>';
    }
    attrEl.innerHTML = attractionsHtml;

    let tbody = document.getElementById('modalCostBody');
    let categories = dest.costs.categories;
    let budget = dest.costs.budget;
    let moderate = dest.costs.moderate;
    let luxury = dest.costs.luxury;

    let rowsHtml = '';
    for (let k = 0; k < categories.length; k += 1) {
      rowsHtml +=
        '<tr>' +
        '<td>' + categories[k] + '</td>' +
        '<td class="col-budget">$' + budget[k] + '</td>' +
        '<td class="col-mod">$' + moderate[k] + '</td>' +
        '<td class="col-luxury">$' + luxury[k] + '</td>' +
        '</tr>';
    }

    rowsHtml +=
      '<tr>' +
      '<td>Total /day</td>' +
      '<td class="col-budget">$' + sumArray(budget) + '</td>' +
      '<td class="col-mod">$' + sumArray(moderate) + '</td>' +
      '<td class="col-luxury">$' + sumArray(luxury) + '</td>' +
      '</tr>';

    tbody.innerHTML = rowsHtml;

    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    modalClose.focus();
  }

  function closeModal() {
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  function applyFilters() {
    let searchText = searchField.value.trim().toLowerCase();
    let selectedContinent = continentFilter.value;
    let selectedType = typeFilter.value;

    let visibleDestinations = [];
    for (let i = 0; i < DESTINATIONS.length; i += 1) {
      let destination = DESTINATIONS[i];
      let matchesSearch = false;
      if (searchText === '') {
        matchesSearch = true;
      } else {
        let nameLower = destination.name.toLowerCase();
        let countryLower = destination.country.toLowerCase();
        matchesSearch = nameLower.indexOf(searchText) !== -1 || countryLower.indexOf(searchText) !== -1;
      }

      let matchesContinent = selectedContinent === '' || destination.continent === selectedContinent;
      let matchesType = selectedType === '' || destination.travelTypes.indexOf(selectedType) !== -1;

      if (matchesSearch && matchesContinent && matchesType) {
        visibleDestinations.push(destination);
      }
    }

    renderCards(visibleDestinations);
  }

  searchField.addEventListener('input', applyFilters);
  continentFilter.addEventListener('change', applyFilters);
  typeFilter.addEventListener('change', applyFilters);
  modalClose.addEventListener('click', closeModal);
  backdrop.addEventListener('click', function (event) {
    if (event.target === backdrop) {
      closeModal();
    }
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeModal();
    }
  });

  renderCards(DESTINATIONS);
}

window.addEventListener('DOMContentLoaded', initializeDestinationExplorer);
