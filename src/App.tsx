import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import { 
  Shield, Menu, X, Bell, Sparkles, CheckCircle, ArrowRight, BookOpen
} from 'lucide-react';

// Pages
import { Home } from './pages/Home';
import { SalesPage } from './pages/SalesPage';
import { DessertSalesPage } from './pages/DessertSalesPage';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { AdminDashboard } from './pages/AdminDashboard';
import { Cookbooks } from './pages/Cookbooks';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { About } from './pages/About';

import { initDb, checkAndFixSeoConfigs, firePixel, db } from './db';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const id = hash.replace('#', '');
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

function App() {
  // Initialize Mock DB
  useEffect(() => {
    initDb();
    checkAndFixSeoConfigs();
  }, []);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [announcementText, setAnnouncementText] = useState('🔥 Special Offer: The High-Protein Dessert Cookbook is $15.99 today! Click here to get it →');
  const [announcementBgStart, setAnnouncementBgStart] = useState('#064e3b');
  const [announcementBgEnd, setAnnouncementBgEnd] = useState('#10b981');
  const [announcementTextColor, setAnnouncementTextColor] = useState('#ecfdf5');

  // Automatic promo popup trigger after 5 seconds on site
  useEffect(() => {
    const isDismissed = sessionStorage.getItem('bhyou_promo_dismissed');
    if (isDismissed) return;

    const timer = setTimeout(() => {
      setShowPromoModal(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Close handler with session persistence
  const handleClosePromoModal = () => {
    setShowPromoModal(false);
    sessionStorage.setItem('bhyou_promo_dismissed', 'true');
  };

  // Keyboard Escape handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClosePromoModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleBuyPromoModal = () => {
    firePixel('Google Ads', 'click_buy_cookbook', { price: 15.99 });
    firePixel('Meta Pixel', 'InitiateCheckout', { 
      content_name: 'The High-Protein Dessert Cookbook: 70 Healthy Recipes Under 400 Calories', 
      value: 15.99, 
      currency: 'USD' 
    });
    firePixel('Pinterest Tag', 'checkout_click', { 
      product_id: 'high-protein-dessert-cookbook-70', 
      value: 15.99 
    });
    showToast('Opening Gumroad Secure Checkout...', 'success');
    window.open('https://bhyou.gumroad.com/l/bhyou', '_blank');
    handleClosePromoModal();
  };

  // Scroll detection for Navbar transparency
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load announcement settings from db
  useEffect(() => {
    const loadSettings = () => {
      db.getAnnouncementSettings().then((settings) => {
        if (settings && typeof settings.enabled === 'boolean') {
          setShowAnnouncement(settings.enabled);
          if (settings.text) setAnnouncementText(settings.text);
          if (settings.bgGradientStart) setAnnouncementBgStart(settings.bgGradientStart);
          if (settings.bgGradientEnd) setAnnouncementBgEnd(settings.bgGradientEnd);
          if (settings.textColor) setAnnouncementTextColor(settings.textColor);
        }
      }).catch(err => {
        console.error("Error loading announcement settings:", err);
      });
    };

    loadSettings();
    window.addEventListener('announcement_updated', loadSettings);
    return () => window.removeEventListener('announcement_updated', loadSettings);
  }, []);

  // Show dynamic toast alert
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };


  return (
    <Router>
      <ScrollToTop />
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* Sticky Announcement Bar */}
        {showAnnouncement && (
          <div 
            className="announcement-bar"
            style={{
              background: `linear-gradient(90deg, ${announcementBgStart} 0%, ${announcementBgEnd} 50%, ${announcementBgStart} 100%)`,
              color: announcementTextColor,
              borderBottom: `1px solid ${announcementBgEnd}44`
            }}
          >
            <div className="announcement-content-wrapper" onClick={() => setShowPromoModal(true)}>
              <div className="announcement-marquee">
                <span>{announcementText}</span>
                <span style={{ margin: '0 40px' }}>|</span>
                <span>{announcementText}</span>
              </div>
            </div>
            <button 
              className="announcement-close-btn" 
              style={{ color: announcementTextColor }}
              onClick={(e) => {
                e.stopPropagation();
                setShowAnnouncement(false);
              }}
              aria-label="Close Announcement"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Navigation Bar */}
        <nav className={`navbar ${isScrolled ? 'scrolled' : ''} ${showAnnouncement ? 'navbar-with-announcement' : ''}`}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Logo */}
            <Link to="/" className="nav-logo" onClick={() => setMobileMenuOpen(false)}>
              <img src="https://i.ibb.co/zVRtqFyS/BHYou-Healthful-Protein-Logo-removebg-preview.png" alt="BHYou Logo" className="nav-logo-img" />
            </Link>

            {/* Desktop Menu links */}
            <ul className="nav-links">
              <li>
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/cookbooks" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Cookbooks
                </NavLink>
              </li>
              <li>
                <NavLink to="/blog" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Blogs and Recipes
                </NavLink>
              </li>
              <li>
                <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  About BHYou
                </NavLink>
              </li>
            </ul>

            {/* CTA buttons */}
            <div className="nav-cta">
              <Link to="/cookbooks" className="btn btn-primary btn-sm nav-cta-desktop" style={{ textDecoration: 'none' }}>
                Browse Cookbooks
              </Link>
              <button 
                className="mobile-menu-toggle" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Panel */}
          {mobileMenuOpen && (
            <div className="mobile-nav-dropdown">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link to="/cookbooks" onClick={() => setMobileMenuOpen(false)}>Cookbooks</Link>
              <Link to="/blog" onClick={() => setMobileMenuOpen(false)}>Blogs and Recipes</Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)}>About BHYou</Link>
            </div>
          )}
        </nav>

        {/* Main Body Routing */}
        <main style={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<Home onToast={showToast} />} />
            <Route path="/cookbooks" element={<Cookbooks onToast={showToast} />} />
            <Route path="/products" element={<Cookbooks onToast={showToast} />} />
            <Route path="/library" element={<Cookbooks onToast={showToast} />} />
            <Route path="/cookbook" element={<SalesPage onToast={showToast} />} />
            <Route path="/dessert-cookbook" element={<DessertSalesPage onToast={showToast} />} />
            <Route path="/ebooks/high-protein-dessert-cookbook" element={<DessertSalesPage onToast={showToast} />} />
            <Route path="/blog" element={<Blog onToast={showToast} />} />
            <Route path="/blog/:slug" element={<BlogPost onToast={showToast} />} />
            <Route path="/admin" element={<AdminDashboard onToast={showToast} />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/about" element={<About onToast={showToast} />} />
            <Route path="*" element={<Home onToast={showToast} />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <footer className="footer">
          <div className="container">
            <div className="footer-grid">
              
              {/* Brand Col */}
              <div className="footer-brand">
                <Link to="/" className="footer-logo-link" style={{ display: 'inline-block' }}>
                  <img src="https://i.ibb.co/zVRtqFyS/BHYou-Healthful-Protein-Logo-removebg-preview.png" alt="BHYou Logo" className="footer-logo-img" />
                </Link>
                <p>
                  Helping you enjoy delicious high-protein recipes, healthy desserts, and easy everyday meals with balanced nutrition.
                </p>
                <div className="footer-socials">
                  <a href="https://www.youtube.com/@BHYouu" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="YouTube">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                  </a>
                </div>
              </div>

              {/* Navigation Column */}
              <div className="footer-column">
                <h4>Navigation</h4>
                <ul className="footer-links">
                  <li><Link to="/" className="footer-link">Home</Link></li>
                  <li><Link to="/cookbooks" className="footer-link">Cookbooks</Link></li>
                  <li><Link to="/blog" className="footer-link">Blogs &amp; Recipes</Link></li>
                  <li><Link to="/about" className="footer-link">About BHYou</Link></li>
                </ul>
              </div>

              {/* Cookbooks Col */}
              <div className="footer-column">
                <h4>BHYou Ebooks</h4>
                <ul className="footer-links">
                  <li><Link to="/cookbook" className="footer-link">50 High-Protein Recipes ($11.99)</Link></li>
                  <li><Link to="/dessert-cookbook" className="footer-link">Dessert Cookbook: 70 Recipes ($15.99)</Link></li>
                  <li><Link to="/blog" className="footer-link">Nutrition &amp; Recipe Guides</Link></li>
                </ul>
              </div>

            </div>

            {/* Bottom Section */}
            <div className="footer-bottom">
              <div>
                © {new Date().getFullYear()} BHYou Nutrition. All rights reserved.
              </div>
              <div className="footer-bottom-links">
                <Link to="/privacy" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Shield size={12} /> Privacy Policy
                </Link>
                <Link to="/terms">Terms of Service</Link>
              </div>
            </div>

          </div>
        </footer>

        {/* Global Toast Alert Popups */}
        <div className="toast-container">
          {toasts.map((t) => (
            <div key={t.id} className={`toast toast-${t.type}`}>
              <Bell size={16} />
              <span>{t.message}</span>
            </div>
          ))}
        </div>

        {/* Premium Timed Promo Modal (The High-Protein Dessert Cookbook — $15.99) */}
        {showPromoModal && (
          <div className="promo-modal-overlay" onClick={handleClosePromoModal}>
            <div className="promo-modal promo-spotlight-modal" onClick={(e) => e.stopPropagation()}>
              <button 
                className="promo-modal-close" 
                onClick={handleClosePromoModal}
                aria-label="Close offer"
              >
                <X size={20} />
              </button>
              
              <div className="promo-modal-content">
                <div className="promo-spotlight-grid">
                  
                  {/* Left: Product Media */}
                  <div className="promo-spotlight-media">
                    <div className="promo-cover-wrap">
                      <img 
                        src="https://res.cloudinary.com/dkaob9dmk/image/upload/v1786654276/ghahvw3tceyeuv0dmxa3.webp" 
                        alt="The High-Protein Dessert Cookbook: 70 Healthy Recipes Under 400 Calories" 
                        className="promo-cover-img"
                      />
                      <div className="promo-instant-badge">
                        <BookOpen size={12} />
                        <span>Instant PDF Download</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Persuasive Offer Details */}
                  <div className="promo-spotlight-info">
                    
                    <div className="promo-discount-badge">
                      <Sparkles size={13} />
                      <span>LIMITED TIME OFFER • 50% OFF</span>
                    </div>

                    <h2 className="promo-title">
                      The High-Protein Dessert Cookbook
                    </h2>
                    
                    <p className="promo-subtitle">
                      70 Healthy Recipes Under 400 Calories
                    </p>

                    <p className="promo-description">
                      Love desserts but still want to hit your protein goals? This premium cookbook features 70 delicious high-protein dessert recipes, each carefully crafted to satisfy your sweet cravings while keeping calories under control.
                    </p>

                    {/* Highlights Pills */}
                    <div className="promo-pills-row">
                      <span className="promo-pill">
                        <CheckCircle size={13} className="promo-pill-icon" />
                        70 Recipes
                      </span>
                      <span className="promo-pill">
                        <CheckCircle size={13} className="promo-pill-icon" />
                        Under 400 Calories
                      </span>
                      <span className="promo-pill">
                        <CheckCircle size={13} className="promo-pill-icon" />
                        High-Protein
                      </span>
                      <span className="promo-pill">
                        <CheckCircle size={13} className="promo-pill-icon" />
                        7-Day Meal Plan
                      </span>
                    </div>

                    {/* Price Row */}
                    <div className="promo-price-row">
                      <span className="promo-price-main">$15.99</span>
                      <span className="promo-price-old">$29.99</span>
                      <span className="promo-save-pill">SAVE 47%</span>
                    </div>
                    <div className="promo-price-subtext">One-time payment • Lifetime digital access</div>

                    {/* Buy Now CTA */}
                    <button 
                      onClick={handleBuyPromoModal}
                      className="btn btn-primary promo-buy-btn"
                    >
                      <span>Buy Now — $15.99</span>
                      <ArrowRight size={18} />
                    </button>

                    {/* Dismiss Link */}
                    <div className="promo-dismiss-wrap">
                      <button 
                        onClick={handleClosePromoModal} 
                        className="promo-dismiss-btn"
                      >
                        No thanks, I'll continue browsing →
                      </button>
                    </div>

                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </Router>
  );
}

export default App;
