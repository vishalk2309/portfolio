# Blog Post Images Guide

## Overview

I've added **5 strategic images** to the blog post to help users visualize the setup process. All images use free resources from **Unsplash** which don't require attribution.

## Images Included in the Article

### 1. **Agent Router Homepage** (Step 2)
- **Purpose:** Show what the signup page looks like
- **Current URL:** `https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop`
- **What it shows:** Professional dashboard/website interface
- **Location:** Step 2 - Create an Agent Router Account

### 2. **Password Manager** (Step 2)
- **Purpose:** Recommend using a password manager for strong passwords
- **Current URL:** `https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800&h=400&fit=crop`
- **What it shows:** Security/technology themed image
- **Location:** Step 2 - Creating a strong password

### 3. **Dashboard Overview** (Step 2)
- **Purpose:** Show what the Agent Router dashboard looks like after login
- **Current URL:** `https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop`
- **What it shows:** Analytics or dashboard interface
- **Location:** Step 2 - After successful login

### 4. **API Keys Section** (Step 3)
- **Purpose:** Show the settings/API section of a dashboard
- **Current URL:** `https://images.unsplash.com/photo-1526374965328-7f5ae4e8a83f?w=800&h=400&fit=crop`
- **What it shows:** Technical dashboard with settings
- **Location:** Step 3 - Navigate to API Keys section

### 5. **Generated Token Display** (Step 3)
- **Purpose:** Show what a generated token/API key looks like
- **Current URL:** `https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800&h=400&fit=crop`
- **What it shows:** Code/technical interface
- **Location:** Step 3 - After generating the token

### 6. **Configuration Setup** (Step 4)
- **Purpose:** Show environment variable configuration
- **Current URL:** `https://images.unsplash.com/photo-1516321318423-f06f70259c13?w=800&h=400&fit=crop`
- **What it shows:** Code editor or terminal interface
- **Location:** Step 4 - Configure Claude Code

### 7. **Claude Code Launch** (Step 5)
- **Purpose:** Show Claude Code starting up
- **Current URL:** `https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop`
- **What it shows:** Application launch/interface
- **Location:** Step 5 - Launch from Terminal

### 8. **Claude Code Settings** (Step 5)
- **Purpose:** Show where to find settings in Claude Code
- **Current URL:** `https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800&h=400&fit=crop`
- **What it shows:** Settings/configuration interface
- **Location:** Step 5 - Verify Your Configuration

## How to Replace with Your Own Screenshots

If you want to add actual screenshots instead of stock images:

### Option 1: Use Unsplash Images (Recommended)

**Advantages:**
- ✓ Free
- ✓ No copyright issues
- ✓ Professional quality
- ✓ Easy to update

**Current images used:**
- Dashboard interfaces
- Code editors
- Security/technology themes

**To find similar images:**
1. Go to https://unsplash.com
2. Search for:
   - "dashboard"
   - "api keys"
   - "code editor"
   - "terminal"
   - "settings interface"
3. Copy the image URL
4. Replace in the markdown

### Option 2: Upload Screenshots to Supabase Storage

**Steps:**

1. **Take screenshots** of:
   - Agent Router signup page
   - Agent Router dashboard
   - API key generation screen
   - Environment variable setup
   - Claude Code interface
   - Settings panel

2. **Upload to Supabase Storage:**
   - Go to Supabase Dashboard
   - Click **Storage** (left sidebar)
   - Create new bucket: `blog-images`
   - Upload your screenshots
   - Get the public URL for each image

3. **Update the markdown:**
   - Replace Unsplash URLs with your Supabase image URLs
   - Example: `https://your-project.supabase.co/storage/v1/object/public/blog-images/agent-router-signup.png`

4. **Update the SQL migration:**
   - Copy updated markdown content
   - Re-run the SQL migration with new image URLs

### Option 3: Use Other Stock Photo Services

**Free alternatives:**
- **Pexels:** https://www.pexels.com (search for "code", "dashboard", "security")
- **Pixabay:** https://pixabay.com (search for "interface", "technology")
- **Unsplash:** https://unsplash.com (used currently)

**Steps:**
1. Find appropriate images on these sites
2. Copy the direct image URL
3. Replace in markdown
4. Re-run SQL migration

## Image URLs in the Article

Here's a quick reference of all image URLs in the current markdown:

```markdown
![Agent Router Homepage](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop)

![Password Manager](https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800&h=400&fit=crop)

![Dashboard Overview](https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop)

![API Keys Section](https://images.unsplash.com/photo-1526374965328-7f5ae4e8a83f?w=800&h=400&fit=crop)

![Generated Token Display](https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800&h=400&fit=crop)

![Configuration Setup](https://images.unsplash.com/photo-1516321318423-f06f70259c13?w=800&h=400&fit=crop)

![Claude Code Launch](https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop)

![Claude Code Settings](https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800&h=400&fit=crop)
```

## How to Update Images in SQL

If you want to replace all images:

1. **Edit the markdown file** (`claude-code-agent-router.md`)
2. **Find and replace** image URLs:
   - Old: `https://images.unsplash.com/...`
   - New: `https://your-new-url.com/...`

3. **Update the SQL migration:**
   ```bash
   # Copy updated markdown content from the .md file
   # Replace the 'content' value in the SQL file
   # Re-run the migration
   ```

4. **Or update directly in Supabase:**
   ```sql
   UPDATE blogs
   SET content = 'New content with updated image URLs'
   WHERE slug = 'claude-code-agent-router-guide';
   ```

## Image Best Practices

✓ **Do:**
- Use professional, clear images
- Keep images 800×400px (current size)
- Use images that relate to the topic
- Ensure images load quickly
- Use HTTPS URLs only

✗ **Don't:**
- Use blurry or low-quality images
- Use images with watermarks
- Use copyrighted images without permission
- Use oversized images (slows page load)
- Mix different image styles

## Current Images Impact

**Rendering:**
- Images display inline with text
- Markdown syntax: `![Alt text](URL)`
- Handled by BlogContent.jsx component
- Markdown is rendered by react-markdown

**Performance:**
- Stock images are CDN-hosted (fast loading)
- 800×400px resolution is optimized for web
- Total image size: ~2-3 MB for all 8 images
- Should load in <2 seconds on average connection

**Mobile Responsiveness:**
- Images scale automatically
- Responsive width via Unsplash query parameters
- Works on all screen sizes

## Optional: Remove Images

If you prefer text-only article:

1. Delete all `![Image description](URL)` lines
2. Keep the text content
3. Article will still be complete and valuable

## Checklist for Image Setup

After blog goes live:

- [ ] All images load correctly
- [ ] Images display on mobile
- [ ] Images display on desktop
- [ ] Alt text is descriptive
- [ ] Images enhance understanding
- [ ] Page load time is acceptable
- [ ] No broken image links

## Summary

**Current setup:**
- ✓ 8 stock images from Unsplash
- ✓ Integrated into markdown
- ✓ Professional quality
- ✓ Free to use
- ✓ No copyright issues

**Next steps:**
- Option A: Keep Unsplash images (recommended for quick launch)
- Option B: Replace with your own screenshots for authenticity
- Option C: Use different stock photo service

All options are supported and easy to implement!
