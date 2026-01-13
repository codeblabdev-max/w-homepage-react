import { useEffect, useCallback, useState } from 'react'
// import Header from './components/Header' // 헤더 기능 완성 후 연결 예정

// Google Apps Script 웹 앱 URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxyjE27HzRDpblFTAB2Tr3cKRPxJB0QNRdOvsmwag7CTRz4vlgXgR8pFUnHhZ55QQo9/exec';

export default function App() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);

  const handleFabToggle = useCallback(() => {
    setIsFabOpen(prev => !prev);
  }, []);

  const handleDownloadBrochure = useCallback(() => {
    // PDF 다운로드 (public/img/brochure.pdf 경로로 가정)
    const link = document.createElement('a');
    link.href = '/img/brochure.pdf';
    link.download = 'W_회사소개서.pdf';
    link.click();
    setIsFabOpen(false);
  }, []);

  const handleFloatingClick = useCallback(() => {
    const contactModal = document.getElementById('contactModal');
    contactModal?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }, []);

  const handleCloseClick = useCallback(() => {
    const contactModal = document.getElementById('contactModal');
    contactModal?.classList.remove('active');
    document.body.style.overflow = '';
  }, []);

  // 폼 제출 핸들러
  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    // 폼 데이터 수집
    const formData = {
      name: document.getElementById('name')?.value?.trim(),
      companyName: document.getElementById('companyName')?.value?.trim(),
      phone: document.getElementById('phone')?.value?.trim(),
      email: document.getElementById('email')?.value?.trim(),
      budget: document.getElementById('budget')?.value?.trim(),
      message: document.getElementById('message')?.value?.trim(),
      marketingAgree: document.querySelector('.contact-modal__agreement input[type="checkbox"]:last-of-type')?.checked
    };

    // 필수 필드 검증
    if (!formData.name || !formData.phone || !formData.email || !formData.budget || !formData.message) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    // 개인정보 동의 확인
    const privacyCheckbox = document.querySelector('.contact-modal__agreement input[type="checkbox"]:first-of-type');
    if (!privacyCheckbox?.checked) {
      alert('개인정보 수집 및 이용에 동의해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      // no-cors 모드에서는 응답을 읽을 수 없으므로 성공으로 가정
      alert('문의가 접수되었습니다.\n입력하신 이메일로 확인 메일이 발송됩니다.');

      // 폼 초기화
      e.target.reset();
      const charCount = document.querySelector('.char-count');
      if (charCount) charCount.textContent = '(0/1000)';

      // 모달 닫기
      handleCloseClick();

    } catch (error) {
      console.error('제출 오류:', error);
      alert('문의 접수 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, handleCloseClick]);

  useEffect(() => {
    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.gnb__mobile-btn');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (mobileBtn && mobileMenu) {
      mobileBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        mobileBtn.classList.toggle('active');
      });
    }

    // Close mobile menu when clicking a link
    const mobileLinks = document.querySelectorAll('.mobile-menu__link, .mobile-menu__contact');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu?.classList.remove('active');
        mobileBtn?.classList.remove('active');
      });
    });

    // GNB scroll effect
    const gnb = document.querySelector('.gnb');
    const handleScroll = () => {
      if (!gnb) return;
      if (window.scrollY > 50) {
        gnb.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        gnb.style.backdropFilter = 'blur(12px)';
        gnb.style.webkitBackdropFilter = 'blur(12px)';
      } else {
        gnb.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        gnb.style.backdropFilter = 'none';
        gnb.style.webkitBackdropFilter = 'none';
      }
    };
    window.addEventListener('scroll', handleScroll);

    // About Section Scroll Animation
    const aboutSection = document.querySelector('.about');
    const aboutContent = document.querySelector('.about__content');
    const allHighlights = document.querySelectorAll('.about__text .highlight');

    function updateAboutHighlights() {
      if (!aboutSection) return;

      const sectionRect = aboutSection.getBoundingClientRect();
      const sectionTop = sectionRect.top;
      const sectionHeight = sectionRect.height;
      const windowHeight = window.innerHeight;

      const scrollEnd = sectionHeight - windowHeight;
      const progress = Math.max(0, Math.min(1, -sectionTop / scrollEnd));

      const aboutStickyCard = document.querySelector('.about-sticky-reveal');

      if (progress > 0) {
        aboutStickyCard?.classList.add('is-visible');
      } else {
        aboutStickyCard?.classList.remove('is-visible');
      }

      if (progress > 0.05) {
        aboutContent?.classList.add('visible');
      } else {
        aboutContent?.classList.remove('visible');
      }

      const triggerPoints = [0.25, 0.40, 0.55, 0.70];

      allHighlights.forEach((highlight, index) => {
        const triggerPoint = triggerPoints[index] !== undefined ? triggerPoints[index] : 0.95;

        if (progress > triggerPoint) {
          highlight.classList.add('visible');
        } else {
          highlight.classList.remove('visible');
        }
      });
    }

    window.addEventListener('scroll', updateAboutHighlights);
    updateAboutHighlights();

    // Strength Section Animation
    const strengthSection = document.querySelector('.strength');
    const strengthCards = document.querySelectorAll('.strength__card');

    function updateStrengthAnimation() {
      if (!strengthSection) return;

      const rect = strengthSection.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionHeight = rect.height;
      const windowHeight = window.innerHeight;

      const scrollDistance = sectionHeight - windowHeight;
      let progress = 0;

      if (sectionTop <= 0) {
        progress = Math.min(1, Math.max(0, -sectionTop / scrollDistance));
      }

      // 현재 활성화될 카드 인덱스 계산 (0, 1, 2)
      const totalCards = strengthCards.length;
      const activeIndex = Math.min(
        Math.floor(progress * totalCards),
        totalCards - 1
      );

      strengthCards.forEach((card, index) => {
        if (index === 0) return;

        // 해당 카드가 보여야 하는지 결정
        const shouldShow = index <= activeIndex;
        const translateY = shouldShow ? -100 : 0;
        card.style.transform = `translateY(${translateY}%)`;
        card.style.transition = 'transform 0.4s ease-out';
      });
    }

    window.addEventListener('scroll', updateStrengthAnimation);
    updateStrengthAnimation();

    // Trust Section Animation
    const trustStatsContainer = document.querySelector('.trust__stats');
    const trustStats = document.querySelectorAll('.trust__stat');

    trustStats.forEach(stat => stat.classList.add('animate'));

    const trustObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          trustStats.forEach(stat => stat.classList.add('is-visible'));
        } else {
          trustStats.forEach(stat => stat.classList.remove('is-visible'));
        }
      });
    }, { threshold: 0.3 });

    if (trustStatsContainer) {
      trustObserver.observe(trustStatsContainer);
    }

    // Process Section Animation
    const processSection = document.querySelector('.process');
    const processSteps = document.querySelectorAll('.process__step');
    const totalSteps = processSteps.length;

    const baseAngles = [0, 20, 40, 60, 80, 100];
    const angleGap = 20;

    function getArcRadius() {
      const windowWidth = window.innerWidth;
      if (windowWidth <= 768) return 300;
      else if (windowWidth <= 1024) return 400;
      return 400;
    }

    function updateProcessAnimation() {
      if (!processSection) return;

      const sectionRect = processSection.getBoundingClientRect();
      const sectionTop = sectionRect.top;
      const sectionHeight = sectionRect.height;
      const windowHeight = window.innerHeight;

      const startOffset = window.innerWidth <= 1024 ? 0 : 0.35;
      const scrollEnd = sectionHeight - windowHeight;
      const rawProgress = -sectionTop / scrollEnd;

      const adjustedProgress = Math.max(0, (rawProgress - startOffset) / (1 - startOffset));
      const progress = Math.max(0, Math.min(1, adjustedProgress));

      const activeIndex = Math.min(
        Math.round(progress * (totalSteps - 1)),
        totalSteps - 1
      );

      if (window.innerWidth <= 1024) {
        const isMobile = window.innerWidth <= 768;
        const stepHeight = isMobile ? 120 : 150;
        const centerY = isMobile ? 100 : 0;

        processSteps.forEach((step, index) => {
          const offsetFromActive = index - activeIndex;
          const yPos = centerY + (offsetFromActive * stepHeight);

          step.style.transform = `translateY(${yPos}px)`;
          step.style.top = '0';

          step.classList.remove('is-active', 'is-adjacent', 'is-hidden');

          if (index === activeIndex) {
            step.classList.add('is-active');
          } else if (Math.abs(index - activeIndex) === 1) {
            step.classList.add('is-adjacent');
          }
        });
      } else {
        const offsetAngle = progress * (totalSteps - 1) * angleGap;
        const arcRadius = getArcRadius();

        processSteps.forEach((step, index) => {
          const currentAngle = baseAngles[index] - offsetAngle;
          step.style.transform = `translateY(-50%) rotate(${currentAngle}deg) translateX(${arcRadius}px)`;

          step.style.top = '';
          step.style.position = '';
          step.style.left = '';
          step.style.width = '';

          step.classList.remove('is-active', 'is-adjacent', 'is-hidden');

          if (index === activeIndex) {
            step.classList.add('is-active');
          } else if (Math.abs(index - activeIndex) === 1) {
            step.classList.add('is-adjacent');
          } else {
            step.classList.add('is-hidden');
          }
        });
      }
    }

    function initProcessSteps() {
      if (window.innerWidth <= 1024) {
        const isMobile = window.innerWidth <= 768;
        const stepHeight = isMobile ? 120 : 150;
        processSteps.forEach((step, index) => {
          step.style.transform = `translateY(${index * stepHeight}px)`;
          step.style.top = '0';
          if (index === 0) {
            step.classList.add('is-active');
          }
        });
      }
    }

    initProcessSteps();
    window.addEventListener('scroll', updateProcessAnimation);
    window.addEventListener('resize', () => {
      initProcessSteps();
      updateProcessAnimation();
    });
    updateProcessAnimation();

    // Advantages Section Animation
    const advantagesSection = document.querySelector('.advantages');
    const advantagesHeader = document.querySelector('.advantages__header');
    const advantagesCards = document.querySelectorAll('.advantages__card');

    function updateAdvantagesAnimation() {
      if (!advantagesSection) return;

      const sectionRect = advantagesSection.getBoundingClientRect();
      const triggerPoint = window.innerHeight * 0.8;

      if (sectionRect.top < triggerPoint) {
        advantagesHeader?.classList.add('is-visible');
      }

      advantagesCards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        if (cardRect.top < window.innerHeight * 0.9) {
          card.classList.add('is-visible');
        }
      });
    }

    window.addEventListener('scroll', updateAdvantagesAnimation);
    updateAdvantagesAnimation();

    // Advantages Card Hover Effect
    const hoverTitle = document.querySelector('.advantages__hover-title');
    const hoverDesc = document.querySelector('.advantages__hover-desc');
    const hoverFeatures = document.querySelectorAll('.advantages__hover-feature');

    const moduleData = {
      '인증/로그인': {
        desc: '안전하고 빠른 사용자 인증 시스템을 제공합니다.',
        features: [
          { text: '소셜 로그인 (카카오, 네이버, 구글)' },
          { text: 'JWT 기반 토큰 인증' },
          { text: '2단계 인증 (2FA) 지원' }
        ]
      },
      '결제 시스템': {
        desc: '다양한 결제 수단을 간편하게 연동할 수 있습니다.',
        features: [
          { text: '카드/계좌이체/간편결제' },
          { text: '정기결제 및 구독 관리' },
          { text: 'PG사 연동 (토스, 아임포트)' }
        ]
      },
      '대시보드': {
        desc: '핵심 지표를 한눈에 파악할 수 있는 관리 화면입니다.',
        features: [
          { text: '실시간 데이터 시각화' },
          { text: '커스터마이징 가능한 위젯' },
          { text: '권한별 접근 제어' }
        ]
      },
      '알림/메일': {
        desc: '푸시 알림과 이메일을 자동으로 발송합니다.',
        features: [
          { text: '이메일 템플릿 관리' },
          { text: '푸시 알림 (FCM, APNs)' },
          { text: 'SMS/카카오 알림톡' }
        ]
      },
      '파일 관리': {
        desc: '안전한 파일 업로드와 관리 기능을 제공합니다.',
        features: [
          { text: '드래그 앤 드롭 업로드' },
          { text: '이미지 리사이징/최적화' },
          { text: '클라우드 스토리지 연동' }
        ]
      },
      '검색': {
        desc: '빠르고 정확한 검색 기능을 구현합니다.',
        features: [
          { text: '전문 검색 (Full-text)' },
          { text: '자동완성 및 추천' },
          { text: '필터링 및 정렬' }
        ]
      },
      '반응형 UI': {
        desc: 'UI가 모든 디바이스에서 완벽하게 작동합니다.',
        features: [
          { text: '모바일 최적화 레이아웃' },
          { text: '터치 제스처 지원' },
          { text: '다크모드 지원' }
        ]
      },
      '커머스': {
        desc: '온라인 쇼핑몰에 필요한 모든 기능을 제공합니다.',
        features: [
          { text: '상품/재고 관리' },
          { text: '장바구니 및 위시리스트' },
          { text: '주문/배송 추적' }
        ]
      },
      '분석/통계': {
        desc: '데이터 기반의 의사결정을 도와드립니다.',
        features: [
          { text: '사용자 행동 분석' },
          { text: '매출/전환율 리포트' },
          { text: 'A/B 테스트 지원' }
        ]
      }
    };

    const cardModuleMap = [
      '인증/로그인', '결제 시스템', '대시보드',
      '알림/메일', '파일 관리', '검색',
      '반응형 UI', '커머스', '분석/통계'
    ];

    advantagesCards.forEach((card, index) => {
      card.addEventListener('mouseenter', () => {
        const moduleName = cardModuleMap[index];
        const data = moduleData[moduleName];

        if (data) {
          if (hoverTitle) hoverTitle.textContent = moduleName;
          if (hoverDesc) hoverDesc.textContent = data.desc;

          data.features.forEach((feature, i) => {
            if (hoverFeatures[i]) {
              const textEl = hoverFeatures[i].querySelector('.advantages__hover-feature-text');
              if (textEl) textEl.textContent = feature.text;
            }
          });

          advantagesHeader?.classList.add('is-hovering');
        }
      });

      card.addEventListener('mouseleave', () => {
        advantagesHeader?.classList.remove('is-hovering');
      });

      const video = card.querySelector('.advantages__card-video');
      if (video) {
        card.addEventListener('mouseenter', () => {
          video.currentTime = 0;
          video.play();
        });

        card.addEventListener('mouseleave', () => {
          video.pause();
        });
      }

      card.addEventListener('click', () => {
        if (window.innerWidth <= 1024) {
          const moduleName = cardModuleMap[index];
          const data = moduleData[moduleName];
          const isCurrentlyTouched = card.classList.contains('is-touched');

          advantagesCards.forEach(otherCard => {
            const otherVideo = otherCard.querySelector('.advantages__card-video');
            if (otherVideo) otherVideo.pause();
            otherCard.classList.remove('is-touched');
          });

          if (isCurrentlyTouched) {
            advantagesHeader?.classList.remove('is-hovering');
          } else {
            if (video) {
              video.currentTime = 0;
              video.play();
            }
            card.classList.add('is-touched');

            if (data) {
              if (hoverTitle) hoverTitle.textContent = moduleName;
              if (hoverDesc) hoverDesc.textContent = data.desc;
              data.features.forEach((feature, i) => {
                if (hoverFeatures[i]) {
                  const textEl = hoverFeatures[i].querySelector('.advantages__hover-feature-text');
                  if (textEl) textEl.textContent = feature.text;
                }
              });
              advantagesHeader?.classList.add('is-hovering');
            }
          }
        }
      });
    });

    // Product Cards Animation
    const productCardsHeader = document.querySelector('.product-cards__header');
    const productCardsColumns = document.querySelectorAll('.product-cards__column');
    const productCardsSection = document.querySelector('.product-cards');

    let productCardsTimeouts = [];

    const productCardsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 섹션이 보이면 헤더와 컬럼을 순차적으로 표시
          productCardsHeader?.classList.add('is-visible');

          // 각 컬럼을 순차적으로 표시 (1번 → 2번 → 3번)
          productCardsColumns.forEach((column, index) => {
            const timeout = setTimeout(() => {
              column.classList.add('is-visible');
            }, index * 250); // 250ms 간격
            productCardsTimeouts.push(timeout);
          });
        } else {
          // 타임아웃 클리어
          productCardsTimeouts.forEach(t => clearTimeout(t));
          productCardsTimeouts = [];

          // 섹션이 안 보이면 모두 제거
          productCardsHeader?.classList.remove('is-visible');
          productCardsColumns.forEach(column => {
            column.classList.remove('is-visible');
          });
        }
      });
    }, { threshold: 0.2 });

    if (productCardsSection) {
      productCardsObserver.observe(productCardsSection);
    }

    // Contact Modal
    const contactButtons = document.querySelectorAll('.gnb__contact, .mobile-menu__contact');
    const contactModal = document.getElementById('contactModal');
    const closeModalBtn = contactModal?.querySelector('.contact-modal__close');
    const gnbContactBtns = document.querySelectorAll('.gnb__contact');

    const toggleModal = (show) => {
      if (show) {
        contactModal?.classList.add('active');
        document.body.style.overflow = 'hidden';
        gnbContactBtns.forEach(btn => btn.classList.add('active'));
      } else {
        contactModal?.classList.remove('active');
        document.body.style.overflow = '';
        gnbContactBtns.forEach(btn => btn.classList.remove('active'));
      }
    };

    const handleContactButtonClick = (e) => {
      e.preventDefault();
      const btn = e.currentTarget;

      if (btn.classList.contains('active')) {
        toggleModal(false);
        return;
      }

      toggleModal(true);

      if (mobileMenu && mobileMenu.classList.contains('active')) {
        mobileBtn?.click();
      }
    };

    const handleCloseModalClick = () => {
      toggleModal(false);
    };

    // 모달 외부 영역 클릭 시 닫기
    const handleModalBackdropClick = (e) => {
      if (e.target === contactModal) {
        toggleModal(false);
      }
    };

    contactButtons.forEach(btn => {
      btn.addEventListener('click', handleContactButtonClick);
    });

    closeModalBtn?.addEventListener('click', handleCloseModalClick);
    contactModal?.addEventListener('click', handleModalBackdropClick);

    // Input Validation
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    const budgetInput = document.getElementById('budget');

    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        let number = e.target.value.replace(/[^0-9]/g, '');
        let tel = '';

        if (number.startsWith('02')) {
          if (number.length < 3) tel = number;
          else if (number.length < 6) tel = number.substr(0, 2) + '-' + number.substr(2);
          else if (number.length < 10) tel = number.substr(0, 2) + '-' + number.substr(2, 3) + '-' + number.substr(5);
          else tel = number.substr(0, 2) + '-' + number.substr(2, 4) + '-' + number.substr(6);
        } else {
          if (number.length < 4) tel = number;
          else if (number.length < 8) tel = number.substr(0, 3) + '-' + number.substr(3);
          else if (number.length < 11) tel = number.substr(0, 3) + '-' + number.substr(3, 3) + '-' + number.substr(6);
          else tel = number.substr(0, 3) + '-' + number.substr(3, 4) + '-' + number.substr(7);
        }

        e.target.value = tel;
      });
    }

    if (emailInput) {
      emailInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '');
      });
    }

    if (budgetInput) {
      budgetInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
      });
    }

    const messageInput = document.getElementById('message');
    const charCount = document.querySelector('.char-count');

    if (messageInput && charCount) {
      messageInput.addEventListener('input', (e) => {
        const currentLength = e.target.value.length;
        charCount.textContent = `(${currentLength}/1000)`;
      });
    }

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', updateAboutHighlights);
      window.removeEventListener('scroll', updateStrengthAnimation);
      window.removeEventListener('scroll', updateProcessAnimation);
      window.removeEventListener('scroll', updateAdvantagesAnimation);
      trustObserver.disconnect();
      productCardsObserver.disconnect();

      // Contact Modal cleanup
      contactButtons.forEach(btn => {
        btn.removeEventListener('click', handleContactButtonClick);
      });
      closeModalBtn?.removeEventListener('click', handleCloseModalClick);
      contactModal?.removeEventListener('click', handleModalBackdropClick);
    };
  }, []);

  return (
    <>
      {/* Header - 기능 완성 후 연결 예정 */}
      {/* <Header /> */}

      <main>
      {/* Hero Section */}
      <section className="hero">
        <video className="hero__video" autoPlay muted loop playsInline>
          <source src="/img/main1.mp4" type="video/mp4" />
        </video>
        <div className="hero__overlay"></div>
        <div className="hero__content">
          <h1 className="hero__title">아이디어부터 운영까지,<br />흩어진 점들을 하나의 경험으로 연결합니다.</h1>
        </div>
      </section>

      {/* About Section */}
      <section className="about">
        <div className="about__container">
          <div className="about__image card about-sticky-reveal">
            <img src="/img/about.webp" alt="About Image" loading="lazy" width="600" height="400" />
          </div>
          <div className="about__content">
            <p className="about__text" data-highlight-words="">
              W.은 <span className="highlight">'From dots to lines'</span>라는 철학 아래<br />
              비즈니스의 <span className="highlight">흩어진 과정을 하나의 흐름으로</span> 만듭니다.<br />
              W.은 비즈니스 전 과정을 <span className="highlight">하나의 전략</span> 안에서<br />
              랜딩 페이지·제품·소개 자료·서비스가<br />
              <span className="highlight">동일한 방향성을 가진 브랜드 경험</span>으로 만듭니다.
            </p>
          </div>
        </div>
      </section>

      {/* Strength Section */}
      <section className="strength">
        <div className="strength__sticky">
          <div className="strength__container">
            <div className="strength__header">
              <h2 className="strength__title">시작부터 성장까지<br />쉬워집니다</h2>
            </div>

            <div className="strength__window">
              <div className="strength__deck">
                <div className="strength__card" data-index="0">
                  <div className="strength__media">
                    <img src="/img/cost.webp" alt="투명한 비용" loading="lazy" width="768" height="432" />
                  </div>
                  <div className="strength__card-inner">
                    <h3 className="strength__heading">투명한 비용</h3>
                    <p className="strength__desc">숨겨진 비용 없이 명확하게 안내합니다.<br />모든 비용 항목을 투명하게 공개합니다.</p>
                  </div>
                </div>
                <div className="strength__card" data-index="1">
                  <div className="strength__media">
                    <img src="/img/schedule.webp" alt="빠른 일정" loading="lazy" width="768" height="432" />
                  </div>
                  <div className="strength__card-inner">
                    <h3 className="strength__heading">빠른 일정</h3>
                    <p className="strength__desc">효율적인 프로세스로 빠르게 개발합니다.<br />AI 기반 도구를 활용해 개발 속도를 극대화합니다.</p>
                  </div>
                </div>
                <div className="strength__card" data-index="2">
                  <div className="strength__media">
                    <img src="/img/source.webp" alt="소스코드 이관" loading="lazy" width="768" height="432" />
                  </div>
                  <div className="strength__card-inner">
                    <h3 className="strength__heading">소스코드 이관</h3>
                    <p className="strength__desc">프로젝트 완료 후 모든 소스를 전달합니다.<br />종속 없는 완전한 소유권을 보장합니다.</p>
                  </div>
                </div>
              </div>
              <div className="strength__reflection"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust">
        <div className="trust__container">
          <h2 className="trust__title">숫자로 증명하는 신뢰</h2>

          <div className="trust__stats">
            <div className="trust__stat">
              <div className="trust__number">25년+</div>
              <div className="trust__stat-title">개발 노하우</div>
              <div className="trust__stat-desc">2000년부터 축적된 검증된 기술력</div>
            </div>
            <div className="trust__stat">
              <div className="trust__number">100+</div>
              <div className="trust__stat-title">프로젝트</div>
              <div className="trust__stat-desc">다양한 산업의 성공 사례</div>
            </div>
            <div className="trust__stat">
              <div className="trust__number">99.9%</div>
              <div className="trust__stat-title">가용성</div>
              <div className="trust__stat-desc">9년간 무중단 운영</div>
            </div>
            <div className="trust__stat">
              <div className="trust__number">30%<span className="arrow">↓</span></div>
              <div className="trust__stat-title">비용 절감</div>
              <div className="trust__stat-desc">모듈화로 달성한 효율</div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="process">
        <div className="process__container">
          <div className="process__inner">
            <div className="process__left">
              <h2 className="process__title">협업 프로세스</h2>

              <div className="process__features">
                <div className="process__feature">
                  <h4 className="process__feature-title">주간 정기 미팅</h4>
                  <p className="process__feature-desc"><span className="process__highlight">진행 상황 공유</span>와 피드백을 즉시 반영합니다.</p>
                </div>
                <div className="process__feature">
                  <h4 className="process__feature-title">실시간 채팅</h4>
                  <p className="process__feature-desc">언제든 <span className="process__highlight">빠르게 소통</span>하고 즉시 답변받으세요.</p>
                </div>
                <div className="process__feature">
                  <h4 className="process__feature-title">칸반 보드</h4>
                  <p className="process__feature-desc"><span className="process__highlight">작업 현황 확인</span>과 진행 상태를 파악하세요.</p>
                </div>
              </div>
            </div>

            <div className="process__right">
              {[
                { num: '01', label: '상담', desc: '비즈니스 목표와 기술 요구사항을 심층 분석합니다' },
                { num: '02', label: '모듈 구성', desc: '필요한 기능을 모듈 단위로 설계하고 견적을 산출합니다' },
                { num: '03', label: 'FDE 배정', desc: '프로젝트에 최적화된 전담 엔지니어를 배정합니다' },
                { num: '04', label: '개발', desc: '주간 미팅과 실시간 소통으로 투명하게 개발합니다' },
                { num: '05', label: '테스트', desc: '철저한 QA와 사용자 테스트로 품질을 검증합니다' },
                { num: '06', label: '런칭', desc: '배포 후에도 자립 운영이 가능하도록 인수인계합니다' }
              ].map((step, i) => (
                <div className="process__step" key={i}>
                  <span className="process__dot"></span>
                  <div className="process__content">
                    <div className="process__header">
                      <span className="process__number">{step.num}</span>
                      <span className="process__label">{step.label}</span>
                    </div>
                    <p className="process__desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="advantages">
        <div className="advantages__container">
          <div className="advantages__header">
            <h2 className="advantages__title">레고처럼<br />조립하는 개발</h2>

            <div className="advantages__content-wrapper">
              <div className="advantages__default-content">
                <p className="advantages__desc">필요한 모듈만 선택하고<br />나만의 서비스를 완성하세요</p>
                <p className="advantages__desc" style={{ marginTop: '-24px' }}>검증된 모듈을 조합해 빠르게 시작해<br />비즈니스에 맞게 확장하세요</p>
                <p className="advantages__footer-text">+ 20개 이상의 모듈 제공</p>

                <div className="advantages__benefits">
                  <div className="advantages__benefit">
                    <span className="advantages__benefit-title">30% 비용 절감</span>
                    <span className="advantages__benefit-desc">처음부터 만들지 않아 개발 비용을 줄입니다</span>
                  </div>
                  <div className="advantages__benefit">
                    <span className="advantages__benefit-title">빠른 출시</span>
                    <span className="advantages__benefit-desc">검증된 모듈로 개발 기간을 단축합니다</span>
                  </div>
                </div>
              </div>

              <div className="advantages__hover-info">
                <h3 className="advantages__hover-title"></h3>
                <p className="advantages__hover-desc"></p>
                <div className="advantages__hover-features">
                  <div className="advantages__hover-feature">
                    <span className="advantages__hover-feature-text"></span>
                  </div>
                  <div className="advantages__hover-feature">
                    <span className="advantages__hover-feature-text"></span>
                  </div>
                  <div className="advantages__hover-feature">
                    <span className="advantages__hover-feature-text"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="advantages__grid">
            {[
              { name: '인증/로그인', img: '01' },
              { name: '결제 시스템', img: '02' },
              { name: '대시보드', img: '03' },
              { name: '알림/메일', img: '04' },
              { name: '파일 관리', img: '05' },
              { name: '검색', img: '06' },
              { name: '반응형 UI', img: '07' },
              { name: '커머스', img: '08' },
              { name: '분석/통계', img: '09' }
            ].map((module, i) => (
              <div className="advantages__card" key={i}>
                <img src={`/img/module-${module.img}.webp`} alt={module.name} className="advantages__card-img" loading="lazy" width="300" height="200" />
                <video src={`/img/module-${module.img}-hover.mp4`} className="advantages__card-video" muted playsInline></video>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Cards Section */}
      <section className="product-cards">
        <div className="product-cards__container">
          <div className="product-cards__header">
            <h2 className="product-cards__title">W.과 함께하는 방법</h2>
            <p className="product-cards__subtitle">고객의 니즈에 맞춘 최적의 솔루션을 제공합니다</p>
          </div>

          <div className="product-cards__grid">
            {/* Column 1: FDE */}
            <div className="product-cards__column">
              <h3 className="product-cards__column-title">FDE Partner</h3>
              <p className="product-cards__column-subtitle">W.의 엔지니어가 당신의 팀에 직접 합류합니다.</p>

              {[
                { icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', title: '팀에 합류', desc: '모든 과정을 함께하는 전담 엔지니어', userIcon: true },
                { icon: 'M12 6v6l4 2', title: '결과 중심', desc: '비즈니스 목표 달성에 집중', circle: true },
                { icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', title: '신속한 소통', desc: '복잡한 절차 없이 현장에서 바로 해결' },
                { icon: 'M3 10h18', title: '주간 정기 미팅', desc: '매주 진행 상황 공유 및 피드백 반영', rect: true }
              ].map((item, i) => (
                <div className="product-cards__item" key={i}>
                  <div className="product-cards__item-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      {item.circle && <circle cx="12" cy="12" r="10" />}
                      {item.rect && <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /></>}
                      {item.userIcon && <circle cx="9" cy="7" r="4" />}
                      <path d={item.icon} />
                    </svg>
                  </div>
                  <div className="product-cards__item-content">
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 2: W Core */}
            <div className="product-cards__column">
              <h3 className="product-cards__column-title">W Core <span className="product-cards__badge">Self-Service CMS</span></h3>
              <p className="product-cards__column-subtitle">개발자 없이 모든 수정을 클릭만으로 해결하세요.</p>

              {[
                {
                  title: '웹 + 앱 통합',
                  desc: '한 플랫폼에서 모든 채널 관리',
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><rect x="7" y="6" width="4" height="6" rx="1" strokeWidth="1.2"/><rect x="13" y="6" width="4" height="8" rx="1" strokeWidth="1.2"/></svg>
                },
                {
                  title: '즉시 수정',
                  desc: '개발자 없이 클릭만으로 반영',
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                },
                {
                  title: '자동 스케줄',
                  desc: '배너 및 콘텐츠 자동 변경',
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                },
                {
                  title: '실시간 분석',
                  desc: '성과를 한눈에 파악',
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                }
              ].map((item, i) => (
                <div className="product-cards__item" key={i}>
                  <div className="product-cards__item-icon">
                    {item.icon}
                  </div>
                  <div className="product-cards__item-content">
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 3: WorkB */}
            <div className="product-cards__column">
              <h3 className="product-cards__column-title">WorkB <span className="product-cards__badge">20인 이하 무료</span></h3>
              <p className="product-cards__column-subtitle">프로젝트 진행 상황과 팀 운영도 함께 관리하세요.</p>

              {[
                {
                  title: '칸반 보드',
                  desc: '프로젝트 진행 상황 실시간 확인',
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="5" height="8" rx="1"/></svg>
                },
                {
                  title: '출퇴근 관리',
                  desc: '팀원 근태 현황을 한눈에 확인',
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/><path d="M12 2v2"/><path d="M12 20v2"/></svg>
                },
                {
                  title: '휴가 관리',
                  desc: '신청부터 승인까지 자동화',
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M9 16l2 2 4-4"/></svg>
                },
                {
                  title: '지출 관리',
                  desc: '팀 비용을 투명하게 관리',
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><circle cx="16" cy="15" r="2"/></svg>
                }
              ].map((item, i) => (
                <div className="product-cards__item" key={i}>
                  <div className="product-cards__item-icon">
                    {item.icon}
                  </div>
                  <div className="product-cards__item-content">
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer__container">
          <div className="footer__top">
            <h5 className="footer__company">From dots to lines, <span style={{ fontSize: '1.3em' }}>W.</span></h5>
            <nav className="footer__nav">
              <a href="#process">주요기능</a>
              <a href="#">Blog</a>
              <a href="#">W스토어</a>
              <a href="#contact">고객지원</a>
            </nav>
          </div>
          <p className="footer__copyright">©2026 W. All Rights Reserved.</p>
        </div>
      </footer>

      {/* Contact Modal */}
      <div className="contact-modal" id="contactModal" onClick={(e) => { if (e.target.id === 'contactModal') handleCloseClick(); }}>
        <div className="contact-modal__container">
          <button className="contact-modal__close" aria-label="Close Modal" onClick={handleCloseClick}>&times;</button>

          <div className="contact-modal__content">
            <h2 className="contact-modal__title">Project Inquiry</h2>
            <p className="contact-modal__desc">W.과 함께 비즈니스의 새로운 흐름을 만들어보세요.</p>

            <form className="contact-modal__form" onSubmit={handleFormSubmit}>
              <div className="contact-modal__left-group">
                <div className="contact-modal__field">
                  <label htmlFor="name">성 함 <span className="required">*</span></label>
                  <input type="text" id="name" placeholder="김더블" required />
                </div>
                <div className="contact-modal__field">
                  <label htmlFor="companyName">회사명</label>
                  <input type="text" id="companyName" placeholder="더블유닷" />
                </div>
                <div className="contact-modal__field">
                  <label htmlFor="phone">연락처 <span className="required">*</span></label>
                  <input type="tel" id="phone" placeholder="000-0000-0000" maxLength={13} required />
                </div>
                <div className="contact-modal__field">
                  <label htmlFor="email">이메일 주소 <span className="required">*</span></label>
                  <input type="email" id="email" placeholder="abcd@wdot.kr" required />
                </div>
                <div className="contact-modal__field">
                  <label htmlFor="budget">예 산 <span className="required">*</span></label>
                  <div className="contact-modal__input-wrapper">
                    <input type="text" id="budget" placeholder="예산을 입력해주세요" required />
                    <span className="unit">단위 : 만원</span>
                  </div>
                </div>
              </div>

              <div className="contact-modal__right-group">
                <div className="contact-modal__field" style={{ height: '100%' }}>
                  <label htmlFor="message">문의내용 <span className="required">*</span></label>
                  <textarea id="message" placeholder="문의 내용을 입력해주세요" required maxLength={1000}></textarea>
                  <div className="char-count">(0/1000)</div>
                </div>
              </div>

              <div className="contact-modal__agreement">
                <label className="checkbox-wrapper">
                  <input type="checkbox" required />
                  <span className="checkmark"></span>
                  개인정보 수집 및 이용 동의 [필수] <span className="required">*</span>
                </label>
                <label className="checkbox-wrapper">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  마케팅 활용 동의 [선택]
                </label>
              </div>

              <button type="submit" className="contact-modal__submit" disabled={isSubmitting}>
                {isSubmitting ? '접수 중...' : '문의하기'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Floating Action Button Menu */}
      <div className={`fab-menu ${isFabOpen ? 'is-open' : ''}`}>
        {/* Sub buttons - 위에서 아래 순서로 나타남 */}
        <button
          className="fab-menu__item fab-menu__item--download"
          aria-label="회사소개서 다운로드"
          onClick={handleDownloadBrochure}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span className="fab-menu__label">소개서</span>
        </button>
        <button
          className="fab-menu__item fab-menu__item--contact"
          aria-label="문의하기"
          onClick={() => { handleFloatingClick(); setIsFabOpen(false); }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="fab-menu__label">문의하기</span>
        </button>

        {/* Main toggle button - 항상 맨 아래 고정 */}
        <button
          className="fab-menu__toggle"
          aria-label={isFabOpen ? '메뉴 닫기' : '메뉴 열기'}
          onClick={handleFabToggle}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    </>
  )
}
