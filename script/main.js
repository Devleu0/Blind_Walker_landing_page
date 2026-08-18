document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. Mobile nav toggle ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('nav ul');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      navToggle.classList.toggle('active');
    });
    navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.classList.remove('active');
    }));
  }

  /* ---------- 2. Scroll state: shrink nav + scroll spy + sticky CTA bar ---------- */
  const nav = document.querySelector('nav');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  const stickyBar = document.querySelector('.sticky-cta');
  const hero = document.querySelector('.hero');

  const onScroll = () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 40);

    if (stickyBar && hero) {
      const heroBottom = hero.getBoundingClientRect().bottom;
      // 스티키 바는 히어로 섹션이 끝난 후에만 표시
      stickyBar.classList.toggle('visible', heroBottom < 0);
    }

    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 140;
      if (y >= top) current = sec.getAttribute('id');
    });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 3. Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- 4. Count-up stats (한 번만 실행되도록 개선) ---------- */
  const counters = document.querySelectorAll('.stat-number');
  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const decimals = el.dataset.count.includes('.') ? el.dataset.count.split('.')[1].length : 0;
    const duration = 1500;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        animateCounter(entry.target);
        entry.target.dataset.counted = 'true';
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  counters.forEach(el => counterObserver.observe(el));

  /* ---------- 5. Vision interactive viewer ---------- */
  const visionData = {
    myopia: {
      title: '고도근시',
      desc: '5m 앞의 표지판조차 초점 없이 뿌옇게 번져 보입니다. 형체는 짐작할 뿐, 세부는 사라집니다.',
      img: 'images/고도근시.webp'
    },
    glaucoma: {
      title: '녹내장',
      desc: '시야 주변부터 서서히 어둠에 잠식되는 터널 시야. 정면의 좁은 구멍으로만 세상을 봅니다.',
      img: 'images/녹내장.webp'
    },
    cataract: {
      title: '백내장',
      desc: '뿌연 안개가 낀 유리창 너머로 세상을 보는 듯한 시야. 빛은 번지고 명암은 뭉개집니다.',
      img: 'images/백내장.webp'
    },
    achromatopsia: {
      title: '전색맹',
      desc: '색이 완전히 사라진 세계. 오직 명암의 대비만으로 사물과 공간을 구분해야 합니다.',
      img: 'images/전색맹.webp'
    },
    amd: {
      title: '황반변성',
      desc: '시야 중심부가 검게 뭉개지는 중심 암점. 정면을 볼수록 오히려 아무것도 보이지 않습니다.',
      img: 'images/황반변성.webp'
    }
  };

  const viewerImg = document.querySelector('.vision-viewer-image');
  const viewerTitle = document.querySelector('.vision-viewer-title');
  const viewerDesc = document.querySelector('.vision-viewer-desc');
  const tabs = document.querySelectorAll('.vision-tab');

  if (viewerImg && tabs.length) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const key = tab.dataset.key;
        const data = visionData[key];
        if (!data) return;

        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        viewerImg.classList.add('fade-out');
        viewerImg.classList.remove('fade-in');

        setTimeout(() => {
          viewerImg.src = data.img;
          viewerTitle.textContent = data.title;
          viewerDesc.textContent = data.desc;
          viewerImg.classList.remove('fade-out');
          viewerImg.classList.add('fade-in');
        }, 300);
      });
    });
  }

  /* ---------- 6. Hero CTA buttons scroll to gameplay ---------- */
  document.querySelectorAll('.cta-primary, .cta-secondary').forEach(btn => {
    if (!btn.dataset.target) return;
    btn.addEventListener('click', (e) => {
      // 폼 제출 버튼인 경우 스크롤 이벤트 방지
      if (btn.type === 'submit') return;
      document.querySelector(btn.dataset.target)?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ---------- 7. Gallery Lightbox ---------- */
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.querySelector('.lightbox');
  if (galleryItems.length > 0 && lightbox) {
    const lightboxImg = lightbox.querySelector('img');
    const closeBtn = lightbox.querySelector('.lightbox-close');

    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const imgSrc = item.querySelector('img').src;
        lightboxImg.src = imgSrc;
        lightbox.classList.add('active');
      });
    });

    closeBtn.addEventListener('click', () => lightbox.classList.remove('active'));
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) lightbox.classList.remove('active');
    });
  }
});