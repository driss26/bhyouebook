import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export interface DessertSlide {
  id: string;
  name: string;
  shortLabel: string;
  category: string;
  macros: string;
  image: string;
  alt: string;
  description: string;
}

export const DESSERT_SLIDES: DessertSlide[] = [
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

const AUTOPLAY_INTERVAL_MS = 4000;

interface CinematicDessertShowcaseProps {
  onSlideClick?: (slide: DessertSlide) => void;
  className?: string;
}

export const CinematicDessertShowcase: React.FC<CinematicDessertShowcaseProps> = ({
  onSlideClick,
  className = ''
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % DESSERT_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + DESSERT_SLIDES.length) % DESSERT_SLIDES.length);
  }, []);

  const goToSlide = (idx: number) => {
    setActiveIndex(idx);
  };

  // Continuous automatic movement (pauses when user hovers to view/read)
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      nextSlide();
    }, AUTOPLAY_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isHovered, nextSlide]);

  // Keyboard navigation for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      prevSlide();
    }
  };

  // Mobile swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    setTouchStartX(null);
  };

  const currentSlide = DESSERT_SLIDES[activeIndex];

  return (
    <div 
      className={`hero-showcase-theater ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Automated Gourmet Dessert Showcase"
      tabIndex={0}
    >
      {/* Viewport for images */}
      <div className="hero-showcase-viewport">
        {DESSERT_SLIDES.map((slide, index) => {
          const isActive = index === activeIndex;
          return (
            <div 
              key={slide.id} 
              className={`hero-showcase-slide ${isActive ? 'active' : ''}`}
              aria-hidden={!isActive}
              onClick={() => onSlideClick && onSlideClick(slide)}
            >
              <img 
                src={slide.image} 
                alt={slide.alt}
                className="hero-showcase-img"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              <div className="hero-showcase-vignette" />
            </div>
          );
        })}

        {/* Top Badges Overlay */}
        <div className="hero-showcase-top-bar">
          <div className="hero-showcase-badge">
            <Sparkles size={13} className="sparkle-icon" />
            <span>BHYou Culinary Series • Under 220 Kcal</span>
          </div>
          <div className="hero-showcase-counter">
            <span>0{activeIndex + 1}</span>
            <span className="counter-sep">/</span>
            <span>0{DESSERT_SLIDES.length}</span>
          </div>
        </div>

        {/* Slide Caption Panel */}
        <div className="hero-showcase-caption">
          <div className="caption-tag-row">
            <span className="dessert-category-pill">{currentSlide.category}</span>
            <span className="dessert-macro-pill">{currentSlide.macros}</span>
          </div>
          <h3 className="hero-showcase-title">{currentSlide.name}</h3>
          <p className="hero-showcase-desc">{currentSlide.description}</p>
        </div>

        {/* Carousel Navigation Arrows */}
        <div className="hero-showcase-nav-arrows">
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); prevSlide(); }} 
            className="hero-nav-arrow-btn"
            aria-label="Previous recipe"
            title="Previous recipe"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); nextSlide(); }} 
            className="hero-nav-arrow-btn"
            aria-label="Next recipe"
            title="Next recipe"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Modern Slide Indicators (Dots) */}
        <div className="hero-showcase-dots">
          {DESSERT_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              className={`hero-dot ${idx === activeIndex ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); goToSlide(idx); }}
              aria-label={`Go to slide ${idx + 1}: ${slide.shortLabel}`}
              title={slide.shortLabel}
            />
          ))}
        </div>
      </div>

      {/* Quick-Select Recipe Tabs */}
      <div className="hero-showcase-tabs" role="tablist">
        {DESSERT_SLIDES.map((slide, idx) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            aria-selected={idx === activeIndex}
            className={`hero-tab-pill ${idx === activeIndex ? 'active' : ''}`}
            onClick={() => goToSlide(idx)}
          >
            <span className="tab-pill-dot" />
            <span className="tab-pill-text">{slide.shortLabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
