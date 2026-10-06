import { findOutputViolations } from "@/features/ai/logic/guardrails";
import { getScenario } from "@/modules/scenarios";
import { CONFLUENCE_FRAMEWORK_NOTICE } from "@/modules/legal";
import { FINAL_MODULE_NUMBER } from "@/modules/course";
import type { LessonDef, ModuleDef, QuestionDef } from "@/modules/types";

/** Which progression level each module must belong to (spec §31). */
export const MODULE_LEVELS: Readonly<Record<number, number>> = {
  1: 1, 2: 1,
  3: 2, 4: 2, 5: 2, 6: 2,
  7: 3, 8: 3, 9: 3,
  10: 4, 11: 4,
  12: 5, 13: 5, 14: 5,
  15: 6, 16: 6,
  17: 7, 18: 7, 19: 7,
  20: 8, 21: 8, 22: 8,
  23: 9, 24: 9,
  25: 10, 26: 10,
};

const CHART_TYPES = new Set(["CHART_ANALYSIS", "IDENTIFY_STRUCTURE", "IDENTIFY_TREND", "IDENTIFY_SUPPORT_RESISTANCE", "VALID_SETUP"]);
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Headings every setup lesson must contain (spec §19). */
export const SETUP_SECTIONS = ["Contexto", "Condições", "Entrada", "Stop", "Alvo", "Invalidação", "Risco", "Exemplo vencedor", "Exemplo perdedor", "Quando NÃO usar"] as const;

function checkQuestion(q: QuestionDef, where: string, out: string[]) {
  if (q.prompt.trim().length < 8) out.push(`${where}: enunciado demasiado curto`);
  if (q.explanation.trim().length < 15) out.push(`${where}: explicação em falta ou curta (todas as perguntas explicam a resposta)`);
  if ("answer" in q) {
    if (!Number.isFinite(q.answer) || !Number.isFinite(q.tolerance) || q.tolerance < 0) out.push(`${where}: resposta numérica/tolerância inválida`);
    return;
  }
  if (q.options.length < 2 || q.options.length > 6) out.push(`${where}: precisa de 2–6 opções`);
  if (q.options.filter((o) => o.correct).length !== 1) out.push(`${where}: tem de ter exatamente 1 opção correta`);
  if (new Set(q.options.map((o) => o.text)).size !== q.options.length) out.push(`${where}: opções repetidas`);
  if (q.type === "TRUE_FALSE" && q.options.length !== 2) out.push(`${where}: V/F tem 2 opções`);
  if (CHART_TYPES.has(q.type)) {
    if (!q.chartRef) out.push(`${where}: pergunta de gráfico sem chartRef`);
    else if (!getScenario(q.chartRef)) out.push(`${where}: cenário inexistente "${q.chartRef}"`);
  } else if (q.chartRef) out.push(`${where}: chartRef só em perguntas de gráfico`);
}

function checkLesson(l: LessonDef, mod: ModuleDef, out: string[]) {
  const where = `${String(mod.number).padStart(2, "0")}/${l.slug}`;
  if (!SLUG.test(l.slug)) out.push(`${where}: slug inválido`);
  if (l.title.trim().length < 3) out.push(`${where}: título curto`);
  if (l.summary.trim().length < 10) out.push(`${where}: resumo curto`);
  if (l.content.trim().length < 350) out.push(`${where}: conteúdo demasiado curto (${l.content.trim().length} caracteres)`);
  if (!l.example || l.example.trim().length < 40) out.push(`${where}: falta exemplo prático`);
  if (l.takeaways.length < 3 || l.takeaways.length > 5) out.push(`${where}: 3–5 pontos-chave (tem ${l.takeaways.length})`);
  if (l.quiz.length < 3 || l.quiz.length > 10) out.push(`${where}: quiz da aula com 3–10 perguntas (tem ${l.quiz.length})`);
  l.quiz.forEach((q, i) => checkQuestion(q, `${where} quiz #${i + 1}`, out));

  if (l.visual?.kind === "scenario" && !getScenario(l.visual.scenarioId)) out.push(`${where}: visual com cenário inexistente "${l.visual.scenarioId}"`);
  const ex = l.exercise;
  if (ex && "scenarioId" in ex) {
    const s = getScenario(ex.scenarioId);
    if (!s) out.push(`${where}: exercício com cenário inexistente "${ex.scenarioId}"`);
    else {
      const needs = { structure: s.structure, levels: s.levels, fibonacci: s.fib, confluence: s.confluence }[ex.kind];
      if (!needs) out.push(`${where}: o cenário "${ex.scenarioId}" não suporta o exercício "${ex.kind}"`);
    }
  }
  if (ex?.kind === "link" && !/^\/[a-z0-9/_-]*$/i.test(ex.href)) out.push(`${where}: link do exercício tem de ser interno`);

  const text = [l.title, l.summary, l.content, l.example ?? "", ...l.takeaways, ...l.quiz.flatMap((q) => [q.prompt, q.explanation])].join("\n");
  const bad = findOutputViolations(text);
  if (bad.length) out.push(`${where}: linguagem de sinal/promessa de resultado (${bad.join(", ")})`);
}

