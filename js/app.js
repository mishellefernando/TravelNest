/* ============================================================
   TRAVELNEST – app.js
   ============================================================ */

'use strict';

function getElement(id) {
  return document.getElementById(id);
}

function initNavbar() {
  let navbar = getElement('navbar');
  let hamburger = getElement('hamburger');
  let navLinks = getElement('navLinks');

  if (!navbar || !hamburger || !navLinks) {
    return;
  }

  let heroSection = getElement('hero');

  function updateNavbar() {
    let shouldShowScrolled = window.scrollY > 40 || heroSection !== null;
    navbar.classList.toggle('scrolled', shouldShowScrolled);
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  function toggleMenu() {
    let isOpen = hamburger.classList.toggle('open');
    navLinks.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  }

  hamburger.addEventListener('click', toggleMenu);

  let links = navLinks.querySelectorAll('a');
  for (let i = 0; i < links.length; i += 1) {
    links[i].addEventListener('click', closeMenu);
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();
}

function initQuotes() {
  let quotes = [
    { text: 'The world is a book,\nand those who do not travel\nread only one page.', author: '— Saint Augustine' },
    { text: 'Travel is the only thing you buy\nthat makes you richer.', author: '— Anonymous' },
    { text: 'Not all those who wander are lost.', author: '— J.R.R. Tolkien' },
    { text: 'To travel is to live.', author: '— Hans Christian Andersen' },
    { text: 'Life is short and the world\nis wide.', author: '— Simon Raven' },
    { text: 'Adventure is worthwhile\nin itself.', author: '— Amelia Earhart' },
  ];

  let quoteText = getElement('quoteText');
  let quoteAuthor = getElement('quoteAuthor');
  let dotsWrap = getElement('quoteDots');

  if (!quoteText || !quoteAuthor || !dotsWrap) {
    return;
  }

  let currentIndex = 0;
  let timerId = null;

  function getDots() {
    return dotsWrap.querySelectorAll('.qdot');
  }

  function renderQuote(index) {
    let quote = quotes[index];
    quoteText.parentElement.classList.add('fade');

    setTimeout(function () {
      quoteText.innerHTML = quote.text.replace(/\n/g, '<br />');
      quoteAuthor.textContent = quote.author;
      quoteText.parentElement.classList.remove('fade');
    }, 400);

    let dots = getDots();
    for (let i = 0; i < dots.length; i += 1) {
      if (i === index) {
        dots[i].classList.add('active');
      } else {
        dots[i].classList.remove('active');
      }
    }
  }

  function goToQuote(index, resetTimer) {
    currentIndex = index;
    renderQuote(currentIndex);

    if (resetTimer) {
      clearInterval(timerId);
      timerId = setInterval(nextQuote, 5000);
    }
  }

  function nextQuote() {
    currentIndex = (currentIndex + 1) % quotes.length;
    renderQuote(currentIndex);
  }

  function makeDotClickHandler(index) {
    return function () {
      goToQuote(index, true);
    };
  }

  for (let i = 0; i < quotes.length; i += 1) {
    let dotButton = document.createElement('button');
    dotButton.className = i === 0 ? 'qdot active' : 'qdot';
    dotButton.setAttribute('aria-label', 'Quote ' + (i + 1));
    dotButton.addEventListener('click', makeDotClickHandler(i));
    dotsWrap.appendChild(dotButton);
  }

  timerId = setInterval(nextQuote, 5000);
  renderQuote(currentIndex);
}

function initDotD() {
  let destinations = [
    { name: 'Santorini', country: 'Greece', rating: '4.9', img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80' },
    { name: 'Kyoto', country: 'Japan', rating: '4.8', img: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80' },
    { name: 'Machu Picchu', country: 'Peru', rating: '4.9', img: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80' },
    { name: 'Amalfi Coast', country: 'Italy', rating: '4.7', img: 'https://images.unsplash.com/photo-1533606688076-b6683a5f59f1?w=800&q=80' },
    { name: 'Banff', country: 'Canada', rating: '4.8', img: 'https://images.unsplash.com/photo-1609629843000-e51e2e80ff07?w=800&q=80' },
    { name: 'Marrakech', country: 'Morocco', rating: '4.6', img: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&q=80' },
    { name: 'Queenstown', country: 'New Zealand', rating: '4.8', img: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&q=80' },
    { name: 'Dubrovnik', country: 'Croatia', rating: '4.7', img: 'https://images.unsplash.com/photo-1555990793-da11153b2473?w=800&q=80' },
    { name: 'Cape Town', country: 'South Africa', rating: '4.8', img: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80' },
    { name: 'Maldives', country: 'Maldives', rating: '5.0', img: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80' },
    { name: 'Prague', country: 'Czech Republic', rating: '4.7', img: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&q=80' },
    { name: 'Bora Bora', country: 'French Polynesia', rating: '4.9', img: 'https://images.unsplash.com/photo-1589979481223-deb893043163?w=800&q=80' },
  ];

  let now = new Date();
  let startOfYear = new Date(now.getFullYear(), 0, 0);
  let dayOfYear = Math.floor((now - startOfYear) / 86400000);
  let todayIndex = dayOfYear % destinations.length;
  let today = destinations[todayIndex];

  getElement('dotdDestName').textContent = today.name + ', ' + today.country;
  getElement('dotdRating').textContent = '★ ' + today.rating;
  getElement('dotdTitle').textContent = today.name;
  getElement('dotdDescription').textContent = 'Today we\'re shining the spotlight on ' + today.name + ', ' + today.country + '. A destination that captivates every traveller.';

  let grid = getElement('dotdGrid');
  let otherDestinations = [];

  for (let i = 0; i < destinations.length; i += 1) {
    if (i !== todayIndex) {
      otherDestinations.push(destinations[i]);
    }
    if (otherDestinations.length === 3) {
      break;
    }
  }

  let cards = [today].concat(otherDestinations);

  for (let j = 0; j < cards.length; j += 1) {
    let destination = cards[j];
    let card = document.createElement('div');
    card.className = 'dotd-card';

    let imageBox = document.createElement('div');
    imageBox.className = 'dotd-img';
    imageBox.style.backgroundImage = 'url(\'' + destination.img + '\')';
    imageBox.style.backgroundSize = 'cover';
    imageBox.style.backgroundPosition = 'center';
    imageBox.style.minHeight = j === 0 ? '440px' : '200px';

    let caption = document.createElement('div');
    caption.className = 'dotd-caption';
    caption.innerHTML = '<p class="dotd-name">' + destination.name + '</p><p class="dotd-country">' + destination.country + ' · ★ ' + destination.rating + '</p>';

    card.appendChild(imageBox);
    card.appendChild(caption);
    grid.appendChild(card);
  }
}

function initNewsletter() {
  let form = getElement('newsletterForm');
  let input = getElement('emailInput');
  let messageBox = getElement('newsletterMsg');
  let countBox = getElement('subscriberCount');
  let STORAGE_KEY = 'tn_subscribers';

  function getSubscribers() {
    try {
      let stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  function saveSubscriber(email) {
    let subscribers = getSubscribers();
    for (let i = 0; i < subscribers.length; i += 1) {
      if (subscribers[i] === email) {
        return 'exists';
      }
    }
    subscribers.push(email);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscribers));
    return 'added';
  }

  function updateCount() {
    let count = getSubscribers().length;
    if (count === 0) {
      countBox.textContent = '';
      return;
    }
    countBox.textContent = count.toLocaleString() + ' traveller' + (count !== 1 ? 's' : '') + ' already subscribed.';
  }

  function showMessage(text, type) {
    messageBox.textContent = text;
    messageBox.className = 'newsletter-msg ' + type;
    setTimeout(function () {
      messageBox.textContent = '';
      messageBox.className = 'newsletter-msg';
    }, 4000);
  }

  if (!form) {
    return;
  }

  updateCount();

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    let value = input.value.trim().toLowerCase();

    if (value === '' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      showMessage('Please enter a valid email address.', 'error');
      input.focus();
      return;
    }

    let result = saveSubscriber(value);
    if (result === 'exists') {
      showMessage('This email is already subscribed.', 'info');
    } else {
      input.value = '';
      showMessage('Thanks for subscribing! You will hear from us soon.', 'success');
      updateCount();
    }
  });
}

initNavbar();
initQuotes();
initDotD();
initNewsletter();

let yearElement = getElement('year');
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function () {
      // Service worker is not critical.
    });
  });
}
