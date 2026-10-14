import { useState, useEffect, useCallback } from "react";

interface UseAsyncDataOptions<T> {
  fetchFn: () => Promise<T>;
  dependencies?: React.DependencyList;
  initialData?: T;
  enabled?: boolean;
}

interface UseAsyncDataResult<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | undefined>>;
}

/**
 * Hook genérico para cargar datos asincrónicos.
 * Centraliza loading, error y refetch.
 */
export function useAsyncData<T>({
  fetchFn,
  dependencies = [],
  initialData,
  enabled = true,
}: UseAsyncDataOptions<T>): UseAsyncDataResult<T> {
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err: any) {
      const message =
        err?.response?.data?.error || err?.message || "Error al cargar datos";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    if (enabled) {
      refetch();
    }
  }, dependencies);

  return { data, loading, error, refetch, setData };
}

export default useAsyncData;
