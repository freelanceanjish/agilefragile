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

  var progressLabels = ['Starting', 'Going', 'Halfway', 'Keep going', 'Almost there', 'Nearly done', 'Last stretch', 'Final'];

  function updateProgress() {
    bar.style.width = ((current / total) * 100) + '%';
    counter.textContent = current < total
      ? progressLabels[current]
      : 'Done';
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
      label = 'Dark Agile';
      desc = 'Your organization performs agility more than it practices it. People are paying the price. Name it before you scale again.';
      ctaPrimary.textContent = 'Read the field notes';
      ctaPrimary.href = '/about.html#observation';
    } else if (pct <= 70) {
      label = 'Transitional';
      desc = 'You have not forgotten the human — but delivery pressure still breaks people in places. Reinforce before you scale.';
      ctaPrimary.textContent = 'See the Human Agile Model';
      ctaPrimary.href = '/model.html';
    } else {
      label = 'Human Agile';
      desc = 'Humans are in the design. Now protect that as budgets tighten and speed returns.';
      ctaPrimary.textContent = 'How we work with organizations';
      ctaPrimary.href = '/how-we-work.html';
    }

    document.getElementById('index-score-num').textContent = pct + '%';
    document.getElementById('index-score-label').textContent = label;
    document.getElementById('index-score-desc').textContent = desc;

    questionsEl.style.display = 'none';
    document.querySelector('.index-meta').style.display = 'none';
    resultEl.classList.add('visible');
    bar.style.width = '100%';
    counter.textContent = 'Done';
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
    ctaPrimary.textContent = 'Read the field notes';
    ctaPrimary.href = '/about.html#observation';
    showQuestion(0);
  });

  updateProgress();
})();
