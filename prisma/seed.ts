import "dotenv/config";
import { randomUUID } from "node:crypto";
import { hash } from "bcryptjs";
import { createHash } from "node:crypto";
import { prisma } from "../src/database/client";
import { MODULES } from "../src/modules/curriculum";
import { GLOSSARY } from "../src/modules/glossary";
import { ACHIEVEMENTS } from "../src/modules/achievements";
import { COURSE_SLUG } from "../src/modules/course";
import { BRAND } from "../src/modules/brand";
import type { LessonDef, ModuleDef, QuestionDef } from "../src/modules/types";
import { Prisma } from "../src/database/generated/client";

/**
 * Idempotent seed. Rows with managedBySeed=true are kept in sync with src/modules; rows an admin has edited
 * (managedBySeed=false) are left alone unless SEED_FORCE=1.
 */
const FORCE = process.env.SEED_FORCE === "1";

async function seedQuiz(target: { lessonId?: string; moduleId?: string }, title: string, passScore: number, questions: readonly QuestionDef[]) {
  const where = target.lessonId ? { lessonId: target.lessonId } : { moduleId: target.moduleId! };
  const quiz = await prisma.quiz.upsert({
    where,
    create: { ...where, title, passScore },
    update: { title, passScore },
  });
  await prisma.question.deleteMany({ where: { quizId: quiz.id } }); // cascades to answers
  const qRows: Prisma.QuestionCreateManyInput[] = [];
  const aRows: Prisma.AnswerCreateManyInput[] = [];
  questions.forEach((q, i) => {
    const id = randomUUID();
    const numeric = "answer" in q;
    qRows.push({
      id,
      quizId: quiz.id,
      orderIndex: i,
      type: q.type,
      prompt: q.prompt,
      explanation: q.explanation,
      chartRef: "chartRef" in q ? (q.chartRef ?? null) : null,
      numericAnswer: numeric ? q.answer : null,
      numericTolerance: numeric ? q.tolerance : null,
      numericUnit: numeric ? (q.unit ?? null) : null,
    });
    if (!numeric) {
      q.options.forEach((o, j) => aRows.push({ questionId: id, orderIndex: j, text: o.text, isCorrect: o.correct, explanation: o.why ?? null }));
    }
  });
  if (qRows.length) await prisma.question.createMany({ data: qRows });
  if (aRows.length) await prisma.answer.createMany({ data: aRows });
}

function lessonData(def: LessonDef, number: number, moduleDifficulty: ModuleDef["difficulty"]) {
  return {
    number,
    title: def.title,
    summary: def.summary,
    difficulty: def.difficulty ?? moduleDifficulty,
    content: def.content,
    example: def.example ?? null,
    visual: (def.visual ?? undefined) as Prisma.InputJsonValue | undefined,
    exercise: (def.exercise ?? undefined) as Prisma.InputJsonValue | undefined,
    takeaways: [...def.takeaways],
    videoUrl: def.videoUrl ?? null,
    estimatedMinutes: def.minutes ?? 5,
  };
}

