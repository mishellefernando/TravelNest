'use strict';

function getElement(id) {
  return document.getElementById(id);
}

function initQuotes() {
  // Array of travel quotes to rotate through
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

  // Display a quote at the given index
  function displayQuote(index) {
    let quote = quotes[index];
    
    // Add fade effect
    quoteText.parentElement.classList.add('fade');

    // After fade animation, update the quote text
    setTimeout(function () {
      let textWithLineBreaks = quote.text.replace(/\n/g, '<br />');
      quoteText.innerHTML = textWithLineBreaks;
      quoteAuthor.textContent = quote.author;
      quoteText.parentElement.classList.remove('fade');
    }, 400);

    // Update dot indicators - only the current dot should be active
    let allDots = dotsWrap.querySelectorAll('.qdot');
    for (let i = 0; i < allDots.length; i += 1) {
      if (i === index) {
        allDots[i].classList.add('active');
      } else {
        allDots[i].classList.remove('active');
      }
    }
  }

  // Move to a specific quote
  function goToQuote(index, shouldResetTimer) {
    currentIndex = index;
    displayQuote(currentIndex);

    // If timer should be reset, restart the auto-rotation
    if (shouldResetTimer) {
      clearInterval(timerId);
      timerId = setInterval(showNextQuote, 5000);
    }
  }

  // Show the next quote in the list (with wrap-around)
  function showNextQuote() {
    currentIndex = currentIndex + 1;
    if (currentIndex >= quotes.length) {
      currentIndex = 0;
    }
    displayQuote(currentIndex);
  }

  // Create dot buttons (one for each quote)
  for (let i = 0; i < quotes.length; i += 1) {
    let dotButton = document.createElement('button');
    dotButton.className = 'qdot';
    
    // First dot starts as active
    if (i === 0) {
      dotButton.classList.add('active');
    }
    
    dotButton.setAttribute('aria-label', 'Quote ' + (i + 1));
    
    // Store the quote index as a data attribute
    dotButton.dataset.quoteIndex = i;
    
    // Add click listener - use arrow function OR explicitly pass the index
    let quoteIndexToShow = i;
    dotButton.addEventListener('click', function () {
      goToQuote(quoteIndexToShow, true);
    });
    
    dotsWrap.appendChild(dotButton);
  }

  // Start the auto-rotation (change quote every 5 seconds)
  timerId = setInterval(showNextQuote, 5000);

  // Display the first quote
  displayQuote(currentIndex);
}

// ============================================================
// DESTINATION OF THE DAY
// ============================================================

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

  // Calculate which day of the year it is
  let today = new Date();
  let startOfYear = new Date(today.getFullYear(), 0, 0);
  let millisecondsInDay = 86400000; // 1000 * 60 * 60 * 24
  let dayOfYear = Math.floor((today - startOfYear) / millisecondsInDay);
  
  // Use modulo to pick a destination - same destination each day
  let todayIndex = dayOfYear % destinations.length;
  let todayDestination = destinations[todayIndex];

  // Fill in the "Destination of the Day" header section
  getElement('dotdDestName').textContent = todayDestination.name + ', ' + todayDestination.country;
  getElement('dotdRating').textContent = '★ ' + todayDestination.rating;
  getElement('dotdTitle').textContent = todayDestination.name;
  getElement('dotdDescription').textContent = 'Today we\'re shining the spotlight on ' + todayDestination.name + ', ' + todayDestination.country + '. A destination that captivates every traveller.';

  // Get the grid where cards will be displayed
  let grid = getElement('dotdGrid');

  // Collect 3 other destinations to show alongside today's destination
  let otherDestinations = [];
  for (let i = 0; i < destinations.length; i += 1) {
    if (i !== todayIndex) {
      otherDestinations.push(destinations[i]);
    }
    if (otherDestinations.length === 3) {
      break;
    }
  }

  // Combine today's destination with 3 others
  let cardsToDisplay = [todayDestination].concat(otherDestinations);

  // Create and display each card
  for (let j = 0; j < cardsToDisplay.length; j += 1) {
    let destination = cardsToDisplay[j];
    let isFirstCard = (j === 0);
    
    // Create the card container
    let card = document.createElement('div');
    card.className = 'dotd-card';

    // Create the image box
    let imageBox = document.createElement('div');
    imageBox.className = 'dotd-img';
    imageBox.style.backgroundImage = 'url(\'' + destination.img + '\')';
    imageBox.style.backgroundSize = 'cover';
    imageBox.style.backgroundPosition = 'center';
    
    // First card (today's destination) is larger
    if (isFirstCard) {
      imageBox.style.minHeight = '440px';
    } else {
      imageBox.style.minHeight = '200px';
    }

    // Create the caption (text overlay on image)
    let caption = document.createElement('div');
    caption.className = 'dotd-caption';
    let captionHTML = '<p class="dotd-name">' + destination.name + '</p>' +
                      '<p class="dotd-country">' + destination.country + ' · ★ ' + destination.rating + '</p>';
    caption.innerHTML = captionHTML;

    // Assemble the card
    card.appendChild(imageBox);
    card.appendChild(caption);
    
    // Add to grid
    grid.appendChild(card);
  }
}

// ============================================================
// NEWSLETTER SIGNUP
// ============================================================

function initNewsletter() {
  let form = getElement('newsletterForm');
  let input = getElement('emailInput');
  let messageBox = getElement('newsletterMsg');
  let countBox = getElement('subscriberCount');
  let STORAGE_KEY = 'tn_subscribers';

  if (!form) {
    return;
  }

  // Load all subscribers from browser storage
  function getAllSubscribers() {
    try {
      let stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  // Check if email is already subscribed
  function isEmailSubscribed(email) {
    let subscribers = getAllSubscribers();
    for (let i = 0; i < subscribers.length; i += 1) {
      if (subscribers[i] === email) {
        return true;
      }
    }
    return false;
  }

  // Add new subscriber to storage
  function addSubscriber(email) {
    let subscribers = getAllSubscribers();
    subscribers.push(email);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscribers));
  }

  // Display the count of subscribers
  function updateSubscriberCount() {
    let count = getAllSubscribers().length;
    if (count === 0) {
      countBox.textContent = '';
    } else {
      let plural = (count === 1) ? '' : 's';
      let formattedCount = count.toLocaleString();
      countBox.textContent = formattedCount + ' traveller' + plural + ' already subscribed.';
    }
  }

  // Show a temporary message to the user
  function showMessage(text, messageType) {
    messageBox.textContent = text;
    messageBox.className = 'newsletter-msg ' + messageType;
    
    // Auto-clear the message after 4 seconds
    setTimeout(function () {
      messageBox.textContent = '';
      messageBox.className = 'newsletter-msg';
    }, 4000);
  }

  // Validate email format
  function isValidEmail(email) {
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  // Initial display of subscriber count
  updateSubscriberCount();

  // Handle form submission
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    
    let emailValue = input.value.trim().toLowerCase();

    // Check if email is valid
    if (emailValue === '' || !isValidEmail(emailValue)) {
      showMessage('Please enter a valid email address.', 'error');
      input.focus();
      return;
    }

    // Check if already subscribed
    if (isEmailSubscribed(emailValue)) {
      showMessage('This email is already subscribed.', 'info');
      return;
    }

    // Add new subscriber and show success message
    addSubscriber(emailValue);
    input.value = '';
    showMessage('Thanks for subscribing! You will hear from us soon.', 'success');
    updateSubscriberCount();
  });
}

// Initialize all home page features
initQuotes();
initDotD();
initNewsletter();
