"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { useApiAction } from "@/hooks/use-api-action";
import type { AchievementDef } from "@/modules/achievements";

export function CompleteLessonButton({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const action = useApiAction(() => api<{ xp: number; newAchievements: AchievementDef[] }>(`/api/lessons/${lessonId}/complete`, { method: "POST" }));
  return (
    <Button
      disabled={action.pending}
      onClick={async () => {
        const res = await action.run(undefined);
        if (res) {
          toast.success(`Aula concluída${res.xp ? ` · +${res.xp} XP` : ""}`);
          for (const a of res.newAchievements) toast.success(`Conquista: ${a.title}`);
          router.refresh();
        }
      }}
    >
      {action.pending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} Marcar aula como concluída
    </Button>
  );
}
