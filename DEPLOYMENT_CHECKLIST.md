# Deployment Checklist - AI Feature

## Before You Start
- [ ] Have your Gemini API key ready
- [ ] Code is in GitHub repository
- [ ] Have Render account (free)
- [ ] Have Vercel account (free)

## Step 1: Prepare Backend (5 minutes)

- [x] Created Spring Boot project structure
- [x] Created REST API Controller
- [x] Created AI Service with Gemini integration
- [x] Created Model classes (Request/Response)
- [x] Created render.yaml for deployment
- [x] Created system.properties for Java version
- [x] Updated pom.xml for production build
- [x] Updated application.properties

**What you need to do:**
- [ ] Get Gemini API Key from https://aistudio.google.com/app/apikey

## Step 2: Push to GitHub (5 minutes)

```bash
cd portfolio
git add .
git commit -m "Add Spring Boot AI backend"
git push origin main
```

- [ ] All backend files pushed
- [ ] All frontend files pushed
- [ ] No sensitive files exposed (API key should NOT be in .env)

## Step 3: Deploy Backend to Render (10 minutes)

1. [ ] Go to https://render.com
2. [ ] Sign in / Create account
3. [ ] Click "New +" → "Web Service"
4. [ ] Select your repository: `portfolio`
5. [ ] Enter service name: `portfolio-ai-backend`
6. [ ] Region: Select closest to you
7. [ ] Build command: `mvn clean install -DskipTests`
8. [ ] Start command: `java -jar target/portfolio-ai-backend-0.0.1-SNAPSHOT.jar`
9. [ ] Click "Advanced"
10. [ ] Add Environment Variable:
    - Key: `GOOGLE_API_KEY`
    - Value: (paste your Gemini API key)
11. [ ] Choose Plan: Free (for testing) or Paid ($7/month)
12. [ ] Click "Create Web Service"
13. [ ] Wait for build to complete (3-5 minutes)
14. [ ] Copy your deployed URL (e.g., `https://portfolio-ai-backend-abc123.onrender.com`)

**Verification:**
- [ ] Backend deployed successfully
- [ ] No build errors in Render logs
- [ ] Render shows "Live" status

## Step 4: Test Backend (2 minutes)

Visit in your browser:
```
https://your-render-url/api/questions/health
```

- [ ] Shows: "Backend is running!"

Test with curl:
```bash
curl -X POST https://your-render-url/api/questions/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"Tell me about yourself"}'
```

- [ ] Returns an answer from Gemini

## Step 5: Update Frontend (5 minutes)

1. [ ] Create `frontend/.env` file with:
   ```
   REACT_APP_BACKEND_URL=https://your-render-url
   ```

2. [ ] Import component in your App:
   ```jsx
   import PortfolioAiChat from './components/PortfolioAiChat';
   ```

3. [ ] Add component to your page:
   ```jsx
   <PortfolioAiChat />
   ```

4. [ ] Test locally:
   ```bash
   cd frontend
   npm start
   ```
   
   - [ ] Component loads
   - [ ] Can type questions
   - [ ] Gets responses from Render backend

## Step 6: Deploy Frontend to Vercel (5 minutes)

1. [ ] Go to https://vercel.com
2. [ ] Sign in with GitHub
3. [ ] Click "New Project"
4. [ ] Select your `portfolio` repository
5. [ ] Framework: React (auto-detected)
6. [ ] Root directory: `frontend`
7. [ ] Add Environment Variables:
   - Key: `REACT_APP_BACKEND_URL`
   - Value: (your Render backend URL)
8. [ ] Click "Deploy"
9. [ ] Wait for deployment (2-3 minutes)

**Verification:**
- [ ] Vercel deployment shows "Ready"
- [ ] You get a URL (e.g., `https://portfolio-xyz.vercel.app`)

## Step 7: Final Testing (5 minutes)

Visit your deployed frontend:
```
https://your-vercel-url
```

- [ ] Portfolio loads
- [ ] AI Chat component visible
- [ ] Can ask questions
- [ ] Gets responses from Gemini
- [ ] Chat history updates
- [ ] No errors in browser console

## Step 8: Update Portfolio Information (Optional)

1. [ ] Edit `backend/src/main/java/com/portfolio/ai/service/PortfolioAiService.java`
2. [ ] Update `PORTFOLIO_CONTEXT` with your real info:
   - [ ] Your actual name
   - [ ] Your skills
   - [ ] Your projects
   - [ ] Your experience
3. [ ] Commit and push:
   ```bash
   git add backend/
   git commit -m "Update portfolio context for AI"
   git push origin main
   ```
4. [ ] Render auto-redeploys within 1 minute

## Step 9: Monitor & Maintain

- [ ] Check Render logs occasionally
- [ ] Monitor free plan usage (750 hours/month)
- [ ] Keep Gemini API key secure
- [ ] Update portfolio info as needed

## Costs Summary

| Service | Cost | Notes |
|---------|------|-------|
| Render Backend | Free or $7/mo | Free tier spins down after 15 min |
| Vercel Frontend | Free | Always-on, no limitations |
| Gemini API | Free | 1M requests/month free |
| **Total** | **$0-7/mo** | Great for portfolio! |

## Common Issues & Solutions

### Backend won't build
- Check pom.xml syntax
- Ensure no uncommitted changes with special characters
- View Render build logs for details

### Frontend can't reach backend
- Verify REACT_APP_BACKEND_URL in Vercel env vars
- Check browser console for CORS errors
- Make sure backend URL doesn't have trailing slash

### AI responses are generic
- Update PORTFOLIO_CONTEXT in PortfolioAiService.java
- Be specific about your skills and projects
- Redeploy after making changes

### Free tier backend keeps timing out
- Free tier spins down after 15 minutes
- Use UptimeRobot (free) to keep it awake
- Or upgrade to Paid plan ($7/month)

## Success Checklist

- [x] Backend code created
- [x] Frontend component created
- [x] Deployment config ready
- [ ] Gemini API key obtained
- [ ] Code pushed to GitHub
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] All tests passing
- [ ] Portfolio live with AI feature! 🎉

---

## Need Help?

- Backend Setup: `backend/SETUP.md`
- Deployment Guide: `backend/DEPLOY_RENDER.md`
- Overall Setup: `AI_FEATURE_SETUP.md`
- Gemini API Docs: https://ai.google.dev/
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs

**Ready to deploy? Start with Step 1! 🚀**
