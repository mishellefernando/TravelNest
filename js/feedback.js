/* ============================================================
   TravelNest – Feedback Form + FAQ Accordion
   ============================================================ */
'use strict';

let FB_KEY = 'tn_feedback';
let form = document.getElementById('feedbackForm');
let successMessage = document.getElementById('formSuccess');
let submissionCount = document.getElementById('submissionCount');

let validationRules = {
  fbName: {
    fg: 'fg-name',
    err: 'err-name',
    validate: function (value) {
      let trimmed = value.trim();

      if (trimmed === '') {
        return 'Name is required.';
      }
      if (trimmed.length < 2) {
        return 'Name must be at least 2 characters.';
      }
      if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
        return 'Name can only contain letters, spaces, hyphens, and apostrophes.';
      }
      return null;
    },
  },
  fbEmail: {
    fg: 'fg-email',
    err: 'err-email',
    validate: function (value) {
      let trimmed = value.trim();

      if (trimmed === '') {
        return 'Email is required.';
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
        return 'Please enter a valid email address (e.g. jane@example.com).';
      }
      return null;
    },
  },
  fbSubject: {
    fg: 'fg-subject',
    err: 'err-subject',
    validate: function (value) {
      if (value === '' || value === null) {
        return 'Please select a topic.';
      }
      return null;
    },
  },
  fbMessage: {
    fg: 'fg-message',
    err: 'err-message',
    validate: function (value) {
      let trimmed = value.trim();

      if (trimmed === '') {
        return 'Message is required.';
      }
      if (trimmed.length < 20) {
        return 'Message must be at least 20 characters (' + trimmed.length + '/20).';
      }
      if (trimmed.length > 2000) {
        return 'Message must not exceed 2000 characters.';
      }
      return null;
    },
  },
};

function getElement(id) {
  return document.getElementById(id);
}

function clearFieldState(fieldId) {
  let rule = validationRules[fieldId];
  let fieldGroup = getElement(rule.fg);
  let errorElement = getElement(rule.err);

  if (fieldGroup) {
    fieldGroup.classList.remove('has-error');
    fieldGroup.classList.remove('is-valid');
  }

  if (errorElement) {
    errorElement.textContent = '';
  }
}

function validateField(fieldId) {
  let rule = validationRules[fieldId];
  let field = getElement(fieldId);
  let fieldGroup = getElement(rule.fg);
  let errorElement = getElement(rule.err);
  let errorMessage = rule.validate(field.value);

  if (fieldGroup) {
    if (errorMessage) {
      fieldGroup.classList.add('has-error');
      fieldGroup.classList.remove('is-valid');
    } else {
      fieldGroup.classList.remove('has-error');
      fieldGroup.classList.add('is-valid');
    }
  }

  if (errorElement) {
    errorElement.textContent = errorMessage || '';
  }

  return !errorMessage;
}

function addValidationListeners() {
  let fieldIds = Object.keys(validationRules);

  for (let i = 0; i < fieldIds.length; i += 1) {
    let fieldId = fieldIds[i];
    let field = getElement(fieldId);

    if (!field) {
      continue;
    }

    field.addEventListener('blur', function (event) {
      validateField(event.target.id);
    });

    field.addEventListener('input', function (event) {
      let id = event.target.id;
      let fieldGroup = getElement(validationRules[id].fg);
      if (fieldGroup && fieldGroup.classList.contains('has-error')) {
        validateField(id);
      }
    });
  }
}

