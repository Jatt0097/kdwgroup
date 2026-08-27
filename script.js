/* ============================================================
   KITCHEN DEKOR WERKS — shared interactivity
   Mobile menu · scroll reveal · joinery divider draw-on · marquee
   Gallery filter + lightbox · accordion · counters · active nav
   ============================================================ */
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- launch intro (home page only) ---- */
  var intro = document.getElementById('site-intro');
  if (intro) {
    var introDone = false;
    var INTRO_MS = 2600;
    if (!reduceMotion) { document.documentElement.style.overflow = 'hidden'; }
    function finishIntro() {
      if (introDone) return;
      introDone = true;
      document.documentElement.style.overflow = '';
      intro.setAttribute('aria-hidden', 'true');
    }
    if (reduceMotion) {
      finishIntro();
    } else {
      setTimeout(finishIntro, INTRO_MS);
      var skipBtn = document.getElementById('intro-skip');
      if (skipBtn) {
        skipBtn.addEventListener('click', function () {
          intro.style.animation = 'none';
          intro.style.transition = 'opacity .3s ease';
          intro.style.opacity = '0';
          intro.style.visibility = 'hidden';
          finishIntro();
        });
      }
    }
  }

  /* ---- footer year ---- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---- active nav link ---- */
  var path = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-links a, .site-menu-links a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('is-active');
    }
  });

  /* ---- full-screen menu overlay ---- */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('site-menu');
  var menuOpeners = document.querySelectorAll('[data-menu-open]');
  if (menu) {
    document.querySelectorAll('.site-menu-links a').forEach(function (a, i) {
      a.style.setProperty('--i', i);
    });
    var openMenu = function () {
      menu.classList.add('is-open');
      menu.setAttribute('aria-hidden', 'false');
      if (toggle) { toggle.classList.add('is-open'); toggle.setAttribute('aria-expanded', 'true'); }
      document.body.style.overflow = 'hidden';
    };
    var closeMenu = function () {
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      if (toggle) { toggle.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
      document.body.style.overflow = '';
    };
    if (toggle) {
      toggle.addEventListener('click', function () {
        if (menu.classList.contains('is-open')) closeMenu(); else openMenu();
      });
    }
    menuOpeners.forEach(function (btn) { btn.addEventListener('click', openMenu); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---- scroll reveal + joinery divider draw-on ---- */
  var revealTargets = document.querySelectorAll('.reveal, .joinery');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    revealTargets.forEach(function (el) { io.observe(el); });

    // staggered children
    document.querySelectorAll('.stagger').forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) {
        child.style.setProperty('--i', i);
      });
    });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---- animated counters (About page stats) ---- */
  var counters = document.querySelectorAll('[data-count-to]');
  if (counters.length) {
    var counted = new WeakSet();
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !counted.has(entry.target)) {
          counted.add(entry.target);
          animateCount(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }
  function animateCount(el) {
    var to = parseInt(el.getAttribute('data-count-to'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion) { el.textContent = to + suffix; return; }
    var start = null, duration = 1400;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * to) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---- gallery filter ---- */
  var filterBar = document.querySelector('.filter-bar');
  if (filterBar) {
    var items = document.querySelectorAll('.gallery-item');
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter-btn');
      if (!btn) return;
      filterBar.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      var cat = btn.getAttribute('data-filter');
      items.forEach(function (item) {
        var match = cat === 'all' || item.getAttribute('data-category') === cat;
        item.hidden = !match;
      });
    });
  }

  /* ---- lightbox ---- */
  var lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    var lbImage = lightbox.querySelector('.lightbox-img');
    var lbTitle = lightbox.querySelector('[data-lb-title]');
    var lbMeta = lightbox.querySelector('[data-lb-meta]');
    document.querySelectorAll('.gallery-item').forEach(function (item) {
      item.addEventListener('click', function () {
        var img = item.querySelector('img');
        if (img) {
          lbImage.src = img.src;
          lbImage.alt = img.alt || '';
        }
        lbTitle.textContent = item.getAttribute('data-title') || '';
        lbMeta.textContent = item.getAttribute('data-category') || '';
        lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      });
    });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target.closest('.lightbox-close')) {
        lightbox.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        lightbox.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ---- accordion (services page) ---- */
  document.querySelectorAll('.accordion-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var item = trigger.closest('.accordion-item');
      var panel = item.querySelector('.accordion-panel');
      var isOpen = item.classList.contains('is-open');
      // close siblings
      item.parentElement.querySelectorAll('.accordion-item').forEach(function (sib) {
        sib.classList.remove('is-open');
        sib.querySelector('.accordion-panel').style.maxHeight = null;
        sib.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('is-open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---- magnetic-ish button lift on pointer (subtle) ---- */
  if (!reduceMotion && matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.12;
        var y = (e.clientY - r.top - r.height / 2) * 0.28;
        btn.style.transform = 'translate(' + x + 'px,' + (y - 2) + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }
  /* ---- hero showcase (auto slideshow, home page only) ---- */
  var showcase = document.getElementById('hero-showcase');
  if (showcase) {
    var slides = showcase.querySelectorAll('.showcase-slide');
    var dashes = showcase.querySelectorAll('.dash');
    var captionBox = showcase.querySelector('.showcase-caption');
    var nameEl = showcase.querySelector('.showcase-name');
    var locEl = showcase.querySelector('.showcase-loc');
    var indexEl = showcase.querySelector('.showcase-index');
    var current = 0;
    var autoplayTimer = null;
    var AUTOPLAY_MS = 4500;

    function renderSlide(i) {
      slides[current].classList.remove('is-active');
      dashes[current].classList.remove('is-active');
      current = (i + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      dashes[current].classList.add('is-active');
      var s = slides[current];
      nameEl.textContent = s.getAttribute('data-name');
      locEl.textContent = s.getAttribute('data-loc');
      indexEl.textContent = String(current + 1).padStart(2, '0');
      if (!reduceMotion) {
        captionBox.classList.remove('pulse');
        void captionBox.offsetWidth; // restart animation
        captionBox.classList.add('pulse');
      }
    }
    function nextSlide() { renderSlide(current + 1); }
    function prevSlide() { renderSlide(current - 1); }
    function startAutoplay() {
      if (reduceMotion) return;
      stopAutoplay();
      autoplayTimer = setInterval(nextSlide, AUTOPLAY_MS);
    }
    function stopAutoplay() { if (autoplayTimer) clearInterval(autoplayTimer); }

    showcase.querySelector('.showcase-next').addEventListener('click', function () { nextSlide(); startAutoplay(); });
    showcase.querySelector('.showcase-prev').addEventListener('click', function () { prevSlide(); startAutoplay(); });
    dashes.forEach(function (d, i) {
      d.addEventListener('click', function () { renderSlide(i); startAutoplay(); });
    });
    showcase.addEventListener('mouseenter', stopAutoplay);
    showcase.addEventListener('mouseleave', startAutoplay);

    startAutoplay();
  }

  /* ---- 3-row photo mosaic behind services hero ---- */
  var servicesMosaic = document.getElementById('services-mosaic');
  if (servicesMosaic) {
    var msHeroSection = servicesMosaic.closest('.services-hero');
    var msHeaderEl = document.querySelector('.site-header');
    // capture the section's original CSS-driven min-height ONCE, before we ever
    // touch it, so repeated rebuilds (e.g. on resize) can restore it to remeasure
    // the natural size instead of compounding growth on top of our own extension
    var msOriginalMinHeight = msHeroSection.style.minHeight || '';

    // fallback pool — only used if manifest.json can't be loaded (e.g. the
    // Cloudflare build command hasn't been set yet). Once manifest.json is
    // live, this list is replaced automatically and never needs editing.
    var MOSAIC_IMAGES = [
      'builtin-wetbar-01.jpg', 'drawing-plan.jpg', 'kitchen-01.jpg',
      'kitchen-04.jpg', 'kitchen-09.jpg'
    ];

    var OVERLAP = 1.6; // squares render 60% larger than their grid step (~2x the previous overlap), so neighbors overlap more for a stronger flowing look

    var msSquareSize = 0; // grid step (logical cell size, used for hover math)
    var msCols = 0;
    var msTopOffset = 0; // header height — where row 0 actually starts
    var msSquares = [];
    var msActive = null;

    var msRandomImage = function () {
      return MOSAIC_IMAGES[Math.floor(Math.random() * MOSAIC_IMAGES.length)];
    };

    var buildMosaic = function () {
      servicesMosaic.innerHTML = '';
      msSquares = [];
      msActive = null;
      msHeroSection.classList.remove('has-active');

      // reset to the natural, content-driven height before measuring, so this
      // works correctly even when called again after a real window resize
      msHeroSection.style.minHeight = msOriginalMinHeight;
      var baseHeight = msHeroSection.offsetHeight;
      var headerHeight = msHeaderEl ? msHeaderEl.offsetHeight : 0;

      var availableWidth = servicesMosaic.getBoundingClientRect().width; // full-bleed now
      msSquareSize = baseHeight / 3;
      msCols = Math.ceil(availableWidth / msSquareSize);

      var visualSize = msSquareSize * OVERLAP;
      var visualInset = (visualSize - msSquareSize) / 2;

      // row 0's rendered top edge is (logical top - visualInset), so push the
      // logical origin down by that same amount — otherwise the overlap bleed
      // pushes the top row up underneath the fixed nav bar
      msTopOffset = headerHeight + visualInset;
      msHeroSection.style.minHeight = (baseHeight + headerHeight + visualInset) + 'px';

      for (var row = 0; row < 3; row++) {
        for (var col = 0; col < msCols; col++) {
          var sq = document.createElement('div');
          sq.className = 'mosaic-sq';
          sq.style.left = (col * msSquareSize - visualInset) + 'px';
          sq.style.top = (msTopOffset + row * msSquareSize - visualInset) + 'px';
          sq.style.width = visualSize + 'px';
          sq.style.height = visualSize + 'px';
          sq.style.zIndex = String(row * msCols + col); // later squares layer on top, reinforcing the flow
          sq.style.backgroundImage = "url('" + msRandomImage() + "')";
          servicesMosaic.appendChild(sq);
          msSquares.push(sq);
        }
      }
    };

    var msSetActive = function (sq) {
      if (sq === msActive) return;
      if (msActive) msActive.classList.remove('is-active');
      msActive = sq;
      if (sq) sq.classList.add('is-active');
      msHeroSection.classList.toggle('has-active', !!sq);
    };

    msHeroSection.addEventListener('mousemove', function (e) {
      var mosaicRect = servicesMosaic.getBoundingClientRect();
      var relX = e.clientX - mosaicRect.left;
      var relY = e.clientY - mosaicRect.top - msTopOffset;
      if (relX < 0 || relY < 0 || relX >= mosaicRect.width || relY >= msSquareSize * 3) {
        msSetActive(null);
        return;
      }
      var col = Math.min(msCols - 1, Math.floor(relX / msSquareSize));
      var row = Math.min(2, Math.floor(relY / msSquareSize));
      msSetActive(msSquares[row * msCols + col]);
    });
    msHeroSection.addEventListener('mouseleave', function () {
      msSetActive(null);
    });

    var msInit = function () {
      buildMosaic();
      var msResizeTimer;
      window.addEventListener('resize', function () {
        clearTimeout(msResizeTimer);
        msResizeTimer = setTimeout(buildMosaic, 200);
      });
    };

    // load the auto-generated photo list; if it's missing (e.g. no Cloudflare
    // build command set yet, or running the site locally without a build
    // step), silently fall back to the small hardcoded list above instead
    fetch('manifest.json')
      .then(function (res) {
        if (!res.ok) throw new Error('manifest.json not found');
        return res.json();
      })
      .then(function (list) {
        if (Array.isArray(list) && list.length) MOSAIC_IMAGES = list;
        msInit();
      })
      .catch(function () {
        msInit();
      });
  }

})();
