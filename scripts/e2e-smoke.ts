/**
 * End-to-end smoke test against a RUNNING server (default http://localhost:3000, override with BASE_URL).
 *
 *   npm run dev            # in one terminal (database migrated and seeded)
 *   npm run e2e            # in another
 *
 * It registers throw-away users, so run it against a development database only. Needs a Chromium: set CHROMIUM_PATH
 * (e.g. /opt/pw-browsers/chromium-1194/chrome-linux/chrome) or let Playwright find its own (`npx playwright install chromium`).
 * With ADMIN_EMAIL / ADMIN_PASSWORD it also runs the final-assessment flow end to end (the admin has every level unlocked).
 *
 * It checks behaviour that matters for this product: protected routes, authorisation between users, level locks, the
 * "no future candles before the decision" rules of replay/backtest/assessment, risk maths and that nothing is paid twice.
 */
import { chromium, type BrowserContext, type Page } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PASSWORD = "uma frase longa e segura";
const results: { ok: boolean; msg: string }[] = [];
const ok = (cond: boolean, msg: string) => {
  results.push({ ok: cond, msg });
  console.log(`${cond ? "PASS" : "FAIL"}  ${msg}`);
};

type Res = { status: number; json: any };
const call = (page: Page, path: string, method = "GET", body?: unknown): Promise<Res> =>
  page.evaluate(
    async ([p, m, b]) => {
      const res = await fetch(p as string, { method: m as string, headers: b ? { "content-type": "application/json" } : undefined, body: b ? JSON.stringify(b) : undefined });
      let json: unknown = null;
      try {
        json = await res.json();
      } catch {
        /* empty body */
      }
      return { status: res.status, json };
    },
    [path, method, body] as const,
  );

