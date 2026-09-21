export function initAnimations() {
  initScrollReveal();
  initTypingEffect();
  initStatCounters();
  initGpaBar();
  initCopyButtons();
  initCardTilt();
}

// ============================================
// SCROLL REVEAL (Intersection Observer)
// ============================================

function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  revealElements.forEach((el) => observer.observe(el));
}

// ============================================
// TYPING EFFECT
// ============================================

function initTypingEffect() {
  const typingElement = document.getElementById('typing-text');
  if (!typingElement) return;

  const phrases = [
    'Web Developer',
    'Sistem Informasi',
    'Laravel & Vue.js',
    'Next.js Developer',
    'Problem Solver',
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 80;

  function type() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 40;
    } else {
      typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 80;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
      typingSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typingSpeed = 500;
    }

    setTimeout(type, typingSpeed);
  }

  setTimeout(type, 1000);
}

// ============================================
// STAT COUNTER ANIMATION
// ============================================

function initStatCounters() {
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseFloat(el.getAttribute('data-target'));
          animateCounter(el, target);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach((el) => observer.observe(el));
}

function animateCounter(element, target) {
  const isFloat = !Number.isInteger(target);
  const duration = 2000;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = eased * target;

    if (isFloat) {
      element.textContent = current.toFixed(2);
    } else {
      element.textContent = Math.floor(current);
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = isFloat ? target.toFixed(2) : target;
    }
  }

  requestAnimationFrame(update);
}

// ============================================
// GPA BAR ANIMATION
// ============================================

function initGpaBar() {
  const gpaFill = document.querySelector('.gpa-fill');
  if (!gpaFill) return;

  const targetWidth = gpaFill.getAttribute('data-width');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          gpaFill.style.setProperty('--target-width', `${targetWidth}%`);
          gpaFill.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(gpaFill);
}

// ============================================
// COPY TO CLIPBOARD + TOAST
// ============================================

function initCopyButtons() {
  const copyButtons = document.querySelectorAll('.copy-btn');
  const toast = document.getElementById('toast');

  copyButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (!textToCopy) return;

      navigator.clipboard.writeText(textToCopy).then(() => {
        if (toast) {
          toast.textContent = `Tersalin: "${textToCopy}" 📋`;
          toast.classList.add('show');
          setTimeout(() => {
            toast.classList.remove('show');
          }, 3000);
        }
      }).catch((err) => {
        console.error('Failed to copy: ', err);
      });
    });
  });
}

// ============================================
// INTERACTIVE CARD TILT
// ============================================

function initCardTilt() {
  if (window.innerWidth < 768) return; // Skip on mobile

  const cards = document.querySelectorAll('.project-card, .hero-photo');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
    });
  });
}

