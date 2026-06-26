document.querySelectorAll('[data-card]').forEach(function (card) {
  var btn = card.querySelector('.flip-btn');
  if (btn) {
    btn.addEventListener('click', function () {
      card.classList.toggle('flipped');
    });
  }
});

document.querySelectorAll('[data-form]').forEach(function (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var section = form.closest('.form-section');
    if (section) section.classList.add('submitted');
  });
});
