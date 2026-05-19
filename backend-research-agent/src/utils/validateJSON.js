const REQUIRED_STRING_FIELDS = ["topic", "overview"];
const REQUIRED_ARRAY_FIELDS = [
  "key_points",
  "applications",
  "challenges",
  "statistics",
  "sources"
];

const extractJSON = (value) => {
  const trimmed = String(value || "").trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return trimmed;
  }

  return trimmed.slice(firstBrace, lastBrace + 1);
};

const validateResearchShape = (data) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "Research response must be a JSON object";
  }

  for (const field of REQUIRED_STRING_FIELDS) {
    if (typeof data[field] !== "string" || data[field].trim().length === 0) {
      return `Field "${field}" must be a non-empty string`;
    }
  }

  for (const field of REQUIRED_ARRAY_FIELDS) {
    if (!Array.isArray(data[field])) {
      return `Field "${field}" must be an array`;
    }

    const hasInvalidItem = data[field].some(
      (item) => typeof item !== "string" || item.trim().length === 0
    );

    if (hasInvalidItem) {
      return `Field "${field}" must contain only non-empty strings`;
    }
  }

  return null;
};

const parseAndValidateResearchJSON = (rawValue) => {
  try {
    const parsed = JSON.parse(extractJSON(rawValue));
    const validationError = validateResearchShape(parsed);

    if (validationError) {
      const error = new Error(validationError);
      error.name = "InvalidAIJSON";
      error.statusCode = 502;
      throw error;
    }

    return parsed;
  } catch (error) {
    if (error.name === "InvalidAIJSON") {
      throw error;
    }

    const parseError = new Error("AI returned invalid JSON");
    parseError.name = "InvalidAIJSON";
    parseError.statusCode = 502;
    parseError.details = error.message;
    throw parseError;
  }
};

module.exports = {
  parseAndValidateResearchJSON,
  validateResearchShape
};
