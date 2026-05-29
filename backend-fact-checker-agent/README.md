# SwarmX-AI Fact Checker Agent Backend

Enterprise-grade AI Fact Checker Agent backend for the SwarmX-AI multi-agent ecosystem. It verifies claims, detects hallucinations, compares trusted sources, ranks credibility, generates citations, and returns structured JSON fact-check reports.

## Architecture

The service follows a clean, modular Express + TypeScript architecture:

- `agents/`: orchestration layer for the 14-step fact-checking pipeline.
- `controllers/`: HTTP request handlers.
- `routes/`: API route definitions.
- `services/`: Groq reasoning, Tavily/Serper search, URL validation, citation, risk, credibility, and confidence services.
- `middleware/`: security, request tracing, validation, logging, rate limiting, JWT, and error handling.
- `configs/`: environment, Groq, Tavily, and Serper client configuration.
- `cache/`: Redis client and cache abstraction.
- `queues/`: BullMQ queue and worker setup.
- `validators/`: Zod schemas for payload validation.
- `docs/`: Swagger UI bootstrap.
- `tests/`: Jest and Supertest coverage.

## Fact-Checking Pipeline

1. Input Processing
2. Claim Extraction
3. Claim Segmentation
4. Trusted Source Discovery
5. Tavily Retrieval and Serper Search Validation
6. Source Validation
7. Cross-source Comparison
8. AI Fact Verification
9. Hallucination Detection
10. Confidence Score Calculation
11. Citation Generation
12. Source Credibility Ranking
13. Risk Analysis
14. Final Structured JSON Response

## Setup

```bash
cd backend-fact-checker-agent
npm install
cp .env.example .env
npm run dev
```

The API starts on `http://localhost:5004` by default.

## Environment Variables

```env
PORT=5004
NODE_ENV=development

GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_TEMPERATURE=0.1
GROQ_MAX_TOKENS=1200

TAVILY_API_KEY=
TAVILY_SEARCH_DEPTH=advanced

SERPER_API_KEY=

JWT_SECRET=

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_ENABLED=true
REDIS_REQUIRED=false
REDIS_CONNECT_TIMEOUT_MS=1500
```

In production, Groq, Tavily, Serper, and JWT values are required by environment validation.
Redis is optional by default. When Redis is unavailable, the API starts normally, disables distributed caching and queue workers, and logs a warning. Set `REDIS_REQUIRED=true` only for deployments that must fail fast without Redis.

## AI and Search Configuration

Create:

- A Groq API key for LLM reasoning and claim extraction.
- A Tavily API key for retrieval-oriented AI search.
- A Serper API key for Google-based search validation.
- Runtime hosting configured with the environment variables above.

The backend uses the official Groq SDK for reasoning and `axios` clients for Tavily and Serper APIs. In development, if provider credentials are not configured, the service uses conservative local fallbacks so endpoints remain testable.

## API Endpoints

- `POST /api/fact-check`: verifies a claim and returns a structured report.
- `POST /api/verify-url`: validates a URL and optionally fact-checks a claim.
- `POST /api/extract-claims`: extracts fact-checkable claims from text.
- `GET /api/health`: liveness check.
- `GET /api/status`: runtime and dependency status.

Swagger UI is available at:

```bash
http://localhost:5004/docs
```

Example request:

```bash
curl -X POST http://localhost:5004/api/fact-check \
  -H "Content-Type: application/json" \
  -d "{\"claim\":\"The Earth orbits the Sun.\"}"
```

Example response shape:

```json
{
  "success": true,
  "claim": "The Earth orbits the Sun.",
  "verification": "mostly_true",
  "confidenceScore": 92,
  "riskLevel": "low",
  "hallucinationDetected": false,
  "analysis": "Evidence-based explanation.",
  "sources": [],
  "citations": [],
  "sourceCredibility": [],
  "processingTime": "231ms",
  "timestamp": "2026-05-20T00:00:00.000Z"
}
```

## Scripts

- `npm run dev`: start development server with hot reload.
- `npm run build`: compile TypeScript to `dist`.
- `npm start`: run compiled production server.
- `npm test`: run Jest/Supertest tests.
- `npm run lint`: run TypeScript type checking.
- `npm run docker:up`: build and run API with Redis through Docker Compose.

## Docker

```bash
docker compose up --build
```

This starts:

- `fact-checker-api` on port `5004`
- `redis` on port `6379`

Redis is not required for local development. Running `npm run dev` without Redis installed still starts the API; cache lookups become no-ops and `includeQueue` requests fall back to the synchronous response.

## Deployment

For production hosting:

1. Build the project with `npm run build`.
2. Configure runtime environment variables.
3. Set startup command to `node dist/server.js` or use `docker/startup.sh`.
4. Deploy with your preferred container or Node.js hosting platform.

The included GitHub Actions workflow type-checks, tests, builds, and validates Docker image creation for changes under `backend-fact-checker-agent`.

## Security

The backend includes:

- Helmet secure headers
- CORS controls
- Express rate limiting
- JWT middleware
- Zod request validation
- Request sanitization
- Centralized error handling
- Production-safe error responses
- Request ID tracing

## Production Notes

- Use a managed secret store for Groq, Tavily, Serper, JWT, and Redis credentials.
- Use managed Redis in production.
- Tune Tavily search depth and Serper query volume for cost, latency, and validation coverage.
- Add private networking for Redis and restrict outbound provider access where your hosting platform supports it.
- Tune rate limits per tenant and authentication plan.
