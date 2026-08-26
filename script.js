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

  /* ---- giant type with cursor-revealed photo (about page) ---- */
  var agencyWrap = document.getElementById('agency-type-wrap');
  var agencyMask = document.getElementById('agency-type-mask');
  if (agencyWrap && agencyMask) {
    // EDIT: put your own photo paths here — the one shown depends on which
    // horizontal third of the heading the cursor is currently over.
    var agencyImages = [
      'images/real/kitchen-01.jpg',
      'images/real/builtin-wetbar-01.jpg',
      'images/real/kitchen-09.jpg'
    ];
    var currentImg = '';

    var setPosition = function (clientX, clientY) {
      var r = agencyWrap.getBoundingClientRect();
      var xPct = Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
      var yPct = Math.max(0, Math.min(100, ((clientY - r.top) / r.height) * 100));
      agencyWrap.style.setProperty('--mx', xPct + '%');
      agencyWrap.style.setProperty('--my', yPct + '%');

      var idx = Math.min(agencyImages.length - 1, Math.floor((xPct / 100) * agencyImages.length));
      var nextImg = agencyImages[idx];
      if (nextImg !== currentImg) {
        agencyMask.style.backgroundImage = "url('" + nextImg + "')";
        currentImg = nextImg;
      }
    };

    agencyWrap.addEventListener('mousemove', function (e) {
      setPosition(e.clientX, e.clientY);
    });
    agencyWrap.addEventListener('touchstart', function () {
      agencyWrap.classList.add('is-touched');
    }, { passive: true });
    agencyWrap.addEventListener('touchmove', function (e) {
      if (e.touches && e.touches[0]) {
        setPosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });
  }

})();
