import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Calendar, User, Clock } from 'lucide-react';
import { db, firePageView } from '../db';
import type { BlogPost } from '../db';

interface BlogProps {
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const Blog: React.FC<BlogProps> = ({ onToast }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    firePageView('/blog');
    db.getPosts().then(setPosts);
  }, []);

  const handlePinterestPin = (post: BlogPost, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  // Filter posts based on status, category, and search query
  const filteredPosts = posts.filter((post) => {
    const isPublished = post.status === 'published';
    const matchesCategory =
      activeCategory === 'All' || post.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return isPublished && matchesCategory && matchesSearch;
  });

  const categories = ['All', 'Chicken Meals', 'Healthy Desserts', 'Meal Prep'];

  return (
    <div className="container" style={{ padding: '40px 16px' }}>
      {/* Blog Hero Header */}
      <section className="blog-header" style={{ textAlign: 'center', marginBottom: '56px' }}>
        <h1 style={{ fontSize: '42px', marginBottom: '16px' }}>Healthy Recipes Blog</h1>
        <p style={{ color: 'var(--text-muted-dark)', maxWidth: '600px', margin: '0 auto 32px' }}>
          Explore our collection of macro-friendly, high-protein recipes under 400 calories designed to help you burn fat and build muscle.
        </p>

        {/* Search and Category Filter controls */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '16px', 
          flexWrap: 'wrap' 
        }}>
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search recipes or tags..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`category-tab ${activeCategory === cat ? 'active-green' : ''}`}
                style={{
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  border: '1px solid var(--light-border)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: activeCategory === cat ? 'var(--primary)' : 'white',
                  color: activeCategory === cat ? 'white' : 'var(--text-dark)',
                  transition: 'all 0.2s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Post Grid */}
      {filteredPosts.length > 0 ? (
        <div className="blog-grid">
          {filteredPosts.map((post) => (
            <article className="blog-card" key={post.id}>
              <Link to={`/blog/${post.slug}`} className="blog-card-img-wrapper">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="blog-card-img"
                  loading="lazy"
                />
                <button
                  onClick={(e) => handlePinterestPin(post, e)}
                  className="pinterest-hover-btn"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.627 0-12 5.373-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.091.377-.293 1.194-.333 1.355-.053.211-.174.256-.402.15-1.498-.699-2.435-2.894-2.435-4.659 0-3.794 2.757-7.279 7.949-7.279 4.173 0 7.414 2.974 7.414 6.948 0 4.148-2.615 7.486-6.244 7.486-1.219 0-2.366-.633-2.757-1.379l-.752 2.864c-.272 1.045-.997 2.358-1.488 3.159 1.124.347 2.317.536 3.554.536 6.627 0 12-5.373 12-12s-5.373-12-12-12z" />
                  </svg>
                  Pin it
                </button>
              </Link>
              <div className="blog-card-body">
                <div className="blog-card-meta">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} />
                    {new Date(post.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} />
                    {post.readTime}
                  </span>
                </div>
                <h3 className="blog-card-title">
                  <Link to={`/blog/${post.slug}`} style={{ color: 'var(--text-dark)', textDecoration: 'none' }}>
                    {post.title}
                  </Link>
                </h3>
                <p className="blog-card-excerpt">{post.excerpt}</p>
                <div className="blog-card-footer">
                  <div className="blog-author">
                    <div className="blog-author-avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={16} style={{ color: 'var(--text-muted-dark)' }} />
                    </div>
                    <span className="blog-author-name">{post.author}</span>
                  </div>
                  <Link to={`/blog/${post.slug}`} className="blog-read-more" style={{ textDecoration: 'none' }}>
                    Read Post <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '64px 16px', color: 'var(--text-muted-dark)' }}>
          <h3>No recipes found matching your search.</h3>
          <button 
            className="btn btn-secondary" 
            style={{ marginTop: '16px' }}
            onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
