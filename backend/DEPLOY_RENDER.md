# Deploy Backend to Render

Complete step-by-step guide to deploy your Spring Boot backend to Render.

## Prerequisites

1. Render account (free) - https://render.com
2. GitHub repository with your code pushed
3. Google Gemini API Key
4. (Optional) GitHub account connected to Render

## Step 1: Push Code to GitHub

Make sure your code is pushed to GitHub:

```bash
cd portfolio
git add .
git commit -m "Add Spring Boot backend with AI integration"
git push origin main
```

Your repository structure should look like:
```
portfolio/
├── frontend/
├── backend/
│   ├── src/
│   ├── pom.xml
│   ├── render.yaml
│   ├── system.properties
│   └── .env (don't commit this!)
└── .gitignore
```

## Step 2: Create Render Account & Connect GitHub

1. Go to https://render.com
2. Sign up (you can use GitHub to sign up)
3. Click on "Dashboard"
4. Click "New +" button → "Web Service"
5. Select "Deploy an existing repository"
6. Connect your GitHub account if not already connected
7. Select your `portfolio` repository

## Step 3: Configure the Service

Fill in these details:

```
Name:                    portfolio-ai-backend
Environment:             Docker (or Java - Render will auto-detect)
Region:                  Select closest to you (e.g., Ohio or Singapore)
Branch:                  main
Build Command:           mvn clean install -DskipTests
Start Command:           java -jar target/portfolio-ai-backend-0.0.1-SNAPSHOT.jar
```

## Step 4: Add Environment Variables

Before creating the service:

1. Click on "Advanced" section
2. Under "Environment Variables", click "Add Environment Variable"
3. Add these variables:

```
Key:   GOOGLE_API_KEY
Value: (paste your Gemini API key here)
```

4. (Optional) Add for production:
```
Key:   ENVIRONMENT
Value: production
```

## Step 5: Choose Plan

- **Free Plan**: Good for testing (but will spin down after inactivity)
- **Paid Plan**: $7/month (always running)

For testing, use **Free**. For production, use **Paid**.

## Step 6: Deploy

1. Click "Create Web Service"
2. Render will start building your backend
3. Watch the logs - this takes 3-5 minutes
4. Once it shows "Live", your backend is deployed! 🎉

## Step 7: Get Your Backend URL

Once deployed, Render gives you a URL like:
```
https://portfolio-ai-backend-abc123.onrender.com
```

Copy this URL - you'll use it in your React frontend.

## Step 8: Test Your Deployed Backend

Open your browser and visit:
```
https://portfolio-ai-backend-abc123.onrender.com/api/questions/health
```

You should see: `"Backend is running!"`

Test the AI endpoint with curl:
```bash
curl -X POST https://portfolio-ai-backend-abc123.onrender.com/api/questions/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"Tell me about yourself"}'
```

## Step 9: Update React Frontend

In your React component, update the API URL:

**Before (localhost):**
```javascript
const response = await fetch('http://localhost:8080/api/questions/ask', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question: userQuestion })
});
```

**After (Render):**
```javascript
const response = await fetch('https://portfolio-ai-backend-abc123.onrender.com/api/questions/ask', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question: userQuestion })
});
```

Or use an environment variable:
```javascript
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://portfolio-ai-backend-abc123.onrender.com';

const response = await fetch(`${BACKEND_URL}/api/questions/ask`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question: userQuestion })
});
```

Then in your `.env` file:
```
REACT_APP_BACKEND_URL=https://portfolio-ai-backend-abc123.onrender.com
```

## Troubleshooting

### Build Failed
- Check Maven dependencies: Run locally `mvn clean install`
- Check pom.xml syntax
- Look at Render logs for error message

### "API key is invalid" Error
- Go to Render Dashboard → Your Service → Environment
- Click "Edit" and verify GOOGLE_API_KEY is correct
- Restart the service after updating

### Service keeps timing out
- Render free tier spins down after 15 minutes of inactivity
- Upgrade to paid plan for 24/7 uptime
- Or add a "ping" from your frontend every 10 minutes

### CORS Error from Frontend
- This is expected - your React frontend origin needs to be whitelisted
- The controller has `@CrossOrigin(origins = "*")` which allows all origins
- For production, replace `"*"` with your actual domain

### Service Won't Start
- Check Java version in system.properties
- Verify pom.xml is correct
- Check build logs in Render dashboard

## Monitoring & Logs

1. Go to Render Dashboard
2. Select your service
3. Click "Logs" tab to see real-time logs
4. Check for errors or warnings

## Updating Your Backend

After making changes to backend:

```bash
cd portfolio
git add backend/
git commit -m "Update backend"
git push origin main
```

Render will automatically detect the push and redeploy! 🚀

## Free Plan Limitations

- Service spins down after 15 minutes of no traffic
- First request takes ~30 seconds (waking up)
- 750 hours per month (be mindful of always-on usage)

**Solution:** Use a tool like UptimeRobot (free) to ping your service every 5 minutes to keep it awake.

## Next Steps

1. ✅ Get Gemini API key
2. ✅ Push code to GitHub
3. ✅ Create service on Render
4. ✅ Add environment variables
5. ✅ Test deployed backend
6. ✅ Update React frontend with backend URL
7. ✅ Deploy React frontend to Vercel
