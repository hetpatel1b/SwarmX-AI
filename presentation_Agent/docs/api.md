# API Documentation

Base URL for local development: `http://localhost:4000`

## Health

```http
GET /health
```

```json
{
  "status": "ok",
  "service": "presentation-agent-backend",
  "storage": "none",
  "database": "none"
}
```

## Generate Presentation JSON

```http
POST /api/presentations/generate
Content-Type: application/json
```

```json
{
  "topic": "AI operating model for a mid-market healthcare company",
  "audience": "C-suite executives",
  "tone": "strategic and practical",
  "slideCount": 8,
  "language": "English",
  "visualStyle": "modern",
  "includeSpeakerNotes": true,
  "includeCharts": true,
  "sourceMaterial": "Optional research notes, facts, outline, or pasted source text."
}
```

Response:

```json
{
  "presentation": {
    "title": "AI Operating Model",
    "summary": "A concise executive overview.",
    "theme": {
      "name": "Modern Teal",
      "background": "F7F3EC",
      "surface": "FFFFFF",
      "primary": "0F766E",
      "secondary": "334155",
      "accent": "E4572E",
      "text": "141414",
      "muted": "64748B",
      "fontFace": "Aptos"
    },
    "slides": []
  }
}
```

## Export Existing Presentation To PPTX

```http
POST /api/presentations/export/pptx
Content-Type: application/json
```

```json
{
  "presentation": {
    "title": "Deck title",
    "summary": "Deck summary",
    "theme": {
      "name": "Modern Teal",
      "background": "F7F3EC",
      "surface": "FFFFFF",
      "primary": "0F766E",
      "secondary": "334155",
      "accent": "E4572E",
      "text": "141414",
      "muted": "64748B",
      "fontFace": "Aptos"
    },
    "slides": [
      {
        "id": "slide-1",
        "layout": "title",
        "title": "Deck title",
        "subtitle": "Subtitle",
        "speakerNotes": "Opening narration."
      }
    ]
  }
}
```

Returns: `application/vnd.openxmlformats-officedocument.presentationml.presentation`

## Export Existing Presentation To PDF

```http
POST /api/presentations/export/pdf
Content-Type: application/json
```

Body matches the PPTX export body.

Returns: `application/pdf`

## Generate And Download Directly

```http
POST /api/presentations/generate/pptx
POST /api/presentations/generate/pdf
```

Body matches `POST /api/presentations/generate`. The backend generates content with Groq, creates the file in memory, and returns the file directly. Nothing is persisted.

## Error Shape

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": {}
  }
}
```
