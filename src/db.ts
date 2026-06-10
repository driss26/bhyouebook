import { supabase } from './supabaseClient';

const hasSupabase = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
let cachedTrackingSettings: TrackingSettings | null = null;

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  pinterestImage: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'scheduled';
  scheduledDate?: string;
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  seoScore: number;
  canonicalUrl: string;
  faqSchema: { question: string; answer: string }[];
  createdAt: string;
  author: string;
  readTime: string;
}

export interface PageSeo {
  pageId: string;
  pageName: string;
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  seoScore: number;
  slug: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}

export interface Lead {
  id: string;
  email: string;
  source: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface AnnouncementSettings {
  enabled: boolean;
  text: string;
  bgGradientStart: string;
  bgGradientEnd: string;
  textColor: string;
}

export interface MediaItem {
  id: string;
  url: string;
  fileName: string;
  createdAt: string;
}

export interface TrackingSettings {
  ga4Enabled: boolean;
  ga4Id: string;
  gscEnabled: boolean;
  googleAdsEnabled: boolean;
  googleAdsId: string;
  metaPixelEnabled: boolean;
  metaPixelId: string;
  tiktokPixelEnabled: boolean;
  tiktokPixelId: string;
  pinterestTagEnabled: boolean;
  pinterestTagId: string;
  youtubeTrackingEnabled: boolean;
  clarityEnabled: boolean;
  clarityId: string;
}

export interface RobotConfig {
  content: string;
}

const DEFAULT_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    title: '10 Easy High-Protein Chicken Meals Under 400 Calories',
    slug: 'high-protein-chicken-meals',
    excerpt: 'Tired of dry chicken breasts? Try these 10 delicious, high-protein recipes under 400 calories that are perfect for fat loss and muscle building.',
    content: '<p>Tired of eating dry, flavorless chicken breast to hit your protein goals? You do not have to suffer to get in shape! Chicken is one of the most versatile lean proteins available, and with the right seasonings and preparation, it can taste incredible.</p><h2>1. Garlic Parmesan Chicken Skewers</h2><p>These skewers are tender, flavorful, and packed with garlic goodness. Best of all, they take under 20 minutes to make.</p><ul><li><strong>Protein:</strong> 38g</li><li><strong>Calories:</strong> 340 kcal</li><li><strong>Prep time:</strong> 10 mins</li></ul>',
    featuredImage: 'https://images.unsplash.com/photo-1598515214211-89d3e73ae83b?auto=format&fit=crop&w=800&q=80',
    pinterestImage: 'https://images.unsplash.com/photo-1598515214211-89d3e73ae83b?auto=format&fit=crop&w=600&h=900&q=80',
    category: 'Chicken Meals',
    tags: ['chicken', 'high protein', 'low calorie', 'lunch'],
    status: 'published',
    seoTitle: '10 High-Protein Chicken Meals Under 400 Calories | BHYou',
    metaDescription: 'Discover 10 easy, mouth-watering high-protein chicken recipes under 400 calories. Perfect for fat loss, meal prep, and body reconstruction.',
    focusKeyword: 'chicken meals',
    seoScore: 95,
    canonicalUrl: 'https://bhyou.com/blog/high-protein-chicken-meals',
    faqSchema: [
      {
        question: 'Can I use chicken thighs instead of breasts?',
        answer: 'Yes, but be aware that chicken thighs contain more fat, which will increase the calorie count by about 40-50 calories per serving.'
      }
    ],
    createdAt: '2026-06-01T10:00:00Z',
    author: 'Coach Sarah',
    readTime: '5 min read'
  },
  {
    id: 'post-2',
    title: 'Healthy Low-Calorie Chocolate Lava Cake Recipe',
    slug: 'healthy-chocolate-lava-cake',
    excerpt: 'Indulge your sweet tooth without ruining your diet. This healthy, high-protein chocolate lava cake is under 250 calories and ready in 5 minutes!',
    content: '<p>We all get intense chocolate cravings from time to time. But instead of grabbing a store-bought cake loaded with sugar and hydrogenated oils, you can make this single-serve, high-protein chocolate lava cake in your microwave in just under 5 minutes!</p><h2>The Secret Ingredient: Whey Protein</h2><p>By replacing flour with chocolate whey protein isolate, we dramatically boost the protein content while keeping the carbs low.</p>',
    featuredImage: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    pinterestImage: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&h=900&q=80',
    category: 'Healthy Desserts',
    tags: ['dessert', 'chocolate', 'high protein', 'lava cake'],
    status: 'published',
    seoTitle: 'Healthy Low-Calorie Chocolate Lava Cake | BHYou',
    metaDescription: 'Satisfy your cravings with this single-serve chocolate lava cake. Under 250 calories, high in protein, and ready in minutes.',
    focusKeyword: 'healthy dessert',
    seoScore: 92,
    canonicalUrl: 'https://bhyou.com/blog/healthy-chocolate-lava-cake',
    faqSchema: [
      {
        question: 'Can I use plant-based protein powder?',
        answer: 'Yes, but plant-based protein powders tend to absorb more liquid, so you may need to add 1-2 extra tablespoons of unsweetened almond milk.'
      }
    ],
    createdAt: '2026-06-03T14:30:00Z',
    author: 'Coach Dave',
    readTime: '3 min read'
  },
  {
    id: 'post-3',
    title: 'Meal Prep: 5 Days of Fat Loss Lunches for under $20',
    slug: 'fat-loss-meal-prep',
    excerpt: 'Save time and money with this easy fat loss meal prep guide. Get 5 high-protein, calorie-friendly lunch bowls prepped in under an hour.',
    content: '<p>Planning ahead is the ultimate secret weapon for fat loss. When you have delicious, healthy meals ready in your fridge, you are far less likely to order high-calorie takeout when hunger strikes.</p><h2>The Budget Fat Loss Plan</h2><p>This meal prep guides you through cooking 5 portions of Turkey Sweet Potato Bowls for less than $20 total.</p>',
    featuredImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    pinterestImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=900&q=80',
    category: 'Meal Prep',
    tags: ['meal prep', 'fat loss', 'turkey', 'sweet potato'],
    status: 'published',
    seoTitle: '5 Days of Fat Loss Meal Prep Under $20 | BHYou',
    metaDescription: 'Save money and stay on track with this 5-day high-protein meal prep guide. Easy recipes under 400 calories.',
    focusKeyword: 'meal prep',
    seoScore: 90,
    canonicalUrl: 'https://bhyou.com/blog/fat-loss-meal-prep',
    faqSchema: [
      {
        question: 'How long do these meals keep in the fridge?',
        answer: 'These meal prep bowls stay fresh and delicious in airtight containers for up to 5 days.'
      }
    ],
    createdAt: '2026-06-05T08:00:00Z',
    author: 'Coach Sarah',
    readTime: '6 min read'
  }
];

