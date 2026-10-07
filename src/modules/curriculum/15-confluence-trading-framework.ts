import { CONFLUENCE_FRAMEWORK_NOTICE } from "../legal";
import { chart, mc, num, rr, tf } from "../dsl";
import type { ModuleDef } from "../types";

/**
 * Module 15 — Confluence Trading Framework (Level 6).
 * An ORIGINAL educational synthesis of widely-used technical concepts. It does not reproduce any third-party course,
 * video or text, and the mandatory notice (CONFLUENCE_FRAMEWORK_NOTICE) is shown at the top of the first and last lessons.
 */
export const confluenceTradingFramework: ModuleDef = {
  slug: "confluence-trading-framework",
  number: 15,
  level: 6,
  title: "Confluence Trading Framework",
  summary: "Um framework educativo original em 12 passos — viés do timeframe superior, estrutura, níveis, oferta/procura, Fibonacci, confluência, exaustão, confirmação, entrada, risco, gestão e saída.",
  difficulty: "INTERMEDIATE",
  icon: "ListChecks",
  lessons: [
    {
      slug: "framework-em-12-passos",
      title: "O framework em 12 passos",
      summary: "Uma metodologia educativa original que organiza tudo o que aprendeste num processo de decisão repetível.",
      minutes: 7,
      content: `> **${CONFLUENCE_FRAMEWORK_NOTICE}**

Este framework é uma **forma de organizar** os conceitos que já estudaste — por ordem e com perguntas de controlo — num **processo de decisão repetível**. Não é uma estratégia secreta, não promete resultados e **não substitui** o teu próprio trabalho de teste e validação.

## Os 12 passos
| # | Passo | Pergunta de controlo |
| --- | --- | --- |
| 1 | **Higher Timeframe Bias** | Qual é a direção dominante no timeframe superior? |
| 2 | **Market Structure** | A estrutura do timeframe de trabalho está intacta e onde está o último HL/LH? |
| 3 | **Key Levels** | Onde estão os níveis relevantes (S/R, PDH/PDL, extremos de sessão)? |
| 4 | **Supply / Demand** | Há uma zona de oferta/procura fresca e relevante? |
| 5 | **Fibonacci** | O recuo está numa zona de interesse do impulso? |
| 6 | **Confluence** | Quantos fatores independentes se alinham? (Confluence Score) |
| 7 | **Exhaustion** | O movimento anterior mostra sinais de cansaço que justifiquem uma ideia? |
| 8 | **Price Action Confirmation** | Há confirmação no candle ou na estrutura de timeframe inferior? |
| 9 | **Entry** | Qual é o gatilho exato e o preço de entrada? |
| 10 | **Risk Management** | Onde está a invalidação, qual o risco e qual o tamanho? |
| 11 | **Trade Management** | O que faço se o trade for a favor ou não se mexer? |
| 12 | **Exit** | Em que condições saio, com lucro ou com perda? |

## Como usar
- Os passos 1 a 8 respondem a **"há uma ideia com contexto?"**;
- Os passos 9 a 12 respondem a **"como executo e protejo?"**;
- **Se um passo essencial falhar, não há trade** — esse é o valor do framework: **impedir-te de agir** quando a informação é fraca;
- O resultado de **um** trade não valida nem invalida o framework — só uma amostra grande e honesta o faz.

> O framework **não prevê** o mercado. Organiza a decisão.`,
      example: `Uma ideia que **falha o passo 1**: o timeframe superior está em baixa e a ideia é de compra. O framework não "proíbe" o trade — obriga-te a **assumi-lo como contra-tendência**, com o risco e o tamanho correspondentes (ou a não o tomar). Uma ideia que **falha o passo 10** (o stop técnico dá um risco acima do orçamento) **não passa** — o tamanho não se ajusta "para caber".`,
      visual: { kind: "diagram", id: "confluence-stack", caption: "Fatores independentes que se alinham na mesma zona (ilustração)." },
      takeaways: ["O framework tem 12 passos: viés, estrutura, níveis, oferta/procura, Fibonacci, confluência, exaustão, confirmação, entrada, risco, gestão e saída.", "Os passos 1–8 respondem 'há uma ideia com contexto?'; os 9–12 'como executo e protejo?'.", "Se um passo essencial falha, não há trade; o resultado de um trade não valida o framework."],
      quiz: [
        mc("Quantos passos tem o framework?", ["5", "8", "12", "20"], 2, "São 12 passos, do viés do timeframe superior à saída."),
        tf("Este framework é o curso oficial de Cuebanks/Wall Street Academy.", false, "É uma síntese educativa original e não é o curso oficial de Cuebanks/Wall Street Academy."),
        mc("Qual é o principal valor do framework?", ["Prever o mercado", "Impedir-te de agir quando a informação é fraca e organizar a decisão", "Eliminar o risco", "Garantir lucros"], 1, "Serve para disciplina e seletividade."),
        mc("O que acontece se um passo essencial falhar?", ["Fazes o trade na mesma", "Não há trade (ou assume-se explicitamente a natureza contra-tendência)", "Aumentas o tamanho", "Retiras o stop"], 1, "O framework filtra ideias."),
      ],
    },
    {
      slug: "passos-1-a-4-contexto-e-localizacao",
      title: "Passos 1–4: viés, estrutura, níveis e zonas",
      summary: "Estabelecer o contexto e a localização antes de pensar em entrar.",
      minutes: 7,
      content: `## Passo 1 — Higher Timeframe Bias
No **timeframe superior** (por exemplo, H4 ou D1), descreve a **estrutura** (alta, baixa ou lateral) e o **último HL/LH**. O viés é uma **descrição**, não uma previsão:

- **Alta:** ideias de compra são "a favor";
- **Baixa:** ideias de venda são "a favor";
- **Lateral:** o contexto não dá direção — prioriza os extremos do range ou espera.

## Passo 2 — Market Structure (timeframe de trabalho)
Etiqueta HH/HL/LH/LL e identifica o **último HL (ou LH)**: é a referência de **invalidação** mais natural. Pergunta: a estrutura está **intacta**? Houve **quebra**?

## Passo 3 — Key Levels
Marca poucos níveis relevantes, **como zonas**: S/R com várias reações, PDH/PDL, PWH/PWL, extremos de sessão, números redondos. **Menos é mais.**

## Passo 4 — Supply / Demand
Há uma zona de **oferta ou procura fresca** (ou pouco testada) com **partida clara** e alinhada com o viés? Se **não**, pode não haver problema — mas este fator **não conta** para o score.

## Resultado destes quatro passos
Uma **frase** que descreve onde estás e o que procuras:

> "H4 em alta (último HL em 38.300). No M15, recuo para a zona 38.420–38.455, que coincide com a antiga resistência rompida; a procura mais próxima está longe (~38.300)."

Se não consegues escrevê-la, **ainda não tens contexto** para avançar.`,
      example: `Passos 1–4 num exemplo educativo (cenário DEMO): **H4 em alta**; M15 com HH/HL, **último HL em 38.300** (passo 2); recuo para **38.420–38.455**, onde estava a antiga resistência de 38.420 (passo 3); a zona de procura mais próxima (~38.300) está **longe** (passo 4: fator ausente).

Frase final: "Alta no H4; recuo no M15 para um nível flipado; sem zona fresca junto à entrada." Informação suficiente para passar ao passo 5 — com a ressalva de que falta um fator.`,
      takeaways: ["Os passos 1–4 estabelecem viés, estrutura, níveis e zonas — poucos e relevantes.", "O último HL/LH é a referência natural de invalidação.", "Termina escrevendo uma frase que descreve onde estás e o que procuras."],
      quiz: [
        mc("Qual é a função do passo 1?", ["Escolher o stop", "Descrever o viés do timeframe superior (estrutura e último HL/LH)", "Calcular o tamanho", "Escolher o broker"], 1, "O viés dá o contexto dominante."),
        mc("Qual é a referência de invalidação mais natural numa estrutura de alta?", ["O último HH", "O último HL", "O PDH", "A abertura"], 1, "A quebra do último HL destrói a sequência de mínimos mais altos."),
        tf("Se não há zona de oferta/procura fresca, o fator oferta/procura conta na mesma para o score.", false, "Só conta o que está presente e demonstrável."),
        mc("Qual é um sinal de que ainda não tens contexto?", ["Consegues escrever uma frase clara", "Não consegues escrever uma frase que descreva onde estás e o que procuras", "O spread é baixo", "O dia é de semana"], 1, "A frase é o teste de clareza."),
      ],
    },
    {
      slug: "passos-5-a-8-confluencia-exaustao-e-confirmacao",
      title: "Passos 5–8: Fibonacci, confluência, exaustão e confirmação",
      summary: "Medir o recuo, contar fatores independentes, avaliar cansaço e exigir confirmação.",
      minutes: 8,
      content: `## Passo 5 — Fibonacci
Mede o **impulso** relevante (A→B), na direção do viés, e marca a **zona de interesse** do recuo (por exemplo, 50%–78,6%). É uma **régua de estudo**: não é suporte garantido.

## Passo 6 — Confluence
Conta os **fatores independentes** que se alinham (tendência, estrutura, S/R, oferta/procura, Fibonacci, price action, liquidez, R:R). **Regista o score** com a evidência de cada fator numa frase. Define o teu **limiar mínimo** (por exemplo, 6) **antes**.

## Passo 7 — Exhaustion
O movimento que antecedeu a zona mostra **cansaço**? Pavios contra, ranges a diminuir, perda de momentum, **varrimento** de liquidez. É uma **pista**, não um sinal: pode justificar uma ideia de reversão ou **reforçar** a continuação depois de um recuo.

## Passo 8 — Price Action Confirmation
Exige **comportamento** na zona: candle de rejeição, engolfo com fecho, **mudança de estrutura** no timeframe inferior, rompimento com reteste. **Sem confirmação** é esperança.

## Regras de disciplina
- **Não** inventes fatores para atingir o limiar;
- **Não** contes o mesmo sinal duas vezes (redundância);
- A **confirmação** custa preço: entrar mais tarde pode piorar o R:R — aceita o trade-off ou não entres;
- Se o score está abaixo do limiar, **a resposta é "no trade"**.

## Ligação com as ferramentas
No **Confluence Lab** podes praticar a contagem de fatores e a decisão TAKE/NO TRADE; no **Chart Replay**, praticas os passos em tempo real.`,
      example: `Impulso A = 38.300 → B = 38.620 (320 pontos). Recuo de 50%–61,8% = **38.460–38.422** (passo 5). Fatores: tendência ✔, estrutura ✔, S/R ✔ (nível flipado), oferta/procura ✘, Fibonacci ✔, price action ✔ (engolfo), liquidez ✔ (mínimos iguais varridos), R:R ✔ (1,9) → **score 7/8** (passo 6).

Passo 7: o movimento de recuo mostrou pavios inferiores a rejeitar e um varrimento de mínimos iguais: sinais de cansaço do recuo. Passo 8: engolfo bullish a fechar acima do máximo do candle anterior → confirmação.`,
      exercise: { kind: "confluence", scenarioId: "conf-strong-long", prompt: "Analisa os passos 5–8 neste cenário: identifica os fatores presentes, a exaustão e a confirmação." },
      takeaways: ["Passos 5–8: medir (Fibonacci), contar fatores (confluência), avaliar exaustão e exigir confirmação.", "Define o limiar antes; não inventes fatores nem contes o mesmo sinal duas vezes.", "Abaixo do limiar, a resposta é 'no trade'."],
      quiz: [
        num("Impulso A = 38.300, B = 38.620. Qual é o nível de 61,8% de recuo (1 casa decimal)?", 38422.2, 0.1, undefined, "38.620 − 0,618 × 320 = 38.422,2."),
        mc("Qual é o papel do passo 8?", ["Calcular o tamanho", "Exigir comportamento (confirmação) na zona antes de agir", "Escolher o timeframe", "Definir o stop"], 1, "Sem confirmação é esperança."),
        tf("A exaustão é um sinal de entrada.", false, "É uma pista que contribui para o contexto; não é um sinal."),
        chart("CHART_ANALYSIS", "conf-strong-long", "Neste cenário, que sinal de price action serviu de confirmação no ponto de decisão?", ["Um doji", "Engolfo bullish depois de rejeição de um mínimo varrido", "Um gap", "Nenhum"], 1, "O candle de rejeição seguido de engolfo é a confirmação no ponto de decisão."),
      ],
    },
    {
      slug: "passos-9-a-12-execucao-risco-e-gestao",
      title: "Passos 9–12: entrada, risco, gestão e saída",
      summary: "Transformar uma ideia com contexto num plano executável, com risco definido e regras de gestão.",
      minutes: 8,
      content: `## Passo 9 — Entry
- **Gatilho:** qual é o evento exato que desencadeia a entrada? (fecho acima do máximo do engolfo, quebra do mini-LH, reteste…);
- **Tipo de ordem:** a mercado (execução certa, preço incerto), limite (preço melhor, execução incerta) ou stop de entrada;
- **Preço aproximado**, tendo em conta **spread** e **slippage**.

## Passo 10 — Risk Management
- **Invalidação técnica:** onde a ideia fica errada? (abaixo do último HL, do pavio do varrimento…);
- **Risco por trade** (por exemplo, 1% da conta) → **orçamento em dólares**;
- **Tamanho** = orçamento ÷ risco por contrato, **arredondado para baixo**;
- **R:R** com o alvo técnico: abaixo do mínimo (por exemplo, 1,5) **não passa**.

## Passo 11 — Trade Management
Define **antes**:
- O que fazer se o preço **vai a favor** (sair em parcelas? mover o stop para o breakeven em que condição?);
- O que fazer se **não se mexe** (limite de tempo);
- O que **nunca** fazer: afastar o stop.

## Passo 12 — Exit
- **Saída por stop** (invalidação);
- **Saída por alvo** (técnico);
- **Saída por tempo/condição** (por exemplo, nova estrutura contra);
- **Registo** no journal: razão de entrada, score, regras cumpridas, resultado e lição.

## Regra de ouro
Os passos 9 a 12 são **escritos antes** de enviares a ordem. Se **durante** o trade queres alterar o plano, pergunta: "estou a reagir ao mercado ou à minha emoção?"`,
      example: `Entrada **38.512**, stop **38.408** (**104 pontos**), alvo **38.710** (**198 pontos**) → **R:R ≈ 1,9:1**.

Conta $10.000, risco 1% = $100. MYM: risco por contrato = 104 × $0,50 = **$52** → $100 ÷ $52 = 1,92 → **1 contrato** (risco $52 = 0,52%). Dois contratos arriscariam $104 > $100: **não passa**, mesmo que a convicção seja alta.

Gestão: sair metade em 38.600 e mover o stop para o breakeven **apenas** se a estrutura o justificar; saída final em 38.710 ou por stop; se o preço quebrar 38.408, **a ideia acabou**.`,
      takeaways: ["Entrada: gatilho exato, tipo de ordem e consciência de spread/slippage.", "Risco: invalidação técnica, orçamento em dólares, tamanho arredondado para baixo e R:R mínimo.", "Gestão e saída escritas antes; nunca afastes o stop."],
      quiz: [
        rr("Entrada 38.512, stop 38.408, alvo 38.710. Qual é o R:R (1 casa decimal)?", 1.9, 0.05, "Alvo 198 ÷ stop 104 = 1,90."),
        num("Orçamento $100, MYM ($0,50/ponto), stop de 104 pontos. Quantos contratos?", 1, 0, "contratos", "Risco por MYM = 104 × $0,50 = $52; $100 ÷ $52 = 1,92 → 1.", "POSITION_SIZE"),
        tf("Durante o trade, afastar o stop é uma forma legítima de 'dar espaço'.", false, "Afastar o stop aumenta o risco para além do plano."),
        mc("Qual é a regra de ouro dos passos 9–12?", ["Decidir durante o trade", "Escrevê-los antes de enviar a ordem", "Copiá-los de outro trader", "Ignorá-los"], 1, "Decisões escritas antes reduzem a reação emocional."),
      ],
    },
    {
      slug: "exemplo-completo-do-framework",
      title: "Um exemplo completo, passo a passo",
      summary: "Os 12 passos aplicados a um cenário educativo, incluindo o que está em falta.",
      minutes: 8,
      content: `Cenário **DEMO** (dados sintéticos): Dow em alta; compra após recuo para um nível flipado, com varrimento de mínimos iguais e engolfo.

| # | Passo | Evidência |
| --- | --- | --- |
| 1 | Viés (H4) | Alta; último HL do H4 em 38.000 |
| 2 | Estrutura (M15) | HH/HL intactos; último HL em **38.300** |
| 3 | Níveis | Antiga resistência **38.420–38.455**, agora suporte |
| 4 | Oferta/Procura | **Ausente** — a zona mais próxima está longe |
| 5 | Fibonacci | Recuo entre 50% (38.460) e 61,8% (38.422) do impulso 38.300→38.620 |
| 6 | Confluência | **7/8** (falta oferta/procura) |
| 7 | Exaustão | Recuo com pavios inferiores; mínimos iguais varridos |
| 8 | Confirmação | Engolfo bullish a fechar em 38.512 |
| 9 | Entrada | **38.512** (fecho do engolfo) |
| 10 | Risco | Stop **38.408** (104 pts); R:R **1,9**; 1 MYM com risco de $100 |
| 11 | Gestão | Parcial em 38.600; stop para breakeven só se nova estrutura o justificar |
| 12 | Saída | Alvo **38.710** ou stop em 38.408; registo no journal |

## O que este exemplo ensina
1. **Um fator pode faltar** e a ideia ainda passar o limiar (7/8, limiar 6) — **mas** o que falta fica registado;
2. O **R:R de 1,9** só é aceitável porque o alvo está num **nível técnico** (não "porque dá jeito");
3. O resultado **não valida** nada: o mesmo desenho em espelho, num cenário distinto, pode **perder** (tens-no no Confluence Lab);
4. O valor está em **registar** o processo — para o poder avaliar mais tarde com muitos casos.

## Faz tu
No Confluence Lab, abre estes cenários e preenche o teu próprio quadro de 12 passos **antes** de veres a solução.`,
      example: `Registo de journal (resumo): "H4 alta; M15 recuo para nível flipado; score 7/8 (falta S/D); engolfo; entrada 38.512, stop 38.408, alvo 38.710; risco $52 (0,52%); R:R 1,9; razão: setup válido; regras 12/12 cumpridas." O campo **avaliação do processo** é preenchido **independentemente** do resultado.`,
      exercise: { kind: "confluence", scenarioId: "conf-strong-short-loss", prompt: "Faz o quadro dos 12 passos para este cenário (venda) e repara que o processo é igualmente sólido, apesar de o stop ser atingido." },
      takeaways: ["Um fator pode faltar e a ideia passar o limiar — mas o que falta fica registado.", "O R:R só vale se o alvo estiver num nível técnico.", "Regista o processo para avaliar com amostra; o resultado de um trade não valida o método."],
      quiz: [
        chart("CHART_ANALYSIS", "conf-strong-long", "Neste cenário, que fator do score está em falta?", ["Estrutura", "Oferta/procura", "Fibonacci", "R:R"], 1, "A zona de procura fresca está longe do ponto de decisão."),
        rr("Entrada 38.512, stop 38.408, alvo 38.710. Qual é o R:R?", 1.9, 0.05, "198 ÷ 104 = 1,9."),
        tf("Um score de 7/8 garante que o trade ganha.", false, "Nenhum score garante o resultado."),
        chart("CHART_ANALYSIS", "conf-strong-short-loss", "Neste cenário a venda perdeu. O que se pode dizer do processo?", ["Estava errado", "Pode ter sido sólido: o resultado de um trade não invalida o processo", "Foi aleatório", "O stop devia ser removido"], 1, "Uma perda isolada faz parte da distribuição de resultados."),
      ],
    },
    {
      slug: "adaptar-e-testar-o-framework",
      title: "Adaptar, testar e documentar o teu framework",
      summary: "Como transformar este modelo educativo num processo pessoal, testável e honesto.",
      minutes: 7,
      content: `> **${CONFLUENCE_FRAMEWORK_NOTICE}**

O objetivo final não é aplicar *este* framework — é teres **o teu**: simples, escrito e testado.

## 1. Simplifica
- **Remove** passos que não usas (por exemplo, exaustão, se não a consegues definir objetivamente);
- **Funde** passos redundantes;
- Mantém um **checklist curto** (8–12 itens).

## 2. Torna os critérios objetivos
Para cada passo, escreve a **regra de presença** em termos testáveis (exemplo: "equal highs = dois swings com diferença ≤ 0,3 × ATR").

## 3. Define limiares e limites **antes**
- Score mínimo (por exemplo, 6);
- R:R mínimo (por exemplo, 1,5);
- Risco por trade (por exemplo, 0,5–1%);
- Limites diários (perda máxima, nº de trades).

## 4. Testa
- **Replay** e **backtests** com as mesmas regras, **sem mudar a meio**;
- **Journal** com todas as ideias (incluindo as não tomadas);
- Mede **amostra**, **R médio**, **expectancy**, **drawdown** e **cumprimento do processo**.

## 5. Sê honesto com os limites
- Amostras pequenas **não provam** nada;
- Resultados em dados **sintéticos** são para treinar o processo, **não** para validar vantagem;
- Os custos reais (spread, slippage, comissões) **reduzem** resultados;
- Um framework **pode não ter vantagem** — e saber isso cedo é útil.

## 6. Revê com calma
Faz uma revisão semanal e mensal: o que cumpri, o que quebrei, que passos me deram mais clareza. Altera **uma coisa de cada vez** e **volta a testar**.

> A confiança num método vem de **dados teus, bem registados** — não de uma história bonita nem de um curso famoso.`,
      example: `Aluno simplifica o framework para 9 itens, define: score ≥ 6 e R:R ≥ 1,5; risco 0,5%; máximo de 2 trades/dia. Em 6 semanas de replay: 54 ideias registadas, 21 tomadas. R médio das tomadas: **+0,12R**; cumprimento do processo: 90%. Conclusão honesta: **amostra pequena**, dados sintéticos; só serve para treinar disciplina. O próximo passo é aumentar a amostra e repetir **com custos** — nada de começar com dinheiro a partir daqui.`,
      visual: { kind: "diagram", id: "process-loop", caption: "O ciclo: planear, executar, registar, rever, melhorar." },
      exercise: { kind: "reflection", prompt: "Escreve o teu checklist em 8–12 itens, com a regra objetiva de cada um e os teus limiares (score, R:R, risco por trade).", placeholder: "O teu checklist pessoal…" },
      takeaways: ["Simplifica, torna os critérios objetivos e define limiares e limites antes de operar.", "Testa com replay, backtests e journal, sem mudar as regras a meio.", "Sê honesto: amostras pequenas e dados sintéticos treinam disciplina, não provam vantagem."],
      quiz: [
        mc("Qual é o objetivo final do framework educativo?", ["Ser copiado à letra", "Ajudar-te a construir o teu processo simples, escrito e testado", "Garantir lucros", "Substituir o stop"], 1, "É um ponto de partida para o teu próprio processo."),
        tf("Resultados em dados sintéticos validam a vantagem de um método.", false, "Servem para treinar o processo; a validação exige dados reais, custos e amostras grandes."),
        mc("Como devem ser tratadas as regras durante um teste?", ["Mudadas a meio sempre que um trade falha", "Mantidas fixas durante a amostra e alteradas uma a uma depois, com novo teste", "Ignoradas", "Escolhidas depois do resultado"], 1, "Mudar a meio invalida o teste."),
        mc("Qual é uma conclusão honesta de 21 trades com +0,12R de R médio em replay?", ["O método funciona", "Amostra pequena e dados sintéticos: serve para treinar disciplina, não para provar vantagem", "É um método infalível", "Deve-se aumentar o risco"], 1, "A amostra e a natureza dos dados limitam as conclusões."),
      ],
    },
  ],
  quiz: {
    title: "Quiz do módulo — Confluence Trading Framework",
    passScore: 70,
    questions: [
      mc("Quantos passos tem o framework educativo?", ["6", "9", "12", "15"], 2, "São 12 passos, do viés do timeframe superior (passo 1) até à saída (passo 12)."),
      tf("Este framework é o curso oficial de Cuebanks/Wall Street Academy.", false, "É uma síntese educativa original e não é o curso oficial."),
      mc("O que fazem os passos 1–8?", ["Definem o tamanho", "Respondem a 'há uma ideia com contexto?'", "Gerem a saída", "Escolhem o broker"], 1, "Os passos 1–8 constroem o contexto e a confirmação."),
      mc("O que fazem os passos 9–12?", ["Respondem a 'como executo e protejo?': entrada, risco, gestão e saída", "Escolhem o viés", "Medem Fibonacci", "Contam o score"], 0, "São a parte de execução e proteção."),
      rr("Entrada 38.512, stop 38.408, alvo 38.710. Qual é o R:R?", 1.9, 0.05, "198 ÷ 104 = 1,9."),
      num("Orçamento $100, MYM, stop de 104 pontos. Quantos contratos?", 1, 0, "contratos", "104 × $0,50 = $52 por contrato; $100 ÷ $52 = 1,92 → 1.", "POSITION_SIZE"),
      chart("CHART_ANALYSIS", "conf-weak-long", "Neste cenário, o que faria o framework concluir?", ["Que há uma boa ideia de compra", "Que a ideia não passa: contra a estrutura, sem confirmação e com mau R:R", "Que o stop devia ser removido", "Nada"], 1, "Falham vários passos essenciais: a resposta é 'no trade'."),
      tf("Se um passo essencial falha, o framework manda aumentar o tamanho.", false, "Se falha, não há trade (ou assume-se explicitamente o risco contra-tendência)."),
      mc("Qual é a regra para os passos 9–12?", ["Decidir durante o trade", "Escrevê-los antes de enviar a ordem", "Copiá-los", "Ignorá-los"], 1, "Escrever antes reduz a reação emocional."),
      mc("Que tipo de amostra é preciso para avaliar o teu framework?", ["Um trade", "Uma amostra grande e honesta, com custos e registo completo", "Os melhores 3 trades", "Nenhuma"], 1, "A validade vem de dados completos."),
    ],
  },
};
