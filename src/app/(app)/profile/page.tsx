import type { Metadata } from "next";
import { Check, Lock } from "lucide-react";
import { prisma } from "@/database/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { rankForXp } from "@/features/gamification/logic/xp";
import { PasswordForm, ProfileForm } from "@/features/profile/components/profile-forms";
import { requireUserPage } from "@/lib/auth/session";
import { ACHIEVEMENTS } from "@/modules/achievements";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Perfil" };

export default async function ProfilePage() {
  const user = await requireUserPage("/profile");
  const [unlocked, db] = await Promise.all([
    prisma.userAchievement.findMany({ where: { userId: user.id }, include: { achievement: { select: { key: true } } } }),
    prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { xp: true, longestStreak: true, createdAt: true } }),
  ]);
  const have = new Map(unlocked.map((u) => [u.achievement.key, u.unlockedAt]));
  const rank = rankForXp(db.xp);
  const categories = [...new Set(ACHIEVEMENTS.map((a) => a.category))];

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Perfil e conquistas</h1>
        <p className="mt-1 text-muted-foreground">Rank <strong>{rank.current.title}</strong> · {db.xp.toLocaleString("pt-PT")} XP · melhor sequência {db.longestStreak} dias · membro desde {db.createdAt.toLocaleDateString("pt-PT")}</p>
        <div className="mt-2 max-w-sm"><Progress value={rank.percent} aria-label="Progresso para o próximo rank" /></div>
      </header>
      <div className="grid gap-5 lg:grid-cols-2">
        <ProfileForm name={user.name} email={user.email} timezone={user.timezone} />
        <PasswordForm hasPassword={user.hasPassword} />
      </div>
      <section className="grid gap-4" aria-labelledby="ach-h">
        <h2 id="ach-h" className="text-xl font-semibold">Conquistas ({have.size}/{ACHIEVEMENTS.length})</h2>
        <p className="text-sm text-muted-foreground">As conquistas premeiam estudo, revisão e disciplina. Nenhuma premeia volume de trades nem lucro.</p>
        {categories.map((c) => (
          <div key={c} className="grid gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{c}</h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {ACHIEVEMENTS.filter((a) => a.category === c).map((a) => {
                const at = have.get(a.key);
                return (
                  <Card key={a.key} className={cn(!at && "opacity-60")}>
                    <CardHeader className="flex-row items-start gap-3 pb-1">
                      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", at ? "bg-success/20 text-success" : "bg-muted text-muted-foreground")}>{at ? <Check className="size-4" /> : <Lock className="size-4" />}</span>
                      <CardTitle className="text-sm leading-snug">{a.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-1 text-xs text-muted-foreground">
                      <p>{a.description}</p>
                      <div className="flex items-center justify-between"><Badge variant="outline">+{a.xpReward} XP</Badge>{at && <span>{at.toLocaleDateString("pt-PT")}</span>}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
