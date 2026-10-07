import { mc, num, rr, sizing, tf } from "../dsl";
import type { ModuleDef } from "../types";

/**
 * Module 17 — Risk Management (Level 7). The most complete module (spec §21–22).
 * Drawdown/recovery figures and losing-streak statistics were computed (closed form and Monte Carlo, independent
 * trades) — not recalled. Percentages of risk per trade are conventions to be tested, never rules.
 */
export const riskManagement: ModuleDef = {
  slug: "risk-management",
  number: 17,
  level: 7,
  title: "Risk Management",
  summary: "Risco por trade, tamanho de posição, distância ao stop, valor do tick, R-multiple, R:R, perdas máximas diária e semanal, drawdown, sequências de perdas e valor esperado — com as calculadoras YM/MYM.",
  difficulty: "ADVANCED",
  icon: "ShieldCheck",
  lessons: [
    {
      slug: "risco-por-trade",
      title: "Risco por trade: a decisão que vem primeiro",
      summary: "Definir quanto estás disposto a perder antes de pensares em quanto podes ganhar.",
      minutes: 7,
      content: `A gestão de risco começa por uma pergunta: **"Quanto estou disposto a perder se esta ideia estiver errada?"** — e responde-se **antes** de qualquer análise de entrada.

## O risco por trade
É a **perda máxima planeada** num trade, normalmente expressa como **percentagem da conta**:

\`orçamento de risco ($) = saldo da conta × risco por trade (%)\`

## Que percentagem?
Não há um valor "certo". Convenções frequentemente citadas situam-se **entre 0,25% e 2%** por trade; muitos materiais educativos usam **1%** como referência. É uma **convenção a testar**, não uma regra. Quanto menor, mais **sobrevives** a sequências de perdas (ver lição de drawdown); quanto maior, mais depressa a conta oscila.

## Porque tão pequeno?
Porque **perdas seguidas acontecem** (e acontecem mais do que a intuição sugere) e porque **recuperar** de uma grande perda exige um ganho **desproporcionado**:

- Perder **10%** exige **+11,1%** para recuperar;
- Perder **20%** exige **+25%**;
- Perder **50%** exige **+100%**.

## O que o risco por trade NÃO é
- ✘ **Não é** o valor investido nem a margem;
- ✘ **Não é** fixo para sempre — recalcula-se com o saldo (ou define-se um valor fixo em dólares por uma regra tua);
- ✘ **Não** inclui só a distância ao stop: inclui também **comissões** e uma margem para **slippage**.

## Regra de ouro
O risco por trade **vem do plano, não da convicção**. Uma ideia "de certeza" arrisca o mesmo que uma ideia normal — porque "certezas" também perdem.`,
      example: `Conta de **$10.000**:

- Risco de **1%** = **$100** por trade;
- Risco de **0,5%** = **$50**;
- Risco de **2%** = **$200**.

Depois de uma perda de $100, a conta fica em **$9.900** e o orçamento de 1% passa a **$99**. O risco **acompanha** o saldo — nas boas e nas más fases.`,
      exercise: { kind: "calculator", tool: "risk", prompt: "Define saldo $10.000 e risco de 1%. Qual é o orçamento em dólares? E com 0,5%?" },
      takeaways: ["O risco por trade define-se antes da entrada, como percentagem da conta convertida em dólares.", "Convenções de 0,25–2% (muitas vezes 1%) são pontos de partida a testar, não regras.", "Recuperar de perdas exige ganhos desproporcionados: −50% pede +100%."],
      quiz: [
        num("Conta $20.000, risco 1%. Qual é o orçamento de risco por trade, em dólares?", 200, 0, "$", "20.000 × 1% = $200."),
        num("Para recuperar de uma perda de 20% da conta, que ganho é necessário (%)?", 25, 0.01, "%", "1 ÷ 0,80 − 1 = 25%."),
        tf("Uma ideia 'de certeza' justifica arriscar mais do que o plano.", false, "O risco vem do plano; mesmo as 'certezas' perdem."),
        mc("O que NÃO inclui o risco por trade?", ["Comissões", "Margem de slippage", "A convicção do trader como multiplicador", "A distância ao stop"], 2, "A convicção não deve alterar o risco: ele vem do plano."),
      ],
    },
    {
      slug: "distancia-ao-stop-e-valor-do-tick",
      title: "Distância ao stop e valor do tick",
      summary: "Converter pontos em dólares: o cálculo base de qualquer plano de risco.",
      minutes: 7,
      content: `O risco em dólares de **1 contrato** resulta de duas coisas:

\`risco por contrato = pontos até ao stop × valor por ponto (+ comissões e slippage)\`

## Valor por ponto (futuros do Dow — CME, confirmado por excerto em 2026-10-06)
- **YM:** $5,00 por ponto (tick de 1 ponto = $5,00);
- **MYM:** $0,50 por ponto (tick de 1 ponto = $0,50);
- **US30 CFD:** **depende do broker** — nunca assumas.

## A distância ao stop
Vem da **análise** (onde a ideia fica invalidada), **não** do orçamento:

- **Errado:** "Quero arriscar $100, por isso o stop fica a 20 pontos";
- **Certo:** "A invalidação técnica fica a 55 pontos; quanto custa? Cabe no orçamento? Se não, reduzo o tamanho ou passo."

## Incluir os custos
O risco real de um trade inclui:
- **Comissões** (ida e volta);
- **Spread** (já implícito na entrada) e **slippage** esperado no stop;
- **Margem para ruído** (a folga que deixas para lá do nível).

Muitas calculadoras permitem acrescentar **comissão ida e volta** e **slippage** em pontos — usa-as, sobretudo com stops curtos, onde os custos pesam mais.

## O erro mais comum
**Esticar ou encolher o stop para "caber" no tamanho que queres.** O stop é um facto do gráfico; o tamanho é que se ajusta.`,
      example: `Stop a **55 pontos**:
- **MYM:** 55 × $0,50 = **$27,50** por contrato;
- **YM:** 55 × $5 = **$275** por contrato.

Com comissão ida e volta ilustrativa de **$1** por MYM e **1 ponto** de slippage esperado no stop: risco por MYM = (55 + 1) × $0,50 + $1 = **$29,00**. Com 3 MYM: **$87** de risco total — uma diferença de $4,50 face ao cálculo "sem custos" ($82,50). Pequena, mas **sistemática**.`,
      exercise: { kind: "calculator", tool: "tick-value", prompt: "Escolhe MYM e YM, 55 pontos e 1 contrato. Compara o risco em dólares." },
      takeaways: ["Risco por contrato = pontos até ao stop × valor por ponto (+ comissões e slippage).", "A distância ao stop vem da análise; o tamanho é que se ajusta ao orçamento.", "YM = $5/ponto, MYM = $0,50/ponto (CME, excerto 2026-10-06); o CFD depende do broker."],
      quiz: [
        num("MYM: stop a 55 pontos. Risco por contrato, em dólares (sem custos)?", 27.5, 0.01, "$", "55 × $0,50 = $27,50."),
        num("YM: stop a 20 pontos. Risco por contrato, em dólares?", 100, 0, "$", "20 × $5 = $100."),
        mc("Qual é a ordem correta?", ["Escolher o tamanho e depois o stop", "Definir o stop pela invalidação técnica e depois ajustar o tamanho ao orçamento", "Escolher o stop pelo orçamento", "Nenhuma"], 1, "O stop é um facto do gráfico; o tamanho adapta-se."),
        tf("O valor por ponto de um CFD US30 é igual em todos os brokers.", false, "Depende do broker; confirma antes de calcular."),
      ],
    },
    {
      slug: "tamanho-de-posicao",
      title: "Tamanho de posição: a fórmula e o arredondamento",
      summary: "Contratos = orçamento ÷ risco por contrato, arredondado para baixo — e o que fazer quando dá zero.",
      minutes: 8,
      content: `\`contratos = floor( orçamento de risco ÷ risco por contrato )\`

## Passos
1. **Orçamento** = saldo × risco%;
2. **Risco por contrato** = pontos até ao stop × valor por ponto (+ comissões/slippage);
3. **Contratos** = orçamento ÷ risco por contrato, **arredondado para baixo**;
4. **Risco real** = contratos × risco por contrato (deve ser **≤ orçamento**);
5. Verifica a **margem** disponível e a **alavancagem efetiva**.

## Porque arredondar para baixo
Arredondar para cima **aumenta** o risco acima do planeado. Com 1,6 contratos a regra é **1**, não 2.

## Quando dá zero
Se o resultado é **menos de 1**, a ideia **não cabe** nesse contrato com esse stop. Opções:
- Usar um **contrato mais pequeno** (por exemplo, MYM em vez de YM);
- Aceitar um **stop tecnicamente válido mais curto** (se existir);
- **Passar**.

**Não** aumentes o risco por trade "só desta vez".

## Explicar sempre o risco em dólares
Qualquer número de contratos deve vir acompanhado de **quanto se arrisca** (em $ e em %). É uma regra desta plataforma: **as calculadoras nunca recomendam um número de contratos sem mostrar o risco financeiro associado**.

## Atenção à "ilusão do tamanho mínimo"
Quem tem uma conta pequena pode sentir-se obrigado a operar o **mínimo** disponível, mesmo que este arrisque mais do que o plano. Esse é o momento em que **não operar** é a decisão correta.`,
      example: `Conta **$10.000**, risco **1% = $100**, stop a **40 pontos**:

| Contrato | Risco por contrato | Contratos | Risco real |
| --- | --- | --- | --- |
| **MYM** | 40 × $0,50 = $20 | $100 ÷ $20 = **5** | **$100** (1,0%) |
| **YM** | 40 × $5 = $200 | $100 ÷ $200 = 0,5 → **0** | — não cabe |

Com stop a **100 pontos**: MYM = $50 → **2** contratos ($100); YM = $500 → **0**.`,
      exercise: { kind: "calculator", tool: "position-size", prompt: "Conta $10.000, risco 1%, entrada 39.000, stop 38.960. Quantos MYM? E quantos YM? Qual é o risco real em dólares?" },
      takeaways: ["Contratos = floor(orçamento ÷ risco por contrato); o risco real nunca excede o orçamento.", "Se der zero: contrato menor, stop válido mais curto ou passar — nunca aumentar o risco.", "O número de contratos vem sempre acompanhado do risco em dólares."],
      quiz: [
        sizing("Conta $10.000, risco 1%, MYM, stop a 25 pontos. Quantos contratos?", 8, "contratos", "Risco por MYM = 25 × $0,50 = $12,50; $100 ÷ $12,50 = 8."),
        sizing("Conta $50.000, risco 0,5% ($250), YM, stop a 40 pontos. Quantos contratos?", 1, "contratos", "Risco por YM = 40 × $5 = $200; $250 ÷ $200 = 1,25 → 1."),
        sizing("Conta $10.000, risco 1%, YM, stop a 30 pontos. Quantos contratos?", 0, "contratos", "Risco por YM = 30 × $5 = $150 > $100: 0 contratos."),
        mc("O cálculo dá 1,8 contratos. Quantos abres?", ["2", "1", "3", "Depende da convicção"], 1, "Arredonda-se para baixo para não exceder o orçamento."),
      ],
    },
    {
      slug: "r-multiple-e-risk-reward",
      title: "R-multiple e Risk/Reward",
      summary: "Medir resultados em unidades de risco — e perceber que taxa de acerto precisas para empatar.",
      minutes: 8,
      content: `## R-multiple
**1R = o risco inicial do trade.** Em vez de falar em dólares, mede-se o resultado em **múltiplos de R**:

\`R = resultado em pontos ÷ pontos de risco inicial\`

- Perda no stop = **−1R**;
- Ganho de 2× o risco = **+2R**;
- Saída a meio caminho = **+0,5R**.

Assim, trades de tamanhos diferentes **comparam-se** no mesmo plano.

## Risk/Reward (R:R)
\`R:R = distância ao alvo ÷ distância ao stop\`

- Stop 50 pontos e alvo 100 pontos → **R:R = 2:1**.

## Taxa de acerto necessária para empatar
\`win rate de equilíbrio = 1 ÷ (1 + R:R)\` (antes de custos)

| R:R | Win rate de equilíbrio |
| --- | --- |
| 0,5 | 66,7% |
| 1 | 50% |
| 1,5 | 40% |
| 2 | 33,3% |
| 3 | 25% |

## Interpretação com cuidado
- Um R:R alto **não** torna o trade melhor se o alvo for **pouco realista** — a **probabilidade** de o atingir conta;
- Um R:R baixo **não** é mau se a **taxa de acerto** for alta e estável (mas custos pesam mais);
- O que interessa é a **expectancy** (ver lição seguinte): combinação de win rate e R médio;
- **Custos** deslocam tudo: com spread e comissões, o win rate de equilíbrio sobe.

## No journal
Regista sempre o **R** de cada trade. Os teus relatórios de **R médio**, **drawdown em R** e **expectancy** dependem disso.`,
      example: `Entrada **39.000**, stop **38.950** (50 pts), alvo **39.100** (100 pts): **R:R = 2:1**; win rate de equilíbrio **33,3%**.

Três trades: perde (−1R), perde (−1R), ganha no alvo (+2R) = **0R** (sem custos). Com 4 trades (1 ganho em 4: −1, −1, −1, +2) = **−1R**: o win rate de 25% está **abaixo** do equilíbrio de 33,3%.`,
      exercise: { kind: "calculator", tool: "rr", prompt: "Entrada 39.000, stop 38.950, alvo 39.100. Qual é o R:R e qual é a taxa de acerto de equilíbrio?" },
      takeaways: ["1R = risco inicial; resultados medem-se em múltiplos de R.", "R:R = alvo ÷ stop; win rate de equilíbrio = 1 ÷ (1 + R:R).", "Um R:R alto exige um alvo realista; os custos sobem o win rate de equilíbrio."],
      quiz: [
        num("Entrada 39.000, stop 38.940, alvo 39.150. Qual é o R:R?", 2.5, 0.01, ":1", "Alvo 150 ÷ stop 60 = 2,5.", "CALCULATE_RR"),
        num("Com R:R de 1,5, qual é o win rate de equilíbrio (%, sem custos)?", 40, 0.1, "%", "1 ÷ (1 + 1,5) = 40%."),
        num("Entrada 39.000 (compra), stop 38.950, saída em 39.025. Qual é o resultado em R?", 0.5, 0.01, "R", "25 ÷ 50 = +0,5R."),
        tf("Um R:R alto torna sempre o trade melhor.", false, "Se o alvo for irrealista, a probabilidade de o atingir pode ser muito baixa."),
      ],
    },
    {
      slug: "valor-esperado-e-expectancy",
      title: "Valor esperado (expectancy)",
      summary: "A combinação de taxa de acerto e R médio que diz se um método tem 'vantagem' — com muita cautela sobre amostras.",
      minutes: 8,
      content: `A **expectancy** (valor esperado) é o resultado **médio por trade**, em R:

\`E = (win rate × ganho médio em R) − (loss rate × perda média em R)\`

## Exemplos (antes de custos)
| Win rate | Ganho médio | Perda média | Expectancy |
| --- | --- | --- | --- |
| 40% | 2R | 1R | 0,4 × 2 − 0,6 × 1 = **+0,2R** |
| 50% | 1,5R | 1R | 0,5 × 1,5 − 0,5 × 1 = **+0,25R** |
| 35% | 3R | 1R | 0,35 × 3 − 0,65 × 1 = **+0,4R** |
| 60% | 0,8R | 1R | 0,6 × 0,8 − 0,4 × 1 = **+0,08R** |

Repara: **uma taxa de acerto baixa pode ter boa expectancy** se o ganho médio compensar — e uma taxa alta pode ter fraca expectancy se os ganhos forem pequenos.

## O que a expectancy NÃO diz
- **Não é uma previsão** de cada trade: é uma **média de longo prazo**;
- **Não é conhecida**: só a **estimas** com uma amostra — e as estimativas têm **erro grande** com poucos trades;
- **Muda** com o mercado, o período e os **custos**;
- **Não inclui** o risco psicológico de aguentar a sequência de perdas.

## Custos
Se os custos médios forem **0,1R** por trade, uma expectancy bruta de **+0,2R** passa a **+0,1R** — metade. Com stops curtos, os custos podem **anular** a vantagem.

## Amostra
Com **menos de 30 trades**, qualquer estimativa é sobretudo **ruído**. Com 100+, ainda há incerteza. Usa **intervalos mentais**: "a minha expectancy está provavelmente entre −0,1R e +0,4R" é mais honesto do que "+0,2R".

## Usa a expectancy para…
- **Comparar** setups com a mesma lente;
- **Decidir** se continuas a testar (ou paras) um método;
- **Perceber** a importância de reduzir custos e de cumprir o processo.`,
      example: `Journal com **50 trades**: 18 ganhos (média **+2,1R**) e 32 perdas (média **−1,0R**). Win rate = 36%; expectancy = 0,36 × 2,1 − 0,64 × 1,0 = 0,756 − 0,64 = **+0,116R**. Custos médios de **0,08R** por trade → **+0,036R** líquido. Com 50 trades, o erro desta estimativa é **maior do que a própria estimativa**: não há evidência de vantagem — nem de ausência. Resposta correta: **continuar a registar** e testar com mais dados.`,
      takeaways: ["Expectancy = win rate × ganho médio − loss rate × perda médio, em R.", "É uma média de longo prazo estimada com amostras ruidosas; custos podem anulá-la.", "Com menos de 30 trades é sobretudo ruído: usa-a para comparar e decidir se continuas a testar, não para te convenceres."],
      quiz: [
        num("Win rate 40%, ganho médio 2R, perda média 1R. Qual é a expectancy em R?", 0.2, 0.001, "R", "0,4 × 2 − 0,6 × 1 = +0,2R."),
        num("Win rate 35%, ganho médio 3R, perda média 1R. Qual é a expectancy em R?", 0.4, 0.001, "R", "0,35 × 3 − 0,65 × 1 = +0,4R."),
        num("Expectancy bruta +0,2R e custos de 0,1R por trade. Expectancy líquida?", 0.1, 0.001, "R", "0,2 − 0,1 = +0,1R."),
        tf("Com 20 trades já é possível concluir com segurança que um método tem vantagem.", false, "Com poucas dezenas de trades, o erro da estimativa é grande."),
      ],
    },
    {
      slug: "limites-diarios-e-semanais",
      title: "Perda máxima diária e semanal",
      summary: "Os 'disjuntores' que protegem a conta (e a cabeça) de dias maus.",
      minutes: 7,
      content: `Mesmo com bom risco por trade, **um dia mau pode escalar**: perdas seguidas → emoção → decisões piores → mais perdas. Os **limites de perda** funcionam como **disjuntores**.

## Perda máxima diária
Um limite de perda **para o dia**, definido **antes**: por exemplo **2R** ou **2%** da conta. Ao atingi-lo, **paras** — sem exceções "para recuperar".

## Perda máxima semanal
Um limite para a **semana** (por exemplo, **4–5R** ou **5%**). Ao atingi-lo, **paras até à semana seguinte** e **revês** o que correu mal.

## Número máximo de trades
Um limite de **nº de trades por dia** (por exemplo, 2–3) combate o **overtrading**.

## Regras de pausa
Exemplos de regras simples:
- **Duas perdas seguidas** → pausa de 30 minutos;
- **Perda no limite diário** → fecho da plataforma;
- **Trade fora do plano** → fim de sessão.

## Porque funcionam
Eliminam decisões sob pressão: **a regra já foi tomada antes**. Reduzem a probabilidade de **espirais emocionais** e preservam o capital **e a confiança**.

## Como definir os teus limites
- Relaciona-os com o **risco por trade** (2R = dois trades perdedores completos);
- Deixa **espaço** para a variância normal (se o limite é 1R, quase todos os dias o atingirás);
- **Revê** mensalmente: os limites protegeram-te? Foram demasiado apertados?
- **Regista** no journal quando os atingiste e o que sentiste.

> Os limites são **para ti**: ninguém os vai fazer cumprir. É a disciplina que os transforma em proteção.`,
      example: `Conta **$10.000**, risco **1% ($100)** por trade; limite diário **2R ($200)**, semanal **5R ($500)**, máx. **3 trades/dia**.

Terça: perde −1R, perde −1R → limite diário atingido às 15:10. **Para.** Quarta: ganha +2R, perde −1R; quinta: perde −1R, perde −1R (limite diário de novo); sexta: perde −1R → semana em **−5R** = limite semanal atingido na sexta: **fim da semana** e revisão.

O plano **cortou** o dano: sem limites, o impulso para "recuperar" podia ter multiplicado as perdas.`,
      exercise: { kind: "link", href: "/tools/daily-plan", label: "Abrir o Daily Trading Plan", prompt: "Define o teu risco máximo do dia e o número máximo de trades antes da próxima sessão." },
      takeaways: ["Limites diário, semanal e de nº de trades funcionam como disjuntores definidos antes.", "Regras de pausa (por exemplo, duas perdas seguidas) reduzem espirais emocionais.", "Relaciona-os com o risco por trade e revê-os mensalmente."],
      quiz: [
        num("Risco por trade $100 e limite diário de 2R. Qual é a perda diária máxima, em dólares?", 200, 0, "$", "2R × $100 = $200."),
        mc("Qual é o objetivo principal dos limites de perda?", ["Garantir lucros", "Evitar decisões sob pressão e espirais emocionais", "Aumentar o tamanho", "Reduzir comissões"], 1, "São regras definidas antes para quando a emoção atrapalha."),
        tf("Ao atingir o limite diário, é boa prática continuar 'só para recuperar'.", false, "É exatamente o contrário: o limite existe para que pares."),
        mc("O que fazer ao atingir o limite semanal?", ["Dobrar o risco", "Parar até à semana seguinte e rever o que correu mal", "Mudar de instrumento", "Retirar o stop"], 1, "Parar e rever previne agravamento."),
      ],
    },
    {
      slug: "drawdown-e-sequencias-de-perdas",
      title: "Drawdown e sequências de perdas",
      summary: "A matemática que mostra porque o risco por trade pequeno é uma questão de sobrevivência.",
      minutes: 8,
      content: `**Drawdown** é a queda do capital desde um máximo até um mínimo. Mede-se em **dólares** ou em **%**. Uma **sequência de perdas** (*losing streak*) é o que mais o provoca.

## Perdas seguidas a risco fixo
Após **n** perdas consecutivas com risco **r%** por trade, o capital restante é **(1 − r)ⁿ**:

| Risco/trade | Após 10 perdas | Drawdown | Recuperação necessária |
| --- | --- | --- | --- |
| **1%** | 90,44% | **9,56%** | +10,57% |
| **2%** | 81,71% | **18,29%** | +22,39% |
| **5%** | 59,87% | **40,13%** | +67,02% |
| **10%** | 34,87% | **65,13%** | **+186,8%** |

A diferença entre arriscar 1% e 5% não é "cinco vezes mais": é a diferença entre um **desconforto** e um **desastre**.

## As sequências são normais
Numa simulação de **100 trades independentes** (valores aproximados):

| Win rate | Maior sequência de perdas (média) | P(≥ 5 seguidas) | P(≥ 8 seguidas) |
| --- | --- | --- | --- |
| 60% | ≈ 4,6 | ≈ 45% | ≈ 4% |
| 50% | ≈ 6 | ≈ 81% | ≈ 16% |
| 40% | ≈ 8 | ≈ 97% | ≈ 49% |

**Mesmo com 50% de acerto**, em 100 trades é muito provável haver 5 perdas seguidas e razoavelmente provável haver 8. Não é azar: é **estatística**.

## Implicações
- **Dimensiona** o risco para **sobreviver** a sequências longas — não à média;
- Prepara-te **psicologicamente**: a primeira sequência de 6 perdas **vai** acontecer;
- **Drawdown em R** (no journal) ajuda a comparar métodos;
- Planeia **o que fazes** quando o drawdown atinge um limiar (reduzir risco, parar, rever o processo).

> Os números acima assumem trades **independentes** e risco fixo; na prática há dependências (regimes de mercado, estado emocional).`,
      example: `Conta **$10.000**, risco **1%**: 8 perdas seguidas → capital = 10.000 × 0,99⁸ ≈ **$9.227** (−7,7%); recuperar exige **+8,4%**. Com risco **5%**: 8 perdas → 10.000 × 0,95⁸ ≈ **$6.634** (−33,7%); recuperar exige **+50,7%**. A sequência é a mesma; **o risco por trade** decide se foi um incómodo ou uma crise.`,
      exercise: { kind: "link", href: "/tools/risk-calculator", label: "Abrir o Risk Calculator", prompt: "Usa a tabela de sequências de perdas: compara o drawdown com 1%, 2% e 5% de risco por trade." },
      takeaways: ["Após n perdas a r%, capital restante = (1 − r)ⁿ; a recuperação necessária cresce muito depressa.", "Sequências de 5–8 perdas são normais mesmo com 50% de acerto.", "Dimensiona o risco para sobreviver às sequências, não à média."],
      quiz: [
        num("Risco de 2% por trade e 10 perdas seguidas. Qual é o drawdown aproximado (%)?", 18.29, 0.05, "%", "1 − 0,98¹⁰ ≈ 18,29%."),
        num("Para recuperar de um drawdown de 40,13%, que ganho é necessário (%, aprox.)?", 67, 0.2, "%", "1 ÷ 0,5987 − 1 ≈ 67%."),
        tf("Com 50% de taxa de acerto, uma sequência de 5 perdas seguidas é raríssima em 100 trades.", false, "É muito provável: ≈ 81% em simulações de 100 trades independentes."),
        mc("Para que dimensionas o risco por trade?", ["Para a média dos resultados", "Para sobreviver a sequências longas de perdas", "Para ganhar mais depressa", "Para impressionar"], 1, "A sobrevivência exige resistir ao pior cenário razoável."),
      ],
    },
    {
      slug: "calculadoras-de-risco-e-de-posicao-ym-mym",
      title: "As calculadoras: risco e tamanho de posição YM/MYM",
      summary: "Como usar as ferramentas da plataforma — com todos os campos, e a regra de ouro de mostrar sempre o risco.",
      minutes: 7,
      content: `A plataforma tem duas calculadoras relacionadas:

## 1. Risk Calculator (geral)
**Entradas:** saldo da conta, risco %, preço de entrada, stop loss, alvo, valor por tick/ponto, contrato (YM, MYM, US30 ou personalizado) e comissão.

**Saídas:** **risco em dólares**, **número de contratos**, **perda potencial**, **lucro potencial**, **R:R** e **R-multiple** esperado.

## 2. Position Size YM/MYM (específica)
Calcula o **número máximo de contratos** de **YM ou MYM** que respeitam o teu risco, com a mesma fórmula, ligada às especificações do CME (YM $5/ponto, MYM $0,50/ponto — confirmadas por excerto em 2026-10-06).

Exemplo-guia: **conta $10.000, risco 1% ($100)**, stop de **X pontos** → contratos máximos.

## Regra de ouro
A calculadora **nunca devolve um número de contratos sem mostrar o risco financeiro associado**: contratos, **risco em $**, **risco em %** e uma explicação em palavras. Se o resultado for **zero**, explica porquê e sugere alternativas — **não** sugere aumentar o risco.

## Avisos
- Para **US30 CFD**, o valor por ponto é uma suposição **ilustrativa** ($1 por lote); **confirma com o teu broker**;
- A **margem** do simulador é ilustrativa; a real depende do CME e do broker;
- Os custos são **ilustrativos**; ajusta-os aos teus.

## Boas práticas
- Usa **sempre** a calculadora antes de enviar uma ordem;
- Regista o **risco planeado** e compara com o **risco real** no journal (gaps e slippage);
- Se o tamanho "não te agrada", **não mudes o stop** — muda a decisão (passar, ou contrato menor).`,
      example: `Entrada **39.000**, stop **38.960** (40 pontos), alvo **39.080** (80 pontos), conta $10.000, risco 1%:

- **MYM:** risco por contrato $20 → **5 contratos** → risco real **$100 (1,0%)**; lucro potencial 80 × $0,50 × 5 = **$200**; **R:R = 2:1**; R esperado se atingir o alvo = **+2R**.
- **YM:** risco por contrato $200 → **0 contratos**: a calculadora explica que 1 YM arriscaria $200 (2%), acima do orçamento.`,
      exercise: { kind: "calculator", tool: "position-size", prompt: "Usa a calculadora de tamanho com os valores do exemplo e confirma os números." },
      takeaways: ["O Risk Calculator dá risco em dólares, contratos, perda/lucro potencial, R:R e R-multiple.", "A calculadora YM/MYM mostra sempre contratos, risco em $ e em % e uma explicação.", "Se o resultado é zero, a alternativa é um contrato menor ou passar — nunca aumentar o risco."],
      quiz: [
        sizing("Conta $10.000, risco 1%, MYM, entrada 39.000, stop 38.960. Quantos contratos?", 5, "contratos", "Risco por MYM = 40 × $0,50 = $20; $100 ÷ $20 = 5."),
        rr("Entrada 39.000, stop 38.960, alvo 39.080. Qual é o R:R?", 2, 0.01, "Alvo 80 ÷ stop 40 = 2,0."),
        mc("O que faz a calculadora quando o resultado é zero contratos?", ["Sugere aumentar o risco", "Explica porquê e sugere alternativas, sem aumentar o risco", "Esconde o resultado", "Arredonda para 1"], 1, "Nunca recomenda aumentar o risco."),
        tf("Podes assumir que o US30 CFD vale sempre $1 por ponto.", false, "O valor depende do broker; o da plataforma é ilustrativo."),
      ],
    },
  ],
  quiz: {
    title: "Quiz do módulo — Risk Management",
    passScore: 70,
    questions: [
      sizing("Conta $25.000, risco 1% ($250), MYM, stop a 50 pontos. Quantos contratos?", 10, "contratos", "Risco por MYM = 50 × $0,50 = $25; $250 ÷ $25 = 10."),
      sizing("Conta $10.000, risco 1%, YM, stop a 15 pontos. Quantos contratos?", 1, "contratos", "Risco por YM = 15 × $5 = $75; $100 ÷ $75 = 1,33 → 1."),
      num("Entrada 39.000, stop 38.950, alvo 39.150. Qual é o R:R?", 3, 0.01, ":1", "Alvo 150 ÷ stop 50 = 3.", "CALCULATE_RR"),
      num("Win rate de equilíbrio com R:R = 3 (sem custos), em %?", 25, 0.1, "%", "1 ÷ (1 + 3) = 25%."),
      num("Win rate 45%, ganho médio 1,8R, perda média 1R. Expectancy em R (2 casas decimais)?", 0.26, 0.005, "R", "0,45 × 1,8 − 0,55 × 1 = 0,81 − 0,55 = +0,26R."),
      num("Risco de 1% por trade e 10 perdas seguidas. Drawdown aproximado em %?", 9.56, 0.05, "%", "1 − 0,99¹⁰ ≈ 9,56%."),
      mc("Qual é a ordem correta para dimensionar uma posição?", ["Escolher o tamanho, depois o stop", "Stop técnico, risco por contrato, contratos = orçamento ÷ risco por contrato (para baixo)", "Escolher o stop pelo orçamento", "Copiar outro trader"], 1, "O stop é um facto do gráfico; o tamanho adapta-se."),
      tf("Podes arredondar o número de contratos para cima para não perder a oportunidade.", false, "Arredondar para cima aumenta o risco acima do plano."),
      mc("Porque se usa um risco por trade pequeno?", ["Para ganhar menos", "Para sobreviver a sequências de perdas, que são normais", "Por regra legal", "Para pagar menos comissões"], 1, "Sequências de perdas são estatisticamente normais."),
      mc("O que fazer ao atingir a perda máxima diária?", ["Continuar para recuperar", "Parar de operar nesse dia", "Aumentar o tamanho", "Mudar de timeframe"], 1, "O limite existe para que pares."),
    ],
  },
};
