export async function withRetry<T>(
  operation: () => Promise<T>,
  options: { attempts: number; baseDelayMs?: number; shouldRetry?: (error: unknown) => boolean }
): Promise<T> {
  const baseDelayMs = options.baseDelayMs ?? 400;
  let lastError: unknown;

  for (let attempt = 1; attempt <= options.attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const retryable = options.shouldRetry?.(error) ?? true;
      if (!retryable || attempt === options.attempts) break;
      const delay = baseDelayMs * 2 ** (attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
