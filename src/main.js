// Mobile Menu Toggle
const mobileBtn = document.querySelector('.gnb__mobile-btn');
const mobileMenu = document.querySelector('.mobile-menu');

mobileBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    mobileBtn.classList.toggle('active'); // 버튼 아이콘 변경 (X)
});

// Close mobile menu when clicking a link
const mobileLinks = document.querySelectorAll('.mobile-menu__link, .mobile-menu__contact');
mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        mobileBtn.classList.remove('active'); // 버튼 초기화
    });
});

// GNB scroll effect
const gnb = document.querySelector('.gnb');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        gnb.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        gnb.style.backdropFilter = 'blur(12px)';
        gnb.style.webkitBackdropFilter = 'blur(12px)';
    } else {
        gnb.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        gnb.style.backdropFilter = 'none';
        gnb.style.webkitBackdropFilter = 'none';
    }
});

// About Section Scroll Animation
const aboutSection = document.querySelector('.about');
const aboutContent = document.querySelector('.about__content');
const aboutImage = document.querySelector('.about__image'); // Select specific image container
const allHighlights = document.querySelectorAll('.about__text .highlight');

function updateAboutHighlights() {
    if (!aboutSection) return;

    const sectionRect = aboutSection.getBoundingClientRect();
    const sectionTop = sectionRect.top;
    const sectionHeight = sectionRect.height;
    const windowHeight = window.innerHeight;

    // Calculate progress (0 to 1)
    // Total scroll distance = Height - Viewport
    const scrollEnd = sectionHeight - windowHeight;
    const progress = Math.max(0, Math.min(1, -sectionTop / scrollEnd));

    // 1. PIN & ANIMATE IMAGE
    // Trigger animation slightly after pinning start (> 5% progress)
    const aboutStickyCard = document.querySelector('.about-sticky-reveal');

    if (progress > 0.15) {
        if (aboutStickyCard) {
            aboutStickyCard.classList.add('is-visible');
        }
    } else {
        // Remove if scrolled back up
        if (aboutStickyCard) {
            aboutStickyCard.classList.remove('is-visible');
        }
    }

    // 2. TEXT ANIMATION
    if (progress > 0.35) {
        if (aboutContent) aboutContent.classList.add('visible');
    } else {
        if (aboutContent) aboutContent.classList.remove('visible');
    }

    // 3. HIGHLIGHTS (Step-by-step trigger distributed across the rest)
    const triggerPoints = [0.45, 0.60, 0.75, 0.85]; // 0.85에 마지막 텍스트 등장 -> 나머지 15%는 공백 스크롤

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

// Card fade-in animation
const fadeInCards = document.querySelectorAll('.card.fade-in');

function checkCards() {
    fadeInCards.forEach(card => {
        const rect = card.getBoundingClientRect();
        // 카드가 화면 하단(70%)에 도달하면 애니메이션 시작
        if (rect.top < window.innerHeight * 0.7 && rect.bottom > 0) {
            card.classList.add('is-visible');
        } else {
            // 섹션을 벗어나면 클래스 제거 (다시 들어오면 애니메이션 재실행)
            card.classList.remove('is-visible');
        }
    });
}

window.addEventListener('scroll', checkCards);

// Strength Section (Sticky Deck) Animation
const strengthSection = document.querySelector('.strength');
const strengthCards = document.querySelectorAll('.strength__card');

function updateStrengthAnimation() {
    if (!strengthSection) return;

    const rect = strengthSection.getBoundingClientRect();
    const sectionTop = rect.top;
    const sectionHeight = rect.height;
    const windowHeight = window.innerHeight;

    // Calculate Scroll Progress
    // Section pins for (sectionHeight - windowHeight) pixels.
    const scrollDistance = sectionHeight - windowHeight;
    let progress = 0;

    if (sectionTop <= 0) {
        progress = Math.min(1, Math.max(0, -sectionTop / scrollDistance));
    }

    // Timeline:
    // Card 1 (Index 0): Base card, always visible (or fades out?)
    // Card 2 (Index 1): Slides up at 0.1 -> 0.4
    // Card 3 (Index 2): Slides up at 0.5 -> 0.8

    strengthCards.forEach((card, index) => {
        // Card 0 (First card) is static base
        if (index === 0) return;

        // Sequential Timing (Fix for overlapping issue)
        // Card 1: 0.15 ~ 0.55
        // Card 2: 0.55 ~ 0.95
        const duration = 0.4;
        const triggerStart = 0.15 + ((index - 1) * duration);
        const triggerEnd = triggerStart + duration;

        let cardProgress = (progress - triggerStart) / (triggerEnd - triggerStart);
        cardProgress = Math.min(1, Math.max(0, cardProgress));

        // Easing: Sine Ease-In-Out (Softer than before, but sequential)
        const easedProgress = -(Math.cos(Math.PI * cardProgress) - 1) / 2;

        // Card is at top: 100%. We need to move it UP by 100% to reach top: 0.
        const translateY = -easedProgress * 100;
        card.style.transform = `translateY(${translateY}%)`;
    });
}

window.addEventListener('scroll', updateStrengthAnimation);
updateStrengthAnimation();

// Trust Section Animation with IntersectionObserver
const trustStatsContainer = document.querySelector('.trust__stats');
const trustStats = document.querySelectorAll('.trust__stat');

// 페이지 로드 시 animate 클래스 추가
trustStats.forEach(stat => stat.classList.add('animate'));

const trustObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            trustStats.forEach(stat => {
                stat.classList.add('is-visible');
            });
        } else {
            trustStats.forEach(stat => {
                stat.classList.remove('is-visible');
            });
        }
    });
}, { threshold: 1.0 });