function getSubmissions() {
  try {
    let saved = localStorage.getItem(FB_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function updateSubmissionCount() {
  if (!submissionCount) {
    return;
  }

  let submissions = getSubmissions();
  let count = submissions.length;

  if (count === 0) {
    submissionCount.textContent = '';
    return;
  }

  let text = count + ' message';
  if (count !== 1) {
    text += 's';
  }
  text += ' submitted so far.';
  submissionCount.textContent = text;
}

function showSuccessMessage() {
  if (!form || !successMessage) {
    return;
  }

  form.reset();

  let fieldIds = Object.keys(validationRules);
  for (let i = 0; i < fieldIds.length; i += 1) {
    clearFieldState(fieldIds[i]);
  }

  successMessage.classList.add('visible');
  updateSubmissionCount();
  form.style.display = 'none';
  successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function submitFeedback(event) {
  event.preventDefault();

  let fieldIds = Object.keys(validationRules);
  let formIsValid = true;

  for (let i = 0; i < fieldIds.length; i += 1) {
    if (!validateField(fieldIds[i])) {
      formIsValid = false;
    }
  }

  if (!formIsValid) {
    let firstError = form.querySelector('.has-error input, .has-error select, .has-error textarea');
    if (firstError) {
      firstError.focus();
    }
    return;
  }

  let entry = {
    id: Date.now(),
    name: getElement('fbName').value.trim(),
    email: getElement('fbEmail').value.trim(),
    subject: getElement('fbSubject').value,
    message: getElement('fbMessage').value.trim(),
    date: new Date().toISOString(),
  };

  let submissions = getSubmissions();
  submissions.unshift(entry);
  localStorage.setItem(FB_KEY, JSON.stringify(submissions));

  showSuccessMessage();
}

if (form) {
  addValidationListeners();
  form.addEventListener('submit', submitFeedback);
}

updateSubmissionCount();

/* ============================================================
   FAQ ACCORDION
   Pure JS toggle — no CSS :checked hack
   ============================================================ */
let FAQ_DATA = [
  {
    q: 'How does the Destination of the Day work?',
    a: 'Each day, our algorithm picks a destination from our curated list based on the current date. The pick changes every midnight and stays consistent throughout the day regardless of your timezone.',
  },
  {
    q: 'Is my data stored on your servers?',
    a: 'No. TravelNest stores all your personal data — saved plans, wishlist, tracker state, and feedback — entirely in your browser\'s localStorage. Nothing is transmitted to any server. Clearing your browser data will erase it.',
  },
  {
    q: 'How does the Budget Calculator determine trip status?',
    a: 'We classify your trip based on your daily budget per person: under $100/day is Budget, $100–$300/day is Moderate, and above $300/day is Luxury. The progress bar maps your daily budget against a $600/day maximum.',
  },
  {
    q: 'How are the ambient sounds generated?',
    a: 'All ambient sounds are synthesised in real-time directly in your browser using the Web Audio API. No audio files are downloaded. We use layered filtered noise, oscillators, and low-frequency modulation to create each soundscape.',
  },
  {
    q: 'Can I save and share my travel plans?',
    a: 'Currently, plans are saved locally in your browser. You can save up to 10 budget plans and an unlimited wishlist. Cross-device sharing will be available in a future update.',
  },
  {
    q: 'How does the Random Trip Generator pick destinations?',
    a: 'The generator filters our destination library by your selected Travel Type and Budget Range, then picks randomly from the matching results. If your filters are very narrow and no results match, it falls back to the full list. It also avoids recommending the same destination twice in a row.',
  },
  {
    q: 'Is TravelNest available as an app?',
    a: 'Yes — TravelNest is a Progressive Web App (PWA). You can install it to your home screen from your browser\'s menu on both Android and iOS for an app-like offline experience.',
  },
  {
    q: 'How do I suggest a new destination?',
    a: 'We\'d love to hear your suggestions! Use the Feedback form above and select "Destination Suggestion" from the subject dropdown. Tell us the destination name, country, and why you think it should be featured.',
  },
];

let faqList = document.getElementById('faqList');

if (faqList) {
  for (let i = 0; i < FAQ_DATA.length; i += 1) {
    let item = FAQ_DATA[i];
    let li = document.createElement('li');
    li.className = 'faq-item';

    let button = document.createElement('button');
    button.className = 'faq-question';
    button.id = 'faq-q-' + i;
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', 'faq-a-' + i);
    button.innerHTML = '<span>' + item.q + '</span><span class="faq-icon" aria-hidden="true">+</span>';

    let answer = document.createElement('div');
    answer.className = 'faq-answer';
    answer.id = 'faq-a-' + i;
    answer.setAttribute('role', 'region');
    answer.setAttribute('aria-labelledby', 'faq-q-' + i);
    answer.textContent = item.a;

    button.addEventListener('click', function () {
      let openAnswer = this.nextElementSibling;
      let isOpen = openAnswer.classList.contains('open');
      let answers = faqList.querySelectorAll('.faq-answer.open');

      for (let j = 0; j < answers.length; j += 1) {
        answers[j].classList.remove('open');
        if (answers[j].previousElementSibling) {
          answers[j].previousElementSibling.setAttribute('aria-expanded', 'false');
        }
      }

      if (!isOpen) {
        openAnswer.classList.add('open');
        this.setAttribute('aria-expanded', 'true');
      }
    });

    li.appendChild(button);
    li.appendChild(answer);
    faqList.appendChild(li);
  }
}
