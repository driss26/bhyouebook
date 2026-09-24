import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, ArrowRight, Star, BookOpen, Flame, Utensils, 
  ShieldCheck, Zap, Sparkles, Download 
} from 'lucide-react';
import { db, firePixel, PRODUCTS } from '../db';
import type { EbookProduct } from '../db';

interface CookbookStoreGridProps {
  onToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  sectionId?: string;
  showSectionHeader?: boolean;
}

export const CookbookStoreGrid: React.FC<CookbookStoreGridProps> = ({
  onToast,
  sectionId = 'featured-ebook',
  showSectionHeader = true
}) => {
  const [products, setProducts] = useState<Record<string, EbookProduct>>(PRODUCTS);

  const loadProducts = () => {
    db.getProducts().then((all) => {
      if (all && Object.keys(all).length > 0) {
        setProducts(all);
      }
    }).catch(err => console.error("Error loading products for store:", err));
  };

  useEffect(() => {
    loadProducts();

    const handleProductsUpdated = () => {
      loadProducts();
    };
    window.addEventListener('products_updated', handleProductsUpdated);

    return () => {
      window.removeEventListener('products_updated', handleProductsUpdated);
    };
  }, []);

  const handleBuyClick = (product: EbookProduct) => {
    const priceVal = product.price || 15.99;
    firePixel('Google Ads', 'click_buy_cookbook', { price: priceVal, product_id: product.id });
    firePixel('Meta Pixel', 'InitiateCheckout', { 
      content_name: product.fullTitle || product.title, 
      value: priceVal, 
      currency: 'USD' 
    });
    firePixel('Pinterest Tag', 'checkout_click', { 
      product_id: product.id, 
      value: priceVal 
    });
    if (onToast) {
      onToast('Opening Gumroad Secure Checkout...', 'success');
    }
    const targetUrl = product.gumroadUrl || (product.id === 'high-protein-dessert-cookbook-70' ? 'https://bhyou.gumroad.com/l/bhyou' : 'https://bhyou.gumroad.com/l/pzebkb');
    window.open(targetUrl, '_blank');
  };

  const productList = Object.values(products);

  return (
    <section id={sectionId} className="shopify-store-section" aria-label="BHYou Digital Cookbooks & Products">
      <div className="container">
        
        {showSectionHeader && (
          <div className="shopify-store-header text-center">
            <div className="shopify-header-badge">
              <Sparkles size={14} className="badge-icon" />
              <span>BHYou Digital Library • Instant PDF Downloads</span>
            </div>
            <h2 className="shopify-store-title">
              Our Digital Cookbooks &amp; Recipe Guides
            </h2>
            <p className="shopify-store-subtitle">
              Chef-crafted, macro-optimized digital cookbooks designed to help you hit your protein goals, support balanced nutrition, and enjoy delicious gourmet food every single day.
            </p>
          </div>
        )}

        {/* Shopify-Style Product Grid */}
        <div className="shopify-product-grid">
          {productList.map((product) => {
            const isDessert = product.id === 'high-protein-dessert-cookbook-70';
            const badgeLabel = isDessert ? 'NEW RELEASE' : 'BEST SELLER';
            const ratingValue = product.rating || (isDessert ? 5.0 : 4.9);
            const reviewsCount = product.reviewsCount || (isDessert ? 88 : 142);
            const discountPercent = product.originalPrice && product.originalPrice > product.price
              ? Math.round((1 - product.price / product.originalPrice) * 100)
              : null;

            return (
              <article key={product.id} className="shopify-product-card">
                
                {/* 1. Product Image with Badges */}
                <div className="shopify-card-media-wrap">
                  <Link to={product.route || '/cookbook'} className="shopify-img-link" title={`View details for ${product.title}`}>
                    <img 
                      src={product.coverImage || (isDessert ? 'https://res.cloudinary.com/dkaob9dmk/image/upload/v1786654276/ghahvw3tceyeuv0dmxa3.webp' : 'https://i.ibb.co/8g3JXwpS/HIGH-PROTEIN-RECIPES.jpg')} 
                      alt={`${product.title} Cover`}
                      className="shopify-product-img"
                      style={{ maxHeight: '310px', maxWidth: '230px', width: 'auto', height: 'auto', objectFit: 'contain' }}
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fallback = isDessert ? 'https://res.cloudinary.com/dkaob9dmk/image/upload/v1786654276/ghahvw3tceyeuv0dmxa3.webp' : 'https://i.ibb.co/8g3JXwpS/HIGH-PROTEIN-RECIPES.jpg';
                        if (target.src !== fallback) {
                          target.src = fallback;
                        }
                      }}
                    />
                  </Link>

                  {/* Floating Badges */}
                  <div className="shopify-media-badges">
                    <span className={`shopify-pill-badge ${isDessert ? 'badge-new' : 'badge-bestseller'}`}>
                      {badgeLabel}
                    </span>
                    <span className="shopify-format-tag">
                      <BookOpen size={12} /> Instant PDF
                    </span>
                  </div>
                </div>

                {/* 2. Product Info (Under the Image - Shopify Style) */}
                <div className="shopify-card-body">
                  
                  {/* Price Row (Placed under image as requested) */}
                  <div className="shopify-price-row">
                    <span className="shopify-sale-price">${product.price}</span>
                    {product.originalPrice && (
                      <span className="shopify-original-price">${product.originalPrice}</span>
                    )}
                    {discountPercent && (
                      <span className="shopify-discount-tag">
                        SAVE {discountPercent}%
                      </span>
                    )}
                  </div>

                  {/* Rating Stars & Count */}
                  <div className="shopify-rating-row">
                    <div className="shopify-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />
                      ))}
                    </div>
                    <span className="shopify-rating-num">{ratingValue.toFixed(1)}</span>
                    <span className="shopify-reviews-count">({reviewsCount} reviews)</span>
                  </div>

                  {/* Product Title */}
                  <h3 className="shopify-product-title">
                    <Link to={product.route || '/cookbook'} className="shopify-title-link">
                      {product.title}
                    </Link>
                  </h3>

                  {/* Subtitle / Hook */}
                  {product.subtitle && (
                    <p className="shopify-product-sub">
                      {product.subtitle}
                    </p>
                  )}

                  {/* Macro Highlights Pills */}
                  <div className="shopify-feature-pills">
                    <span className="feature-pill">
                      <Flame size={13} className="pill-ico" />
                      {product.recipes} Recipes
                    </span>
                    <span className="feature-pill">
                      <Utensils size={13} className="pill-ico" />
                      {product.calories || 'Under 400 Kcal'}
                    </span>
                    <span className="feature-pill">
                      <Sparkles size={13} className="pill-ico" />
                      {product.protein || 'High-Protein'}
                    </span>
                  </div>

                  {/* Description Excerpt */}
                  <p className="shopify-product-desc">
                    {product.description}
                  </p>

                  {/* What Is Included Checklist */}
                  <div className="shopify-inclusions-list">
                    <div className="inclusion-row">
                      <CheckCircle size={15} className="check-ico" />
                      <span>{isDessert ? '70 Low-Calorie Gourmet Desserts (Under 220 Kcal)' : '50 High-Protein Dinners & Meal Preps (Under 400 Kcal)'}</span>
                    </div>
                    <div className="inclusion-row">
                      <CheckCircle size={15} className="check-ico" />
                      <span>Complete calories, protein, carb &amp; fat breakdown per serving</span>
                    </div>
                    <div className="inclusion-row">
                      <CheckCircle size={15} className="check-ico" />
                      <span>Instant email delivery — view on phone, tablet, or desktop</span>
                    </div>
                  </div>

                  {/* Action CTA Buttons */}
                  <div className="shopify-actions-wrap">
                    <button 
                      onClick={() => handleBuyClick(product)} 
                      className="btn btn-primary shopify-buy-btn"
                      aria-label={`Buy ${product.title} for $${product.price}`}
                    >
                      <Download size={16} />
                      Get Instant Ebook — ${product.price}
                    </button>
                    <Link 
                      to={product.route || '/cookbook'} 
                      className="btn btn-secondary shopify-details-btn"
                      title="View full description, recipe list and previews"
                    >
                      View Details
                      <ArrowRight size={15} />
                    </Link>
                  </div>

                </div>

              </article>
            );
          })}
        </div>

        {/* Bottom Store Trust Guarantee Bar */}
        <div className="shopify-store-trust-bar">
          <div className="trust-bar-item">
            <Zap size={18} className="trust-bar-ico" />
            <div>
              <strong>Instant Digital PDF Download</strong>
              <p>Sent to your email immediately by Gumroad.</p>
            </div>
          </div>
          <div className="trust-bar-item">
            <ShieldCheck size={18} className="trust-bar-ico" />
            <div>
              <strong>256-Bit SSL Encrypted Checkout</strong>
              <p>Guaranteed secure payment processing.</p>
            </div>
          </div>
          <div className="trust-bar-item">
            <BookOpen size={18} className="trust-bar-ico" />
            <div>
              <strong>Lifetime Access &amp; Future Updates</strong>
              <p>One-time payment, free updates forever.</p>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
};
