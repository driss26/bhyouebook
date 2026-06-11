import React, { useEffect } from 'react';
import { Shield } from 'lucide-react';
import { firePageView } from '../db';

export const Terms: React.FC = () => {
  useEffect(() => {
    firePageView('/terms');
    document.title = 'Terms of Service | 50 High-Protein Recipes Under 400 Calories';
  }, []);

  return (
    <div className="container" style={{ padding: '80px 16px', maxWidth: '800px' }}>
      <header style={{ marginBottom: '40px', borderBottom: '1px solid var(--light-border)', paddingBottom: '24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 600, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
          <Shield size={16} /> Legal Information
        </div>
        <h1 style={{ fontSize: '36px', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Terms of Service</h1>
        <p style={{ color: 'var(--text-muted-dark)', marginTop: '8px' }}>Last Updated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </header>

      <div className="legal-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: '1.7', fontSize: '15px', color: 'var(--text-dark)' }}>
        <section>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>1. Agreement to Terms</h2>
          <p>
            By accessing or purchasing goods from our website, you agree to be bound by these Terms of Service. If you do not agree to all terms, you must not access the website or use our services.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>2. Cookbook Purchases & Access</h2>
          <p>
            All cookbook sales are final digital products. Due to the immediate download nature of these products, we do not offer refunds or exchanges once purchase or download is completed.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>3. Intellectual Property</h2>
          <p>
            All recipes, text, photos, layout, design, graphics, and code featured in the "50 High-Protein Recipes" cookbook and on this website are the intellectual property of BHYou Nutrition. You may use them for personal, non-commercial use only. Sharing, reselling, or reproducing these recipes without explicit written permission is strictly prohibited.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>4. Health and Nutrition Disclaimer</h2>
          <p>
            The recipes and nutritional information (calories, macronutrients) presented on this website and in the cookbook are for educational and general cooking purposes. They are not intended as personal medical or dietetic advice. Always consult a qualified medical professional or registered dietitian before changing your eating habits, especially if you have existing health conditions.
          </p>
        </section>

        <section style={{ borderTop: '1px solid var(--light-border)', paddingTop: '24px', marginTop: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>5. Contact Us</h2>
          <p>
            If you have any questions or concerns regarding these Terms of Service, please reach out to us at <a href="mailto:support@bhyou.com" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>support@bhyou.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
};
