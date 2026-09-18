import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface DessertSlide {
  id: string;
  name: string;
  shortLabel: string;
  category: string;
  macros: string;
  image: string;
  alt: string;
  description: string;
}

const DESSERT_SLIDES: DessertSlide[] = [
  {
    id: 'cheesecake',
    name: 'Vanilla Bean Basque Protein Cheesecake',
    shortLabel: 'Protein Cheesecake',
    category: 'Signature Bake',
    macros: '24g Protein • 195 Kcal',
    image: '/desserts/protein-cheesecake.jpg',
    alt: 'Slice of Basque burnt protein cheesecake topped with fresh raspberries and coulis',
    description: 'Rich, caramelized crust with an airy whipped protein center and tart fresh berries.'
  },
  {
    id: 'tiramisu',
    name: 'Espresso-Infused Tiramisu Cups',
    shortLabel: 'Tiramisu Cups',
    category: 'No-Bake Gourmet',
    macros: '22g Protein • 180 Kcal',
    image: '/desserts/tiramisu-cups.jpg',
    alt: 'Layered Italian tiramisu cup with espresso sponge, whipped protein cream, and cocoa',
    description: 'Delicate espresso sponge layered with high-protein Greek mascarpone cream and raw cocoa.'
  },
  {
    id: 'chocolate',
    name: 'Molten Dark Chocolate Protein Fondant',
    shortLabel: 'Chocolate Lava',
    category: 'Warm Dessert',
    macros: '26g Protein • 210 Kcal',
    image: '/desserts/chocolate-dessert.jpg',
    alt: 'Warm molten chocolate protein lava cake sliced open with chocolate flowing from the center',
    description: 'Decadent dark chocolate cake with a velvety molten center made strictly under 220 calories.'
  },
  {
    id: 'mango',
    name: 'Tropical Whipped Mango Protein Mousse',
    shortLabel: 'Mango Mousse',
    category: 'Light & Fruity',
    macros: '18g Protein • 160 Kcal',
    image: '/desserts/mango-mousse.jpg',
    alt: 'Glass goblet of vibrant golden mango protein mousse garnished with diced mango and mint',
    description: 'Whipped Greek yogurt and Alphonso mango purée blended into an airy, cloud-like mousse.'
  },
  {
    id: 'cupcakes',
    name: 'Golden Vanilla Whipped Protein Cupcakes',
    shortLabel: 'Protein Cupcakes',
    category: 'Bakery Classics',
    macros: '20g Protein • 175 Kcal',
    image: '/desserts/protein-cupcakes.jpg',
    alt: 'Two bakery-style vanilla protein cupcakes on a marble stand with whipped swirl frosting',
    description: 'Fluffy whole-grain vanilla sponge topped with high-protein whipped frosting and blueberries.'
  },
  {
    id: 'caramel',
    name: 'Salted Caramel Pecan Protein Pots',
    shortLabel: 'Caramel Desserts',
    category: 'Chilled Treats',
    macros: '21g Protein • 190 Kcal',
    image: '/desserts/caramel-dessert.jpg',
    alt: 'Glass dessert jar with layered salted caramel protein cream, pecans, and sea salt',
    description: 'Layered sugar-free caramel custard crowned with toasted pecans and flaky sea salt.'
  }
];

const AUTOPLAY_DURATION_MS = 5500;

