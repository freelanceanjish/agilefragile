(function () {
  var walk = document.querySelector('.model-walk');
  if (walk) {
    var btns = walk.querySelectorAll('.model-step-btn');
    var panels = walk.querySelectorAll('.model-step-panel');

    function activate(step) {
      btns.forEach(function (btn) {
        var on = btn.getAttribute('data-step') === String(step);
        btn.classList.toggle('active', on);
        btn.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      panels.forEach(function (panel) {
        var on = panel.getAttribute('data-step-panel') === String(step);
        panel.classList.toggle('active', on);
        panel.hidden = !on;
      });
    }

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        activate(btn.getAttribute('data-step'));
      });
    });
  }
})();
