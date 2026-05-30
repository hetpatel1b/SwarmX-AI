# Deployment Guide

## Required Environment

Backend:

```env
NODE_ENV=production
PORT=4000
FRONTEND_ORIGIN=https://your-frontend.example.com
GROQ_API_KEY=your_groq_key
GROQ_MODEL=llama-3.3-70b-versatile
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=60
REQUEST_BODY_LIMIT=2mb
```

Frontend:

```env
NEXT_PUBLIC_API_URL=https://your-api.example.com
```

## Build

```bash
npm install
npm run build
```

## Start Backend

```bash
npm run start --workspace backend
```

## Start Frontend

```bash
npm run start --workspace frontend
```

## Platform Notes

- Deploy `backend/` and `frontend/` as separate services.
- Do not attach managed databases, Redis, blob buckets, or persistent disks.
- Keep the Groq key only on the backend service.
- Configure HTTPS and a reverse proxy or platform routing in front of both services.
- Set memory limits high enough for concurrent PPTX/PDF generation.
- Keep request body limits conservative because source material is processed synchronously.

## Production Checklist

- `GROQ_API_KEY` is set.
- `FRONTEND_ORIGIN` exactly matches the frontend domain.
- `NEXT_PUBLIC_API_URL` points to the backend domain.
- Rate limiting is enabled.
- Logs are collected from stdout.
- Health check points to `GET /health`.
