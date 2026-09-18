import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, ArrowRight, ShieldCheck, Star, 
  BookOpen, Sparkles, Flame, Clock, Calendar, 
  Utensils, Zap, HeartHandshake, Eye
} from 'lucide-react';
import { firePageView, firePixel, db, PRODUCTS } from '../db';
import type { BlogPost, EbookProduct } from '../db';
import { CinematicDessertShowcase } from '../components/CinematicDessertShowcase';

interface HomeProps {
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const Home: React.FC<HomeProps> = ({ onToast }) => {
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [product, setProduct] = useState<EbookProduct>(PRODUCTS['bhyou-50-recipes']);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    firePageView('/');

    // Load products
    db.getProducts().then((all) => {
      if (all && all['bhyou-50-recipes']) {
        setProduct(all['bhyou-50-recipes']);
      }
    }).catch(err => console.error("Error loading products:", err));

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
  }, []);

  const handleBuyClick = () => {
    firePixel('Google Ads', 'click_buy_cookbook_1599', { price: 15.99 });
    firePixel('Meta Pixel', 'InitiateCheckout', { 
      content_name: 'High-Protein Recipes Under 400 Calories', 
      value: 15.99, 
      currency: 'USD' 
    });
    firePixel('Pinterest Tag', 'checkout_click', { 
      product_id: 'bhyou-50-recipes', 
      value: 15.99 
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
      {/* 1. HERO SECTION                                   */}
      {/* ================================================== */}
      <section className="hero-editorial" aria-label="Hero Introduction">
        <div className="container">
          <div className="hero-editorial-grid">
            
            {/* Editorial Text Content */}
            <div className="hero-editorial-content">
              <div className="hero-editorial-tag">
                <Sparkles size={14} className="hero-tag-icon" />
                <span>Modern Nutrition & Culinary Lifestyle</span>
              </div>

              {/* ONE clear H1 only */}
              <h1 className="hero-editorial-title">
                High-Protein Recipes &amp; Healthy Desserts
              </h1>

              {/* Natural SEO-friendly supporting paragraph */}
              <p className="hero-editorial-lead">
                Discover delicious high-protein recipes, healthy desserts, low-calorie meals, and easy meal ideas designed to make healthy eating simple and enjoyable.
              </p>

              {/* Hero Value Highlights */}
              <div className="hero-editorial-highlights">
                <div className="hero-highlight-item">
                  <Flame size={16} className="highlight-icon" />
                  <span>50 Recipes Under 400 Kcal</span>
                </div>
                <div className="hero-highlight-item">
                  <Utensils size={16} className="highlight-icon" />
                  <span>30g+ Protein / Serving</span>
                </div>
                <div className="hero-highlight-item">
                  <CheckCircle size={16} className="highlight-icon" />
                  <span>7-Day Meal Plan Included</span>
                </div>
              </div>

              {/* Primary Call to Action */}
              <div className="hero-editorial-actions">
                <button 
                  onClick={handleBuyClick} 
                  className="btn btn-primary hero-main-cta"
                  aria-label="Get the Ebook — $15.99"
                >
                  Get the Ebook — $15.99
                  <ArrowRight size={18} />
                </button>
                <button 
                  onClick={scrollToEbook}
                  className="btn btn-secondary hero-secondary-cta"
                >
                  View Book Details
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="hero-editorial-trust">
                <div className="trust-stars-row">
                  <div className="stars-cluster">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={15} fill="#fbbf24" color="#fbbf24" />
                    ))}
                  </div>
                  <span className="trust-score">4.9/5 Rating</span>
                  <span className="trust-dot">•</span>
                  <span className="trust-note">Instant PDF Download</span>
                </div>
              </div>
            </div>

            {/* Editorial Hero Visual Card */}
            <div className="hero-editorial-visual">
              <div className="editorial-media-card">
                <img 
                  src="/hero_showcase.jpg" 
                  alt="High-protein savory chicken avocado bowl alongside a guilt-free dark chocolate protein lava cake with berries"
                  className="editorial-media-img"
                  fetchPriority="high"
                  loading="eager"
                />
                <div className="editorial-media-badge top-badge">
                  <span className="badge-bullet" />
                  <span>Macro-Balanced Culinary Photography</span>
                </div>
                <div className="editorial-media-card-footer">
                  <div className="media-footer-pill">
                    <span className="pill-label">Savory Meals</span>
                    <span className="pill-val">Over 35g Protein</span>
                  </div>
                  <div className="media-footer-pill">
                    <span className="pill-label">Guilt-Free Desserts</span>
                    <span className="pill-val">Under 220 Kcal</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 2. CINEMATIC DESSERTS ANIMATION                    */}
      {/* ================================================== */}
      <CinematicDessertShowcase />

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
      {/* 4. BEST-SELLING / FEATURED EBOOK                   */}
      {/* ================================================== */}
      <section id="featured-ebook" className="featured-ebook-section" aria-label="Featured Ebook">
        <div className="container">
          
          <div className="section-title-wrapper text-center">
            <span className="section-subtitle">The BHYou Recipe Collection</span>
            <h2 className="section-title">High-Protein Recipes Under 400 Calories</h2>
            <p className="section-intro-text">
              The flagship digital cookbook designed to fuel fat loss and lean muscle with gourmet meals you’ll actually look forward to eating.
            </p>
          </div>

          <div className="featured-ebook-showcase">
            
            {/* Visual Column: 3D Mockup & Previews */}
            <div className="ebook-visual-column">
              <div className="ebook-mockup-wrapper">
                <div 
                  className="ebook-mockup" 
                  onClick={handleBuyClick} 
                  title="Click to get High-Protein Recipes on Gumroad"
                  role="button"
                  tabIndex={0}
                >
                  <img 
                    src={product.coverImage || 'https://i.ibb.co/8g3JXwpS/HIGH-PROTEIN-RECIPES.jpg'} 
                    alt="High-Protein Recipes Under 400 Calories Ebook Cover" 
                    className="ebook-cover-img" 
                  />
                  <div className="ebook-spine" />
                  <div className="mockup-badge">
                    <span>$15.99</span>
                  </div>
                </div>
              </div>

              {/* Interior Page Previews */}
              <div className="interior-preview-block">
                <div className="preview-header">
                  <span className="preview-tag">
                    <Eye size={14} /> Interior Page Preview
                  </span>
                  <span className="preview-sub">Actual cookbook recipes</span>
                </div>
                <div 
                  className="preview-img-container"
                  onClick={() => setSelectedPreviewImage('/recipe_preview.png')}
                  title="Click to view high-resolution page preview"
                >
                  <img 
                    src="/recipe_preview.png" 
                    alt="Interior cookbook page previews: Grilled Lemon Herb Chicken, Fluffy Protein Pancakes, Smashed Avocado Toast, and Berry Smoothie Bowl" 
                    className="interior-preview-thumb"
                    loading="lazy"
                  />
                  <div className="preview-overlay-btn">
                    <span>Enlarge Preview</span>
                  </div>
                </div>
                <div className="preview-caption">
                  <span>Pages 1–4 sample: Full macros, step-by-step instructions, ingredient checklists.</span>
                </div>
              </div>
            </div>

            {/* Merchandising & Value Breakdown Column */}
            <div className="ebook-details-column">
              
              {/* Product Price Box */}
              <div className="ebook-pricing-card">
                <div className="pricing-row">
                  <div className="price-tag-group">
                    <span className="price-main">$15.99</span>
                    <span className="price-original">$29.99</span>
                    <span className="price-badge-save">SAVE 47%</span>
                  </div>
                  <div className="format-badge">
                    <BookOpen size={14} />
                    <span>Instant Digital PDF</span>
                  </div>
                </div>
                <p className="pricing-guarantee-note">
                  Lifetime access • Free future updates • 100% Mobile &amp; Tablet Friendly
                </p>
              </div>

              {/* Transparent Value Checklist: Strictly Actual Content */}
              <div className="ebook-inclusions">
                <h3 className="inclusions-title">What Is Included in Your Digital Download:</h3>
                
                <div className="inclusions-grid">
                  <div className="inclusion-item">
                    <CheckCircle size={18} className="inclusion-icon" />
                    <div>
                      <strong>50 High-Protein Recipes</strong>
                      <p>Carefully balanced meals strictly under 400 kcal and high in protein.</p>
                    </div>
                  </div>

                  <div className="inclusion-item">
                    <CheckCircle size={18} className="inclusion-icon" />
                    <div>
                      <strong>Healthy Desserts Section</strong>
                      <p>15 protein cheesecakes, lava cakes, brownies, and mousse treats.</p>
                    </div>
                  </div>

                  <div className="inclusion-item">
                    <CheckCircle size={18} className="inclusion-icon" />
                    <div>
                      <strong>Chicken Meal Preps</strong>
                      <p>10 easy, juicy chicken recipes designed specifically for batch cooking.</p>
                    </div>
                  </div>

                  <div className="inclusion-item">
                    <CheckCircle size={18} className="inclusion-icon" />
                    <div>
                      <strong>7-Day Structured Meal Plan</strong>
                      <p>Day-by-day breakfast, lunch, snack, and dinner meal prep schedules.</p>
                    </div>
                  </div>

                  <div className="inclusion-item">
                    <CheckCircle size={18} className="inclusion-icon" />
                    <div>
                      <strong>Bonus Kitchen Essentials &amp; Cheat Sheets</strong>
                      <p>High-protein food cheat sheet, shopping lists, and pantry staples.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Answers to Immediate Buyer Questions */}
              <div className="buyer-qa-accordion">
                <div className="qa-item">
                  <h4 className="qa-heading">Who is this ebook for?</h4>
                  <p className="qa-answer">
                    Anyone looking to burn fat, build lean muscle, or cook healthier without spending hours in the kitchen or eating bland diet foods.
                  </p>
                </div>

                <div className="qa-item">
                  <h4 className="qa-heading">What happens after purchase?</h4>
                  <p className="qa-answer">
                    You receive instant access. A direct download link is sent to your email immediately by Gumroad, allowing you to open and save the PDF on your iPhone, Android, iPad, or computer.
                  </p>
                </div>
              </div>

              {/* Conversion CTA Block */}
              <div className="ebook-checkout-cta-block">
                <button 
                  onClick={handleBuyClick} 
                  className="btn btn-primary ebook-order-btn"
                  aria-label="Get the Ebook — $15.99"
                >
                  Get the Ebook — $15.99
                  <ArrowRight size={18} />
                </button>
                <div className="checkout-security-notes">
                  <span className="sec-note">
                    <ShieldCheck size={16} /> 256-Bit SSL Encrypted Checkout via Gumroad
                  </span>
                  <span className="sec-note">
                    <Zap size={15} /> Instant Delivery to Your Email
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

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
      {/* Lightbox / Modal for Preview Images               */}
      {/* ================================================== */}
      {selectedPreviewImage && (
        <div 
          className="preview-lightbox-overlay"
          onClick={() => setSelectedPreviewImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="preview-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="lightbox-close-btn"
              onClick={() => setSelectedPreviewImage(null)}
              aria-label="Close Preview"
            >
              ✕
            </button>
            <img 
              src={selectedPreviewImage} 
              alt="High-resolution cookbook interior preview" 
              className="lightbox-full-img"
            />
            <div className="lightbox-footer">
              <span>Sample Pages: 50 High-Protein Recipes Under 400 Calories</span>
              <button onClick={handleBuyClick} className="btn btn-primary btn-sm">
                Get the Ebook — $15.99
              </button>
            </div>
          </div>
        </div>
      )}

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
                  Get the Ebook — $15.99
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
