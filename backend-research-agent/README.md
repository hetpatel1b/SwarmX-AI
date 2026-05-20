# Backend Research Agent

Beginner-friendly Node.js and Express backend for a Groq-powered AI Research Agent Swarm.

The current backend exposes one research endpoint and is structured so future agents, tool calling, memory, vector databases, web scraping, and orchestration can be added without flattening the codebase.

## Tech Stack

- Node.js
- Express.js
- dotenv
- Groq SDK
- ES Modules
- nodemon for local development

## Folder Structure

```text
backend-research-agent/
|-- src/
|   |-- config/
|   |   `-- groq.js
|   |-- agents/
|   |   `-- researchAgent.js
|   |-- routes/
|   |   `-- researchRoutes.js
|   |-- controllers/
|   |   `-- researchController.js
|   |-- services/
|   |   `-- researchService.js
|   |-- middleware/
|   |   `-- errorMiddleware.js
|   |-- utils/
|   |   `-- logger.js
|   `-- app.js
|-- server.js
|-- .env
|-- .env.example
|-- package.json
|-- README.md
`-- .gitignore
```

## Important Files

- `server.js` starts the HTTP server and handles process-level crashes.
- `src/app.js` creates the Express app, registers middleware, routes, health checks, and error handling.
- `src/config/groq.js` loads environment variables and creates the official Groq SDK client.
- `src/services/researchService.js` is the Groq service layer. Keep API calls here.
- `src/agents/researchAgent.js` owns the research prompt and can evolve into a larger agent.
- `src/controllers/researchController.js` validates API input and formats API responses.
- `src/routes/researchRoutes.js` maps `/api/research` to the controller.
- `src/middleware/errorMiddleware.js` keeps error responses consistent.
- `src/utils/logger.js` centralizes basic logging.

## Setup

From this folder:

```bash
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Fill in `.env`:

```env
PORT=5000
NODE_ENV=development

GROQ_API_KEY=your-groq-api-key

AI_MODEL=llama-3.3-70b-versatile
AI_TEMPERATURE=0.2
AI_MAX_TOKENS=1200
```

## Run the Backend

Development mode:

```bash
npm run dev
```

Production-style start:

```bash
npm start
```

The API runs at:

```text
http://localhost:5000
```

## Test the API

Health check:

```bash
curl http://localhost:5000/health
```

Research request:

```bash
curl -X POST http://localhost:5000/api/research \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"Explain quantum computing\"}"
```

Expected response shape:

```json
{
  "success": true,
  "data": "AI generated response"
}
```

## Notes for Future Growth

- Add new agents under `src/agents`.
- Add reusable Groq or tool integrations under `src/services`.
- Add memory, vector database, and web-search modules as separate services.
- Add orchestration logic in a dedicated `src/orchestrators` folder when multiple agents need to coordinate.
- Keep controllers thin: validate requests, call agents/services, and return clean responses.
