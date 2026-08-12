import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Star, Plus, Minus, 
  CheckCircle, ShieldCheck, Gift, Check, ShoppingBag
} from 'lucide-react';
import { firePageView, firePixel, db, PRODUCTS } from '../db';
import type { PageSeo } from '../db';

interface DessertSalesPageProps {
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const DessertSalesPage: React.FC<DessertSalesPageProps> = ({ onToast }) => {
  const [seoConfig, setSeoConfig] = useState<PageSeo | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const product = PRODUCTS['high-protein-dessert-cookbook-70'];

  useEffect(() => {
    firePageView('/dessert-cookbook');
    firePixel('Google Analytics 4', 'view_item', {
      item_id: product.id,
      item_name: product.title,
      price: product.price,
      currency: 'USD'
    });

    db.getSeoConfigs().then(configs => {
      const dessertConfig = configs.find(c => c.pageId === 'dessert-sales');
      if (dessertConfig) {
        setSeoConfig(dessertConfig);
        if (dessertConfig.seoTitle) {
          document.title = dessertConfig.seoTitle;
        }
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && dessertConfig.metaDescription) {
          metaDesc.setAttribute('content', dessertConfig.metaDescription);
        }
      }
    }).catch(err => {
      console.error("Error loading dessert sales page SEO config:", err);
    });
  }, []);

  const toggleFaq = (index: number) => {
    if (activeFaq === index) {
      setActiveFaq(null);
    } else {
      setActiveFaq(index);
    }
  };

  const handleBuyClick = () => {
    firePixel('Google Ads', 'click_buy_dessert_cookbook_1999', { 
      price: 19.99, 
      product_id: 'high-protein-dessert-cookbook-70' 
    });
    firePixel('Meta Pixel', 'InitiateCheckout', { 
      content_name: 'The High-Protein Dessert Cookbook: 70 Healthy Recipes Under 400 Calories', 
      content_ids: ['high-protein-dessert-cookbook-70'], 
      value: 19.99, 
      currency: 'USD' 
    });
    firePixel('Pinterest Tag', 'checkout_click', { 
      product_id: 'high-protein-dessert-cookbook-70', 
      value: 19.99 
    });
    firePixel('TikTok Pixel', 'InitiateCheckout', { 
      content_id: 'high-protein-dessert-cookbook-70', 
      value: 19.99, 
      currency: 'USD' 
    });

    onToast('Opening Gumroad Secure Checkout...', 'success');
    setTimeout(() => {
      window.open(product.gumroadUrl, '_blank');
    }, 800);
  };

