/**
 * Learning Sources (spec §35).
 *
 * HONESTY RULE: `lastChecked` is only set when someone actually looked at the source. For the CME contract
 * specifications the figures were confirmed on 2026-10-06 from official CME Group search excerpts; the CME pages
 * themselves could not be opened from the build environment (network policy), so the verification level is
 * "excerpt", not "direct". Everything else is marked "none" until a human checks it — never invented.
 */
export type Verification = "direct" | "excerpt" | "none";

export type SourceCategory = "Bolsa" | "Regulador" | "Banco central" | "Estatísticas oficiais" | "Índices" | "Educação" | "Broker";

export interface SourceDef {
  id: string;
  name: string;
  org: string;
  category: SourceCategory;
  url: string | null;
  description: string;
  usedFor: string[];
  verification: Verification;
  /** YYYY-MM-DD, or null when never checked */
  lastChecked: string | null;
  note?: string;
}

export const SOURCES: readonly SourceDef[] = [
  {
    id: "cme-ym-specs", name: "E-mini Dow ($5) Futures — Contract Specs", org: "CME Group", category: "Bolsa",
    url: "https://www.cmegroup.com/markets/equities/dow-jones/e-mini-dow.contractSpecs.html",
    description: "Especificações oficiais do contrato YM: unidade do contrato, tick, ciclo de vencimentos, liquidação, horários.",
    usedFor: ["YM = $5 × índice", "Tick = 1,00 ponto = $5,00", "Vencimentos trimestrais"],
    verification: "excerpt", lastChecked: "2026-10-06",
    note: "Confirmado a partir de excertos oficiais da CME; a página não foi aberta diretamente. Reverifica no site antes de operar.",
  },
  {
    id: "cme-mym-specs", name: "Micro E-mini Dow Futures — Contract Specs", org: "CME Group", category: "Bolsa",
    url: "https://www.cmegroup.com/markets/equities/dow-jones/micro-e-mini-dow.contractSpecs.html",
    description: "Especificações oficiais do contrato MYM.",
    usedFor: ["MYM = $0,50 × índice", "Tick = 1,00 ponto = $0,50", "Vencimentos: março, junho, setembro, dezembro"],
    verification: "excerpt", lastChecked: "2026-10-06",
    note: "Confirmado a partir de excertos oficiais da CME; a página não foi aberta diretamente.",
  },
  {
    id: "cme-rulebook-ym", name: "Rulebook CBOT — Chapter 27 (E-mini Dow) e Chapter 28 (Micro E-mini Dow)", org: "CME Group", category: "Bolsa",
    url: "https://www.cmegroup.com/rulebook/CBOT/III/27.pdf",
    description: "Regras formais dos contratos: valorização, liquidação, último dia de negociação. Capítulo 28 (Micro): https://www.cmegroup.com/rulebook/CBOT/III/28.pdf",
    usedFor: ["Liquidação em dinheiro", "Último dia de negociação"], verification: "none", lastChecked: null,
  },
  {
    id: "cme-margins", name: "Margens (performance bonds) — Dow futures", org: "CME Group", category: "Bolsa",
    url: "https://www.cmegroup.com/markets/margin-overview.html",
    description: "As margens mínimas mudam com a volatilidade e são revistas pela bolsa; o broker pode exigir mais.",
    usedFor: ["Esta plataforma usa margens ILUSTRATIVAS (YM $9.000, MYM $900) — NÃO são valores do CME"],
    verification: "none", lastChecked: null, note: "Não verificado. Consulta sempre a margem atual no CME e no teu broker.",
  },
  {
    id: "cme-hours", name: "Horários de negociação (Globex)", org: "CME Group", category: "Bolsa",
    url: "https://www.cmegroup.com/trading-hours.html",
    description: "Horários de negociação e pausas diárias dos futuros de índices de ações.",
    usedFor: ["Relógio de sessões: Globex dom 18:00 → sex 17:00 ET, pausa diária 17:00–18:00 ET (convenção — confirmar)"],
    verification: "none", lastChecked: null, note: "O relógio de sessões usa uma convenção aproximada. Confirma horários e feriados no CME.",
  },
  {
    id: "cme-education", name: "E-mini Dow — Product Overview e Micro E-mini FAQ", org: "CME Group", category: "Educação",
    url: "https://www.cmegroup.com/education/lessons/e-mini-dow-product-overview",
    description: "Material educativo oficial sobre o contrato E-mini Dow. FAQ dos Micro E-mini: https://www.cmegroup.com/articles/faqs/frequently-asked-questions-micro-e-mini-equity-index-futures.html",
    usedFor: ["Conceitos de futuros, micro vs E-mini"], verification: "excerpt", lastChecked: "2026-10-06",
  },
  {
    id: "spdji-djia", name: "Dow Jones Industrial Average — metodologia", org: "S&P Dow Jones Indices", category: "Índices",
    url: "https://www.spglobal.com/spdji/en/indices/equity/dow-jones-industrial-average/",
    description: "Composição, ponderação por preço e divisor do DJIA.",
    usedFor: ["30 componentes, ponderação por preço, divisor"], verification: "none", lastChecked: null,
  },
  {
    id: "cftc", name: "Commodity Futures Trading Commission", org: "CFTC", category: "Regulador", url: "https://www.cftc.gov/",
    description: "Regulador dos mercados de futuros nos EUA. Alertas ao consumidor e material educativo.",
    usedFor: ["Supervisão de futuros nos EUA"], verification: "none", lastChecked: null,
  },
  {
    id: "nfa", name: "National Futures Association", org: "NFA", category: "Regulador", url: "https://www.nfa.futures.org/",
    description: "Organismo de auto-regulação da indústria de futuros nos EUA; permite verificar brokers (BASIC).",
    usedFor: ["Verificar a idoneidade de um broker de futuros nos EUA", "Taxas NFA por contrato"], verification: "none", lastChecked: null,
  },
  {
    id: "sec-investor", name: "Investor.gov (SEC)", org: "SEC", category: "Regulador", url: "https://www.investor.gov/",
    description: "Educação do investidor da SEC, incluindo avisos sobre day trading e produtos alavancados.",
    usedFor: ["Riscos de day trading e alavancagem"], verification: "none", lastChecked: null,
  },
  {
    id: "finra", name: "FINRA — Investor Education", org: "FINRA", category: "Regulador", url: "https://www.finra.org/investors",
    description: "Educação do investidor e regras para day trading (pattern day trader) em contas de ações nos EUA.",
    usedFor: ["Regras de day trading em ações (não se aplicam diretamente a futuros)"], verification: "none", lastChecked: null,
  },
  {
    id: "esma", name: "ESMA — medidas de intervenção sobre CFDs", org: "ESMA", category: "Regulador", url: "https://www.esma.europa.eu/",
    description: "Limites de alavancagem, proteção contra saldo negativo e avisos de risco para CFDs de retalho na UE.",
    usedFor: ["Lição sobre CFDs: limites de alavancagem na UE (indices principais 20:1)"], verification: "none", lastChecked: null,
    note: "Os limites podem mudar e variam por país: confirma na tua autoridade nacional (ex.: CMVM em Portugal) e no teu broker.",
  },
  {
    id: "fed-fomc", name: "FOMC — calendários e comunicados", org: "Federal Reserve", category: "Banco central", url: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm",
    description: "Datas das reuniões do FOMC, decisões de taxas e atas.",
    usedFor: ["Módulo Economic Events: FOMC, Fed Funds"], verification: "none", lastChecked: null,
  },
  {
    id: "bls", name: "BLS — calendário de divulgações", org: "U.S. Bureau of Labor Statistics", category: "Estatísticas oficiais", url: "https://www.bls.gov/schedule/",
    description: "Calendário oficial de CPI, PPI, Employment Situation (NFP), desemprego.",
    usedFor: ["Datas reais de CPI, PPI e NFP"], verification: "none", lastChecked: null,
  },
  {
    id: "bea", name: "BEA — calendário de divulgações", org: "U.S. Bureau of Economic Analysis", category: "Estatísticas oficiais", url: "https://www.bea.gov/",
    description: "PIB, rendimentos pessoais e consumo.",
    usedFor: ["Datas reais de GDP"], verification: "none", lastChecked: null,
  },
  {
    id: "broker-docs", name: "Documentação do teu broker", org: "O teu broker", category: "Broker", url: null,
    description: "Especificações do contrato (tamanho, valor por ponto, spread, margem, swap, horários) do US30/YM/MYM no teu broker.",
    usedFor: ["Qualquer cálculo de risco real"], verification: "none", lastChecked: null,
    note: "Obrigatório antes de operar a sério: o valor por ponto de um CFD varia por broker.",
  },
];

