// Theme
const html = document.documentElement;
const saved = localStorage.getItem('theme');
const themeMeta = document.querySelector('meta[name="theme-color"]');
if (saved) html.dataset.theme = saved;
else html.dataset.theme = 'dark';
if (themeMeta) themeMeta.content = themeMeta.dataset[html.dataset.theme];

function semverCompare(a, b) {
  const aParts = a.replace(/^v/, '').split('.').map(Number);
  const bParts = b.replace(/^v/, '').split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((aParts[i] || 0) > (bParts[i] || 0)) return 1;
    if ((aParts[i] || 0) < (bParts[i] || 0)) return -1;
  }
  return 0;
}

document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

  // Carousel
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dotsContainer = document.getElementById('carouselDots');
  const slides = track.querySelectorAll('.carousel-slide');
  let currentSlide = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Ir para slide ' + (i + 1));
    dot.addEventListener('click', () => handleManualNav(() => goToSlide(i)));
    dotsContainer.appendChild(dot);
  });

  function goToSlide(index) {
    currentSlide = index;
    track.scrollTo({ left: track.clientWidth * index, behavior: 'smooth' });
    dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });
    document.getElementById('carouselCounter').textContent = (index + 1) + ' / ' + slides.length;
    document.getElementById('carouselFadeLeft').style.opacity = index > 0 ? '1' : '0';
    document.getElementById('carouselFadeRight').style.opacity = index < slides.length - 1 ? '1' : '0';
    preloadAdjacent(index);
  }

  function preloadAdjacent(index) {
    [index - 1, index + 1].forEach(i => {
      if (i >= 0 && i < slides.length) {
        const img = slides[i].querySelector('img');
        if (img && !img.dataset.preloaded) {
          img.dataset.preloaded = '1';
          const p = new Image();
          p.src = img.src;
        }
      }
    });
  }

  // Autoplay
  let autoplayTimer, resumeTimer;
  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      goToSlide((currentSlide + 1) % slides.length);
    }, 4000);
  }
  function stopAutoplay() { clearInterval(autoplayTimer); }
  function pauseAutoplay() {
    stopAutoplay();
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(startAutoplay, 8000);
  }
  startAutoplay();

  const carouselEl = document.querySelector('.carousel');
  carouselEl.addEventListener('mouseenter', stopAutoplay);
  carouselEl.addEventListener('mouseleave', startAutoplay);
  carouselEl.addEventListener('focusin', stopAutoplay);
  carouselEl.addEventListener('focusout', startAutoplay);

  function handleManualNav(fn) {
    fn();
    pauseAutoplay();
  }

  prevBtn.addEventListener('click', () => handleManualNav(() => goToSlide(Math.max(0, currentSlide - 1))));
  nextBtn.addEventListener('click', () => handleManualNav(() => goToSlide(Math.min(slides.length - 1, currentSlide + 1))));

  // GitHub badges + download sizes
  const badgeVersion = document.getElementById('badgeVersion');
  const badgeStars = document.getElementById('badgeStars');
  const badges = document.querySelectorAll('.download-badge');
  fetch('https://api.github.com/repos/FelipeMeloGomes/FM-Optimization/releases')
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(all => {
      all.sort((a, b) => semverCompare(b.tag_name, a.tag_name));
      const latest = all[0];
      if (!latest) { badgeVersion.textContent = 'v1.0.0'; return; }
      badgeVersion.textContent = latest.tag_name;
      document.querySelectorAll('.btn-download').forEach(btn => {
        const isSetup = btn.textContent.includes('Setup');
        const name = isSetup ? 'fm-optimize-setup.exe' : 'fm-optimize-portable.exe';
        btn.href = `https://github.com/FelipeMeloGomes/FM-Optimization/releases/download/${latest.tag_name}/${name}`;
      });
      latest.assets.forEach(a => {
        const mb = (a.size / 1048576).toFixed(1);
        if (a.name === 'fm-optimize-portable.exe' && badges[0]) badges[0].textContent = '~' + mb + ' MB';
        if (a.name === 'fm-optimize-setup.exe' && badges[1]) badges[1].textContent = '~' + mb + ' MB';
      });
    })
    .catch(() => { badgeVersion.textContent = 'v1.0.0'; });
  fetch('https://api.github.com/repos/FelipeMeloGomes/FM-Optimization')
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(d => { badgeStars.textContent = d.stargazers_count + ' ★'; })
    .catch(() => { badgeStars.textContent = '★'; });

  // Hamburger menu
  const hamburger = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-label', mobileMenu.classList.contains('open') ? 'Fechar menu' : 'Abrir menu');
  });
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-label', 'Abrir menu');
    });
  });

  // Back to top
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 400);
  });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Lightbox
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = '<button class="lightbox-close" aria-label="Fechar">&times;</button><button class="lightbox-prev" aria-label="Anterior">&lsaquo;</button><button class="lightbox-next" aria-label="Próximo">&rsaquo;</button><img class="lightbox-img" alt="">';
  document.body.appendChild(lightbox);

  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxPrev = lightbox.querySelector('.lightbox-prev');
  const lightboxNext = lightbox.querySelector('.lightbox-next');
  const carouselImgs = document.querySelectorAll('.carousel-img');
  let lightboxIndex = 0;
  let lightboxZoom = 1;

  function resetLightbox() {
    lightboxZoom = 1;
    lightboxImg.style.transform = '';
    lightboxImg.style.transition = '';
  }

  function openLightbox(index) {
    lightboxIndex = index;
    resetLightbox();
    const img = carouselImgs[index];
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('open');
    lightboxPrev.style.display = index > 0 ? '' : 'none';
    lightboxNext.style.display = index < carouselImgs.length - 1 ? '' : 'none';
  }

  function navLightbox(delta) {
    const i = lightboxIndex + delta;
    if (i >= 0 && i < carouselImgs.length) openLightbox(i);
  }

  carouselImgs.forEach((img, i) => {
    img.addEventListener('click', () => openLightbox(i));
  });

  lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); navLightbox(-1); });
  lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); navLightbox(1); });

  lightboxImg.addEventListener('click', (e) => e.stopPropagation());
  lightboxImg.addEventListener('wheel', (e) => {
    e.preventDefault();
    lightboxZoom = Math.max(1, Math.min(5, lightboxZoom - e.deltaY * 0.002));
    lightboxImg.style.transition = 'none';
    lightboxImg.style.transform = 'scale(' + lightboxZoom + ')';
  }, { passive: false });

  lightbox.addEventListener('click', () => {
    lightbox.classList.remove('open');
    resetLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') { lightbox.classList.remove('open'); resetLightbox(); }
    if (e.key === 'ArrowLeft') navLightbox(-1);
    if (e.key === 'ArrowRight') navLightbox(1);
  });

  // Swipe down to close lightbox
  let lightboxTouchY = 0;
  lightbox.addEventListener('touchstart', (e) => {
    lightboxTouchY = e.changedTouches[0].clientY;
  }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    if (e.changedTouches[0].clientY - lightboxTouchY > 80) {
      lightbox.classList.remove('open');
      resetLightbox();
    }
  }, { passive: true });

  // Carousel keyboard
  const carouselSection = document.getElementById('screenshots');
  carouselSection.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { goToSlide(Math.max(0, currentSlide - 1)); e.preventDefault(); }
    if (e.key === 'ArrowRight') { goToSlide(Math.min(slides.length - 1, currentSlide + 1)); e.preventDefault(); }
  });

  // Download toast
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('aria-live', 'polite');
  toast.setAttribute('role', 'status');
  document.body.appendChild(toast);

  document.querySelectorAll('.btn-download').forEach((btn) => {
    btn.addEventListener('click', () => {
      toast.textContent = 'Redirecionando para o download\u2026';
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    });
  });

  // Counter animation
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        if (!target) return;
        let current = 0;
        const step = Math.ceil(target / 40);
        const intl = new Intl.NumberFormat('pt-BR');
        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = intl.format(current);
        }, 30);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.counter').forEach((el) => counterObserver.observe(el));

  // Theme toggle
  const themeBtn = document.getElementById('themeToggle');
  function applyTheme(theme) {
    html.dataset.theme = theme;
    if (themeMeta) themeMeta.content = themeMeta.dataset[theme];
  }
  themeBtn.addEventListener('click', () => {
    const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('theme', next);
  });

  // Releases / Docs
  const releasesContainer = document.getElementById('releasesContainer');
  if (releasesContainer) {
    fetch('https://api.github.com/repos/FelipeMeloGomes/FM-Optimization/releases')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(releases => {
        if (!releases.length) {
          releasesContainer.innerHTML = '<p class="releases-error" style="color:var(--text-muted)">Nenhuma release encontrada.</p>';
          return;
        }
        releases.sort((a, b) => semverCompare(b.tag_name, a.tag_name));
        const html = releases.map(r => {
          const date = new Date(r.published_at || r.created_at);
          const dateStr = date.toLocaleDateString('pt-BR', {
            day: 'numeric', month: 'long', year: 'numeric'
          });
          const bodyHtml = marked.parse(r.body || '');
          return `
            <div class="release-card fade-in">
              <div class="release-header">
                <span class="release-tag">${r.tag_name}</span>
                <span class="release-date">${dateStr}</span>
              </div>
              <div class="release-name">${r.name}</div>
              <div class="release-body">${bodyHtml}</div>
            </div>
          `;
        }).join('');
        releasesContainer.innerHTML = html;
        document.querySelectorAll('#releasesContainer .fade-in').forEach(el => observer.observe(el));
      })
      .catch(() => {
        releasesContainer.innerHTML = '<p class="releases-error">Não foi possível carregar o changelog. Tente novamente mais tarde.</p>';
      });
  }

});
