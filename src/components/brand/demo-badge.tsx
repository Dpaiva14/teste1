import { FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DEMO_NOTICE } from "@/modules/legal";
import { cn } from "@/lib/utils";

/** Must be rendered next to every chart or number that comes from the DEMO market-data provider. */
export function DemoBadge({ className, label = "DEMO DATA" }: { className?: string; label?: string }) {
  return (
    <Badge variant="demo" title={DEMO_NOTICE} className={cn("uppercase", className)}>
      <FlaskConical />
      {label}
    </Badge>
  );
}
