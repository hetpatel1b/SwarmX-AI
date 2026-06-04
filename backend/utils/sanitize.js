/**
 * C-5 FIX: Input sanitization utility to mitigate prompt injection attacks.
 *
 * Strips known prompt injection markers from user-supplied text before it is
 * interpolated into LLM system/user prompts.  This is a defense-in-depth
 * measure — the system prompt boundary is the primary defense, but scrubbing
 * obvious manipulation patterns significantly raises the bar.
 */

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous\s+|prior\s+|above\s+)?instructions?/gi,
  /disregard\s+(all\s+)?(previous\s+|prior\s+|above\s+)?instructions?/gi,
  /forget\s+(all\s+)?(previous\s+|prior\s+|above\s+)?instructions?/gi,
  /override\s+(all\s+)?(previous\s+|prior\s+|above\s+)?instructions?/gi,
  /you\s+are\s+now\s+/gi,
  /act\s+as\s+if\s+/gi,
  /pretend\s+(you\s+are|to\s+be)\s+/gi,
  /new\s+instructions?\s*:/gi,
  /system\s*prompt/gi,
  /\bDAN\b/g,
  /do\s+anything\s+now/gi,
  /jailbreak/gi,
  /reveal\s+(your|the)\s+(system|internal|hidden)/gi
];

/**
 * Sanitize user input destined for an LLM prompt.
 *
 * @param {string}  input     The raw user input.
 * @param {number}  maxLength Maximum allowed character length (default 2000).
 * @returns {string} The sanitized input, trimmed and truncated.
 */
export const sanitizeUserInput = (input, maxLength = 2000) => {
  if (typeof input !== "string") {
    return "";
  }

  let sanitized = input.trim().slice(0, maxLength);

  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[filtered]");
  }

  // Strip code fences that could confuse the model's JSON output
  sanitized = sanitized.replace(/```/g, "");

  return sanitized.trim();
};
