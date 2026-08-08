# AI Feature Setup Guide

Complete guide to deploy and use the AI chat feature on your portfolio.

## What's New?

Your portfolio now has an AI chat feature that allows visitors to ask questions about you. The AI will answer based on information from your portfolio.

## Architecture

```
Frontend (React)
    ↓
    ↓ HTTPS
    ↓
Backend (Spring Boot + Google Gemini)
    ↓
    ↓ API Call
    ↓
Google Gemini AI
    ↓
    ↓ Response
    ↓
Display Answer to Visitor
```

## Files Created

### Backend Files
```
backend/
├── src/main/java/com/portfolio/ai/
│   ├── controller/QuestionController.java      (API endpoints)
│   ├── service/PortfolioAiService.java         (AI logic)
│   ├── model/QuestionRequest.java              (Request)
│   └── model/QuestionResponse.java             (Response)
├── src/main/resources/
│   └── application.properties                  (Config)
├── pom.xml                                     (Dependencies)
├── render.yaml                                 (Render config)
├── system.properties                           (Java version)
├── .env                                        (API key)
├── SETUP.md                                    (Local setup)
└── DEPLOY_RENDER.md                            (Deployment guide)
```

### Frontend Files
```
frontend/
├── src/components/PortfolioAiChat.jsx          (Chat component - NEW)
└── .env.example                                (Example env vars - NEW)
```

## Quick Start (Deployment Path)

### Step 1: Get Gemini API Key (5 mins)
1. Visit: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

### Step 2: Push Code to GitHub (5 mins)
```bash
cd portfolio
git add .
git commit -m "Add AI feature"
git push origin main
```

### Step 3: Deploy Backend to Render (10 mins)
1. Go to https://render.com
2. Sign up/Login
3. New Web Service
4. Select your GitHub repo
5. Add settings:
   - Build: `mvn clean install -DskipTests`
   - Start: `java -jar target/portfolio-ai-backend-0.0.1-SNAPSHOT.jar`
6. Add Environment Variable:
   - Key: `GOOGLE_API_KEY`
   - Value: (your Gemini API key)
7. Deploy
8. Copy your Render URL (e.g., `https://portfolio-ai-backend-abc123.onrender.com`)

### Step 4: Update Frontend (5 mins)
1. Create `frontend/.env` file:
   ```
   REACT_APP_BACKEND_URL=https://portfolio-ai-backend-abc123.onrender.com
   ```
2. Update where you use the chat component to include it in your App

### Step 5: Deploy Frontend to Vercel (5 mins)
1. Go to https://vercel.com
2. Import your GitHub repository
3. Deploy
4. Done! 🎉

**Total Time: ~30 minutes**

## Using the Chat Component

### Add to Your Page

In your main App or wherever you want the chat:

```jsx
import PortfolioAiChat from './components/PortfolioAiChat';

export default function App() {
  return (
    <div>
      {/* Your existing components */}
      
      {/* Add the AI Chat */}
      <PortfolioAiChat />
    </div>
  );
}
```

### How It Works

1. Visitor types a question
2. Frontend sends to backend API
3. Backend sends to Google Gemini
4. Gemini generates answer based on your info
5. Answer displayed to visitor

## Customizing AI Responses

The AI's knowledge comes from the `PORTFOLIO_CONTEXT` in your backend service.

**File:** `backend/src/main/java/com/portfolio/ai/service/PortfolioAiService.java`

Edit this section:
```java
private final String PORTFOLIO_CONTEXT = """
    You are an AI assistant representing Vishal Kushwaha...
    // Add your own information here
""";
```

After editing:
1. Commit and push changes
2. Render automatically redeploys

## API Endpoints

### Ask Question
```
POST /api/questions/ask
Body: {"question": "Your question here"}
Response: {"question": "...", "answer": "..."}
```

### Health Check
```
GET /api/questions/health
Response: "Backend is running!"
```

## Testing Deployment

### Test Backend
```bash
curl https://your-render-url/api/questions/health
```

Should respond: `"Backend is running!"`

### Test AI
```bash
curl -X POST https://your-render-url/api/questions/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What technologies do you use?"}'
```

## Costs

- **Render Backend**: Free tier (with spin-down) or $7/month (always-on)
- **Vercel Frontend**: Free
- **Google Gemini API**: Free tier (1 million requests/month)

**Total Cost**: $0-7/month depending on needs

## Troubleshooting

### Backend won't deploy
- Check pom.xml syntax
- Verify GOOGLE_API_KEY is set in Render environment
- Check Render logs for error messages

### Frontend can't reach backend
- Verify backend URL in .env
- Check CORS settings in controller
- Make sure backend is running on Render

### AI not responding well
- Update PORTFOLIO_CONTEXT with better information
- Be specific about your skills and experience
- Redeploy after making changes

## Next Steps

1. ✅ Get Gemini API key
2. ✅ Deploy backend to Render
3. ✅ Update frontend with component
4. ✅ Deploy frontend to Vercel
5. ✅ Test the feature
6. (Optional) Add analytics to track questions
7. (Optional) Add moderation for inappropriate questions

## Need Help?

- Backend setup: See `backend/SETUP.md`
- Deployment: See `backend/DEPLOY_RENDER.md`
- Frontend issues: Check `frontend/.env.example`
- Google Gemini: https://ai.google.dev/

---

**Happy deploying! Your portfolio now has AI! 🚀**
