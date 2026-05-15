/* ============================================================
   TRAVELNEST – app.js
   ============================================================ */

'use strict';

/* ── Navbar scroll behaviour ─────────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navLinks.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    })
  );
})();


/* ── Auto-rotating travel quotes ────────────────────────── */
(function initQuotes() {
  const quotes = [
    { text: 'The world is a book,\nand those who do not travel\nread only one page.', author: '— Saint Augustine' },
    { text: 'Travel is the only thing you buy\nthat makes you richer.', author: '— Anonymous' },
    { text: 'Not all those who wander are lost.', author: '— J.R.R. Tolkien' },
    { text: 'To travel is to live.', author: '— Hans Christian Andersen' },
    { text: 'Life is short and the world\nis wide.', author: '— Simon Raven' },
    { text: 'Adventure is worthwhile\nin itself.', author: '— Amelia Earhart' },
  ];

  const quoteText   = document.getElementById('quoteText');
  const quoteAuthor = document.getElementById('quoteAuthor');
  const dotsWrap    = document.getElementById('quoteDots');

  let current  = 0;
  let timer    = null;

  // Build dots
  quotes.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'qdot' + (i === 0 ? ' active' : '');
    btn.setAttribute('aria-label', `Quote ${i + 1}`);
    btn.addEventListener('click', () => goTo(i, true));
    dotsWrap.appendChild(btn);
  });

  const dots = () => dotsWrap.querySelectorAll('.qdot');

  function render(index) {
    const q = quotes[index];

    quoteText.parentElement.classList.add('fade');

    setTimeout(() => {
      quoteText.innerHTML = q.text.replace(/\n/g, '<br />');
      quoteAuthor.textContent = q.author;
      quoteText.parentElement.classList.remove('fade');
    }, 400);

    dots().forEach((d, i) => d.classList.toggle('active', i === index));
  }

  function goTo(index, resetTimer = false) {
    current = index;
    render(current);
    if (resetTimer) {
      clearInterval(timer);
      timer = setInterval(next, 5000);
    }
  }

  function next() {
    current = (current + 1) % quotes.length;
    render(current);
  }

  timer = setInterval(next, 5000);
})();


/* ── Destination of the Day ──────────────────────────────── */
(function initDotD() {
  const destinations = [
    { name: 'Santorini',    country: 'Greece',      rating: '4.9', img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80' },
    { name: 'Kyoto',        country: 'Japan',       rating: '4.8', img: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80' },
    { name: 'Machu Picchu', country: 'Peru',        rating: '4.9', img: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80' },
    { name: 'Amalfi Coast', country: 'Italy',       rating: '4.7', img: 'https://images.unsplash.com/photo-1533606688076-b6683a5f59f1?w=800&q=80' },
    { name: 'Banff',        country: 'Canada',      rating: '4.8', img: 'https://images.unsplash.com/photo-1609629843000-e51e2e80ff07?w=800&q=80' },
    { name: 'Marrakech',    country: 'Morocco',     rating: '4.6', img: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&q=80' },
    { name: 'Queenstown',   country: 'New Zealand', rating: '4.8', img: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&q=80' },
    { name: 'Dubrovnik',    country: 'Croatia',     rating: '4.7', img: 'https://images.unsplash.com/photo-1555990793-da11153b2473?w=800&q=80' },
    { name: 'Cape Town',    country: 'South Africa',rating: '4.8', img: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80' },
    { name: 'Maldives',     country: 'Maldives',    rating: '5.0', img: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80' },
    { name: 'Prague',       country: 'Czech Republic', rating: '4.7', img: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&q=80' },
    { name: 'Bora Bora',    country: 'French Polynesia', rating: '4.9', img: 'https://images.unsplash.com/photo-1589979481223-deb893043163?w=800&q=80' },
  ];

  // Deterministic pick based on day-of-year
  const now    = new Date();
  const start  = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  const todayIdx = dayOfYear % destinations.length;

  const today  = destinations[todayIdx];

  // Hero floating card
  document.getElementById('dotdDestName').textContent = `${today.name}, ${today.country}`;
  document.getElementById('dotdRating').textContent   = `★ ${today.rating}`;
  document.getElementById('dotdTitle').textContent    = today.name;
  document.getElementById('dotdDescription').textContent =
    `Today we're shining the spotlight on ${today.name}, ${today.country}. A destination that captivates every traveller.`;

  // Grid: today + 3 others
  const grid   = document.getElementById('dotdGrid');
  const others = destinations.filter((_, i) => i !== todayIdx).slice(0, 3);
  const gridDests = [today, ...others];

  gridDests.forEach((dest, i) => {
    const card = document.createElement('div');
    card.className = 'dotd-card';

    const imgDiv = document.createElement('div');
    imgDiv.className = 'dotd-img';
    imgDiv.style.backgroundImage  = `url('${dest.img}')`;
    imgDiv.style.backgroundSize   = 'cover';
    imgDiv.style.backgroundPosition = 'center';
    if (i === 0) imgDiv.style.minHeight = '440px';
    else          imgDiv.style.minHeight = '200px';

    const caption = document.createElement('div');
    caption.className = 'dotd-caption';
    caption.innerHTML = `<p class="dotd-name">${dest.name}</p><p class="dotd-country">${dest.country} · ★ ${dest.rating}</p>`;

    card.appendChild(imgDiv);
    card.appendChild(caption);
    grid.appendChild(card);
  });
})();


/* ── Newsletter (localStorage) ───────────────────────────── */
(function initNewsletter() {
  const form     = document.getElementById('newsletterForm');
  const input    = document.getElementById('emailInput');
  const msgEl    = document.getElementById('newsletterMsg');
  const countEl  = document.getElementById('subscriberCount');

  const STORAGE_KEY = 'tn_subscribers';

  function getSubscribers() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  }

  function saveSubscriber(email) {
    const list = getSubscribers();
    if (list.includes(email)) return 'exists';
    list.push(email);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return 'added';
  }

  function showCount() {
    const n = getSubscribers().length;
    countEl.textContent = n > 0 ? `${n.toLocaleString()} traveller${n !== 1 ? 's' : ''} already subscribed.` : '';
  }

  function showMsg(text, type) {
    msgEl.textContent = text;
    msgEl.className   = `newsletter-msg ${type}`;
    setTimeout(() => { msgEl.textContent = ''; msgEl.className = 'newsletter-msg'; }, 4000);
  }

  showCount();

  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = input.value.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMsg('Please enter a valid email address.', 'error');
      input.focus();
      return;
    }

    const result = saveSubscriber(email);
    if (result === 'exists') {
      showMsg('You\'re already subscribed! 🎉', '');
    } else {
      showMsg('Welcome aboard! Check your inbox soon.', 'success');
      input.value = '';
      showCount();
    }
  });
})();


/* ── Footer year ─────────────────────────────────────────── */
document.getElementById('year').textContent = new Date().getFullYear();


/* ── PWA Service Worker registration ─────────────────────── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .catch(() => { /* SW not critical */ });
  });
}
