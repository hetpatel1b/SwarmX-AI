# SwarmX AI Agent Backend

Production-ready Express.js backend with 4 specialized AI agents using Groq API.

## Features

- **Research Agent** - Generates detailed research on any topic
- **Summarize Agent** - Creates concise summaries from text
- **Fact Check Agent** - Verifies claims and provides confidence scores
- **Insight Agent** - Generates trends, predictions, and recommendations
- **Pipeline** - Chains all 4 agents: Research → Summarize → Fact Check → Insight

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Add your GROQ_API_KEY to .env

# Start server
npm start
```

Server runs on `http://localhost:5000`

## API Endpoints

### Individual Agents
- `POST /api/research` - Research generation
  ```json
  {"query": "What is machine learning?"}
  ```

- `POST /api/summarize` - Text summarization
  ```json
  {"rawText": "Long text to summarize..."}
  ```

- `POST /api/factcheck` - Fact verification
  ```json
  {"claim": "Claim to verify"}
  ```

- `POST /api/insights` - Insight analysis
  ```json
  {
    "rawText": "text",
    "summary": "summary",
    "keyInsights": ["insight1"],
    "conclusion": "conclusion",
    "verifiedFacts": ["fact1"],
    "trustScore": 0.85
  }
  ```

### Pipeline
- `POST /api/pipeline` - All agents chained
  ```json
  {"query": "What is artificial intelligence?"}
  ```

### Health
- `GET /health` - Health check

## Testing

```bash
# Run all 13 tests
node test-all.js

# Run bash endpoint tests
bash test-endpoints.sh
```

**Expected:** All tests passing ✅

## Environment Variables

```env
GROQ_API_KEY=your_groq_api_key_here
AI_MODEL=llama-3.3-70b-versatile
AI_TEMPERATURE=0.2
AI_MAX_TOKENS=1200
NODE_ENV=development
PORT=5000
LOG_LEVEL=info
```

Get `GROQ_API_KEY` from: https://console.groq.com

## Deployment

### Render.com (Recommended)

1. Push code to GitHub
2. Connect repo to Render
3. Set environment variables in Render dashboard
4. Deploy!

### Other Platforms
- **Heroku** - `git push heroku main`
- **Railway** - Auto-deploy from GitHub
- **AWS** - EC2 or Elastic Beanstalk
- **DigitalOcean** - SSH and npm start

## Project Structure

```
backend/
├── agents/           # AI agent implementations
├── routes/           # Express route handlers
├── config/           # Configuration (Groq)
├── middleware/       # Express middleware
├── services/         # Business logic
├── utils/            # Helper functions
├── app.js            # Express app setup
├── server.js         # Server entry point
├── test-all.js       # Test suite
└── .env              # Environment variables
```

## Tech Stack

- **Framework**: Express.js
- **AI Provider**: Groq (llama-3.3-70b-versatile)
- **Runtime**: Node.js 18+
- **Language**: JavaScript (ES Modules)

## Error Handling

All endpoints return consistent JSON responses:

**Success:**
```json
{
  "success": true,
  "data": {...}
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "name": "ErrorType",
    "message": "Description"
  }
}
```

## Security

- ✅ API keys stored in `.env` (never committed)
- ✅ CORS enabled for cross-origin requests
- ✅ Input validation on all endpoints
- ✅ Error messages don't expose internals

## Performance

- Health check: < 10ms
- Research generation: ~2-5 seconds
- Summarization: ~2-3 seconds
- All validation: < 5ms

## Development

```bash
# Start with auto-reload
npm run dev

# Run tests
node test-all.js

# Format code
npm run lint
```

## Support

For issues or questions:
1. Check logs: `npm start` output
2. Test endpoints: `bash test-endpoints.sh`
3. Review errors in server logs

## License

MIT
```json
{
  "success": true,
  "data": "Research content..."
}
```

---

### 2. **Summarizer Agent**
- Uses Azure AI for text summarization
- Extracts key insights and conclusions
- Returns structured JSON responses

**Endpoint:** `POST /api/summarize`

**Request Body:**
```json
{
  "rawText": "Long text to summarize..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": "Concise summary...",
    "keyInsights": ["insight1", "insight2", ...],
    "conclusion": "Key takeaway..."
  }
}
```

---

### 3. **Insight Agent**
- Analyzes research summaries and verified facts
- Generates trends, predictions, patterns, and recommendations
- Synthesizes findings from multiple sources

**Endpoint:** `POST /api/insights`

**Request Body:**
```json
{
  "rawText": "Original text...",
  "summary": "Summary from summarizer agent...",
  "keyInsights": ["insight1", "insight2", ...],
  "conclusion": "Conclusion...",
  "verifiedFacts": ["fact1", "fact2", ...],
  "trustScore": 0.95
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "trends": ["trend1", "trend2", ...],
    "predictions": ["prediction1", ...],
    "patterns": ["pattern1", ...],
    "recommendations": ["rec1", ...],
    "overallAnalysis": "Analysis summary..."
  }
}
```

---

### 4. **Fact-Check Agent**
- Verifies factual claims
- Returns confidence scores
- Provides source citations

