(function () {
  var questions = document.querySelectorAll('.index-question');
  if (!questions.length) return;

  var total = questions.length;
  var current = 0;
  var scores = [];
  var bar = document.getElementById('index-bar');
  var counter = document.getElementById('index-counter');
  var questionsEl = document.getElementById('index-questions');
  var resultEl = document.getElementById('index-result');
  var ctaPrimary = document.getElementById('index-cta-primary');

  function updateProgress() {
    bar.style.width = ((current / total) * 100) + '%';
    counter.textContent = current < total
      ? 'Question ' + (current + 1) + ' of ' + total
      : 'Complete';
  }

  function showQuestion(n) {
    questions.forEach(function (q, i) {
      q.classList.toggle('active', i === n);
    });
    updateProgress();
  }

  function showResult() {
    var sum = scores.reduce(function (a, b) { return a + b; }, 0);
    var pct = Math.round((sum / (total * 3)) * 100);
    var label, desc;

    if (pct <= 40) {
      label = 'Violent Agile';
      desc = 'Product over people. The drift is deep. Name it before you scale again.';
      ctaPrimary.textContent = 'Read where we drifted';
      ctaPrimary.href = '/about.html#drift';
    } else if (pct <= 70) {
      label = 'Transitional';
      desc = 'You remember the customer. The deliverers are still breaking in places.';
      ctaPrimary.textContent = 'See the Human Agile Model';
      ctaPrimary.href = '/model.html';
    } else {
      label = 'Human Agile';
      desc = 'Humans on both sides of the product. Now protect that as you grow.';
      ctaPrimary.textContent = 'How we help you scale';
      ctaPrimary.href = '/how-we-work.html';
    }

    document.getElementById('index-score-num').textContent = pct + '%';
    document.getElementById('index-score-label').textContent = label;
    document.getElementById('index-score-desc').textContent = desc;

    questionsEl.style.display = 'none';
    document.querySelector('.index-meta').style.display = 'none';
    resultEl.classList.add('visible');
    bar.style.width = '100%';
    counter.textContent = 'Complete';
  }

  document.querySelectorAll('.index-opt').forEach(function (btn) {
    btn.addEventListener('click', function () {
      scores[current] = parseInt(btn.getAttribute('data-score'), 10);
      current++;
      if (current < total) {
        showQuestion(current);
      } else {
        showResult();
      }
    });
  });

  document.getElementById('index-restart').addEventListener('click', function () {
    current = 0;
    scores = [];
    questionsEl.style.display = 'block';
    document.querySelector('.index-meta').style.display = 'flex';
    resultEl.classList.remove('visible');
    ctaPrimary.textContent = 'Read where we drifted';
    ctaPrimary.href = '/about.html#drift';
    showQuestion(0);
  });

  updateProgress();
})();
