import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, Flame, CheckCircle, ArrowRight, ShieldCheck, Star, Plus, Minus } from 'lucide-react';
import { firePageView, firePixel, db } from '../db';
import type { PageSeo } from '../db';

interface HomeProps {
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const Home: React.FC<HomeProps> = ({ onToast }) => {
  const [seoConfig, setSeoConfig] = useState<PageSeo | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    if (activeFaq === index) {
      setActiveFaq(null);
    } else {
      setActiveFaq(index);
    }
  };

  const faqs = [
    {
      q: "What is included in the ebook?",
      a: "You get 50 premium high-protein recipes (strictly under 400 calories), our structured 7-Day Meal Plan, grocery shopping lists, and kitchen cheat sheets."
    },
    {
      q: "Is this beginner friendly?",
      a: "Yes! Every recipe includes simple, step-by-step instructions and uses budget-friendly ingredients available at any local grocery store."
    },
    {
      q: "How will I receive my ebook?",
      a: "It is delivered instantly as a high-resolution, mobile-optimized digital PDF to your email inbox immediately after purchase."
    },
    {
      q: "Are calories and protein included?",
      a: "Yes, every single recipe features accurate, verified calorie counts and complete macronutrient breakdowns (protein, carbs, fats)."
    },
    {
      q: "Can I use these recipes for meal prep?",
      a: "Absolutely! Many of the recipes (like our 10 chicken meal preps) are specifically designed to be cooked in advance and stored in the fridge."
    }
  ];

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

  const scrollToBuySection = () => {
    const el = document.getElementById('promo-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
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
                  Get Lean & Stay Full: <span>50 High-Protein Recipes Under 400 Calories</span>
                </>
              )}
            </h1>

            {/* Shopify-style Price block */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', margin: '8px 0 24px 0', borderTop: '1px solid var(--light-border)', borderBottom: '1px solid var(--light-border)', padding: '10px 0', width: '100%', maxWidth: '340px' }}>
              <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-dark)' }}>$11.99</span>
              <span style={{ fontSize: '16px', color: 'var(--text-muted-dark)', textDecoration: 'line-through' }}>$24.99</span>
              <span style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '3px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>SAVE 52%</span>
            </div>

            {/* Mobile-only eBook cover mockup with rating block below it */}
            <div className="mobile-only-mockup">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="ebook-mockup" onClick={scrollToBuySection} style={{ cursor: 'pointer' }}>
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
                {/* Rating under the image (Mobile) */}
                <div className="rating-under-mockup">
                  <div className="stars">
                    <Star size={16} fill="#fbbf24" color="#fbbf24" />
                    <Star size={16} fill="#fbbf24" color="#fbbf24" />
                    <Star size={16} fill="#fbbf24" color="#fbbf24" />
                    <Star size={16} fill="#fbbf24" color="#fbbf24" />
                    <Star size={16} fill="#fbbf24" color="#fbbf24" />
                  </div>
                  <span className="rating-val">4.9/5.0</span>
                  <span>(142 verified reviews)</span>
                </div>
              </div>
            </div>

            <p className="hero-subheadline">
              {seoConfig?.ogDescription || seoConfig?.metaDescription || `Stop starving yourself. Enjoy 50 delicious, easy-to-prep, macro-friendly recipes designed to support muscle growth and burn fat. Instant digital PDF download.`}
            </p>
            
            <div className="hero-bullet-list">
              <div className="hero-bullet">
                <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                <span>50 High-Protein Recipes (Under 400 kcal)</span>
              </div>
              <div className="hero-bullet">
                <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                <span>15 Guilt-Free Healthy Desserts</span>
              </div>
              <div className="hero-bullet">
                <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                <span>10 Easy Chicken Meal Preps</span>
              </div>
              <div className="hero-bullet">
                <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                <span>7-Day Structured Meal Plan</span>
              </div>
              <div className="hero-bullet">
                <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                <span>Calories & Macro Counts on Every Page</span>
              </div>
              <div className="hero-bullet">
                <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                <span>Instant Digital Access Anywhere</span>
              </div>
            </div>

