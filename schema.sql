-- Supabase Database Schema for BHYou Ebook Website

-- 1. Blog Posts Table
CREATE TABLE IF NOT EXISTS "posts" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "excerpt" TEXT,
  "content" TEXT,
  "featuredImage" TEXT,
  "pinterestImage" TEXT,
  "category" TEXT,
  "tags" TEXT[],
  "status" TEXT DEFAULT 'draft',
  "scheduledDate" TEXT,
  "seoTitle" TEXT,
  "metaDescription" TEXT,
  "focusKeyword" TEXT,
  "seoScore" INTEGER DEFAULT 0,
  "canonicalUrl" TEXT,
  "faqSchema" JSONB DEFAULT '[]'::jsonb,
  "createdAt" TEXT NOT NULL,
  "author" TEXT,
  "readTime" TEXT
);

-- 2. Page SEO Configurations Table
CREATE TABLE IF NOT EXISTS "seo_configs" (
  "pageId" TEXT PRIMARY KEY,
  "pageName" TEXT NOT NULL,
  "seoTitle" TEXT,
  "metaDescription" TEXT,
  "focusKeyword" TEXT,
  "seoScore" INTEGER DEFAULT 0,
  "slug" TEXT,
  "canonicalUrl" TEXT,
  "ogTitle" TEXT,
  "ogDescription" TEXT,
  "ogImage" TEXT
);

-- 3. Tracking Settings Table (Single-row configuration)
CREATE TABLE IF NOT EXISTS "tracking_settings" (
  "id" INTEGER PRIMARY KEY DEFAULT 1,
  "ga4Enabled" BOOLEAN DEFAULT true,
  "ga4Id" TEXT,
  "gscEnabled" BOOLEAN DEFAULT true,
  "googleAdsEnabled" BOOLEAN DEFAULT false,
  "googleAdsId" TEXT,
  "metaPixelEnabled" BOOLEAN DEFAULT true,
  "metaPixelId" TEXT,
  "tiktokPixelEnabled" BOOLEAN DEFAULT false,
  "tiktokPixelId" TEXT,
  "pinterestTagEnabled" BOOLEAN DEFAULT true,
  "pinterestTagId" TEXT,
  "youtubeTrackingEnabled" BOOLEAN DEFAULT true,
  "clarityEnabled" BOOLEAN DEFAULT true,
  "clarityId" TEXT,
  CONSTRAINT "only_one_row" CHECK ("id" = 1)
);

-- 4. Robots.txt Configuration Table
CREATE TABLE IF NOT EXISTS "robots_config" (
  "id" INTEGER PRIMARY KEY DEFAULT 1,
  "content" TEXT,
  CONSTRAINT "only_one_row" CHECK ("id" = 1)
);

-- 5. Leads Table (Email Optins)
CREATE TABLE IF NOT EXISTS "leads" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL,
  "source" TEXT,
  "createdAt" TEXT NOT NULL
);

-- 6. Contact Messages Table
CREATE TABLE IF NOT EXISTS "messages" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT,
  "email" TEXT NOT NULL,
  "subject" TEXT,
  "message" TEXT,
  "createdAt" TEXT NOT NULL
);


-- Seed Data

-- Insert default tracking settings
INSERT INTO "tracking_settings" ("id", "ga4Enabled", "ga4Id", "gscEnabled", "googleAdsEnabled", "googleAdsId", "metaPixelEnabled", "metaPixelId", "tiktokPixelEnabled", "tiktokPixelId", "pinterestTagEnabled", "pinterestTagId", "youtubeTrackingEnabled", "clarityEnabled", "clarityId")
VALUES (1, true, 'G-BHYOU2026', true, false, 'AW-123456789', true, 'pixel_987654321', false, 'tt_12345abcde', true, 'pin_88889999', true, true, 'cl_abc123')
ON CONFLICT ("id") DO NOTHING;

