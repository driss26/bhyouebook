import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Clock, Send, Sparkles } from 'lucide-react';
import { db, firePageView, firePixel } from '../db';
import type { BlogPost as BlogPostType } from '../db';

interface BlogPostProps {
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const BlogPost: React.FC<BlogPostProps> = ({ onToast }) => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [recentPosts, setRecentPosts] = useState<BlogPostType[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [submittingNewsletter, setSubmittingNewsletter] = useState(false);

  useEffect(() => {
    if (!slug) return;
    db.getPosts().then((allPosts) => {
      const foundPost = allPosts.find((p) => p.slug === slug && p.status === 'published');
      
      if (foundPost) {
        setPost(foundPost);
        // Set recent/related posts (excluding current post)
        setRecentPosts(
          allPosts.filter((p) => p.id !== foundPost.id && p.status === 'published').slice(0, 3)
        );
        // Track page view (which triggers analytics & Meta Pixel view automatically)
        firePageView(`/blog/${slug}`);

        // Update HTML head metadata dynamically
        document.title = foundPost.seoTitle || `${foundPost.title} | BHYou`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', foundPost.metaDescription || foundPost.excerpt);
        }
      } else {
        // Post not found
        setPost(null);
      }
    }).catch(() => {
      setPost(null);
    });

    return () => {
      // Reset title to default when leaving
      document.title = '50 High-Protein Recipes Under 400 Calories';
    };
  }, [slug]);

