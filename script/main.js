document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 0. Gameplay 섹션: 페이드 인 된 지점으로 스크롤 이동 ---------- */
  const scrollToGameplayReveal = () => {
    const spacer = document.querySelector('#gameplay .gameplay-spacer');
    if (!spacer) {
      document.getElementById('gameplay')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const vh = window.innerHeight;
    const spacerHeight = spacer.offsetHeight;
    const spacerTop = spacer.getBoundingClientRect().top + window.scrollY;
    // handleGameplayScroll의 progress 계산과 동일한 기준.
    // progress 0.4 지점 = 배경/헤더 페이드인이 끝나고 첫 feature가 보이기 시작하는 안정 구간
    const targetProgress = 0.4;
    const targetY = spacerTop + targetProgress * (spacerHeight - vh);
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  document.querySelectorAll('a[href="#gameplay"]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToGameplayReveal();
    });
  });

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
      desc: '5m 앞의 표지판이나 아는 사람의 얼굴조차 초점 없이 뿌옇게 번집니다. 다가오는 버스 번호를 확인하거나 계단을 내려가는 기본적인 일상조차 위태롭습니다.',
      img: 'images/고도근시.webp'
    },
    glaucoma: {
      title: '녹내장',
      desc: '시야 주변부가 어둠에 잠식되어 좁은 터널로만 세상을 봅니다. 옆에서 갑자기 다가오는 사람이나 차를 인지하지 못해 붐비는 거리를 걷거나 길을 건널 때 충돌 위험이 큽니다.',
      img: 'images/녹내장.webp'
    },
    cataract: {
      title: '백내장',
      desc: '뿌연 안개가 낀 유리창 너머로 세상을 보는 듯합니다. 마주 오는 차의 눈부신 빛 번짐으로 도로 구분이 어렵고, 밝은 햇빛 아래에서는 글씨를 읽기조차 힘듭니다.',
      img: 'images/백내장.webp'
    },
    achromatopsia: {
      title: '전색맹',
      desc: '색이 완전히 사라져 오직 명암만으로 세상을 구분합니다. 신호등 확인, 지하철 노선도 읽기, 옷이나 음식의 상태를 식별하는 일상적인 선택마다 커다란 제약을 받습니다.',
      img: 'images/전색맹.webp'
    },
    amd: {
      title: '황반변성',
      desc: '시야 중심부가 검게 가려져 정면을 볼수록 아무것도 보이지 않습니다. 마주 앉은 사람의 표정을 읽거나 스마트폰 문자·책을 읽는 등 시선을 한곳에 모으는 작업이 불가능해집니다.',
      img: 'images/황반변성.webp'
    }
  };

  const viewerImg = document.querySelector('.vision-viewer-image');
  const viewerTitle = document.querySelector('.vision-viewer-title');
  const viewerDesc = document.querySelector('.vision-viewer-desc');
  const viewerTag = document.querySelector('.vision-viewer-tag');
  const tabs = document.querySelectorAll('.vision-tab');

  if (viewerImg && tabs.length) {
    // 초기 활성 탭에 맞춰 태그 텍스트 동기화
    const initialTab = document.querySelector('.vision-tab.active') || tabs[0];
    const initialData = visionData[initialTab?.dataset.key];
    if (viewerTag && initialData) {
      viewerTag.textContent = `LIVE · ${initialData.title}`;
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const key = tab.dataset.key;
        const data = visionData[key];
        if (!data) return;

        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        viewerImg.classList.add('fade-out');
        viewerImg.classList.remove('fade-in');

        if (viewerTag) {
          viewerTag.classList.add('pulse');
        }

        setTimeout(() => {
          viewerImg.src = data.img;
          viewerTitle.textContent = data.title;
          viewerDesc.textContent = data.desc;
          viewerImg.classList.remove('fade-out');
          viewerImg.classList.add('fade-in');

          if (viewerTag) {
            viewerTag.textContent = `LIVE · ${data.title}`;
          }
        }, 300);

        if (viewerTag) {
          // pulse 애니메이션이 끝난 뒤 클래스 제거 (다음 전환에서 재생되도록)
          setTimeout(() => viewerTag.classList.remove('pulse'), 700);
        }
      });
    });
  }

  /* ---------- 6. Hero CTA buttons scroll to gameplay ---------- */
  document.querySelectorAll('.cta-primary, .cta-secondary').forEach(btn => {
    if (!btn.dataset.target) return;
    btn.addEventListener('click', (e) => {
      if (btn.dataset.target === '#gameplay') {
        scrollToGameplayReveal();
        return;
      }
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
        if (bg.style.opacity !== '0') {
          bg.style.opacity = 0;
          header.style.opacity = 0;
          features.forEach(feature => {
            feature.style.opacity = 0;
            feature.style.transform = `translateY(20px)`;
          });
        }
        return;
      }

      // 스크롤 진행률 (0: 섹션 상단이 뷰포트 상단에 닿을 때, 1: 섹션 하단이 뷰포트 하단에 닿을 때)
      const progress = Math.max(0, Math.min(1, -top / (height - vh)));

      // 1. 배경 애니메이션 (클립 & 페이드)
      // 0% -> 35% : 중앙에서 확장하며 나타남 (더 부드럽게)
      // 80% -> 100% : 중앙으로 축소되며 사라짐
      const fadeInEnd = 0.35; // 애니메이션 구간 늘림
      const fadeOutStart = 0.8;

      let currentOpacity = 0;
      let currentInset = 50;

      if (progress > fadeInEnd && progress < fadeOutStart) {
        // 중간의 안정된 상태
        currentOpacity = 1;
        currentInset = 0;
      } else if (progress <= fadeInEnd) {
        // 인트로 애니메이션 (Ease-out Cubic)
        const localProgress = progress / fadeInEnd;
        const easedProgress = 1 - Math.pow(1 - localProgress, 3);
        currentOpacity = easedProgress;
        currentInset = 50 * (1 - easedProgress);
      } else if (progress >= fadeOutStart) {
        // 아우트로 애니메이션 (Ease-in-out Cubic)
        const localProgress = (progress - fadeOutStart) / (1 - fadeOutStart);
        const easedProgress = localProgress < 0.5
          ? 4 * localProgress * localProgress * localProgress
          : 1 - Math.pow(-2 * localProgress + 2, 3) / 2;
        currentOpacity = 1 - easedProgress;
        currentInset = 50 * easedProgress;
      }

      bg.style.opacity = Math.max(0, Math.min(1, currentOpacity));
      bg.style.clipPath = `inset(${currentInset}% ${currentInset}% ${currentInset}% ${currentInset}%)`;

      // 2. 헤더 페이드 인/아웃
      // 20% -> 35% : 페이드 인
      // 80% -> 90% : 페이드 아웃
      if (progress >= 0.20 && progress <= 0.35) {
        header.style.opacity = (progress - 0.20) / 0.15;
      } else if (progress > 0.35 && progress < 0.8) {
        header.style.opacity = 1;
      } else if (progress >= 0.8 && progress <= 0.9) {
        header.style.opacity = 1 - (progress - 0.8) / 0.1;
      } else if (progress > 0.9 || progress < 0.20) {
        header.style.opacity = 0;
      }

      // 3. 피처 아이템 순차적 애니메이션
      const featureZoneStart = 0.25;
      const featureZoneEnd = 0.95;
      const featureCount = features.length;
      const featureDuration = (featureZoneEnd - featureZoneStart) / featureCount;

      features.forEach((feature, i) => {
        const zoneStart = featureZoneStart + i * featureDuration;
        const zoneEnd = zoneStart + featureDuration * 0.8; // 각 아이템이 보이는 시간을 약간 줄임
        const zoneLength = zoneEnd - zoneStart;

        // background와 동일한 3단계 구간 비율 (intro 35% / stable / outro 20%)
        const fadeInRatio = 0.35;
        const fadeOutRatio = 0.8;
        const localFadeInEnd = zoneStart + zoneLength * fadeInRatio;
        const localFadeOutStart = zoneStart + zoneLength * fadeOutRatio;

        let opacity = 0;
        let inset = 50;

        if (progress < zoneStart || progress > zoneEnd) {
          opacity = 0;
          inset = 50;
        } else if (progress <= localFadeInEnd) {
          // 인트로 애니메이션 (Ease-out Cubic)
          const localProgress = (progress - zoneStart) / (localFadeInEnd - zoneStart);
          const eased = 1 - Math.pow(1 - localProgress, 3);
          opacity = eased;
          inset = 50 * (1 - eased);
        } else if (progress < localFadeOutStart) {
          // 중간의 안정된 상태
          opacity = 1;
          inset = 0;
        } else {
          // 아우트로 애니메이션 (Ease-in-out Cubic)
          const localProgress = (progress - localFadeOutStart) / (zoneEnd - localFadeOutStart);
          const eased = localProgress < 0.5
            ? 4 * localProgress * localProgress * localProgress
            : 1 - Math.pow(-2 * localProgress + 2, 3) / 2;
          opacity = 1 - eased;
          inset = 50 * eased;
        }

        opacity = Math.max(0, Math.min(1, opacity));
        feature.style.opacity = opacity;
        feature.style.clipPath = `inset(${inset}% ${inset}% ${inset}% ${inset}%)`;
        feature.style.transform = `translateY(${20 * (1 - opacity)}px)`;
      });
    };

    window.addEventListener('scroll', handleGameplayScroll, { passive: true });
    handleGameplayScroll(); // 초기 로드 시 한 번 실행
  }

  /* ---------- 9. Match experience-image height to feature-grid (2-card) height on desktop ---------- */
  const experienceImage = document.querySelector('.experience-image');
  const featureGrid = document.querySelector('.feature-grid');
  if (experienceImage && featureGrid) {
    const syncExperienceImageHeight = () => {
      if (window.innerWidth > 1024) {
        // feature-grid는 2x2 그리드이므로 전체 높이가 곧 카드 2개 높이(행 2개 + gap)와 같음
        experienceImage.style.height = `${featureGrid.offsetHeight}px`;
      } else {
        experienceImage.style.height = '';
      }
    };
    syncExperienceImageHeight();
    window.addEventListener('resize', syncExperienceImageHeight);
    window.addEventListener('load', syncExperienceImageHeight);
  }
});