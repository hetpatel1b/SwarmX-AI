# SwarmX AI Presentation Agent

This repository contains a refactored Presentation Agent that generates AI slide decks and exports PPTX/PDF files without any database or external storage.

## Current Stack

- Frontend: Next.js, Tailwind CSS
- Backend: Node.js, Express.js, TypeScript
- AI: Groq API
- Presentation export: PptxGenJS
- PDF export: pdf-lib
- Persistence: none

## App Location

```txt
presentation_Agent/
  backend/
  frontend/
  docs/
```

## Quick Start

```bash
cd presentation_Agent
npm install
cp .env.example .env
```

Set `GROQ_API_KEY` in `.env`, then run:

```bash
npm run dev:backend
npm run dev:frontend
```

Frontend: `http://localhost:3000`

Backend: `http://localhost:4000`

## Key Behavior

- Generates slide content with Groq.
- Builds PPTX files in memory.
- Builds PDF files in memory.
- Returns files directly to the frontend for download.
- Does not use MongoDB, Firebase, Cloudinary, Supabase, Azure Blob Storage, CosmosDB, Redis, queues, or any other external storage.

See [presentation_Agent/README.md](presentation_Agent/README.md) for full installation, API, architecture, and deployment details.
