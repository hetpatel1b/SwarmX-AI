import { useCallback, useState } from "react";

interface ApiMutationState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  execute: () => Promise<T>;
  reset: () => void;
}

export function useApiMutation<T>(request: () => Promise<T>): ApiMutationState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await request();
      setData(result);
      return result;
    } catch (apiError) {
      const message = apiError instanceof Error ? apiError.message : "The API request failed.";
      setError(message);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, [request]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { data, error, isLoading, execute, reset };
}
