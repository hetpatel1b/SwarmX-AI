# Architecture

## Principles

- No persistence: no database, object storage, blob storage, cache, or queue.
- Temporary processing only: generated JSON, PPTX, and PDF buffers live for a single request.
- Clear backend boundaries: controllers validate HTTP behavior, services handle AI/export work, middleware handles cross-cutting concerns.
- Direct downloads: binary exports are returned from Express to the frontend as response bodies.

## Backend Flow

```txt
Request
  -> Express route
  -> Zod validation middleware
  -> controller
  -> presentation service
  -> Groq service with retry
  -> export service when needed
  -> JSON or file response
```

## Backend Modules

- `config/`: environment validation.
- `controllers/`: request handlers and schemas.
- `middleware/`: error handling, async handling, validation, rate limiting.
- `routes/`: API route definitions.
- `services/`: Groq generation, theme selection, PPTX/PDF creation.
- `types/`: shared domain types.
- `utils/`: logging, retry, file naming.

## Frontend Flow

The Next.js app submits generation input to the backend, renders the returned presentation JSON locally, then posts that JSON back to export endpoints for direct file downloads.

No generated file is uploaded or saved.