            <div className="hero-actions" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
              <button onClick={handleBuyClick} className="btn btn-primary" style={{ width: '100%' }}>
                Get My Recipe Ebook
                <ArrowRight size={18} />
              </button>
              <div style={{ marginTop: '4px', fontSize: '13px', color: 'var(--text-muted-dark)', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', textAlign: 'center' }}>
                <span>⚡ Instant Access After Purchase • Mobile Friendly Checkout</span>
                <span>🔒 Secure Payments Powered by Gumroad • Join 2,600+ healthy recipe lovers</span>
              </div>
            </div>
          </div>

          {/* Desktop eBook mockup with rating block below it */}
          <div className="mockup-container">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="ebook-mockup" onClick={scrollToBuySection} style={{ cursor: 'pointer' }}>
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
              {/* Rating under the image (Desktop) */}
              <div className="rating-under-mockup">
                <div className="stars">
                  <Star size={16} fill="#fbbf24" color="#fbbf24" />
                  <Star size={16} fill="#fbbf24" color="#fbbf24" />
                  <Star size={16} fill="#fbbf24" color="#fbbf24" />
                  <Star size={16} fill="#fbbf24" color="#fbbf24" />
                  <Star size={16} fill="#fbbf24" color="#fbbf24" />
                </div>
                <span className="rating-val">4.9/5.0</span>
                <span>(142 verified reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof/trust banner */}
      <section style={{ backgroundColor: 'var(--light-surface)', borderTop: '1px solid var(--light-border)', borderBottom: '1px solid var(--light-border)', padding: '24px 0' }}>
        <div className="container social-proof-container">
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

      {/* Ebook Page-by-Page Outline */}
      <section className="section-padding" style={{ backgroundColor: 'var(--light-surface)', borderTop: '1px solid var(--light-border)', borderBottom: '1px solid var(--light-border)' }}>
        <div className="container">
          <div className="section-title-wrapper" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="section-subtitle">What's Inside</span>
            <h2 className="section-title">Ebook Page-by-Page Outline</h2>
            <p style={{ color: 'var(--text-muted-dark)' }}>Here is exactly what you will find on every page of the 60-page digital cookbook.</p>
          </div>

          <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: 'white', borderRadius: 'var(--border-radius)', border: '1px solid var(--light-border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <div className="admin-table-wrapper" style={{ margin: 0 }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--light-surface)' }}>
                    <th style={{ padding: '16px', fontWeight: 600, width: '120px', color: 'var(--text-dark)' }}>Page(s)</th>
                    <th style={{ padding: '16px', fontWeight: 600, width: '200px', color: 'var(--text-dark)' }}>Page Type</th>
                    <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-dark)' }}>Content Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { page: "1", type: "Cover", desc: "High-Protein Recipes eBook — Cover Page" },
                    { page: "2", type: "Welcome", desc: "Welcome + How to Use This Book" },
                    { page: "3", type: "Intro", desc: "Nutrition Basics (Simplified)" },
                    { page: "4", type: "Table of Contents", desc: "Full Table of Contents" },
                    { page: "4", type: "Section Divider", desc: "SECTION 1: HIGH-PROTEIN BREAKFASTS", highlight: true },
                    { page: "5-12", type: "Recipes (Breakfasts)", desc: "Breakfast Recipes #1 to #10 (High Protein)" },
                    { page: "12", type: "Section Divider", desc: "SECTION 2: HEALTHY DESSERTS", highlight: true },
                    { page: "13-26", type: "Recipes (Desserts)", desc: "Dessert Recipes #1 to #15" },
                    { page: "27", type: "Section Divider", desc: "SECTION 3: CHICKEN MEALS", highlight: true },
                    { page: "27-35", type: "Recipes (Chicken)", desc: "Chicken Meal Recipes #1 to #10" },
                    { page: "35", type: "Section Divider", desc: "SECTION 4: LUNCH & DINNER", highlight: true },
                    { page: "35-44", type: "Recipes (Lunch & Dinner)", desc: "Lunch & Dinner Recipes #1 to #10" },
                    { page: "44", type: "Section Divider", desc: "SECTION 5: SMOOTHIES & DRINKS", highlight: true },
                    { page: "44-48", type: "Recipes (Smoothies)", desc: "Smoothie & Drink Recipes #1 to #5" },
                    { page: "49", type: "Section Divider", desc: "SECTION 6: 7-DAY MEAL PLAN", highlight: true },
                    { page: "49-51", type: "Meal Plan", desc: "7-Day High-Protein Meal Plan (Day 1 to Day 7)" },
                    { page: "51-52", type: "Bonus", desc: "Bonus: Protein Sources Guide" },
                    { page: "53", type: "Bonus", desc: "Bonus: Grocery Shopping List" },
                    { page: "54-55", type: "Bonus", desc: "Bonus: Kitchen Essentials" },
                    { page: "56", type: "Bonus", desc: "Bonus: High-Protein Cheat Sheet" },
                    { page: "57", type: "Snack Ideas + Closing", desc: "Closing Page + Call to Action" },
                    { page: "58", type: "Quote Page", desc: "Inspirational Quote Page" },
                    { page: "59", type: "Outline Page", desc: "Full Page-by-Page Outline" },
                    { page: "60", type: "Thank You Page", desc: "Thank You + Social Media Links" }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ 
                      borderBottom: '1px solid var(--light-border)',
                      backgroundColor: row.highlight ? 'var(--primary-glow)' : 'transparent',
                      fontWeight: row.highlight ? 600 : 'normal'
                    }}>
                      <td style={{ padding: '14px 16px', color: 'var(--primary)', fontWeight: 700 }}>{row.page}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ 
                          backgroundColor: row.highlight ? 'var(--primary)' : 'var(--light-surface)', 
                          color: row.highlight ? 'white' : 'var(--text-dark)',
                          padding: '4px 10px', 
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 600
                        }}>
                          {row.type}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: row.highlight ? 'var(--primary)' : 'var(--text-dark)' }}>{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Promotion Banner */}
      <section id="promo-section" className="home-promo-section">
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.05, background: 'radial-gradient(var(--primary) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', fontSize: '14px', letterSpacing: '0.1em', display: 'block', marginBottom: '16px' }}>Limited Time Launch Offer</span>
          <h2>Get the Full 50-Recipe Cookbook & Meal Plan Today</h2>
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

      {/* FAQ Section */}
      <section className="section-padding" style={{ backgroundColor: 'var(--light-surface)', borderTop: '1px solid var(--light-border)', borderBottom: '1px solid var(--light-border)' }}>
        <div className="container">
          <div className="section-title-wrapper" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="section-subtitle">Got Questions?</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p style={{ color: 'var(--text-muted-dark)' }}>Everything you need to know about the ebook purchase and contents.</p>
          </div>

          <div className="faq-max-width" style={{ maxWidth: '800px', margin: '0 auto' }}>
            {faqs.map((faq, index) => (
              <div className="faq-item" key={index}>
                <button className="faq-question-btn" onClick={() => toggleFaq(index)}>
                  <h3>{faq.q}</h3>
                  {activeFaq === index ? <Minus size={18} /> : <Plus size={18} />}
                </button>
                {activeFaq === index && (
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
