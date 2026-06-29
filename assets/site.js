document.querySelectorAll('[data-card]').forEach(function (card) {
  var btn = card.querySelector('.flip-btn');
  if (btn) {
    btn.addEventListener('click', function () {
      card.classList.toggle('flipped');
    });
  }
});

var header = document.querySelector('.site-header');
var navToggle = document.querySelector('.nav-toggle');
if (header && navToggle) {
  navToggle.addEventListener('click', function () {
    var open = header.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  header.querySelectorAll('.header-links a').forEach(function (link) {
    link.addEventListener('click', function () {
      header.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
    });
  });
}

document.querySelectorAll('[data-form]').forEach(function (form) {
  var action = form.getAttribute('action');
  var section = form.closest('.form-section');
  var button = form.querySelector('button[type="submit"]');
  var defaultLabel = button ? button.textContent : '';

  if (!action || action === '#') {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (section) section.classList.add('submitted');
    });
    return;
  }

  var endpoint = action.replace('https://formsubmit.co/', 'https://formsubmit.co/ajax/');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (section) section.classList.remove('has-error');
    if (button) {
      button.disabled = true;
      button.textContent = button.dataset.sending || 'Sending…';
    }

    fetch(endpoint, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then(function (res) {
        if (!res.ok) throw new Error('send failed');
        if (section) section.classList.add('submitted');
        form.reset();
      })
      .catch(function () {
        if (section) section.classList.add('has-error');
      })
      .finally(function () {
        if (button) {
          button.disabled = false;
          button.textContent = defaultLabel;
        }
      });
  });
});
