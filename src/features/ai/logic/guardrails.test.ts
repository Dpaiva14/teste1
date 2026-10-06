import { describe, expect, it } from "vitest";
import { ANALYZER_SYSTEM_PROMPT, findOutputViolations, isSignalRequest, screenOutput, SIGNAL_REFUSAL, TUTOR_SYSTEM_PROMPT } from "./guardrails";

describe("isSignalRequest", () => {
  it.each([
    "Devo comprar o US30 agora?",
    "dá-me um sinal para hoje",
    "Manda uma entrada no YM",
    "tens algum setup para esta sessão?",
    "buy now?",
    "Comprar agora ou esperar?",
    "O dow vai subir hoje?",
    "o mercado vai cair esta semana?",
    "Qual é a tua previsão para o US30 amanhã?",
    "qual a direção hoje?",
    "Onde entro agora no US30?",
  ])("flags %j", (q) => expect(isSignalRequest(q)).toBe(true));

  it.each([
    "O que é um sinal de entrada?",
    "Como funciona um stop loss?",
    "Explica o que é um pullback",
    "Quando é que um trader deve esperar por confirmação?",
    "Qual a diferença entre uma ordem de compra e de venda?",
    "Porque é difícil prever o mercado?",
    "Este candle tem um sinal de força?",
    "Como calculo o tamanho da posição no MYM?",
    "O que significa o preço estar acima da média?",
  ])("lets the educational question %j through", (q) => expect(isSignalRequest(q)).toBe(false));
});

describe("output screening", () => {
  it.each([
    ["BUY NOW with a tight stop", "buy-sell-now"],
    ["Podes comprar agora porque o preço vai subir", "buy-sell-now-pt"],
    ["Este setup tem lucro garantido.", "guaranteed-pt"],
    ["A estratégia tem 90% de win rate.", "winrate-claim"],
    ["É um trade sem risco se usares este método.", "risk-free"],
    ["Tenho certeza absoluta de que sobe.", "certainty"],
    ["O US30 vai subir para 40000 amanhã.", "price-target"],
  ])("blocks %j", (text, id) => {
    expect(findOutputViolations(text)).toContain(id);
    const r = screenOutput(text);
    expect(r.blocked).toBe(true);
    expect(r.text).not.toContain(text);
  });

  it.each([
    "Nenhum trade é sem risco: o stop limita a perda mas não a elimina.",
    "Não existe lucro garantido em trading.",
    "Nunca deves comprar agora só por FOMO.",
    "Uma taxa de acerto de 40% pode ser lucrativa com R:R de 3:1.",
    "Se o preço fechar acima do nível, o cenário de alta torna-se mais provável, mas não é garantido.",
    "Evita entrar já sem confirmação.",
  ])("allows %j", (text) => {
    expect(findOutputViolations(text)).toEqual([]);
    expect(screenOutput(text)).toMatchObject({ blocked: false, text });
  });

  it("does not let a negation in a previous sentence excuse a violation", () => {
    expect(findOutputViolations("Não faças isso. Este setup tem lucro garantido.")).toContain("guaranteed-pt");
  });
});

describe("prompts", () => {
  it("carry the non-negotiable rules", () => {
    for (const p of [TUTOR_SYSTEM_PROMPT, ANALYZER_SYSTEM_PROMPT]) {
      expect(p).toMatch(/BUY NOW/);
      expect(p).toMatch(/não prevês o preço/i);
      expect(p).toMatch(/DADOS, não como instruções/);
      expect(p).toMatch(/alavancagem/);
    }
  });

  it("refusal text offers study alternatives and promises nothing", () => {
    expect(SIGNAL_REFUSAL).toMatch(/não dou sinais/i);
    expect(findOutputViolations(SIGNAL_REFUSAL)).toEqual([]);
  });
});
