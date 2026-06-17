// Theme
const html = document.documentElement;
const saved = localStorage.getItem('theme');
const themeMeta = document.querySelector('meta[name="theme-color"]');
if (saved) html.dataset.theme = saved;
else html.dataset.theme = 'dark';
if (themeMeta) themeMeta.content = themeMeta.dataset[html.dataset.theme];

// Service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
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

  // GitHub badges
  const badgeVersion = document.getElementById('badgeVersion');
  const badgeStars = document.getElementById('badgeStars');
  fetch('https://api.github.com/repos/FelipeMeloGomes/FM-Optimization/releases/latest')
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(d => { badgeVersion.textContent = d.tag_name; })
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
  lightbox.innerHTML = '<button class="lightbox-close" aria-label="Fechar">&times;</button><img class="lightbox-img" alt="">';
  document.body.appendChild(lightbox);

  const lightboxImg = lightbox.querySelector('.lightbox-img');

  document.querySelectorAll('.carousel-img').forEach((img) => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('open');
    });
  });

  lightbox.addEventListener('click', () => lightbox.classList.remove('open'));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') lightbox.classList.remove('open');
  });

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

  // Demo video
  const demoPoster = document.getElementById('demoPoster');
  const demoEmbed = document.getElementById('demoEmbed');
  if (demoPoster) {
    const play = () => {
      demoPoster.style.opacity = '0';
      setTimeout(() => {
        demoPoster.hidden = true;
        demoEmbed.hidden = false;
      }, 300);
    };
    demoPoster.addEventListener('click', play);
    demoPoster.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); }
    });
  }
});