export function validateModule(mod: ModuleDef): string[] {
  const out: string[] = [];
  const tag = `módulo ${String(mod.number).padStart(2, "0")}`;
  if (!SLUG.test(mod.slug)) out.push(`${tag}: slug inválido`);
  if (MODULE_LEVELS[mod.number] === undefined) out.push(`${tag}: número fora de 1–${FINAL_MODULE_NUMBER}`);
  else if (MODULE_LEVELS[mod.number] !== mod.level) out.push(`${tag}: nível ${mod.level}, esperado ${MODULE_LEVELS[mod.number]}`);
  if (mod.lessons.length === 0) out.push(`${tag}: sem aulas`);
  const slugs = mod.lessons.map((l) => l.slug);
  if (new Set(slugs).size !== slugs.length) out.push(`${tag}: slugs de aulas repetidos`);
  if (new Set(mod.lessons.map((l) => l.title)).size !== mod.lessons.length) out.push(`${tag}: títulos de aulas repetidos`);
  mod.lessons.forEach((l) => checkLesson(l, mod, out));

  const q = mod.quiz;
  if (q.questions.length < 8 || q.questions.length > 10) out.push(`${tag}: o quiz do módulo tem 8–10 perguntas (tem ${q.questions.length})`);
  if (new Set(q.questions.map((x) => x.type)).size < 3) out.push(`${tag}: o quiz do módulo deve misturar pelo menos 3 tipos de pergunta`);
  q.questions.forEach((x, i) => checkQuestion(x, `${tag} quiz do módulo #${i + 1}`, out));
  const text = q.questions.map((x) => `${x.prompt}\n${x.explanation}`).join("\n");
  const bad = findOutputViolations(text + "\n" + mod.summary);
  if (bad.length) out.push(`${tag}: linguagem de sinal/promessa de resultado no quiz/resumo (${bad.join(", ")})`);
  return out;
}

export function validateCurriculum(modules: readonly ModuleDef[], opts: { complete: boolean }): string[] {
  const out = modules.flatMap(validateModule);
  const numbers = modules.map((m) => m.number);
  if (new Set(numbers).size !== numbers.length) out.push("números de módulo repetidos");
  if (new Set(modules.map((m) => m.slug)).size !== modules.length) out.push("slugs de módulo repetidos");
  if (opts.complete) {
    for (let n = 1; n <= FINAL_MODULE_NUMBER; n++) if (!numbers.includes(n)) out.push(`falta o módulo ${String(n).padStart(2, "0")}`);
    const fw = modules.find((m) => m.number === 15);
    if (fw && !fw.lessons.some((l) => l.content.includes(CONFLUENCE_FRAMEWORK_NOTICE))) out.push("módulo 15: falta o aviso obrigatório de que o framework não é o curso oficial de Cuebanks/Wall Street Academy");
    const setups = modules.find((m) => m.number === 16);
    if (setups) {
      const five = setups.lessons.filter((l) => /^setup-\d/.test(l.slug));
      if (five.length !== 5) out.push(`módulo 16: esperados 5 setups (slug "setup-N-…"), encontrados ${five.length}`);
      for (const l of five) for (const s of SETUP_SECTIONS) if (!new RegExp(`^#{2,3} .*${s}`, "m").test(l.content)) out.push(`módulo 16/${l.slug}: falta a secção "${s}"`);
    }
  }
  return out;
}
