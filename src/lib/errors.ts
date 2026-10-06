/** Error carrying an HTTP status; thrown by services and mapped to a JSON response by the route wrapper. */
export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message: string, details?: unknown) => new HttpError(400, "BAD_REQUEST", message, details);
export const unauthorized = (message = "Sessão inválida ou expirada.") => new HttpError(401, "UNAUTHORIZED", message);
export const forbidden = (message = "Sem permissão para esta ação.") => new HttpError(403, "FORBIDDEN", message);
export const notFound = (message = "Recurso não encontrado.") => new HttpError(404, "NOT_FOUND", message);
export const conflict = (message: string) => new HttpError(409, "CONFLICT", message);
export const unprocessable = (message: string, details?: unknown) =>
  new HttpError(422, "VALIDATION_ERROR", message, details);
export const tooManyRequests = (retryAfterSec: number) =>
  new HttpError(429, "RATE_LIMITED", "Demasiados pedidos. Tenta novamente dentro de instantes.", { retryAfterSec });
export const notConfigured = (message: string) => new HttpError(503, "NOT_CONFIGURED", message);
