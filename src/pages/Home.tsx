import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, ArrowRight, Star, 
  Sparkles, Flame, Clock, Calendar, 
  Utensils, HeartHandshake, ChevronDown
} from 'lucide-react';
import { firePageView, firePixel, db, PRODUCTS, DEFAULT_HERO_SLIDES } from '../db';
import type { BlogPost, EbookProduct, HeroSlideItem } from '../db';
import { CookbookStoreGrid } from '../components/CookbookStoreGrid';

interface HomeProps {
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const Home: React.FC<HomeProps> = ({ onToast }) => {
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [product, setProduct] = useState<EbookProduct>(PRODUCTS['bhyou-50-recipes']);
  const [showAboutModal, setShowAboutModal] = useState(false);

  // Background slider state: images move automatically on their own
  const [heroSlides, setHeroSlides] = useState<HeroSlideItem[]>(DEFAULT_HERO_SLIDES);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  // Continuous automatic movement (every 3.8 seconds)
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    firePageView('/');

    // Load products & listen for live price/cover updates from dashboard
    const loadProduct = () => {
      db.getProducts().then((all) => {
        if (all && all['bhyou-50-recipes']) {
          setProduct(all['bhyou-50-recipes']);
        }
      }).catch(err => console.error("Error loading products:", err));
    };
    loadProduct();

    const handleProductsUpdated = () => {
      loadProduct();
    };
    window.addEventListener('products_updated', handleProductsUpdated);

    // Load dynamic hero slides & listen for live image updates from dashboard
    const loadHeroSlides = () => {
      db.getHeroSlides().then((slides) => {
        if (slides && slides.length > 0) {
          setHeroSlides(slides);
        }
      }).catch(err => console.error("Error loading hero slides:", err));
    };
    loadHeroSlides();

    const handleHeroSlidesUpdated = () => {
      loadHeroSlides();
    };
    window.addEventListener('hero_slides_updated', handleHeroSlidesUpdated);

    // Load blog posts and prioritize the 6 strongest relevant articles
    db.getPosts().then((posts) => {
      if (posts && posts.length > 0) {
        const prioritySlugs = [
          'healthy-chocolate-lava-cake',
          'high-protein-chicken-meals',
          'guilt-free-desserts-under-200-calories',
          'high-protein-dinners-under-400-calories',
          'healthy-meal-prep-under-30-minutes',
          'healthy-desserts-under-400-calories'
        ];
        
        const sorted = [...posts].sort((a, b) => {
          const aIndex = prioritySlugs.indexOf(a.slug);
          const bIndex = prioritySlugs.indexOf(b.slug);
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return 0;
        });

        setFeaturedPosts(sorted.slice(0, 6));
      }
    }).catch(err => console.error("Error loading blog posts:", err));

    // Load SEO Config
    db.getSeoConfigs().then(configs => {
      const homeConfig = configs.find(c => c.pageId === 'home');
      if (homeConfig) {
        if (homeConfig.seoTitle) {
          document.title = homeConfig.seoTitle;
        }
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && homeConfig.metaDescription) {
          metaDesc.setAttribute('content', homeConfig.metaDescription);
        }
      }
    }).catch(err => {
      console.error("Error loading home page SEO config:", err);
    });

