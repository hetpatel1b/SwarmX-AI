# Presentation Agent

AI presentation generator using Next.js, Tailwind CSS, Express, Groq, PptxGenJS, and pdf-lib.

This version has no Azure services, no database, no queues, and no external storage. PPTX and PDF files are generated in memory and returned directly to the browser for download.

## Stack

- Frontend: Next.js, React, Tailwind CSS
- Backend: Node.js, Express.js, TypeScript
- AI: Groq API
- PPTX: PptxGenJS
- PDF: pdf-lib
- Storage: none
- Database: none

## Folder Structure

```txt
presentation_Agent/
  backend/
    src/
      config/
      controllers/
      middleware/
      routes/
      services/
      types/
      utils/
  frontend/
    app/
    components/
    lib/
  docs/
    api.md
    architecture.md
    deployment.md
```

## Installation

```bash
npm install
cp .env.example .env
```

Add your Groq key:

```env
GROQ_API_KEY=your_key_here
```

Run the backend:

```bash
npm run dev:backend
```

Run the frontend in another terminal:

```bash
npm run dev:frontend
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev:backend
npm run dev:frontend
npm run build
npm run start
npm run typecheck
npm run lint
```

## API

- `GET /health`
- `POST /api/presentations/generate`
- `POST /api/presentations/export/pptx`
- `POST /api/presentations/export/pdf`
- `POST /api/presentations/generate/pptx`
- `POST /api/presentations/generate/pdf`

See [docs/api.md](docs/api.md) for request and response examples.

## Production Notes

- Set `NODE_ENV=production`.
- Use a strong server-side `GROQ_API_KEY`.
- Keep `FRONTEND_ORIGIN` pinned to your deployed frontend URL.
- Tune `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`, and `REQUEST_BODY_LIMIT` for your expected traffic.
- Run frontend and backend as separate services.

See [docs/deployment.md](docs/deployment.md).
