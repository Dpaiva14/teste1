/** Browser-side fetch wrapper for the REST API. Throws ApiError with the server's code/message/field errors. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: Record<string, string[] | undefined>;

  constructor(status: number, code: string, message: string, fieldErrors: Record<string, string[] | undefined> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

interface ErrorBody {
  error?: { code?: string; message?: string; details?: { fieldErrors?: Record<string, string[]> } };
}

export async function api<T = unknown>(
  url: string,
  options: { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
  const { method = "GET", body, signal } = options;
  const res = await fetch(url, {
    method,
    signal,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
  });
  if (res.status === 204) return undefined as T;
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON body */
  }
  if (!res.ok) {
    const e = (data as ErrorBody | null)?.error;
    throw new ApiError(res.status, e?.code ?? "ERROR", e?.message ?? "Ocorreu um erro. Tenta novamente.", e?.details?.fieldErrors ?? {});
  }
  return data as T;
}

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Ocorreu um erro inesperado.";
}
