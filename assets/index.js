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
  var ctaContact = document.getElementById('index-cta-contact');
  var feedbackScore = document.getElementById('feedback-score');
  var feedbackLabel = document.getElementById('feedback-label');
  var shareBtn = document.getElementById('index-share');
  var shareNote = document.getElementById('index-share-note');

  var progressLabels = ['Starting', 'Going', 'Halfway', 'Keep going', 'Almost there', 'Nearly done', 'Last stretch', 'Final'];
  var lastPct = 0;
  var lastLabel = '';

  function updateProgress() {
    bar.style.width = ((current / total) * 100) + '%';
    counter.textContent = current < total ? progressLabels[current] : 'Done';
  }

  function showQuestion(n) {
    questions.forEach(function (q, i) {
      q.classList.toggle('active', i === n);
    });
    updateProgress();
  }

  function contactUrl(pct, label) {
    return '/contact.html?score=' + encodeURIComponent(pct) + '&label=' + encodeURIComponent(label);
  }

  function shareUrl(pct, label) {
    var base = window.location.origin + window.location.pathname;
    return base + '?score=' + encodeURIComponent(pct) + '&label=' + encodeURIComponent(label) + '#index';
  }

  function applyResult(pct, label, desc) {
    lastPct = pct;
    lastLabel = label;

    document.getElementById('index-score-num').textContent = pct + '%';
    document.getElementById('index-score-label').textContent = label;
    document.getElementById('index-score-desc').textContent = desc;

    if (feedbackScore) feedbackScore.value = pct + '%';
    if (feedbackLabel) feedbackLabel.value = label;
    if (ctaContact) ctaContact.href = contactUrl(pct, label);

    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', shareUrl(pct, label));
    }
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
      desc = 'You have not forgotten the human, but delivery pressure still breaks people in places. Reinforce before you scale.';
      ctaPrimary.textContent = 'See the Human Agile Model';
      ctaPrimary.href = '/model.html#model-walk';
    } else {
      label = 'Human Agile';
      desc = 'Humans are in the design. Now protect that as budgets tighten and speed returns.';
      ctaPrimary.textContent = 'Read the proposal';
      ctaPrimary.href = '/how-we-work.html#proposal-pulse';
    }

    applyResult(pct, label, desc);

    questionsEl.style.display = 'none';
    document.querySelector('.index-meta').style.display = 'none';
    resultEl.classList.add('visible');
    bar.style.width = '100%';
    counter.textContent = 'Done';
  }

  function showResultFromParams(pct, label) {
    var desc;
    if (label === 'Dark Agile') {
      desc = 'Your organization performs agility more than it practices it. People are paying the price. Name it before you scale again.';
      ctaPrimary.textContent = 'Read the field notes';
      ctaPrimary.href = '/about.html#observation';
    } else if (label === 'Human Agile') {
      desc = 'Humans are in the design. Now protect that as budgets tighten and speed returns.';
      ctaPrimary.textContent = 'Read the proposal';
      ctaPrimary.href = '/how-we-work.html#proposal-pulse';
    } else {
      label = label || 'Transitional';
      desc = 'You have not forgotten the human, but delivery pressure still breaks people in places. Reinforce before you scale.';
      ctaPrimary.textContent = 'See the Human Agile Model';
      ctaPrimary.href = '/model.html#model-walk';
    }
    applyResult(pct, label, desc);
    questionsEl.style.display = 'none';
    document.querySelector('.index-meta').style.display = 'none';
    resultEl.classList.add('visible');
    bar.style.width = '100%';
    counter.textContent = 'Shared score';
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
    if (shareNote) shareNote.hidden = true;
    ctaPrimary.textContent = 'Read the model';
    ctaPrimary.href = '/model.html';
    if (ctaContact) ctaContact.href = '/contact.html';
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname + '#index');
    }
    showQuestion(0);
  });

  if (shareBtn) {
    shareBtn.addEventListener('click', function () {
      var url = shareUrl(lastPct, lastLabel);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () {
          if (shareNote) shareNote.hidden = false;
        });
      } else {
        window.prompt('Copy this link:', url);
      }
    });
  }

  var params = new URLSearchParams(window.location.search);
  var sharedScore = params.get('score');
  var sharedLabel = params.get('label');
  if (sharedScore && sharedLabel && window.location.hash === '#index') {
    var pct = parseInt(sharedScore, 10);
    if (!isNaN(pct)) showResultFromParams(pct, decodeURIComponent(sharedLabel));
  } else {
    updateProgress();
  }
})();