const DEFAULT_SEO_CONFIGS: PageSeo[] = [
  {
    pageId: 'home',
    pageName: 'Home Page',
    seoTitle: 'High-Protein Recipes: 50 Guilt-Free Healthy Recipes Under 400 Calories',
    metaDescription: 'Boost your metabolism and burn fat with BHYou. Get 50 mouth-watering, high-protein recipes under 400 calories. Includes desserts and meal plans!',
    focusKeyword: 'high protein recipes',
    seoScore: 92,
    slug: '',
    canonicalUrl: 'https://bhyou.com',
    ogTitle: 'High-Protein Recipes: 50 Guilt-Free Healthy Recipes Under 400 Calories',
    ogDescription: 'Get 50 protein-packed, low-calorie recipes designed to burn fat and build muscle. Standard and free options available!',
    ogImage: 'https://i.ibb.co/8g3JXwpS/HIGH-PROTEIN-RECIPES.jpg'
  },
  {
    pageId: 'sales',
    pageName: 'Ebook Sales Page',
    seoTitle: 'High-Protein Recipes Cookbook - Get 50 Recipes for $11.99',
    metaDescription: 'Get your copy of 50 High-Protein Recipes Under 400 Calories. Fuel your muscles, lose fat, and satisfy sweet cravings. Money-back guarantee!',
    focusKeyword: 'under 400 calories',
    seoScore: 96,
    slug: 'cookbook',
    canonicalUrl: 'https://bhyou.com/cookbook',
    ogTitle: 'High-Protein Recipes: 50 Guilt-Free Healthy Recipes Under 400 Calories',
    ogDescription: 'Ready to burn fat without giving up desserts? Purchase our premium cookbook today for only $11.99!',
    ogImage: 'https://i.ibb.co/8g3JXwpS/HIGH-PROTEIN-RECIPES.jpg'
  }
];

