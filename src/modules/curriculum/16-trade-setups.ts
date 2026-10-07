import { chart, mc, rr, sizing, tf } from "../dsl";
import type { ModuleDef } from "../types";

/**
 * Module 16 — Trade Setups (Level 6). Five EDUCATIONAL setups.
 * All examples are DIDACTIC illustrations with round numbers (not market data, not recorded results). A winning
 * example is never evidence that a setup works; a losing example is part of the same distribution. Costs
 * (spread, slippage, commissions) are ignored in the arithmetic for clarity and always reduce real results.
 */
export const tradeSetups: ModuleDef = {
  slug: "trade-setups",
  number: 16,
  level: 6,
  title: "Trade Setups",
  summary: "Cinco setups educativos — Trend Pullback, Breakout + Retest, Liquidity Sweep, S/R Reversal e Fibonacci Confluence — cada um com contexto, condições, entrada, stop, alvo, invalidação, risco, exemplos vencedor e perdedor, e quando NÃO usar.",
  difficulty: "INTERMEDIATE",
  icon: "Target",
  lessons: [
    {
      slug: "o-que-e-um-setup",
      title: "O que é (e o que não é) um setup",
      summary: "Um setup é um conjunto de condições definidas antes — não uma promessa de resultado.",
      minutes: 6,
      content: `Um **setup** é uma **situação descrita por regras**: contexto, condições, gatilho de entrada, invalidação e saída. Serve para **repetir decisões** de forma consistente e **medi-las**.

## O que um setup contém
1. **Contexto:** em que tipo de mercado se aplica;
2. **Condições:** o que tem de estar presente;
3. **Entrada:** o gatilho exato;
4. **Stop e invalidação:** onde a ideia fica errada;
5. **Alvo:** onde se espera sair (e o R:R);
6. **Risco e tamanho:** quanto se arrisca;
7. **Quando NÃO usar:** as situações em que a ideia não se aplica.

## O que um setup NÃO é
- ✘ Uma garantia ou um "sinal";
- ✘ Uma estratégia completa — falta gestão de risco, plano diário, psicologia;
- ✘ Algo que "funciona" porque aparece em bons exemplos — **só amostras grandes e honestas** dizem alguma coisa.

## Como ler as lições seguintes
Cada setup tem:
- **um exemplo vencedor** e **um perdedor** — ambos **didáticos** (números redondos para ser fácil contar); o vencedor **não é prova** e o perdedor **não é falha** do setup: é parte da distribuição;
- **cálculo do risco** com MYM ($0,50 por ponto) e um orçamento de risco — ignorando custos para clareza (os custos reais **reduzem** resultados);
- **uma lista de quando NÃO usar** — porque a disciplina é saber **quando não agir**.

## Regra de ouro
Se não consegues **escrever as regras** de um setup em meia página, **ainda não é um setup** — é uma intuição. Intuições testam-se, não se operam.`,
      example: `Duas descrições da "mesma" ideia:

- **Intuição:** "parece que vai subir, entro aqui";
- **Setup:** "H4 em alta, recuo para a antiga resistência a 38.420 (agora suporte), recuo de 50–61,8% do último impulso, engolfo a fechar acima de 38.512. Entrada 38.512, stop 38.408, alvo 38.710, risco 1%".

A segunda é **verificável**: depois de 30 casos podes medir o R médio. A primeira não.`,
      takeaways: ["Um setup é uma situação descrita por regras: contexto, condições, entrada, stop, alvo, risco e quando NÃO usar.", "Não é garantia nem estratégia completa; só amostras honestas dizem algo.", "Se não consegues escrever as regras em meia página, é intuição — testa antes de operar."],
      quiz: [
        mc("O que é um setup?", ["Um sinal garantido", "Uma situação descrita por regras definidas antes", "Um indicador", "Uma ordem"], 1, "Contexto, condições, entrada, stop, alvo e risco escritos antes."),
        tf("Um exemplo vencedor prova que o setup funciona.", false, "É uma amostra de um caso; só amostras grandes e honestas dizem algo."),
        mc("Que secção torna a disciplina mais forte?", ["O alvo", "Quando NÃO usar o setup", "A cor do gráfico", "O broker"], 1, "Saber quando não agir é parte do processo."),
        mc("Qual é o teste de que algo já é um setup?", ["Sentir convicção", "Conseguir escrever as regras em meia página de forma verificável", "Ter um bom exemplo", "Ter um indicador"], 1, "Regras escritas e verificáveis permitem medir."),
      ],
    },
    {
      slug: "setup-1-trend-pullback",
      title: "Setup 1 — Trend Pullback",
      summary: "Tendência → recuo → nível-chave → Fibonacci → confluência → confirmação → entrada.",
      minutes: 9,
      content: `**Fluxo:** Trend → Pullback → Key level → Fibonacci → Confluence → Confirmation → Entry

## Contexto
Mercado em **tendência** no timeframe superior (por exemplo, H4 em alta) e estrutura intacta no timeframe de trabalho (HH/HL). Procura-se entrar **a favor** da tendência **num recuo**.

## Condições
- Estrutura de alta com **último HL** identificado;
- Recuo para um **nível-chave** (S/R flipado, zona de procura, PDH/PDL anterior);
- Recuo dentro de uma **zona de Fibonacci** de interesse (por exemplo, 50%–78,6%);
- **Confluence Score** acima do teu limiar (por exemplo, ≥ 6);
- **R:R** ≥ 1,5 com stop técnico e alvo realista.

## Entrada
Depois de uma **confirmação**: candle de rejeição, engolfo a fechar acima do máximo anterior, ou mudança de estrutura no timeframe inferior. Entrada **acima do máximo do candle de confirmação** (ou a mercado ao fecho, se o plano o previr).

## Stop
**Abaixo do último HL** (ou da zona/pavio de rejeição), com folga para o ruído (uma fração do ATR).

## Alvo
O **máximo anterior** (ponto B) ou a **extensão** de 127,2%; opcionalmente, parcial no primeiro obstáculo.

## Invalidação
Fecho **abaixo do último HL** ou da zona: a sequência de mínimos mais altos acabou.

## Risco
Por exemplo, **1% da conta**. Tamanho = orçamento ÷ risco por contrato (arredondado para baixo).

## Exemplo vencedor
Conta $10.000, orçamento **$100**, MYM. Entrada **38.520**, stop **38.420** (**100 pontos**), alvo **38.720** (**200 pontos**): **R:R = 2:1**. Risco por MYM = 100 × $0,50 = $50 → **2 contratos** (risco $100). O preço sobe até 38.720: **+200 pontos × $0,50 × 2 = +$200 (+2R)**, antes de custos.

## Exemplo perdedor
O mesmo setup, as mesmas regras: o recuo continua e o preço **fecha abaixo de 38.420**. O stop é atingido: **−100 pontos × $0,50 × 2 = −$100 (−1R)**, antes de custos. O processo foi cumprido — **uma perda não invalida o setup**, e o stop fez o que devia: **limitar o custo de estar errado**.

## Quando NÃO usar
- O timeframe superior está **contra** (ou a ideia é assumidamente contra-tendência);
- O recuo é **muito profundo** (perto ou abaixo de 100%) ou já **quebrou o último HL**;
- **Notícias de impacto** iminentes ou em curso (ver módulo de Economic Fundamentals);
- O stop técnico dá um **risco acima do orçamento** (não alargues o risco para caber);
- **Score abaixo do limiar** ou sem confirmação;
- Liquidez reduzida (horário pouco ativo, perto de feriados).`,
      example: `Registo de journal de um caso: "Setup 1 — Trend Pullback. H4 alta, M15 recuo para 38.420–38.455, Fib 50–61,8%, engolfo. Score 7/8. Entrada 38.520, stop 38.420, alvo 38.720. Risco $100. Razão: setup válido. Regras 12/12. Resultado: +2R / −1R (preenche depois). Avaliação do processo: 5/5." O campo de avaliação do processo **não depende do resultado**.`,
      visual: { kind: "scenario", scenarioId: "conf-strong-long", annotations: "solution", caption: "Um exemplo educativo: recuo para um nível flipado, com varrimento de mínimos iguais e engolfo." },
      exercise: { kind: "confluence", scenarioId: "conf-strong-long", prompt: "Analisa este setup: identifica os fatores presentes e decide TAKE ou NO TRADE." },
      takeaways: ["Trend Pullback: entrar a favor da tendência num recuo para um nível-chave, com Fibonacci, confluência e confirmação.", "Stop abaixo do último HL; alvo no máximo anterior ou extensão; risco ~1% com tamanho arredondado para baixo.", "Não usar contra o timeframe superior, em recuos muito profundos, em notícias ou com stop acima do orçamento."],
      quiz: [
        rr("Entrada 38.520, stop 38.420, alvo 38.720. Qual é o R:R?", 2, 0.01, "Alvo 200 ÷ stop 100 = 2,0."),
        sizing("Orçamento $100, MYM ($0,50/ponto), stop de 100 pontos. Quantos contratos?", 2, "contratos", "Risco por MYM = 100 × $0,50 = $50; $100 ÷ $50 = 2."),
        mc("Onde costuma ficar o stop no Trend Pullback?", ["Em cima da entrada", "Abaixo do último HL (ou da zona de rejeição), com folga", "A 5 pontos", "Não há stop"], 1, "É a invalidação técnica da ideia."),
        mc("Em que situação NÃO se deve usar o Trend Pullback?", ["Com recuo raso e estrutura intacta", "Quando o recuo é muito profundo ou já quebrou o último HL", "Com confirmação", "Com R:R de 2"], 1, "Um recuo que quebra o último HL questiona a estrutura de alta."),
      ],
    },
    {
      slug: "setup-2-breakout-retest",
      title: "Setup 2 — Breakout + Retest",
      summary: "Consolidação → rompimento → reteste → confirmação → entrada.",
      minutes: 9,
      content: `**Fluxo:** Consolidation → Breakout → Retest → Confirmation → Entry

## Contexto
O preço **consolida** num range definido (com pelo menos duas rejeições em cada extremo) e **rompe** um dos limites com **fecho** claro. A ideia é entrar no **reteste**, não no rompimento.

## Condições
- Range **definido** com limites claros (zonas, não linhas exatas);
- **Fecho** para lá do limite (não só pavio), com candle de **corpo grande** face ao ATR;
- O preço **regressa** ao limite rompido (reteste) sem voltar para dentro;
- **Confluência** com outro fator (por exemplo, nível redondo, estrutura do timeframe superior a favor);
- **R:R** ≥ 1,5.

## Entrada
Após **rejeição no reteste** (candle de rejeição, mudança de estrutura no timeframe inferior). Entrada acima do máximo do candle de rejeição (numa compra).

## Stop
**Do outro lado do nível rompido**, com folga (por exemplo, abaixo do mínimo do reteste).

## Alvo
A **altura do range** projetada a partir do rompimento, ou o **próximo nível relevante**. Escolhe o que for **mais conservador** e que dê R:R aceitável.

## Invalidação
**Fecho de volta para dentro do range**: o rompimento foi falso.

## Risco
Exemplo: **0,9% da conta** (stops curtos permitem mais contratos).

## Exemplo vencedor
Range **39.000–39.050**; fecho de rompimento em **39.140**; reteste com mínimo em 39.045 e candle de rejeição. Entrada **39.075**, stop **39.030** (**45 pontos**), alvo **39.200** (**125 pontos**) → **R:R ≈ 2,8:1**. Orçamento $90, MYM: 45 × $0,50 = $22,50 por contrato → **4 contratos** (risco $90). Alvo atingido: **+125 × $0,50 × 4 = +$250 (≈ +2,8R)**, antes de custos.

## Exemplo perdedor
O reteste **falha**: o preço fecha em **39.030**, dentro do range. Stop atingido: **−45 × $0,50 × 4 = −$90 (−1R)**. O rompimento foi falso; o stop limitou a perda ao planeado.

## Quando NÃO usar
- O range é **muito estreito** (rompimentos falsos frequentes) ou **muito largo** (stop e R:R maus);
- Há **vários rompimentos falsos recentes** no mesmo mercado e período — a confiança no padrão diminuiu;
- **Notícias** em curso (spreads largos e saltos);
- O **reteste não acontece** — **não persigas** o rompimento: espera o próximo setup;
- O stop técnico fica **acima do orçamento**;
- Contexto do timeframe superior **contra** o rompimento (a ideia passa a ser contra-tendência).`,
      example: `Num journal de 20 casos de Breakout + Retest, 7 resultaram em alvo, 9 em stop e 4 em breakeven — R médio de **+0,05R**. Parece pouco? É **honesto**: amostra pequena, sem custos, e o objetivo é treinar a medição. Quem só guardasse os 7 vencedores concluiria o contrário — **viés de seleção**.`,
      visual: {
        kind: "candles",
        candles: [
          [39000, 39040, 38990, 39020],
          [39020, 39050, 39000, 39010],
          [39010, 39045, 38995, 39035],
          [39035, 39050, 39000, 39015],
          [39015, 39155, 39010, 39140],
          [39140, 39180, 39110, 39170],
          [39170, 39175, 39080, 39100],
          [39100, 39110, 39045, 39060],
          [39060, 39140, 39055, 39130],
          [39130, 39210, 39120, 39200],
        ],
        overlays: [
          { type: "hline", id: "lvl", price: 39050, label: "Limite do range (resistência rompida)", tone: "warning", dashed: true },
          { type: "marker", id: "bo", index: 4, price: 39155, label: "Rompimento", placement: "above", tone: "primary" },
          { type: "marker", id: "rt", index: 7, price: 39045, label: "Reteste", placement: "below", tone: "success" },
        ],
        caption: "Rompimento, reteste e continuação (ilustração didática).",
        height: 300,
      },
      takeaways: ["Breakout + Retest: entrar no reteste do limite rompido, não no rompimento.", "Stop do outro lado do nível; invalidação = fecho de volta para dentro; alvo conservador (altura do range ou próximo nível).", "Não usar sem reteste, com range inadequado, em notícias ou contra o contexto superior."],
      quiz: [
        rr("Entrada 39.075, stop 39.030, alvo 39.200. Qual é o R:R (1 casa decimal)?", 2.8, 0.05, "Alvo 125 ÷ stop 45 = 2,78."),
        sizing("Orçamento $90, MYM, stop de 45 pontos. Quantos contratos?", 4, "contratos", "Risco por MYM = 45 × $0,50 = $22,50; $90 ÷ $22,50 = 4."),
        mc("O que invalida a ideia no Breakout + Retest?", ["Mais um candle verde", "Fecho de volta para dentro do range", "O volume subir", "A hora mudar"], 1, "O rompimento foi falso."),
        tf("Se o reteste não acontece, a melhor resposta é perseguir o rompimento.", false, "Sem reteste não há setup: espera o próximo."),
      ],
    },
    {
      slug: "setup-3-liquidity-sweep",
      title: "Setup 3 — Liquidity Sweep",
      summary: "Nível de liquidez → varrimento → rejeição → mudança de estrutura → entrada.",
      minutes: 9,
      content: `**Fluxo:** Liquidity level → Sweep → Rejection → Structure shift → Entry

## Contexto
Existe um **nível óbvio** (máximos/mínimos iguais, PDH/PDL, extremo de sessão). O preço **fura** o nível e **volta rapidamente para dentro**, sem aceitação do lado de fora. Procura-se uma ideia de **reversão** a partir daí. (Ver o módulo de Liquidity — o que é observável e o que é teoria.)

## Condições
- Nível **claro e objetivo**, com tolerância definida (por exemplo, ≤ 0,3 × ATR);
- **Varrimento**: o preço ultrapassa o nível e **fecha de volta para dentro** (ou o candle seguinte reverte);
- **Rejeição** visível (pavio longo, candle de reversão);
- **Mudança de estrutura** no timeframe inferior (quebra do último HL, numa ideia de venda);
- **R:R** ≥ 1,5, com alvo na liquidez oposta ou no meio do range.

## Entrada
Depois da **mudança de estrutura** (e não no instante do pavio). Numa venda: entrada abaixo do mínimo do candle de rejeição ou do mini-HL quebrado.

## Stop
**Acima do extremo do varrimento** (o pavio), com folga.

## Alvo
A **liquidez do lado oposto** (mínimo anterior, PDL) ou o **meio do range**, conforme o R:R.

## Invalidação
O preço **fecha acima do extremo do varrimento** (numa venda): era um rompimento verdadeiro.

## Risco
Exemplo: **0,9%** (o pavio do varrimento define stops mais largos; o tamanho tem de refletir isso).

## Exemplo vencedor
Máximos iguais em **39.100**. O preço fura até **39.140** e **fecha em 39.060**. Mudança de estrutura no M5. **Venda 39.060**, stop **39.150** (**90 pontos**), alvo **38.880** (**180 pontos**) → **R:R = 2:1**. Orçamento $90, MYM: 90 × $0,50 = $45 por contrato → **2 contratos**. Alvo atingido: **+180 × $0,50 × 2 = +$180 (+2R)**, antes de custos.

## Exemplo perdedor
O preço **fecha acima de 39.150**: o "varrimento" era um rompimento verdadeiro e a subida continua. Stop atingido: **−90 × $0,50 × 2 = −$90 (−1R)**. A hipótese ("stops executados e falta de compradores") **era só uma hipótese**.

## Quando NÃO usar
- **Dias de tendência forte** a favor do rompimento (varrimentos tendem a falhar mais — hipótese a medir);
- **Sem mudança de estrutura** depois do varrimento — entrar "só pelo pavio" é perseguir uma hipótese;
- **Notícias** à porta: o varrimento pode ser só volatilidade;
- O **pavio** exige stop acima do orçamento;
- Nível **pouco claro** ou escolhido depois do movimento (viés retrospetivo);
- Fora do teu **horário/janela** definida.`,
      example: `Em 15 casos registados do Setup 3: 6 alvos, 7 stops, 2 breakevens — R médio de **+0,07R** sem custos; com custos, **negativo**. A conclusão honesta é que, com esta amostra, **não há evidência de vantagem** — o que obriga a rever as regras (por exemplo, exigir também alinhamento com o timeframe superior) e **testar de novo**.`,
      visual: {
        kind: "candles",
        candles: [
          [39000, 39060, 38990, 39050],
          [39050, 39100, 39040, 39060],
          [39060, 39070, 39010, 39020],
          [39020, 39050, 39000, 39040],
          [39040, 39098, 39030, 39060],
          [39060, 39070, 39015, 39025],
          [39025, 39040, 39000, 39035],
          [39035, 39140, 39030, 39060],
          [39060, 39065, 38985, 38995],
          [38995, 39005, 38930, 38940],
          [38940, 38960, 38900, 38910],
        ],
        overlays: [
          { type: "hline", id: "eq", price: 39100, label: "Máximos iguais (~39.100)", tone: "warning", dashed: true },
          { type: "marker", id: "sw", index: 7, price: 39140, label: "Varrimento", placement: "above", tone: "danger" },
        ],
        caption: "Varrimento de máximos iguais com fecho de volta para dentro (ilustração didática).",
        height: 320,
      },
      takeaways: ["Liquidity Sweep: fura um nível óbvio, volta para dentro, rejeição e mudança de estrutura → ideia de reversão.", "Stop acima do extremo do varrimento; alvo na liquidez oposta; invalidação = fecho para lá do extremo.", "Não usar sem mudança de estrutura, em dias de tendência forte a favor do rompimento, em notícias ou com nível pouco claro."],
      quiz: [
        rr("Entrada 39.060 (venda), stop 39.150, alvo 38.880. Qual é o R:R?", 2, 0.01, "Alvo 180 ÷ stop 90 = 2,0."),
        sizing("Orçamento $90, MYM, stop de 90 pontos. Quantos contratos?", 2, "contratos", "Risco por MYM = 90 × $0,50 = $45; $90 ÷ $45 = 2."),
        mc("Qual é a invalidação do Liquidity Sweep numa venda?", ["Fecho abaixo do mínimo", "Fecho acima do extremo do varrimento", "Mais um candle", "A hora"], 1, "Se fecha acima, era um rompimento verdadeiro."),
        tf("Entrar apenas pelo pavio de varrimento, sem mudança de estrutura, é uma boa prática.", false, "Sem mudança de estrutura estás a perseguir uma hipótese."),
      ],
    },
    {
      slug: "setup-4-sr-reversal",
      title: "Setup 4 — Support/Resistance Reversal",
      summary: "Nível-chave → rejeição → confirmação → entrada.",
      minutes: 9,
      content: `**Fluxo:** Key level → Rejection → Confirmation → Entry

## Contexto
O preço aproxima-se de uma **zona de S/R relevante** (várias rejeições, visível no timeframe superior) e **rejeita**. A ideia é uma **reversão** a partir da zona — **idealmente** alinhada com a estrutura do timeframe superior (por exemplo, rejeição de uma resistência num contexto lateral ou de baixa).

## Condições
- **Zona** desenhada como zona (largura de ~0,3–0,5 × ATR), com pelo menos **duas** reações anteriores;
- **Rejeição** no toque (pavio longo, candle de reversão);
- **Confirmação** no candle seguinte (fecho abaixo do mínimo do candle de rejeição, numa venda);
- **Espaço livre** até ao alvo (sem obstáculos óbvios a meio);
- **R:R** ≥ 1,5; **Confluência** com pelo menos mais um fator.

## Entrada
Após a **confirmação**: entrada abaixo do mínimo do candle de rejeição (numa venda) ou no fecho do candle de confirmação.

## Stop
**Acima da zona** (e do pavio de rejeição), com folga.

## Alvo
O **meio do range** ou a **zona oposta**; considera sair em parcelas.

## Invalidação
**Fecho para lá da zona** (acima da resistência, numa venda) — a rejeição falhou.

## Risco
Exemplo: **0,9%** — o stop é curto (largura da zona), por isso o tamanho pode ser maior; vigia os custos.

## Exemplo vencedor
Resistência **38.585–38.625** (3 rejeições anteriores). Um pin bar rejeita a zona (máximo 38.630) e o candle seguinte fecha abaixo do mínimo. **Venda 38.595**, stop **38.640** (**45 pontos**), alvo **38.450** (**145 pontos**, meio do range) → **R:R ≈ 3,2:1**. Orçamento $90, MYM: 45 × $0,50 = $22,50 → **4 contratos**. Alvo atingido: **+145 × $0,50 × 4 = +$290 (≈ +3,2R)**, antes de custos.

## Exemplo perdedor
O preço **fecha acima de 38.640**: a zona foi **aceite** e rompida. Stop atingido: **−45 × $0,50 × 4 = −$90 (−1R)**. Um stop curto dá R:R generoso — mas também **é mais fácil de ser atingido** por ruído.

## Quando NÃO usar
- O nível foi **testado demasiadas vezes** recentemente (pode estar "gasto");
- Chegada ao nível com **momentum forte** (candles grandes, sem pausa);
- **Contra** uma tendência forte do timeframe superior, sem razão para a assumir;
- **Zona muito larga** (o stop deixa de ser curto);
- **Notícias** próximas, em que os níveis perdem fiabilidade;
- Nível **desenhado depois** do movimento.`,
      example: `A atenção neste setup está no **stop curto**: 45 pontos num mercado com ATR de 50 por candle de 15 minutos é **menos de um ATR**. Em muitos dias, o ruído normal chega para o tocar. O R:R é generoso **no papel**; na prática, o setup só deve ser usado se medires, com **tua amostra**, que o stop curto sobrevive o suficiente.`,
      visual: { kind: "scenario", scenarioId: "levels-range-01", annotations: "none", caption: "Resistência (≈ 38.600) e suporte (≈ 38.300) bem definidos: o contexto ideal deste setup." },
      takeaways: ["S/R Reversal: rejeição + confirmação numa zona relevante, com espaço livre até ao alvo.", "Stop acima da zona; invalidação = fecho para lá da zona; alvo no meio do range ou zona oposta.", "Cuidado com stops curtos: o R:R é bom no papel, mas o ruído pode atingi-los; não usar com níveis gastos ou momentum forte."],
      quiz: [
        rr("Venda em 38.595, stop 38.640, alvo 38.450. Qual é o R:R (1 casa decimal)?", 3.2, 0.05, "Alvo 145 ÷ stop 45 = 3,22."),
        sizing("Orçamento $90, MYM, stop de 45 pontos. Quantos contratos?", 4, "contratos", "Risco por MYM = 45 × $0,50 = $22,50; $90 ÷ $22,50 = 4."),
        mc("Qual é uma situação em que NÃO usar este setup?", ["Zona com 3 rejeições", "Chegada ao nível com momentum forte e sem pausa", "Espaço livre até ao alvo", "R:R de 2"], 1, "Momentum forte aumenta a probabilidade de a zona ser rompida."),
        tf("Um stop muito curto torna o setup mais seguro.", false, "Um stop curto é mais fácil de ser atingido pelo ruído normal; o risco em dólares é pequeno, mas a taxa de stops pode subir."),
      ],
    },
    {
      slug: "setup-5-fibonacci-confluence",
      title: "Setup 5 — Fibonacci Confluence",
      summary: "Estrutura → Fibonacci → zona-chave → confluência → confirmação → entrada.",
      minutes: 9,
      content: `**Fluxo:** Structure → Fibonacci → Key zone → Confluence → Confirmation → Entry

## Contexto
Estrutura **clara** (alta ou baixa) com um impulso A→B recente e relevante; o preço recua. Procura-se uma **zona onde vários fatores coincidem** com o recuo de Fibonacci.

## Condições
- **Estrutura** intacta, com último HL/LH identificado;
- Swing **A→B** escolhido com regra definida **antes**;
- **Zona de Fibonacci** (por exemplo, 50%–78,6%) a coincidir com **pelo menos mais um** fator independente (S/R, oferta/procura, linha de tendência, nível redondo);
- **Confirmação** no preço (rejeição, engolfo, mudança de estrutura em timeframe inferior);
- **R:R** ≥ 1,5 e **score** acima do limiar.

## Entrada
Depois da confirmação **dentro da zona** (por exemplo, fecho acima do máximo do candle de rejeição).

## Stop
**Abaixo da zona** (por exemplo, abaixo de 78,6%/88,6% com folga) — ou abaixo do ponto A, se aceitares o risco maior.

## Alvo
O **ponto B** (máximo do impulso) ou uma **extensão** (por exemplo, 127,2%).

## Invalidação
**Fecho abaixo da zona** (ou do ponto A): o recuo foi demasiado profundo para a ideia.

## Risco
Exemplo: **0,65%**. Stops mais largos (a zona é larga) → **menos contratos**.

## Exemplo vencedor
Impulso **A = 37.950 → B = 38.550** (600 pontos). Zona 61,8% = **38.179**, a coincidir com um suporte antigo perto de **38.200**. Engolfo bullish a fechar acima do máximo anterior. **Compra 38.200**, stop **38.070** (**130 pontos**, abaixo de 78,6% = 38.078), alvo **38.550** (**350 pontos**) → **R:R ≈ 2,7:1**. Orçamento $100, MYM: 130 × $0,50 = $65 → **1 contrato** (risco $65 = 0,65%). Alvo atingido: **+350 × $0,50 = +$175 (≈ +2,7R)**, antes de custos.

## Exemplo perdedor
O recuo continua até **fechar abaixo de 38.070**: stop atingido. **−130 × $0,50 = −$65 (−1R)**. Tal como mostra o cenário "pullback profundo que falha": quanto mais fundo o recuo, **mais fraca a tese** — e o nível de Fibonacci **não protegeu** ninguém: o stop sim.

## Quando NÃO usar
- **Swing A→B escolhido a posteriori** (viés de confirmação);
- Impulso **pequeno** face ao ATR (a régua mede ruído);
- Recuo que já **quebrou** o último HL/LH;
- Fibonacci como **único** fator (sem confluência = só uma linha);
- **Risco acima do orçamento** com o stop técnico;
- Notícias iminentes ou liquidez fraca.`,
      example: `Um aluno testa o Setup 5 em replay durante 4 semanas: 22 ideias, 11 tomadas. Das 11: 4 alvos, 6 stops, 1 breakeven. R médio sem custos: **−0,02R**. A conclusão honesta é que **não há evidência de vantagem** nesta amostra — mas há **evidência de processo** (10/11 com regras cumpridas), que é o que o laboratório premeia. O próximo passo é aumentar a amostra e/ou rever os critérios.`,
      visual: {
        kind: "candles",
        candles: [
          [37960, 37990, 37950, 37985],
          [37985, 38110, 37980, 38100],
          [38100, 38240, 38090, 38230],
          [38230, 38360, 38220, 38350],
          [38350, 38470, 38340, 38460],
          [38460, 38550, 38450, 38530],
          [38530, 38540, 38440, 38450],
          [38450, 38460, 38330, 38340],
          [38340, 38350, 38240, 38250],
          [38250, 38260, 38180, 38200],
          [38200, 38300, 38190, 38290],
          [38290, 38420, 38280, 38410],
          [38410, 38560, 38400, 38545],
        ],
        overlays: [
          {
            type: "fib",
            id: "fib",
            fromIndex: 0,
            anchors: [
              { index: 0, price: 37950, label: "A" },
              { index: 5, price: 38550, label: "B" },
            ],
            levels: [
              { ratio: 0, price: 38550, label: "0%" },
              { ratio: 0.5, price: 38250, label: "50%", emphasis: true },
              { ratio: 0.618, price: 38179.2, label: "61,8%", emphasis: true },
              { ratio: 0.786, price: 38078.4, label: "78,6%", emphasis: true },
              { ratio: 1, price: 37950, label: "100%" },
            ],
          },
        ],
        caption: "Recuo para a zona 50%–78,6% do impulso A→B (ilustração didática).",
        height: 340,
      },
      exercise: { kind: "fibonacci", scenarioId: "fib-bull-618", prompt: "Marca A e B neste cenário e identifica a zona onde o recuo terminou." },
      takeaways: ["Fibonacci Confluence: zona de Fibonacci que coincide com pelo menos mais um fator independente e com confirmação.", "Stop abaixo da zona; alvo em B ou extensão; invalidação = fecho abaixo da zona.", "Não usar com swing escolhido a posteriori, impulso pequeno ou Fibonacci como único fator."],
      quiz: [
        rr("Compra em 38.200, stop 38.070, alvo 38.550. Qual é o R:R (1 casa decimal)?", 2.7, 0.05, "Alvo 350 ÷ stop 130 = 2,69."),
        sizing("Orçamento $100, MYM, stop de 130 pontos. Quantos contratos?", 1, "contratos", "Risco por MYM = 130 × $0,50 = $65; $100 ÷ $65 = 1,54 → 1."),
        mc("Qual é a condição que distingue este setup de 'só Fibonacci'?", ["Usar mais rácios", "A zona de Fibonacci coincidir com pelo menos mais um fator independente e com confirmação", "Usar o maior swing", "Ignorar o stop"], 1, "Sem confluência, é só uma linha."),
        tf("Escolher o swing A→B depois de ver onde o preço parou é aceitável.", false, "É viés de confirmação; a regra deve ser definida antes."),
      ],
    },
    {
      slug: "escolher-e-medir-setups",
      title: "Escolher e medir os teus setups",
      summary: "Como transformar cinco setups em uma ou duas rotinas testadas — e porquê menos é mais.",
      minutes: 7,
      content: `Cinco setups **não** são cinco coisas para operar ao mesmo tempo. Escolhe **um ou dois** que:

- Compreendes bem e consegues **descrever em meia página**;
- Se adequam ao teu **horário** e à tua **janela de atividade**;
- Cabem no teu **risco** (stops tecnicamente válidos dentro do orçamento);
- Consegues **medir**.

## Medir um setup
Para cada setup que usares, regista:
- **Nº de ideias** (incluindo as que não tomaste) e **nº de trades**;
- **R médio**, **taxa de acerto**, **expectancy**, **drawdown**;
- **Cumprimento do processo** (percentagem de trades com regras cumpridas);
- **Melhor/pior sessão** e **melhor/pior contexto** (tendência, range, notícia).

## Com que amostra?
Quanto mais, melhor — e não há número mágico. Com **menos de 30 trades**, as estatísticas são sobretudo **ruído**. Só amostras grandes, com **custos reais**, dizem algo sobre vantagem — e dados sintéticos servem para **treinar o processo**, não para provar vantagem.

## Perguntas para a revisão
1. Cumpri as regras (sim/não)?
2. O contexto era o previsto?
3. Se perdi: foi variância ou erro de processo?
4. Se ganhei: foi com o processo ou por sorte?
5. Que **uma** regra alteraria — e como a testaria?

## Armadilhas
- **Strategy hopping**: saltar de setup em setup depois de duas perdas;
- **Overfitting**: ajustar as regras para "explicar" os trades passados;
- **Cherry-picking**: mostrar só os melhores exemplos;
- **Ignorar os custos**.

> Um bom setup é **aborrecido**: regras simples, repetidas, medidas e revistas.`,
      example: `Plano de 8 semanas: **Setup 1** (Trend Pullback) em replay, **40 ideias** registadas, cumprir regras ≥ 90%; **semana 5**: rever R médio, taxa de acerto e drawdown; **semana 8**: decidir se continua, se se ajusta **uma regra** (e se reinicia a amostra) ou se se abandona. **Nunca** mudar o setup a meio de uma série.`,
      exercise: { kind: "link", href: "/backtest", label: "Abrir o Backtesting Lab", prompt: "Cria um backtest com a estratégia que mais se aproxima do teu setup e regista pelo menos 30 decisões." },
      takeaways: ["Escolhe um ou dois setups que compreendes, que cabem no teu risco e que consegues medir.", "Mede nº de ideias, R médio, expectancy, drawdown e cumprimento do processo; com menos de 30 trades é sobretudo ruído.", "Evita strategy hopping, overfitting e cherry-picking."],
      quiz: [
        mc("Quantos setups deves operar ao mesmo tempo, em princípio?", ["Todos", "Um ou dois que compreendes e consegues medir", "Dez", "Nenhum"], 1, "Foco e medição valem mais do que variedade."),
        tf("Com 12 trades já tens uma boa estimativa da vantagem de um setup.", false, "Com menos de 30 trades, as estatísticas são sobretudo ruído."),
        mc("O que é strategy hopping?", ["Testar um setup", "Saltar de setup em setup depois de duas perdas", "Usar o journal", "Ajustar o stop"], 1, "É um erro psicológico clássico que impede a medição."),
        mc("Qual é uma boa pergunta de revisão?", ["Quanto ganhei?", "Se perdi: foi variância ou erro de processo?", "Qual é o melhor indicador?", "Quem tem razão?"], 1, "Distinguir variância de erro de processo é central."),
      ],
    },
  ],
  quiz: {
    title: "Quiz do módulo — Trade Setups",
    passScore: 70,
    questions: [
      mc("O que é um setup?", ["Um sinal garantido", "Uma situação descrita por regras definidas antes", "Um indicador", "Um tipo de ordem"], 1, "É contexto, condições, entrada, stop, alvo e risco escritos antes."),
      chart("VALID_SETUP", "conf-strong-long", "Este cenário cumpre os critérios de um setup bem fundamentado (7/8, R:R ≈ 1,9)?", ["Sim: tem contexto, confirmação, stop técnico e R:R aceitável", "Não: não tem nenhum fator", "Não: o R:R é inferior a 1", "Não existe stop"], 0, "Há tendência, estrutura, nível flipado, Fibonacci, price action, liquidez e R:R aceitável."),
      chart("VALID_SETUP", "conf-weak-long", "Este cenário cumpre os critérios de um setup bem fundamentado?", ["Sim: é só comprar", "Não: é contra a estrutura, sem confirmação e com R:R de 0,6", "Sim: tem R:R elevado", "Sim: tem confluência"], 1, "Contra a estrutura, sem confirmação e com R:R de 0,6 não passa."),
      rr("Entrada 38.520, stop 38.420, alvo 38.720. Qual é o R:R?", 2, 0.01, "Alvo 200 ÷ stop 100 = 2,0."),
      sizing("Orçamento $90, MYM, stop de 45 pontos. Quantos contratos?", 4, "contratos", "Risco por MYM = 45 × $0,50 = $22,50; $90 ÷ $22,50 = 4."),
      mc("O que invalida o Breakout + Retest?", ["Mais um candle", "Fecho de volta para dentro do range", "O volume", "A hora"], 1, "O rompimento foi falso."),
      mc("Qual é a invalidação de um Liquidity Sweep numa venda?", ["Fecho abaixo do mínimo", "Fecho acima do extremo do varrimento", "Nenhuma", "A hora"], 1, "Se fecha acima do extremo do varrimento, era um rompimento verdadeiro."),
      tf("Um exemplo vencedor prova que o setup funciona.", false, "É um caso isolado; só amostras grandes e honestas dizem algo."),
      mc("Em que situação NÃO usar o Trend Pullback?", ["Recuo raso e estrutura intacta", "Recuo que já quebrou o último HL", "Confirmação presente", "R:R de 2"], 1, "A quebra do último HL questiona a estrutura de alta."),
      mc("Qual é uma boa prática para medir um setup?", ["Guardar só os melhores exemplos", "Registar todas as ideias e medir R médio, expectancy, drawdown e cumprimento do processo", "Mudar as regras a meio", "Ignorar custos"], 1, "Registo completo e medição consistente."),
    ],
  },
};
