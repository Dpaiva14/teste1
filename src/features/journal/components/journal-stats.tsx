import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "@/components/ui/line-chart";
import { Stat } from "@/components/ui/stat";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { GroupStats } from "@/features/stats/logic/performance";
import { SESSION_LABEL, type SessionKey } from "@/features/sessions/logic/sessions";
import { formatR, formatUsd } from "@/lib/money";
import { EMOTION_LABEL, MISTAKE_LABEL } from "../schemas";
import type { JournalStatsDTO } from "../types";

const sessionName = (k: string) => SESSION_LABEL[k as SessionKey] ?? k;

function GroupTable({ title, rows, label }: { title: string; rows: GroupStats[]; label: (k: string) => string }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent>
        {rows.length === 0 ? <p className="text-sm text-muted-foreground">Sem dados.</p> : (
          <Table>
            <TableHeader><TableRow><TableHead>{title.replace("Por ", "")}</TableHead><TableHead className="text-right">N</TableHead><TableHead className="text-right">Win%</TableHead><TableHead className="text-right">R médio</TableHead><TableHead className="text-right">P&L</TableHead></TableRow></TableHeader>
            <TableBody>
              {[...rows].sort((a, b) => b.trades - a.trades).map((g) => (
                <TableRow key={g.key}>
                  <TableCell>{label(g.key)}{g.trades < 3 && <span className="ml-1 text-[0.65rem] text-muted-foreground">(amostra pequena)</span>}</TableCell>
                  <TableCell className="text-right tabular">{g.trades}</TableCell>
                  <TableCell className="text-right tabular">{g.winRate}%</TableCell>
                  <TableCell className="text-right tabular">{g.avgR ?? "—"}</TableCell>
                  <TableCell className={`text-right tabular ${g.totalPnl >= 0 ? "text-success" : "text-danger"}`}>{formatUsd(g.totalPnl)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export function JournalStats({ data }: { data: JournalStatsDTO }) {
  const s = data.stats;
  const pick = (g: GroupStats | null, label: (k: string) => string) => (g ? `${label(g.key)} (${g.avgR !== null ? formatR(g.avgR) : formatUsd(g.expectancy)})` : "n.d.");
  const g = data.processVsOutcome;

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Win rate" value={`${s.winRate}%`} hint={`${s.wins} ganhos · ${s.losses} perdas`} />
        <Stat label="Loss rate" value={`${s.lossRate}%`} />
        <Stat label="Ganho médio" value={formatUsd(s.avgWin)} tone="success" />
        <Stat label="Perda média" value={formatUsd(s.avgLoss)} tone="danger" />
        <Stat label="Expectancy" value={formatUsd(s.expectancy)} tone={s.expectancy >= 0 ? "success" : "danger"} hint="por trade" />
        <Stat label="Profit factor" value={s.profitFactor ?? "—"} hint={s.profitFactor === null ? "sem perdas ou sem trades" : undefined} />
        <Stat label="Max drawdown" value={formatUsd(s.maxDrawdown)} tone="warning" hint={s.maxDrawdownR !== null ? `${s.maxDrawdownR}R` : undefined} />
        <Stat label="R médio" value={s.avgR !== null ? formatR(s.avgR) : "—"} />
        <Stat label="Máx. ganhos seguidos" value={s.maxConsecutiveWins} />
        <Stat label="Máx. perdas seguidas" value={s.maxConsecutiveLosses} tone={s.maxConsecutiveLosses >= 5 ? "danger" : "default"} />
      </div>
      {s.trades < 30 && <p className="text-xs text-muted-foreground">Com {s.trades} trade(s) a amostra é pequena: estas métricas descrevem o passado recente, não preveem o futuro.</p>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Melhor setup" value={<span className="text-base">{pick(data.bestSetup, (k) => k)}</span>} hint="mín. 3 trades" />
        <Stat label="Pior setup" value={<span className="text-base">{pick(data.worstSetup, (k) => k)}</span>} hint="mín. 3 trades" />
        <Stat label="Melhor sessão" value={<span className="text-base">{pick(data.bestSession, sessionName)}</span>} hint="mín. 3 trades" />
        <Stat label="Pior sessão" value={<span className="text-base">{pick(data.worstSession, sessionName)}</span>} hint="mín. 3 trades" />
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Curva de resultados acumulados</CardTitle></CardHeader>
        <CardContent><LineChart values={s.equityCurve} baseline={0} height={170} ariaLabel="Resultado acumulado do journal" format={(v) => `$${v}`} /></CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <GroupTable title="Por setup" rows={data.bySetup} label={(k) => k} />
        <GroupTable title="Por sessão" rows={data.bySession} label={sessionName} />
        <GroupTable title="Por estado emocional" rows={data.byEmotion} label={(k) => EMOTION_LABEL[k as keyof typeof EMOTION_LABEL] ?? k} />
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Erros mais frequentes</CardTitle></CardHeader>
          <CardContent>
            {data.mistakes.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum erro registado.</p> : (
              <ul className="grid gap-1.5">
                {data.mistakes.map((m) => (
                  <li key={m.key} className="flex items-center justify-between text-sm"><span>{MISTAKE_LABEL[m.key as keyof typeof MISTAKE_LABEL] ?? m.key}</span><Badge variant="secondary">{m.count}×</Badge></li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Processo vs. resultado</CardTitle>
          <CardDescription>
            Processo médio: {data.avgProcessRating ?? "n.d."}/5 {data.followedPlanPercent !== null && <>· Plano seguido em {data.followedPlanPercent}% dos trades</>}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid grid-cols-2 gap-2 text-center text-sm">
            <div className="rounded-lg border border-success/40 bg-success/10 p-3"><p className="text-2xl font-semibold tabular">{g.goodProcessWin}</p>Bom processo · ganhou</div>
            <div className="rounded-lg border border-primary/40 bg-primary/10 p-3"><p className="text-2xl font-semibold tabular">{g.goodProcessLoss}</p>Bom processo · perdeu <span className="block text-xs text-muted-foreground">(normal — não alterar o plano)</span></div>
            <div className="rounded-lg border border-warning/40 bg-warning/10 p-3"><p className="text-2xl font-semibold tabular">{g.poorProcessWin}</p>Mau processo · ganhou <span className="block text-xs text-muted-foreground">(sorte — perigoso reforçar)</span></div>
            <div className="rounded-lg border border-danger/40 bg-danger/10 p-3"><p className="text-2xl font-semibold tabular">{g.poorProcessLoss}</p>Mau processo · perdeu</div>
          </div>
          <p className="text-xs text-muted-foreground">Bom processo = avaliação 4–5; mau = 1–2. O objetivo não é ganhar sempre: é aumentar os trades em que o processo foi bom.</p>
        </CardContent>
      </Card>

      {data.behavior.totalTrades > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Estatísticas comportamentais (trades do simulador)</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <ul className="list-disc space-y-1 pl-5">{data.behavior.insights.map((i) => <li key={i}>{i}</li>)}</ul>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
              <div><dt className="text-xs text-muted-foreground">Entradas emocionais</dt><dd className="tabular">{data.behavior.emotionalSharePercent}%</dd></div>
              <div><dt className="text-xs text-muted-foreground">Com stop</dt><dd className="tabular">{data.behavior.withStopPercent}%</dd></div>
              <div><dt className="text-xs text-muted-foreground">R:R ≥ 1,5</dt><dd className="tabular">{data.behavior.goodRrPercent}%</dd></div>
              <div><dt className="text-xs text-muted-foreground">Checklist média</dt><dd className="tabular">{data.behavior.avgChecklistPercent ?? "—"}%</dd></div>
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