  const scrollToBuySection = () => {
    const el = document.getElementById('final-cta-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const categories = [
    { title: "Frozen Desserts", desc: "Protein ice creams, gelatos, popsicles, and slushies with thick decadent texture." },
    { title: "Chocolate Everything", desc: "Molten lava cakes, fudgy brownies, truffles, and rich chocolate fondants." },
    { title: "No-Bake Bars & Bites", desc: "Cookie dough squares, protein energy bites, Snickers bars, and crunch cups." },
    { title: "Cakes & Muffins", desc: "Single-serve mug cakes, fluffy banana bread muffins, and golden loaves." },
    { title: "Creamy & Mousses", desc: "Airy chocolate mousses, Greek yogurt puddings, custards, and flans." },
    { title: "Cookies & Donuts", desc: "Chewy chocolate chip cookies, glazed protein donuts, and crispy biscuits." },
    { title: "Parfaits & Bowls", desc: "High-volume yogurt bowls, fruit compote parfaits, and chia layered pots." },
    { title: "Smoothies & Drinks", desc: "Dessert-inspired thick protein shakes, iced mocha lattes, and frappes." },
    { title: "Cheesecakes", desc: "Mini Basque cheesecakes, berry swirl cups, and protein crustless pies." }
  ];

  const whyLoveBullets = [
    "High-Protein & Macro-Friendly Recipes",
    "Under 400 Calories per Serving",
    "Complete Nutrition Facts (Protein, Carbs, Fats)",
    "Prep & Cook Time clearly listed",
    "Exact Protein Per Serving Breakdowns",
    "Professional Chef Tips for Flawless Texture",
    "Storage Instructions (Fridge & Freezer Safe)",
    "Meal Prep Tips for Batch Cooking",
    "Easy-to-Find Budget-Friendly Ingredients",
    "Beginner-Friendly Step-by-Step Instructions"
  ];

  const bonusResources = [
    "Measurement Conversion Chart",
    "US ↔ Metric Conversion Guide",
    "Kitchen Temperature Conversion Chart",
    "Protein Cheat Sheet",
    "Sweetener Cheat Sheet",
    "Recommended Pantry Checklist",
    "Ingredient Substitutions Guide",
    "Baking Tips & Tricks",
    "Meal Prep & Storage Tips",
    "Fridge & Freezer Storage Guide",
    "Frequently Asked Questions"
  ];

  const perfectFor = [
    { tag: "Weight Loss", desc: "Stay in a deficit while enjoying sweet treats nightly." },
    { tag: "Muscle Building", desc: "High protein amino acid profiles to fuel muscle repair." },
    { tag: "Healthy Eating", desc: "Clean ingredients free from refined excess sugars." },
    { tag: "Meal Prep", desc: "Make-ahead desserts that stay fresh in the fridge." },
    { tag: "Fitness Enthusiasts", desc: "Accurate verified macros for easy MyFitnessPal tracking." },
    { tag: "Busy Professionals", desc: "Quick 5 to 15-minute recipes for on-the-go lifestyle." },
    { tag: "Beginners", desc: "Simple equipment, no advanced culinary skills required." },
    { tag: "Dessert Lovers", desc: "Rich gourmet taste without feeling like 'diet food'." }
  ];

  const faqs = [
    {
      q: "What is included in The High-Protein Dessert Cookbook?",
      a: "You get 70 delicious high-protein dessert recipes across 9 categories (all under 400 calories), 181 beautifully designed pages, complete nutritional facts and macros, chef tips, and 11 bonus guides including pantry checklists and sweetener guides."
    },
    {
      q: "How many pages and recipes are in this cookbook?",
      a: "The cookbook contains 181 comprehensive pages and 70 distinct dessert recipes, complete with full-page photography, verified nutrition breakdowns, and prep instructions."
    },
    {
      q: "Are the recipes beginner friendly?",
      a: "Yes! Every single recipe is crafted with easy-to-find ingredients from any regular supermarket, and features clear step-by-step instructions that anyone can follow."
    },
    {
      q: "How do I receive my digital download?",
      a: "Immediately upon completing your checkout through Gumroad, you will receive instant digital PDF access directly to your email inbox with lifetime access."
    },
    {
      q: "Are full macronutrients and calories included for every recipe?",
      a: "Yes! Every single recipe specifies calories, grams of protein, carbohydrates, dietary fats, and portion yields so you never have to guess."
    }
  ];

  return (
    <div>
      {/* Intro Product Hero Section */}
      <section className="section-padding" style={{ paddingBottom: '60px' }}>
        <div className="container">
          
          {/* Breadcrumb & Collection Switcher */}
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted-dark)', flexWrap: 'wrap' }}>
            <Link to="/" style={{ color: 'var(--primary)', fontWeight: 600 }}>Home</Link>
            <span>/</span>
            <Link to="/#collection" style={{ color: 'var(--text-muted-dark)' }}>Cookbook Collection</Link>
            <span>/</span>
            <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>The High-Protein Dessert Cookbook</span>
          </div>

          <div className="preview-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span className="badge badge-primary">New Release</span>
                <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                  70 Recipes • 181 Pages
                </span>
              </div>

              <h1 className="sales-hero-title">
                {seoConfig?.ogTitle ? (
                  <>
                    {seoConfig.ogTitle.includes(':') ? (
                      <>
                        {seoConfig.ogTitle.split(':')[0]}: <span style={{ color: 'var(--primary)' }}>{seoConfig.ogTitle.split(':').slice(1).join(':')}</span>
                      </>
                    ) : (
                      <span>{seoConfig.ogTitle}</span>
                    )}
                  </>
                ) : (
                  <>
                    The High-Protein Dessert Cookbook: <span style={{ color: 'var(--primary)' }}>70 Healthy Recipes Under 400 Calories</span>
                  </>
                )}
              </h1>

              {/* Price block */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '8px 0', borderTop: '1px solid var(--light-border)', borderBottom: '1px solid var(--light-border)', padding: '12px 0' }}>
                <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-dark)' }}>$19.99</span>
                <span style={{ fontSize: '20px', color: 'var(--text-muted-dark)', textDecoration: 'line-through' }}>$39.99</span>
                <span style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '4px', fontSize: '13px', fontWeight: 700 }}>SAVE 50%</span>
              </div>

              {/* Format selector */}
              <div style={{ margin: '4px 0 12px 0' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted-dark)', display: 'block', marginBottom: '8px' }}>Format</span>
                <div onClick={handleBuyClick} style={{ border: '2px solid var(--primary)', backgroundColor: 'var(--primary-glow)', padding: '12px 18px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <BookOpen size={20} style={{ color: 'var(--primary)' }} />
                  <div>
                    <strong style={{ fontSize: '15px', display: 'block', color: 'var(--text-dark)' }}>Instant Digital PDF Edition</strong>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-muted-dark)' }}>181 High-Res Pages • Instant email delivery • Lifetime access</span>
                  </div>
                </div>
              </div>

              {/* Mobile Mockup */}
              <div className="mobile-only-mockup">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div className="ebook-mockup" onClick={scrollToBuySection} style={{ cursor: 'pointer', width: '220px', height: '290px' }}>
                    <img src="/dessert_cookbook_cover.png" alt="The High-Protein Dessert Cookbook Cover" className="ebook-cover-img" />
                    <div className="ebook-spine"></div>
                    <div className="mockup-badge">
                      NEW
                      <span>$19.99</span>
                    </div>
                  </div>
                  <div className="rating-under-mockup">
                    <div className="stars">
                      <Star size={16} fill="#fbbf24" color="#fbbf24" />
                      <Star size={16} fill="#fbbf24" color="#fbbf24" />
                      <Star size={16} fill="#fbbf24" color="#fbbf24" />
                      <Star size={16} fill="#fbbf24" color="#fbbf24" />
                      <Star size={16} fill="#fbbf24" color="#fbbf24" />
                    </div>
                    <span className="rating-val">5.0/5.0</span>
                    <span>(88 verified reviews)</span>
                  </div>
                </div>
              </div>

              {/* Description Body */}
              <div style={{ color: 'var(--text-muted-dark)', fontSize: '16px', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-dark)' }}>
                  High-Protein Desserts Under 400 Calories
                </p>
                <p>
                  Love desserts but still want to hit your protein goals?
                </p>
                <p>
                  This premium cookbook features <strong>70 delicious high-protein dessert recipes</strong>, each carefully crafted to satisfy your sweet cravings while keeping calories strictly under control.
                </p>
                <p>
                  Whether you're building muscle, losing weight, or simply looking for healthier treats, this collection makes it easy to enjoy dessert every single day without the guilt.
                </p>
              </div>

              {/* Fast Highlights Badges */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginTop: '8px' }}>
                <div style={{ background: 'var(--light-surface)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--light-border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>70</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted-dark)', fontWeight: 600 }}>Dessert Recipes</div>
                </div>
                <div style={{ background: 'var(--light-surface)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--light-border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>181</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted-dark)', fontWeight: 600 }}>Full Pages</div>
                </div>
                <div style={{ background: 'var(--light-surface)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--light-border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>&lt;400</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted-dark)', fontWeight: 600 }}>Calories/Serving</div>
                </div>
                <div style={{ background: 'var(--light-surface)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--light-border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>9</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted-dark)', fontWeight: 600 }}>Categories</div>
                </div>
              </div>

              {/* Buy Block */}
              <div className="sales-buy-block" style={{ marginTop: '16px' }}>
                <button onClick={handleBuyClick} className="btn btn-primary" style={{ padding: '18px 36px', fontSize: '18px', width: '100%' }}>
                  <ShoppingBag size={20} />
                  Get the Cookbook — $19.99
                </button>
                <div className="sales-trust-notes">
                  <span>⚡ Instant Digital Access After Purchase • Lifetime Updates</span>
                  <span>🔒 Secure Payments Powered by Gumroad • 100% Satisfaction</span>
                </div>
              </div>
            </div>

            {/* Desktop Mockup */}
            <div className="mockup-container">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="ebook-mockup" onClick={scrollToBuySection} style={{ width: '320px', height: '420px', cursor: 'pointer', boxShadow: 'var(--shadow-xl)' }}>
                  <img src="/dessert_cookbook_cover.png" alt="The High-Protein Dessert Cookbook Cover" className="ebook-cover-img" />
                  <div className="ebook-spine"></div>
                  <div className="mockup-badge">
                    NEW
                    <span>$19.99</span>
                  </div>
                </div>
                <div className="rating-under-mockup">
                  <div className="stars">
                    <Star size={16} fill="#fbbf24" color="#fbbf24" />
                    <Star size={16} fill="#fbbf24" color="#fbbf24" />
                    <Star size={16} fill="#fbbf24" color="#fbbf24" />
                    <Star size={16} fill="#fbbf24" color="#fbbf24" />
                    <Star size={16} fill="#fbbf24" color="#fbbf24" />
                  </div>
                  <span className="rating-val">5.0/5.0 Stars</span>
                  <span>(88 verified reviews)</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trust & Guarantee Banner */}
      <section style={{ backgroundColor: 'var(--light-surface)', borderTop: '1px solid var(--light-border)', borderBottom: '1px solid var(--light-border)', padding: '20px 0' }}>
        <div className="container social-proof-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-muted-dark)' }}>
            <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
            <span>100% Secure Gumroad Checkout</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--text-muted-dark)' }}>
            <span>⭐ ⭐ ⭐ ⭐ ⭐</span>
            <span style={{ marginLeft: '6px' }}>5.0 Reader Rating</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-muted-dark)' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>✓ PDF format</span>
            <span>Instant Digital Access Anywhere</span>
          </div>
        </div>
      </section>

      {/* Section: What's Inside This Cookbook? */}
      <section className="section-padding">
        <div className="container">
          <div className="section-title-wrapper" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="section-subtitle">Recipe Collection</span>
            <h2 className="section-title">What's Inside This Cookbook?</h2>
            <p style={{ color: 'var(--text-muted-dark)', maxWidth: '650px', margin: '0 auto' }}>
              Discover 70 easy-to-make recipes across 9 delicious categories, all under 400 calories and packed with protein:
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {categories.map((cat, idx) => (
              <div key={idx} className="feature-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ 
                    backgroundColor: 'var(--primary-glow)', 
                    color: 'var(--primary)', 
                    fontWeight: 800, 
                    borderRadius: '8px', 
                    width: '36px', 
                    height: '36px', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '15px'
                  }}>
                    0{idx + 1}
                  </span>
                  <h3 style={{ fontSize: '18px', margin: 0 }}>{cat.title}</h3>
                </div>
                <p style={{ color: 'var(--text-muted-dark)', fontSize: '14.5px', margin: 0 }}>
                  {cat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Why You'll Love This Cookbook */}
      <section className="section-padding" style={{ backgroundColor: 'var(--light-surface)', borderTop: '1px solid var(--light-border)', borderBottom: '1px solid var(--light-border)' }}>
        <div className="container">
          <div className="section-title-wrapper" style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="section-subtitle">Features & Benefits</span>
            <h2 className="section-title">Why You'll Love This Cookbook</h2>
            <p style={{ color: 'var(--text-muted-dark)', maxWidth: '600px', margin: '0 auto' }}>
              Perfect for anyone who wants healthier desserts without sacrificing flavor.
            </p>
          </div>

          <div style={{ maxWidth: '850px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
            {whyLoveBullets.map((bullet, idx) => (
              <div key={idx} style={{ background: 'white', padding: '16px 20px', borderRadius: '10px', border: '1px solid var(--light-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '15px' }}>{bullet}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Bonus Resources Included */}
      <section className="section-padding">
        <div className="container">
          <div className="section-title-wrapper" style={{ textAlign: 'center', marginBottom: '44px' }}>
            <span className="section-subtitle">Free Inclusions</span>
            <h2 className="section-title">Bonus Resources Included</h2>
            <p style={{ color: 'var(--text-muted-dark)', maxWidth: '650px', margin: '0 auto' }}>
              We include complete kitchen companion guides to make your baking completely effortless:
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', maxWidth: '1000px', margin: '0 auto' }}>
            {bonusResources.map((bonus, idx) => (
              <div key={idx} style={{ 
                background: 'white', 
                padding: '18px 20px', 
                borderRadius: '10px', 
                border: '1px solid var(--light-border)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <Gift size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '14.5px' }}>{bonus}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Perfect For */}
      <section className="section-padding" style={{ backgroundColor: 'var(--light-surface)', borderTop: '1px solid var(--light-border)', borderBottom: '1px solid var(--light-border)' }}>
        <div className="container">
          <div className="section-title-wrapper" style={{ textAlign: 'center', marginBottom: '44px' }}>
            <span className="section-subtitle">Target Audience</span>
            <h2 className="section-title">Perfect For</h2>
            <p style={{ color: 'var(--text-muted-dark)', maxWidth: '600px', margin: '0 auto' }}>
              Whether you are an experienced fitness enthusiast or just starting healthy cooking:
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {perfectFor.map((item, idx) => (
              <div key={idx} style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--light-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span className="badge badge-primary" style={{ alignSelf: 'flex-start' }}>{item.tag}</span>
                <h4 style={{ fontSize: '17px', color: 'var(--text-dark)', margin: '4px 0' }}>{item.tag}</h4>
                <p style={{ fontSize: '14px', color: 'var(--text-muted-dark)', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Product Details Specification Table */}
      <section className="section-padding">
        <div className="container">
          <div className="section-title-wrapper" style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="section-subtitle">Specifications</span>
            <h2 className="section-title">Product Details & Specs</h2>
          </div>

          <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', borderRadius: 'var(--border-radius)', border: '1px solid var(--light-border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <tbody>
                {[
                  { label: "Product Name", val: "The High-Protein Dessert Cookbook" },
                  { label: "Pages", val: "181 pages" },
                  { label: "Recipes", val: "70 high-protein desserts" },
                  { label: "Calories", val: "Under 400 Calories" },
                  { label: "Nutrition", val: "Full Macros Included (Protein, Carbs, Fats)" },
                  { label: "Format", val: "Instant Digital Download (PDF)" },
                  { label: "Access", val: "Lifetime Access" },
                  { label: "Categories", val: "9 Dessert Categories" },
                  { label: "Level", val: "Beginner-Friendly" },
                  { label: "Price", val: "$19.99 (One-time payment)" }
                ].map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--light-border)', backgroundColor: idx % 2 === 0 ? 'var(--light-surface)' : 'white' }}>
                    <td style={{ padding: '16px 20px', fontWeight: 700, width: '220px', color: 'var(--text-dark)', fontSize: '15px' }}>{row.label}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-dark)', fontSize: '15px' }}>
                      {row.label === 'Price' ? (
                        <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '17px' }}>{row.val}</span>
                      ) : (
                        row.val
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section: Instant Access Summary */}
      <section className="section-padding" style={{ backgroundColor: 'var(--dark)', color: 'var(--text-light)', borderTop: '1px solid var(--dark-border)' }}>
        <div className="container" style={{ maxWidth: '850px', textAlign: 'center' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', fontSize: '13.5px', letterSpacing: '0.1em', display: 'block', marginBottom: '14px' }}>
            Instant Access
          </span>
          <h2 style={{ color: 'white', marginBottom: '20px', fontSize: '32px' }}>
            Get Immediate Access to the Complete Cookbook
          </h2>
          <p style={{ color: 'var(--text-muted-light)', fontSize: '16.5px', marginBottom: '32px', lineHeight: 1.6 }}>
            After purchase, you'll receive immediate access to the complete cookbook with:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', textAlign: 'left', marginBottom: '40px' }}>
            {[
              "70 High-Protein Dessert Recipes",
              "181 Beautifully Designed Pages",
              "Premium Cookbook Layout",
              "Lifetime Access & Free Updates",
              "Instant Digital Download (PDF)"
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '14px 18px', borderRadius: '8px', border: '1px solid var(--dark-border)' }}>
                <Check size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span style={{ fontSize: '14.5px', color: 'white', fontWeight: 500 }}>{item}</span>
              </div>
            ))}
          </div>

          <button onClick={handleBuyClick} className="btn btn-primary" style={{ padding: '18px 42px', fontSize: '18px' }}>
            <ShoppingBag size={20} />
            Get the Cookbook ($19.99)
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding" style={{ backgroundColor: 'var(--light-surface)', borderTop: '1px solid var(--light-border)', borderBottom: '1px solid var(--light-border)' }}>
        <div className="container">
          <div className="section-title-wrapper" style={{ textAlign: 'center', marginBottom: '44px' }}>
            <span className="section-subtitle">Got Questions?</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p style={{ color: 'var(--text-muted-dark)' }}>Everything you need to know about the dessert cookbook purchase and access.</p>
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

      {/* Explore the Other Ebook in the Collection */}
      <section className="section-padding" style={{ borderBottom: '1px solid var(--light-border)' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div style={{ background: 'var(--light-surface)', padding: '32px', borderRadius: '16px', border: '1px solid var(--light-border)', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: '28px' }}>
            <div style={{ width: '120px', flexShrink: 0 }}>
              <img src="https://i.ibb.co/8g3JXwpS/HIGH-PROTEIN-RECIPES.jpg" alt="50 High-Protein Recipes" style={{ width: '100%', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }} />
            </div>
            <div style={{ flexGrow: 1 }}>
              <span className="badge badge-primary" style={{ marginBottom: '8px' }}>Also in the BHYou Collection</span>
              <h3 style={{ fontSize: '20px', color: 'var(--text-dark)', marginBottom: '8px' }}>50 High-Protein Recipes Under 400 Calories</h3>
              <p style={{ color: 'var(--text-muted-dark)', fontSize: '14.5px', marginBottom: '16px', lineHeight: 1.6 }}>
                Looking for breakfast, chicken meal preps, lunches, and 7-day meal plans? Check out our flagship 50-recipe cookbook available for only $11.99.
              </p>
              <Link to="/cookbook" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                View 50-Recipe Ebook ($11.99) →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section id="final-cta-section" className="section-padding" style={{ textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 className="sales-final-cta-title">Ready to Satisfy Your Sweet Cravings?</h2>
          <p style={{ color: 'var(--text-muted-dark)', fontSize: '16.5px', marginBottom: '36px', lineHeight: 1.6 }}>
            Join thousands of health-conscious cooks making delicious brownies, ice creams, mousses, and cheesecakes without derailing their fitness goals.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <button onClick={handleBuyClick} className="btn btn-primary" style={{ padding: '18px 48px', fontSize: '18px', width: '100%', maxWidth: '420px' }}>
              <ShoppingBag size={20} />
              Get the Cookbook ($19.99)
            </button>
            <span style={{ fontSize: '13.5px', color: 'var(--text-muted-dark)' }}>💳 Secure checkout powered by Gumroad • Instant Digital PDF Download</span>
          </div>
        </div>
      </section>
    </div>
  );
};
