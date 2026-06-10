import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, Flame, CheckCircle, ArrowRight, ShieldCheck, Heart, Star } from 'lucide-react';
import { firePageView, firePixel, db } from '../db';
import type { PageSeo } from '../db';

interface HomeProps {
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const Home: React.FC<HomeProps> = ({ onToast }) => {
  const [seoConfig, setSeoConfig] = useState<PageSeo | null>(null);

  useEffect(() => {
    firePageView('/');
    db.getSeoConfigs().then(configs => {
      const homeConfig = configs.find(c => c.pageId === 'home');
      if (homeConfig) {
        setSeoConfig(homeConfig);
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
    firePixel('Google Ads', 'click_buy_cookbook_1199', { price: 11.99 });
    firePixel('Meta Pixel', 'InitiateCheckout', { content_name: '50 High-Protein Recipes Under 400 Calories', value: 11.99, currency: 'USD' });
    onToast('Redirecting to Gumroad checkout...', 'info');
    setTimeout(() => {
      window.open('https://bhyou.gumroad.com/l/pzebkb', '_blank');
    }, 800);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="badge badge-primary" style={{ marginBottom: '16px' }}>
              <Sparkles size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Fresh Nutrition Launch
            </span>

            {/* Shopify-style Review rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted-dark)', marginBottom: '16px' }}>
              <div style={{ color: '#fbbf24', display: 'flex', gap: '2px' }}>
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
              </div>
              <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>4.9/5.0</span>
              <span>(142 verified reviews)</span>
            </div>

            <h1 className="hero-title" style={{ marginBottom: '16px' }}>
              {seoConfig?.ogTitle ? (
                <>
                  {seoConfig.ogTitle.includes(':') ? (
                    <>
                      {seoConfig.ogTitle.split(':')[0]}: <span>{seoConfig.ogTitle.split(':').slice(1).join(':')}</span>
                    </>
                  ) : (
                    <span>{seoConfig.ogTitle}</span>
                  )}
                </>
              ) : (
                <>
                  High-Protein Recipes: <span>50 Guilt-Free Healthy Recipes Under 400 Calories</span>
                </>
              )}
            </h1>

            {/* Shopify-style Price block */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', margin: '8px 0 24px 0', borderTop: '1px solid var(--light-border)', borderBottom: '1px solid var(--light-border)', padding: '10px 0', width: '100%', maxWidth: '340px' }}>
              <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-dark)' }}>$11.99</span>
              <span style={{ fontSize: '16px', color: 'var(--text-muted-dark)', textDecoration: 'line-through' }}>$24.99</span>
              <span style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '3px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>SAVE 52%</span>
            </div>

            {/* Mobile-only eBook cover mockup */}
            <div className="mobile-only-mockup">
              <div className="ebook-mockup">
                <img 
                  src="https://i.ibb.co/8g3JXwpS/HIGH-PROTEIN-RECIPES.jpg" 
                  alt="High-Protein Recipes: 50 Guilt-Free Healthy Recipes Under 400 Calories Cookbook Cover" 
                  className="ebook-cover-img" 
                />
                <div className="ebook-spine"></div>
                <div className="mockup-badge">
                  ONLY
                  <span>$11.99</span>
                </div>
              </div>
            </div>

            <p className="hero-subheadline">
              {seoConfig?.ogDescription || seoConfig?.metaDescription || `"High-Protein Recipes Under 400 Calories" is a premium digital recipe ebook featuring 50+ delicious, beginner-friendly meals designed for fat loss, muscle support, and everyday healthy eating.`}
            </p>
            
            <div className="hero-bullet-list">
              <div className="hero-bullet">
                <Flame size={16} />
                <span>Section 1: Breakfasts — 10 Recipes</span>
              </div>
              <div className="hero-bullet">
                <Sparkles size={16} />
                <span>Section 2: Healthy Desserts — 15 Recipes</span>
              </div>
              <div className="hero-bullet">
                <Flame size={16} />
                <span>Section 3: Chicken Meals — 10 Recipes</span>
              </div>
              <div className="hero-bullet">
                <BookOpen size={16} />
                <span>Section 4: Lunch & Dinner — 10 Recipes</span>
              </div>
              <div className="hero-bullet">
                <Heart size={16} />
                <span>Section 5: Smoothies & Drinks — 5 Recipes</span>
              </div>
              <div className="hero-bullet">
                <CheckCircle size={16} />
                <span>Section 6: 7-Day Structured Meal Plan</span>
              </div>
            </div>

            <div className="hero-actions">
              <button onClick={handleBuyClick} className="btn btn-primary">
                Get The Cookbook - $11.99
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <div className="mockup-container">
            <div className="ebook-mockup">
              <img 
                src="https://i.ibb.co/8g3JXwpS/HIGH-PROTEIN-RECIPES.jpg" 
                alt="50 High-Protein Recipes Under 400 Calories Cookbook Cover" 
                className="ebook-cover-img" 
              />
              <div className="ebook-spine"></div>
              <div className="mockup-badge">
                ONLY
                <span>$11.99</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof/trust banner */}
      <section style={{ backgroundColor: 'var(--light-surface)', borderTop: '1px solid var(--light-border)', borderBottom: '1px solid var(--light-border)', padding: '24px 0' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-muted-dark)' }}>
            <ShieldCheck size={20} className="text-primary" style={{ color: 'var(--primary)' }} />
            <span>100% Secure Checkout</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--text-muted-dark)' }}>
            <span>⭐ ⭐ ⭐ ⭐ ⭐</span>
            <span style={{ marginLeft: '6px' }}>5,000+ Happy Fit Cooks</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-muted-dark)' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>✓ PDF format</span>
            <span>Instant Access Anywhere</span>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="section-padding">
        <div className="container">
          <div className="section-title-wrapper">
            <span className="section-subtitle">What's Inside</span>
            <h2 className="section-title">Designed for Real, Sustainable Results</h2>
            <p style={{ color: 'var(--text-muted-dark)' }}>No crash diets. No starving. Just delicious, high-volume meals that keep you full and energized throughout the day.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Flame size={24} />
              </div>
              <h3>High Protein, Low Calorie</h3>
              <p>Every single recipe has over 30g of protein and is strictly under 400 calories. Perfect for burning fat while maintaining lean muscle.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <BookOpen size={24} />
              </div>
              <h3>Clear Macro Breakdowns</h3>
              <p>Calorie and macronutrient (protein, carbs, fat) counts are clearly displayed on every page. Easily track your food with pre-logged MyFitnessPal codes!</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Sparkles size={24} />
              </div>
              <h3>Meal Prep Friendly</h3>
              <p>Quick recipes and storage instructions. Spend less time in the kitchen and always have a high-protein meal ready in your fridge.</p>
            </div>
          </div>

          <div style={{ marginTop: '56px', textAlign: 'center' }}>
            <Link to="/cookbook" className="btn btn-primary">
              Explore Product Details
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Promotion Banner */}
      <section style={{ backgroundColor: 'var(--dark)', color: 'white', padding: '80px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.05, background: 'radial-gradient(var(--primary) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', fontSize: '14px', letterSpacing: '0.1em', display: 'block', marginBottom: '16px' }}>Limited Time Launch Offer</span>
          <h2 style={{ color: 'white', fontSize: '36px', marginBottom: '24px', letterSpacing: '-0.01em' }}>Get the Full 50-Recipe Cookbook & Meal Plan Today</h2>
          <p style={{ color: 'var(--text-muted-light)', fontSize: '16px', marginBottom: '40px', lineHeight: 1.6 }}>
            Start cooking gourmet, macro-friendly meals tonight. Take action now and receive the 7-Day Meal Plan, Grocery List, and Cooking cheatsheets entirely free with your purchase!
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button onClick={handleBuyClick} className="btn btn-primary">
              Buy Cookbook ($11.99)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
