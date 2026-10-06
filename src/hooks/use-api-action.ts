"use client";

import { useCallback, useState } from "react";
import { ApiError, errorMessage } from "@/lib/api-client";

export interface ApiActionState {
  pending: boolean;
  error: string | null;
  fieldErrors: Record<string, string[] | undefined>;
}

/** Wraps an async API call with pending/error/field-error state (used by every form). */
export function useApiAction<TInput, TOutput>(action: (input: TInput) => Promise<TOutput>) {
  const [state, setState] = useState<ApiActionState>({ pending: false, error: null, fieldErrors: {} });

  const run = useCallback(
    async (input: TInput): Promise<TOutput | undefined> => {
      setState({ pending: true, error: null, fieldErrors: {} });
      try {
        const out = await action(input);
        setState({ pending: false, error: null, fieldErrors: {} });
        return out;
      } catch (e) {
        setState({
          pending: false,
          error: errorMessage(e),
          fieldErrors: e instanceof ApiError ? e.fieldErrors : {},
        });
        return undefined;
      }
    },
    [action],
  );

  const reset = useCallback(() => setState({ pending: false, error: null, fieldErrors: {} }), []);
  return { ...state, run, reset };
}
