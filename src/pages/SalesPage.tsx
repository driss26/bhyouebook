import React, { useEffect, useState } from 'react';
import { Flame, BookOpen, Clock, Heart, Award, Star, Plus, Minus } from 'lucide-react';
import { firePageView, firePixel, db } from '../db';
import type { PageSeo } from '../db';

interface SalesPageProps {
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SalesPage: React.FC<SalesPageProps> = ({ onToast }) => {
  const [seoConfig, setSeoConfig] = useState<PageSeo | null>(null);

  useEffect(() => {
    firePageView('/cookbook');
    db.getSeoConfigs().then(configs => {
      const salesConfig = configs.find(c => c.pageId === 'sales');
      if (salesConfig) {
        setSeoConfig(salesConfig);
        if (salesConfig.seoTitle) {
          document.title = salesConfig.seoTitle;
        }
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && salesConfig.metaDescription) {
          metaDesc.setAttribute('content', salesConfig.metaDescription);
        }
      }
    }).catch(err => {
      console.error("Error loading sales page SEO config:", err);
    });
  }, []);

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    if (activeFaq === index) {
      setActiveFaq(null);
    } else {
      setActiveFaq(index);
    }
  };

  const handleBuyClick = () => {
    firePixel('Google Ads', 'click_buy_cookbook_1199', { price: 11.99 });
    firePixel('Meta Pixel', 'InitiateCheckout', { content_name: '50 High-Protein Recipes Under 400 Calories', value: 11.99, currency: 'USD' });
    firePixel('Pinterest Tag', 'checkout_click', { value: 11.99 });
    onToast('Opening Gumroad Secure Checkout...', 'success');
    setTimeout(() => {
      window.open('https://bhyou.gumroad.com/l/pzebkb', '_blank');
    }, 800);
  };

  const scrollToBuySection = () => {
    const el = document.getElementById('final-cta-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      q: "What format does the cookbook come in?",
      a: "The cookbook is delivered instantly as an optimized, high-resolution PDF. You can read it on your iPhone, Android, tablet, laptop, or print it out to keep in your kitchen."
    },
    {
      q: "Do I need special protein powders or rare ingredients?",
      a: "Absolutely not! Every recipe relies on standard, budget-friendly ingredients available at any local supermarket. All protein powder options are standard whey/casein, and we provide non-protein-powder alternatives too."
    },
    {
      q: "Are the macro counts accurate?",
      a: "Yes! Every single recipe has been calculated, weighed, and verified using raw ingredient databases. We provide the exact weight, serving size, calories, protein, carbs, and fat breakdown for each dish."
    },
    {
      q: "Is there a vegetarian version?",
      a: "While this version features 10 chicken meals and other lean meat recipes, it also includes 15 healthy desserts, breakfast options, and snacks that are vegetarian-friendly. We plan to release a fully plant-based edition soon!"
    },
    {
      q: "How can I contact support?",
      a: "If you have any questions, feedback, or issues downloading your cookbook, simply email us at support@bhyou.com and we will get back to you within 24 hours."
    }
  ];

  return (
    <div>
      {/* Intro Product Section */}
      <section className="section-padding" style={{ paddingBottom: '60px' }}>
        <div className="container">
          <div className="preview-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <span className="badge badge-primary">Premium Digital Cookbook</span>
              <h1 className="sales-hero-title">
                {seoConfig?.ogTitle || 'High-Protein Recipes: 50 Guilt-Free Healthy Recipes Under 400 Calories'}
              </h1>

              {/* Shopify-style Price block */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0', borderTop: '1px solid var(--light-border)', borderBottom: '1px solid var(--light-border)', padding: '12px 0' }}>
                <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-dark)' }}>$11.99</span>
                <span style={{ fontSize: '18px', color: 'var(--text-muted-dark)', textDecoration: 'line-through' }}>$24.99</span>
                <span style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>SAVE 52%</span>
              </div>

              {/* Shopify-style Format selector */}
              <div style={{ margin: '8px 0 16px 0' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted-dark)', display: 'block', marginBottom: '8px' }}>Format</span>
                <div onClick={handleBuyClick} style={{ border: '2px solid var(--primary)', backgroundColor: 'var(--primary-glow)', padding: '10px 16px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <BookOpen size={18} style={{ color: 'var(--primary)' }} />
                  <div>
                    <strong style={{ fontSize: '14px', display: 'block', color: 'var(--text-dark)' }}>Digital PDF</strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted-dark)' }}>Instant email delivery</span>
                  </div>
                </div>
              </div>

              {/* Mobile-only eBook cover mockup with rating block below it */}
              <div className="mobile-only-mockup">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div className="ebook-mockup" onClick={scrollToBuySection} style={{ cursor: 'pointer' }}>
                    <img src="https://i.ibb.co/8g3JXwpS/HIGH-PROTEIN-RECIPES.jpg" alt="BHYou Ebook Cover" className="ebook-cover-img" />
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

              <div style={{ color: 'var(--text-muted-dark)', fontSize: '16px', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p>
                  <strong>"{seoConfig?.ogTitle ? seoConfig.ogTitle.split(':')[0] : 'High-Protein Recipes Under 400 Calories'}"</strong> is a premium digital recipe ebook featuring 50+ delicious, beginner-friendly meals designed for fat loss, muscle support, and everyday healthy eating.
                </p>
                <p>
                  Every recipe is under 400 calories and high in protein — including 10 breakfast recipes, 15 protein desserts, 10 chicken meals, 10 lunch and dinner recipes, and 5 protein smoothies. The ebook also includes a full 7-Day Meal Plan, a Protein Sources Guide, a Grocery Shopping List, Kitchen Essentials guide, and a High-Protein Food Cheat Sheet.
                </p>
                <p>
                  No complicated ingredients. No diet rules. Just real, tasty food that supports your goals. Perfect for anyone looking to lose fat, eat more protein, or simply cook healthier without spending hours in the kitchen.
                </p>
              </div>
              
              <div className="sales-features-mini-grid">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Flame size={20} style={{ color: 'var(--primary)' }} />
                  <div>
                    <h4 style={{ fontSize: '15px' }}>Section 1: Breakfasts</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted-dark)' }}>10 High-Protein Recipes</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Star size={20} style={{ color: 'var(--primary)' }} />
                  <div>
                    <h4 style={{ fontSize: '15px' }}>Section 2: Healthy Desserts</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted-dark)' }}>15 Recipes</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Flame size={20} style={{ color: 'var(--primary)' }} />
                  <div>
                    <h4 style={{ fontSize: '15px' }}>Section 3: Chicken Meals</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted-dark)' }}>10 Recipes</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BookOpen size={20} style={{ color: 'var(--primary)' }} />
                  <div>
                    <h4 style={{ fontSize: '15px' }}>Section 4: Lunch & Dinner</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted-dark)' }}>10 Recipes</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Heart size={20} style={{ color: 'var(--primary)' }} />
                  <div>
                    <h4 style={{ fontSize: '15px' }}>Section 5: Smoothies & Drinks</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted-dark)' }}>5 Recipes</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Award size={20} style={{ color: 'var(--primary)' }} />
                  <div>
                    <h4 style={{ fontSize: '15px' }}>Section 6: 7-Day Meal Plan</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted-dark)' }}>Structured guide</p>
                  </div>
                </div>
              </div>

              <div className="sales-buy-block">
                <button onClick={handleBuyClick} className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '18px' }}>
                  Buy Now - $11.99
                </button>
                <div style={{ fontSize: '14px', color: 'var(--text-muted-dark)', fontWeight: 500 }}>
                  ⚡ Instant PDF Download
                </div>
              </div>
            </div>

            {/* Desktop eBook mockup with rating block below it */}
            <div className="mockup-container">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="ebook-mockup" onClick={scrollToBuySection} style={{ width: '300px', height: '420px', cursor: 'pointer' }}>
                  <img src="https://i.ibb.co/8g3JXwpS/HIGH-PROTEIN-RECIPES.jpg" alt="BHYou Ebook" className="ebook-cover-img" />
                  <div className="ebook-spine"></div>
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
                  <span>(142 reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Ebook Page-by-Page Outline */}
      <section className="section-padding" style={{ backgroundColor: 'white', borderBottom: '1px solid var(--light-border)' }}>
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

      {/* Features Detail */}
      <section className="section-padding">
        <div className="container">
          <div className="section-title-wrapper">
            <span className="section-subtitle">The Complete Package</span>
            <h2 className="section-title">Everything You Get Today</h2>
            <p style={{ color: 'var(--text-muted-dark)' }}>We packed tons of value into this premium recipe bundle to guarantee your health goals are met.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div style={{ color: 'var(--primary)', marginBottom: '16px' }}><Flame size={24} /></div>
              <h3>15 Guilt-Free Desserts</h3>
              <p>Double Chocolate Mug Cake, Protein Cookie Dough, Berry Cheesecake Pots, and more. Satisfy sweet cravings without wrecking your macros.</p>
            </div>

            <div className="feature-card">
              <div style={{ color: 'var(--primary)', marginBottom: '16px' }}><BookOpen size={24} /></div>
              <h3>10 Chicken Meal preps</h3>
              <p>Juicy, flavorful chicken dishes like Spicy Honey-Mustard Skewers, Garlic Butter Bites, and Stuffed Chicken. Never eat plain dry breasts again.</p>
            </div>

            <div className="feature-card">
              <div style={{ color: 'var(--primary)', marginBottom: '16px' }}><Award size={24} /></div>
              <h3>7-Day Structured Meal Plan</h3>
              <p>A step-by-step 7-day meal layout optimized for fat loss and muscle retention. Takes all guesswork out of your daily routine.</p>
            </div>

            <div className="feature-card">
              <div style={{ color: 'var(--primary)', marginBottom: '16px' }}><Clock size={24} /></div>
              <h3>Complete Grocery Lists</h3>
              <p>Itemized grocery list divided by supermarket sections. Walk in, grab exactly what you need, and walk out. Save time and money.</p>
            </div>

            <div className="feature-card">
              <div style={{ color: 'var(--primary)', marginBottom: '16px' }}><Heart size={24} /></div>
              <h3>High Protein snacks & Sides</h3>
              <p>Quick protein shakes, dynamic energy bites, low-calorie dipping sauces, and healthy vegetable options to keep you full.</p>
            </div>

            <div className="feature-card">
              <div style={{ color: 'var(--primary)', marginBottom: '16px' }}><Award size={24} /></div>
              <h3>Kitchen cheatsheets</h3>
              <p>Protein conversion tables, oven temperature conversions, and storage tips. Keep your ingredients fresh and recipes cooking perfectly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section className="section-padding testimonials-section">
        <div className="container">
          <div className="section-title-wrapper">
            <span className="section-subtitle">Real Reviews</span>
            <h2 className="section-title">Loved by 5,000+ Busy Cooks</h2>
            <p style={{ color: 'var(--text-muted-dark)' }}>Here is what our readers have to say about the recipes and their body transformations.</p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div>
                <div className="testimonial-rating">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#fbbf24" color="#fbbf24" />)}
                </div>
                <p className="testimonial-quote">
                  "I have lost 12 pounds in 6 weeks using this cookbook! The chocolate mug cake is literally my go-to every single night. It satisfies my sweet tooth, and I'm still losing weight."
                </p>
              </div>
              <div className="testimonial-user">
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80" alt="Jessica M." className="testimonial-avatar" />
                <div className="testimonial-info">
                  <h4>Jessica M.</h4>
                  <p>Lost 12 lbs • Mother of 2</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div>
                <div className="testimonial-rating">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#fbbf24" color="#fbbf24" />)}
                </div>
                <p className="testimonial-quote">
                  "As a busy office worker, meal prep is my biggest issue. The chicken skewers and meal prep guides in this book saved me hours of cooking. Plus, the macro barcodes make MyFitnessPal logging instant!"
                </p>
              </div>
              <div className="testimonial-user">
                <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&h=100&q=80" alt="Marcus T." className="testimonial-avatar" />
                <div className="testimonial-info">
                  <h4>Marcus T.</h4>
                  <p>Busy Professional • Muscle Gain</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div>
                <div className="testimonial-rating">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#fbbf24" color="#fbbf24" />)}
                </div>
                <p className="testimonial-quote">
                  "I was skeptical about 'low calorie desserts' tasting good, but the recipes are absolutely delicious. They actually taste premium, not like chemical protein powder cardboard. Worth every penny."
                </p>
              </div>
              <div className="testimonial-user">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80" alt="Sophia R." className="testimonial-avatar" />
                <div className="testimonial-info">
                  <h4>Sophia R.</h4>
                  <p>Fitness Enthusiast • Fat Loss</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* FAQ Section */}
      <section className="section-padding" style={{ backgroundColor: 'var(--light-surface)' }}>
        <div className="container">
          <div className="section-title-wrapper">
            <span className="section-subtitle">Got Questions?</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p style={{ color: 'var(--text-muted-dark)' }}>Everything you need to know about the cookbook purchase and contents.</p>
          </div>

          <div className="faq-max-width">
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

      {/* Final Call to Action */}
      <section id="final-cta-section" className="section-padding" style={{ textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 className="sales-final-cta-title">Ready to Fuel Your Body Correctly?</h2>
          <p style={{ color: 'var(--text-muted-dark)', fontSize: '16px', marginBottom: '40px' }}>
            Join over 5,000 readers who are enjoying waffles, brownies, chicken quesadillas, and creamy pastas every single day while meeting their weight goals.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <button onClick={handleBuyClick} className="btn btn-primary" style={{ padding: '18px 48px', fontSize: '18px', width: '100%', maxWidth: '420px' }}>
              Claim Your Ebook Copy Now - $11.99
            </button>
            <span style={{ fontSize: '13px', color: 'var(--text-muted-dark)' }}>💳 Secure encrypted checkout powered by Gumroad</span>
          </div>
        </div>
      </section>
    </div>
  );
};
