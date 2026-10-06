import { Bot } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/** Shown when no model is configured. Operators (admins) additionally see which variables to set. */
export function AiUnavailable({ isAdmin, feature }: { isAdmin: boolean; feature: string }) {
  return (
    <Alert variant="info">
      <Bot />
      <AlertTitle>{feature} indisponível neste ambiente</AlertTitle>
      <AlertDescription>
        <p>O assistente de IA não está ativo. O resto da plataforma — lições, laboratórios, simulador, glossário — funciona normalmente.</p>
        {isAdmin && (
          <p className="mt-2 text-xs">
            Administrador: define <code>ANTHROPIC_API_KEY</code> e <code>AI_MODEL</code> nas variáveis de ambiente do servidor e reinicia. A chave nunca é enviada para o browser.
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}
