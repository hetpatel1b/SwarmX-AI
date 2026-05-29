# Insight Agent 🧠

Part of the **5-Agent AI Research System** - Multi-agent framework for comprehensive research analysis.

## **Overview**

The Insight Agent generates deep analytical insights, trends, patterns, and predictions based on summarized research data. It works in conjunction with the **Summarizer Agent**.

### **Agent Dependencies**
- ✅ **Summarizer Agent** (prerequisite) - Generates summary, key insights, conclusion
- 🔗 **Fact Checker Agent** (optional input) - Provides verified facts
- 📊 **Presentation Agent** (downstream) - Consumes insight outputs

---

## **Installation**

```bash
# Install dependencies
npm install

# Install dev dependencies for testing
npm install --save-dev jest supertest
```

### **Environment Setup**

Create `.env` file:

```env
PORT=5002
AZURE_ENDPOINT=https://<your-resource-name>.models.ai.azure.com
GITHUB_TOKEN=<your-github-token>
PHI_MODEL=Phi-3-small-8k-instruct
SUMMARIZER_URL=http://localhost:5001
```

---

## **API Endpoints**

### **1. Individual Insight Generation**
```http
POST /api/insights
Content-Type: application/json

{
  "rawText": "The original text being analyzed",
  "summary": "Summary from Summarizer Agent",
  "keyInsights": ["insight1", "insight2", "insight3"],
  "conclusion": "Conclusion from Summarizer Agent",
  "verifiedFacts": ["fact1", "fact2"],
  "trustScore": 0.85
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "trends": ["trend1", "trend2"],
    "predictions": ["prediction1", "prediction2"],
    "patterns": ["pattern1", "pattern2"],
    "recommendations": ["rec1", "rec2"],
    "overallAnalysis": "Deep synthesis..."
  }
}
```

### **2. Combined Analysis (Summarizer + Insight)**
```http
POST /api/analyze
Content-Type: application/json

{
  "rawText": "The text to analyze",
  "verifiedFacts": ["fact1", "fact2"],
  "trustScore": 0.85
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summarizer": {
      "summary": "...",
      "keyInsights": [...],
      "conclusion": "..."
    },
    "insights": {
      "trends": [...],
      "predictions": [...],
      "patterns": [...],
      "recommendations": [...],
      "overallAnalysis": "..."
    },
    "metadata": {
      "trustScore": 0.85,
      "verifiedFactsCount": 2,
      "processedAt": "2026-05-25T..."
    }
  }
}
```

---

## **Running the Agent**

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start

# Run tests
npm test

# Watch tests (auto-run on file changes)
npm run test:watch
```

---

## **Integration with Other Agents**

### **Workflow Flow** (All 5 Agents)
```
1. Research Agent
   ↓ (outputs raw research data)
2. Summarizer Agent ← Uses input from Research
   ↓ (outputs summary, key insights, conclusion)
3. Fact Checker Agent ← Validates facts from Summarizer
   ↓ (outputs verified facts)
4. Insight Agent ← Uses Summarizer + Fact Checker outputs
   ↓ (outputs trends, predictions, patterns, recommendations)
5. Presentation Agent ← Uses all previous outputs
   ↓ (generates final report/presentation)
```

### **How Insight Agent Connects**

**Input Dependencies:**
- Requires **Summarizer Agent** output (summary, keyInsights, conclusion)
- Optional: **Fact Checker Agent** output (verifiedFacts)
- User input: rawText, trustScore

**Output Usage:**
- Feeds into **Presentation Agent** for final report generation

### **Calling Insight from Other Agents**

```javascript
// Example: From Summarizer Agent
const axios = require('axios');

const summarizerResult = { summary, keyInsights, conclusion };
const response = await axios.post('http://localhost:5002/api/insights', {
  rawText: originalText,
  summary: summarizerResult.summary,
  keyInsights: summarizerResult.keyInsights,
  conclusion: summarizerResult.conclusion,
  verifiedFacts: factCheckerResult.verifiedFacts,
  trustScore: 0.85
});

const insights = response.data.data;
```

---

## **Testing**

Run the complete test suite:

```bash
npm test
```

Test coverage includes:
- ✅ Valid payload handling
- ✅ Missing field validation
- ✅ Type validation
- ✅ Error handling
- ✅ Edge cases (empty arrays, special characters)
- ✅ Integration with mocked Summarizer

---

## **Environment Variables**

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5002) | No |
| `AZURE_ENDPOINT` | Azure AI endpoint URL | Yes |
| `GITHUB_TOKEN` | GitHub token for Azure auth | Yes |
| `PHI_MODEL` | Model name (Phi-3-small-8k-instruct) | Yes |
| `SUMMARIZER_URL` | URL of Summarizer Agent | Yes (for /api/analyze) |

---

## **Troubleshooting**

### **Summarizer connection fails**
- Ensure Summarizer Agent is running on `http://localhost:5001`
- Set `SUMMARIZER_URL` environment variable if on different port

### **Azure API errors**
- Verify `AZURE_ENDPOINT` and `GITHUB_TOKEN` are correct
- Check token has necessary permissions

### **Port conflicts**
- Change PORT in .env (default 5002)
- Or kill existing process: `lsof -i :5002`

---

## **File Descriptions**

| File | Purpose |
|------|---------|
| `server.js` | Express server setup, middleware, route registration |
| `agents/insightAgent.js` | Core insight generation logic, Azure API integration |
| `routes/insight.js` | Individual insight endpoint with validation |
| `routes/analyze.js` | Combined endpoint that chains Summarizer + Insight |
| `routes/*.test.js` | Jest test suites for endpoints |
| `jest.config.js` | Jest testing configuration |
| `package.json` | Dependencies and npm scripts |
| `.env.example` | Template for environment variables |

---

## **Branch Info**

**Branch:** `4-insight`  
**Agent in System:** Insight Agent (Step 4 of 5)  
**Status:** ✅ Production Ready  
**Last Updated:** 2026-05-25

---

## **Next Steps**

1. **For Team Lead:** Merge this into main after all 5 agents are complete
2. **For Presentation Agent:** Use `/api/analyze` endpoint to get complete analysis
3. **For Orchestration:** Create a master service that chains all 5 agents

---

## **Quick Start Example**

```bash
# Terminal 1: Start Summarizer
cd ../summerizer-backend && npm run dev

# Terminal 2: Start Insight
npm run dev

# Terminal 3: Test the combined flow
curl -X POST http://localhost:5002/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "rawText": "Your research text here",
    "verifiedFacts": ["fact1", "fact2"],
    "trustScore": 0.85
  }'
```