export const VERIFICATION_LABEL: Record<Verification, string> = {
  direct: "Verificado diretamente",
  excerpt: "Confirmado por excerto oficial",
  none: "Por verificar",
};

export interface VolatileFact {
  fact: string;
  value: string;
  sourceId: string;
  /** YYYY-MM-DD or null */
  checked: string | null;
  caveat?: string;
}

/** Spec §6/§35: values that can change must show Source + Date checked. */
export const VOLATILE_FACTS: readonly VolatileFact[] = [
  { fact: "YM — unidade do contrato", value: "$5 × DJIA", sourceId: "cme-ym-specs", checked: "2026-10-06" },
  { fact: "YM — tick", value: "1,00 ponto = $5,00", sourceId: "cme-ym-specs", checked: "2026-10-06" },
  { fact: "MYM — unidade do contrato", value: "$0,50 × DJIA", sourceId: "cme-mym-specs", checked: "2026-10-06" },
  { fact: "MYM — tick", value: "1,00 ponto = $0,50", sourceId: "cme-mym-specs", checked: "2026-10-06" },
  { fact: "Vencimentos (YM/MYM)", value: "Março, junho, setembro, dezembro", sourceId: "cme-mym-specs", checked: "2026-10-06" },
  { fact: "Margem inicial / manutenção", value: "Variável — NÃO fixada nesta plataforma", sourceId: "cme-margins", checked: null, caveat: "Os valores usados no simulador são ilustrativos." },
  { fact: "Horário Globex (índices)", value: "Convenção: dom 18:00 → sex 17:00 ET, pausa 17:00–18:00 ET", sourceId: "cme-hours", checked: null },
  { fact: "Limite de alavancagem CFD (UE, índices principais)", value: "20:1 (retalho)", sourceId: "esma", checked: null, caveat: "Varia por país e pode ser revisto." },
  { fact: "Componentes do DJIA", value: "30 empresas, ponderadas por preço", sourceId: "spdji-djia", checked: null, caveat: "A composição muda ao longo do tempo." },
];

export function getSource(id: string): SourceDef | undefined {
  return SOURCES.find((s) => s.id === id);
}
