'use strict';

function getNavbarElements() {
  let navbar = document.getElementById('navbar');
  let hamburger = document.getElementById('hamburger');
  let navLinks = document.getElementById('navLinks');
  return { navbar: navbar, hamburger: hamburger, navLinks: navLinks };
}

function updateNavbarOnScroll(navbar) {
  let scrollPosition = window.scrollY;
  let isScrolled = scrollPosition > 40;
  
  if (isScrolled) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

function closeHamburgerMenu(hamburger, navLinks) {
  hamburger.classList.remove('open');
  navLinks.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
}

function toggleHamburgerMenu(hamburger, navLinks) {
  let isOpen = hamburger.classList.contains('open');
  
  if (isOpen) {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  } else {
    hamburger.classList.add('open');
    navLinks.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
  }
}

function setActiveNavLink(navLinks) {
  let currentPage = window.location.pathname.split('/').pop();
  if (!currentPage) {
    currentPage = 'index.html';
  }

  let links = navLinks.querySelectorAll('a[href]');
  for (let i = 0; i < links.length; i += 1) {
    let link = links[i];
    let href = link.getAttribute('href');
    
    if (href === currentPage) {
      link.classList.add('nav-active');
    } else {
      link.classList.remove('nav-active');
    }
  }
}

// Main navbar initialization
function initNavBar() {
  let elements = getNavbarElements();
  let navbar = elements.navbar;
  let hamburger = elements.hamburger;
  let navLinks = elements.navLinks;

  // If any element is missing, exit
  if (!navbar || !hamburger || !navLinks) {
    return;
  }

  // Add scroll listener to update navbar style
  window.addEventListener('scroll', function () {
    updateNavbarOnScroll(navbar);
  }, { passive: true });

  // Initial navbar update
  updateNavbarOnScroll(navbar);

  // Toggle menu when hamburger is clicked
  hamburger.addEventListener('click', function () {
    toggleHamburgerMenu(hamburger, navLinks);
  });

  // Close menu when any nav link is clicked
  let navItems = navLinks.querySelectorAll('a');
  for (let i = 0; i < navItems.length; i += 1) {
    navItems[i].addEventListener('click', function () {
      closeHamburgerMenu(hamburger, navLinks);
    });
  }

  // Mark current page link as active
  setActiveNavLink(navLinks);
}

// Set footer year to current year
function setFooterYear() {
  let yearEl = document.getElementById('year');
  if (yearEl) {
    let currentYear = new Date().getFullYear();
    yearEl.textContent = currentYear;
  }
}

// Initialize when script loads
initNavBar();
setFooterYear();