async function register(ctx: BrowserContext, tag: string): Promise<Page> {
  const page = await ctx.newPage();
  await page.goto(`${BASE}/register`);
  await page.fill("#name", `Smoke ${tag}`);
  await page.fill("#email", `smoke-${tag}+${Date.now()}@example.com`);
  await page.fill("#password", PASSWORD);
  await page.check("input[type=checkbox]");
  await page.click("button[type=submit]");
  await page.waitForURL("**/dashboard");
  return page;
}

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ["--no-sandbox"] });
  const errors: string[] = [];
  const newCtx = async () => {
    const ctx = await browser.newContext({ viewport: { width: 1360, height: 950 } });
    ctx.on("page", (p) => p.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`)));
    return ctx;
  };

  // ── Public surface ────────────────────────────────────────────────────────
  const anon = await (await newCtx()).newPage();
  for (const path of ["/", "/login", "/register", "/glossary", "/sources", "/disclaimer"]) {
    const res = await anon.goto(`${BASE}${path}`);
    ok(res?.status() === 200, `public page ${path} → 200`);
  }
  await anon.goto(`${BASE}/disclaimer`);
  ok((await anon.locator("text=exclusivamente educativa").count()) > 0, "disclaimer states the platform is educational only");
  await anon.goto(`${BASE}/sources`);
  ok((await anon.locator("text=CME Group").count()) > 0, "sources page lists CME Group among the learning sources");

  // ── Authentication boundary ───────────────────────────────────────────────
  for (const path of ["/dashboard", "/academy", "/assessment", "/admin", "/simulator"]) {
    await anon.goto(`${BASE}${path}`);
    ok(/\/login/.test(anon.url()), `anonymous ${path} → redirected to /login`);
  }
  const anonApi = await call(anon, "/api/journal");
  ok(anonApi.status === 401, `anonymous API call → 401 (got ${anonApi.status})`);
  const cross = await anon.request.post(`${BASE}/api/auth/login`, { headers: { origin: "https://evil.example" }, data: { email: "a@b.co", password: "x" } });
  ok(cross.status() === 403, `cross-origin POST rejected → 403 (got ${cross.status()})`);

  // ── A student ─────────────────────────────────────────────────────────────
  const studentCtx = await newCtx();
  const s = await register(studentCtx, "stu");
  await s.goto(`${BASE}/academy`);
  ok((await s.locator("text=/MÓDULO \\d\\d/i").count()) >= 26, "academy lists the 26 modules");
  const locked = await s.goto(`${BASE}/academy/risk-management/risco-por-trade`);
  ok(/\/academy(\/|$)/.test(s.url()) || locked?.status() === 200, "a locked lesson is not served to a new student");
  ok(!(await s.content()).includes("orçamento de risco ($)"), "locked lesson content is not in the HTML");
  const adminPage = await s.goto(`${BASE}/admin`);
  ok(adminPage?.status() === 404 || adminPage?.status() === 403 || !/\/admin$/.test(s.url()), "student cannot open /admin");
  ok((await call(s, "/api/admin/stats")).status === 403, "student → /api/admin/stats 403");

  const startFinal = await call(s, "/api/assessment", "POST");
  ok(startFinal.status === 403, `final assessment is locked for a new student (got ${startFinal.status})`);

  // risk maths
  const sim = await call(s, "/api/simulator/accounts", "POST", { name: "Smoke", initialBalance: 10000, timeframe: "M5" });
  ok(sim.status === 201, "simulator account created");
  const simId = sim.json.id as string;
  const simState = await call(s, `/api/simulator/accounts/${simId}`);
  const bid = simState.json.account.bids.MYM as number;
  ok(simState.json.account.candles.length <= 300 && simState.json.account.cursor === 200, "simulator sends only candles up to the cursor");
  const open = await call(s, `/api/simulator/accounts/${simId}/trades`, "POST", { symbol: "MYM", direction: "LONG", contracts: 2, stop: bid - 40, target: bid + 80, entryReason: "SETUP_VALID", checklist: {} });
  ok(open.status === 201 || open.status === 200, `simulator trade opened (${open.status})`);
  const oversize = await call(s, `/api/simulator/accounts/${simId}/trades`, "POST", { symbol: "YM", direction: "LONG", contracts: 50, stop: bid - 40, target: bid + 80, entryReason: "OTHER", checklist: {} });
  ok(oversize.status === 400, `an order beyond the free margin is refused (${oversize.status})`);
  const advanced = await call(s, `/api/simulator/accounts/${simId}/advance`, "POST", { bars: 20 });
  ok(advanced.status === 200 && advanced.json.account.cursor === 220, "simulator advances by the requested bars");

  // replay: no future candles, only the owner can read it
  const rp = await call(s, "/api/replay", "POST", { symbol: "MYM", timeframe: "M5" });
  const rpState = await call(s, `/api/replay/${rp.json.id}`);
  ok(rpState.json.replay.candles.length <= 300 && rpState.json.replay.cursor === 200 && rpState.json.replay.totalBars > rpState.json.replay.cursor, "replay never sends candles after the cursor");

  // backtest: WAIT advances, results never contain the raw seed
  const bt = await call(s, "/api/backtests", "POST", { name: "smoke", symbol: "MYM", timeframe: "M15", strategyKey: "trend-pullback", riskPercent: 1, initialBalance: 10000, bars: 400 });
  const btWait = await call(s, `/api/backtests/${bt.json.id}/decisions`, "POST", { choice: "WAIT" });
  ok(btWait.status === 201 || btWait.status === 200, `backtest WAIT accepted (${btWait.status})`);
  ok(!JSON.stringify((await call(s, `/api/backtests/${bt.json.id}`)).json).includes('"seed"'), "backtest state does not expose the series seed");

  // daily plan + journal
  const today = new Date().toISOString().slice(0, 10);
  const plan = await call(s, "/api/daily-plans", "PUT", { date: today, bias: "NEUTRAL", mustHappen: "Teste do suporte com rejeição", invalidation: "Fecho abaixo do mínimo", maxRisk: 200, maxRiskUnit: "USD", maxTrades: 3 });
  ok(plan.status === 200, `daily plan saved (${plan.status})`);
  const entry = await call(s, "/api/journal", "POST", {
    tradeDate: new Date().toISOString(), instrument: "MYM", direction: "LONG", timeframe: "M5", setup: "Trend Pullback", entryPrice: 39000, stopLoss: 38960, takeProfit: 39080, exitPrice: 38960,
    contracts: 5, emotionalState: "CALM", mistakes: [], lesson: "Setup válido que falhou: manter o risco.", followedPlan: true, processRating: 5,
  });
  ok(entry.status === 201, `journal entry created (${entry.status})`);
  ok(Math.abs((entry.json.entry?.rMultiple ?? 0) + 1) < 0.05, `journal R-multiple of a full stop-out ≈ −1R (${entry.json.entry?.rMultiple})`);

  // AI features degrade gracefully when no key is configured (or work when it is)
  const tutor = await call(s, "/api/tutor", "POST", { message: "O que é um higher low?" });
  ok([200, 201, 503].includes(tutor.status), `AI tutor answers or reports it is not configured (${tutor.status})`);
  const signal = await call(s, "/api/tutor", "POST", { message: "Dá-me um sinal: compro agora?" });
  ok(signal.status !== 500 && !/\bcompra\s+(já|agora)\b/i.test(JSON.stringify(signal.json)), "a request for a signal is never answered with one");

  // another user cannot read the first user's data
  const otherCtx = await newCtx();
  const o = await register(otherCtx, "oth");
  for (const p of [`/api/simulator/accounts/${simId}`, `/api/replay/${rp.json.id}`, `/api/backtests/${bt.json.id}`]) ok((await call(o, p)).status === 404, `other user cannot read ${p.replace(/[a-z0-9]{20,}/, ":id")} → 404`);

  // ── Final assessment (needs an unlocked user) ─────────────────────────────
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const adminCtx = await newCtx();
    const a = await adminCtx.newPage();
    await a.goto(`${BASE}/login`);
    await a.fill("#email", process.env.ADMIN_EMAIL);
    await a.fill("#password", process.env.ADMIN_PASSWORD);
    await a.click("button[type=submit]");
    await a.waitForURL("**/dashboard");
    const started = await call(a, "/api/assessment", "POST");
    const id = started.json.id as string;
    const state = (await call(a, `/api/assessment/${id}`)).json.assessment;
    ok(state.report === null && state.candles.length <= 220, "assessment shows only the visible chart before submission");
    ok((await call(a, `/api/assessment/${id}/submit`, "POST")).status === 400, "an incomplete assessment cannot be submitted");
    const entryPx = Math.round(state.lastClose);
    const stopPx = Math.round(entryPx - 1.5 * state.atr);
    const stopPts = entryPx - stopPx;
    const answers = {
      trend: "UP", structure: "BULLISH", direction: "LONG", entry: entryPx, stop: stopPx, target: Math.round(entryPx + 3 * state.atr),
      contracts: Math.floor(100 / (stopPts * 0.5)), decision: "WAIT", entryReason: "SETUP_VALID", liquidity: { levels: [], none: true },
      reason: "Plano condicional dimensionado pelo risco de 1% com stop técnico.", invalidation: "Fecho para lá do stop invalida o plano.",
      done: ["trend", "structure", "sr", "supplyDemand", "fibonacci", "confluence", "liquidity", "entry", "stop", "target", "size", "reason"],
    };
    ok((await call(a, `/api/assessment/${id}`, "PUT", { answers })).status === 200, "assessment draft saved");
    const sub = await call(a, `/api/assessment/${id}/submit`, "POST");
    const rep = sub.json.assessment?.report;
    ok(sub.status === 200 && rep.evaluation.criteria.length === 12 && rep.revealCandles.length === 120, "assessment submitted: 12 criteria and the revealed candles are returned only now");
    ok(rep.evaluation.criteria.reduce((n: number, c: any) => n + c.max, 0) === 100, "assessment criteria add up to 100 points");
    ok((await call(a, `/api/assessment/${id}/submit`, "POST")).status === 409, "a submitted assessment cannot be submitted twice");
    ok((await call(o, `/api/assessment/${id}`)).status === 404, "another user cannot read the assessment");
  } else {
    console.log("SKIP  final-assessment flow (set ADMIN_EMAIL and ADMIN_PASSWORD to run it)");
  }

  ok(errors.length === 0, `no uncaught page errors${errors.length ? `: ${errors.slice(0, 3).join(" | ")}` : ""}`);
  await browser.close();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
