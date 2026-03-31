import { useEffect, useState } from "react";

type AsyncDataState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
};

export function useAsyncData<T>(
  load: () => Promise<T>,
  deps: readonly unknown[],
  enabled = true
): AsyncDataState<T> {
  const [state, setState] = useState<AsyncDataState<T>>({
    data: null,
    error: null,
    loading: enabled
  });

  useEffect(() => {
    if (!enabled) {
      setState({
        data: null,
        error: null,
        loading: false
      });
      return;
    }

    let cancelled = false;

    setState((current) => ({
      data: current.data,
      error: null,
      loading: true
    }));

    void load()
      .then((data) => {
        if (cancelled) {
          return;
        }

        setState({
          data,
          error: null,
          loading: false
        });
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        setState({
          data: null,
          error: error instanceof Error ? error.message : "Request failed.",
          loading: false
        });
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, ...deps]);

  return state;
}
