export type EntryReasonKey = "SETUP_VALID" | "FOMO" | "REVENGE" | "BOREDOM" | "FEAR_OF_MISSING_MOVE" | "OTHER";

export interface EntryReasonMeta {
  key: EntryReasonKey;
  label: string;
  /** emotional / process-breaking reasons */
  risky: boolean;
  nudge: string | null;
}

/** Spec §27 — "Why are you entering?" */
export const ENTRY_REASONS: readonly EntryReasonMeta[] = [
  { key: "SETUP_VALID", label: "Setup válido", risky: false, nudge: null },
  { key: "FOMO", label: "FOMO", risky: true, nudge: "FOMO (medo de ficar de fora): o preço já se moveu e queres 'apanhar o comboio'. Entrar tarde costuma significar stop mais largo e R:R pior. Há sempre outro setup." },
  { key: "REVENGE", label: "Vingança (revenge)", risky: true, nudge: "Revenge trading: queres recuperar a última perda. Esse é o momento em que as regras se quebram. Considera uma pausa antes de decidir." },
  { key: "BOREDOM", label: "Tédio", risky: true, nudge: "Tédio: não estar posicionado também é uma posição. O mercado não te deve ação." },
  { key: "FEAR_OF_MISSING_MOVE", label: "Medo de perder o movimento", risky: true, nudge: "Medo de perder o movimento: quando a razão é o medo, o stop costuma ficar para depois. Define primeiro onde estás errado." },
  { key: "OTHER", label: "Outro motivo", risky: false, nudge: null },
];

export function reasonMeta(key: string | null | undefined): EntryReasonMeta | undefined {
  return ENTRY_REASONS.find((r) => r.key === key);
}
