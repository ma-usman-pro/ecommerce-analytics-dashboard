import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Runs `fetchFn` whenever `deps` change, exposing { data, loading, error,
 * refetch }. Guards against setting state after the component has moved
 * on to a newer request (e.g. filters changed again before the first
 * request resolved) or unmounted.
 */
export function useApiData(fetchFn, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const requestId = useRef(0);

  const run = useCallback(() => {
    const id = ++requestId.current;
    setState((s) => ({ ...s, loading: true, error: null }));

    fetchFn()
      .then((data) => {
        if (id === requestId.current) setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (id === requestId.current) {
          const message =
            err?.response?.data?.message || err?.message || "Something went wrong.";
          setState({ data: null, loading: false, error: message });
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return { ...state, refetch: run };
}
