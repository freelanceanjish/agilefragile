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

  var layoutVh = window.innerHeight;
  var lastWidth = window.innerWidth;
  var headerVisible = false;
  var activeSlide = -1;

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
    var range = pin.offsetHeight - layoutVh;
    if (range <= 0) return 0;
    return clamp(-pin.getBoundingClientRect().top / range, 0, 1);
  }

  function updateHeader(progress) {
    var mobile = isMobile();
    var showAt = mobile ? 0.38 : 0.34;
    var hideAt = mobile ? 0.24 : 0.28;

    if (progress > showAt) {
      headerVisible = true;
    } else if (progress < hideAt) {
      headerVisible = false;
    }

    document.body.classList.toggle('home-header-visible', headerVisible);
  }

  function updateMasks(panelHeight) {
    if (isMobile()) return;

    masks.forEach(function (mask) {
      var maskHeight = mask.offsetHeight;
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

    if (progress <= 0.04 || progress >= end - 0.04 || !slides.length) {
      if (activeSlide !== -1) {
        slides.forEach(function (slide) { slide.classList.remove('is-active'); });
        activeSlide = -1;
      }
      return;
    }

    var step = (end - 0.1) / slides.length;
    var index = 0;
    for (var i = 0; i < slides.length; i += 1) {
      if (progress > 0.05 + step * (i + 0.5)) index = i;
    }

    if (index === activeSlide) return;

    activeSlide = index;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === activeSlide);
    });
  }

  function update() {
    var mobile = isMobile();
    var progress = scrollProgress();

    if (reduced) {
      wordmarkWrap.style.transform = '';
      panel.style.transform = '';
      panel.style.height = Math.round(mobile ? layoutVh * 0.45 : layoutVh * 0.5) + 'px';
      if (activeSlide !== 0 && slides[0]) {
        slides.forEach(function (slide) { slide.classList.remove('is-active'); });
        slides[0].classList.add('is-active');
        activeSlide = 0;
      }
      document.body.classList.add('home-header-visible');
      return;
    }

    var wordmarkY = Math.round(mapRange(progress, 0, 0.5, 0, mobile ? layoutVh / 8 : layoutVh / 2));
    wordmarkWrap.style.transform = wordmarkY ? 'translate3d(0,' + wordmarkY + 'px,0)' : '';

    var panelHeight;
    if (mobile) {
      panelHeight = layoutVh * 0.45;
    } else if (progress <= 0.5) {
      panelHeight = mapRange(progress, 0, 0.5, layoutVh / 2, layoutVh - 20);
    } else {
      panelHeight = mapRange(progress, 0.5, 1, layoutVh - 20, 0);
    }
    panel.style.height = Math.max(0, Math.round(panelHeight)) + 'px';

    if (mobile) {
      panel.style.transform = '';
      panel.classList.remove('is-top', 'is-bottom');
    } else {
      var panelY = Math.round(mapRange(progress, 0, 0.5, 200, 0));
      panel.style.transform = panelY ? 'translate3d(0,' + panelY + 'px,0)' : '';
      panel.classList.toggle('is-bottom', progress <= 0.5);
      panel.classList.toggle('is-top', progress > 0.5);
    }

    updateMasks(panel.offsetHeight);
    updateSlides(progress);
    updateHeader(progress);
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

  window.addEventListener('resize', function () {
    if (window.innerWidth !== lastWidth) {
      lastWidth = window.innerWidth;
      layoutVh = window.innerHeight;
      requestUpdate();
    }
  }, { passive: true });

  window.addEventListener('orientationchange', function () {
    layoutVh = window.innerHeight;
    lastWidth = window.innerWidth;
    requestUpdate();
  });

  update();
})();
