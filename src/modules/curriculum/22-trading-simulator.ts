import { mc, num, tf } from "../dsl";
import type { ModuleDef } from "../types";

/**
 * Module 22 — Trading Simulator (Level 8). Mirrors /simulator: virtual account, DEMO series, shared execution engine.
 * Account fields: balance · equity · open P&L · used margin · free margin · daily P&L · drawdown · max drawdown.
 * ALL cost and margin figures are the platform's ILLUSTRATIVE constants (YM/MYM margin $9.000/$900; spread 1 pt; commission per side
 * YM $1,50 / MYM $0,50) — not CME margins and not any broker's fees. Contract values (YM $5/pt, MYM $0,50/pt) are from CME (excerpt 2026-10-06).
 */
export const tradingSimulator: ModuleDef = {
  slug: "trading-simulator",
  number: 22,
  level: 8,
  title: "Trading Simulator",
  summary: "A conta virtual: saldo, equity, margem, P&L aberto e diário, drawdown, custos e alavancagem — e como treinar com ela sem enganar a tua avaliação.",
  difficulty: "ADVANCED",
  icon: "Gauge",
  lessons: [
    {
      slug: "a-conta-de-simulacao",
      title: "A conta de simulação",
      summary: "O que é, o que simula e como a plataforma garante que os números não são inventados.",
      minutes: 6,
      content: `O **Simulador** dá-te uma **conta virtual** para praticar execução com as **mesmas regras de motor** do Replay. **Não envolve dinheiro real.**

## Como funciona
1. **Crias uma conta** com saldo inicial virtual e timeframe;
2. O gráfico avança **barra a barra** (tu controlas);
3. Abres trades com **stop, alvo, tamanho** e **razão de entrada**;
4. A plataforma aplica **spread**, **comissões**, **margem** e **P&L** com regras claras;
5. No fim de cada trade recebes uma **avaliação de processo**.

## Dados DEMO
Os preços são **sintéticos e determinísticos**, claramente rotulados **DEMO**. Servem para treinar **método** e **execução**; **não são mercado real**.

## Valores por contrato
- **YM:** $5,00 por ponto;
- **MYM:** $0,50 por ponto;
- **US30 CFD (demo):** $1 por ponto por lote **apenas ilustrativo** — nos brokers reais depende do contrato.

Os valores de YM e MYM vêm das especificações do **CME Group** (confirmados por excerto oficial em 2026-10-06). **Margens e custos** são **ilustrativos** (ver lições seguintes).

## O que o Simulador valida
- **Margem livre suficiente** para abrir o trade (se não, a ordem é recusada com uma explicação) — é uma regra da **conta**, não um bloqueio educativo;
- **Valores válidos** (stop do lado certo, quantidades inteiras);
- **A checklist** avisa mas **não bloqueia**.

## Várias contas
Podes ter **várias contas** (por exemplo, uma por estratégia) e **arquivá-las** quando terminares. Compara as estatísticas **por conta** para não misturares experiências.

## Honestidade nas estatísticas
Estatísticas calculadas sobre **poucos trades** são **provisórias**. A plataforma assinala-o: a melhor leitura é sempre a de **muitas decisões** com processo consistente.`,
      example: `Conta criada: **"MYM — recuos a zonas"**, saldo inicial **$10.000**, timeframe 5 min.

- Primeira decisão: abrir 3 MYM comprados? **Margem ilustrativa** de 3 × $900 = **$2.700**: cabe nos $10.000;
- Segunda decisão: 12 MYM? Margem **$10.800** → **recusado**: "margem livre insuficiente".

A recusa não é um julgamento sobre a ideia: é uma **regra da conta** — como a de uma corretora real. A resposta correta é **reduzir o tamanho**, não "arranjar mais margem".`,
      exercise: { kind: "link", href: "/simulator", label: "Abrir o Simulador", prompt: "Cria uma conta de simulação (MYM, saldo $10.000) e abre um trade com stop, alvo e razão de entrada honesta." },
      takeaways: ["O Simulador é uma conta virtual com dados DEMO e as mesmas regras do Replay.", "Margem insuficiente recusa a ordem; a checklist apenas avisa.", "Margens e custos são ilustrativos; os valores por ponto de YM e MYM vêm do CME."],
      quiz: [
        tf("O Simulador usa dinheiro real.", false, "É uma conta virtual com dados DEMO."),
        num("Margem ilustrativa de $900 por MYM. Quanto exigem 3 contratos, em dólares?", 2700, 0, "$", "3 × $900 = $2.700."),
        mc("O que acontece se a margem livre for insuficiente?", ["A ordem abre com tamanho menor", "A ordem é recusada com explicação", "A checklist bloqueia o trade", "A margem é ignorada"], 1, "É uma regra da conta, como numa corretora."),
        tf("As margens do Simulador são as margens oficiais do CME.", false, "São valores ilustrativos; consulta o CME e a tua corretora."),
      ],
    },
    {
      slug: "saldo-equity-e-margem",
      title: "Saldo, equity e margem",
      summary: "Quatro números que descrevem a conta a cada momento — e como se relacionam.",
      minutes: 7,
      content: `A conta do Simulador mostra números que se confundem com facilidade. Eis o que cada um é.

## Saldo (balance)
Dinheiro **realizado**: saldo inicial + resultados dos trades **fechados** (com custos).

## P&L aberto (floating)
O resultado **não realizado** das posições abertas, calculado ao preço a que **poderias fechar** agora (compras ao *bid*, vendas ao *ask*).

## Equity
\`equity = saldo + P&L aberto\`

É o valor da conta **se fechasses tudo agora** (sem contar comissões de saída). É o número que importa para o **risco** e para a **margem**.

## Margem usada
Fundos **reservados** para manter as posições abertas. Na plataforma (valores **ilustrativos**): YM $9.000, MYM $900, US30 $400 por contrato/lote. **Não são as margens do CME**, que mudam; a tua corretora pode pedir mais.

## Margem livre
\`margem livre = equity − margem usada\`

Define quanto **ainda podes abrir**. Se a equity cair, a margem livre cai com ela.

## Pontos importantes
- **Margem não é risco.** A margem é um **depósito**; o risco é a **perda máxima planeada** (distância ao stop × valor por ponto × contratos);
- **Equity e saldo divergem** enquanto houver posições abertas;
- Um trade pode estar muito **lucrativo em papel** e voltar atrás antes de o fechares: o saldo só muda **ao fechar**.

## Em corretoras reais
Existem regras de **chamada de margem** e **liquidação** que fecham posições se a equity cair demasiado. Variam entre corretoras e contratos — não assumas o comportamento: confirma sempre as regras da tua.`,
      example: `Saldo **$10.000**. Compras 3 MYM com fill a **39.001**; o preço (bid) sobe para **39.030**.

- **P&L aberto:** (39.030 − 39.001) × $0,50 × 3 = 29 × $1,50 = **+$43,50**;
- **Equity:** 10.000 + 43,50 = **$10.043,50**;
- **Margem usada (ilustrativa):** 3 × $900 = **$2.700**;
- **Margem livre:** 10.043,50 − 2.700 = **$7.343,50**;
- **Saldo:** continua **$10.000** — só muda quando fechares o trade.

Se o preço recuar para 38.990: P&L aberto = (38.990 − 39.001) × $1,50 = **−$16,50**; equity **$9.983,50**; margem livre **$7.283,50**.`,
      takeaways: ["Equity = saldo + P&L aberto; margem livre = equity − margem usada.", "Margem é depósito, não risco: o risco é a perda planeada até ao stop.", "O saldo só muda ao fechar; as margens da plataforma são ilustrativas."],
      quiz: [
        num("Saldo $10.000, P&L aberto +$43,50. Qual é a equity, em dólares?", 10043.5, 0.01, "$", "Equity = saldo + P&L aberto = 10.000 + 43,50."),
        num("Equity $10.043,50 e margem usada $2.700. Margem livre, em dólares?", 7343.5, 0.01, "$", "10.043,50 − 2.700 = 7.343,50."),
        tf("A margem usada é a perda máxima do trade.", false, "A margem é um depósito; o risco é a distância ao stop vezes o valor por ponto vezes os contratos."),
        mc("Quando muda o saldo?", ["A cada tick", "Ao fechar trades", "Ao abrir trades", "Quando a equity sobe"], 1, "O saldo só reflete resultados realizados."),
      ],
    },
    {
      slug: "pl-diario-e-drawdown",
      title: "P&L diário e drawdown",
      summary: "Medir o dia e a queda desde o pico — e porque o drawdown máximo é a métrica que assusta.",
      minutes: 7,
      content: `Dois números do painel ajudam-te a **respeitar limites**: o **P&L diário** e o **drawdown**.

## P&L diário
\`P&L diário = equity atual − equity no início do dia\`

Mostra como o dia está a correr, **incluindo posições abertas**. É a base do teu **limite de perda diária** (módulo 17 e plano diário).

## Drawdown
\`drawdown = pico de equity − equity atual\`

É a **queda desde o máximo** que a equity já atingiu. Mede o que **doeu** desde o pico.

## Drawdown máximo
O **pior** drawdown já registado na conta. É uma das métricas mais importantes para avaliar um método:
- Responde a "**quanto tenho de suportar** para ficar com este método?";
- Interage com o **tamanho de posição**: arriscar demais aumenta o drawdown.

## Percentagem vs dólares
O drawdown em **dólares** informa a dor; em **percentagem do pico** informa a gravidade relativa. Um drawdown de $1.000 é 10% com $10.000, mas 1% com $100.000.

## Como usar
1. **Define** um drawdown máximo tolerável (por exemplo, 10% do saldo inicial) **antes** de começar;
2. **Reduz o tamanho** ao aproximar-te dele (nunca o aumentes);
3. **Pára** e revê o processo se o limite for atingido;
4. **Compara** o drawdown máximo com o ganho médio: um método que ganha pouco e tem drawdown grande não compensa.

## Armadilhas
- Olhar só para o **saldo** e ignorar a equity: a perda flutuante também conta;
- Ignorar o **drawdown intradiário** quando se opera com posições abertas;
- **Reiniciar** a conta sempre que o drawdown dói, apagando a evidência.`,
      example: `Equity ao longo de uma sessão fictícia (início do dia **$10.000**):

| Momento | Equity | Pico | Drawdown | P&L diário |
|---|---|---|---|---|
| 09:30 | 10.000 | 10.000 | 0 | 0 |
| 10:15 | 10.150 | 10.150 | 0 | +150 |
| 11:00 | 10.020 | 10.150 | 130 | +20 |
| 11:40 | 10.090 | 10.150 | 60 | +90 |

**Drawdown máximo** da sessão: **$130** (≈ 1,28% do pico de $10.150). O dia termina positivo (+$90), mas passou por uma queda de $130 desde o pico — informação que o P&L final **esconde**.`,
      takeaways: ["P&L diário = equity atual − equity do início do dia; inclui posições abertas.", "Drawdown = pico de equity − equity atual; o máximo mede o pior período.", "Define um drawdown máximo tolerável antes de operar e reduz o tamanho ao aproximar-te dele."],
      quiz: [
        num("Equity do início do dia $10.000 e atual $10.090. P&L diário em dólares?", 90, 0, "$", "10.090 − 10.000 = $90."),
        num("Pico de equity $10.150 e equity atual $10.020. Drawdown em dólares?", 130, 0, "$", "10.150 − 10.020 = $130."),
        mc("O que mede o drawdown máximo?", ["O maior ganho num dia", "A maior queda desde um pico de equity", "O custo total de comissões", "O número de trades perdidos"], 1, "É a pior queda registada desde um máximo."),
        tf("Reiniciar a conta sempre que o drawdown dói é uma boa forma de aprender.", false, "Apaga a evidência do que aconteceu; o drawdown ensina sobre risco e comportamento."),
      ],
    },
    {
      slug: "custos-spread-e-comissao",
      title: "Custos: spread e comissão",
      summary: "Quanto custa entrar e sair, e porque os custos pesam mais em stops curtos.",
      minutes: 7,
      content: `Cada trade tem **custos** que o gráfico não mostra. Os do Simulador são **ilustrativos** — mas o conceito é o mesmo das corretoras reais.

## Componentes
- **Spread:** diferença entre **ask** e **bid**. Compras ao ask e vendes ao bid; uma ida e volta custa **um spread**;
- **Comissão:** taxa por contrato e por lado (entrada e saída); somam-se as **duas**;
- **Taxas** (exchange, regulatórias): variam por corretora;
- **Slippage:** diferença entre o preço esperado e o executado — em volatilidade, pode ser grande.

## Custos ilustrativos no Simulador
| Símbolo | Spread | Comissão por lado |
|---|---|---|
| YM | 1 ponto | $1,50 |
| MYM | 1 ponto | $0,50 |
| US30 (CFD) | 1,5 pontos | $0 (o custo vem do spread) |

Ida e volta, **por contrato**:
- **MYM:** spread 1 × $0,50 = **$0,50** + comissões 2 × $0,50 = **$1,00** → **$1,50**;
- **YM:** spread 1 × $5 = **$5** + comissões 2 × $1,50 = **$3** → **$8**.

## Porque importam
Um custo fixo pesa **mais** quanto **menor** for o stop. Em **stops curtos** e com muitos trades, os custos podem consumir uma fração relevante do risco e do ganho — e transformar um método marginal em perdedor.

## Execução de stop e alvo
- Em **gap** (abertura além do nível), o stop executa **no preço de abertura**, pior do que o stop;
- Quando stop e alvo estão na **mesma vela**, assume-se o pior caso: **o stop vence**.

## O que fazer
1. **Inclui custos** no cálculo do risco e do R:R;
2. **Evita** overtrading (mais trades = mais custos);
3. **Confirma** os custos reais da tua corretora antes de decidir.`,
      example: `Compra de **4 MYM**, stop a 20 pontos:

- **Risco de mercado:** 20 × $0,50 × 4 = **$40**;
- **Custos ilustrativos** ida e volta: 4 × **$1,50** = **$6,00**;
- Custos ≈ **15%** do risco de mercado ($6 ÷ $40).

Se o trader fizer **8 trades por dia** assim: custos = **$48/dia**, ou **$960** em 20 dias — antes de qualquer erro de análise. Com stops de 60 pontos, os mesmos **$6** seriam só 5% do risco ($6 ÷ $120).`,
      takeaways: ["Os custos incluem spread, comissões (dois lados), taxas e slippage.", "No Simulador, MYM custa $1,50 e YM $8 por contrato em ida e volta (valores ilustrativos).", "Custos fixos pesam mais em stops curtos e com muitos trades."],
      quiz: [
        num("MYM: spread 1 ponto ($0,50) e comissão de $0,50 por lado. Custo de ida e volta por contrato, em dólares?", 1.5, 0.001, "$", "0,50 + 2 × 0,50 = $1,50."),
        num("4 MYM, custo de $1,50 por contrato em ida e volta. Custo total do trade, em dólares?", 6, 0, "$", "4 × $1,50 = $6,00."),
        mc("O que acontece ao stop num gap através do nível?", ["Executa exatamente no stop", "Executa no preço de abertura, pior do que o stop", "Não executa", "É cancelado"], 1, "O primeiro preço negociado é a abertura, e é aí que se executa."),
        tf("Os custos pesam mais quando o stop é muito curto.", true, "O custo é fixo por contrato; quanto menor o risco, maior a fração que ocupa."),
      ],
    },
    {
      slug: "alavancagem-e-risco-de-ruina",
      title: "Alavancagem, valor nocional e risco de ruína",
      summary: "Porque margem pequena não significa risco pequeno, e como a alavancagem amplifica ganhos e perdas.",
      minutes: 8,
      content: `Futuros são **alavancados**: com um depósito de margem controlas um valor **muito maior**. Isto amplifica **ganhos e perdas**.

## Valor nocional
\`nocional = preço × valor por ponto × contratos\`

- **MYM** a 39.000: 39.000 × $0,50 = **$19.500** por contrato;
- **YM** a 39.000: 39.000 × $5 = **$195.000** por contrato.

## Alavancagem efetiva
\`alavancagem = nocional ÷ saldo da conta\`

Com $10.000 e 5 MYM: 5 × $19.500 = **$97.500** → **9,75×**. Uma variação de **1%** no índice (390 pontos) equivale a 390 × $0,50 × 5 = **$975** — **9,75%** da conta.

## Margem ≠ risco
A margem ilustrativa de 5 MYM é $4.500 (45% da conta), mas o **risco planeado** com stop a 30 pontos é 5 × 30 × $0,50 = **$75** (0,75%). A conta pode estar bem protegida com **margem alta** e **stop curto**, ou muito exposta com **margem baixa** e **sem stop**.

## O que torna a alavancagem perigosa
- **Gaps** e saltos que passam o stop;
- **Slippage** em notícias;
- **Posições demasiado grandes** face à conta;
- **Sequências de perdas** com risco elevado por trade.

## Risco de ruína
Probabilidade de a conta cair abaixo de um nível que impede continuar. **Aumenta depressa** com o risco por trade: com 1% por trade, 10 perdas seguidas custam ≈ 9,6% da conta; com 10% por trade, custam ≈ 65% (módulo 17). A alavancagem torna **fácil** arriscar mais do que o plano.

## Regras práticas
1. **Dimensiona pelo stop**, não pela margem;
2. **Limita a alavancagem efetiva** a um valor que sustentes (decisão tua e do teu plano);
3. **Usa MYM** para ajustar o tamanho com precisão;
4. **Lembra-te:** a plataforma é educativa e os futuros podem causar perdas **superiores** ao esperado.`,
      example: `Conta **$10.000**, índice a **39.000**:

| Posição | Nocional | Alavancagem | Risco (stop 30 pts) |
|---|---|---|---|
| 2 MYM | $39.000 | 3,9× | $30 (0,3%) |
| 5 MYM | $97.500 | 9,75× | $75 (0,75%) |
| 1 YM | $195.000 | 19,5× | $150 (1,5%) |

O **1 YM** tem o dobro do risco de 5 MYM *só porque o valor por ponto é maior*: 30 × $5 = $150. A **alavancagem** é a mesma ideia vista pelo valor nocional; o **risco** é a perda até ao stop. Perceber as duas coisas evita surpresas.`,
      takeaways: ["Nocional = preço × valor por ponto × contratos; alavancagem = nocional ÷ saldo.", "Margem não é risco: o risco é a perda planeada até ao stop (e pode ser pior em gaps).", "Dimensiona pelo stop, limita a alavancagem efetiva e lembra-te de que futuros podem causar perdas elevadas."],
      quiz: [
        num("MYM a 39.000. Qual é o valor nocional de 5 contratos, em dólares?", 97500, 0, "$", "39.000 × $0,50 × 5 = $97.500."),
        num("Conta $10.000 e nocional $97.500. Alavancagem efetiva (×)?", 9.75, 0.01, "×", "97.500 ÷ 10.000 = 9,75."),
        num("5 MYM e uma variação de 390 pontos no índice. Variação em dólares?", 975, 0, "$", "390 × $0,50 × 5 = $975."),
        tf("Margem baixa significa risco baixo.", false, "O risco depende do stop, do tamanho e do valor por ponto; a margem é só um depósito."),
      ],
    },
    {
      slug: "treinar-com-o-simulador",
      title: "Como treinar com o Simulador sem enganar a avaliação",
      summary: "Regras de ouro para transformar a conta virtual em prática de processo.",
      minutes: 6,
      content: `O Simulador só ensina se o usares como **uma conta real que não podes recarregar**.

## Regras de treino
1. **Risco por trade fixo** (por exemplo, 1%) e **perda máxima diária** definida;
2. **Checklist** preenchida com honestidade antes de cada entrada;
3. **Razão de entrada** real — incluindo "tédio" ou "FOMO", se for o caso;
4. **Stop e alvo sempre definidos**; sem exceções;
5. **Plano diário** escrito antes de começar;
6. **Journal** preenchido no fim: motivo da saída, estado emocional, erros;
7. **Não reinicies** a conta para "limpar" um mau resultado — **arquiva-a** e começa outra, mantendo o registo.

## O que não fazer
- ✘ **Aumentar o tamanho** para "ver o que acontece";
- ✘ **Operar** sem plano só porque "é virtual";
- ✘ **Comparar** o saldo virtual com o de outros: não é um concurso;
- ✘ **Concluir** que o método funciona porque a conta virtual subiu em poucos trades.

## O que medir
- **Process Score** médio (tendência);
- **Percentagem** de trades com stop, R:R ≥ 1,5, checklist completa, razão válida;
- **R médio**, **drawdown máximo** e **pior sequência de perdas**;
- **Cumprimento** do plano e dos limites.

## Gamificação
O XP e as conquistas **premiam a regularidade e o processo**, não o saldo nem o volume de trades, com **limites diários** para impedir farming. Operar mais **não** acelera a evolução.

## Transição
Quando o processo for **estável** em dezenas de trades, o passo seguinte é a **conta demo da corretora** — e só depois, **se decidires**, tamanho mínimo com limites claros. Nunca por promessas de terceiros.`,
      example: `Plano de 4 semanas (fictício):

- **Semana 1:** 20 trades, só o setup 1, risco 0,5%; objetivo: **100% com stop** e checklist ≥ 80%;
- **Semana 2:** mesmo setup, risco 1%; objetivo: **Process Score médio ≥ 75**;
- **Semana 3:** acrescenta o setup 2; objetivo: entradas emocionais **< 10%**;
- **Semana 4:** revê estatísticas e **pergunta**: o drawdown máximo foi tolerável? Cumpri o plano?

O saldo virtual é **secundário**. Se o processo for estável, continua a treinar; se não for, **volta atrás** em vez de "avançar".`,
      exercise: { kind: "link", href: "/simulator", label: "Abrir o Simulador", prompt: "Define o teu protocolo de 20 trades: risco por trade, perda máxima diária, setup único e o que vais medir. Depois começa." },
      takeaways: ["Usa o Simulador como conta real: risco fixo, checklist honesta, stop e alvo sempre, journal no fim.", "Arquiva contas em vez de as reiniciar; não concluas nada de poucos trades.", "O XP premia processo e regularidade; operar mais não acelera a evolução."],
      quiz: [
        mc("O que fazer a uma conta de simulação que correu mal?", ["Reiniciar para apagar o histórico", "Arquivá-la e aprender com os registos", "Apagar o journal", "Aumentar o saldo"], 1, "Preservar o registo preserva a evidência para aprender."),
        tf("Operar mais trades acelera a progressão e o XP.", false, "O XP tem limites diários e premia o processo; o volume não é recompensado."),
        mc("Qual é um objetivo sensato para a primeira semana de treino?", ["Duplicar o saldo virtual", "100% dos trades com stop e checklist honesta", "Fazer o máximo de trades", "Remover o stop"], 1, "Começa pelo processo básico, não pelo resultado."),
        tf("Uma subida do saldo virtual em 5 trades prova que o método funciona.", false, "Cinco trades são uma amostra minúscula."),
      ],
    },
  ],
  quiz: {
    title: "Quiz do módulo — Trading Simulator",
    passScore: 70,
    questions: [
      tf("O Simulador usa dinheiro real e dados reais de mercado.", false, "É uma conta virtual com dados DEMO sintéticos."),
      num("Saldo $10.000 e P&L aberto −$16,50. Qual é a equity, em dólares?", 9983.5, 0.01, "$", "10.000 − 16,50 = $9.983,50."),
      num("Equity $9.983,50 e margem usada $2.700. Margem livre, em dólares?", 7283.5, 0.01, "$", "9.983,50 − 2.700 = $7.283,50."),
      mc("O que é a margem usada?", ["A perda máxima planeada", "Fundos reservados para manter as posições abertas", "O lucro do dia", "A comissão total"], 1, "É um depósito; não é o risco."),
      num("Pico de equity $10.150 e equity atual $10.020. Drawdown em dólares?", 130, 0, "$", "10.150 − 10.020 = $130."),
      num("MYM: spread 1 ponto e comissão de $0,50 por lado. Custo de ida e volta por contrato, em dólares?", 1.5, 0.001, "$", "0,50 + 2 × 0,50 = $1,50."),
      mc("O que acontece num gap através do stop?", ["Executa exatamente no stop", "Executa no preço de abertura, pior do que o stop", "Não executa", "É ajustado"], 1, "O primeiro preço negociado é a abertura."),
      num("5 MYM a 39.000. Valor nocional em dólares?", 97500, 0, "$", "39.000 × $0,50 × 5 = $97.500."),
      tf("Margem baixa significa risco baixo.", false, "O risco vem do stop, do tamanho e do valor por ponto."),
      mc("Como tratar uma conta de simulação com mau resultado?", ["Reiniciar para apagar", "Arquivar e aprender com os registos", "Ignorar", "Aumentar o saldo"], 1, "Os registos são a evidência para melhorar."),
    ],
  },
};