const DEFAULT_TRACKING: TrackingSettings = {
  ga4Enabled: true,
  ga4Id: 'G-BHYOU2026',
  gscEnabled: true,
  googleAdsEnabled: false,
  googleAdsId: 'AW-123456789',
  metaPixelEnabled: true,
  metaPixelId: 'pixel_987654321',
  tiktokPixelEnabled: false,
  tiktokPixelId: 'tt_12345abcde',
  pinterestTagEnabled: true,
  pinterestTagId: 'pin_88889999',
  youtubeTrackingEnabled: true,
  clarityEnabled: true,
  clarityId: 'cl_abc123'
};

const DEFAULT_ROBOTS = `User-agent: *
Allow: /
Disallow: /admin

Sitemap: https://bhyou.com/sitemap.xml`;

// LocalStorage Keys
const KEYS = {
  POSTS: 'bhyou_posts',
  SEO: 'bhyou_seo',
  TRACKING: 'bhyou_tracking',
  LEADS: 'bhyou_leads',
  MESSAGES: 'bhyou_messages',
  ROBOTS: 'bhyou_robots',
  ANNOUNCEMENT: 'bhyou_announcement',
  MEDIA: 'bhyou_media',
};

const DEFAULT_ANNOUNCEMENT: AnnouncementSettings = {
  enabled: true,
  text: '🔥 Get the High-Protein Cookbook for $11.99 on Gumroad — or unlock it FREE by installing our featured app. Click here to learn more →',
  bgGradientStart: '#064e3b',
  bgGradientEnd: '#10b981',
  textColor: '#ecfdf5',
};

