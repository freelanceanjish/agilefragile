(function () {
  var hero = document.querySelector('[data-home-hero]');
  if (!hero) return;

  var pin = document.getElementById('hero-pin');
  var wordmarkWrap = document.getElementById('hero-wordmark-wrap');
  var panel = document.getElementById('hero-panel');
  var slides = hero.querySelectorAll('.landing-hero-slide');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!pin || !wordmarkWrap || !panel) return;

  var layoutVh = window.innerHeight;
  var lastWidth = window.innerWidth;
  var lastScrollY = window.scrollY || 0;
  var scrollDirection = 'idle';
  var isScrolling = false;
  var scrollStopTimer = null;
  var activeSlide = -1;
  var slideZones = [];
  var SCROLL_STOP_MS = 160;
  var SETTLE_MIN_DELTA = 8;
  var SLIDE_WEIGHTS = [3, 3, 1.2, 1.2, 1.2, 3];
  var settling = false;

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
    return isMobile() ? 0.07 : 0.09;
  }

  function panelInsetBottom() {
    return isMobile() ? 12 : 40;
  }

  var headerClearanceCache = null;

  function headerClearancePx() {
    if (headerClearanceCache !== null) return headerClearanceCache;

    var header = document.querySelector('.site-header');
    if (header) {
      var bottom = header.getBoundingClientRect().bottom;
      if (bottom > 0) {
        headerClearanceCache = Math.ceil(bottom) + 8;
        return headerClearanceCache;
      }
    }

    var probe = document.createElement('div');
    probe.style.cssText =
      'position:absolute;visibility:hidden;pointer-events:none;height:var(--site-header-clearance);width:0;';
    document.body.appendChild(probe);
    var measured = probe.getBoundingClientRect().height;
    probe.remove();
    headerClearanceCache = measured > 0 ? Math.ceil(measured) : 120;
    return headerClearanceCache;
  }

  function resetHeaderClearanceCache() {
    headerClearanceCache = null;
  }

  function panelFullHeight() {
    var bottom = panelInsetBottom();
    var maxByHeader = layoutVh - headerClearancePx() - bottom - 12;

    if (isMobile()) {
      return Math.max(280, Math.min(Math.round(layoutVh * 0.56), Math.round(maxByHeader)));
    }
    return Math.max(320, Math.min(Math.round(layoutVh - bottom - 12), Math.round(maxByHeader)));
  }

  function slideRangeStart() {
    var start = panelRevealStart();
    var expandEnd = start + (isMobile() ? 0.04 : 0.05);
    return expandEnd;
  }

  function slideRangeEnd() {
    return isMobile() ? 0.84 : 0.9;
  }

  function slideCollapseEnd() {
    return isMobile() ? 0.96 : 0.98;
  }

  function rebuildSlideZones() {
    var start = slideRangeStart();
    var end = slideRangeEnd();
    var span = end - start;
    var total = 0;
    var i;
    var acc = 0;

    slideZones = [];
    for (i = 0; i < SLIDE_WEIGHTS.length; i += 1) {
      total += SLIDE_WEIGHTS[i];
    }

    for (i = 0; i < SLIDE_WEIGHTS.length; i += 1) {
      var width = (SLIDE_WEIGHTS[i] / total) * span;
      var zoneStart = start + acc;
      var zoneEnd = zoneStart + width;
      slideZones.push({
        start: zoneStart,
        end: zoneEnd,
        mid: zoneStart + width * 0.5
      });
      acc += width;
    }
  }

  function panelHeightFor(progress) {
    var start = panelRevealStart();
    var maxHeight = panelFullHeight();
    var expandEnd = slideRangeStart();
    var slidesEnd = slideRangeEnd();
    var collapseEnd = slideCollapseEnd();

    if (progress < start) return 0;
    if (progress < expandEnd) {
      return Math.round(mapRange(progress, start, expandEnd, 0, maxHeight));
    }
    if (progress <= slidesEnd) return maxHeight;
    if (progress >= collapseEnd) return 0;
    return Math.round(mapRange(progress, slidesEnd, collapseEnd, maxHeight, 0));
  }

  function chromeMorph(progress) {
    var scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    if (scrollY < 4 && progress <= 0) return 0;

    var morphEnd = isMobile() ? 0.14 : 0.09;
    var fromHero = clamp(progress / morphEnd, 0, 1);

    var pinRange = pin.offsetHeight - layoutVh;
    var afterHero = 0;
    if (pinRange > 0 && scrollY > pinRange * 0.25) {
      afterHero = clamp((scrollY - pinRange * 0.25) / (layoutVh * 0.18), 0, 1);
    }

    return clamp(Math.max(fromHero, afterHero), 0, 1);
  }

  function recordScrollDirection(y) {
    if (y < lastScrollY - 0.5) {
      scrollDirection = 'up';
    } else if (y > lastScrollY + 0.5) {
      scrollDirection = 'down';
    }
    lastScrollY = y;
  }

  function updateChrome(progress) {
    var chrome = chromeMorph(progress);
    document.documentElement.style.setProperty('--home-chrome', chrome.toFixed(4));
    document.body.classList.toggle('home-hero-mode', chrome < 0.42);
    document.body.classList.toggle('home-header-compact', chrome >= 0.42);
  }

  function markScrolling() {
    isScrolling = true;
    if (scrollStopTimer) clearTimeout(scrollStopTimer);
    scrollStopTimer = setTimeout(function () {
      isScrolling = false;
      scrollDirection = 'idle';
      scrollStopTimer = null;
      settleToActiveSlide();
      requestUpdate();
    }, SCROLL_STOP_MS);
  }

  function setPanelVisible(height) {
    var visible = height > 12;
    panel.style.visibility = visible ? 'visible' : 'hidden';
    panel.setAttribute('aria-hidden', visible ? 'false' : 'true');
  }

  function scrollYForProgress(progress) {
    var range = pin.offsetHeight - layoutVh;
    return pin.offsetTop + progress * range;
  }

  function pickSlide(progress) {
    if (!slideZones.length) rebuildSlideZones();

    if (progress < slideRangeStart()) {
      return -1;
    }

    if (progress > slideRangeEnd()) {
      if (progress < slideCollapseEnd()) {
        return slideZones.length - 1;
      }
      return -1;
    }

    var i;

    if (scrollDirection === 'up') {
      for (i = 0; i < slideZones.length; i += 1) {
        if (progress < slideZones[i].end) return i;
      }
      return slideZones.length - 1;
    }

    if (scrollDirection === 'idle' && activeSlide >= 0 && activeSlide < slideZones.length) {
      var sticky = slideZones[activeSlide];
      if (progress >= sticky.start && progress < sticky.end) return activeSlide;
    }

    for (i = slideZones.length - 1; i >= 0; i -= 1) {
      if (progress >= slideZones[i].start) return i;
    }
    return 0;
  }

  function settleBiasFor(index) {
    if (index <= 1 || index === slideZones.length - 1) return 0.18;
    return 0.1;
  }

  function settleToActiveSlide() {
    if (reduced || settling || activeSlide < 0) return;

    var progress = scrollProgress();
    if (progress < slideRangeStart() || progress >= slideCollapseEnd()) return;

    var zone = slideZones[activeSlide];
    if (!zone) return;

    var targetProgress = zone.start + (zone.end - zone.start) * settleBiasFor(activeSlide);
    var targetY = scrollYForProgress(targetProgress);
    var y = window.scrollY || document.documentElement.scrollTop || 0;

    if (Math.abs(targetY - y) < SETTLE_MIN_DELTA) return;

    settling = true;
    window.scrollTo({ top: Math.round(targetY), behavior: reduced ? 'auto' : 'smooth' });
    settling = false;
    requestUpdate();
  }

  function showSlide(index) {
    slides.forEach(function (slide, i) {
      var on = i === index;
      slide.classList.toggle('is-active', on);
      slide.style.opacity = '';
      slide.style.zIndex = on ? '2' : '0';
    });
    activeSlide = index;
  }

  function hideSlides() {
    slides.forEach(function (slide) {
      slide.classList.remove('is-active');
      slide.style.opacity = '';
      slide.style.zIndex = '0';
    });
    activeSlide = -1;
  }

  function updateSlides(progress) {
    var index = pickSlide(progress);

    if (index === -1) {
      if (activeSlide !== -1) hideSlides();
      return;
    }

    if (index === activeSlide) return;
    showSlide(index);
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
      if (activeSlide !== 0 && slides[0]) showSlide(0);
      document.documentElement.style.setProperty('--home-chrome', '1');
      document.body.classList.remove('home-hero-mode');
      document.body.classList.add('home-header-compact');
      return;
    }

    updateChrome(progress);

    panel.style.height = Math.max(0, Math.round(panelHeight)) + 'px';
    setPanelVisible(panelHeight);
    panel.style.transform = '';
    panel.classList.add('is-bottom');
    panel.classList.remove('is-top');

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

  rebuildSlideZones();

  document.documentElement.style.setProperty('--home-chrome', '0');
  document.body.classList.add('home-hero-mode');
  document.body.classList.remove('home-header-compact');

  window.addEventListener('scroll', function () {
    var y = window.scrollY || document.documentElement.scrollTop || 0;
    recordScrollDirection(y);
    markScrolling();
    requestUpdate();
  }, { passive: true });

  window.addEventListener('wheel', function (event) {
    if (event.deltaY < 0) {
      scrollDirection = 'up';
    } else if (event.deltaY > 0) {
      scrollDirection = 'down';
    }
    markScrolling();
    requestUpdate();
  }, { passive: true });

  window.addEventListener('resize', function () {
    resetHeaderClearanceCache();
    if (window.innerWidth !== lastWidth) {
      lastWidth = window.innerWidth;
      layoutVh = window.innerHeight;
      rebuildSlideZones();
      requestUpdate();
    }
  }, { passive: true });

  window.addEventListener('orientationchange', function () {
    resetHeaderClearanceCache();
    layoutVh = window.innerHeight;
    lastWidth = window.innerWidth;
    rebuildSlideZones();
    requestUpdate();
  });

  update();
})();
