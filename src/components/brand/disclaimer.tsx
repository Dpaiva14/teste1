import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DISCLAIMER, FUTURES_LEVERAGE_NOTE } from "@/modules/legal";
import { cn } from "@/lib/utils";

export function Disclaimer({ className, withFutures = false }: { className?: string; withFutures?: boolean }) {
  return (
    <Alert variant="warning" className={className}>
      <AlertTriangle />
      <AlertDescription>
        <p>{DISCLAIMER}</p>
        {withFutures && <p className="mt-2">{FUTURES_LEVERAGE_NOTE}</p>}
      </AlertDescription>
    </Alert>
  );
}

export function DisclaimerFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("border-t px-4 py-5 text-xs leading-relaxed text-muted-foreground", className)}>
      <p className="mx-auto max-w-5xl">{DISCLAIMER}</p>
    </footer>
  );
}
