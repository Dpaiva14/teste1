import { MODULES } from "../src/modules/curriculum";
import { validateCurriculum } from "../src/modules/curriculum/validate";

/**
 * Usage: npm run content:validate            → checks what exists
 *        npm run content:validate -- --strict → also requires all 26 modules, the framework notice and the 5 setups
 */
const strict = process.argv.includes("--strict");
const problems = validateCurriculum(MODULES, { complete: strict });
const lessons = MODULES.reduce((s, m) => s + m.lessons.length, 0);
const questions = MODULES.reduce((s, m) => s + m.quiz.questions.length + m.lessons.reduce((a, l) => a + l.quiz.length, 0), 0);
console.log(`${MODULES.length} modules · ${lessons} lessons · ${questions} questions${strict ? " (strict)" : ""}`);
if (problems.length) {
  for (const p of problems) console.error(`✗ ${p}`);
  console.error(`\n${problems.length} problem(s).`);
  process.exit(1);
}
console.log("✓ curriculum content is valid");