// Initialize DB helper
export const initDb = () => {
  if (!localStorage.getItem(KEYS.POSTS)) {
    localStorage.setItem(KEYS.POSTS, JSON.stringify(DEFAULT_POSTS));
  }
  if (!localStorage.getItem(KEYS.SEO)) {
    localStorage.setItem(KEYS.SEO, JSON.stringify(DEFAULT_SEO_CONFIGS));
  } else {
    try {
      const currentSeo = JSON.parse(localStorage.getItem(KEYS.SEO) || '[]');
      let updated = false;
      const newSeo = currentSeo.map((item: any) => {
        if (item.pageId === 'home' && item.ogTitle !== 'High-Protein Recipes: 50 Guilt-Free Healthy Recipes Under 400 Calories') {
          item.seoTitle = 'High-Protein Recipes: 50 Guilt-Free Healthy Recipes Under 400 Calories';
          item.ogTitle = 'High-Protein Recipes: 50 Guilt-Free Healthy Recipes Under 400 Calories';
          updated = true;
        }
        if (item.pageId === 'sales' && item.ogTitle !== 'High-Protein Recipes: 50 Guilt-Free Healthy Recipes Under 400 Calories') {
          item.seoTitle = 'High-Protein Recipes Cookbook - Get 50 Recipes for $11.99';
          item.ogTitle = 'High-Protein Recipes: 50 Guilt-Free Healthy Recipes Under 400 Calories';
          updated = true;
        }
        return item;
      });
      if (updated) {
        localStorage.setItem(KEYS.SEO, JSON.stringify(newSeo));
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!localStorage.getItem(KEYS.TRACKING)) {
    localStorage.setItem(KEYS.TRACKING, JSON.stringify(DEFAULT_TRACKING));
  }
  if (!localStorage.getItem(KEYS.ROBOTS)) {
    localStorage.setItem(KEYS.ROBOTS, DEFAULT_ROBOTS);
  }
  if (!localStorage.getItem(KEYS.LEADS)) {
    localStorage.setItem(KEYS.LEADS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.MESSAGES)) {
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.ANNOUNCEMENT)) {
    localStorage.setItem(KEYS.ANNOUNCEMENT, JSON.stringify(DEFAULT_ANNOUNCEMENT));
  }
  if (!localStorage.getItem(KEYS.MEDIA)) {
    localStorage.setItem(KEYS.MEDIA, JSON.stringify([]));
  }
};

export const checkAndFixSeoConfigs = async () => {
  try {
    const configs = await db.getSeoConfigs();
    const homeConfig = configs.find(c => c.pageId === 'home');
    const salesConfig = configs.find(c => c.pageId === 'sales');
    
    if (homeConfig && homeConfig.ogTitle !== 'High-Protein Recipes: 50 Guilt-Free Healthy Recipes Under 400 Calories') {
      homeConfig.seoTitle = 'High-Protein Recipes: 50 Guilt-Free Healthy Recipes Under 400 Calories';
      homeConfig.ogTitle = 'High-Protein Recipes: 50 Guilt-Free Healthy Recipes Under 400 Calories';
      await db.saveSeoConfig(homeConfig);
    }
    
    if (salesConfig && salesConfig.ogTitle !== 'High-Protein Recipes: 50 Guilt-Free Healthy Recipes Under 400 Calories') {
      salesConfig.seoTitle = 'High-Protein Recipes Cookbook - Get 50 Recipes for $11.99';
      salesConfig.ogTitle = 'High-Protein Recipes: 50 Guilt-Free Healthy Recipes Under 400 Calories';
      await db.saveSeoConfig(salesConfig);
    }
  } catch (e) {
    console.error("Failed to verify/fix SEO configs in database:", e);
  }
};

export const db = {
  // Posts
  getPosts: async (): Promise<BlogPost[]> => {
    initDb();
    if (hasSupabase) {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('createdAt', { ascending: false });
      if (!error && data) {
        if (data.length === 0) {
          const defaults = JSON.parse(localStorage.getItem(KEYS.POSTS) || '[]');
          if (defaults.length > 0) {
            await supabase.from('posts').insert(defaults);
            return defaults;
          }
        }
        return data as BlogPost[];
      }
      console.warn("Supabase getPosts error, falling back to localStorage:", error);
    }
    return JSON.parse(localStorage.getItem(KEYS.POSTS) || '[]');
  },
  
  savePost: async (post: BlogPost): Promise<void> => {
    const contentWordCount = post.content.split(/\s+/).length;
    const focusKeywordCount = (post.content.toLowerCase().match(new RegExp(post.focusKeyword.toLowerCase(), 'g')) || []).length;
    
    let score = 50;
    if (contentWordCount > 300) score += 15;
    if (contentWordCount > 600) score += 10;
    if (focusKeywordCount > 0) score += 10;
    if (focusKeywordCount >= 3) score += 5;
    if (post.seoTitle.toLowerCase().includes(post.focusKeyword.toLowerCase())) score += 5;
    if (post.metaDescription.toLowerCase().includes(post.focusKeyword.toLowerCase())) score += 5;
    score = Math.min(score, 100);
    
    post.seoScore = score;
    
    if (hasSupabase) {
      const { error } = await supabase
        .from('posts')
        .upsert(post);
      if (error) {
        console.warn("Supabase savePost error, falling back to localStorage:", error);
      }
    }

    const posts: BlogPost[] = JSON.parse(localStorage.getItem(KEYS.POSTS) || '[]');
    const index = posts.findIndex(p => p.id === post.id);
    if (index >= 0) {
      posts[index] = post;
    } else {
      posts.push(post);
    }
    localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
  },
  
  deletePost: async (id: string): Promise<void> => {
    if (hasSupabase) {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);
      if (error) {
        console.warn("Supabase deletePost error, falling back to localStorage:", error);
      }
    }
    const posts: BlogPost[] = JSON.parse(localStorage.getItem(KEYS.POSTS) || '[]');
    const filtered = posts.filter(p => p.id !== id);
    localStorage.setItem(KEYS.POSTS, JSON.stringify(filtered));
  },
  
  // Page SEO Configs
  getSeoConfigs: async (): Promise<PageSeo[]> => {
    initDb();
    if (hasSupabase) {
      const { data, error } = await supabase
        .from('seo_configs')
        .select('*');
      if (!error && data) {
        if (data.length === 0) {
          const defaults = JSON.parse(localStorage.getItem(KEYS.SEO) || '[]');
          if (defaults.length > 0) {
            await supabase.from('seo_configs').insert(defaults);
            return defaults;
          }
        }
        return data as PageSeo[];
      }
      console.warn("Supabase getSeoConfigs error, falling back to localStorage:", error);
    }
    return JSON.parse(localStorage.getItem(KEYS.SEO) || '[]');
  },
  
  saveSeoConfig: async (config: PageSeo): Promise<void> => {
    let score = 60;
    if (config.seoTitle.length >= 40 && config.seoTitle.length <= 60) score += 15;
    if (config.metaDescription.length >= 120 && config.metaDescription.length <= 160) score += 15;
    if (config.focusKeyword) score += 5;
    if (config.canonicalUrl) score += 5;
    
    config.seoScore = Math.min(score, 100);
    
    if (hasSupabase) {
      const { error } = await supabase
        .from('seo_configs')
        .upsert(config);
      if (error) {
        console.warn("Supabase saveSeoConfig error, falling back to localStorage:", error);
      }
    }

    const configs: PageSeo[] = JSON.parse(localStorage.getItem(KEYS.SEO) || '[]');
    const index = configs.findIndex(c => c.pageId === config.pageId);
    if (index >= 0) {
      configs[index] = config;
    } else {
      configs.push(config);
    }
    localStorage.setItem(KEYS.SEO, JSON.stringify(configs));
  },
  
  // Tracking
  getTrackingSettings: async (): Promise<TrackingSettings> => {
    initDb();
    if (hasSupabase) {
      const { data, error } = await supabase
        .from('tracking_settings')
        .select('*')
        .eq('id', 1)
        .single();
      if (!error && data) {
        cachedTrackingSettings = data as TrackingSettings;
        return data as TrackingSettings;
      }
      console.warn("Supabase getTrackingSettings error, falling back to localStorage:", error);
    }
    const local = JSON.parse(localStorage.getItem(KEYS.TRACKING) || '{}');
    cachedTrackingSettings = local;
    return local;
  },
  
  saveTrackingSettings: async (settings: TrackingSettings): Promise<void> => {
    if (hasSupabase) {
      const { error } = await supabase
        .from('tracking_settings')
        .upsert({ id: 1, ...settings });
      if (error) {
        console.warn("Supabase saveTrackingSettings error, falling back to localStorage:", error);
      }
    }
    cachedTrackingSettings = settings;
    localStorage.setItem(KEYS.TRACKING, JSON.stringify(settings));
  },
  
  // Robots
  getRobotsTxt: async (): Promise<string> => {
    initDb();
    if (hasSupabase) {
      const { data, error } = await supabase
        .from('robots_config')
        .select('content')
        .eq('id', 1)
        .single();
      if (!error && data) return data.content;
      console.warn("Supabase getRobotsTxt error, falling back to localStorage:", error);
    }
    return localStorage.getItem(KEYS.ROBOTS) || DEFAULT_ROBOTS;
  },
  
  saveRobotsTxt: async (content: string): Promise<void> => {
    if (hasSupabase) {
      const { error } = await supabase
        .from('robots_config')
        .upsert({ id: 1, content });
      if (error) {
        console.warn("Supabase saveRobotsTxt error, falling back to localStorage:", error);
      }
    }
    localStorage.setItem(KEYS.ROBOTS, content);
  },
  
  // Leads
  getLeads: async (): Promise<Lead[]> => {
    initDb();
    if (hasSupabase) {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('createdAt', { ascending: false });
      if (!error && data) return data as Lead[];
      console.warn("Supabase getLeads error, falling back to localStorage:", error);
    }
    return JSON.parse(localStorage.getItem(KEYS.LEADS) || '[]');
  },
  
  saveLead: async (email: string, source: string): Promise<void> => {
    const newLead = {
      id: 'lead-' + Date.now(),
      email,
      source,
      createdAt: new Date().toISOString(),
    };
    if (hasSupabase) {
      const { error } = await supabase
        .from('leads')
        .insert(newLead);
      if (error) {
        console.warn("Supabase saveLead error, falling back to localStorage:", error);
      }
    }
    const leads = JSON.parse(localStorage.getItem(KEYS.LEADS) || '[]');
    leads.unshift(newLead);
    localStorage.setItem(KEYS.LEADS, JSON.stringify(leads));
  },
  
  // Messages
  getMessages: async (): Promise<ContactMessage[]> => {
    initDb();
    if (hasSupabase) {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('createdAt', { ascending: false });
      if (!error && data) return data as ContactMessage[];
      console.warn("Supabase getMessages error, falling back to localStorage:", error);
    }
    return JSON.parse(localStorage.getItem(KEYS.MESSAGES) || '[]');
  },
  
  saveMessage: async (name: string, email: string, subject: string, message: string): Promise<void> => {
    const newMessage = {
      id: 'msg-' + Date.now(),
      name,
      email,
      subject,
      message,
      createdAt: new Date().toISOString(),
    };
    if (hasSupabase) {
      const { error } = await supabase
        .from('messages')
        .insert(newMessage);
      if (error) {
        console.warn("Supabase saveMessage error, falling back to localStorage:", error);
      }
    }
    const messages: ContactMessage[] = JSON.parse(localStorage.getItem(KEYS.MESSAGES) || '[]');
    messages.unshift(newMessage);
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(messages));
  },

  // Announcement Settings
  getAnnouncementSettings: async (): Promise<AnnouncementSettings> => {
    initDb();
    if (hasSupabase) {
      const { data, error } = await supabase
        .from('announcement_settings')
        .select('*')
        .eq('id', 1)
        .single();
      if (!error && data) return data as AnnouncementSettings;
      
      // If table exists but has no row with id = 1, let's insert it
      if (error && error.code === 'PGRST116') {
        const defaults = JSON.parse(localStorage.getItem(KEYS.ANNOUNCEMENT) || '{}');
        await supabase.from('announcement_settings').upsert({ id: 1, ...defaults });
        return defaults as AnnouncementSettings;
      }
      console.warn("Supabase getAnnouncementSettings error, falling back to localStorage:", error);
    }
    return JSON.parse(localStorage.getItem(KEYS.ANNOUNCEMENT) || '{}');
  },

  saveAnnouncementSettings: async (settings: AnnouncementSettings): Promise<void> => {
    if (hasSupabase) {
      const { error } = await supabase
        .from('announcement_settings')
        .upsert({ id: 1, ...settings });
      if (error) {
        console.warn("Supabase saveAnnouncementSettings error, falling back to localStorage:", error);
      }
    }
    localStorage.setItem(KEYS.ANNOUNCEMENT, JSON.stringify(settings));
  },

  // Media Gallery
  getMediaItems: async (): Promise<MediaItem[]> => {
    initDb();
    if (hasSupabase) {
      const { data, error } = await supabase
        .from('media_gallery')
        .select('*')
        .order('createdAt', { ascending: false });
      if (!error && data) return data as MediaItem[];
      console.warn("Supabase getMediaItems error, falling back to localStorage:", error);
    }
    return JSON.parse(localStorage.getItem(KEYS.MEDIA) || '[]');
  },

  saveMediaItem: async (item: MediaItem): Promise<void> => {
    if (hasSupabase) {
      const { error } = await supabase
        .from('media_gallery')
        .insert(item);
      if (error) {
        console.warn("Supabase saveMediaItem error, falling back to localStorage:", error);
      }
    }
    const media: MediaItem[] = JSON.parse(localStorage.getItem(KEYS.MEDIA) || '[]');
    media.unshift(item);
    localStorage.setItem(KEYS.MEDIA, JSON.stringify(media));
  },

  deleteMediaItem: async (id: string): Promise<void> => {
    if (hasSupabase) {
      const { error } = await supabase
        .from('media_gallery')
        .delete()
        .eq('id', id);
      if (error) {
        console.warn("Supabase deleteMediaItem error, falling back to localStorage:", error);
      }
    }
    const media: MediaItem[] = JSON.parse(localStorage.getItem(KEYS.MEDIA) || '[]');
    const filtered = media.filter(m => m.id !== id);
    localStorage.setItem(KEYS.MEDIA, JSON.stringify(filtered));
  },
};

