import React, { useEffect } from 'react';
import { CookbookStoreGrid } from '../components/CookbookStoreGrid';
import { firePageView } from '../db';
import { Sparkles, ShieldCheck, CheckCircle } from 'lucide-react';

interface CookbooksProps {
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const Cookbooks: React.FC<CookbooksProps> = ({ onToast }) => {
  useEffect(() => {
    firePageView('/cookbooks');
    document.title = 'BHYou Cookbooks & Digital Library | High-Protein & Healthy Recipes';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Explore the official BHYou digital cookbook library. Chef-crafted high-protein recipes under 400 calories, guilt-free desserts, meal plans, and instant PDF downloads.');
    }
  }, []);

  return (
    <div className="cookbooks-page-wrapper">
      
      {/* Top Banner Header */}
      <section className="cookbooks-hero-header">
        <div className="container">
          <div className="cookbooks-header-content text-center">
            <div className="shopify-header-badge">
              <Sparkles size={14} className="badge-icon" />
              <span>Official BHYou Library</span>
            </div>
            <h1 className="cookbooks-main-title">
              Digital Cookbooks &amp; Meal Plans
            </h1>
            <p className="cookbooks-lead-text">
              Chef-crafted recipes strictly under 400 calories and packed with 20g–40g of protein. Discover our complete collection of digital cookbooks with instant PDF delivery to any device.
            </p>
          </div>
        </div>
      </section>

      {/* Main Shopify Store Grid */}
      <CookbookStoreGrid onToast={onToast} showSectionHeader={false} />

      {/* Why Choose BHYou Guarantee Section */}
      <section className="cookbooks-guarantee-section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '40px' }}>
            <span className="section-subtitle">The BHYou Difference</span>
            <h2 className="section-title">Why Foodies Love Our Cookbooks</h2>
          </div>

          <div className="guarantee-grid">
            <div className="guarantee-card">
              <div className="guarantee-icon-box">
                <CheckCircle size={22} />
              </div>
              <h3>Verified Macro Breakdown</h3>
              <p>Every single recipe has calculated calories, protein, carbs, and fat so you can track your nutrition with 100% precision.</p>
            </div>

            <div className="guarantee-card">
              <div className="guarantee-icon-box">
                <Sparkles size={22} />
              </div>
              <h3>Real Gourmet Flavor</h3>
              <p>No bland boiled chicken or rubbery textures. We use smart culinary substitutions so you enjoy actual lava cakes, cheesecakes, and juicy dinners.</p>
            </div>

            <div className="guarantee-card">
              <div className="guarantee-icon-box">
                <ShieldCheck size={22} />
              </div>
              <h3>Instant Lifetime Access</h3>
              <p>Direct PDF download sent straight to your email. Save to your Apple Books, Google Drive, Kindle, or computer for instant access anytime.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
