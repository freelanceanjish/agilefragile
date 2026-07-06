(function () {
  var questions = document.querySelectorAll('.index-question');
  if (!questions.length) return;

  var total = questions.length;
  var current = 0;
  var scores = [];
  var answerLabels = [];
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
  var reportForm = document.getElementById('index-score-report');
  var reportStatus = document.getElementById('index-report-status');
  var resultName = document.getElementById('index-result-name');
  var resultEmail = document.getElementById('index-result-email');
  var resultOrg = document.getElementById('index-result-org');
  var reportEndpoint = 'https://formsubmit.co/ajax/57204796c707cbb81e1252017cac8686';

  var progressLabels = ['Starting', 'Going', 'Halfway', 'Keep going', 'Almost there', 'Nearly done', 'Last stretch', 'Final'];
  var lastPct = 0;
  var lastLabel = '';
  var reportSent = false;
  var reportTimer = null;
  var reportDelayMs = 3000;

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

  function questionSummary() {
    var lines = [];
    questions.forEach(function (q, i) {
      var text = q.querySelector('.question-text');
      var question = text ? text.textContent.trim() : 'Question ' + (i + 1);
      var answer = answerLabels[i] || 'No answer';
      lines.push((i + 1) + '. ' + question + ' → ' + answer + ' (' + (scores[i] != null ? scores[i] : '-') + '/3)');
    });
    return lines.join('\n');
  }

  function setReportStatus(message) {
    if (!reportStatus) return;
    reportStatus.textContent = message;
  }

  function populateReportFields(pct, label) {
    if (!reportForm) return;

    document.getElementById('report-score').value = pct + '%';
    document.getElementById('report-label').value = label;
    document.getElementById('report-answers').value = questionSummary();
    document.getElementById('report-time').value = new Date().toISOString();
    document.getElementById('report-url').value = window.location.href;
    document.getElementById('report-name').value = resultName && resultName.value ? resultName.value.trim() : '';
    document.getElementById('report-email').value = resultEmail && resultEmail.value ? resultEmail.value.trim() : '';
    document.getElementById('report-org').value = resultOrg && resultOrg.value ? resultOrg.value.trim() : '';
  }

  function sendIndexReport(pct, label) {
    if (reportSent || !reportForm) return;

    populateReportFields(pct, label);
    setReportStatus('Sending your score to Agile Fragile…');

    fetch(reportEndpoint, {
      method: 'POST',
      body: new FormData(reportForm),
      headers: { Accept: 'application/json' }
    })
      .then(function (res) {
        if (!res.ok) throw new Error('send failed');
        reportSent = true;
        setReportStatus('Score sent to hello@agilefragile.com.');
      })
      .catch(function () {
        setReportStatus('Could not send automatically. Email hello@agilefragile.com with your score.');
      });
  }

  function scheduleIndexReport(pct, label) {
    if (reportTimer) clearTimeout(reportTimer);
    reportSent = false;
    setReportStatus('Sending your score in a few seconds. Add optional details above if you want them included.');
    reportTimer = setTimeout(function () {
      sendIndexReport(pct, label);
    }, reportDelayMs);
  }

  function cancelScheduledReport() {
    if (reportTimer) {
      clearTimeout(reportTimer);
      reportTimer = null;
    }
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
    scheduleIndexReport(pct, label);
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
      answerLabels[current] = btn.textContent.trim();
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
    answerLabels = [];
    reportSent = false;
    cancelScheduledReport();
    setReportStatus('');
    if (resultName) resultName.value = '';
    if (resultEmail) resultEmail.value = '';
    if (resultOrg) resultOrg.value = '';
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

  [resultName, resultEmail, resultOrg].forEach(function (field) {
    if (!field) return;
    field.addEventListener('input', function () {
      if (!resultEl.classList.contains('visible') || reportSent) return;
      cancelScheduledReport();
      reportTimer = setTimeout(function () {
        sendIndexReport(lastPct, lastLabel);
      }, 1200);
    });
  });

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