// Simulated Analytics Pixel Fires
export const firePixel = (pixelName: string, eventName: string, data?: any) => {
  const settings = cachedTrackingSettings || JSON.parse(localStorage.getItem(KEYS.TRACKING) || '{}');
  const logs = JSON.parse(sessionStorage.getItem('bhyou_pixel_logs') || '[]');
  
  // Check if pixel is enabled
  let isEnabled = false;
  let id = '';
  
  if (pixelName === 'Google Analytics 4' && settings.ga4Enabled) {
    isEnabled = true;
    id = settings.ga4Id;
  } else if (pixelName === 'Google Search Console' && settings.gscEnabled) {
    isEnabled = true;
    id = 'Verified Site';
  } else if (pixelName === 'Google Ads' && settings.googleAdsEnabled) {
    isEnabled = true;
    id = settings.googleAdsId;
  } else if (pixelName === 'Meta Pixel' && settings.metaPixelEnabled) {
    isEnabled = true;
    id = settings.metaPixelId;
  } else if (pixelName === 'TikTok Pixel' && settings.tiktokPixelEnabled) {
    isEnabled = true;
    id = settings.tiktokPixelId;
  } else if (pixelName === 'Pinterest Tag' && settings.pinterestTagEnabled) {
    isEnabled = true;
    id = settings.pinterestTagId;
  } else if (pixelName === 'YouTube Tracking' && settings.youtubeTrackingEnabled) {
    isEnabled = true;
    id = 'Embedded Player Tracker';
  } else if (pixelName === 'Microsoft Clarity' && settings.clarityEnabled) {
    isEnabled = true;
    id = settings.clarityId;
  }
  
  if (!isEnabled) return;
  
  const logEntry = {
    id: 'log-' + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toLocaleTimeString(),
    pixel: pixelName,
    pixelId: id,
    event: eventName,
    data: data ? JSON.stringify(data) : 'N/A'
  };
  
  logs.unshift(logEntry);
  sessionStorage.setItem('bhyou_pixel_logs', JSON.stringify(logs.slice(0, 100)));
  
  // Dispatch custom event to notify listeners (e.g. Analytics dashboard)
  window.dispatchEvent(new CustomEvent('pixel_fired'));
};

// Helper to fire trackings for page views
export const firePageView = (pagePath: string) => {
  firePixel('Google Analytics 4', 'page_view', { path: pagePath });
  firePixel('Google Search Console', 'organic_impression', { path: pagePath });
  firePixel('Meta Pixel', 'PageView', { path: pagePath });
  if (pagePath.includes('cookbook')) {
    firePixel('Pinterest Tag', 'page_visit', { page: 'Ebook Sales Page' });
  }
  firePixel('Microsoft Clarity', 'session_recording', { path: pagePath });
};