    return () => {
      window.removeEventListener('products_updated', handleProductsUpdated);
      window.removeEventListener('hero_slides_updated', handleHeroSlidesUpdated);
    };
  }, []);

  const handleBuyClick = () => {
    const priceVal = product.price || 15.99;
    firePixel('Google Ads', 'click_buy_cookbook', { price: priceVal });
    firePixel('Meta Pixel', 'InitiateCheckout', { 
      content_name: product.fullTitle || product.title || 'High-Protein Recipes Under 400 Calories', 
      value: priceVal, 
      currency: 'USD' 
    });
    firePixel('Pinterest Tag', 'checkout_click', { 
      product_id: product.id || 'bhyou-50-recipes', 
      value: priceVal 
    });
    onToast('Opening Gumroad Secure Checkout...', 'success');
    window.open(product.gumroadUrl || 'https://bhyou.gumroad.com/l/pzebkb', '_blank');
  };

  const scrollToEbook = () => {
    const el = document.getElementById('featured-ebook');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="homepage-wrapper">
      
      {/* ================================================== */}
      {/* 1. HERO WITH AUTO-MOVING BACKGROUND & OVERLAY COPY */}
      {/* ================================================== */}
      <section 
        className="hero-overlay-showcase" 
        aria-label="Hero Introduction"
      >
        {/* Background Images with Automatic Smooth Motion */}
        <div className="hero-bg-slider" aria-hidden="true">
          {heroSlides.map((slide, idx) => (
            <div 
              key={slide.id || idx} 
              className={`hero-bg-slide ${idx === currentHeroSlide ? 'active' : ''}`}
            >
              <img 
                src={slide.image} 
                alt={slide.alt || slide.name} 
                className="hero-bg-img"
                loading={idx === 0 ? 'eager' : 'lazy'}
                fetchPriority={idx === 0 ? 'high' : 'auto'}
              />
            </div>
          ))}
          {/* Dark Film & Radial Vignette Overlay to make white typography crystal clear */}
          <div className="hero-bg-vignette" />
        </div>

        {/* Persuasive Copy Overlay ("mn fo9mnhum lktaba") */}
        <div className="container hero-overlay-container">
          <div className="hero-overlay-content">
            
            {/* Top Editorial Badge */}
            <div className="hero-overlay-badge">
              <Sparkles size={14} className="badge-sparkle" />
              <span>Gourmet Nutrition Reimagined • 50+ High-Protein Recipes</span>
            </div>

            {/* Main High-Impact H1 Headline */}
            <h1 className="hero-overlay-title">
              Eat What You Love, Hit Your Protein Goals &amp; Never Give Up Desserts.
            </h1>

            {/* Persuasive Hook Message */}
            <p className="hero-overlay-lead">
              Who said eating clean has to be bland and boring? Discover chef-crafted, macro-optimized recipes — from molten lava cakes and Basque cheesecakes to juicy meal-prep dinners — all strictly under 400 calories and packed with 20g–40g of protein. Scroll down to discover our best recipes and complete digital cookbooks.
            </p>

            {/* Value Badges */}
            <div className="hero-overlay-highlights">
              <div className="hero-overlay-pill">
                <Flame size={15} className="pill-icon" />
                <span>50 Recipes Under 400 Kcal</span>
              </div>
              <div className="hero-overlay-pill">
                <Utensils size={15} className="pill-icon" />
                <span>20g–40g+ Protein / Serving</span>
              </div>
              <div className="hero-overlay-pill">
                <Sparkles size={15} className="pill-icon" />
                <span>Guilt-Free Desserts Under 220 Kcal</span>
              </div>
              <div className="hero-overlay-pill">
                <CheckCircle size={15} className="pill-icon" />
                <span>7-Day Structured Meal Plan</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="hero-overlay-actions">
              <button 
                onClick={handleBuyClick} 
                className="btn btn-primary hero-btn-main"
                aria-label={`Get the Ebook — $${product.price}`}
              >
                Get the Ebook — ${product.price}
                <ArrowRight size={18} />
              </button>
              <button 
                onClick={scrollToEbook}
                className="btn hero-btn-secondary"
              >
                Explore Recipes &amp; Cookbooks ↓
              </button>
            </div>

            {/* Trust Rating */}
            <div className="hero-overlay-trust">
              <div className="trust-stars-row">
                <div className="stars-cluster">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill="#fbbf24" color="#fbbf24" />
                  ))}
                </div>
                <span className="trust-score">4.9/5 Rating</span>
                <span className="trust-dot">•</span>
                <span className="trust-note">Loved by 1,200+ Foodies</span>
                <span className="trust-dot">•</span>
                <span className="trust-note">Instant PDF Download</span>
              </div>
            </div>

          </div>

          {/* Scroll Cue to Encourage Visitors to Keep Scrolling */}
          <div 
            className="hero-overlay-scroll-cue" 
            onClick={scrollToEbook} 
            role="button" 
            tabIndex={0}
            title="Scroll down to view recipes and cookbook"
          >
            <span className="scroll-cue-text">Scroll to explore recipes, meal plans &amp; cookbooks</span>
            <ChevronDown size={20} className="scroll-arrow-anim" />
          </div>

        </div>
      </section>

      {/* ================================================== */}
      {/* 3. ABOUT BHYOU                                     */}
      {/* ================================================== */}
      <section id="about" className="about-bh-section" aria-label="About BHYou">
        <div className="container">
          <div className="about-bh-grid">
            
            {/* Left Story Column */}
            <div className="about-bh-story">
              <span className="section-subtitle">Our Philosophy</span>
              <h2 className="section-title">About BHYou</h2>
              
              <div className="about-bh-copy">
                <p className="about-highlight-text">
                  BHYou is all about making healthy eating simple, delicious, and realistic. We create recipes that combine great taste with practical nutrition, helping you enjoy high-protein meals and healthier desserts without making food boring.
                </p>
                <p>
                  We believe that long-term body composition and vibrant energy shouldn't require starving, bland chicken breasts, or giving up your favorite sweets. By reimagining comfort food favorites through macro-optimized ingredients, we show you that high-protein recipes and low-calorie meals can be the most flavorful part of your day.
                </p>
              </div>

              {/* Secondary CTA */}
              <div className="about-cta-container">
                <button 
                  onClick={() => setShowAboutModal(true)} 
                  className="about-secondary-link"
                >
                  Learn More About BHYou →
                </button>
              </div>
            </div>

            {/* Right Pillars Cards */}
            <div className="about-bh-pillars">
              <div className="about-pillar-card">
                <div className="pillar-icon-box">
                  <Flame size={22} />
                </div>
                <div>
                  <h3 className="pillar-title">High-Protein Focus</h3>
                  <p className="pillar-desc">
                    Every dish delivers generous, muscle-sparing protein to keep you full for hours and fuel active recovery.
                  </p>
                </div>
              </div>

              <div className="about-pillar-card">
                <div className="pillar-icon-box">
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3 className="pillar-title">Healthy Desserts</h3>
                  <p className="pillar-desc">
                    From molten lava cakes to tiramisu cups, satisfy your sweet tooth without throwing off your daily calorie deficit.
                  </p>
                </div>
              </div>

              <div className="about-pillar-card">
                <div className="pillar-icon-box">
                  <Utensils size={22} />
                </div>
                <div>
                  <h3 className="pillar-title">Low-Calorie Recipes</h3>
                  <p className="pillar-desc">
                    Strictly portioned and verified recipes under 400 calories that maximize volume so you never feel restricted.
                  </p>
                </div>
              </div>

              <div className="about-pillar-card">
                <div className="pillar-icon-box">
                  <HeartHandshake size={22} />
                </div>
                <div>
                  <h3 className="pillar-title">Realistic Meal Ideas</h3>
                  <p className="pillar-desc">
                    Practical, accessible ingredients available at any local grocery store with 30-minute prep times.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 4. DIGITAL COOKBOOKS & PRODUCTS (SHOPIFY STORE GRID) */}
      {/* ================================================== */}
      <CookbookStoreGrid onToast={onToast} />

      {/* ================================================== */}
      {/* 5. FEATURED / POPULAR BLOGS                        */}
      {/* ================================================== */}
      <section className="featured-blogs-section" aria-label="Popular Recipes and Guides">
        <div className="container">
          
          <div className="section-title-wrapper text-center">
            <span className="section-subtitle">Nutrition Guides &amp; Meal Ideas</span>
            <h2 className="section-title">Popular Recipes &amp; Healthy Food Guides</h2>
            <p className="section-intro-text">
              Free recipes, meal prep strategies, and nutritional deep dives to support your healthy lifestyle every week.
            </p>
          </div>

          <div className="featured-blogs-grid">
            {featuredPosts.map((post) => (
              <article key={post.id} className="editorial-blog-card">
                <Link to={`/blog/${post.slug}`} className="editorial-card-media">
                  <img 
                    src={post.featuredImage} 
                    alt={post.title} 
                    className="editorial-card-img"
                    loading="lazy"
                  />
                  <span className="card-category-tag">{post.category}</span>
                </Link>

                <div className="editorial-card-content">
                  <div className="card-meta-line">
                    <span className="meta-item">
                      <Calendar size={13} />
                      {new Date(post.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="meta-item">
                      <Clock size={13} />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="editorial-card-title">
                    <Link to={`/blog/${post.slug}`} className="title-link">
                      {post.title}
                    </Link>
                  </h3>

                  <p className="editorial-card-excerpt">
                    {post.excerpt}
                  </p>

                  <div className="editorial-card-footer">
                    <Link to={`/blog/${post.slug}`} className="card-read-more-link">
                      Read More →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="blogs-more-cta-wrapper text-center">
            <Link to="/blog" className="btn btn-secondary">
              View All Recipes &amp; Articles
              <ArrowRight size={16} />
            </Link>
          </div>

        </div>
      </section>



      {/* ================================================== */}
      {/* About BHYou Modal for "Learn More About BHYou →"   */}
      {/* ================================================== */}
      {showAboutModal && (
        <div 
          className="promo-modal-overlay" 
          onClick={() => setShowAboutModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="promo-modal about-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button 
              className="promo-modal-close" 
              onClick={() => setShowAboutModal(false)}
              aria-label="Close Modal"
            >
              ✕
            </button>
            <div className="about-modal-body">
              <span className="section-subtitle">Our Mission &amp; Standard</span>
              <h2 style={{ fontSize: '28px', marginBottom: '16px', color: 'var(--text-dark)' }}>
                About BHYou Nutrition
              </h2>
              <p style={{ color: 'var(--text-muted-dark)', lineHeight: 1.7, marginBottom: '16px' }}>
                BHYou is all about making healthy eating simple, delicious, and realistic. We create recipes that combine great taste with practical nutrition, helping you enjoy high-protein meals and healthier desserts without making food boring.
              </p>
              <p style={{ color: 'var(--text-muted-dark)', lineHeight: 1.7, marginBottom: '20px' }}>
                Our recipes are crafted with everyday ingredients, accurate macro breakdowns, and verified calorie counts. Whether you're meal prepping for a busy workweek, hitting the gym, or baking guilt-free weekend treats, BHYou gives you the recipes and meal plans to achieve your goals sustainably.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link 
                  to="/blog" 
                  className="btn btn-primary"
                  onClick={() => setShowAboutModal(false)}
                >
                  Explore Free Recipes
                </Link>
                <button 
                  onClick={() => { setShowAboutModal(false); handleBuyClick(); }}
                  className="btn btn-secondary"
                >
                  Get the Ebook — ${product.price}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
