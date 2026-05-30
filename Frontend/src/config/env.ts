type AppEnvironment = "development" | "production" | "test";
type ThemePreference = "dark" | "light" | "system";

interface FeatureFlags {
  analytics: boolean;
  voiceInput: boolean;
  exports: boolean;
  swarmAnimation: boolean;
}

export interface AppConfig {
  apiBaseUrl: string;
  appName: string;
  environment: AppEnvironment;
  features: FeatureFlags;
  defaultTheme: ThemePreference;
}

interface ValidationResult {
  config: AppConfig;
  errors: string[];
}

const rawEnv = import.meta.env;

const requiredVariables = [
  "VITE_APP_NAME",
  "VITE_APP_ENV",
  "VITE_API_BASE_URL",
  "VITE_ENABLE_ANALYTICS",
  "VITE_ENABLE_VOICE_INPUT",
  "VITE_ENABLE_EXPORTS",
  "VITE_ENABLE_SWARM_ANIMATION",
  "VITE_DEFAULT_THEME"
] as const;

function readRequired(key: (typeof requiredVariables)[number], errors: string[]) {
  const value = rawEnv[key];
  if (value === undefined || value === null || String(value).trim() === "") {
    errors.push(`${key} is required. Add it to Frontend/.env or your deployment environment.`);
    return "";
  }
  return String(value).trim();
}

function parseEnum<T extends string>(key: string, value: string, allowed: readonly T[], errors: string[], fallback: T): T {
  if ((allowed as readonly string[]).includes(value)) return value as T;
  errors.push(`${key} must be one of: ${allowed.join(", ")}.`);
  return fallback;
}

function parseBoolean(key: string, value: string, errors: string[]) {
  if (value === "true") return true;
  if (value === "false") return false;
  errors.push(`${key} must be either true or false.`);
  return false;
}

function parseUrl(key: string, value: string, errors: string[]) {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) {
      errors.push(`${key} must use http or https.`);
    }
    return value.replace(/\/+$/, "");
  } catch {
    errors.push(`${key} must be a valid URL, for example http://localhost:5000.`);
    return value;
  }
}

function validateEnv(): ValidationResult {
  const errors: string[] = [];
  const appName = readRequired("VITE_APP_NAME", errors);
  const environment = parseEnum(
    "VITE_APP_ENV",
    readRequired("VITE_APP_ENV", errors),
    ["development", "production", "test"] as const,
    errors,
    "development"
  );
  const apiBaseUrl = parseUrl("VITE_API_BASE_URL", readRequired("VITE_API_BASE_URL", errors), errors);
  const defaultTheme = parseEnum(
    "VITE_DEFAULT_THEME",
    readRequired("VITE_DEFAULT_THEME", errors),
    ["dark", "light", "system"] as const,
    errors,
    "dark"
  );

  const config: AppConfig = {
    appName,
    environment,
    apiBaseUrl,
    defaultTheme,
    features: {
      analytics: parseBoolean("VITE_ENABLE_ANALYTICS", readRequired("VITE_ENABLE_ANALYTICS", errors), errors),
      voiceInput: parseBoolean("VITE_ENABLE_VOICE_INPUT", readRequired("VITE_ENABLE_VOICE_INPUT", errors), errors),
      exports: parseBoolean("VITE_ENABLE_EXPORTS", readRequired("VITE_ENABLE_EXPORTS", errors), errors),
      swarmAnimation: parseBoolean(
        "VITE_ENABLE_SWARM_ANIMATION",
        readRequired("VITE_ENABLE_SWARM_ANIMATION", errors),
        errors
      )
    }
  };

  return { config, errors };
}

const validation = validateEnv();

export const envValidationErrors = validation.errors;
export const envValidationMessage = validation.errors.join("\n");
export const appConfig = validation.config;
export const { apiBaseUrl, appName, environment, features, defaultTheme } = appConfig;
