# Monitoring Setup Guide (100-1k Users)

This guide helps you set up production monitoring for your portfolio.

---

## **1️⃣ Vercel Analytics (Built-in)**

### Enable Vercel Analytics:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → **Settings** → **Analytics**
3. Click **Enable Web Analytics**
4. Done! ✅

### What it tracks:
- Page load times
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Web Vitals for each page

### View analytics:
- Vercel Dashboard → **Analytics** tab
- Updates in real-time as users visit

---

## **2️⃣ Error Tracking (Sentry)**

### Create Sentry account:
1. Go to [sentry.io](https://sentry.io)
2. Sign up (free tier is fine for 100-1k users)
3. Create new project → Select **React**
4. Copy your **DSN** (looks like: `https://abc123@sentry.io/123456`)

### Add to your project:
1. Create `.env.local` in `frontend/` directory:
   ```
   VITE_SENTRY_DSN=https://your-dsn@sentry.io/your-project-id
   ```

2. Install packages:
   ```bash
   cd frontend
   npm install
   ```

3. Done! ✅ Errors will now be tracked automatically

### Monitor errors:
- Sentry Dashboard → **Issues**
- See all errors, stack traces, and user session info
- Get alerted when errors spike

### Test it (development only):
```javascript
// In browser console:
throw new Error("Test error")
```

---

## **3️⃣ Database Monitoring (Supabase + Custom)**

### A. Supabase Query Logs:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project → **Database** → **Query Logs**
3. You'll see:
   - All queries executed
   - Query duration
   - Connection status

### B. Custom Monitoring (in your app):

Metrics are tracked automatically in `frontend/src/lib/monitoringUtils.js`

**View metrics in browser console:**
```javascript
// Type in browser console (F12):
getMetrics()
```

**Output shows:**
```javascript
{
  dbQueries: {
    count: 45,
    avgTime: "120ms",
    slowQueries: 2
  },
  apiCalls: {
    count: 30,
    avgTime: "250ms", 
    slowCalls: 0
  },
  errors: {
    count: 0,
    recent: []
  }
}
```

---

## **⚠️ Performance Thresholds to Watch**

| Metric | Healthy | Warning | Action |
|--------|---------|---------|--------|
| **Page Load (LCP)** | < 2.5s | > 4s | Optimize images/code |
| **DB Query Avg** | < 200ms | > 1s | Check slow queries |
| **API Response** | < 500ms | > 3s | Add caching |
| **Error Rate** | < 0.1% | > 1% | Investigate errors |
| **Concurrent Users** | < 200 | > 200 | Upgrade plan |

---

## **🚀 Daily Monitoring Checklist**

Every week, check:

- [ ] **Vercel Analytics**: Any spike in page load times?
- [ ] **Sentry**: Any new errors?
- [ ] **Supabase Logs**: Any slow queries (> 1s)?
- [ ] **Console metrics** (`getMetrics()`): API call times normal?

---

## **When to Upgrade (Tier 2)**

Upgrade from Nano to Pro ($25/month) when you see:
- ❌ Database connection errors
- ❌ > 50% of queries taking > 1 second
- ❌ Error rate > 1%
- ⚠️ > 500 concurrent users

**Upgrade Supabase:**
1. Supabase → **Billing** → Select **Pro**
2. Done in 2 minutes, no downtime

---

## **📞 Support**

- **Vercel Issues**: [Vercel Docs](https://vercel.com/docs)
- **Sentry Issues**: [Sentry Docs](https://docs.sentry.io)
- **Supabase Issues**: [Supabase Docs](https://supabase.com/docs)

---

## **Next Steps**

1. ✅ Set up Vercel Analytics (2 min)
2. ✅ Create Sentry account (5 min)
3. ✅ Add `VITE_SENTRY_DSN` to `.env.local` (1 min)
4. ✅ Run `npm install` (2 min)
5. ✅ Deploy to Vercel
6. ✅ Monitor for 1 week
7. ✅ Adjust based on metrics

**Total setup time: ~15 minutes**
