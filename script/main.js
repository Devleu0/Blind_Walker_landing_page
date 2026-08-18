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

  /* ---------- 8. Immersive Gameplay Section Scroll Animation ---------- */
  const gameplaySection = document.getElementById('gameplay');
  if (gameplaySection) {
    const spacer = gameplaySection.querySelector('.gameplay-spacer');
    const bg = gameplaySection.querySelector('.gameplay-background');
    const header = gameplaySection.querySelector('.section-header');
    const features = gameplaySection.querySelectorAll('.gameplay-feature');

    const handleGameplayScroll = () => {
      const rect = spacer.getBoundingClientRect();
      const { top, height } = rect;
      const vh = window.innerHeight;

      // 섹션이 화면에 보이지 않으면 실행 안함
      if (top > vh || top + height < 0) {
        // Make sure everything is in its initial or final state when not in view
        bg.style.opacity = 0;
        header.style.opacity = 0;
        features.forEach(feature => {
          feature.style.opacity = 0;
          feature.style.transform = `translateY(20px)`;
        });
        return;
      }

      // 스크롤 진행률 (0: 섹션 상단이 뷰포트 상단에 닿을 때, 1: 섹션 하단이 뷰포트 하단에 닿을 때)
      const progress = Math.max(0, Math.min(1, -top / (height - vh)));

      // 1. 배경 페이드 인/아웃
      // 0% -> 20% : 페이드 인
      // 85% -> 100% : 페이드 아웃
      if (progress < 0.2) {
        bg.style.opacity = progress / 0.2;
      } else if (progress > 0.85) {
        bg.style.opacity = (1 - progress) / 0.15;
      } else {
        bg.style.opacity = 1;
      }

      // 2. 헤더 페이드 인/아웃
      // 15% -> 25% : 페이드 인
      // 80% -> 90% : 페이드 아웃
      if (progress >= 0.15 && progress <= 0.25) {
        header.style.opacity = (progress - 0.15) / 0.1;
      } else if (progress > 0.25 && progress < 0.8) {
        header.style.opacity = 1;
      } else if (progress >= 0.8 && progress <= 0.9) {
        header.style.opacity = 1 - (progress - 0.8) / 0.1;
      } else if (progress > 0.9 || progress < 0.15) {
        header.style.opacity = 0;
      }

      // 3. 피처 아이템 순차적 애니메이션
      const featureZoneStart = 0.3;
      const featureZoneEnd = 0.85;
      const featureCount = features.length;
      const featureDuration = (featureZoneEnd - featureZoneStart) / featureCount;

      features.forEach((feature, i) => {
        const start = featureZoneStart + i * featureDuration;
        const end = start + featureDuration;

        let opacity = 0;
        // 각 피쳐의 로컬 진행률 (0 to 1)
        if (progress >= start && progress <= end) {
          const featureProgress = (progress - start) / (end - start);
          // 피크는 중간(0.5)에서, 시작과 끝은 0
          opacity = Math.sin(featureProgress * Math.PI);
        }

        feature.style.opacity = opacity;
        feature.style.transform = `translateY(${20 * (1 - opacity)}px)`;
      });
    };

    window.addEventListener('scroll', handleGameplayScroll, { passive: true });
    handleGameplayScroll(); // 초기 로드 시 한 번 실행
  }
});