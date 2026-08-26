# Automated Job Fetching Setup Guide

This system automatically fetches jobs from GitHub and Dev.to APIs daily and displays them on your portfolio.

---

## **📦 What's Included**

✅ Daily job fetcher (Edge Function)
✅ GitHub Jobs API integration
✅ Dev.to Jobs API integration
✅ Automatic deduplication
✅ Database migration
✅ Frontend badges for auto-fetched jobs
✅ Cron job scheduling (runs at 2 AM UTC daily)

---

## **🚀 Setup Steps**

### **Step 1: Run Database Migration**

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project → **SQL Editor**
3. Copy the contents of `supabase/migrations/add_auto_fetched_jobs.sql`
4. Paste in SQL Editor → Click **Run**

This adds:
- `is_auto_fetched` column (tracks auto-fetched jobs)
- `external_id` column (prevents duplicates)
- `source` column (tracks GitHub, Dev.to, etc.)

---

### **Step 2: Deploy Edge Function**

1. **Install Supabase CLI** (if not already):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Deploy the function**:
   ```bash
   cd supabase/functions
   supabase functions deploy fetch-jobs
   ```

4. **Verify deployment**:
   ```bash
   supabase functions list
   ```
   You should see `fetch-jobs` listed

---

### **Step 3: Set Up Cron Trigger**

1. **Enable pg_cron extension** (Supabase Dashboard):
   - Go to **Database** → **Extensions**
   - Find `pg_cron` → Enable it

2. **Create cron job** in Supabase SQL Editor:
   ```sql
   SELECT cron.schedule(
     'fetch-jobs-daily',
     '0 2 * * *',
     'SELECT net.http_post(
       url:=''https://YOUR_PROJECT.supabase.co/functions/v1/fetch-jobs'',
       headers:=jsonb_build_object(
         ''authorization'', ''Bearer YOUR_ANON_KEY''
       )
     ) AS request_id;'
   );
   ```

   Replace:
   - `YOUR_PROJECT` with your Supabase project ID
   - `YOUR_ANON_KEY` with your anon key from **Settings → API**

---

### **Step 4: Test It**

1. **Manually trigger** (test in Supabase):
   ```bash
   curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/fetch-jobs \
     -H "Authorization: Bearer YOUR_ANON_KEY"
   ```

2. **Check database**:
   - Go to Supabase → **Table Editor**
   - Open `job_updates` table
   - You should see new jobs with `is_auto_fetched = true`

3. **Check your portfolio**:
   - Visit `/jobs` page
   - New jobs should appear with "Auto" badge

---

## **📊 What Gets Fetched**

| Source | Jobs | Frequency | Fields |
|--------|------|-----------|--------|
| **GitHub** | Remote tech jobs | Daily | Title, Company, Location, URL |
| **Dev.to** | Remote dev jobs | Daily | Title, Author, Location, URL |

---

## **🎛️ Customization**

### **Change Fetch Schedule**

Edit `supabase/functions/fetch-jobs/cron.yaml`:
```yaml
# Run at 9 AM UTC every weekday (Mon-Fri)
schedule: "0 9 * * 1-5"
```

Cron format: `minute hour day month weekday`

### **Add More Job Sources**

Add to `supabase/functions/fetch-jobs/index.ts`:

```typescript
async function fetchMyCustomSource(): Promise<Job[]> {
  // Fetch from your API
  // Return array of jobs with: title, company, location, url, source
}
```

Then add to Promise.all():
```typescript
const [githubJobs, devtoJobs, customJobs] = await Promise.all([
  fetchGitHubJobs(),
  fetchDevToJobs(),
  fetchMyCustomSource(),
]);
```

### **Filter Jobs**

Add filtering logic in edge function before upserting:
```typescript
const filteredJobs = uniqueJobs.filter(job => 
  !job.title.toLowerCase().includes("senior") // exclude senior roles
);
```

---

## **🔍 Monitoring**

### **Check job fetching history**:

1. Supabase Dashboard → **Functions** → `fetch-jobs`
2. Click **Invocations** to see recent runs
3. Check **Logs** for any errors

### **Count auto-fetched jobs**:

```sql
SELECT 
  source,
  COUNT(*) as count
FROM job_updates
WHERE is_auto_fetched = true
GROUP BY source;
```

---

## **⚠️ Limits & Considerations**

- **GitHub Jobs API**: ~1000 jobs/day limit (more than enough)
- **Dev.to API**: Rate limited but generous for public data
- **Duplicates**: Automatically removed (title + company match)
- **Storage**: Each job ~500 bytes, so ~500MB for 1M jobs

---

## **❌ Troubleshooting**

### **No jobs showing up**
1. Check edge function logs in Supabase
2. Verify API keys have `service_role` permissions
3. Check `job_updates` table for data

### **Duplicate jobs**
1. Check `external_id` is unique
2. Re-run migration to ensure indexes exist

### **Cron not running**
1. Verify `pg_cron` extension is enabled
2. Check SQL query syntax
3. Wait for next scheduled time (cron runs at specific times)

---

## **📞 Next Steps**

1. ✅ Run migration
2. ✅ Deploy edge function
3. ✅ Set up cron trigger
4. ✅ Test manually
5. ✅ Monitor for 1 week
6. ✅ Add more sources if needed

**Estimated time: 15 minutes setup + 5 min testing**

---

## **Future Improvements (Tier 2)**

- Add RemoteOK integration
- Smart filtering (exclude junior/senior roles)
- Add location preferences
- Filter by salary range
- Auto-delete stale jobs (older than 30 days)
- Manual job approval workflow

Want to add any of these? Let me know! 🚀