async function seedCurriculum() {
  const course = await prisma.course.upsert({
    where: { slug: COURSE_SLUG },
    create: { slug: COURSE_SLUG, title: BRAND.name, subtitle: BRAND.subtitle, description: BRAND.principle },
    update: { title: BRAND.name, subtitle: BRAND.subtitle, description: BRAND.principle },
  });

  let lessonCount = 0;
  let questionCount = 0;
  for (const m of MODULES) {
    const existing = await prisma.module.findUnique({ where: { courseId_slug: { courseId: course.id, slug: m.slug } } });
    const editable = !existing || existing.managedBySeed || FORCE;
    const minutes = m.lessons.reduce((s, l) => s + (l.minutes ?? 5), 0);
    const mod = editable
      ? await prisma.module.upsert({
          where: { courseId_slug: { courseId: course.id, slug: m.slug } },
          create: { courseId: course.id, slug: m.slug, number: m.number, level: m.level, title: m.title, summary: m.summary, difficulty: m.difficulty, icon: m.icon, estimatedMinutes: minutes },
          update: { number: m.number, level: m.level, title: m.title, summary: m.summary, difficulty: m.difficulty, icon: m.icon, estimatedMinutes: minutes, managedBySeed: true },
        })
      : existing!;
    if (!editable) console.log(`  · module ${m.slug}: edited in admin — skipped (SEED_FORCE=1 to overwrite)`);

    // Free every (moduleId, number) slot so reordering cannot violate the unique constraint mid-seed. Lessons that
    // keep a number >= 1000 afterwards are admin-created ones (not in the code); they are appended below.
    await prisma.lesson.updateMany({ where: { moduleId: mod.id }, data: { number: { increment: 1000 } } });

    for (const [i, l] of m.lessons.entries()) {
      const ex = await prisma.lesson.findUnique({ where: { moduleId_slug: { moduleId: mod.id, slug: l.slug } } });
      if (ex && !ex.managedBySeed && !FORCE) {
        await prisma.lesson.update({ where: { id: ex.id }, data: { number: i + 1 } });
        continue;
      }
      const data = lessonData(l, i + 1, m.difficulty);
      const lesson = await prisma.lesson.upsert({
        where: { moduleId_slug: { moduleId: mod.id, slug: l.slug } },
        create: { moduleId: mod.id, slug: l.slug, ...data, visual: data.visual ?? undefined, exercise: data.exercise ?? undefined },
        update: { ...data, visual: data.visual ?? Prisma.DbNull, exercise: data.exercise ?? Prisma.DbNull, managedBySeed: true },
      });
      await seedQuiz({ lessonId: lesson.id }, `Quiz — ${l.title}`, 60, l.quiz);
      lessonCount++;
      questionCount += l.quiz.length;
    }
    // Prune managed lessons that no longer exist in the definitions.
    await prisma.lesson.deleteMany({ where: { moduleId: mod.id, managedBySeed: true, slug: { notIn: m.lessons.map((l) => l.slug) } } });
    const custom = await prisma.lesson.findMany({ where: { moduleId: mod.id, number: { gte: 1000 } }, orderBy: { number: "asc" }, select: { id: true } });
    for (const [i, l] of custom.entries()) await prisma.lesson.update({ where: { id: l.id }, data: { number: m.lessons.length + 1 + i } });

    if (editable) {
      await seedQuiz({ moduleId: mod.id }, m.quiz.title, m.quiz.passScore ?? 70, m.quiz.questions);
      questionCount += m.quiz.questions.length;
    }
  }
  // Prune managed modules no longer defined.
  await prisma.module.deleteMany({ where: { courseId: course.id, managedBySeed: true, slug: { notIn: MODULES.map((m) => m.slug) } } });
  console.log(`✓ curriculum: ${MODULES.length} modules, ${lessonCount} lessons synced, ${questionCount} questions`);
}

async function seedGlossary() {
  // Insert-only: terms edited in /admin are never overwritten. SEED_FORCE=1 resets them to the code version.
  const rows = GLOSSARY.map((g) => ({ slug: g.slug, term: g.term, category: g.category, definition: g.definition, simpleExplanation: g.simple, technicalExplanation: g.technical, example: g.example, related: [...g.related] }));
  if (FORCE) {
    for (const r of rows) {
      const { slug, ...data } = r;
      await prisma.glossaryTerm.upsert({ where: { slug }, create: r, update: data });
    }
  } else {
    await prisma.glossaryTerm.createMany({ data: rows, skipDuplicates: true });
  }
  console.log(`✓ glossary: ${GLOSSARY.length} terms in code, ${await prisma.glossaryTerm.count()} in database`);
}

