export async function retry<T>(
  operation: () => Promise<T>,
  attempts = 3,
  delayMs = 250,
  backoff = 2
): Promise<T> {
  let lastError: unknown;
  let delay = delayMs;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= backoff;
    }
  }

  throw lastError;
}
