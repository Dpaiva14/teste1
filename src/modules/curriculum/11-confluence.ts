import { chart, mc, num, rr, tf } from "../dsl";
import type { ModuleDef } from "../types";

/**
 * Module 11 — Confluence (Level 4). One of the central modules.
 * The Confluence Score is an EDUCATIONAL tool: 8/8 never means a guaranteed trade, and 0/8 can still win by luck.
 */
export const confluence: ModuleDef = {
  slug: "confluence",
  number: 11,
  level: 4,
  title: "Confluence",
  summary: "Uma entrada não deve depender de uma única razão: os oito fatores do Confluence Score (0–8), a independência dos fatores e a diferença entre processo e resultado.",
  difficulty: "FOUNDATION",
  icon: "Layers3",
  lessons: [
    {
      slug: "uma-entrada-nao-depende-de-uma-razao",
      title: "Uma entrada não deve depender de uma única razão",
      summary: "O princípio central: alinhar fatores independentes melhora o contexto — sem nunca garantir o resultado.",
      minutes: 6,
      content: `> **Uma entrada não deve depender de uma única razão.**

Imagina duas ideias de compra:

- **Ideia A:** "O preço tocou 38.400 e fez um pin bar."
- **Ideia B:** "A estrutura é de alta, o preço recuou a uma zona onde havia resistência antiga (agora suporte), coincide com o recuo de 50–61,8% do último impulso, houve um varrimento de mínimos iguais e fechou um engolfo — e o stop curto dá R:R de 1,9."

A ideia B **não é garantidamente melhor** — mas tem **mais informação independente** a apoiá-la, e **mais razões** para se saber onde está invalidada.

## Confluência
**Confluência** é o alinhamento de **vários fatores independentes** na mesma zona e momento:

\`Tendência + Estrutura + S/R + Oferta/Procura + Fibonacci + Price action + Liquidez + R:R = confluência\`

## O que a confluência faz
- **Reduz o número de ideias** (muitos "setups" desaparecem quando se exigem várias razões);
- **Melhora o contexto** e dá mais pontos de referência para o stop e o alvo;
- **Obriga a pensar** antes de agir.

## O que a confluência NÃO faz
- ✘ Não garante resultado: um trade com 8 fatores **pode perder**;
- ✘ Não elimina o risco: o stop e o tamanho continuam obrigatórios;
- ✘ Não torna os fatores independentes por magia (ver lição sobre redundância).

> O objetivo não é prever o mercado. É construir um **processo de decisão repetível**.`,
      example: `Duas entradas, ambas com stop de 100 pontos e alvo de 200 (R:R de 2:1):

- **A (1 razão):** uma ideia que acontece, em média, 20 vezes por dia;
- **B (6 fatores):** uma ideia que acontece 1 vez por semana.

Com **A**, muita gente entra por aborrecimento e acumula custos; com **B**, esperas — e a paciência **é** parte do processo. Nenhuma das duas está garantida; B só tem **melhor contexto** e **menos trades por acaso**.`,
      takeaways: ["Confluência = vários fatores independentes alinhados na mesma zona e momento.", "Melhora o contexto e reduz ideias de baixa qualidade; não garante resultados.", "Stop e tamanho continuam obrigatórios, mesmo com 8 fatores."],
      quiz: [
        mc("Qual é o princípio central da confluência?", ["Uma entrada deve depender de uma única razão forte", "Uma entrada não deve depender de uma única razão", "Mais indicadores = melhor", "O stop é opcional com muitos fatores"], 1, "Vários fatores independentes dão melhor contexto do que uma razão isolada."),
        tf("Um trade com todos os fatores de confluência presentes está garantido.", false, "Confluência melhora o contexto, não garante o resultado."),
        mc("Qual é um efeito prático de exigir confluência?", ["Mais trades por dia", "Menos ideias, mais seletividade e mais paciência", "Stops mais largos", "Sem custos"], 1, "Exigir várias razões filtra ideias de baixa qualidade."),
      ],
    },
    {
      slug: "os-oito-fatores",
      title: "Os oito fatores do Confluence Score",
      summary: "Cada fator vale +1: tendência, estrutura, S/R, oferta/procura, Fibonacci, price action, liquidez e R:R.",
      minutes: 8,
      content: `O **Confluence Score** soma **+1 por fator presente**, num máximo de **8**. É uma **ferramenta educativa** para estruturar o raciocínio — não um sinal.

| # | Fator | Pergunta de controlo |
| --- | --- | --- |
| 1 | **Alinhamento de tendência** | A direção do trade está alinhada com a tendência de trabalho (e com o contexto superior)? |
| 2 | **Market structure** | A estrutura (HH/HL ou LH/LL) suporta a ideia e continua intacta? |
| 3 | **Suporte / Resistência** | A entrada está numa zona de S/R relevante (incluindo níveis que mudaram de função)? |
| 4 | **Oferta / Procura** | Existe uma zona fresca junto à entrada? |
| 5 | **Fibonacci** | A entrada coincide com uma zona de retracement de um swing relevante? |
| 6 | **Confirmação de price action** | Há confirmação no candle (rejeição, engolfo, rompimento com fecho) e não só esperança? |
| 7 | **Contexto de liquidez** | Há liquidez evidente (equal highs/lows, PDH/PDL) varrida ou como alvo? |
| 8 | **R:R aceitável** | O R:R com stop técnico e alvo realista é ≥ 1,5? |

## Regras de pontuação
- **Só conta o que está presente e demonstrável** no gráfico, não o que esperas que aconteça;
- Cada fator vale **1 ou 0** — sem pontos parciais para "mais ou menos";
- **R:R** usa o stop **técnico** (onde a ideia fica invalidada), não um valor ajustado para passar;
- Sê **honesto**: é fácil "encontrar" fatores quando se quer entrar.

## Leitura do score (educativa)
- **6–8:** contexto forte;
- **4–5:** contexto médio — exige mais atenção;
- **0–3:** contexto fraco.

Estas faixas são **orientações pedagógicas**, não thresholds estatisticamente validados: não há dados que provem que "6+" acerta mais vezes.`,
      example: `Uma ideia de compra: tendência alinhada ✔, estrutura intacta ✔, zona de S/R ✔, oferta/procura ✘ (a zona está longe), Fibonacci ✔ (recuo de 50–61,8%), engolfo ✔, mínimos iguais varridos ✔, R:R de 1,9 ✔.

**Score = 7/8.** Falta o fator oferta/procura. Contexto forte — mas sem garantias: o stop continua a ser calculado, e o tamanho vem do risco.`,
      takeaways: ["O Confluence Score soma +1 por fator presente (máximo 8): tendência, estrutura, S/R, oferta/procura, Fibonacci, price action, liquidez e R:R.", "Conta só o que está presente e demonstrável; sê honesto.", "As faixas 6–8, 4–5 e 0–3 são orientações pedagógicas, não thresholds validados."],
      quiz: [
        mc("Quantos fatores tem o Confluence Score e qual é o máximo?", ["5 fatores, máximo 5", "8 fatores, máximo 8", "10 fatores, máximo 10", "3 fatores, máximo 3"], 1, "São oito fatores, +1 cada, máximo 8."),
        mc("Qual destes NÃO é um dos oito fatores?", ["Contexto de liquidez", "Indicador RSI em sobrevenda", "Risk/Reward aceitável", "Fibonacci"], 1, "O RSI não faz parte do score; os fatores são os oito listados na lição."),
        tf("Um fator conta se estiver 'mais ou menos presente'.", false, "Cada fator vale 1 ou 0: ou está presente e demonstrável, ou não."),
        tf("Os limiares 6–8 = forte foram validados estatisticamente.", false, "São orientações pedagógicas, sem validação estatística."),
      ],
    },
    {
      slug: "confluence-score-na-pratica",
      title: "O Confluence Score na prática: três cenários",
      summary: "Um 7/8 que ganha, um 0/8 que ganha por sorte e um 7/8 que perde — e o que cada um ensina.",
      minutes: 8,
      content: `No **Confluence Lab** analisas três decisões e avalias o processo antes de veres o resultado.

## Cenário 1 — Compra com confluência forte (7/8) que ganha
Tendência de alta, pullback para uma antiga resistência (agora suporte) coincidente com o recuo de 50–61,8%, varrimento de mínimos iguais e engolfo. **Falta** o fator oferta/procura.

- Entrada **38.512**, stop **38.408** (**104 pontos**), alvo **38.710** (**198 pontos**) → **R:R ≈ 1,9:1**.

## Cenário 2 — Compra sem confluência (0/8) que ganha
Compra **contra** a estrutura (LH/LL), a meio do range, num candle de indecisão. **Nenhum** fator presente.

- Entrada **38.508**, stop **38.458** (**50 pontos**), alvo **38.538** (**30 pontos**) → **R:R de 0,6:1**: precisas de acertar **62,5%** das vezes só para empatar.

## Cenário 3 — Venda com confluência forte (7/8) que perde
O espelho do cenário 1. O processo é igualmente sólido, mas o **stop é atingido**.

## O que ensinam
| Cenário | Processo | Resultado | Lição |
| --- | --- | --- | --- |
| 1 | Forte | Ganha | Processo e resultado alinhados — mas um caso não prova nada |
| 2 | Fraco | Ganha | **Sorte**: repetir isto custa dinheiro ao longo do tempo |
| 3 | Forte | Perde | **Processo bom, resultado mau**: faz parte da distribuição |

## A decisão: TAKE ou NO TRADE
O laboratório pede-te também uma decisão. A decisão **recomendada segue o processo** (score ≥ 6 **e** R:R aceitável), **nunca o resultado**. **"No trade" é uma decisão válida.**`,
      example: `Cálculo do cenário 2 (compra fraca): risco 50 pontos, alvo 30 pontos → R:R = 30 ÷ 50 = **0,6**. Taxa de acerto mínima para empatar = 1 ÷ (1 + 0,6) = **62,5%**. Se a tua taxa de acerto real for 50%, em 10 trades: 5 × 30 − 5 × 50 = **−100 pontos** (antes de custos). Pode ganhar-se um trade destes — repetidos, perdem.`,
      exercise: { kind: "confluence", scenarioId: "conf-strong-long", prompt: "Identifica os fatores presentes, decide TAKE ou NO TRADE e compara com a análise educativa." },
      takeaways: ["Um 7/8 pode ganhar ou perder; um 0/8 pode ganhar por sorte.", "A decisão recomendada segue o processo (score e R:R), não o resultado.", "R:R de 0,6 exige ≈ 62,5% de acerto só para empatar."],
      quiz: [
        chart("CHART_ANALYSIS", "conf-weak-long", "Neste cenário, quantos fatores de confluência estão presentes?", ["0", "4", "6", "8"], 0, "Nenhum dos oito fatores está presente: processo fraco."),
        rr("Entrada 38.508, stop 38.458, alvo 38.538. Qual é o R:R?", 0.6, 0.01, "Alvo 30 ÷ stop 50 = 0,6."),
        num("Com R:R de 0,6, qual é a taxa de acerto mínima para empatar (em %, 1 casa decimal)?", 62.5, 0.1, "%", "1 ÷ (1 + 0,6) = 62,5%."),
        chart("CHART_ANALYSIS", "conf-strong-short-loss", "Neste cenário a venda com 7/8 acabou por perder. O que se pode concluir sobre o processo?", ["Que o processo estava errado", "Que um bom processo também pode ter perdas — o resultado de um trade não o invalida", "Que o stop devia ser retirado", "Que o score não serve"], 1, "O processo era sólido; uma perda isolada faz parte da distribuição de resultados."),
      ],
    },
    {
      slug: "fatores-independentes-e-redundancia",
      title: "Fatores independentes e redundância",
      summary: "Porque contar o mesmo sinal duas vezes infla o score — e como evitar a ilusão de confluência.",
      minutes: 7,
      content: `A confluência só vale se os fatores forem **razoavelmente independentes**. Se vários fatores medem **a mesma coisa**, o score fica inflacionado.

## Exemplos de redundância
- Contar "**tendência**" e "**estrutura**" como dois pontos quando são a mesma observação (HH/HL): o score deve distinguir **tendência do timeframe superior** de **estrutura do timeframe de trabalho**;
- "**S/R**" e "**oferta/procura**" na mesma zona, quando é só uma região vista de duas formas — conta como **dois** apenas se há razões distintas (por exemplo, o nível vem de máximos anteriores e a zona vem de um impulso próprio);
- "**Price action**" e "**liquidez**" quando o candle de rejeição **é** o varrimento — conta se identificares algo extra em cada um.

## Como proteger o score
1. **Descreve** em uma frase **a evidência** de cada fator;
2. Pergunta: **este fator seria o mesmo se o outro desaparecesse?** Se sim, é redundante;
3. Prefere **menos fatores bem justificados** a oito mal definidos;
4. **Congela** as regras do score antes de operar (não as ajustes para "dar 6");
5. **Regista** o score de todas as ideias — incluindo as que não tomaste — para depois compares **resultado vs score**.

## Armadilhas
- **Viés de confirmação:** procurar fatores a favor depois de querer entrar;
- **Paralisia por análise:** esperar pelo 8/8 perfeito e nunca agir;
- **Overfitting:** ajustar o sistema ao que deu certo ontem.

> A função da confluência é **filtrar**, não **justificar**.`,
      example: `Uma compra com "tendência ✔", "estrutura ✔", "S/R ✔", "oferta/procura ✔", "Fibonacci ✔", "price action ✔", "liquidez ✔", "R:R ✔" = **8/8**.

Mas ao descrever as evidências: tendência e estrutura são a mesma sequência de HL; S/R e oferta/procura são a mesma zona; price action e liquidez são o mesmo pavio de varrimento. **Evidência independente real: 4 fatores**, não 8. O score inflacionado dava uma falsa sensação de confiança.`,
      takeaways: ["Os fatores devem ser razoavelmente independentes; contar a mesma observação duas vezes infla o score.", "Descreve a evidência de cada fator numa frase e testa: 'seria o mesmo se o outro desaparecesse?'.", "A confluência serve para filtrar ideias, não para as justificar a posteriori."],
      quiz: [
        mc("O que é redundância num score de confluência?", ["Ter poucos fatores", "Contar a mesma observação como dois fatores", "Usar o stop", "Registar no journal"], 1, "Contar duas vezes a mesma evidência infla o score."),
        mc("Qual é uma pergunta útil para detetar redundância?", ["Quanto vou ganhar?", "Este fator seria o mesmo se o outro desaparecesse?", "Qual é o spread?", "Que hora é?"], 1, "Se desaparece com o outro, é redundante."),
        tf("Esperar sempre pelo 8/8 perfeito é a melhor abordagem.", false, "Pode causar paralisia; o objetivo é um processo consistente e honesto."),
        mc("Qual é o risco de ajustar as regras do score para 'dar 6'?", ["Nenhum", "Justificar a posteriori em vez de filtrar (viés de confirmação)", "Stops mais curtos", "Menos custos"], 1, "Ajustar a regra para passar destrói o seu papel de filtro."),
      ],
    },
    {
      slug: "processo-vs-resultado",
      title: "Processo vs resultado",
      summary: "Porque um bom trade pode perder e um mau trade pode ganhar — e como avaliar a qualidade das tuas decisões.",
      minutes: 7,
      content: `Esta é uma das ideias mais importantes de toda a academia:

> **Um bom resultado não prova um bom processo. Um mau resultado não prova um mau processo.**

## Porquê
O resultado de **um** trade depende do processo **e** da **variância** (sorte). Com uma pequena amostra, a sorte domina. Só depois de muitos trades é que o processo se vê nos números.

## Quatro combinações
| | Resultado bom | Resultado mau |
| --- | --- | --- |
| **Processo bom** | ✔ Merecido (mas um caso não prova) | Normal: faz parte da distribuição |
| **Processo mau** | ⚠ **Sorte** — o mais perigoso | Lição clara: o que falhou? |

O quadrante **processo mau + resultado bom** é o mais perigoso, porque **reforça hábitos que, repetidos, custam dinheiro**.

## Como avaliar o processo
Usa uma **grelha fixa**, definida antes e **independente** do resultado:

- Havia **contexto** claro? (estrutura, nível)
- O **score de confluência** estava dentro da regra?
- O **stop** estava num ponto técnico e o **risco** dentro do plano?
- O **R:R** era aceitável?
- A **razão de entrada** era válida (não FOMO, vingança ou tédio)?
- A **gestão** seguiu o plano?

Esta é a lógica das avaliações de **Chart Replay** e do **Final Assessment** (que avaliam processo, não P&L) e do campo **"avaliação do processo"** no Journal.

## O que fazer com isto
- Não mudes um processo bom por causa de **uma** perda;
- Não **celebres** um processo mau por causa de **um** ganho;
- Usa **amostras** (30–100+ trades, a depender do caso) e **expectancy** para avaliar o sistema;
- Mantém o **risco por trade pequeno**, para que a variância não o destrua antes de a amostra falar.`,
      example: `10 trades com **processo sólido** e expectancy positiva de **+0,2R** por trade. A sequência pode ser: −1, −1, +2, −1, −1, −1, +2, +2, −1, +2 = **+2R** no final, mas **com 6 perdas em 10** e uma série de **3 perdas seguidas** a meio.

Quem avaliasse o processo só pelo resultado dos 5 primeiros trades (−2R) concluiria que "não funciona" e mudaria um método que, no longo prazo, **podia** ter vantagem. A grelha de processo **protege** de decisões baseadas na amostra errada.`,
      takeaways: ["Resultado de um trade = processo + variância; só amostras grandes revelam o processo.", "Processo mau com resultado bom (sorte) é o quadrante mais perigoso.", "Avalia o processo com uma grelha fixa, independente do resultado."],
      quiz: [
        mc("Qual é a combinação mais perigosa?", ["Processo bom, resultado bom", "Processo mau, resultado bom", "Processo bom, resultado mau", "Processo mau, resultado mau"], 1, "Reforça hábitos que, repetidos, custam dinheiro."),
        tf("Uma perda prova que o processo estava errado.", false, "Uma perda isolada pode ser variância; o processo avalia-se com amostras e grelhas fixas."),
        mc("Que tipo de grelha usar para avaliar um trade?", ["Uma que dependa do resultado", "Uma definida antes e independente do resultado", "Nenhuma", "A que der melhor nota"], 1, "A grelha de processo é fixa e não depende do P&L."),
        num("Sequência de resultados em R: −1, −1, +2, −1, −1, −1, +2, +2, −1, +2. Qual é o resultado total em R?", 2, 0, "R", "Soma: −1−1+2−1−1−1+2+2−1+2 = +2R."),
      ],
    },
    {
      slug: "lab-confluence-e-o-teu-checklist",
      title: "Confluence Lab e o teu checklist",
      summary: "Como treinar a análise e transformar o score num checklist pessoal e testável.",
      minutes: 6,
      content: `## Como treinar no Confluence Lab
1. Lê o cenário e **marca os fatores presentes** antes de veres a solução;
2. Decide **TAKE** ou **NO TRADE**;
3. Vê a **análise educativa** e a pontuação (85% pela identificação dos fatores, 15% pela decisão);
4. Revela depois o **que aconteceu** — e repara que o resultado **não** altera a avaliação do processo.

## Construir o teu checklist
Parte do score de oito fatores e **adapta-o** ao teu método:

- Remove o que **não usas**;
- Acrescenta fatores **específicos** (por exemplo, "evento económico verificado", "sessão adequada");
- Define **critérios objetivos** de presença (ex.: "há máximos iguais com tolerância de 0,3 × ATR");
- **Escreve** o limiar mínimo (ex.: "só considero ideias com ≥ 6 e R:R ≥ 1,5");
- **Congela** a regra antes de uma série de trades e só a reveja depois.

## Validar o checklist
- Regista **todas** as ideias com o score, mesmo as que não tomaste;
- Compara **R médio** de ideias com score alto vs baixo ao longo de uma amostra;
- Se **não houver diferença**, o checklist não está a filtrar nada — repensa-o;
- Atenção: amostras pequenas enganam.

## Ligação com o resto
O mesmo raciocínio alimenta a **checklist pré-trade** do simulador (12 itens, aviso educativo se faltarem) e o **Final Assessment**.

> O checklist não é para "ter razão": é para **impedir-te de agir** quando a informação é fraca.`,
      example: `Aluno com 40 ideias registadas em 6 semanas: 15 com score ≥ 6 (R médio **+0,4**) e 25 com score < 6 (R médio **−0,1**). Há alguma indicação de que o filtro ajuda — mas com 40 ideias, e dados que podem ser sintéticos, **é cedo para concluir**. O correto é continuar a registar e testar com mais dados.`,
      exercise: { kind: "link", href: "/labs/confluence", label: "Abrir o Confluence Lab", prompt: "Faz os três cenários e compara a pontuação do processo com o resultado de cada um." },
      takeaways: ["No laboratório, avalia o processo antes de veres o resultado; o resultado não altera a avaliação.", "Constrói um checklist pessoal com critérios objetivos e limiar escrito.", "Regista todas as ideias com score e compara R médio entre score alto e baixo — com cautela sobre a amostra."],
      quiz: [
        mc("Qual é a ordem recomendada no Confluence Lab?", ["Ver o resultado primeiro", "Marcar os fatores presentes, decidir, ver a análise e só depois o resultado", "Copiar a solução", "Não decidir"], 1, "Avaliar o processo antes do resultado treina a disciplina."),
        tf("O resultado do trade deve alterar a avaliação do processo no laboratório.", false, "O laboratório avalia o processo; o resultado serve para reforçar que processo ≠ resultado."),
        mc("Como validar o teu checklist?", ["Confiar na intuição", "Registar todas as ideias com score e comparar R médio entre score alto e baixo, com amostra suficiente", "Mudar a regra a cada trade", "Ignorar as ideias não tomadas"], 1, "A validação precisa de registo completo e de amostras."),
      ],
    },
  ],
  quiz: {
    title: "Quiz do módulo — Confluence",
    passScore: 70,
    questions: [
      mc("Qual destas frases resume o princípio da confluência?", ["Uma entrada deve depender de uma só razão forte", "Uma entrada não deve depender de uma única razão", "Mais indicadores sempre", "Ignorar o stop"], 1, "Vários fatores independentes dão melhor contexto."),
      mc("Quantos pontos tem o Confluence Score no máximo?", ["5", "8", "10", "12"], 1, "Oito fatores, +1 cada."),
      tf("Um trade com 8/8 está garantido.", false, "A confluência melhora o contexto; não garante resultados."),
      chart("CHART_ANALYSIS", "conf-strong-long", "Neste cenário, qual fator está em falta (7/8)?", ["Tendência", "Oferta/procura", "Price action", "R:R"], 1, "A zona de procura relevante está longe do ponto de decisão."),
      chart("CHART_ANALYSIS", "conf-weak-long", "Neste cenário, qual é o R:R planeado?", ["0,6:1", "1,9:1", "3:1", "5:1"], 0, "Alvo de 30 pontos para um stop de 50: 0,6."),
      rr("Entrada 38.512, stop 38.408, alvo 38.710. Qual é o R:R (1 casa decimal)?", 1.9, 0.05, "Alvo 198 ÷ stop 104 = 1,90."),
      num("Qual é a taxa de acerto mínima (em %) para empatar com R:R = 1,5?", 40, 0.1, "%", "1 ÷ (1 + 1,5) = 40%."),
      mc("Qual é o quadrante mais perigoso entre processo e resultado?", ["Processo bom, resultado mau", "Processo mau, resultado bom", "Processo bom, resultado bom", "Nenhum"], 1, "Reforça hábitos que custam dinheiro quando repetidos."),
      mc("O que é redundância num score?", ["Contar a mesma evidência como dois fatores", "Ter poucos fatores", "Registar no journal", "Usar stop"], 0, "Infla o score com uma falsa sensação de confiança."),
      tf("'No trade' é uma decisão válida mesmo com score alto, se o R:R não for aceitável.", true, "A decisão recomendada segue o processo: score e R:R; sem R:R aceitável, a ideia não passa."),
    ],
  },
};
