import React, { useEffect, useState } from 'react';
import { 
  Settings, FileText, BarChart2, Mail, Plus, Edit, Trash2, 
  Save, RefreshCw, Code, Lock, Megaphone, Image, Copy, UploadCloud, ExternalLink, Check
} from 'lucide-react';
import { firePageView, db } from '../db';
import { supabase } from '../supabaseClient';
import type { BlogPost, PageSeo, Lead, ContactMessage, TrackingSettings, AnnouncementSettings, MediaItem } from '../db';

const hasSupabase = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

interface AdminDashboardProps {
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onToast }) => {
  useEffect(() => {
    firePageView('/admin');
    const authStatus = sessionStorage.getItem('bhyou_admin_authorized');
    if (authStatus === 'true') {
      setIsAuthorized(true);
    }
  }, []);

  const [activeTab, setActiveTab] = useState<'blog' | 'announcement' | 'media' | 'seo' | 'leads' | 'analytics'>('blog');
  
  // States for Database values
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [seoConfigs, setSeoConfigs] = useState<PageSeo[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [tracking, setTracking] = useState<TrackingSettings>({} as TrackingSettings);
  const [robotsTxt, setRobotsTxt] = useState('');
  const [pixelLogs, setPixelLogs] = useState<any[]>([]);

  // Announcement Bar & Media Gallery states
  const [announcementSettings, setAnnouncementSettings] = useState<AnnouncementSettings>({
    enabled: true,
    text: '',
    bgGradientStart: '#064e3b',
    bgGradientEnd: '#10b981',
    textColor: '#ecfdf5',
  });
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [copiedMediaId, setCopiedMediaId] = useState<string | null>(null);

  // Authorization States
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Post Editor State
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [faqInput, setFaqInput] = useState({ question: '', answer: '' });

  // Uploading States
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [uploadingPinterest, setUploadingPinterest] = useState(false);
  const [uploadingOg, setUploadingOg] = useState(false);

  // Cloudinary Uploader Helper
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dkaob9dmk';
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || 'Cloudinary upload failed');
    }
    
    const data = await response.json();
    return data.secure_url;
  };

  // SEO Page Editor State
  const [editingSeo, setEditingSeo] = useState<PageSeo | null>(null);

  // XML Sitemap Preview State
  const [sitemapXml, setSitemapXml] = useState('');

  // Reload data from DB helper
  const reloadData = async () => {
    try {
      const [allPosts, allSeo, allLeads, allMessages, allTracking, allRobots, announcement, media] = await Promise.all([
        db.getPosts(),
        db.getSeoConfigs(),
        db.getLeads(),
        db.getMessages(),
        db.getTrackingSettings(),
        db.getRobotsTxt(),
        db.getAnnouncementSettings(),
        db.getMediaItems()
      ]);
      setPosts(allPosts);
      setSeoConfigs(allSeo);
      setLeads(allLeads);
      setMessages(allMessages);
      setTracking(allTracking);
      setRobotsTxt(allRobots);
      if (announcement) setAnnouncementSettings(announcement);
      if (media) setMediaItems(media);
    } catch (err) {
      console.error(err);
      onToast('Error loading database data', 'error');
    }
    
    // Read session storage logs
    const logs = JSON.parse(sessionStorage.getItem('bhyou_pixel_logs') || '[]');
    setPixelLogs(logs);
  };

  useEffect(() => {
    reloadData();

    // Listen to pixel fires to update console log
    const handlePixelFire = () => {
      const logs = JSON.parse(sessionStorage.getItem('bhyou_pixel_logs') || '[]');
      setPixelLogs(logs);
    };

    window.addEventListener('pixel_fired', handlePixelFire);
    return () => window.removeEventListener('pixel_fired', handlePixelFire);
  }, []);

  // Sitemap generator helper
  const generateSitemap = () => {
    const pages = [
      { url: 'https://bhyou.com/', priority: '1.0' },
      { url: 'https://bhyou.com/cookbook', priority: '0.9' },
      { url: 'https://bhyou.com/dessert-cookbook', priority: '0.9' },
    ];

    posts.forEach(p => {
      if (p.status === 'published') {
        pages.push({ url: `https://bhyou.com/blog/${p.slug}`, priority: '0.7' });
      }
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${p.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    setSitemapXml(xml);
    onToast('Sitemap.xml generated successfully!', 'success');
  };

  // Blog Editor Save
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    await db.savePost(editingPost);
    onToast('Blog post saved successfully!', 'success');
    setEditingPost(null);
    setIsCreatingPost(false);
    reloadData();
  };

  const handleCreatePostInit = () => {
    const newPost: BlogPost = {
      id: 'post-' + Date.now(),
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featuredImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
      pinterestImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=900&q=80',
      category: 'High Protein Recipes',
      tags: [],
      status: 'draft',
      seoTitle: '',
      metaDescription: '',
      focusKeyword: '',
      seoScore: 0,
      canonicalUrl: '',
      faqSchema: [],
      createdAt: new Date().toISOString(),
      author: 'BHYou',
      readTime: '4 min read'
    };
    setEditingPost(newPost);
    setIsCreatingPost(true);
  };

  const handleDeletePost = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      await db.deletePost(id);
      onToast('Post deleted successfully!', 'success');
      reloadData();
    }
  };

  // SEO Editor Save
  const handleSaveSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSeo) return;

    await db.saveSeoConfig(editingSeo);
    onToast(`SEO configuration updated for ${editingSeo.pageName}!`, 'success');
    setEditingSeo(null);
    reloadData();
  };

  // Robots Save
  const handleSaveRobots = async () => {
    await db.saveRobotsTxt(robotsTxt);
    onToast('Robots.txt file content updated!', 'success');
  };

  // Analytics Settings Save
  const handleSaveTracking = async () => {
    await db.saveTrackingSettings(tracking);
    onToast('Analytics integration codes updated!', 'success');
    reloadData();
  };

  // Announcement Save
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.saveAnnouncementSettings(announcementSettings);
      window.dispatchEvent(new CustomEvent('announcement_updated'));
      onToast('Announcement bar settings saved successfully!', 'success');
      reloadData();
    } catch (err) {
      console.error(err);
      onToast('Error saving announcement settings', 'error');
    }
  };

  // Media Management Handlers
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploadingMedia(true);
    let successCount = 0;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const url = await uploadToCloudinary(file);
        const newItem: MediaItem = {
          id: 'media-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          url,
          fileName: file.name,
          createdAt: new Date().toISOString()
        };
        await db.saveMediaItem(newItem);
        successCount++;
      } catch (err: any) {
        console.error(err);
        onToast(`Failed to upload ${file.name}: ${err.message}`, 'error');
      }
    }
    
    if (successCount > 0) {
      onToast(`Successfully uploaded ${successCount} image(s)!`, 'success');
      reloadData();
    }
    setUploadingMedia(false);
  };

  const handleDeleteMedia = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await db.deleteMediaItem(id);
        onToast('Image deleted successfully!', 'success');
        reloadData();
      } catch (err) {
        console.error(err);
        onToast('Error deleting image', 'error');
      }
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedMediaId(id);
    onToast('URL copied to clipboard!', 'success');
    setTimeout(() => setCopiedMediaId(null), 2000);
  };

  const handlePixelToggle = async (key: keyof TrackingSettings) => {
    const updated = { ...tracking, [key]: !tracking[key] } as TrackingSettings;
    setTracking(updated);
    await db.saveTrackingSettings(updated);
    onToast('Pixel integration toggled!', 'info');
  };

  const handlePixelIdChange = (key: keyof TrackingSettings, val: string) => {
    setTracking({ ...tracking, [key]: val });
  };

  const clearPixelLogs = () => {
    sessionStorage.setItem('bhyou_pixel_logs', JSON.stringify([]));
    setPixelLogs([]);
    onToast('Pixel logs cleared', 'info');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
    setLoginError(false);
    
    try {
      // Call the PostgreSQL function via RPC to check the password securely
      const { data, error } = await supabase
        .rpc('verify_admin_password', { input_password: passwordInput });
        
      if (error) throw error;
      
      if (data === true) {
        setIsAuthorized(true);
        sessionStorage.setItem('bhyou_admin_authorized', 'true');
        onToast('Login successful!', 'success');
      } else {
        setLoginError(true);
        onToast('Incorrect password!', 'error');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (!hasSupabase && passwordInput === '4867') {
        setIsAuthorized(true);
        sessionStorage.setItem('bhyou_admin_authorized', 'true');
        onToast('Login successful (local fallback)!', 'success');
      } else {
        setLoginError(true);
        onToast('Connection error or invalid password!', 'error');
      }
    } finally {
      setIsChecking(false);
    }
  };

  // FAQ Schema Append Helper
  const addFaqToPost = () => {
    if (!faqInput.question || !faqInput.answer || !editingPost) return;
    const updatedFaq = [...(editingPost.faqSchema || []), faqInput];
    setEditingPost({ ...editingPost, faqSchema: updatedFaq });
    setFaqInput({ question: '', answer: '' });
  };

  const removeFaqFromPost = (idx: number) => {
    if (!editingPost) return;
    const filteredFaq = editingPost.faqSchema.filter((_, i) => i !== idx);
    setEditingPost({ ...editingPost, faqSchema: filteredFaq });
  };

  // Automated Suggestion generator for slug
  const updateSlugFromTitle = (title: string) => {
    if (!editingPost) return;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setEditingPost({
      ...editingPost,
      title,
      slug,
      seoTitle: title + ' | BHYou',
      canonicalUrl: `https://bhyou.com/blog/${slug}`
    });
  };

  if (!isAuthorized) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 50%, #141416 0%, #0a0a0c 100%)',
        padding: '24px'
      }}>
        <div style={{
          backgroundColor: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '400px',
          padding: '40px 32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          textAlign: 'center',
          fontFamily: 'var(--font-sans)'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <Lock size={28} />
          </div>
          
          <h2 style={{ color: 'white', fontSize: '24px', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>BHYou Admin Login</h2>
          <p style={{ color: 'var(--text-muted-light)', fontSize: '14px', marginBottom: '32px' }}>
            Enter your secure credentials to access the SEO & blog management panel.
          </p>
          
          <form onSubmit={handleLoginSubmit}>
            <div className="admin-form-group" style={{ marginBottom: '24px', textAlign: 'left' }}>
              <label style={{ color: 'var(--text-muted-light)', display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Enter Admin Password</label>
              <input 
                type="password" 
                required 
                placeholder="••••"
                className="admin-form-input"
                style={{ 
                  backgroundColor: '#09090b',
                  borderColor: loginError ? 'var(--danger)' : '#27272a',
                  color: 'white',
                  fontSize: '18px',
                  textAlign: 'center',
                  letterSpacing: '8px'
                }}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
              {loginError && (
                <span style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '8px', display: 'block', textAlign: 'center' }}>
                  Incorrect password. Please try again.
                </span>
              )}
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              disabled={isChecking}
            >
              {isChecking ? 'Checking...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Sidebar Panel */}
      <aside className="admin-sidebar">
        <div>
          <h3 style={{ color: 'white', marginBottom: '24px', paddingLeft: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={20} style={{ color: 'var(--primary)' }} />
            BHYou Admin
          </h3>
          <ul className="admin-menu">
            <li>
              <button 
                onClick={() => { setActiveTab('blog'); setEditingPost(null); setIsCreatingPost(false); }} 
                className={`admin-menu-item-btn ${activeTab === 'blog' ? 'active' : ''}`}
              >
                <FileText size={16} /> Blog Post Editor
              </button>
            </li>
            <li>
              <button 
                onClick={() => { setActiveTab('announcement'); }} 
                className={`admin-menu-item-btn ${activeTab === 'announcement' ? 'active' : ''}`}
              >
                <Megaphone size={16} /> Announcement Bar
              </button>
            </li>
            <li>
              <button 
                onClick={() => { setActiveTab('media'); }} 
                className={`admin-menu-item-btn ${activeTab === 'media' ? 'active' : ''}`}
              >
                <Image size={16} /> Media Library
              </button>
            </li>
            <li>
              <button 
                onClick={() => { setActiveTab('seo'); setEditingSeo(null); }} 
                className={`admin-menu-item-btn ${activeTab === 'seo' ? 'active' : ''}`}
              >
                <Code size={16} /> SEO & Sitemap
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('leads')} 
                className={`admin-menu-item-btn ${activeTab === 'leads' ? 'active' : ''}`}
              >
                <Mail size={16} /> Leads & Messages
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('analytics')} 
                className={`admin-menu-item-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              >
                <BarChart2 size={16} /> Analytics & Pixels
              </button>
            </li>
          </ul>
        </div>
        
        <div style={{ padding: '0 16px', fontSize: '12px', color: 'var(--text-muted-light)' }}>
          <p>Logged in as: <strong>BHYou</strong></p>
          <p style={{ marginTop: '4px' }}>System Version 2026.1</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-content">

        {/* --- ANNOUNCEMENT TAB --- */}
        {activeTab === 'announcement' && (
          <div>
            <div className="admin-header">
              <h1>Announcement Bar Manager</h1>
            </div>

            <div className="grid-2col">
              {/* Settings Form */}
              <div className="admin-card">
                <h2>Banner Settings</h2>
                <form onSubmit={handleSaveAnnouncement}>
                  <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <label className="switch-toggle" style={{ margin: 0 }}>
                      <input 
                        type="checkbox" 
                        checked={announcementSettings.enabled}
                        onChange={(e) => setAnnouncementSettings({ ...announcementSettings, enabled: e.target.checked })}
                      />
                      <span className="slider-round"></span>
                    </label>
                    <div>
                      <strong style={{ fontSize: '14px', color: 'white', display: 'block' }}>Enable Announcement Bar</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted-light)' }}>Toggle visibility on the main website</span>
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>Bar Text Content</label>
                    <textarea 
                      required 
                      className="admin-form-textarea"
                      placeholder="Enter marquee announcement text..."
                      style={{ minHeight: '80px' }}
                      value={announcementSettings.text}
                      onChange={(e) => setAnnouncementSettings({ ...announcementSettings, text: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label>Gradient Start</label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input 
                          type="color" 
                          className="admin-form-color-picker"
                          style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
                          value={announcementSettings.bgGradientStart}
                          onChange={(e) => setAnnouncementSettings({ ...announcementSettings, bgGradientStart: e.target.value })}
                        />
                        <input 
                          type="text" 
                          className="admin-form-input" 
                          style={{ fontSize: '12px', padding: '6px', height: '40px', backgroundColor: '#09090b', color: 'white', border: '1px solid #27272a' }}
                          value={announcementSettings.bgGradientStart}
                          onChange={(e) => setAnnouncementSettings({ ...announcementSettings, bgGradientStart: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label>Gradient End</label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input 
                          type="color" 
                          className="admin-form-color-picker"
                          style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
                          value={announcementSettings.bgGradientEnd}
                          onChange={(e) => setAnnouncementSettings({ ...announcementSettings, bgGradientEnd: e.target.value })}
                        />
                        <input 
                          type="text" 
                          className="admin-form-input" 
                          style={{ fontSize: '12px', padding: '6px', height: '40px', backgroundColor: '#09090b', color: 'white', border: '1px solid #27272a' }}
                          value={announcementSettings.bgGradientEnd}
                          onChange={(e) => setAnnouncementSettings({ ...announcementSettings, bgGradientEnd: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label>Text Color</label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input 
                          type="color" 
                          className="admin-form-color-picker"
                          style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
                          value={announcementSettings.textColor}
                          onChange={(e) => setAnnouncementSettings({ ...announcementSettings, textColor: e.target.value })}
                        />
                        <input 
                          type="text" 
                          className="admin-form-input" 
                          style={{ fontSize: '12px', padding: '6px', height: '40px', backgroundColor: '#09090b', color: 'white', border: '1px solid #27272a' }}
                          value={announcementSettings.textColor}
                          onChange={(e) => setAnnouncementSettings({ ...announcementSettings, textColor: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Save size={16} /> Save Settings
                  </button>
                </form>
              </div>

              {/* Preview Card */}
              <div className="admin-card">
                <h2>Real-Time Banner Preview</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted-light)', marginBottom: '20px' }}>
                  This is how the announcement bar will render at the top of all pages:
                </p>

                {announcementSettings.enabled ? (
                  <div 
                    style={{
                      background: `linear-gradient(90deg, ${announcementSettings.bgGradientStart} 0%, ${announcementSettings.bgGradientEnd} 50%, ${announcementSettings.bgGradientStart} 100%)`,
                      color: announcementSettings.textColor,
                      padding: '12px 20px',
                      borderRadius: '8px',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px',
                      fontWeight: 600,
                      textAlign: 'center',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      boxShadow: 'var(--shadow-md)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <span>{announcementSettings.text || '[Enter announcement text to preview]'}</span>
                  </div>
                ) : (
                  <div style={{
                    padding: '24px',
                    borderRadius: '8px',
                    backgroundColor: '#09090b',
                    color: 'var(--text-muted-light)',
                    textAlign: 'center',
                    border: '1px dashed #27272a',
                    fontSize: '14px'
                  }}>
                    Announcement bar is currently disabled.
                  </div>
                )}
                
                <div style={{ marginTop: '24px', backgroundColor: '#1f1f23', border: '1px solid #2d2d30', padding: '16px', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted-light)' }}>
                  <h4 style={{ color: 'white', marginBottom: '8px', fontWeight: 600 }}>Design Tip</h4>
                  <p style={{ lineHeight: '1.5' }}>
                    Use a high-contrast text color on top of a dark or vibrant gradient (e.g. emerald green starting at #064e3b and ending at #10b981) to grab attention. Keep the text concise to avoid wrapping on mobile screens.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- MEDIA GALLERY TAB --- */}
        {activeTab === 'media' && (
          <div>
            <div className="admin-header">
              <h1>Media Library & Uploads</h1>
              <label 
                className="btn btn-primary btn-sm" 
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', margin: 0 }}
              >
                {uploadingMedia ? <RefreshCw style={{ animation: 'spin 1s linear infinite' }} size={16} /> : <UploadCloud size={16} />}
                {uploadingMedia ? 'Uploading...' : 'Upload Images'}
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  disabled={uploadingMedia}
                  onChange={handleMediaUpload}
                />
              </label>
            </div>

            <div className="admin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2>All Uploaded Media ({mediaItems.length})</h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted-light)', marginTop: '4px' }}>
                    Upload images to Cloudinary here to use them when writing your blogs or ebooks. Click 'Copy URL' to paste the link into the editor.
                  </p>
                </div>
              </div>

              {mediaItems.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                  {mediaItems.map((item) => (
                    <div 
                      key={item.id} 
                      style={{ 
                        backgroundColor: '#1f1f23', 
                        border: '1px solid #2d2d30', 
                        borderRadius: '12px', 
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                      className="media-card-hover"
                    >
                      {/* Image Preview */}
                      <div style={{ position: 'relative', width: '100%', paddingBottom: '75%', overflow: 'hidden', backgroundColor: '#09090b' }}>
                        <img 
                          src={item.url} 
                          alt={item.fileName} 
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      {/* Details & Action Panel */}
                      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.fileName}>
                          {item.fileName}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted-light)' }}>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                        
                        <div style={{ marginTop: 'auto', display: 'flex', gap: '6px', paddingTop: '8px', borderTop: '1px solid #2d2d30' }}>
                          <button 
                            type="button"
                            onClick={() => handleCopyUrl(item.url, item.id)} 
                            className="btn btn-dark btn-sm" 
                            style={{ flexGrow: 1, height: '32px', padding: 0, fontSize: '11px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}
                            title="Copy image link for blogs/ebooks"
                          >
                            {copiedMediaId === item.id ? <Check size={12} style={{ color: 'var(--primary)' }} /> : <Copy size={12} />}
                            {copiedMediaId === item.id ? 'Copied!' : 'Copy URL'}
                          </button>

                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-secondary btn-sm"
                            style={{ width: '32px', height: '32px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', borderColor: '#2d2d30', color: 'var(--text-muted-light)' }}
                            title="Open original image"
                          >
                            <ExternalLink size={12} />
                          </a>

                          <button 
                            type="button"
                            onClick={() => handleDeleteMedia(item.id)} 
                            className="btn btn-secondary btn-sm"
                            style={{ width: '32px', height: '32px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', borderColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}
                            title="Delete image"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', border: '2px dashed #2d2d30', borderRadius: '12px', color: 'var(--text-muted-light)' }}>
                  <Image size={48} style={{ color: '#2d2d30', marginBottom: '16px' }} />
                  <h3>No media uploaded yet</h3>
                  <p style={{ fontSize: '13px', maxWidth: '360px', margin: '8px auto 20px' }}>
                    Click the "Upload Images" button at the top right to upload photos to Cloudinary.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- BLOG TABS --- */}
        {activeTab === 'blog' && (
          <div>
            <div className="admin-header">
              <h1>Blog Management</h1>
              {!editingPost && (
                <button onClick={handleCreatePostInit} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={16} /> Create New Post
                </button>
              )}
            </div>

            {/* Post editor panel */}
            {editingPost ? (
              <div className="admin-card">
                <h2>{isCreatingPost ? 'Create New Blog Post' : `Edit Post: ${editingPost.title}`}</h2>
                <form onSubmit={handleSavePost}>
                  <div className="grid-2col">
                    <div className="admin-form-group">
                      <label>Post Title</label>
                      <input 
                        type="text" 
                        required 
                        className="admin-form-input"
                        value={editingPost.title}
                        onChange={(e) => updateSlugFromTitle(e.target.value)}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>URL Slug</label>
                      <input 
                        type="text" 
                        required 
                        className="admin-form-input"
                        value={editingPost.slug}
                        onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid-2col">
                    <div className="admin-form-group">
                      <label>Category</label>
                      <select 
                        className="admin-form-select"
                        value={editingPost.category}
                        onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                      >
                        <option value="High Protein Recipes">High Protein Recipes</option>
                        <option value="Healthy Desserts">Healthy Desserts</option>
                        <option value="Chicken Meals">Chicken Meals</option>
                        <option value="Weight Loss Recipes">Weight Loss Recipes</option>
                        <option value="Meal Prep">Meal Prep</option>
                        <option value="Under 400 Calories">Under 400 Calories</option>
                      </select>
                    </div>
                    
                    <div className="admin-form-group">
                      <label>Status</label>
                      <select 
                        className="admin-form-select"
                        value={editingPost.status}
                        onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value as any })}
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="scheduled">Scheduled</option>
                      </select>
                    </div>
                  </div>

                  {editingPost.status === 'scheduled' && (
                    <div className="admin-form-group">
                      <label>Scheduled Publish Date & Time</label>
                      <input 
                        type="datetime-local" 
                        className="admin-form-input"
                        value={editingPost.scheduledDate || ''}
                        onChange={(e) => setEditingPost({ ...editingPost, scheduledDate: e.target.value })}
                        required
                      />
                    </div>
                  )}

                  <div className="admin-form-group">
                    <label>Short Excerpt (shows in grid)</label>
                    <textarea 
                      required 
                      className="admin-form-textarea"
                      value={editingPost.excerpt}
                      onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Main Content (HTML Support)</label>
                    <textarea 
                      required 
                      className="admin-form-textarea"
                      style={{ minHeight: '250px', fontFamily: 'monospace' }}
                      value={editingPost.content}
                      onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                    />
                  </div>

                  <div className="grid-2col">
                    <div className="admin-form-group">
                      <label>Featured Image URL (landscape)</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          type="text" 
                          className="admin-form-input"
                          value={editingPost.featuredImage}
                          onChange={(e) => setEditingPost({ ...editingPost, featuredImage: e.target.value })}
                        />
                        <label className="btn btn-dark btn-sm" style={{ margin: 0, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                          {uploadingFeatured ? 'Uploading...' : 'Upload File'}
                          <input 
                            type="file" 
                            accept="image/*"
                            style={{ display: 'none' }}
                            disabled={uploadingFeatured}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setUploadingFeatured(true);
                              try {
                                const url = await uploadToCloudinary(file);
                                setEditingPost({ ...editingPost, featuredImage: url });
                                onToast('Featured image uploaded to Cloudinary!', 'success');
                              } catch (err: any) {
                                console.error(err);
                                onToast(`Upload failed: ${err.message}`, 'error');
                              } finally {
                                setUploadingFeatured(false);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                    
                    <div className="admin-form-group">
                      <label>Pinterest Image URL (portrait 2:3)</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          type="text" 
                          className="admin-form-input"
                          value={editingPost.pinterestImage}
                          onChange={(e) => setEditingPost({ ...editingPost, pinterestImage: e.target.value })}
                        />
                        <label className="btn btn-dark btn-sm" style={{ margin: 0, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                          {uploadingPinterest ? 'Uploading...' : 'Upload File'}
                          <input 
                            type="file" 
                            accept="image/*"
                            style={{ display: 'none' }}
                            disabled={uploadingPinterest}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setUploadingPinterest(true);
                              try {
                                const url = await uploadToCloudinary(file);
                                setEditingPost({ ...editingPost, pinterestImage: url });
                                onToast('Pinterest image uploaded to Cloudinary!', 'success');
                              } catch (err: any) {
                                console.error(err);
                                onToast(`Upload failed: ${err.message}`, 'error');
                              } finally {
                                setUploadingPinterest(false);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* SEO Configuration Sub-Section */}
                  <div style={{ backgroundColor: 'var(--light-surface)', padding: '24px', borderRadius: '8px', margin: '24px 0', border: '1px solid var(--light-border)' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--primary)' }}>Post SEO optimization</h3>
                    
                    <div className="grid-2col">
                      <div className="admin-form-group">
                        <label>SEO Meta Title</label>
                        <input 
                          type="text" 
                          className="admin-form-input"
                          value={editingPost.seoTitle}
                          onChange={(e) => setEditingPost({ ...editingPost, seoTitle: e.target.value })}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Focus Keyword</label>
                        <input 
                          type="text" 
                          placeholder="e.g. healthy desserts"
                          className="admin-form-input"
                          value={editingPost.focusKeyword}
                          onChange={(e) => setEditingPost({ ...editingPost, focusKeyword: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="admin-form-group">
                      <label>SEO Meta Description</label>
                      <textarea 
                        className="admin-form-textarea"
                        style={{ minHeight: '80px' }}
                        value={editingPost.metaDescription}
                        onChange={(e) => setEditingPost({ ...editingPost, metaDescription: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Canonical URL</label>
                      <input 
                        type="text" 
                        className="admin-form-input"
                        value={editingPost.canonicalUrl}
                        onChange={(e) => setEditingPost({ ...editingPost, canonicalUrl: e.target.value })}
                      />
                    </div>

                    {/* FAQ Schema settings */}
                    <div style={{ marginTop: '20px', borderTop: '1px solid var(--light-border)', paddingTop: '16px' }}>
                      <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Recipe / Post FAQ Schema (JSON-LD)</label>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                        {(editingPost.faqSchema || []).map((faq, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '8px 12px', borderRadius: '4px', fontSize: '13px', border: '1px solid var(--light-border)' }}>
                            <div>
                              <strong>Q: {faq.question}</strong><br/>
                              <span style={{ color: 'var(--text-muted-dark)' }}>A: {faq.answer}</span>
                            </div>
                            <button type="button" onClick={() => removeFaqFromPost(i)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                        <div>
                          <label style={{ fontSize: '11px' }}>FAQ Question</label>
                          <input 
                            type="text" 
                            placeholder="Is this keto?" 
                            className="admin-form-input"
                            value={faqInput.question}
                            onChange={(e) => setFaqInput({ ...faqInput, question: e.target.value })}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px' }}>FAQ Answer</label>
                          <input 
                            type="text" 
                            placeholder="Yes, it fits macro counts." 
                            className="admin-form-input"
                            value={faqInput.answer}
                            onChange={(e) => setFaqInput({ ...faqInput, answer: e.target.value })}
                          />
                        </div>
                        <button type="button" onClick={addFaqToPost} className="btn btn-dark btn-sm" style={{ height: '45px' }}>
                          Add FAQ
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => { setEditingPost(null); setIsCreatingPost(false); }} className="btn btn-secondary btn-sm">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Save size={16} /> Save Post
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Post List table */
              <div className="admin-card">
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>SEO Score</th>
                        <th>Created Date</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.map(post => (
                        <tr key={post.id}>
                          <td style={{ fontWeight: 600 }}>{post.title}</td>
                          <td>{post.category}</td>
                          <td>
                            <span className={`status-badge ${post.status}`}>
                              {post.status}
                            </span>
                            {post.status === 'scheduled' && post.scheduledDate && (
                              <div style={{ fontSize: '9px', color: 'var(--text-muted-dark)', marginTop: '4px' }}>
                                {new Date(post.scheduledDate).toLocaleString()}
                              </div>
                            )}
                          </td>
                          <td>
                            <span style={{ 
                              fontWeight: 700,
                              color: post.seoScore >= 90 ? 'var(--success)' : post.seoScore >= 80 ? 'var(--warning)' : 'var(--danger)'
                            }}>
                              {post.seoScore}/100
                            </span>
                          </td>
                          <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button 
                                onClick={() => setEditingPost(post)} 
                                className="btn btn-secondary btn-sm" 
                                style={{ padding: '6px 10px', height: 'auto' }}
                                title="Edit Post"
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeletePost(post.id)} 
                                className="btn btn-secondary btn-sm" 
                                style={{ padding: '6px 10px', height: 'auto', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                                title="Delete Post"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- SEO AND SITEMAP TABS --- */}
        {activeTab === 'seo' && (
          <div>
            <div className="admin-header">
              <h1>SEO Configuration & Sitemap</h1>
            </div>

            {editingSeo ? (
              <div className="admin-card">
                <h2>Edit Page SEO: {editingSeo.pageName}</h2>
                
                <div className="seo-score-meter">
                  <div className={`seo-score-circle ${editingSeo.seoScore >= 90 ? 'success' : editingSeo.seoScore >= 80 ? 'warning' : 'danger'}`}>
                    {editingSeo.seoScore}
                  </div>
                  <div className="seo-score-info">
                    <h4>Dynamic SEO Score Analysis</h4>
                    <p>Calculated based on search best practices: Meta title lengths (40-60 chars) and meta description richness (120-160 chars).</p>
                  </div>
                </div>

                <form onSubmit={handleSaveSeo}>
                  <div className="grid-2col">
                    <div className="admin-form-group">
                      <label>SEO Meta Title</label>
                      <input 
                        type="text" 
                        required 
                        className="admin-form-input"
                        value={editingSeo.seoTitle}
                        onChange={(e) => setEditingSeo({ ...editingSeo, seoTitle: e.target.value })}
                      />
                      <span style={{ fontSize: '11px', color: editingSeo.seoTitle.length >= 40 && editingSeo.seoTitle.length <= 60 ? 'var(--success)' : 'var(--text-muted-dark)' }}>
                        Length: {editingSeo.seoTitle.length} characters (Optimal: 40-60)
                      </span>
                    </div>

                    <div className="admin-form-group">
                      <label>Focus Keyword</label>
                      <input 
                        type="text" 
                        required 
                        className="admin-form-input"
                        value={editingSeo.focusKeyword}
                        onChange={(e) => setEditingSeo({ ...editingSeo, focusKeyword: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>SEO Meta Description</label>
                    <textarea 
                      required 
                      className="admin-form-textarea"
                      value={editingSeo.metaDescription}
                      onChange={(e) => setEditingSeo({ ...editingSeo, metaDescription: e.target.value })}
                    />
                    <span style={{ fontSize: '11px', color: editingSeo.metaDescription.length >= 120 && editingSeo.metaDescription.length <= 160 ? 'var(--success)' : 'var(--text-muted-dark)' }}>
                      Length: {editingSeo.metaDescription.length} characters (Optimal: 120-160)
                    </span>
                  </div>

                  <div className="grid-2col">
                    <div className="admin-form-group">
                      <label>Canonical URL</label>
                      <input 
                        type="text" 
                        className="admin-form-input"
                        value={editingSeo.canonicalUrl}
                        onChange={(e) => setEditingSeo({ ...editingSeo, canonicalUrl: e.target.value })}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Slug Editor</label>
                      <input 
                        type="text" 
                        className="admin-form-input"
                        value={editingSeo.slug}
                        onChange={(e) => setEditingSeo({ ...editingSeo, slug: e.target.value })}
                        disabled={editingSeo.pageId === 'home'}
                      />
                    </div>
                  </div>

                  <div style={{ backgroundColor: 'var(--light-surface)', padding: '20px', borderRadius: '8px', marginBottom: '24px', border: '1px solid var(--light-border)' }}>
                    <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--primary)' }}>Open Graph Settings (Social Shares)</h4>
                    <div className="grid-2col">
                      <div className="admin-form-group">
                        <label>OG Title</label>
                        <input 
                          type="text" 
                          className="admin-form-input"
                          value={editingSeo.ogTitle}
                          onChange={(e) => setEditingSeo({ ...editingSeo, ogTitle: e.target.value })}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>OG Image URL</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="text" 
                            className="admin-form-input"
                            value={editingSeo.ogImage}
                            onChange={(e) => setEditingSeo({ ...editingSeo, ogImage: e.target.value })}
                          />
                          <label className="btn btn-dark btn-sm" style={{ margin: 0, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            {uploadingOg ? 'Uploading...' : 'Upload File'}
                            <input 
                              type="file" 
                              accept="image/*"
                              style={{ display: 'none' }}
                              disabled={uploadingOg}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setUploadingOg(true);
                                try {
                                  const url = await uploadToCloudinary(file);
                                  setEditingSeo({ ...editingSeo, ogImage: url });
                                  onToast('Open Graph image uploaded to Cloudinary!', 'success');
                                } catch (err: any) {
                                  console.error(err);
                                  onToast(`Upload failed: ${err.message}`, 'error');
                                } finally {
                                  setUploadingOg(false);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label>OG Description</label>
                      <textarea 
                        className="admin-form-textarea"
                        style={{ minHeight: '60px' }}
                        value={editingSeo.ogDescription}
                        onChange={(e) => setEditingSeo({ ...editingSeo, ogDescription: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setEditingSeo(null)} className="btn btn-secondary btn-sm">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm">
                      Save SEO settings
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* SEO Config Table */
              <div>
                <div className="admin-card">
                  <h2>Core Site Pages Meta</h2>
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Page Name</th>
                          <th>Slug</th>
                          <th>Meta Title</th>
                          <th>Focus Keyword</th>
                          <th>SEO Score</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seoConfigs.map(config => (
                          <tr key={config.pageId}>
                            <td style={{ fontWeight: 600 }}>{config.pageName}</td>
                            <td><code>{config.pageId === 'home' ? '/' : '/' + config.slug}</code></td>
                            <td style={{ fontSize: '13px', color: 'var(--text-muted-dark)' }}>{config.seoTitle}</td>
                            <td><strong>{config.focusKeyword}</strong></td>
                            <td>
                              <span style={{ 
                                fontWeight: 700, 
                                color: config.seoScore >= 90 ? 'var(--success)' : 'var(--warning)' 
                              }}>
                                {config.seoScore}/100
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button 
                                onClick={() => setEditingSeo(config)} 
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '6px 10px', height: 'auto' }}
                              >
                                <Edit size={14} /> Edit Tags
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sitemap & Robots.txt Section */}
                <div className="grid-2col">
                  {/* Sitemap Generator */}
                  <div className="admin-card">
                    <h2>XML Sitemap Generator</h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted-dark)', marginBottom: '20px' }}>
                      Generate an SEO sitemap listing all active, published recipe pages. Search engines read this file to discover your recipe content.
                    </p>
                    <button onClick={generateSitemap} className="btn btn-primary btn-sm" style={{ marginBottom: '16px' }}>
                      <RefreshCw size={14} style={{ marginRight: '6px' }} /> Generate sitemap.xml
                    </button>

                    {sitemapXml && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 600 }}>XML Output Preview:</span>
                          <button 
                            onClick={() => { navigator.clipboard.writeText(sitemapXml); onToast('Copied to clipboard!', 'success'); }}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '11px', height: 'auto' }}
                          >
                            Copy XML
                          </button>
                        </div>
                        <textarea 
                          readOnly 
                          className="admin-form-textarea" 
                          style={{ fontFamily: 'monospace', fontSize: '11px', minHeight: '180px', backgroundColor: '#1e1e24', color: '#a9b7c6' }}
                          value={sitemapXml}
                        />
                      </div>
                    )}
                  </div>

                  {/* Robots.txt Editor */}
                  <div className="admin-card">
                    <h2>Robots.txt Editor</h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted-dark)', marginBottom: '20px' }}>
                      Instruct search crawlers (Googlebot, Bingbot) which pages to scan or ignore.
                    </p>
                    <div className="admin-form-group">
                      <textarea 
                        className="admin-form-textarea" 
                        style={{ fontFamily: 'monospace', fontSize: '13px', minHeight: '140px' }}
                        value={robotsTxt}
                        onChange={(e) => setRobotsTxt(e.target.value)}
                      />
                    </div>
                    <button onClick={handleSaveRobots} className="btn btn-dark btn-sm">
                      Save Robots.txt
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- LEADS AND MESSAGES TABS --- */}
        {activeTab === 'leads' && (
          <div>
            <div className="admin-header">
              <h1>Leads & Inquiry Tickets</h1>
            </div>

            <div className="grid-2col">
              {/* Ebook Opt-in Emails */}
              <div className="admin-card">
                <h2>Email Opt-ins (Free Ebook leads)</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted-dark)', marginBottom: '20px' }}>
                  These users filled out the email form on your Free Cookbook Page. Sync them with Mailchimp/Klaviyo to start selling the $11.99 version.
                </p>
                <div className="admin-table-wrapper">
                  <table className="admin-table" style={{ border: '1px solid var(--light-border)', borderRadius: '4px' }}>
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Source</th>
                        <th>Opt-in Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.length > 0 ? leads.map(lead => (
                        <tr key={lead.id}>
                          <td style={{ fontWeight: 600 }}>{lead.email}</td>
                          <td><span className="badge badge-primary" style={{ fontSize: '10px' }}>{lead.source}</span></td>
                          <td style={{ fontSize: '12px' }}>{new Date(lead.createdAt).toLocaleString()}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted-dark)' }}>No leads captured yet. Try opting in on the free offer page!</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Contact Tickets */}
              <div className="admin-card">
                <h2>Contact Form Messages</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted-dark)', marginBottom: '20px' }}>
                  Inquiries submitted via the Contact page contact form.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {messages.length > 0 ? messages.map(msg => (
                    <div key={msg.id} style={{ border: '1px solid var(--light-border)', borderRadius: '8px', padding: '16px', backgroundColor: 'var(--light-surface)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div>
                          <strong style={{ fontSize: '14px' }}>{msg.name}</strong>
                          <span style={{ color: 'var(--text-muted-dark)', fontSize: '12px', marginLeft: '8px' }}>({msg.email})</span>
                        </div>
                        <span className="badge" style={{ fontSize: '10px' }}>{msg.subject}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-dark)', fontStyle: 'italic', marginBottom: '8px' }}>
                        "{msg.message}"
                      </p>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted-dark)' }}>
                        Received: {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                  )) : (
                    <div style={{ textAlign: 'center', padding: '40px 0', border: '1px dashed var(--light-border)', borderRadius: '8px', color: 'var(--text-muted-dark)' }}>
                      No contact messages received.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- ANALYTICS AND TRACKINGS TABS --- */}
        {activeTab === 'analytics' && (
          <div>
            <div className="admin-header">
              <h1>Analytics Integrations</h1>
            </div>

            <div className="admin-card">
              <h2>Pixel Setup & Tracking Control</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted-dark)', marginBottom: '24px' }}>
                Toggle active pixels to simulate live analytics scripts loading and loading events onto Google, Meta, Pinterest, Clarity, and TikTok servers.
              </p>

              <div className="pixel-toggle-grid">
                {/* GA4 */}
                <div className="pixel-card">
                  <div className="pixel-card-info">
                    <h4>Google Analytics 4</h4>
                    <p>Logs views, scrolling, clicks and downloads.</p>
                    <input 
                      type="text" 
                      placeholder="Measurement ID (G-...)" 
                      className="admin-form-input" 
                      style={{ fontSize: '11px', padding: '6px 10px', marginTop: '8px', width: '150px' }}
                      value={tracking.ga4Id || ''}
                      onChange={(e) => handlePixelIdChange('ga4Id', e.target.value)}
                    />
                  </div>
                  <label className="switch-toggle">
                    <input 
                      type="checkbox" 
                      checked={tracking.ga4Enabled || false}
                      onChange={() => handlePixelToggle('ga4Enabled')}
                    />
                    <span className="slider-round"></span>
                  </label>
                </div>

                {/* Meta Pixel */}
                <div className="pixel-card">
                  <div className="pixel-card-info">
                    <h4>Meta Pixel (Facebook Ads)</h4>
                    <p>Tracks PageViews, Leads and InitiateCheckout events.</p>
                    <input 
                      type="text" 
                      placeholder="Pixel ID" 
                      className="admin-form-input" 
                      style={{ fontSize: '11px', padding: '6px 10px', marginTop: '8px', width: '150px' }}
                      value={tracking.metaPixelId || ''}
                      onChange={(e) => handlePixelIdChange('metaPixelId', e.target.value)}
                    />
                  </div>
                  <label className="switch-toggle">
                    <input 
                      type="checkbox" 
                      checked={tracking.metaPixelEnabled || false}
                      onChange={() => handlePixelToggle('metaPixelEnabled')}
                    />
                    <span className="slider-round"></span>
                  </label>
                </div>

                {/* Google Ads */}
                <div className="pixel-card">
                  <div className="pixel-card-info">
                    <h4>Google Ads Conversion</h4>
                    <p>Measures purchase button clicks and sales pages.</p>
                    <input 
                      type="text" 
                      placeholder="Conversion ID (AW-...)" 
                      className="admin-form-input" 
                      style={{ fontSize: '11px', padding: '6px 10px', marginTop: '8px', width: '150px' }}
                      value={tracking.googleAdsId || ''}
                      onChange={(e) => handlePixelIdChange('googleAdsId', e.target.value)}
                    />
                  </div>
                  <label className="switch-toggle">
                    <input 
                      type="checkbox" 
                      checked={tracking.googleAdsEnabled || false}
                      onChange={() => handlePixelToggle('googleAdsEnabled')}
                    />
                    <span className="slider-round"></span>
                  </label>
                </div>

                {/* Pinterest Tag */}
                <div className="pixel-card">
                  <div className="pixel-card-info">
                    <h4>Pinterest Tag</h4>
                    <p>Captures page visits and checkout click logs.</p>
                    <input 
                      type="text" 
                      placeholder="Tag ID" 
                      className="admin-form-input" 
                      style={{ fontSize: '11px', padding: '6px 10px', marginTop: '8px', width: '150px' }}
                      value={tracking.pinterestTagId || ''}
                      onChange={(e) => handlePixelIdChange('pinterestTagId', e.target.value)}
                    />
                  </div>
                  <label className="switch-toggle">
                    <input 
                      type="checkbox" 
                      checked={tracking.pinterestTagEnabled || false}
                      onChange={() => handlePixelToggle('pinterestTagEnabled')}
                    />
                    <span className="slider-round"></span>
                  </label>
                </div>

                {/* TikTok Pixel */}
                <div className="pixel-card">
                  <div className="pixel-card-info">
                    <h4>TikTok Pixel</h4>
                    <p>Tracks traffic sources and ebook checkouts.</p>
                    <input 
                      type="text" 
                      placeholder="Pixel Code" 
                      className="admin-form-input" 
                      style={{ fontSize: '11px', padding: '6px 10px', marginTop: '8px', width: '150px' }}
                      value={tracking.tiktokPixelId || ''}
                      onChange={(e) => handlePixelIdChange('tiktokPixelId', e.target.value)}
                    />
                  </div>
                  <label className="switch-toggle">
                    <input 
                      type="checkbox" 
                      checked={tracking.tiktokPixelEnabled || false}
                      onChange={() => handlePixelToggle('tiktokPixelEnabled')}
                    />
                    <span className="slider-round"></span>
                  </label>
                </div>

                {/* Microsoft Clarity */}
                <div className="pixel-card">
                  <div className="pixel-card-info">
                    <h4>Microsoft Clarity</h4>
                    <p>Collects heatmap sessions and behavior reports.</p>
                    <input 
                      type="text" 
                      placeholder="Project Code" 
                      className="admin-form-input" 
                      style={{ fontSize: '11px', padding: '6px 10px', marginTop: '8px', width: '150px' }}
                      value={tracking.clarityId || ''}
                      onChange={(e) => handlePixelIdChange('clarityId', e.target.value)}
                    />
                  </div>
                  <label className="switch-toggle">
                    <input 
                      type="checkbox" 
                      checked={tracking.clarityEnabled || false}
                      onChange={() => handlePixelToggle('clarityEnabled')}
                    />
                    <span className="slider-round"></span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button onClick={handleSaveTracking} className="btn btn-primary btn-sm">
                  Save Configurations
                </button>
              </div>
            </div>

            {/* Pixel Simulation Feed Console */}
            <div className="admin-card" style={{ paddingBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2>Live Tracking Event Fire Console</h2>
                <button onClick={clearPixelLogs} className="btn btn-secondary btn-sm" style={{ padding: '6px 12px', fontSize: '12px', height: 'auto' }}>
                  Clear Logs
                </button>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted-dark)', marginBottom: '16px' }}>
                Navigate to other pages (Home, Ebook, Free cookbook) or interact with signups/checkouts in another tab, then check back here to see tracking event scripts loading!
              </p>

              <div className="pixel-console">
                <div className="pixel-console-title">
                  <span>BHYOU CONSOLE EMULATOR v1.0</span>
                  <span>LISTENING ON PORT localhost:3000...</span>
                </div>
                {pixelLogs.length > 0 ? pixelLogs.map(log => {
                  let badgeColor = '#64748b'; // default gray
                  if (log.pixel.includes('Google')) badgeColor = '#4285f4'; // blue
                  if (log.pixel.includes('Meta')) badgeColor = '#1877f2'; // dark blue
                  if (log.pixel.includes('Pinterest')) badgeColor = '#bd081c'; // red
                  if (log.pixel.includes('TikTok')) badgeColor = '#000000'; // black
                  if (log.pixel.includes('Clarity')) badgeColor = '#00a3e0'; // light blue

                  return (
                    <div className="pixel-console-line" key={log.id}>
                      <span className="pixel-console-time">[{log.timestamp}]</span>
                      <span className="pixel-console-tag" style={{ backgroundColor: badgeColor, color: 'white' }}>{log.pixel}</span>
                      <span style={{ color: '#e2e8f0' }}>fired event</span> 
                      <strong style={{ color: '#10b981', marginLeft: '6px' }}>{log.event}</strong> 
                      <span style={{ color: '#94a3b8', marginLeft: '8px' }}>payload: {log.data}</span>
                    </div>
                  );
                }) : (
                  <div style={{ color: '#64748b', fontStyle: 'italic', padding: '20px 0' }}>
                    Console is empty. Navigate the website or submit forms to trigger simulated tracking tags!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