**Endpoint:** `POST /api/factcheck`

**Request Body:**
```json
{
  "claim": "Statement to fact-check...",
  "context": "Optional context..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "claim": "Verified claim...",
    "verification": "VERIFIED|DISPUTED|UNCERTAIN",
    "confidenceScore": 0.85,
    "sources": ["source1", "source2", ...],
    "timestamp": "2026-05-26T..."
  }
}
```

---

### 5. **Health Check**
**Endpoint:** `GET /health`

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "unified-backend",
    "timestamp": "2026-05-26T..."
  }
}
```

---

## Setup Instructions

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn
- API Keys for:
  - Groq API (for Research Agent)
  - Azure AI (for Summarizer & Insight Agents)

### Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   # Copy the example .env file
   cp .env.example .env
   
   # Edit .env with your API keys
   nano .env
   ```

4. **Set required environment variables:**
   ```bash
   # GROQ Configuration
   export GROQ_API_KEY=your_groq_api_key
   export AI_MODEL=mixtral-8x7b-32768
   
   # Azure AI Configuration
   export AZURE_ENDPOINT=https://your-endpoint.openai.azure.com/
   export GITHUB_TOKEN=your_github_token
   export PHI_MODEL=phi
   ```

### Running the Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will start on port `5000` (configurable via `PORT` env variable).

---

## API Request Examples

### Research
```bash
curl -X POST http://localhost:5000/api/research \
  -H "Content-Type: application/json" \
  -d '{"query": "What is AI?"}'
```

### Summarize
```bash
curl -X POST http://localhost:5000/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"rawText": "Long text here..."}'
```

### Generate Insights
```bash
curl -X POST http://localhost:5000/api/insights \
  -H "Content-Type: application/json" \
  -d '{
    "rawText": "...",
    "summary": "...",
    "keyInsights": [...],
    "conclusion": "...",
    "verifiedFacts": [...],
    "trustScore": 0.9
  }'
```

### Fact Check
```bash
curl -X POST http://localhost:5000/api/factcheck \
  -H "Content-Type: application/json" \
  -d '{"claim": "Statement to verify..."}'
```

### Health Check
```bash
curl http://localhost:5000/health
```

---

## Environment Configuration

The `.env` file supports the following variables:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `5000` | No |
| `NODE_ENV` | Environment (development/production) | `development` | No |
| `GROQ_API_KEY` | Groq API key for research agent | - | Yes |
| `AI_MODEL` | Groq model to use | `mixtral-8x7b-32768` | Yes |
| `AI_TEMPERATURE` | Model temperature (0-1) | `0.2` | No |
| `AI_MAX_TOKENS` | Max tokens in response | `1200` | No |
| `AZURE_ENDPOINT` | Azure AI endpoint URL | - | Yes |
| `GITHUB_TOKEN` | GitHub token for Azure auth | - | Yes |
| `PHI_MODEL` | Azure model name | `phi` | Yes |

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "name": "ErrorType",
    "message": "Error description"
  }
}
```

HTTP Status Codes:
- `200`: Success
- `400`: Bad request (validation error)
- `404`: Endpoint not found
- `500`: Server error
- `502`: External service error (e.g., Groq/Azure failure)

---

## Middleware & Error Handling

### Error Middleware
- Catches all unhandled errors
- Masks sensitive errors in production
- Returns consistent JSON responses

### CORS
- Enabled by default
- Allows requests from all origins (configurable)

### Request Size Limit
- Maximum JSON payload: 1MB

---

## Development Tips

### Adding a New Agent

1. Create the agent file in `agents/`
2. Create the route file in `routes/`
3. Import the route in `app.js`
4. Add the service if needed in `services/`
5. Update this README with API documentation

### Debugging

Enable detailed logging:
```bash
DEBUG=true npm run dev
```

Check logs in the console output.

---

## Project Structure Explanation

| Directory | Purpose |
|-----------|---------|
| `agents/` | Agent implementations (research, summary, insights, fact-check) |
| `routes/` | Express route handlers for each agent |
| `services/` | Reusable service functions (e.g., Groq API calls) |
| `middleware/` | Express middleware (error handling, CORS, etc.) |
| `config/` | Configuration files (API clients, env setup) |
| `utils/` | Utility functions (logger, helpers) |
| Root | `app.js` (Express setup), `server.js` (Entry point) |

---

## Performance Optimization

- Response streaming for large text payloads
- Request validation before processing
- Error handling prevents cascading failures
- Configurable token limits and temperature for cost control

---

## Troubleshooting

### GROQ_API_KEY not set
**Error:** `GROQ_API_KEY is required`
**Solution:** Add your Groq API key to `.env` file

### Azure endpoint not configured
**Error:** `GITHUB_TOKEN environment variable is not set`
**Solution:** Set `GITHUB_TOKEN` and `AZURE_ENDPOINT` in `.env`

### Port already in use
**Error:** `EADDRINUSE: address already in use :::5000`
**Solution:** Change port: `PORT=5001 npm start`

---

## License
MIT

## Author
SwarmX-AI

---

## Support
For issues or questions, please refer to the individual agent documentation or create an issue in the repository.
