(function () {
  var hero = document.querySelector('[data-home-hero]');
  if (!hero) return;

  var pin = document.getElementById('hero-pin');
  var wordmarkWrap = document.getElementById('hero-wordmark-wrap');
  var panel = document.getElementById('hero-panel');
  var masks = hero.querySelectorAll('.landing-hero-mask');
  var slides = hero.querySelectorAll('.landing-hero-slide');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!pin || !wordmarkWrap || !panel) return;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function mapRange(value, inMin, inMax, outMin, outMax) {
    if (inMax === inMin) return outMin;
    var t = clamp((value - inMin) / (inMax - inMin), 0, 1);
    return outMin + (outMax - outMin) * t;
  }

  function isMobile() {
    return window.innerWidth < 600;
  }

  function scrollProgress() {
    var vh = window.innerHeight;
    var range = pin.offsetHeight - vh;
    if (range <= 0) return 0;
    return clamp(-pin.getBoundingClientRect().top / range, 0, 1);
  }

  function updateMasks(panelHeight) {
    masks.forEach(function (mask) {
      var maskHeight = mask.getBoundingClientRect().height;
      if (!maskHeight) return;
      var axis = mask.dataset.axis || 'y';
      var scale = Math.min(1, panelHeight / (2 * maskHeight));
      if (axis === 'x') {
        mask.style.transform = 'scaleX(' + scale + ')';
      } else {
        mask.style.transform = 'scaleY(' + scale + ')';
      }
    });
  }

  function updateSlides(progress) {
    var mobile = isMobile();
    var end = mobile ? 0.5 : 1;
    if (progress <= 0.05 || progress >= end - 0.05 || !slides.length) {
      slides.forEach(function (slide) { slide.classList.remove('is-active'); });
      return;
    }
    var step = (end - 0.1) / slides.length;
    var index = 0;
    for (var i = 0; i < slides.length; i += 1) {
      if (progress > 0.05 + step * i) index = i;
    }
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === index);
    });
  }

  function update() {
    var vh = window.innerHeight;
    var mobile = isMobile();
    var progress = scrollProgress();

    if (reduced) {
      wordmarkWrap.style.transform = '';
      panel.style.transform = '';
      panel.style.height = mobile ? (vh * 0.45) + 'px' : (vh * 0.5) + 'px';
      slides[0] && slides[0].classList.add('is-active');
      document.body.classList.add('home-header-visible');
      return;
    }

    var wordmarkY = mapRange(progress, 0, 0.5, 0, mobile ? vh / 8 : vh / 2);
    wordmarkWrap.style.transform = 'translate3d(0,' + wordmarkY + 'px,0)';

    var panelHeight;
    if (progress <= 0.5) {
      panelHeight = mapRange(progress, 0, 0.5, vh / 2, vh - 20);
    } else {
      panelHeight = mapRange(progress, 0.5, 1, vh - 20, 0);
    }
    panel.style.height = Math.max(0, panelHeight) + 'px';

    if (mobile) {
      panel.style.transform = '';
      panel.classList.remove('is-top', 'is-bottom');
    } else {
      var panelY = mapRange(progress, 0, 0.5, 200, 0);
      panel.style.transform = 'translate3d(0,' + panelY + 'px,0)';
      panel.classList.toggle('is-bottom', progress <= 0.5);
      panel.classList.toggle('is-top', progress > 0.5);
    }

    updateMasks(panel.offsetHeight);
    updateSlides(progress);

    document.body.classList.toggle('home-header-visible', progress > 0.32);
  }

  var ticking = false;
  function onFrame() {
    update();
    ticking = false;
  }

  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onFrame);
    }
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  update();
})();
