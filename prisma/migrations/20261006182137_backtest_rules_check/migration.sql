-- Adherence counters must be coherent: 0 <= met <= total.
ALTER TABLE "BacktestDecision"
  ADD CONSTRAINT "BacktestDecision_rules_check"
  CHECK (("rulesMet" IS NULL AND "rulesTotal" IS NULL) OR ("rulesMet" IS NOT NULL AND "rulesTotal" IS NOT NULL AND "rulesMet" >= 0 AND "rulesMet" <= "rulesTotal"));
