import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, ArrowRight, 
  Sparkles, Flame, Clock, Calendar, 
  Utensils, Heart, ChevronDown, BookOpen, ShieldCheck
} from 'lucide-react';
import { firePageView, firePixel, db, PRODUCTS, DEFAULT_HERO_SLIDES } from '../db';
import type { BlogPost, EbookProduct, HeroSlideItem } from '../db';
import { CookbookStoreGrid } from '../components/CookbookStoreGrid';

interface HomeProps {
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

interface PopularRecipeItem {
  id: string;
  title: string;
  category: string;
  macros: string;
  image: string;
  alt: string;
  description: string;
  slug: string;
}

const POPULAR_RECIPES: PopularRecipeItem[] = [
  {
    id: 'cheesecake',
    title: 'Vanilla Bean Basque Protein Cheesecake',
    category: 'Healthy Desserts',
    macros: '24g Protein • 195 Kcal',
    image: '/desserts/protein-cheesecake.jpg',
    alt: 'Vanilla bean protein cheesecake dessert with fresh raspberries',
    description: 'Creamy, caramelized Basque-style cheesecake made with Greek yogurt and natural vanilla bean.',
    slug: 'healthy-desserts-under-400-calories'
  },
  {
    id: 'lava-cake',
    title: 'Molten Chocolate Protein Lava Cake',
    category: 'Healthy Desserts',
    macros: '26g Protein • 210 Kcal',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    alt: 'Warm molten chocolate protein dessert with flowing center',
    description: 'Rich warm single-serve chocolate fondant with a molten core, ready in 5 minutes.',
    slug: 'healthy-chocolate-lava-cake'
  },
  {
    id: 'chicken-prep',
    title: 'Garlic Parmesan Chicken Meal Prep',
    category: 'High-Protein Meals',
    macros: '38g Protein • 340 Kcal',
    image: '/chicken_meal_prep.png',
    alt: 'Healthy high-protein chicken meal prep with roasted vegetables',
    description: 'Tender seared chicken breast tossed in garlic herb seasoning and roasted seasonal greens.',
    slug: 'high-protein-chicken-recipes'
  },
  {
    id: 'tiramisu',
    title: 'Espresso Greek Yogurt Tiramisu Cups',
    category: 'Greek Yogurt Recipes',
    macros: '22g Protein • 180 Kcal',
    image: '/desserts/tiramisu-cups.jpg',
    alt: 'Layered Greek yogurt tiramisu dessert cup dusted with dark cocoa',
    description: 'Layered espresso-infused sponge with whipped Greek yogurt protein cream and cocoa dust.',
    slug: 'healthy-desserts-under-400-calories'
  },
  {
    id: 'power-bowl',
    title: 'Mediterranean High-Protein Power Bowl',
    category: 'Low-Calorie Meals',
    macros: '35g Protein • 370 Kcal',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    alt: 'Mediterranean high-protein grain bowl with greens and grilled chicken',
    description: 'Crisp market greens, avocado, fiber-rich grains, and lean chicken breast with light vinaigrette.',
    slug: 'fat-loss-meal-prep'
  },
  {
    id: 'mango-mousse',
    title: 'Whipped Tropical Mango Protein Mousse',
    category: 'Protein Desserts',
    macros: '18g Protein • 160 Kcal',
    image: '/desserts/mango-mousse.jpg',
    alt: 'Tropical mango protein mousse garnished with diced fresh mango',
    description: 'Vibrant, refreshing whipped chilled mousse infused with real Alphonso mango puree.',
    slug: 'healthy-desserts-under-400-calories'
  }
];

export const Home: React.FC<HomeProps> = ({ onToast }) => {
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [product, setProduct] = useState<EbookProduct>(PRODUCTS['bhyou-50-recipes']);

  // Background slider state: images move automatically on their own
  const [heroSlides, setHeroSlides] = useState<HeroSlideItem[]>(DEFAULT_HERO_SLIDES);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  // Continuous automatic movement (every 4 seconds)
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    firePageView('/');
    document.title = 'High-Protein Recipes & Healthy Desserts | BHYou';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Discover easy high-protein recipes, healthy desserts, low-calorie meals, protein-packed snacks, and recipes under 400 calories from BHYou.'
      );
    }

    // Load products & listen for live price/cover updates from dashboard
    const loadProduct = () => {
      db.getProducts().then((all) => {
        if (all && all['bhyou-50-recipes']) {
          setProduct(all['bhyou-50-recipes']);
        }
      }).catch(err => console.error("Error loading products:", err));
    };
    loadProduct();

    const handleProductsUpdated = () => {
      loadProduct();
    };
    window.addEventListener('products_updated', handleProductsUpdated);

    // Load dynamic hero slides & listen for live image updates from dashboard
    const loadHeroSlides = () => {
      db.getHeroSlides().then((slides) => {
        if (slides && slides.length > 0) {
          setHeroSlides(slides);
        }
      }).catch(err => console.error("Error loading hero slides:", err));
    };
    loadHeroSlides();

    const handleHeroSlidesUpdated = () => {
      loadHeroSlides();
    };
    window.addEventListener('hero_slides_updated', handleHeroSlidesUpdated);

    // Load blog posts and prioritize 3 high-quality relevant articles
    db.getPosts().then((posts) => {
      if (posts && posts.length > 0) {
        const prioritySlugs = [
          'high-protein-chicken-recipes',
          'healthy-desserts-under-400-calories',
          'fat-loss-meal-prep',
          'healthy-chocolate-lava-cake'
        ];
        
        const sorted = [...posts].sort((a, b) => {
          const aIndex = prioritySlugs.indexOf(a.slug);
          const bIndex = prioritySlugs.indexOf(b.slug);
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return 0;
        });

        setFeaturedPosts(sorted.slice(0, 3));
      }
    }).catch(err => console.error("Error loading blog posts:", err));

    return () => {
      window.removeEventListener('products_updated', handleProductsUpdated);
      window.removeEventListener('hero_slides_updated', handleHeroSlidesUpdated);
    };
  }, []);

  const handleBuyClick = () => {
    const priceVal = product.price || 15.99;
    firePixel('Google Ads', 'click_buy_cookbook', { price: priceVal });
    firePixel('Meta Pixel', 'InitiateCheckout', { 
      content_name: product.fullTitle || product.title || 'High-Protein Recipes Under 400 Calories', 
      value: priceVal, 
      currency: 'USD' 
    });
    firePixel('Pinterest Tag', 'checkout_click', { 
      product_id: product.id || 'bhyou-50-recipes', 
      value: priceVal 
    });
    onToast('Opening Gumroad Secure Checkout...', 'success');
    window.open(product.gumroadUrl || 'https://bhyou.gumroad.com/l/pzebkb', '_blank');
  };

  const scrollToRecipes = () => {
    const el = document.getElementById('recipes');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="homepage-wrapper">
      
      {/* ================================================== */}
      {/* 1. CINEMATIC HERO SECTION                          */}
      {/* ================================================== */}
      <section 
        className="hero-overlay-showcase" 
        aria-label="High-Protein Recipes and Healthy Desserts Hero"
      >
        {/* Background Images with Automatic Smooth Motion */}
        <div className="hero-bg-slider" aria-hidden="true">
          {heroSlides.map((slide, idx) => (
            <div 
              key={slide.id || idx} 
              className={`hero-bg-slide ${idx === currentHeroSlide ? 'active' : ''}`}
            >
              <img 
                src={slide.image} 
                alt={slide.alt || slide.name} 
                className="hero-bg-img"
                loading={idx === 0 ? 'eager' : 'lazy'}
                fetchPriority={idx === 0 ? 'high' : 'auto'}
              />
            </div>
          ))}
          {/* Dark Film & Vignette Overlay to ensure text readability */}
          <div className="hero-bg-vignette" />
        </div>

        {/* Persuasive Editorial Content Overlay */}
        <div className="container hero-overlay-container">
          <div className="hero-overlay-content">
            
            {/* Eyebrow / Badge */}
            <div className="hero-overlay-badge">
              <Sparkles size={14} className="badge-sparkle" />
              <span>70+ High-Protein Recipes • Healthy Desserts • Under 400 Calories</span>
            </div>

            {/* Main High-Impact H1 Headline (ONLY H1 ON HOMEPAGE) */}
            <h1 className="hero-overlay-title">
              High-Protein Recipes &amp; Healthy Desserts That Actually Taste Good
            </h1>

            {/* Description */}
            <p className="hero-overlay-lead">
              Discover easy high-protein recipes, healthy desserts, and low-calorie meals made with simple ingredients and satisfying flavors. From protein cheesecakes and chocolate treats to everyday meal ideas, BHYou makes healthy eating easier to enjoy.
            </p>

            {/* Value / Trust Pills */}
            <div className="hero-overlay-highlights">
              <div className="hero-overlay-pill">
                <Flame size={15} className="pill-icon" />
                <span>70+ High-Protein Recipes</span>
              </div>
              <div className="hero-overlay-pill">
                <Utensils size={15} className="pill-icon" />
                <span>15g+ Protein Per Serving</span>
              </div>
              <div className="hero-overlay-pill">
                <Sparkles size={15} className="pill-icon" />
                <span>Recipes Under 400 Calories</span>
              </div>
              <div className="hero-overlay-pill">
                <CheckCircle size={15} className="pill-icon" />
                <span>7-Day Meal Plan</span>
              </div>
            </div>

            {/* Primary & Secondary CTAs */}
            <div className="hero-overlay-actions">
              <button 
                onClick={handleBuyClick} 
                className="btn btn-primary hero-btn-main"
                aria-label="Get the Cookbook — $15.99"
              >
                <span>Get the Cookbook — $15.99</span>
                <ArrowRight size={18} />
              </button>
              <button 
                onClick={scrollToRecipes}
                className="btn hero-btn-secondary"
                aria-label="Explore Recipes"
              >
                <span>Explore Recipes</span>
                <span className="hero-arrow-down">↓</span>
              </button>
            </div>

            {/* Authentic Trust Strip (Transparent & Accurate) */}
            <div className="hero-overlay-trust">
              <div className="trust-features-strip">
                <span className="trust-feature-item">
                  <ShieldCheck size={14} className="trust-feature-icon" />
                  <span>Instant PDF Download</span>
                </span>
                <span className="trust-dot">•</span>
                <span className="trust-feature-item">
                  <CheckCircle size={14} className="trust-feature-icon" />
                  <span>Verified Nutritional Breakdown</span>
                </span>
                <span className="trust-dot">•</span>
                <span className="trust-feature-item">
                  <BookOpen size={14} className="trust-feature-icon" />
                  <span>Tested in Real Home Kitchens</span>
                </span>
              </div>
            </div>

          </div>

          {/* Scroll Cue */}
          <div 
            className="hero-overlay-scroll-cue" 
            onClick={scrollToRecipes} 
            role="button" 
            tabIndex={0}
            title="Scroll to explore recipes and cookbooks"
          >
            <span className="scroll-cue-text">Scroll to explore recipes &amp; cookbooks</span>
            <ChevronDown size={20} className="scroll-arrow-anim" />
          </div>

        </div>
      </section>

      {/* ================================================== */}
      {/* 2. QUICK VALUE SECTION (IMMEDIATELY BELOW HERO)   */}
      {/* ================================================== */}
      <section className="quick-value-section" aria-label="Recipes Made for Real Life">
        <div className="container">
          
          <div className="section-title-wrapper text-center">
            <span className="section-subtitle">What We Offer</span>
            <h2 className="section-title">Recipes Made for Real Life</h2>
            <p className="section-intro-text">
              Practical, nutrient-dense recipes designed to make everyday healthy eating simple, enjoyable, and sustainable.
            </p>
          </div>

          <div className="quick-value-grid">
            
            {/* CARD 1 */}
            <article className="quick-value-card">
              <div className="quick-value-icon-box" aria-hidden="true">
                <Flame size={22} strokeWidth={2.2} />
              </div>
              <h3 className="quick-value-title">High-Protein Recipes</h3>
              <p className="quick-value-desc">
                Easy meals, snacks, and desserts made with protein-focused ingredients and satisfying flavors.
              </p>
            </article>

            {/* CARD 2 */}
            <article className="quick-value-card">
              <div className="quick-value-icon-box" aria-hidden="true">
                <Sparkles size={22} strokeWidth={2.2} />
              </div>
              <h3 className="quick-value-title">Healthy Dessert Recipes</h3>
              <p className="quick-value-desc">
                Protein cheesecakes, cookies, mousses, frozen desserts, and sweet treats made for everyday enjoyment.
              </p>
            </article>

            {/* CARD 3 */}
            <article className="quick-value-card">
              <div className="quick-value-icon-box" aria-hidden="true">
                <Utensils size={22} strokeWidth={2.2} />
              </div>
              <h3 className="quick-value-title">Low-Calorie Meals</h3>
              <p className="quick-value-desc">
                Flavorful everyday meals with practical portions, simple ingredients, and recipes under 400 calories.
              </p>
            </article>

            {/* CARD 4 */}
            <article className="quick-value-card">
              <div className="quick-value-icon-box" aria-hidden="true">
                <Heart size={22} strokeWidth={2.2} />
              </div>
              <h3 className="quick-value-title">Easy Healthy Recipes</h3>
              <p className="quick-value-desc">
                Straightforward recipes made for real home kitchens, busy schedules, and everyday routines.
              </p>
            </article>

          </div>

        </div>
      </section>

      {/* ================================================== */}
      {/* 3. ABOUT BHYOU SECTION                             */}
      {/* ================================================== */}
      <section id="about" className="about-bh-section" aria-label="About BHYou Philosophy">
        <div className="container">
          <div className="about-bh-grid">
            
            {/* Left Story Column */}
            <div className="about-bh-story">
              <div className="about-eyebrow-wrap">
                <span className="about-eyebrow-line" aria-hidden="true"></span>
                <span className="about-eyebrow-text">OUR PHILOSOPHY</span>
              </div>

              <h2 className="about-section-heading">
                Healthy Eating Should Taste This Good
              </h2>
              
              <div className="about-bh-copy">
                <p className="about-lead-copy">
                  BHYou makes healthy eating simple, satisfying, and realistic. We create high-protein recipes, healthy desserts, low-calorie meals, and easy meal ideas designed for real everyday life. Our recipes focus on simple ingredients, practical preparation, delicious flavors, and balanced nutrition.
                </p>
                <p className="about-body-copy">
                  From high-protein desserts and Greek yogurt recipes to easy high-protein meals, protein-packed snacks, no-bake treats, and recipes under 400 calories, BHYou helps you enjoy food while making smarter everyday choices.
                </p>
              </div>

              {/* Subtle Gold Text Link */}
              <div className="about-cta-container">
                <Link 
                  to="/about"
                  className="about-philosophy-link"
                  aria-label="Discover the BHYou Philosophy"
                >
                  <span>Discover the BHYou Philosophy</span>
                  <span className="about-link-arrow">→</span>
                </Link>
              </div>
            </div>

            {/* Right Visual Composition */}
            <div className="about-bh-composition">
              
              {/* Subtle Premium Food Photography Showcase */}
              <div className="about-photo-mosaic" aria-label="Curated recipe creations preview">
                <div className="about-photo-card">
                  <img 
                    src="/desserts/protein-cheesecake.jpg" 
                    alt="Vanilla bean protein cheesecake dessert with fresh raspberries" 
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
                    alt="Greek yogurt tiramisu dessert cup" 
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
                    alt="Colorful high-protein meal bowl" 
                    className="about-strip-img"
                    loading="lazy"
                  />
                  <div className="about-photo-overlay">
                    <span className="about-photo-pill">Balanced Meals</span>
                  </div>
                </div>
              </div>

              {/* 4 Supporting Cards */}
              <div className="about-bh-pillars">
                
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

                <article className="about-pillar-card">
                  <div className="pillar-icon-box" aria-hidden="true">
                    <Sparkles size={22} strokeWidth={2.2} />
                  </div>
                  <div className="pillar-content">
                    <h3 className="pillar-title">Healthy Desserts</h3>
                    <p className="pillar-desc">
                      High-protein cheesecakes, cookies, mousses, frozen desserts, and sweet treats made with simple ingredients.
                    </p>
                  </div>
                </article>

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

      {/* ================================================== */}
      {/* 4. COOKBOOK / PRODUCT SECTION                      */}
      {/* ================================================== */}
      <section id="featured-ebook" className="featured-cookbook-section" aria-label="BHYou Digital Cookbooks">
        <div className="container">
          
          {/* Spotlight Hero Card for 70+ High-Protein Recipes Cookbook */}
          <div className="cookbook-spotlight-card">
            <div className="cookbook-spotlight-grid">
              
              {/* Product Visual */}
              <div className="cookbook-spotlight-media">
                <div className="cookbook-cover-wrap">
                  <img 
                    src={product.coverImage || 'https://res.cloudinary.com/dkaob9dmk/image/upload/v1786654276/ghahvw3tceyeuv0dmxa3.webp'} 
                    alt="BHYou High-Protein Recipes Digital Cookbook Cover"
                    className="cookbook-cover-img"
                    loading="lazy"
                  />
                  <div className="cookbook-instant-badge">
                    <BookOpen size={13} />
                    <span>Instant PDF Download</span>
                  </div>
                </div>
              </div>

              {/* Product Narrative */}
              <div className="cookbook-spotlight-info">
                <div className="shopify-header-badge">
                  <Sparkles size={14} className="badge-icon" />
                  <span>The Official Digital Collection</span>
                </div>
                
                <h2 className="cookbook-spotlight-title">
                  70+ High-Protein Recipes in One Cookbook
                </h2>

                <p className="cookbook-spotlight-desc">
                  From high-protein desserts and cheesecakes to cookies, smoothies, bowls, and everyday meal ideas, the BHYou cookbook brings 70 recipes together in one practical collection.
                </p>

                {/* Specific Highlights Required */}
                <div className="cookbook-highlights-grid">
                  <div className="cookbook-highlight-pill">
                    <CheckCircle size={15} className="pill-ico" />
                    <span>70+ Recipes</span>
                  </div>
                  <div className="cookbook-highlight-pill">
                    <CheckCircle size={15} className="pill-ico" />
                    <span>15g+ Protein Per Serving</span>
                  </div>
                  <div className="cookbook-highlight-pill">
                    <CheckCircle size={15} className="pill-ico" />
                    <span>Under 400 Calories</span>
                  </div>
                  <div className="cookbook-highlight-pill">
                    <CheckCircle size={15} className="pill-ico" />
                    <span>9 Recipe Categories</span>
                  </div>
                  <div className="cookbook-highlight-pill">
                    <CheckCircle size={15} className="pill-ico" />
                    <span>7-Day Meal Plan</span>
                  </div>
                </div>

                {/* Price & Primary CTA */}
                <div className="cookbook-purchase-bar">
                  <div className="cookbook-price-wrap">
                    <span className="price-tag">$15.99</span>
                    <span className="price-format">One-time payment • Lifetime access</span>
                  </div>
                  <button 
                    onClick={handleBuyClick} 
                    className="btn btn-primary cookbook-cta-btn"
                    aria-label="View the Cookbook — $15.99"
                  >
                    <span>View the Cookbook →</span>
                  </button>
                </div>

              </div>

            </div>
          </div>

          {/* Complete Digital Library Store Grid */}
          <div className="library-store-divider">
            <CookbookStoreGrid onToast={onToast} showSectionHeader={false} />
          </div>

        </div>
      </section>

      {/* ================================================== */}
      {/* 5. POPULAR RECIPES SECTION                         */}
      {/* ================================================== */}
      <section id="recipes" className="popular-recipes-section" aria-label="Popular High-Protein Recipes">
        <div className="container">
          
          <div className="section-title-wrapper text-center">
            <span className="section-subtitle">Trending in Our Kitchen</span>
            <h2 className="section-title">Popular High-Protein Recipes</h2>
            <p className="section-intro-text">
              Chef-crafted, protein-focused recipes designed to fit seamlessly into your everyday lifestyle.
            </p>
          </div>

          <div className="popular-recipes-grid">
            {POPULAR_RECIPES.map((recipe) => (
              <article key={recipe.id} className="popular-recipe-card">
                <Link to={`/blog/${recipe.slug}`} className="recipe-card-media" title={`View recipe for ${recipe.title}`}>
                  <img 
                    src={recipe.image} 
                    alt={recipe.alt} 
                    className="recipe-card-img"
                    loading="lazy"
                  />
                  <span className="recipe-category-pill">{recipe.category}</span>
                  <div className="recipe-macro-badge">
                    <Flame size={12} />
                    <span>{recipe.macros}</span>
                  </div>
                </Link>

                <div className="recipe-card-body">
                  <h3 className="recipe-card-title">
                    <Link to={`/blog/${recipe.slug}`} className="recipe-title-link">
                      {recipe.title}
                    </Link>
                  </h3>
                  <p className="recipe-card-desc">
                    {recipe.description}
                  </p>
                  <div className="recipe-card-footer">
                    <Link to={`/blog/${recipe.slug}`} className="recipe-view-link">
                      <span>View Recipe</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="recipes-bottom-cta text-center">
            <Link to="/blog" className="btn btn-secondary">
              Browse All Recipes &amp; Guides
              <ArrowRight size={16} />
            </Link>
          </div>

        </div>
      </section>

      {/* ================================================== */}
      {/* 6. BLOG / SEO CONTENT SECTION                      */}
      {/* ================================================== */}
      <section className="featured-blogs-section" aria-label="Healthy Recipe Ideas & Nutrition Guides">
        <div className="container">
          
          <div className="section-title-wrapper text-center">
            <span className="section-subtitle">Nutrition Guides &amp; Meal Prep</span>
            <h2 className="section-title">Healthy Recipe Ideas &amp; Nutrition Guides</h2>
            <p className="section-intro-text">
              Practical meal prep strategies, high-protein cooking tips, and nutritional guides for everyday life.
            </p>
          </div>

          <div className="featured-blogs-grid">
            {featuredPosts.map((post) => (
              <article key={post.id} className="editorial-blog-card">
                <Link to={`/blog/${post.slug}`} className="editorial-card-media" title={`Read guide: ${post.title}`}>
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
              View All Articles &amp; Guides
              <ArrowRight size={16} />
            </Link>
          </div>

        </div>
      </section>

      {/* ================================================== */}
      {/* 7. FINAL CTA SECTION                               */}
      {/* ================================================== */}
      <section className="final-home-cta-section" aria-label="Start Healthy Eating Today">
        <div className="container">
          <div className="final-cta-card text-center">
            <div className="shopify-header-badge">
              <Sparkles size={14} className="badge-icon" />
              <span>Start Cooking Today</span>
            </div>
            <h2 className="final-cta-title">
              Make Healthy Eating Something You Look Forward To
            </h2>
            <p className="final-cta-desc">
              Explore easy high-protein recipes, healthy desserts, and practical meal ideas from BHYou.
            </p>
            <div className="final-cta-actions">
              <a href="/#recipes" className="btn btn-primary final-btn-main">
                Explore Recipes →
              </a>
              <Link to="/cookbooks" className="btn btn-secondary final-btn-sub">
                Browse Cookbooks →
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
