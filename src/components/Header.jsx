export default function Header() {
  return (
    <>
      {/* Header / GNB */}
      <header className="header">
        <nav className="gnb">
          <a href="#" className="gnb__logo">
            <img src="/img/logo_light.svg" alt="Logo" />
          </a>

          <ul className="gnb__menu">
            <li className="gnb__item">
              <a href="#" className="gnb__link">
                Service
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </a>
              <div className="gnb__dropdown">
                <a href="#" className="gnb__dropdown-link">웹 개발</a>
                <a href="#" className="gnb__dropdown-link">앱 개발</a>
                <a href="#" className="gnb__dropdown-link">UI/UX 디자인</a>
                <a href="#" className="gnb__dropdown-link">브랜딩</a>
              </div>
            </li>
            <li className="gnb__item">
              <a href="#" className="gnb__link">Portfolio</a>
            </li>
            <li className="gnb__item">
              <a href="#" className="gnb__link">Blog</a>
            </li>
          </ul>

          <button className="gnb__contact">
            <span className="text">문의하기</span>
            <span className="close-icon" style={{ display: 'none' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"></path>
              </svg>
            </span>
          </button>

          <button className="gnb__mobile-btn" aria-label="메뉴 열기">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </nav>
      </header>

      {/* Mobile Menu */}
      <div className="mobile-menu">
        <a href="#" className="mobile-menu__link">Service</a>
        <a href="#" className="mobile-menu__link">Portfolio</a>
        <a href="#" className="mobile-menu__link">Blog</a>
        <a href="#contact" className="mobile-menu__contact">문의하기</a>
      </div>
    </>
  )
}
