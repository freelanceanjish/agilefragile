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
  var lastScrollY = window.scrollY || 0;
  var scrollingUp = false;
  var scrollDirection = 'idle';
  var isScrolling = false;
  var scrollStopTimer = null;
  var headerVisible = false;
  var activeSlide = -1;
  var SCROLL_STOP_MS = 280;

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

  function panelRevealStart() {
    return isMobile() ? 0.08 : 0.1;
  }

  function panelFullHeight() {
    if (isMobile()) {
      return Math.max(Math.round(layoutVh * 0.54), 320);
    }
    return layoutVh - 20;
  }

  function panelHeightFor(progress) {
    var mobile = isMobile();
    var start = panelRevealStart();
    var maxHeight = panelFullHeight();
    var expandEnd = start + (mobile ? 0.05 : 0.06);

    if (progress < start) return 0;

    if (progress < expandEnd) {
      return Math.round(mapRange(progress, start, expandEnd, 0, maxHeight));
    }

    if (mobile) {
      if (progress < 0.68) return maxHeight;
      return Math.round(mapRange(progress, 0.68, 0.86, maxHeight, 0));
    }

    if (progress <= 0.5) return maxHeight;
    return Math.round(mapRange(progress, 0.5, 1, maxHeight, 0));
  }

  function slideRangeEnd() {
    return isMobile() ? 0.68 : 1;
  }

  function slideRangeStart() {
    var start = panelRevealStart();
    var expandEnd = start + (isMobile() ? 0.05 : 0.06);
    return expandEnd + 0.01;
  }

  function headerEligible(progress) {
    var showAt = isMobile() ? 0.42 : 0.36;
    if (progress > showAt) return true;
    var scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    return scrollY > pin.offsetHeight * 0.4;
  }

  function recordScrollDirection(y) {
    if (y < lastScrollY - 0.5) {
      scrollDirection = 'up';
      scrollingUp = true;
    } else if (y > lastScrollY + 0.5) {
      scrollDirection = 'down';
      scrollingUp = false;
    }
    lastScrollY = y;
  }

  function updateChrome(progress) {
    var activelyScrolling = isScrolling || scrollDirection !== 'idle';
    var eligible = headerEligible(progress);

    if (activelyScrolling) {
      headerVisible = false;
    } else if (eligible) {
      headerVisible = true;
    } else {
      headerVisible = false;
    }

    var wordmarkVisible = !activelyScrolling && !eligible && progress <= panelRevealStart();

    document.body.classList.toggle('home-header-visible', headerVisible);
    document.body.classList.toggle('home-hero-wordmark-visible', wordmarkVisible);
  }

  function markScrolling() {
    isScrolling = true;
    if (scrollStopTimer) clearTimeout(scrollStopTimer);
    scrollStopTimer = setTimeout(function () {
      isScrolling = false;
      scrollDirection = 'idle';
      scrollStopTimer = null;
      requestUpdate();
    }, SCROLL_STOP_MS);
  }

  function setPanelVisible(height) {
    var visible = height > 12;
    panel.style.visibility = visible ? 'visible' : 'hidden';
    panel.setAttribute('aria-hidden', visible ? 'false' : 'true');
  }

  function updateMasks(panelHeight) {
    if (isMobile() || panelHeight < 12) return;

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
    var end = slideRangeEnd();
    var start = slideRangeStart();

    if (progress < start || progress >= end - 0.03 || !slides.length) {
      if (activeSlide !== -1) {
        slides.forEach(function (slide) { slide.classList.remove('is-active'); });
        activeSlide = -1;
      }
      return;
    }

    var step = (end - start - 0.06) / slides.length;
    var index = 0;
    for (var i = 0; i < slides.length; i += 1) {
      if (progress > start + step * (i + 0.5)) index = i;
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
    var panelHeight = panelHeightFor(progress);

    if (reduced) {
      wordmarkWrap.style.transform = '';
      panel.style.transform = '';
      panel.style.height = Math.round(mobile ? panelFullHeight() : layoutVh * 0.5) + 'px';
      setPanelVisible(panel.offsetHeight);
      if (activeSlide !== 0 && slides[0]) {
        slides.forEach(function (slide) { slide.classList.remove('is-active'); });
        slides[0].classList.add('is-active');
        activeSlide = 0;
      }
      document.body.classList.add('home-header-visible');
      document.body.classList.remove('home-hero-wordmark-visible');
      return;
    }

    updateChrome(progress);

    var wordmarkY = 0;
    if (document.body.classList.contains('home-hero-wordmark-visible')) {
      wordmarkY = Math.round(mapRange(progress, 0, 0.5, 0, mobile ? layoutVh / 6 : layoutVh / 2));
    }
    wordmarkWrap.style.transform = wordmarkY ? 'translate3d(0,' + wordmarkY + 'px,0)' : '';

    panel.style.height = Math.max(0, Math.round(panelHeight)) + 'px';
    setPanelVisible(panelHeight);

    if (mobile) {
      panel.style.transform = '';
      panel.classList.add('is-bottom');
      panel.classList.remove('is-top');
    } else {
      var panelY = panelHeight > 0
        ? Math.round(mapRange(progress, panelRevealStart(), 0.5, 200, 0))
        : 0;
      panel.style.transform = panelY ? 'translate3d(0,' + panelY + 'px,0)' : '';
      panel.classList.toggle('is-bottom', progress <= 0.5);
      panel.classList.toggle('is-top', progress > 0.5);
    }

    updateMasks(panelHeight);
    updateSlides(progress);
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

  window.addEventListener('scroll', function () {
    var y = window.scrollY || document.documentElement.scrollTop || 0;
    recordScrollDirection(y);
    markScrolling();
    requestUpdate();
  }, { passive: true });

  window.addEventListener('wheel', function (event) {
    if (event.deltaY < 0) {
      scrollDirection = 'up';
      scrollingUp = true;
    } else if (event.deltaY > 0) {
      scrollDirection = 'down';
      scrollingUp = false;
    }
    markScrolling();
    requestUpdate();
  }, { passive: true });

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
