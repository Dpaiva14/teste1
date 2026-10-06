import type { QuestionDef } from "./types";

/**
 * Tiny DSL to keep the curriculum files compact and uniform.
 *
 *   mc("Pergunta?", ["certa", "errada 1", "errada 2"], 0, "Porque…")
 *   tf("Afirmação.", true, "Porque…")
 *   num("Quantos contratos?", 2, 0, "contratos", "Cálculo…")
 */

type ChoiceType = Extract<QuestionDef, { options: unknown }>["type"];

function choice(type: ChoiceType, prompt: string, options: readonly string[], correct: number, explanation: string, extra?: { why?: Record<number, string>; chartRef?: string }): QuestionDef {
  if (correct < 0 || correct >= options.length) throw new Error(`dsl: correct index out of range for "${prompt}"`);
  return {
    type,
    prompt,
    explanation,
    ...(extra?.chartRef ? { chartRef: extra.chartRef } : {}),
    options: options.map((text, i) => {
      const why = extra?.why?.[i];
      return { text, correct: i === correct, ...(why ? { why } : {}) };
    }),
  };
}

/** Multiple choice (single correct answer). `correct` is the index of the right option. */
export function mc(prompt: string, options: readonly string[], correct: number, explanation: string, why?: Record<number, string>): QuestionDef {
  return choice("MULTIPLE_CHOICE", prompt, options, correct, explanation, { why });
}

export function tf(prompt: string, answer: boolean, explanation: string): QuestionDef {
  return {
    type: "TRUE_FALSE",
    prompt,
    explanation,
    options: [
      { text: "Verdadeiro", correct: answer },
      { text: "Falso", correct: !answer },
    ],
  };
}

export function chart(type: "CHART_ANALYSIS" | "IDENTIFY_STRUCTURE" | "IDENTIFY_TREND" | "IDENTIFY_SUPPORT_RESISTANCE" | "VALID_SETUP", chartRef: string, prompt: string, options: readonly string[], correct: number, explanation: string, why?: Record<number, string>): QuestionDef {
  return choice(type, prompt, options, correct, explanation, { chartRef, why });
}

export function num(prompt: string, answer: number, tolerance: number, unit: string | undefined, explanation: string, type: "NUMERIC" | "POSITION_SIZE" | "CALCULATE_RR" = "NUMERIC"): QuestionDef {
  return { type, prompt, answer, tolerance, ...(unit ? { unit } : {}), explanation };
}

export const sizing = (prompt: string, answer: number, unit: string | undefined, explanation: string) => num(prompt, answer, 0, unit, explanation, "POSITION_SIZE");
export const rr = (prompt: string, answer: number, tolerance: number, explanation: string) => num(prompt, answer, tolerance, undefined, explanation, "CALCULATE_RR");
