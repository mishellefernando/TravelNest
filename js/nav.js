'use strict';

function initNavBar() {
  let navbar = document.getElementById('navbar');
  let hamburger = document.getElementById('hamburger');
  let navLinks = document.getElementById('navLinks');

  if (!navbar || !hamburger || !navLinks) {
    return;
  }

  function updateNavStyle() {
    let scrollPosition = window.scrollY;
    let isScrolled = scrollPosition > 40;
    navbar.classList.toggle('scrolled', isScrolled);
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

  function setActiveLink() {
    let currentPage = window.location.pathname.split('/').pop();
    if (!currentPage) {
      currentPage = 'index.html';
    }

    let links = navLinks.querySelectorAll('a[href]');
    for (let i = 0; i < links.length; i += 1) {
      let link = links[i];
      if (link.getAttribute('href') === currentPage) {
        link.classList.add('nav-active');
      }
    }
  }

  window.addEventListener('scroll', updateNavStyle, { passive: true });
  updateNavStyle();

  hamburger.addEventListener('click', toggleMenu);

  let navItems = navLinks.querySelectorAll('a');
  for (let i = 0; i < navItems.length; i += 1) {
    navItems[i].addEventListener('click', closeMenu);
  }

  setActiveLink();
}

function setFooterYear() {
  let yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

initNavBar();
setFooterYear();