if (trustStatsContainer) {
    trustObserver.observe(trustStatsContainer);
}

// Process Section Animation - Arc Carousel with transform-origin
const processSection = document.querySelector('.process');
const processSteps = document.querySelectorAll('.process__step');
const totalSteps = processSteps.length;

// 각 step의 기본 각도 배열 (0도가 중앙, 양수가 아래, 음수가 위)
// 01이 협업 프로세스 텍스트와 같은 높이에서 시작
const baseAngles = [0, 20, 40, 60, 80, 100];
const angleGap = 20; // 각 단계 사이 간격

// 반응형에 따른 원호 반지름 계산
function getArcRadius() {
    const windowWidth = window.innerWidth;
    if (windowWidth <= 768) {
        return 300; // 모바일
    } else if (windowWidth <= 1024) {
        return 400; // 태블릿
    }
    return 400; // 데스크톱
}

// 태블릿/모바일 체크
function isResponsiveMode() {
    return window.innerWidth <= 1024;
}

function updateProcessAnimation() {
    if (!processSection) return;

    const sectionRect = processSection.getBoundingClientRect();
    const sectionTop = sectionRect.top;
    const sectionHeight = sectionRect.height;
    const windowHeight = window.innerHeight;

    // 섹션 진입 후 일정 구간(35%) 뒤부터 애니메이션 시작 (모바일/태블릿은 즉시 시작)
    const startOffset = window.innerWidth <= 1024 ? 0 : 0.35;
    const scrollEnd = sectionHeight - windowHeight;
    const rawProgress = -sectionTop / scrollEnd;

    // offset 적용: startOffset 이전은 0, 이후 구간을 0~1로 매핑
    const adjustedProgress = Math.max(0, (rawProgress - startOffset) / (1 - startOffset));
    const progress = Math.max(0, Math.min(1, adjustedProgress));

    // 활성화된 아이템 인덱스 계산
    const activeIndex = Math.min(
        Math.round(progress * (totalSteps - 1)),
        totalSteps - 1
    );

    // 태블릿/모바일: 세로 슬라이드
    if (window.innerWidth <= 1024) {
        const isMobile = window.innerWidth <= 768;
        const stepHeight = isMobile ? 120 : 150; // 모바일 간격 80 -> 120으로 증가
        // 모바일 height가 작으므로 중앙 정렬이 나을 수 있음.
        // Tablet height: 350px. Item height: 150px.
        // Mobile height: 360px (예정). Item height: 120px.
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
        // 데스크톱: 원호 카르셀
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

// 초기 위치 설정 (태블릿/모바일)
function initProcessSteps() {
    if (window.innerWidth <= 1024) {
        const isMobile = window.innerWidth <= 768;
        const stepHeight = isMobile ? 120 : 150; // 모바일 간격 120으로 일치
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

    // Header animation
    if (sectionRect.top < triggerPoint) {
        advantagesHeader.classList.add('is-visible');
    }

    // Cards staggered animation
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
const hoverInfo = document.querySelector('.advantages__hover-info');
const hoverTitle = document.querySelector('.advantages__hover-title');
const hoverDesc = document.querySelector('.advantages__hover-desc');
const hoverFeatures = document.querySelectorAll('.advantages__hover-feature');

// 모듈별 상세 데이터
const moduleData = {
    '인증/로그인': {
        desc: '안전하고 빠른 사용자 인증 시스템을 제공합니다.',
        features: [
            { icon: 'users', text: '소셜 로그인 (카카오, 네이버, 구글)' },
            { icon: 'shield', text: 'JWT 기반 토큰 인증' },
            { icon: 'fingerprint', text: '2단계 인증 (2FA) 지원' }
        ]
    },
    '결제 시스템': {
        desc: '다양한 결제 수단을 간편하게 연동할 수 있습니다.',
        features: [
            { icon: 'credit-card', text: '카드/계좌이체/간편결제' },
            { icon: 'refresh', text: '정기결제 및 구독 관리' },
            { icon: 'link', text: 'PG사 연동 (토스, 아임포트)' }
        ]
    },
    '대시보드': {
        desc: '핵심 지표를 한눈에 파악할 수 있는 관리 화면입니다.',
        features: [
            { icon: 'chart', text: '실시간 데이터 시각화' },
            { icon: 'settings', text: '커스터마이징 가능한 위젯' },
            { icon: 'lock', text: '권한별 접근 제어' }
        ]
    },
    '알림/메일': {
        desc: '푸시 알림과 이메일을 자동으로 발송합니다.',
        features: [
            { icon: 'mail', text: '이메일 템플릿 관리' },
            { icon: 'bell', text: '푸시 알림 (FCM, APNs)' },
            { icon: 'message', text: 'SMS/카카오 알림톡' }
        ]
    },
    '파일 관리': {
        desc: '안전한 파일 업로드와 관리 기능을 제공합니다.',
        features: [
            { icon: 'upload', text: '드래그 앤 드롭 업로드' },
            { icon: 'image', text: '이미지 리사이징/최적화' },
            { icon: 'cloud', text: '클라우드 스토리지 연동' }
        ]
    },
    '검색': {
        desc: '빠르고 정확한 검색 기능을 구현합니다.',
        features: [
            { icon: 'text', text: '전문 검색 (Full-text)' },
            { icon: 'sparkles', text: '자동완성 및 추천' },
            { icon: 'filter', text: '필터링 및 정렬' }
        ]
    },
    '반응형 UI': {
        desc: 'UI가 모든 디바이스에서 완벽하게 작동합니다.',
        features: [
            { icon: 'mobile', text: '모바일 최적화 레이아웃' },
            { icon: 'touch', text: '터치 제스처 지원' },
            { icon: 'moon', text: '다크모드 지원' }
        ]
    },
    '커머스': {
        desc: '온라인 쇼핑몰에 필요한 모든 기능을 제공합니다.',
        features: [
            { icon: 'box', text: '상품/재고 관리' },
            { icon: 'heart', text: '장바구니 및 위시리스트' },
            { icon: 'truck', text: '주문/배송 추적' }
        ]
    },
    '분석/통계': {
        desc: '데이터 기반의 의사결정을 도와드립니다.',
        features: [
            { icon: 'activity', text: '사용자 행동 분석' },
            { icon: 'pie-chart', text: '매출/전환율 리포트' },
            { icon: 'beaker', text: 'A/B 테스트 지원' }
        ]
    }
};

// 아이콘 SVG 맵
const iconSvgs = {
    'users': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    'shield': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    'fingerprint': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"/><path d="M5 19.5C5.5 18 6 15 6 12c0-.7.12-1.37.34-2"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M9 6.8a6 6 0 0 1 9 5.2c0 .47 0 1.17-.02 2"/></svg>',
    'credit-card': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
    'refresh': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>',
    'link': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    'chart': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    'settings': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
    'lock': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    'mail': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>',
    'bell': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    'message': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    'upload': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
    'image': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
    'cloud': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>',
    'text': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',
    'sparkles': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M5 19l.5 1.5L7 21l-1.5.5L5 23l-.5-1.5L3 21l1.5-.5L5 19z"/><path d="M19 13l.5 1.5L21 15l-1.5.5L19 17l-.5-1.5L17 15l1.5-.5L19 13z"/></svg>',
    'filter': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
    'mobile': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
    'touch': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>',
    'moon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    'box': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    'heart': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    'truck': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    'activity': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    'pie-chart': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>',
    'beaker': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4.5 3h15"/><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"/><path d="M6 14h12"/></svg>'
};

// 카드 인덱스와 모듈 이름 매핑
const cardModuleMap = [
    '인증/로그인', '결제 시스템', '대시보드',
    '알림/메일', '파일 관리', '검색',
    '반응형 UI', '커머스', '분석/통계'
];

const advantagesContainer = document.querySelector('.advantages__container');

advantagesCards.forEach((card, index) => {
    card.addEventListener('mouseenter', () => {
        const moduleName = cardModuleMap[index];
        const data = moduleData[moduleName];

        if (data) {
            hoverTitle.textContent = moduleName;
            hoverDesc.textContent = data.desc;

            data.features.forEach((feature, i) => {
                if (hoverFeatures[i]) {
                    hoverFeatures[i].querySelector('.advantages__hover-feature-text').textContent = feature.text;
                }
            });

            advantagesHeader.classList.add('is-hovering');
        }
    });

    card.addEventListener('mouseleave', () => {
        advantagesHeader.classList.remove('is-hovering');
    });

    // 비디오 호버 재생
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

    // 모바일/태블릿 터치 대응 - 탭(클릭)하면 비디오 재생 + 설명 표시
    card.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024) {
            const moduleName = cardModuleMap[index];
            const data = moduleData[moduleName];
            const isCurrentlyTouched = card.classList.contains('is-touched');

            // 모든 카드의 비디오 정지 및 상태 초기화
            advantagesCards.forEach(otherCard => {
                const otherVideo = otherCard.querySelector('.advantages__card-video');
                if (otherVideo) {
                    otherVideo.pause();
                }
                otherCard.classList.remove('is-touched');
            });

            // 같은 카드를 다시 터치한 경우 - 닫기
            if (isCurrentlyTouched) {
                advantagesHeader.classList.remove('is-hovering');
            } else {
                // 새 카드 터치 - 열기
                if (video) {
                    video.currentTime = 0;
                    video.play();
                }
                card.classList.add('is-touched');

                // 왼쪽 설명 업데이트
                if (data) {
                    hoverTitle.textContent = moduleName;
                    hoverDesc.textContent = data.desc;
                    data.features.forEach((feature, i) => {
                        if (hoverFeatures[i]) {
                            hoverFeatures[i].querySelector('.advantages__hover-feature-text').textContent = feature.text;
                        }
                    });
                    advantagesHeader.classList.add('is-hovering');
                }
            }
        }
    });
});

// 모바일/태블릿에서 카드 외부 터치 시 비디오 정지 + 설명 숨김
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 1024) {
        let touchedAnyCard = false;
        advantagesCards.forEach(card => {
            if (card.contains(e.target)) {
                touchedAnyCard = true;
            } else {
                const video = card.querySelector('.advantages__card-video');
                if (video && !video.paused) {
                    video.pause();
                    card.classList.remove('is-touched');
                }
            }
        });
        // 카드 외부 터치 시 설명 숨김
        if (!touchedAnyCard && !advantagesHeader.contains(e.target)) {
            advantagesHeader.classList.remove('is-hovering');
        }
    }
});


