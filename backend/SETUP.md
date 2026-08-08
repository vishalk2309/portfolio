# Portfolio AI Backend Setup

This is a Spring Boot backend service that uses Google Gemini AI to answer questions about your portfolio.

## Prerequisites

- Java 21 or higher
- Maven 3.6+
- Google Gemini API Key (free)

## Getting Gemini API Key

1. Go to: https://aistudio.google.com/app/apikey
2. Click **"Create API Key"** in the left panel
3. Copy your API key

## Setup Steps

### 1. Configure Environment Variables

Edit the `.env` file in this directory:

```
GOOGLE_API_KEY=your_gemini_api_key_here
```

Replace `your_gemini_api_key_here` with your actual API key from Google.

### 2. Install Dependencies

```bash
mvn clean install
```

### 3. Run the Backend

```bash
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

## API Endpoints

### 1. Ask a Question
- **URL**: `POST /api/questions/ask`
- **Body**:
  ```json
  {
    "question": "What technologies do you use?"
  }
  ```
- **Response**:
  ```json
  {
    "question": "What technologies do you use?",
    "answer": "I use React for frontend, Spring Boot for backend, and PostgreSQL for databases..."
  }
  ```

### 2. Health Check
- **URL**: `GET /api/questions/health`
- **Response**: "Backend is running!"

## Testing with cURL

```bash
curl -X POST http://localhost:8080/api/questions/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"Tell me about yourself"}'
```

## Testing with Postman

1. Create a new POST request
2. URL: `http://localhost:8080/api/questions/ask`
3. Body (raw JSON):
   ```json
   {
     "question": "What is your experience?"
   }
   ```
4. Click Send

## Project Structure

```
src/main/java/com/portfolio/ai/
├── PortfolioAiBackendApplication.java    (Main Spring Boot class)
├── controller/
│   └── QuestionController.java           (REST endpoints)
├── service/
│   └── PortfolioAiService.java           (AI service logic)
└── model/
    ├── QuestionRequest.java              (Request model)
    └── QuestionResponse.java             (Response model)
```

## Configuration

All configurations are in `src/main/resources/application.properties`:

```properties
server.port=8080                          # Backend port
spring.ai.google.generativeai.api-key     # Gemini API key (from .env)
spring.ai.google.generativeai.chat.options.model=gemini-1.5-flash  # Model
```

## Updating Portfolio Information

Edit the `PORTFOLIO_CONTEXT` in `src/main/java/com/portfolio/ai/service/PortfolioAiService.java` to customize the AI's knowledge about you. This string contains all the information the AI uses to answer questions.

## Troubleshooting

### Build Error: "Could not find artifact"
- Run: `mvn clean install -U`
- This forces Maven to download the latest dependencies

### "API key is invalid"
- Check your `.env` file has the correct API key
- Restart the application after changing `.env`

### Port 8080 already in use
- Change `server.port` in `application.properties` to another port (e.g., 8081)

### CORS Error when calling from React
- The controller already has `@CrossOrigin` configured for localhost ports
- For production, update the `origins` parameter in `QuestionController.java`

## Connecting to Frontend

Your React frontend should make requests to `http://localhost:8080/api/questions/ask`:

```javascript
const response = await fetch('http://localhost:8080/api/questions/ask', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question: userQuestion })
});
const data = await response.json();
```

## Next Steps

1. Get your Gemini API key
2. Update `.env` file
3. Run `mvn spring-boot:run`
4. Test with the health endpoint first
5. Create React component to call the API
