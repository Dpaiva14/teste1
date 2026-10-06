import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { getEnv } from "@/lib/env";
import { HttpError, notConfigured } from "@/lib/errors";

/**
 * Anthropic access lives ONLY here, on the server. The API key and the model name come from the environment
 * (ANTHROPIC_API_KEY, AI_MODEL) — there is deliberately no default model, so an operator always chooses one.
 * When either is missing the AI features report "not configured" and the rest of the platform keeps working.
 */
interface Runtime {
  client: Anthropic;
  model: string;
}

let cached: { key: string; runtime: Runtime } | null = null;

function runtime(): Runtime | null {
  const env = getEnv();
  if (!env.ANTHROPIC_API_KEY || !env.AI_MODEL) return null;
  const key = `${env.ANTHROPIC_API_KEY}|${env.AI_MODEL}`;
  if (cached?.key !== key) cached = { key, runtime: { client: new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, timeout: 45_000, maxRetries: 1 }), model: env.AI_MODEL } };
  return cached.runtime;
}

export function aiConfigured(): boolean {
  return runtime() !== null;
}

export function requireAi(): void {
  if (!runtime()) throw notConfigured("O assistente de IA não está ativo neste ambiente.");
}

export interface CompleteInput {
  system: string;
  messages: Anthropic.MessageParam[];
  maxTokens: number;
}

/** One model call. Provider errors are logged server-side and mapped to generic messages (never leak keys/details). */
export async function complete({ system, messages, maxTokens }: CompleteInput): Promise<string> {
  const rt = runtime();
  if (!rt) throw notConfigured("O assistente de IA não está ativo neste ambiente.");
  try {
    const res = await rt.client.messages.create({ model: rt.model, max_tokens: maxTokens, system, messages });
    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    if (!text) throw new HttpError(502, "AI_EMPTY", "O assistente não devolveu resposta. Tenta novamente.");
    return text;
  } catch (e) {
    if (e instanceof HttpError) throw e;
    if (e instanceof Anthropic.APIError) {
      console.error(`[ai] provider error status=${e.status ?? "n/a"} request=${e.requestID ?? "n/a"}`);
      if (e.status === 401 || e.status === 403) throw new HttpError(503, "AI_UNAVAILABLE", "O assistente de IA está indisponível (configuração do serviço).");
      if (e.status === 429 || e.status === 529) throw new HttpError(503, "AI_BUSY", "O assistente está ocupado. Tenta novamente dentro de instantes.");
      if (e.status === 400) throw new HttpError(422, "AI_REJECTED", "O pedido não pôde ser processado (por exemplo, imagem inválida).");
    } else {
      console.error("[ai] unexpected error", e instanceof Error ? e.name : "unknown");
    }
    throw new HttpError(502, "AI_ERROR", "Não foi possível obter resposta do assistente. Tenta novamente.");
  }
}