  const handlePinterestPin = () => {
    if (!post) return;
    window.open(
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
        window.location.origin + '/#/blog/' + post.slug
      )}&media=${encodeURIComponent(post.pinterestImage)}&description=${encodeURIComponent(
        post.excerpt
      )}`,
      '_blank'
    );
    onToast('Redirecting to Pinterest...', 'info');
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    setSubmittingNewsletter(true);
    setTimeout(() => {
      db.saveLead(newsletterEmail, `blog_newsletter_${post?.slug || 'post'}`);
      setNewsletterEmail('');
      setSubmittingNewsletter(false);
      onToast('Successfully subscribed to our recipe newsletter!', 'success');
      firePixel('Meta Pixel', 'Lead', { source: `blog_newsletter_${post?.slug || 'post'}` });
    }, 800);
  };

  if (!post) {
    return (
      <div className="container" style={{ padding: '80px 16px', textAlign: 'center' }}>
        <h2>Recipe Post Not Found</h2>
        <p style={{ color: 'var(--text-muted-dark)', margin: '16px 0 32px' }}>
          The recipe post you are looking for does not exist or has been archived.
        </p>
        <Link to="/blog" className="btn btn-primary">
          Back to Recipes Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '0 16px' }}>
      <div className="post-layout">
        {/* Main Content Column */}
        <div>
          <nav className="post-breadcrumbs">
            <Link to="/" style={{ color: 'var(--text-muted-dark)', textDecoration: 'none' }}>Home</Link>
            <span>&gt;</span>
            <Link to="/blog" style={{ color: 'var(--text-muted-dark)', textDecoration: 'none' }}>Blog</Link>
            <span>&gt;</span>
            <span style={{ color: 'var(--text-dark)' }}>{post.title}</span>
          </nav>

          <header className="post-header">
            <Link to="/blog" style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              textDecoration: 'none', 
              color: 'var(--primary)', 
              fontSize: '14px', 
              fontWeight: 600,
              marginBottom: '16px'
            }}>
              <ArrowLeft size={16} /> Back to recipes
            </Link>
            <h1 style={{ lineHeight: '1.2', marginBottom: '16px' }}>{post.title}</h1>
            
            <div className="post-meta-details">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={15} />
                By {post.author}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={15} />
                {new Date(post.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={15} />
                {post.readTime}
              </span>
              <span style={{ 
                backgroundColor: 'var(--primary-glow)', 
                color: 'var(--primary)', 
                padding: '2px 10px', 
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 600
              }}>
                {post.category}
              </span>
            </div>
          </header>

          {/* Featured Image */}
          <div className="post-featured-image-wrapper">
            <img src={post.featuredImage} alt={post.title} className="post-featured-image" />
          </div>

          {/* Post Content Body */}
          <article 
            className="post-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Pinterest Save Banner */}
          <div className="post-pinterest-banner">
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>Pin this recipe on Pinterest!</h3>
              <p style={{ color: 'var(--text-muted-dark)', fontSize: '14px', margin: 0 }}>
                Save this post to your favorite fitness or recipe board for later.
              </p>
            </div>
            <button onClick={handlePinterestPin} className="pinterest-save-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.627 0-12 5.373-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.091.377-.293 1.194-.333 1.355-.053.211-.174.256-.402.15-1.498-.699-2.435-2.894-2.435-4.659 0-3.794 2.757-7.279 7.949-7.279 4.173 0 7.414 2.974 7.414 6.948 0 4.148-2.615 7.486-6.244 7.486-1.219 0-2.366-.633-2.757-1.379l-.752 2.864c-.272 1.045-.997 2.358-1.488 3.159 1.124.347 2.317.536 3.554.536 6.627 0 12-5.373 12-12s-5.373-12-12-12z" />
              </svg>
              Save Recipe
            </button>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="post-tags">
              <span style={{ fontWeight: 600, marginRight: '8px' }}>Tags:</span>
              {post.tags.map((tag) => (
                <span 
                  key={tag}
                  style={{ 
                    backgroundColor: 'var(--light-surface)', 
                    border: '1px solid var(--light-border)',
                    padding: '4px 12px', 
                    borderRadius: '4px',
                    fontSize: '13px',
                    color: 'var(--text-muted-dark)'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* FAQ Accordion Section */}
          {post.faqSchema && post.faqSchema.length > 0 && (
            <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--light-border)' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Frequently Asked Questions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {post.faqSchema.map((faq, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      backgroundColor: 'var(--light-surface)', 
                      padding: '20px', 
                      borderRadius: '8px', 
                      border: '1px solid var(--light-border)' 
                    }}
                  >
                    <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-dark)' }}>
                      Q: {faq.question}
                    </h4>
                    <p style={{ color: 'var(--text-muted-dark)', fontSize: '15px', margin: 0, lineHeight: '1.5' }}>
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="sidebar">
          {/* Ebook Purchase Widget */}
          <div className="sidebar-widget widget-cta-box" style={{ padding: '32px 24px' }}>
            <Sparkles size={28} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Get the Ultimate Cookbook</h3>
            <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
              Want 50+ high-protein, calorie-friendly meals designed to accelerate your fat loss? Get the full cookbook now!
            </p>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', marginBottom: '20px' }}>
              Only $11.99
            </div>
            <Link to="/cookbook" className="btn btn-primary" style={{ width: '100%', textDecoration: 'none', display: 'block' }}>
              Buy the Cookbook
            </Link>
          </div>

          {/* Newsletter Subscribe Widget */}
          <div className="sidebar-widget">
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Free Weekly Recipes</h3>
            <p style={{ color: 'var(--text-muted-dark)', fontSize: '13px', lineHeight: '1.5', marginBottom: '20px' }}>
              Get our latest macro-friendly recipes, high-protein cooking hacks, and meal prep tips sent straight to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  border: '1px solid var(--light-border)',
                  fontSize: '14px',
                  marginBottom: '12px',
                  boxSizing: 'border-box'
                }}
              />
              <button 
                type="submit" 
                className="btn btn-dark" 
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                disabled={submittingNewsletter}
              >
                {submittingNewsletter ? 'Subscribing...' : 'Subscribe'} <Send size={14} />
              </button>
            </form>
          </div>

          {/* Recent Recipes Widget */}
          {recentPosts.length > 0 && (
            <div className="sidebar-widget">
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>More Healthy Recipes</h3>
              <ul className="widget-recipe-list">
                {recentPosts.map((rPost) => (
                  <li key={rPost.id}>
                    <Link to={`/blog/${rPost.slug}`} style={{ display: 'flex', gap: '12px', textDecoration: 'none', color: 'inherit' }} className="widget-recipe-item">
                      <img src={rPost.featuredImage} alt={rPost.title} className="widget-recipe-img" />
                      <div className="widget-recipe-info">
                        <h4 style={{ transition: 'color 0.2s', margin: 0 }}>{rPost.title}</h4>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                          <Clock size={11} /> {rPost.readTime}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
