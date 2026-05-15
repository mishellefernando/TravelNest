/* ============================================================
   TravelNest – Feedback Form + FAQ Accordion
   ============================================================ */
'use strict';

const FB_KEY = 'tn_feedback';

/* ============================================================
   FORM VALIDATION
   ============================================================ */
const form     = document.getElementById('feedbackForm');
const success  = document.getElementById('formSuccess');
const countEl  = document.getElementById('submissionCount');

const rules = {
  fbName: {
    fg: 'fg-name', err: 'err-name',
    validate(v) {
      if (!v.trim()) return 'Name is required.';
      if (v.trim().length < 2) return 'Name must be at least 2 characters.';
      if (!/^[a-zA-Z\s'-]+$/.test(v.trim())) return 'Name can only contain letters, spaces, hyphens, and apostrophes.';
      return null;
    },
  },
  fbEmail: {
    fg: 'fg-email', err: 'err-email',
    validate(v) {
      if (!v.trim()) return 'Email is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Please enter a valid email address (e.g. jane@example.com).';
      return null;
    },
  },
  fbSubject: {
    fg: 'fg-subject', err: 'err-subject',
    validate(v) {
      if (!v) return 'Please select a topic.';
      return null;
    },
  },
  fbMessage: {
    fg: 'fg-message', err: 'err-message',
    validate(v) {
      if (!v.trim()) return 'Message is required.';
      if (v.trim().length < 20) return `Message must be at least 20 characters (${v.trim().length}/20).`;
      if (v.trim().length > 2000) return 'Message must not exceed 2000 characters.';
      return null;
    },
  },
};

function clearFieldState(fieldId) {
  const rule  = rules[fieldId];
  const fg    = document.getElementById(rule.fg);
  const errEl = document.getElementById(rule.err);
  fg.classList.remove('has-error', 'is-valid');
  errEl.textContent = '';
}

function validateField(fieldId) {
  const rule   = rules[fieldId];
  const field  = document.getElementById(fieldId);
  const fg     = document.getElementById(rule.fg);
  const errEl  = document.getElementById(rule.err);
  const error  = rule.validate(field.value);

  fg.classList.toggle('has-error', !!error);
  fg.classList.toggle('is-valid',  !error);
  errEl.textContent = error || '';
  return !error;
}

// Live validation on blur
Object.keys(rules).forEach(id => {
  const field = document.getElementById(id);
  field.addEventListener('blur', () => validateField(id));
  field.addEventListener('input', () => {
    if (document.getElementById(rules[id].fg).classList.contains('has-error')) {
      validateField(id);
    }
  });
});

// Submit
form.addEventListener('submit', e => {
  e.preventDefault();

  const valid = Object.keys(rules).map(id => validateField(id)).every(Boolean);
  if (!valid) {
    const firstError = form.querySelector('.has-error input, .has-error select, .has-error textarea');
    if (firstError) firstError.focus();
    return;
  }

  const entry = {
    id:      Date.now(),
    name:    document.getElementById('fbName').value.trim(),
    email:   document.getElementById('fbEmail').value.trim(),
    subject: document.getElementById('fbSubject').value,
    message: document.getElementById('fbMessage').value.trim(),
    date:    new Date().toISOString(),
  };

  const all = getSubmissions();
  all.unshift(entry);
  localStorage.setItem(FB_KEY, JSON.stringify(all));

  // Show success
  form.reset();
  Object.keys(rules).forEach(id => clearFieldState(id));
  success.classList.add('visible');
  updateCount();

  form.style.display = 'none';
  success.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

function getSubmissions() {
  try { return JSON.parse(localStorage.getItem(FB_KEY)) || []; } catch { return []; }
}

function updateCount() {
  const n = getSubmissions().length;
  countEl.textContent = n > 0
    ? `${n} message${n !== 1 ? 's' : ''} submitted so far.`
    : '';
}

updateCount();

/* ============================================================
   FAQ ACCORDION
   Pure JS toggle — no CSS :checked hack
   ============================================================ */
const FAQ_DATA = [
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

const faqList = document.getElementById('faqList');

FAQ_DATA.forEach((item, i) => {
  const li = document.createElement('li');
  li.className = 'faq-item';

  const btn = document.createElement('button');
  btn.className = 'faq-question';
  btn.id        = `faq-q-${i}`;
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', `faq-a-${i}`);
  btn.innerHTML = `<span>${item.q}</span><span class="faq-icon" aria-hidden="true">+</span>`;

  const answer = document.createElement('div');
  answer.className = 'faq-answer';
  answer.id        = `faq-a-${i}`;
  answer.setAttribute('role', 'region');
  answer.setAttribute('aria-labelledby', `faq-q-${i}`);
  answer.textContent = item.a;

  btn.addEventListener('click', () => {
    const isOpen = answer.classList.contains('open');

    // Close all others
    faqList.querySelectorAll('.faq-answer.open').forEach(a => {
      a.classList.remove('open');
      a.previousElementSibling.setAttribute('aria-expanded', 'false');
    });

    // Toggle clicked
    if (!isOpen) {
      answer.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });

  li.appendChild(btn);
  li.appendChild(answer);
  faqList.appendChild(li);
});
