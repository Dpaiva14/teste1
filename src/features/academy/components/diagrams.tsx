import { drawdownAfterLosses } from "@/features/calculators/logic/risk";
import { BRAND } from "@/modules/brand";
import type { DiagramId } from "@/modules/types";

/** Static explanatory diagrams referenced by lessons (`visual: { kind: "diagram", id }`). Server-renderable. */

function CandleAnatomy() {
  const Candle = ({ x, up, label }: { x: number; up: boolean; label: string }) => {
    const col = up ? "var(--candle-up)" : "var(--candle-down)";
    const top = up ? 90 : 70;
    const bottom = up ? 150 : 130;
    return (
      <g>
        <line x1={x} x2={x} y1={40} y2={190} stroke={col} strokeWidth={3} />
        <rect x={x - 22} y={top} width={44} height={bottom - top} fill={col} rx={2} />
        <text x={x} y={215} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--foreground)">
          {label}
        </text>
        <g fontSize={11} fill="var(--muted-foreground)">
          <text x={x + 32} y={46}>High</text>
          <text x={x + 32} y={194}>Low</text>
          <text x={x + 32} y={up ? 94 : 74}>{up ? "Close" : "Open"}</text>
          <text x={x + 32} y={up ? 150 : 134}>{up ? "Open" : "Close"}</text>
          <text x={x - 90} y={up ? 124 : 104}>Corpo</text>
          <text x={x - 112} y={66}>Pavio sup.</text>
          <text x={x - 112} y={176}>Pavio inf.</text>
        </g>
      </g>
    );
  };
  return (
    <svg viewBox="0 0 520 230" role="img" aria-label="Anatomia de um candle: open, high, low, close, corpo e pavios" className="mx-auto h-auto w-full max-w-xl">
      <Candle x={140} up label="Bullish (fecha acima da abertura)" />
      <Candle x={390} up={false} label="Bearish (fecha abaixo da abertura)" />
    </svg>
  );
}

function TimeframesCascade() {
  const steps = [
    { tf: "D1", role: "Contexto e viés", note: "Tendência dominante, níveis maiores" },
    { tf: "H4", role: "Estrutura", note: "Swings e zonas relevantes" },
    { tf: "H1", role: "Zonas de interesse", note: "Suportes, resistências, oferta/procura" },
    { tf: "M15", role: "Refinamento", note: "Confirmação e timing" },
    { tf: "M5", role: "Execução (opcional)", note: "Entrada e gestão de curto prazo" },
  ];
  return (
    <div className="grid gap-2">
      {steps.map((s, i) => (
        <div key={s.tf} className="flex items-stretch gap-3" style={{ marginLeft: `${i * 14}px` }}>
          <div className="flex w-14 shrink-0 items-center justify-center rounded-md bg-primary/15 font-mono text-sm font-semibold text-primary">{s.tf}</div>
          <div className="flex-1 rounded-md border bg-card/60 px-3 py-2">
            <p className="text-sm font-medium">{s.role}</p>
            <p className="text-xs text-muted-foreground">{s.note}</p>
          </div>
        </div>
      ))}
      <p className="mt-1 text-xs text-muted-foreground">Esta é uma sequência de exemplo — <strong>não uma regra universal</strong>. Escolhe combinações coerentes com o teu estilo e testa-as.</p>
    </div>
  );
}

function ConfluenceStack() {
  const items = ["Alinhamento de tendência", "Market structure", "Suporte / Resistência", "Oferta / Procura", "Fibonacci", "Confirmação de price action", "Contexto de liquidez", "Risk/Reward aceitável"];
  return (
    <div className="mx-auto grid max-w-md gap-1.5">
      {items.map((it, i) => (
        <div key={it} className="flex items-center justify-between rounded-md border bg-card/60 px-3 py-2 text-sm" style={{ borderLeft: "3px solid var(--primary)", marginLeft: `${(i % 2) * 6}px` }}>
          <span>{it}</span>
          <span className="font-mono text-xs text-primary">+1</span>
        </div>
      ))}
      <div className="mt-1 flex items-center justify-between rounded-md bg-primary/15 px-3 py-2 text-sm font-semibold">
        <span>Confluence Score</span>
        <span className="font-mono">0 – 8</span>
      </div>
      <p className="text-xs text-muted-foreground">O score é uma ferramenta de reflexão. <strong>8/8 não significa trade garantido</strong>; 3/8 não significa que seja impossível.</p>
    </div>
  );
}