export const CinematicDessertShowcase: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<number | null>(null);
  const showcaseRef = useRef<HTMLDivElement | null>(null);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % DESSERT_SLIDES.length);
    setProgress(0);
  }, []);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + DESSERT_SLIDES.length) % DESSERT_SLIDES.length);
    setProgress(0);
  }, []);

  const goToSlide = (idx: number) => {
    setActiveIndex(idx);
    setProgress(0);
  };

  // Progress and autoplay loop
  useEffect(() => {
    if (!isPlaying) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      return;
    }

    const stepMs = 50;
    const increment = (stepMs / AUTOPLAY_DURATION_MS) * 100;

    progressIntervalRef.current = window.setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          nextSlide();
          return 0;
        }
        return old + increment;
      });
    }, stepMs);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, nextSlide]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === ' ') {
      e.preventDefault();
      setIsPlaying((prev) => !prev);
    }
  };

  const currentSlide = DESSERT_SLIDES[activeIndex];

  return (
    <section 
      className="cinematic-dessert-section" 
      aria-label="Cinematic Desserts Showcase"
      ref={showcaseRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="container">
        
        {/* Cinematic Commercial Showcase Screen */}
        <div 
          className="cinematic-theater"
          onMouseEnter={() => setIsPlaying(false)}
          onMouseLeave={() => setIsPlaying(true)}
          role="region"
          aria-live="polite"
        >
          {/* Slides Images Stack with Ken Burns motion */}
          <div className="cinematic-viewport">
            {DESSERT_SLIDES.map((slide, index) => {
              const isActive = index === activeIndex;
              return (
                <div 
                  key={slide.id} 
                  className={`cinematic-slide ${isActive ? 'active' : ''}`}
                  aria-hidden={!isActive}
                >
                  <img 
                    src={slide.image} 
                    alt={slide.alt}
                    className="cinematic-slide-img"
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                  <div className="cinematic-vignette" />
                </div>
              );
            })}

            {/* Top Film Metadata Overlay */}
            <div className="cinematic-top-bar">
              <div className="cinematic-badge">
                <Sparkles size={13} className="sparkle-icon" />
                <span>BHYou Culinary Lab • Gourmet Health Series</span>
              </div>
              <div className="cinematic-counter">
                <span>0{activeIndex + 1}</span>
                <span className="counter-sep">/</span>
                <span>0{DESSERT_SLIDES.length}</span>
              </div>
            </div>

            {/* Lower Overlay Content */}
            <div className="cinematic-caption-panel">
              <div className="caption-tag-row">
                <span className="dessert-category-pill">{currentSlide.category}</span>
                <span className="dessert-macro-pill">{currentSlide.macros}</span>
              </div>
              <h3 className="cinematic-dessert-title">{currentSlide.name}</h3>
              <p className="cinematic-dessert-desc">{currentSlide.description}</p>
            </div>

            {/* Linear Progress Bar */}
            <div className="cinematic-progress-track">
              <div 
                className="cinematic-progress-fill" 
                style={{ width: `${progress}%` }} 
              />
            </div>

            {/* Interactive Player Controls */}
            <div className="cinematic-controls">
              <button 
                onClick={prevSlide} 
                className="cinematic-ctrl-btn"
                aria-label="Previous Dessert"
                title="Previous Dessert"
              >
                <ChevronLeft size={20} />
              </button>

              <button 
                onClick={() => setIsPlaying((p) => !p)} 
                className="cinematic-ctrl-btn play-pause-btn"
                aria-label={isPlaying ? 'Pause auto-play' : 'Play auto-play'}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>

              <button 
                onClick={nextSlide} 
                className="cinematic-ctrl-btn"
                aria-label="Next Dessert"
                title="Next Dessert"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Quick-select Navigation Tabs */}
          <div className="cinematic-pill-nav" role="tablist">
            {DESSERT_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                role="tab"
                aria-selected={idx === activeIndex}
                className={`cinematic-tab-pill ${idx === activeIndex ? 'active' : ''}`}
                onClick={() => goToSlide(idx)}
              >
                <span className="pill-dot" />
                <span className="pill-text">{slide.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* SEO-Readable Content Block as required by prompt */}
        <div className="cinematic-seo-content-block">
          <div className="seo-block-inner">
            <span className="section-subtitle">Gourmet Nutrition Reimagined</span>
            <h2 className="section-title">Healthy High-Protein Desserts</h2>
            <p className="seo-supporting-paragraph">
              Explore delicious protein-packed desserts, from chocolate cheesecakes and tiramisu cups to fruity mousses and easy no-bake treats.
            </p>
            <div className="seo-cta-wrapper">
              <Link to="/blog" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                Explore Our Recipes →
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