// Product Cards Section Animation
const productCardsHeader = document.querySelector('.product-cards__header');
const productCardsColumns = document.querySelectorAll('.product-cards__column');

const observerOptions = {
    threshold: 0.15
};

const productCardsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
        } else {
            entry.target.classList.remove('is-visible');
        }
    });
}, observerOptions);

if (productCardsHeader) {
    productCardsObserver.observe(productCardsHeader);
}

productCardsColumns.forEach(column => {
    productCardsObserver.observe(column);
});
document.addEventListener('DOMContentLoaded', () => {
    const contactButtons = document.querySelectorAll('.gnb__contact, .mobile-menu__contact');
    const contactModal = document.getElementById('contactModal');
    const closeModalBtn = contactModal.querySelector('.contact-modal__close');
    const mobileMenu = document.querySelector('.mobile-menu');
    const gnbContactBtns = document.querySelectorAll('.gnb__contact'); // Specific selection for toggle

    // Helper to toggle modal
    const toggleModal = (show) => {
        if (show) {
            contactModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            gnbContactBtns.forEach(btn => btn.classList.add('active'));
        } else {
            contactModal.classList.remove('active');
            document.body.style.overflow = '';
            gnbContactBtns.forEach(btn => btn.classList.remove('active'));
        }
    };

    // Open/Toggle Modal
    contactButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();

            // If btn is gnb button and already active, close.
            if (btn.classList.contains('active')) {
                toggleModal(false);
                return;
            }

            toggleModal(true);

            if (mobileMenu && mobileMenu.classList.contains('active')) {
                const mobileBtn = document.querySelector('.gnb__mobile-btn');
                if (mobileBtn) mobileBtn.click();
            }
        });
    });

    // Close Modal
    closeModalBtn.addEventListener('click', () => {
        toggleModal(false);
    });

    // Close on overlay click
    // Close on overlay click (Disabled as per user request)
    /*
    contactModal.addEventListener('click', (e) => {
        if (e.target === contactModal) {
            toggleModal(false);
        }
    });
    */

    // Input Validation and Formatting
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    const budgetInput = document.getElementById('budget');

    // Phone: Numbers only + Smart Hyphen (02 vs 010)
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let number = e.target.value.replace(/[^0-9]/g, '');
            let tel = '';

            // Seoul Area Code (02)
            if (number.startsWith('02')) {
                if (number.length < 3) {
                    tel = number;
                } else if (number.length < 6) {
                    tel = number.substr(0, 2) + '-' + number.substr(2);
                } else if (number.length < 10) {
                    tel = number.substr(0, 2) + '-' + number.substr(2, 3) + '-' + number.substr(5);
                } else {
                    tel = number.substr(0, 2) + '-' + number.substr(2, 4) + '-' + number.substr(6);
                }
            }
            // Other Area Codes / Mobile (010, 031, etc.)
            else {
                if (number.length < 4) {
                    tel = number;
                } else if (number.length < 8) {
                    tel = number.substr(0, 3) + '-' + number.substr(3);
                } else if (number.length < 11) {
                    tel = number.substr(0, 3) + '-' + number.substr(3, 3) + '-' + number.substr(6);
                } else {
                    tel = number.substr(0, 3) + '-' + number.substr(3, 4) + '-' + number.substr(7);
                }
            }

            e.target.value = tel;
        });
    }

    // Email: Block Korean
    if (emailInput) {
        emailInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '');
        });
    }

    // Budget: Numbers only
    if (budgetInput) {
        budgetInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    }

    // Message Character Count
    const messageInput = document.getElementById('message');
    const charCount = document.querySelector('.char-count');

    if (messageInput && charCount) {
        messageInput.addEventListener('input', (e) => {
            const currentLength = e.target.value.length;
            charCount.textContent = `(${currentLength}/1000)`;
        });
    }


});