function SessionTimeline() {
  const bands = [
    { name: "Ásia", from: 0, to: 8, cls: "bg-info/25 text-info" },
    { name: "Londres", from: 7, to: 16, cls: "bg-warning/25 text-warning" },
    { name: "Nova Iorque", from: 13, to: 22, cls: "bg-success/25 text-success" },
  ];
  return (
    <div className="grid gap-3">
      <div className="relative h-24 rounded-md border bg-card/60">
        {bands.map((b, i) => (
          <div key={b.name} className={`absolute flex items-center justify-center rounded text-xs font-semibold ${b.cls}`} style={{ left: `${(b.from / 24) * 100}%`, width: `${((b.to - b.from) / 24) * 100}%`, top: `${6 + i * 28}px`, height: "24px" }}>
            {b.name}
          </div>
        ))}
        <div className="absolute inset-y-0 border-l border-dashed border-foreground/40" style={{ left: `${(13.5 / 24) * 100}%` }} title="Abertura do cash market dos EUA (~13:30 UTC no verão)" />
      </div>
      <div className="flex justify-between font-mono text-[0.65rem] text-muted-foreground">
        {[0, 4, 8, 12, 16, 20, 24].map((h) => <span key={h}>{String(h).padStart(2, "0")}h</span>)}
      </div>
      <p className="text-xs text-muted-foreground">Horas em UTC, aproximadas. A linha tracejada marca a abertura do cash market dos EUA (09:30 em Nova Iorque; o equivalente UTC muda com o horário de verão). Usa o <strong>relógio de sessões</strong> para o teu fuso horário.</p>
    </div>
  );
}

function FuturesVsCfd() {
  const rows: [string, string, string][] = [
    ["Local", "OTC (broker)", "Bolsa CME/CBOT"],
    ["Valor por ponto", "Depende do broker", "YM $5 · MYM $0,50"],
    ["Custos", "Spread (+ swap)", "Spread de mercado + comissões + taxas"],
    ["Vencimento", "Normalmente não tem", "Trimestral (rollover)"],
    ["Contraparte", "Broker", "Câmara de compensação"],
  ];
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
          <tr><th className="p-2 text-left" /><th className="p-2 text-left">CFD US30</th><th className="p-2 text-left">Futuros YM / MYM</th></tr>
        </thead>
        <tbody>
          {rows.map(([k, a, b]) => (
            <tr key={k} className="border-t"><td className="p-2 font-medium">{k}</td><td className="p-2">{a}</td><td className="p-2">{b}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RiskLadder() {
  const rows = [1, 2, 5, 10].map((risk) => ({ risk, ...drawdownAfterLosses(risk, 10) }));
  return (
    <div className="grid gap-3">
      <p className="text-sm text-muted-foreground">Estado da conta após <strong>10 perdas seguidas</strong>, arriscando uma percentagem fixa do saldo atual:</p>
      {rows.map((r) => (
        <div key={r.risk} className="grid gap-1">
          <div className="flex justify-between text-xs"><span>Risco {r.risk}% por trade</span><span className="tabular">Fica com {r.remainingPercent}% · precisa de +{r.recoveryNeededPercent}% para recuperar</span></div>
          <div className="h-3 overflow-hidden rounded-full bg-danger/25">
            <div className="h-full rounded-full bg-primary" style={{ width: `${r.remainingPercent}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProcessLoop() {
  const steps = [
    { label: "ANTES do trade", q: BRAND.beforeTrade },
    { label: "DURANTE o trade", q: BRAND.duringTrade },
    { label: "DEPOIS do trade", q: BRAND.afterTrade },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {steps.map((s, i) => (
        <div key={s.label} className="relative rounded-lg border bg-card/60 p-4">
          <span className="absolute -top-2 left-3 rounded bg-primary px-1.5 text-[0.65rem] font-semibold text-primary-foreground">{i + 1}</span>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{s.label}</p>
          <p className="mt-2 text-sm">“{s.q}”</p>
        </div>
      ))}
    </div>
  );
}

const DIAGRAMS: Record<DiagramId, () => React.JSX.Element> = {
  "candle-anatomy": CandleAnatomy,
  "timeframes-cascade": TimeframesCascade,
  "confluence-stack": ConfluenceStack,
  "session-timeline": SessionTimeline,
  "futures-vs-cfd": FuturesVsCfd,
  "risk-ladder": RiskLadder,
  "process-loop": ProcessLoop,
};

export function Diagram({ id }: { id: DiagramId }) {
  const C = DIAGRAMS[id];
  return <C />;
}

export const DIAGRAM_IDS = Object.keys(DIAGRAMS) as DiagramId[];
