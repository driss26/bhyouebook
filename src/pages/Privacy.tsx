import React, { useEffect } from 'react';
import { Shield } from 'lucide-react';
import { firePageView } from '../db';

export const Privacy: React.FC = () => {
  useEffect(() => {
    firePageView('/privacy');
    document.title = 'Privacy Policy | 50 High-Protein Recipes Under 400 Calories';
  }, []);

  return (
    <div className="container" style={{ padding: '80px 16px', maxWidth: '800px' }}>
      <header style={{ marginBottom: '40px', borderBottom: '1px solid var(--light-border)', paddingBottom: '24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 600, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
          <Shield size={16} /> Legal Information
        </div>
        <h1 style={{ fontSize: '36px', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Privacy Policy</h1>
        <p style={{ color: 'var(--text-muted-dark)', marginTop: '8px' }}>Last Updated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </header>

      <div className="legal-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: '1.7', fontSize: '15px', color: 'var(--text-dark)' }}>
        <section>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us when you subscribe to our recipe newsletter, request the free cookbook version, or contact us. This information typically includes your email address and any details you provide in your messages.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul style={{ paddingLeft: '20px', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>Deliver our High-Protein Recipes cookbook and premium contents.</li>
            <li>Send you weekly free macro-friendly recipes, newsletters, and cooking tips.</li>
            <li>Respond to your support queries, questions, or comments.</li>
            <li>Monitor and analyze website performance, usage trends, and conversions.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>3. Tracking and Analytics Pixels</h2>
          <p>
            Our website uses third-party analytics and marketing tools (such as Google Analytics 4, Meta Pixel, Pinterest Tag, and Microsoft Clarity) to track user activity, measure conversion rates from advertisements, and record anonymized user sessions. These tools store cookies on your device to gather aggregated web traffic statistics. You can disable cookies in your browser settings at any time if you wish to opt out.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>4. Third-Party Services</h2>
          <p>
            We partner with reliable third-party platforms to process payments and offer sponsored verification:
          </p>
          <ul style={{ paddingLeft: '20px', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Gumroad:</strong> Facilitates our paid cookbook purchases. Your payment detail transaction information is handled securely by Gumroad under their own privacy protocols.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>5. Your Rights and Opt-Out</h2>
          <p>
            You have the right to opt out of receiving our weekly recipes or newsletters at any time. Simply click the "Unsubscribe" link located at the bottom of any of our emails, or email us directly to request the removal of your data.
          </p>
        </section>

        <section style={{ borderTop: '1px solid var(--light-border)', paddingTop: '24px', marginTop: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>6. Contact Us</h2>
          <p>
            If you have any questions or concerns regarding this Privacy Policy, please reach out to us at <a href="mailto:support@bhyou.com" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>support@bhyou.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
};
