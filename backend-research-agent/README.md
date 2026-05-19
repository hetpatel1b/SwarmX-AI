# Research Agent Backend

Production-style Node.js and Express backend for an Azure OpenAI-powered Research Agent.

This service only implements the Research Agent. It accepts a topic, asks Azure OpenAI for structured research, validates the AI response, and returns clean JSON.

## Folder Structure

```text
backend-research-agent/
├── src/
│   ├── agents/
│   │   └── researchAgent.js
│   ├── services/
│   │   └── aiService.js
│   ├── controllers/
│   │   └── researchController.js
│   ├── routes/
│   │   └── researchRoutes.js
│   ├── utils/
│   │   └── validateJSON.js
│   ├── config/
│   │   └── config.js
│   └── app.js
├── server.js
├── .env.example
├── package.json
└── README.md
```

## Setup

```bash
cd backend-research-agent
npm install
cp .env.example .env
```

Update `.env` with your Azure OpenAI resource values:

```env
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
AZURE_OPENAI_API_KEY=your-azure-openai-api-key
AZURE_OPENAI_DEPLOYMENT_NAME=your-chat-model-deployment-name
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

## Run

```bash
npm run dev
```

or:

```bash
npm start
```

The API runs on `http://localhost:5000` by default.

## Endpoints

### Health Check

```http
GET /health
```

### Create Research

```http
POST /api/research
Content-Type: application/json
```

Request:

```json
{
  "topic": "AI in healthcare"
}
```

Response:

```json
{
  "topic": "AI in healthcare",
  "overview": "...",
  "key_points": ["...", "..."],
  "applications": ["...", "..."],
  "challenges": ["...", "..."],
  "statistics": ["...", "..."],
  "sources": ["...", "..."]
}
```

## Example cURL

```bash
curl -X POST http://localhost:5000/api/research \
  -H "Content-Type: application/json" \
  -d "{\"topic\":\"AI in healthcare\"}"
```

## Error Handling

The service returns:

- `400` for invalid request bodies.
- `404` for unknown routes.
- `502` when Azure OpenAI fails or returns invalid JSON.
- `500` for missing server configuration or unexpected errors.

## Notes

- The agent is designed to return only valid JSON.
- AI output is parsed and validated before being returned to the client.
- `response_format: { "type": "json_object" }` is sent to Azure OpenAI for supported deployments.