async function seedAchievements() {
  for (const [i, a] of ACHIEVEMENTS.entries()) {
    const data = { title: a.title, description: a.description, icon: a.icon, category: a.category, xpReward: a.xpReward, sortOrder: i };
    await prisma.achievement.upsert({ where: { key: a.key }, create: { key: a.key, ...data }, update: data });
  }
  console.log(`✓ achievements: ${ACHIEVEMENTS.length}`);
}

/** DEMO calendar: illustrative entries relative to "now". Never a real release schedule. */
async function seedDemoEvents() {
  await prisma.economicEvent.deleteMany({ where: { isDemo: true } });
  const day = (offset: number, hourUtc: number, minute = 0) => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + offset);
    d.setUTCHours(hourUtc, minute, 0, 0);
    return d;
  };
  const note = "Evento ILUSTRATIVO (DEMO): data/hora fictícias para fins educativos. Consulta o calendário oficial (BLS, BEA, Federal Reserve) para datas reais.";
  const rows = [
    { title: "Non-Farm Payrolls (NFP) — DEMO", category: "NFP", impact: "EXTREME" as const, at: day(2, 12, 30), description: "Criação de emprego não agrícola nos EUA. Historicamente um dos eventos que mais mexe com o Dow." },
    { title: "CPI (Consumer Price Index) — DEMO", category: "CPI", impact: "EXTREME" as const, at: day(4, 12, 30), description: "Inflação ao consumidor. Influencia as expectativas sobre as taxas de juro." },
    { title: "FOMC Rate Decision — DEMO", category: "FOMC", impact: "EXTREME" as const, at: day(7, 18, 0), description: "Decisão de política monetária da Fed, seguida de conferência de imprensa." },
    { title: "PPI (Producer Price Index) — DEMO", category: "PPI", impact: "HIGH" as const, at: day(5, 12, 30), description: "Inflação na produção." },
    { title: "Retail Sales — DEMO", category: "RETAIL_SALES", impact: "HIGH" as const, at: day(8, 12, 30), description: "Vendas a retalho nos EUA." },
    { title: "GDP (QoQ) — DEMO", category: "GDP", impact: "HIGH" as const, at: day(9, 12, 30), description: "Produto Interno Bruto." },
    { title: "ISM Manufacturing PMI — DEMO", category: "PMI", impact: "MEDIUM" as const, at: day(1, 14, 0), description: "Índice de gestores de compras da indústria." },
    { title: "Initial Jobless Claims — DEMO", category: "JOBLESS_CLAIMS", impact: "MEDIUM" as const, at: day(3, 12, 30), description: "Pedidos semanais de subsídio de desemprego." },
    { title: "Fed Chair Speech — DEMO", category: "FED_SPEECH", impact: "HIGH" as const, at: day(6, 15, 0), description: "Discurso do presidente da Fed; o tom pode mover os mercados." },
    { title: "Consumer Confidence — DEMO", category: "OTHER", impact: "LOW" as const, at: day(10, 14, 0), description: "Confiança do consumidor." },
  ];
  await prisma.economicEvent.createMany({
    data: rows.map((r) => ({ title: r.title, category: r.category, impact: r.impact, scheduledAt: r.at, description: r.description, source: note, isDemo: true, country: "US" })),
  });
  console.log(`✓ demo economic events: ${rows.length} (flagged isDemo)`);
}

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("· admin: SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — no admin created (use `npm run admin:create`).");
    return;
  }
  if (password.length < 10) throw new Error("SEED_ADMIN_PASSWORD must have at least 10 characters");
  const passwordHash = await hash(createHash("sha256").update(password, "utf8").digest("base64"), 12);
  await prisma.user.upsert({
    where: { email },
    create: { email, name: "Admin", passwordHash, role: "ADMIN", emailVerified: new Date() },
    update: { role: "ADMIN" },
  });
  console.log(`✓ admin user: ${email}`);
}

async function main() {
  console.log("Seeding…");
  await seedAchievements();
  await seedGlossary();
  await seedCurriculum();
  await seedDemoEvents();
  await seedAdmin();
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
