export interface ReflectionInput {
  outcome: "WIN" | "LOSS" | "TIMEOUT" | "NO_TRADE";
  reason: string | null;
  rulesMet: number | null;
  rulesTotal: number | null;
}

export interface Reflection {
  /** quality of the PROCESS, independent of the result */
  process: "solid" | "weak" | "unknown";
  title: string;
  text: string;
}

const EMOTIONAL = new Set(["FOMO", "REVENGE", "BOREDOM", "FEAR_OF_MISSING_MOVE"]);

/**
 * Pairs the outcome with the quality of the process. A good outcome does not validate a bad process and a bad
 * outcome does not condemn a good one — this is the core lesson of the lab, so every closed trade shows it.
 */
export function reflect(d: ReflectionInput): Reflection | null {
  if (d.outcome === "NO_TRADE") return null;
  const emotional = d.reason !== null && EMOTIONAL.has(d.reason);
  const hasRules = d.rulesTotal !== null && d.rulesTotal > 0 && d.rulesMet !== null;
  const complete = hasRules && d.rulesMet === d.rulesTotal;
  const process: Reflection["process"] = emotional || (hasRules && !complete) ? "weak" : complete ? "solid" : "unknown";
  const win = d.outcome === "WIN";
  const loss = d.outcome === "LOSS";

  if (process === "solid" && win) return { process, title: "Processo sólido, resultado favorável", text: "Cumpriste as regras e o trade correu bem. Ótimo — mas um trade não prova nada: o que importa é repetir este processo muitas vezes." };
  if (process === "solid" && loss) return { process, title: "Processo sólido, resultado desfavorável", text: "Perder cumprindo as regras faz parte da distribuição de resultados. Se o stop e o tamanho foram os planeados, a decisão foi boa — não mudes as regras por causa de um trade." };
  if (process === "weak" && win) return { process, title: "Resultado favorável, processo fraco", text: "Ganhaste, mas entraste com regras incompletas ou por uma razão emocional. Este é o resultado mais perigoso: reforça um hábito que, repetido, tende a custar caro." };
  if (process === "weak" && loss) return { process, title: "Resultado desfavorável, processo fraco", text: "A perda veio com regras incompletas ou razão emocional. Aqui há algo concreto para corrigir: o que te fez entrar sem o setup completo?" };
  if (d.outcome === "TIMEOUT") return { process, title: "O trade não chegou ao stop nem ao alvo", text: "Foi fechado ao fim do tempo máximo. Pergunta-te se o alvo estava num sítio realista e se o trade devia ter existido sem um gatilho de invalidação claro." };
  return { process, title: win ? "Resultado favorável" : "Resultado desfavorável", text: "Não registaste as regras desta entrada, por isso não é possível avaliar o processo. Ticar as regras antes de decidir é o que torna o backtest útil." };
}
