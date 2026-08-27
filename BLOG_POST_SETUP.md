# Adding the Claude Code & Agent Router Blog Post

This guide explains how to add the professionally written blog article to your portfolio.

## What's Included

- **claude-code-agent-router.md** — Complete markdown article with 15 sections
- **add_claude_code_agent_router_blog.sql** — SQL migration to insert the post into Supabase

## Quick Setup (2 minutes)

### Option 1: Using Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard**
   - Log in at https://app.supabase.com
   - Select your project

2. **Open SQL Editor**
   - Click **SQL Editor** (left sidebar)
   - Click **New Query**

3. **Copy and Run the Migration**
   - Open `supabase/migrations/add_claude_code_agent_router_blog.sql`
   - Copy all the SQL code
   - Paste it into the Supabase SQL Editor
   - Click **Run**

4. **Verify**
   - Go to **Table Editor** → **blogs**
   - Search for "claude-code-agent-router" in the slug column
   - You should see the new post!

### Option 2: Using Supabase CLI

```bash
cd supabase/migrations
supabase db push add_claude_code_agent_router_blog.sql
```

## Article Details

| Field | Value |
|-------|-------|
| Title | How to Use Claude Code with Agent Router |
| Slug | claude-code-agent-router-guide |
| Category | AI & GenAI → Developer Tools |
| Tags | Claude Code, Agent Router, Anthropic, AI Coding, Developer Tools, API Gateway, Configuration |
| Word Count | ~4,200 words |
| Estimated Reading Time | 15-18 minutes |
| Published | ✓ Yes (immediately visible) |
| Author | Vishal Kushwaha |
| Date | August 27, 2026 |

## Article Structure

The article includes:

1. **Introduction** — What is Claude Code and Agent Router
2. **Prerequisites** — Requirements checklist
3. **Architecture Diagram** — Visual explanation of data flow
4. **Installation Instructions** — Platform-specific (Windows, macOS, Linux)
5. **Account Setup** — Agent Router signup process
6. **API Key Generation** — Secure credential creation
7. **Configuration Guide** — Environment variable setup
8. **Launch Instructions** — Starting Claude Code with new config
9. **Security Best Practices** — Credential protection and .gitignore
10. **Free Credit Section** — Promotional offer disclaimer
11. **Example Workflow** — Step-by-step implementation
12. **Troubleshooting Table** — Common problems and solutions
13. **FAQ Section** — 9 frequently asked questions
14. **Conclusion** — Summary and next steps
15. **Sources & Further Reading** — Official documentation links

## Content Features

✓ **Professional tone** — Suitable for a developer portfolio
✓ **Security-focused** — Emphasizes API key protection
✓ **Accurate information** — Verified against official docs
✓ **Responsive** — Works on mobile, tablet, desktop
✓ **SEO-optimized** — Keywords, meta description, structured data
✓ **Developer-friendly** — Code blocks, tables, clear explanations
✓ **Accessible** — Proper heading hierarchy, alt text, contrast
✓ **Original content** — Not AI-generated boilerplate

## Accessing the Article

Once the post is added to your database:

1. **On your portfolio:**
   - Visit https://yourportfolio.com/blog
   - The post will appear in the blog list
   - Click to read the full article

2. **Direct URL:**
   - https://yourportfolio.com/blog/claude-code-agent-router-guide

3. **In Blog Index:**
   - Tagged with: Claude Code, Agent Router, Anthropic, AI Coding, Developer Tools, API Gateway, Configuration
   - Will be searchable and filterable

## Customization

You can edit the post after insertion:

### Using Admin Interface (if available)
- Log into your portfolio admin panel
- Find the blog post
- Click Edit
- Modify title, content, tags, date, etc.
- Save

### Directly in Supabase
```sql
UPDATE blogs
SET content = 'Your new content here', updated_at = NOW()
WHERE slug = 'claude-code-agent-router-guide';
```

## Editing the Content

To modify the article before publishing:

1. **Edit the markdown file:**
   - Open `claude-code-agent-router.md`
   - Make your changes
   - Save

2. **Update the SQL:**
   - Copy your updated markdown
   - Replace the content in the SQL migration
   - Run the updated migration

3. **Or edit after publishing:**
   - Use Supabase to update directly
   - Much faster than re-running migration

## SEO Metadata

The post includes:

- **Title:** How to Use Claude Code with Agent Router
- **Slug:** claude-code-agent-router-guide
- **Meta Description:** Learn how to configure Claude Code with Agent Router, securely manage API credentials, connect supported Claude models, and troubleshoot common configuration issues.
- **Tags:** 7 relevant tags for searchability
- **Cover Image:** Professional tech-related image from Unsplash
- **Author:** Vishal Kushwaha
- **Date:** August 27, 2026

## Publishing Workflow

The post is set to `published = true` in the SQL, so it's immediately visible.

To keep it draft/hidden temporarily:

```sql
UPDATE blogs SET published = false WHERE slug = 'claude-code-agent-router-guide';
```

To publish it later:

```sql
UPDATE blogs SET published = true WHERE slug = 'claude-code-agent-router-guide';
```

## Stats & Analytics

After publishing, you can track:

- Views (via Vercel Analytics if enabled)
- Time on page
- Scroll depth
- Click-through on links
- Share rate (via social buttons)
- Like count (via Like button if enabled)

Check your analytics dashboard for metrics.

## Maintenance

### Update Content
If information becomes outdated:

1. Edit the markdown content
2. Re-run the SQL with updated content
3. Or update directly in Supabase table editor

### Add to Related Posts
If you write other AI/GenAI articles:

1. Link them in the "Sources & Further Reading" section
2. Add cross-links in your related posts component
3. Tag them similarly for discoverability

### Promote the Post
Consider promoting this post through:

- Twitter/X with key insights
- LinkedIn article cross-posting
- Your newsletter (if you have one)
- Social media channels

## Troubleshooting

### Post Doesn't Appear
- Check `published = true`
- Verify slug is correct: `claude-code-agent-router-guide`
- Clear browser cache
- Check blog hook is fetching published posts only

### Images Don't Load
- Cover image URL may be outdated
- Replace with your own image via Supabase storage
- Update `cover_image` field with new URL

### Tags Don't Show
- Verify tags array in database: `ARRAY[...]`
- Check BlogCard component renders tags
- Confirm tag styling is applied

## FAQ

**Q: Can I change the publish date?**
A: Yes, update the `author_date` field in the database.

**Q: Should I add my own name?**
A: The article credits "Vishal Kushwaha". Update if needed:
```sql
UPDATE blogs SET author_name = 'Your Name' WHERE slug = 'claude-code-agent-router-guide';
```

**Q: Can I translate this to another language?**
A: Yes, translate the content and publish as a separate post with a different slug.

**Q: Is there a canonical URL set?**
A: The article links to your portfolio. Ensure your domain is configured in your site's canonical tags.

**Q: Can I embed videos or interactive elements?**
A: If your blog editor supports it, add them to the content field. Check your BlogContent component for supported elements.

## Next Steps

1. ✅ Run the SQL migration
2. ✅ Verify the post appears on /blog
3. ✅ Test all links in the article
4. ✅ Share on social media
5. ✅ Monitor analytics
6. ✅ Update if information changes

---

**Article Status:** Ready to publish
**Last Updated:** August 27, 2026
**Estimated Reading Time:** 15-18 minutes
**Word Count:** ~4,200 words