-- Insert default robots.txt content
INSERT INTO "robots_config" ("id", "content")
VALUES (1, 'User-agent: *
Allow: /
Disallow: /admin

Sitemap: https://bhyou.com/sitemap.xml')
ON CONFLICT ("id") DO NOTHING;

-- Insert default page SEO configurations
INSERT INTO "seo_configs" ("pageId", "pageName", "seoTitle", "metaDescription", "focusKeyword", "seoScore", "slug", "canonicalUrl", "ogTitle", "ogDescription", "ogImage")
VALUES 
('home', 'Home Page', 'High-Protein Recipes: 50 Guilt-Free Healthy Recipes Under 400 Calories', 'Boost your metabolism and burn fat with BHYou. Get 50 mouth-watering, high-protein recipes under 400 calories. Includes desserts and meal plans!', 'high protein recipes', 92, '', 'https://bhyou.com', 'High-Protein Recipes: 50 Guilt-Free Healthy Recipes Under 400 Calories', 'Get 50 protein-packed, low-calorie recipes designed to burn fat and build muscle. Standard and free options available!', 'https://i.ibb.co/8g3JXwpS/HIGH-PROTEIN-RECIPES.jpg'),
('sales', 'Ebook Sales Page', 'High-Protein Recipes Cookbook - Get 50 Recipes for $11.99', 'Get your copy of 50 High-Protein Recipes Under 400 Calories. Fuel your muscles, lose fat, and satisfy sweet cravings. Money-back guarantee!', 'under 400 calories', 96, 'cookbook', 'https://bhyou.com/cookbook', 'High-Protein Recipes: 50 Guilt-Free Healthy Recipes Under 400 Calories', 'Ready to burn fat without giving up desserts? Purchase our premium cookbook today for only $11.99!', 'https://i.ibb.co/8g3JXwpS/HIGH-PROTEIN-RECIPES.jpg')
ON CONFLICT ("pageId") DO NOTHING;

-- Insert default blog posts
INSERT INTO "posts" ("id", "title", "slug", "excerpt", "content", "featuredImage", "pinterestImage", "category", "tags", "status", "scheduledDate", "seoTitle", "metaDescription", "focusKeyword", "seoScore", "canonicalUrl", "faqSchema", "createdAt", "author", "readTime")
VALUES 
('post-1', '10 Easy High-Protein Chicken Meals Under 400 Calories', 'high-protein-chicken-meals', 'Tired of dry chicken breasts? Try these 10 delicious, high-protein recipes under 400 calories that are perfect for fat loss and muscle building.', '<p>Tired of eating dry, flavorless chicken breast to hit your protein goals? You do not have to suffer to get in shape! Chicken is one of the most versatile lean proteins available, and with the right seasonings and preparation, it can taste incredible.</p><h2>1. Garlic Parmesan Chicken Skewers</h2><p>These skewers are tender, flavorful, and packed with garlic goodness. Best of all, they take under 20 minutes to make.</p><ul><li><strong>Protein:</strong> 38g</li><li><strong>Calories:</strong> 340 kcal</li><li><strong>Prep time:</strong> 10 mins</li></ul>', 'https://images.unsplash.com/photo-1598515214211-89d3e73ae83b?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1598515214211-89d3e73ae83b?auto=format&fit=crop&w=600&h=900&q=80', 'Chicken Meals', ARRAY['chicken', 'high protein', 'low calorie', 'lunch'], 'published', NULL, '10 High-Protein Chicken Meals Under 400 Calories | BHYou', 'Discover 10 easy, mouth-watering high-protein chicken recipes under 400 calories. Perfect for fat loss, meal prep, and body reconstruction.', 'chicken meals', 95, 'https://bhyou.com/blog/high-protein-chicken-meals', '[{"question": "Can I use chicken thighs instead of breasts?", "answer": "Yes, but be aware that chicken thighs contain more fat, which will increase the calorie count by about 40-50 calories per serving."}]'::jsonb, '2026-06-01T10:00:00Z', 'Coach Sarah', '5 min read'),

('post-2', 'Healthy Low-Calorie Chocolate Lava Cake Recipe', 'healthy-chocolate-lava-cake', 'Indulge your sweet tooth without ruining your diet. This healthy, high-protein chocolate lava cake is under 250 calories and ready in 5 minutes!', '<p>We all get intense chocolate cravings from time to time. But instead of grabbing a store-bought cake loaded with sugar and hydrogenated oils, you can make this single-serve, high-protein chocolate lava cake in your microwave in just under 5 minutes!</p><h2>The Secret Ingredient: Whey Protein</h2><p>By replacing flour with chocolate whey protein isolate, we dramatically boost the protein content while keeping the carbs low.</p>', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&h=900&q=80', 'Healthy Desserts', ARRAY['dessert', 'chocolate', 'high protein', 'lava cake'], 'published', NULL, 'Healthy Low-Calorie Chocolate Lava Cake | BHYou', 'Satisfy your cravings with this single-serve chocolate lava cake. Under 250 calories, high in protein, and ready in minutes.', 'healthy dessert', 92, 'https://bhyou.com/blog/healthy-chocolate-lava-cake', '[{"question": "Can I use plant-based protein powder?", "answer": "Yes, but plant-based protein powders tend to absorb more liquid, so you may need to add 1-2 extra tablespoons of unsweetened almond milk."}]'::jsonb, '2026-06-03T14:30:00Z', 'Coach Dave', '3 min read'),

('post-3', 'Meal Prep: 5 Days of Fat Loss Lunches for under $20', 'fat-loss-meal-prep', 'Save time and money with this easy fat loss meal prep guide. Get 5 high-protein, calorie-friendly lunch bowls prepped in under an hour.', '<p>Planning ahead is the ultimate secret weapon for fat loss. When you have delicious, healthy meals ready in your fridge, you are far less likely to order high-calorie takeout when hunger strikes.</p><h2>The Budget Fat Loss Plan</h2><p>This meal prep guides you through cooking 5 portions of Turkey Sweet Potato Bowls for less than $20 total.</p>', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=900&q=80', 'Meal Prep', ARRAY['meal prep', 'fat loss', 'turkey', 'sweet potato'], 'published', NULL, '5 Days of Fat Loss Meal Prep Under $20 | BHYou', 'Save money and stay on track with this 5-day high-protein meal prep guide. Easy recipes under 400 calories.', 'meal prep', 90, 'https://bhyou.com/blog/fat-loss-meal-prep', '[{"question": "How long do these meals keep in the fridge?", "answer": "These meal prep bowls stay fresh and delicious in airtight containers for up to 5 days."}]'::jsonb, '2026-06-05T08:00:00Z', 'Coach Sarah', '6 min read')
ON CONFLICT ("id") DO NOTHING;

-- 7. Admin Authentication Configuration Table
CREATE TABLE IF NOT EXISTS "admin_auth" (
  "id" INTEGER PRIMARY KEY DEFAULT 1,
  "password" TEXT NOT NULL,
  CONSTRAINT "only_one_auth_row" CHECK ("id" = 1)
);

-- Insert default admin password (4867)
INSERT INTO "admin_auth" ("id", "password")
VALUES (1, '4867')
ON CONFLICT ("id") DO UPDATE SET "password" = EXCLUDED."password";

-- 8. Secure Admin Password Verification Function (RPC)
CREATE OR REPLACE FUNCTION verify_admin_password(input_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  password_matches BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM "admin_auth" WHERE "password" = input_password
  ) INTO password_matches;
  
  RETURN password_matches;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Announcement Settings Table
CREATE TABLE IF NOT EXISTS "announcement_settings" (
  "id" INTEGER PRIMARY KEY DEFAULT 1,
  "enabled" BOOLEAN DEFAULT true,
  "text" TEXT NOT NULL,
  "bgGradientStart" TEXT DEFAULT '#064e3b',
  "bgGradientEnd" TEXT DEFAULT '#10b981',
  "textColor" TEXT DEFAULT '#ecfdf5',
  CONSTRAINT "only_one_announcement" CHECK ("id" = 1)
);

-- Seed announcement settings
INSERT INTO "announcement_settings" ("id", "enabled", "text", "bgGradientStart", "bgGradientEnd", "textColor")
VALUES (1, true, '🔥 Get the High-Protein Cookbook for $11.99 on Gumroad — or unlock it FREE by installing our featured app. Click here to learn more →', '#453416', '#c5a059', '#fefcf0')
ON CONFLICT ("id") DO NOTHING;

-- 10. Media Gallery Table
CREATE TABLE IF NOT EXISTS "media_gallery" (
  "id" TEXT PRIMARY KEY,
  "url" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL
);

-- 11. Disable Row Level Security (RLS) to allow public CRUD access from frontend Anon key
ALTER TABLE "posts" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "seo_configs" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "tracking_settings" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "robots_config" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "leads" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "admin_auth" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "announcement_settings" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "media_gallery" DISABLE ROW LEVEL SECURITY;

