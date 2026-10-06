import { describe, expect, it } from "vitest";
import { eventSchema, glossarySchema, lessonUpdateSchema, questionSchema, quizSchema, userUpdateSchema } from "../schemas";
import { normalizeVideoUrl, VideoUrlError } from "./video";

describe("normalizeVideoUrl", () => {
  it.each([
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"],
    ["https://youtu.be/dQw4w9WgXcQ?t=10", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"],
    ["https://www.youtube.com/embed/dQw4w9WgXcQ", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"],
    ["https://m.youtube.com/shorts/dQw4w9WgXcQ", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"],
    ["https://vimeo.com/123456789", "https://player.vimeo.com/video/123456789"],
    ["https://player.vimeo.com/video/123456789?h=abc", "https://player.vimeo.com/video/123456789"],
  ])("normalises %s", (input, out) => expect(normalizeVideoUrl(input)).toBe(out));

  it("treats blank as no video", () => {
    expect(normalizeVideoUrl("")).toBeNull();
    expect(normalizeVideoUrl("   ")).toBeNull();
    expect(normalizeVideoUrl(null)).toBeNull();
  });

  it.each([
    "http://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://evil.example/embed/dQw4w9WgXcQ",
    "https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=short",
    "https://vimeo.com/abc",
    "https://user:pw@www.youtube.com/watch?v=dQw4w9WgXcQ",
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "not a url",
  ])("rejects %s", (input) => expect(() => normalizeVideoUrl(input)).toThrow(VideoUrlError));
});

const mcq = { type: "MULTIPLE_CHOICE", prompt: "Qual é o stop correto?", explanation: "Porque invalida a ideia.", options: [{ text: "A", correct: true }, { text: "B", correct: false }] } as const;

describe("questionSchema", () => {
  it("accepts a valid multiple-choice question", () => expect(questionSchema.safeParse(mcq).success).toBe(true));
  it("needs exactly one correct option", () => {
    expect(questionSchema.safeParse({ ...mcq, options: [{ text: "A", correct: false }, { text: "B", correct: false }] }).success).toBe(false);
    expect(questionSchema.safeParse({ ...mcq, options: [{ text: "A", correct: true }, { text: "B", correct: true }] }).success).toBe(false);
  });
  it("true/false has exactly two options", () => {
    expect(questionSchema.safeParse({ ...mcq, type: "TRUE_FALSE", options: [{ text: "V", correct: true }, { text: "F", correct: false }, { text: "?", correct: false }] }).success).toBe(false);
    expect(questionSchema.safeParse({ ...mcq, type: "TRUE_FALSE", options: [{ text: "V", correct: true }, { text: "F", correct: false }] }).success).toBe(true);
  });
  it("chart questions need an existing scenario", () => {
    expect(questionSchema.safeParse({ ...mcq, type: "IDENTIFY_TREND" }).success).toBe(false);
    expect(questionSchema.safeParse({ ...mcq, type: "IDENTIFY_TREND", chartRef: "nope" }).success).toBe(false);
    expect(questionSchema.safeParse({ ...mcq, type: "IDENTIFY_TREND", chartRef: "structure-bull-01" }).success).toBe(true);
  });
  it("numeric questions need an answer and tolerance and no options", () => {
    const num = { type: "POSITION_SIZE", prompt: "Quantos contratos?", explanation: "Risco ÷ risco por contrato.", answer: 4, tolerance: 0 };
    expect(questionSchema.safeParse(num).success).toBe(true);
    expect(questionSchema.safeParse({ ...num, answer: undefined }).success).toBe(false);
    expect(questionSchema.safeParse({ ...num, tolerance: undefined }).success).toBe(false);
    expect(questionSchema.safeParse({ ...num, options: [{ text: "x", correct: true }] }).success).toBe(false);
  });
  it("always requires an explanation", () => expect(questionSchema.safeParse({ ...mcq, explanation: "" }).success).toBe(false));
});

describe("quizSchema", () => {
  it("needs at least one question", () => expect(quizSchema.safeParse({ title: "Quiz", passScore: 70, published: true, questions: [] }).success).toBe(false));
  it("rejects a pass score outside 10..100", () => expect(quizSchema.safeParse({ title: "Quiz", passScore: 5, published: true, questions: [mcq] }).success).toBe(false));
});

describe("lessonUpdateSchema", () => {
  const base = { title: "Aula nova", summary: "Resumo da aula nova.", difficulty: "BEGINNER", content: "Conteúdo suficiente da aula em markdown.", takeaways: ["Primeiro ponto"], estimatedMinutes: 5, xpReward: 20, published: true } as const;
  it("normalises the video and blanks to null", () => {
    expect(lessonUpdateSchema.parse({ ...base, videoUrl: "https://youtu.be/dQw4w9WgXcQ" }).videoUrl).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(lessonUpdateSchema.parse({ ...base, videoUrl: "" }).videoUrl).toBeNull();
    expect(lessonUpdateSchema.parse({ ...base }).videoUrl).toBeNull();
  });
  it("rejects a disallowed video host", () => expect(lessonUpdateSchema.safeParse({ ...base, videoUrl: "https://evil.example/v" }).success).toBe(false));
});

describe("eventSchema", () => {
  const base = { title: "CPI de Setembro", category: "CPI", impact: "EXTREME", scheduledAt: "2026-10-14T12:30:00Z" } as const;
  it("a real event needs a source; a DEMO one does not", () => {
    expect(eventSchema.safeParse({ ...base, isDemo: false }).success).toBe(false);
    expect(eventSchema.safeParse({ ...base, isDemo: false, source: "BLS" }).success).toBe(true);
    expect(eventSchema.safeParse({ ...base, isDemo: true }).success).toBe(true);
  });
  it("only accepts https source links", () => {
    expect(eventSchema.safeParse({ ...base, isDemo: true, sourceUrl: "http://example.com" }).success).toBe(false);
    expect(eventSchema.safeParse({ ...base, isDemo: true, sourceUrl: "javascript:alert(1)" }).success).toBe(false);
    expect(eventSchema.safeParse({ ...base, isDemo: true, sourceUrl: "https://www.bls.gov/" }).success).toBe(true);
  });
});

describe("glossary and users", () => {
  it("validates slugs", () => {
    const g = { slug: "pullback", term: "Pullback", category: "Price Action", definition: "Recuo temporário contra a tendência.", simpleExplanation: "O preço dá um passo atrás.", technicalExplanation: "Retração dentro de uma tendência.", example: "O US30 recua 100 pontos e retoma." };
    expect(glossarySchema.safeParse(g).success).toBe(true);
    expect(glossarySchema.safeParse({ ...g, slug: "Bad Slug" }).success).toBe(false);
    expect(glossarySchema.safeParse({ ...g, slug: "../etc" }).success).toBe(false);
  });
  it("requires something to update", () => {
    expect(userUpdateSchema.safeParse({}).success).toBe(false);
    expect(userUpdateSchema.safeParse({ role: "ADMIN" }).success).toBe(true);
    expect(userUpdateSchema.safeParse({ role: "ROOT" }).success).toBe(false);
  });
});

describe("validation messages", () => {
  it("are in Portuguese, not Zod's English default", () => {
    const r = quizSchema.safeParse({ title: "Quiz", passScore: 70, published: true, questions: [{ ...mcq, prompt: "ab" }] });
    expect(r.success).toBe(false);
    const msg = r.success ? "" : r.error.issues.map((i) => i.message).join(" | ");
    expect(msg).not.toMatch(/Too small|expected string|Invalid input/);
    expect(msg).toMatch(/Demasiado pequeno|caracteres/);
  });
});
