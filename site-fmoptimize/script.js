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
    const dot = document.createElement('div');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  function goToSlide(index) {
    currentSlide = index;
    track.scrollTo({ left: track.clientWidth * index, behavior: 'smooth' });
    dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });
  }

  prevBtn.addEventListener('click', () => {
    goToSlide(Math.max(0, currentSlide - 1));
  });

  nextBtn.addEventListener('click', () => {
    goToSlide(Math.min(slides.length - 1, currentSlide + 1));
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

  // Download links (placeholder)
  const downloadBtns = document.querySelectorAll('.btn-download');
  downloadBtns.forEach((btn) => {
    const version = btn.dataset.version;
    btn.href = '#';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const urls = {
        portable: 'https://github.com/FelipeMeloGomes/FM-Optimization/releases/latest/download/FMOptimize.exe',
        installer: 'https://github.com/FelipeMeloGomes/FM-Optimization/releases/latest/download/FMOptimize_Setup.exe'
      };
      window.open(urls[version], '_blank');
    });
  });
});
