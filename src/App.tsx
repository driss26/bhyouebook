import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import { 
  Shield, Lock, Menu, X, Send, Bell, Smartphone
} from 'lucide-react';

// Pages
import { Home } from './pages/Home';
import { SalesPage } from './pages/SalesPage';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { AdminDashboard } from './pages/AdminDashboard';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';

import { initDb, checkAndFixSeoConfigs, firePixel, db } from './db';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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
  const [announcementText, setAnnouncementText] = useState('🔥 Get the High-Protein Cookbook for $11.99 on Gumroad — or unlock it FREE by installing our featured app. Click here to learn more →');
  const [announcementBgStart, setAnnouncementBgStart] = useState('#064e3b');
  const [announcementBgEnd, setAnnouncementBgEnd] = useState('#10b981');
  const [announcementTextColor, setAnnouncementTextColor] = useState('#ecfdf5');
  const [footerEmail, setFooterEmail] = useState('');

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

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!footerEmail) return;

    try {
      await db.saveLead(footerEmail, 'footer_newsletter');
      showToast('Subscribed to BHYou Newsletter!', 'success');
      firePixel('Google Analytics 4', 'newsletter_optin');
      setFooterEmail('');
    } catch (err) {
      console.error("Error saving lead:", err);
      showToast('Failed to subscribe. Please try again.', 'error');
    }
  };

  const triggerAdBlueMedia = () => {
    // If xfLock is already defined, call it directly to open the locker
    if (typeof (window as any).xfLock === 'function') {
      (window as any).xfLock();
      return;
    }
    if (typeof (window as any).CPABuildLock === 'function') {
      (window as any).CPABuildLock();
      return;
    }

    // Set configuration variables required by AdBlueMedia content locker
    (window as any).yeRSN_Oee_mEOcmc = {"it": 4581127, "key": "4a524"};

    // Inject AdBlueMedia Javascript file
    const script = document.createElement('script');
    script.src = "https://d19k1sh57v5k0g.cloudfront.net/e90b2eb.js";
    script.async = true;
    script.onload = () => {
      // Once the script is loaded and executed, call xfLock() to open the content locker
      setTimeout(() => {
        if (typeof (window as any).xfLock === 'function') {
          (window as any).xfLock();
        } else if (typeof (window as any).CPABuildLock === 'function') {
          (window as any).CPABuildLock();
        }
      }, 100);
    };
    script.onerror = () => {
      showToast('Please disable AdBlocker and try again.', 'error');
    };
    document.body.appendChild(script);

    showToast('Loading premium verification locker...', 'info');
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
                <NavLink to="/cookbook" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Ebook
                </NavLink>
              </li>
              <li>
                <NavLink to="/blog" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Blogs
                </NavLink>
              </li>
            </ul>

            {/* CTA buttons */}
            <div className="nav-cta">
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
            <div style={{ 
              position: 'absolute', top: '80px', left: 0, right: 0, 
              backgroundColor: 'white', borderBottom: '1px solid var(--light-border)',
              padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px',
              boxShadow: 'var(--shadow-lg)', zIndex: 99
            }}>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600 }}>Home</Link>
              <Link to="/cookbook" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600 }}>Ebook</Link>
              <Link to="/blog" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600 }}>Blogs</Link>
            </div>
          )}
        </nav>

        {/* Main Body Routing */}
        <main style={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<Home onToast={showToast} />} />
            <Route path="/cookbook" element={<SalesPage onToast={showToast} />} />
            <Route path="/blog" element={<Blog onToast={showToast} />} />
            <Route path="/blog/:slug" element={<BlogPost onToast={showToast} />} />
            <Route path="/admin" element={<AdminDashboard onToast={showToast} />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
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
                  Helping busy fitness enthusiasts fuel their muscles, burn stubborn fat, and live happily with premium, low-calorie gourmet recipes.
                </p>
                <div className="footer-socials">
                  <a href="https://instagram.com" target="_blank" className="footer-social-btn" aria-label="Instagram">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                  <a href="https://facebook.com" target="_blank" className="footer-social-btn" aria-label="Facebook">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  </a>
                  <a href="https://youtube.com" target="_blank" className="footer-social-btn" aria-label="YouTube">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                  </a>
                </div>
              </div>

              {/* Quick links Col */}
              <div className="footer-column">
                <h4>Healthy Recipes</h4>
                <ul className="footer-links">
                  <li><Link to="/blog" className="footer-link">Recipes Blog</Link></li>
                  <li><Link to="/blog" className="footer-link">High Protein Chicken</Link></li>
                  <li><Link to="/blog" className="footer-link">Healthy Desserts</Link></li>
                </ul>
              </div>

              {/* Newsletter Col */}
              <div className="footer-newsletter">
                <h4>Weekly Free Recipes</h4>
                <p>Get a fresh, macro-friendly recipe sent directly to your inbox every Sunday.</p>
                <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
                  <input 
                    type="email" 
                    placeholder="Enter email..." 
                    className="newsletter-input"
                    value={footerEmail}
                    onChange={(e) => setFooterEmail(e.target.value)}
                    required 
                  />
                  <button type="submit" className="btn btn-primary newsletter-btn">
                    <Send size={14} />
                  </button>
                </form>
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

        {/* Premium Promo Modal */}
        {showPromoModal && (
          <div className="promo-modal-overlay" onClick={() => setShowPromoModal(false)}>
            <div className="promo-modal" onClick={(e) => e.stopPropagation()}>
              <button className="promo-modal-close" onClick={() => setShowPromoModal(false)}>
                <X size={20} />
              </button>
              <div className="promo-modal-content">
                <div className="promo-modal-header">
                  <h2>Unlock the High-Protein Cookbook</h2>
                  <p>Choose your preferred way to get the full 50-recipe cookbook.</p>
                </div>
                
                <div className="promo-options-grid">
                  {/* Option 1: Buy */}
                  <div className="promo-option-card">
                    <div>
                      <div className="promo-option-icon">
                        <Lock size={20} />
                      </div>
                      <h3>Buy Cookbook</h3>
                      <div className="promo-option-price">$11.99</div>
                      <p>Instant digital PDF access. Save time, cook delicious meals, and start cooking healthy today.</p>
                    </div>
                    <a 
                      href="https://bhyou.gumroad.com/l/pzebkb" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', textDecoration: 'none' }}
                    >
                      Buy on Gumroad
                    </a>
                  </div>
                  
                  {/* Option 2: Get Free */}
                  <div className="promo-option-card highlight">
                    <div className="promo-option-badge">Popular</div>
                    <div>
                      <div className="promo-option-icon">
                        <Smartphone size={20} />
                      </div>
                      <h3>Unlock Free</h3>
                      <div className="promo-option-price">
                        <span className="old-price">$11.99</span>
                        <span style={{ color: 'var(--primary)' }}>$0.00</span>
                      </div>
                      <p>Complete a quick sponsored verification to unlock the High-Protein Cookbook instantly!</p>
                    </div>
                    <div className="app-store-buttons">
                      <button 
                        className="app-store-btn"
                        onClick={triggerAdBlueMedia}
                      >
                        Download for iOS
                      </button>
                      <button 
                        className="app-store-btn"
                        onClick={triggerAdBlueMedia}
                      >
                        Download for Android
                      </button>
                      <button 
                        className="app-store-btn"
                        onClick={triggerAdBlueMedia}
                      >
                        Download for Windows
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
