const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.getElementById('site-navigation');

navToggle?.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
  siteNav.classList.toggle('open');
});

const navLinks = document.querySelectorAll('.nav-list a');
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (siteNav.classList.contains('open')) {
      siteNav.classList.remove('open');
      navToggle?.setAttribute('aria-expanded', 'false');
    }
  });
});

const canvas = document.getElementById('network-canvas');
if (canvas && canvas.getContext) {
  const ctx = canvas.getContext('2d');
  const particles = [];
  const config = {
    count: 40,
    maxDistance: 180,
    particleSize: 2.5,
    speed: 0.4,
    lineOpacity: 0.18,
    particleColor: 'rgba(0, 184, 217, 0.92)',
    lineColor: 'rgba(77, 159, 255, 0.48)'
  };

  function resizeCanvas() {
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    canvas.style.width = `${canvas.offsetWidth}px`;
    canvas.style.height = `${canvas.offsetHeight}px`;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  }

  function createParticles() {
    particles.length = 0;
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    for (let i = 0; i < config.count; i += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * config.speed,
        vy: (Math.random() - 0.5) * config.speed,
        radius: Math.random() * config.particleSize + 1
      });
    }
  }

  function draw() {
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    ctx.clearRect(0, 0, width, height);

    particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      if (particle.x < 0 || particle.x > width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > height) particle.vy *= -1;

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = config.particleColor;
      ctx.fill();
      ctx.closePath();

      for (let j = index + 1; j < particles.length; j += 1) {
        const other = particles[j];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < config.maxDistance) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(77, 159, 255, ${config.lineOpacity * (1 - dist / config.maxDistance)})`;
          ctx.lineWidth = 1;
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
          ctx.closePath();
        }
      }
    });
    window.requestAnimationFrame(draw);
  }

  function initNetwork() {
    resizeCanvas();
    createParticles();
    draw();
  }

  window.addEventListener('resize', () => {
    resizeCanvas();
    createParticles();
  });

  initNetwork();
}

// 3D tilt + micro-interaction for logo
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const logoWrap = document.querySelector('.logo-wrap');
  const logo = document.getElementById('brandLogo');
  if (!logoWrap || !logo) return;

  const maxDeg = 10; // max tilt
  const maxTranslate = 10; // translateZ for pop

  function handleMove(e) {
    const rect = logoWrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const px = dx / (rect.width / 2);
    const py = dy / (rect.height / 2);
    const rotY = Math.max(-maxDeg, Math.min(maxDeg, px * maxDeg));
    const rotX = Math.max(-maxDeg, Math.min(maxDeg, -py * maxDeg));
    const tz = Math.max(-maxTranslate, Math.min(maxTranslate, -py * (maxTranslate / 2)));
    logo.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(${tz}px)`;
    logo.style.transition = 'transform 120ms ease-out';
  }

  function handleLeave() {
    logo.style.transform = '';
    logo.style.transition = 'transform 420ms cubic-bezier(.2,.9,.2,1)';
  }

  logoWrap.addEventListener('mousemove', handleMove);
  logoWrap.addEventListener('mouseleave', handleLeave);
  logoWrap.addEventListener('mouseenter', () => { logo.style.transition = 'transform 160ms ease-out'; });
})();

// services carousel
(function() {
  const carousel = document.querySelector('.carousel-track');
  const carouselSlides = document.querySelectorAll('.carousel-slide');
  const prevButton = document.querySelector('.carousel-btn--prev');
  const nextButton = document.querySelector('.carousel-btn--next');
  const dotsContainer = document.querySelector('.carousel-dots');
  let activeSlide = 0;
  let carouselInterval = null;

  function createCarouselDots() {
    carouselSlides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      if (index === 0) dot.classList.add('active');
      dot.setAttribute('data-index', String(index));
      dot.addEventListener('click', () => {
        setActiveSlide(index);
        resetCarouselTimer();
      });
      dotsContainer.append(dot);
    });
  }

  function updateCarouselPosition() {
    if (!carousel) return;
    const offset = activeSlide * -100;
    carousel.style.transform = `translateX(${offset}%)`;
    carouselSlides.forEach((slide, index) => {
      slide.classList.toggle('active', index === activeSlide);
    });
    document.querySelectorAll('.carousel-dot').forEach((dot, index) => {
      dot.classList.toggle('active', index === activeSlide);
    });
  }

  function setActiveSlide(index) {
    activeSlide = (index + carouselSlides.length) % carouselSlides.length;
    updateCarouselPosition();
  }

  function nextCarouselSlide() {
    setActiveSlide(activeSlide + 1);
  }

  function prevCarouselSlide() {
    setActiveSlide(activeSlide - 1);
  }

  function resetCarouselTimer() {
    clearInterval(carouselInterval);
    carouselInterval = window.setInterval(nextCarouselSlide, 6000);
  }

  if (carousel && carouselSlides.length && prevButton && nextButton && dotsContainer) {
    createCarouselDots();
    prevButton.addEventListener('click', () => {
      prevCarouselSlide();
      resetCarouselTimer();
    });
    nextButton.addEventListener('click', () => {
      nextCarouselSlide();
      resetCarouselTimer();
    });
    carousel.addEventListener('mouseenter', () => clearInterval(carouselInterval));
    carousel.addEventListener('mouseleave', resetCarouselTimer);
    resetCarouselTimer();
  }
})();

// service card expand/collapse
(function() {
  const cards = document.querySelectorAll('.service-card');
  if (!cards.length) return;
  cards.forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-expanded', 'false');
    card.addEventListener('click', () => {
      const expanded = card.classList.toggle('expanded');
      card.setAttribute('aria-expanded', String(expanded));
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const expanded = card.classList.toggle('expanded');
        card.setAttribute('aria-expanded', String(expanded));
      }
    });
  });
})();
