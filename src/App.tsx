import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import { 
  Shield, Menu, X, Send, Bell, Star
} from 'lucide-react';

// Pages
import { Home } from './pages/Home';
import { SalesPage } from './pages/SalesPage';
import { DessertSalesPage } from './pages/DessertSalesPage';
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
  const [announcementText, setAnnouncementText] = useState('🔥 Get the High-Protein Cookbook for $11.99 on Gumroad — Start cooking healthy today! Click here to buy →');
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
                  50 Recipes ($11.99)
                </NavLink>
              </li>
              <li>
                <NavLink to="/dessert-cookbook" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Dessert Cookbook ($19.99)
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
              <Link to="/dessert-cookbook" className="btn btn-primary btn-sm nav-cta-desktop" style={{ textDecoration: 'none' }}>
                New Dessert Book
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
              <Link to="/cookbook" onClick={() => setMobileMenuOpen(false)}>50 High-Protein Recipes ($11.99)</Link>
              <Link to="/dessert-cookbook" onClick={() => setMobileMenuOpen(false)}>High-Protein Dessert Cookbook ($19.99)</Link>
              <Link to="/blog" onClick={() => setMobileMenuOpen(false)}>Blogs</Link>
            </div>
          )}
        </nav>

        {/* Main Body Routing */}
        <main style={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<Home onToast={showToast} />} />
            <Route path="/cookbook" element={<SalesPage onToast={showToast} />} />
            <Route path="/dessert-cookbook" element={<DessertSalesPage onToast={showToast} />} />
            <Route path="/ebooks/high-protein-dessert-cookbook" element={<DessertSalesPage onToast={showToast} />} />
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
                  <a href="https://www.youtube.com/@BHYouu" target="_blank" className="footer-social-btn" aria-label="YouTube">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                  </a>
                </div>
              </div>

              {/* Cookbooks Col */}
              <div className="footer-column">
                <h4>BHYou Ebooks</h4>
                <ul className="footer-links">
                  <li><Link to="/cookbook" className="footer-link">50 High-Protein Recipes ($11.99)</Link></li>
                  <li><Link to="/dessert-cookbook" className="footer-link">Dessert Cookbook: 70 Recipes ($19.99)</Link></li>
                  <li><Link to="/blog" className="footer-link">Nutrition & Recipe Blog</Link></li>
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
                <div className="promo-modal-header" style={{ marginBottom: '24px' }}>
                  <h2>Get the High-Protein Cookbook</h2>
                  <p>Start your fat loss and fitness journey with 50 premium recipes under 400 calories.</p>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                  {/* Ebook Mockup */}
                  <div className="ebook-mockup" style={{ width: '180px', height: '252px', margin: '0 auto', boxShadow: 'var(--shadow-lg)' }}>
                    <img src="https://i.ibb.co/8g3JXwpS/HIGH-PROTEIN-RECIPES.jpg" alt="BHYou Ebook" className="ebook-cover-img" />
                    <div className="ebook-spine"></div>
                  </div>

                  {/* Pricing and details */}
                  <div style={{ textAlign: 'center', maxWidth: '450px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#fbbf24', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        <Star size={16} fill="#fbbf24" color="#fbbf24" />
                        <Star size={16} fill="#fbbf24" color="#fbbf24" />
                        <Star size={16} fill="#fbbf24" color="#fbbf24" />
                        <Star size={16} fill="#fbbf24" color="#fbbf24" />
                        <Star size={16} fill="#fbbf24" color="#fbbf24" />
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>4.9/5.0 Stars</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', margin: '12px 0' }}>
                      <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-dark)' }}>$11.99</span>
                      <span style={{ fontSize: '18px', color: 'var(--text-muted-dark)', textDecoration: 'line-through' }}>$24.99</span>
                      <span style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>SAVE 52%</span>
                    </div>

                    <p style={{ color: 'var(--text-muted-dark)', fontSize: '14.5px', lineHeight: '1.6', marginBottom: '20px' }}>
                      Get instant digital PDF access to all 50+ low-calorie, high-protein recipes, our structured 7-Day Meal Plan, grocery shopping lists, and kitchen cheat sheets.
                    </p>

                    <a 
                      href="https://bhyou.gumroad.com/l/pzebkb" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-primary"
                      style={{ width: '100%', textDecoration: 'none', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', padding: '14px 28px', fontSize: '16px' }}
                    >
                      Buy on Gumroad
                    </a>
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
