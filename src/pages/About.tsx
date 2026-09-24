import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Flame, Sparkles, Utensils, Heart, 
  CheckCircle, ArrowRight, Clock, Award
} from 'lucide-react';
import { firePageView } from '../db';
import { CookbookStoreGrid } from '../components/CookbookStoreGrid';

interface AboutProps {
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const About: React.FC<AboutProps> = ({ onToast }) => {
  useEffect(() => {
    firePageView('/about');
    document.title = 'About BHYou | Healthy Eating Should Taste This Good';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content', 
        'Discover the BHYou philosophy. Simple, satisfying, and realistic high-protein recipes, healthy desserts, low-calorie meals, and healthy meal ideas for everyday life.'
      );
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-page-wrapper">
      
      {/* 1. Main Editorial Hero & Philosophy */}
      <section className="about-bh-section" aria-label="About BHYou Philosophy">
        <div className="container">
          <div className="about-bh-grid">
            
            {/* Left Story Column */}
            <div className="about-bh-story">
              <div className="about-eyebrow-wrap">
                <span className="about-eyebrow-line" aria-hidden="true"></span>
                <span className="about-eyebrow-text">OUR PHILOSOPHY</span>
              </div>

              <h1 className="about-section-heading">
                Healthy Eating Should Taste This Good
              </h1>
              
              <div className="about-bh-copy">
                <p className="about-lead-copy">
                  BHYou makes healthy eating simple, satisfying, and realistic. We create high-protein recipes, healthy desserts, low-calorie meals, and healthy meal ideas designed for real everyday life. Our healthy recipes focus on simple ingredients, practical preparation, delicious flavors, and balanced nutrition.
                </p>
                <p className="about-body-copy">
                  From high-protein desserts, protein dessert recipes, and Greek yogurt recipes to easy healthy meals, no-bake treats, high-protein snacks, protein-packed recipes, and recipes under 400 calories, BHYou helps you enjoy food while making smarter everyday choices.
                </p>
                <p className="about-body-copy">
                  We believe that eating well should never feel like a chore or a restriction. By reimagining everyday comfort foods through macro-optimized culinary techniques, our guides empower you to cook meals you genuinely look forward to eating every single day.
                </p>
              </div>

              <div className="about-cta-container flex gap-2" style={{ flexWrap: 'wrap' }}>
                <Link to="/cookbooks" className="btn btn-primary">
                  Browse Cookbooks
                  <ArrowRight size={16} />
                </Link>
                <Link to="/blog" className="btn btn-secondary">
                  Free Recipe Guides
                </Link>
              </div>
            </div>

            {/* Right Visual Composition */}
            <div className="about-bh-composition">
              
              {/* Food Photography Showcase */}
              <div className="about-photo-mosaic" aria-label="Curated recipe creations preview">
                <div className="about-photo-card">
                  <img 
                    src="/desserts/protein-cheesecake.jpg" 
                    alt="High-protein cheesecake with fresh berries" 
                    className="about-strip-img"
                    loading="lazy"
                  />
                  <div className="about-photo-overlay">
                    <span className="about-photo-pill">Protein Cheesecakes</span>
                  </div>
                </div>

                <div className="about-photo-card">
                  <img 
                    src="/desserts/tiramisu-cups.jpg" 
                    alt="Greek yogurt protein dessert cup" 
                    className="about-strip-img"
                    loading="lazy"
                  />
                  <div className="about-photo-overlay">
                    <span className="about-photo-pill">Greek Yogurt Treats</span>
                  </div>
                </div>

                <div className="about-photo-card">
                  <img 
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80" 
                    alt="Colorful high-protein meal idea" 
                    className="about-strip-img"
                    loading="lazy"
                  />
                  <div className="about-photo-overlay">
                    <span className="about-photo-pill">Balanced Meals</span>
                  </div>
                </div>
              </div>

              {/* 4 Elegant Feature Cards (2x2 Grid) */}
              <div className="about-bh-pillars">
                
                {/* CARD 1 */}
                <article className="about-pillar-card">
                  <div className="pillar-icon-box" aria-hidden="true">
                    <Flame size={22} strokeWidth={2.2} />
                  </div>
                  <div className="pillar-content">
                    <h3 className="pillar-title">High-Protein Recipes</h3>
                    <p className="pillar-desc">
                      Protein-rich recipes designed to make everyday meals and desserts more satisfying.
                    </p>
                  </div>
                </article>

                {/* CARD 2 */}
                <article className="about-pillar-card">
                  <div className="pillar-icon-box" aria-hidden="true">
                    <Sparkles size={22} strokeWidth={2.2} />
                  </div>
                  <div className="pillar-content">
                    <h3 className="pillar-title">Healthy Dessert Recipes</h3>
                    <p className="pillar-desc">
                      High-protein cheesecakes, cookies, mousses, frozen desserts, and sweet treats made with simple ingredients.
                    </p>
                  </div>
                </article>

                {/* CARD 3 */}
                <article className="about-pillar-card">
                  <div className="pillar-icon-box" aria-hidden="true">
                    <Utensils size={22} strokeWidth={2.2} />
                  </div>
                  <div className="pillar-content">
                    <h3 className="pillar-title">Low-Calorie Meals</h3>
                    <p className="pillar-desc">
                      Flavorful meal ideas and recipes designed around practical portions and everyday nutrition.
                    </p>
                  </div>
                </article>

                {/* CARD 4 */}
                <article className="about-pillar-card">
                  <div className="pillar-icon-box" aria-hidden="true">
                    <Heart size={22} strokeWidth={2.2} />
                  </div>
                  <div className="pillar-content">
                    <h3 className="pillar-title">Simple, Realistic Food</h3>
                    <p className="pillar-desc">
                      Easy recipes using accessible ingredients and straightforward preparation for busy everyday routines.
                    </p>
                  </div>
                </article>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. The BHYou Standard Section */}
      <section className="about-standards-section" style={{ padding: '90px 0', background: '#ffffff', borderBottom: '1px solid var(--light-border)' }}>
        <div className="container">
          <div className="text-center" style={{ maxWidth: '720px', margin: '0 auto 50px' }}>
            <span className="section-subtitle">Our Promise</span>
            <h2 className="section-title">The BHYou Culinary Standard</h2>
            <p style={{ color: 'var(--text-muted-dark)', fontSize: '16px', lineHeight: 1.6 }}>
              Every recipe in our digital library is thoroughly developed, tested, and fine-tuned to ensure you succeed on your healthy eating journey.
            </p>
          </div>

          <div className="guarantee-grid">
            <div className="guarantee-card">
              <div className="guarantee-icon-box">
                <CheckCircle size={22} />
              </div>
              <h3>100% Real Grocery Ingredients</h3>
              <p>No obscure powders or hard-to-find ingredients. Everything is made with everyday grocery staples found at any local market.</p>
            </div>

            <div className="guarantee-card">
              <div className="guarantee-icon-box">
                <Clock size={22} />
              </div>
              <h3>Quick &amp; Realistic Preparation</h3>
              <p>Designed for busy schedules. Most meals take 20 to 30 minutes from prep to table, with simple step-by-step instructions.</p>
            </div>

            <div className="guarantee-card">
              <div className="guarantee-icon-box">
                <Award size={22} />
              </div>
              <h3>Verified Macro Breakdown</h3>
              <p>Every single recipe includes precise calorie counts and macro breakdown so you can eat with confidence and reach your goals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Cookbooks Store Grid */}
      <CookbookStoreGrid onToast={onToast} showSectionHeader={true} sectionId="about-cookbooks" />

    </div>
  );
};
export default About;
