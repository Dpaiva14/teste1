import { mc, num, sizing, tf } from "../dsl";
import type { ModuleDef } from "../types";

/**
 * Module 02 — Futures Fundamentals (Level 1).
 * Contract specs confirmed from official CME excerpts on 2026-10-06 (see Learning Sources); margins, hours and fees are
 * ILLUSTRATIVE or conventions that must be re-checked with CME and the broker.
 */
export const futuresFundamentals: ModuleDef = {
  slug: "futures-fundamentals",
  number: 2,
  level: 1,
  title: "Futures Fundamentals",
  summary: "Contratos, tick e valor do tick, vencimento e rollover, margem, horários Globex/RTH, liquidez, slippage e comissões — tudo sobre YM e MYM.",
  difficulty: "BEGINNER",
  icon: "Layers",
  lessons: [
    {
      slug: "contratos-e-especificacoes",
      title: "Contratos e especificações: YM, MYM e US30 CFD",
      summary: "Subjacente, multiplicador, tick e valor do tick — e a tabela que compara os três instrumentos.",
      minutes: 7,
      content: `Todo o contrato de futuros é definido por uma **ficha de especificações** publicada pela bolsa. Para operar com segurança tens de saber ler cinco campos:

- **Subjacente** — o que o contrato acompanha (aqui, o Dow Jones Industrial Average);
- **Multiplicador** (*contract multiplier*) — quantos dólares vale cada ponto do índice por contrato;
- **Tick size** — a menor variação de preço permitida;
- **Valor do tick** (*tick value*) — quanto vale, em dólares, essa variação mínima;
- **Meses de vencimento** — de quando a quando o contrato existe.

## A tabela que importa

| Instrumento | Produto | Tick | Valor do tick | Contrato |
| --- | --- | --- | --- | --- |
| **YM** | E-mini Dow Futures | 1 ponto do índice | $5,00 | $5 × índice |
| **MYM** | Micro E-mini Dow Futures | 1 ponto do índice | $0,50 | $0,50 × índice |
| **US30 (CFD)** | CFD sobre o Dow | depende do broker | depende do broker | depende do broker |

**Fonte e data:** CME Group, fichas de especificações do E-mini Dow e do Micro E-mini Dow — confirmadas por excerto oficial em **2026-10-06**. Os valores do CFD **não** são definidos pelo CME: variam de broker para broker. Consulta **Learning Sources** e reverifica no site do CME antes de operar.

## Nocional: o que o contrato "controla"
**Nocional = preço do índice × multiplicador.** É o valor de exposição, não o dinheiro que pagas. Quanto maior o nocional face à tua conta, maior a alavancagem — e mais depressa o resultado muda de sinal.

> Nunca assumas o valor por ponto de um CFD. Confirma a especificação do contrato **no teu broker** antes de calcular risco.`,
      example: `Com o Dow a **39.000** pontos (valor ilustrativo):

- **YM:** nocional = 39.000 × $5 = **$195.000**; cada ponto = $5;
- **MYM:** nocional = 39.000 × $0,50 = **$19.500**; cada ponto = $0,50.

Um movimento de **40 pontos** vale **$200** por YM ou **$20** por MYM. O MYM é exatamente 1/10 do YM — mesmas pontuações do mercado, risco em dólares dez vezes menor.`,
      exercise: { kind: "calculator", tool: "tick-value", prompt: "Escolhe YM e depois MYM, 1 contrato e 40 pontos. Compara o valor do movimento." },
      takeaways: ["Cada contrato tem multiplicador, tick e valor do tick definidos pela bolsa.", "YM: $5 por ponto; MYM: $0,50 por ponto; tick de 1 ponto em ambos.", "O valor por ponto de um CFD US30 depende do broker — confirma sempre."],
      quiz: [
        mc("Qual é o valor de 1 ponto do índice num contrato MYM?", ["$0,05", "$0,50", "$5", "$50"], 1, "O MYM vale $0,50 × índice: cada ponto do Dow = $0,50 por contrato."),
        num("Com o Dow a 39.000, qual é o valor nocional de 1 YM (em dólares)?", 195000, 0, "$", "Nocional = 39.000 × $5 = $195.000."),
        tf("O valor por ponto de um CFD US30 é o mesmo em todos os brokers.", false, "O CFD não é definido pelo CME: tamanho do contrato e valor por ponto dependem do broker."),
        mc("Que informação deve acompanhar um valor de especificação que pode mudar?", ["Nenhuma, é sempre igual", "A fonte e a data em que foi verificado", "Só o nome do broker", "Apenas o símbolo"], 1, "Valores que mudam devem indicar fonte e data de verificação — é o que a página Learning Sources faz."),
      ],
    },
    {
      slug: "vencimento-e-rollover",
      title: "Vencimento, rollover e contratos contínuos",
      summary: "Porque é que os contratos expiram, o que é o front month e como ler gráficos contínuos sem cair em armadilhas.",
      minutes: 7,
      content: `Ao contrário de uma ação, um contrato de futuros **tem data de morte**. Os futuros do Dow têm **vencimentos trimestrais — março, junho, setembro e dezembro** (CME Group, confirmado por excerto oficial em 2026-10-06). Há sempre vários contratos listados ao mesmo tempo.

## Front month
O **front month** é o contrato mais próximo do vencimento que ainda negoceia; costuma ser o que concentra mais **volume e liquidez** durante a maior parte do ciclo.

## Rollover
Quem quer manter exposição depois do vencimento tem de **fechar o contrato que expira e abrir o seguinte** — é o **rollover**. O volume migra gradualmente do contrato antigo para o novo; convém negociar o contrato com mais liquidez. Em termos gerais, os contratos de datas diferentes não cotam ao mesmo preço (a diferença chama-se **spread de calendário** e reflete, entre outros fatores, juros e dividendos).

## Contratos contínuos
As plataformas de gráficos costumam juntar vários contratos numa única série — um **contrato contínuo**. Há várias formas de o construir, e **a junção pode criar um "gap" que nunca foi negociável**: na altura da troca, a série salta do preço do contrato antigo para o do novo.

## O que fazer com isto
- Confirma **qual contrato** estás a negociar e a data de vencimento;
- Sabe como o teu gráfico constrói a série contínua (ajustada ou não);
- **Não** trates um salto de rollover como um sinal de mercado;
- Confirma com o teu broker as datas e regras de rollover — algumas corretoras fecham ou rolam posições automaticamente perto do fim.`,
      example: `Suponhamos que o contrato de **março** fecha em **39.000** e o de **junho**, no mesmo momento, cota a **39.120**. Num gráfico contínuo não ajustado, aparece um salto de **+120 pontos** na troca de contrato.

Se tivesses um stop a 40 pontos de distância, esse "gap" **não** seria uma perda real — mas um padrão de preço detetado nesse ponto estaria a ler uma diferença entre contratos, não um movimento de compradores e vendedores. Por isso é que se estuda o **contexto** antes do padrão.`,
      visual: { kind: "diagram", id: "process-loop", caption: "Confirma o contrato, o vencimento e o contexto antes de interpretares qualquer salto de preço." },
      takeaways: ["Os futuros do Dow vencem em março, junho, setembro e dezembro.", "Rollover = passar da posição no contrato que expira para o seguinte; o volume migra gradualmente.", "Um salto de rollover num gráfico contínuo não é um movimento real de mercado."],
      quiz: [
        mc("Quais são os meses de vencimento dos futuros do Dow (YM/MYM)?", ["Todos os meses", "Março, junho, setembro e dezembro", "Janeiro e julho", "Apenas dezembro"], 1, "Os futuros sobre índices têm ciclo trimestral: março, junho, setembro e dezembro."),
        mc("O que é o front month?", ["O contrato mais distante", "O contrato mais próximo do vencimento ainda em negociação", "O mês de maior volatilidade", "O contrato do mês passado"], 1, "É o contrato mais próximo de expirar que ainda negoceia, normalmente o mais líquido durante a maior parte do ciclo."),
        tf("Um salto no gráfico na data de rollover é sempre um sinal fiável de força do mercado.", false, "Pode ser apenas a diferença entre dois contratos de datas diferentes ligada pelo gráfico contínuo."),
        mc("Qual é uma boa prática antes de operar perto do vencimento?", ["Ignorar a data", "Confirmar o contrato, a data de vencimento e as regras de rollover do broker", "Esperar que o broker feche tudo sem perguntar", "Aumentar o tamanho"], 1, "Conhece o contrato e as regras do teu broker para evitar posições forçadas ou liquidez insuficiente."),
      ],
    },
    {
      slug: "margem-e-alavancagem",
      title: "Margem inicial, de manutenção e alavancagem",
      summary: "O depósito de garantia, o que acontece quando a conta cai e como medir a alavancagem real.",
      minutes: 8,
      content: `Nos futuros, **margem não é o preço do contrato** — é um **depósito de garantia** (*performance bond*) que cobre perdas potenciais.

## Dois níveis
- **Margem inicial** — o que tens de ter disponível para abrir a posição;
- **Margem de manutenção** — o mínimo que a conta tem de manter com a posição aberta. Se o capital cair abaixo, recebes uma **chamada de margem** (*margin call*) ou o broker **reduz/fecha** posições.

## Mark-to-market diário
Ganhos e perdas são **liquidados na conta todos os dias**. Uma posição que vai contra ti reduz o saldo disponível em tempo real, mesmo que ainda não a tenhas fechado.

## Os valores mudam
As margens são definidas pela bolsa e pelo **broker**, e **mudam com a volatilidade**. Esta plataforma **não** fixa valores oficiais: o simulador usa margens **ilustrativas** (YM $9.000, MYM $900) só para treinares a gestão. Consulta a margem atual do CME e do teu broker (Learning Sources).

## Alavancagem efetiva
Mede-se pelo **nocional ÷ capital da conta**. É essa — e não a margem — a que determina quão depressa a conta oscila.

> Nos futuros, a alavancagem pode ampliar significativamente ganhos e perdas, incluindo perdas superiores à margem inicial.`,
      example: `Conta de **$10.000**, Dow a 39.000:

- **1 MYM:** nocional $19.500 → alavancagem **1,95×**. Um movimento de 100 pontos = $50 = **0,5%** da conta.
- **1 YM:** nocional $195.000 → alavancagem **19,5×**. Os mesmos 100 pontos = $500 = **5%** da conta.

Com margem ilustrativa de $9.000 para o YM, só te sobram $1.000 de margem livre: um movimento adverso de 200 pontos ($1.000) esgotaria o saldo livre. Com o MYM a margem ilustrativa seria $900 e a flexibilidade é muito maior.`,
      exercise: { kind: "calculator", tool: "leverage", prompt: "Calcula a alavancagem efetiva de 1 YM e de 1 MYM numa conta de $10.000." },
      takeaways: ["Margem é depósito de garantia, não o preço do contrato.", "Abaixo da margem de manutenção há chamada de margem ou redução forçada.", "O que mede o risco real é o nocional face ao capital — a alavancagem efetiva."],
      quiz: [
        mc("O que é a margem de manutenção?", ["O custo mensal do contrato", "O mínimo de capital que a conta tem de manter com a posição aberta", "A comissão do broker", "O lucro mínimo"], 1, "Se o capital da conta cair abaixo dela há chamada de margem ou redução de posições."),
        num("Conta de $10.000, 1 YM com o Dow a 39.000. Qual é a alavancagem efetiva (nocional ÷ capital)?", 19.5, 0.05, "×", "Nocional $195.000 ÷ $10.000 = 19,5×."),
        num("Conta de $5.000, 2 MYM com o Dow a 39.000. Qual é o nocional total, em dólares?", 39000, 0, "$", "2 × 39.000 × $0,50 = $39.000."),
        tf("As margens de futuros são fixas e nunca mudam.", false, "Mudam com a volatilidade e com a política do broker; confirma sempre os valores atuais."),
      ],
    },
    {
      slug: "horarios-globex-e-rth",
      title: "Horários: Globex, RTH, pré e pós-mercado",
      summary: "Quando é que o futuro do Dow negoceia, e porque é que a hora do dia muda tudo.",
      minutes: 6,
      content: `Os futuros do Dow negoceiam **quase 24 horas por dia, 5 dias por semana**, na plataforma eletrónica **Globex** do CME. Há uma pequena pausa diária e um fecho de fim de semana.

## Convenção usada nesta plataforma
- **Globex:** de domingo ao fim da tarde até sexta ao fim da tarde (hora de Nova Iorque), com uma pausa diária de cerca de 1 hora;
- **RTH (*Regular Trading Hours*):** o horário da sessão regular das ações norte-americanas — **9:30 às 16:00, hora de Nova Iorque**;
- **Pré-mercado / sessão noturna:** negociação fora do RTH, tipicamente com menos volume;
- **Pós-mercado:** depois do fecho das 16:00.

> Os horários exatos, as pausas e os feriados são definidos pelo CME e **mudam**. A convenção acima é aproximada — confirma em cmegroup.com/trading-hours (Learning Sources). A hora de Nova Iorque também muda com o horário de verão.

## Porque importa
- A **liquidez e a volatilidade variam** ao longo do dia: o RTH e a abertura têm normalmente mais volume;
- Fora do RTH, os **spreads** podem ser maiores e os movimentos mais bruscos com pouco volume;
- Notícias económicas saem em horas fixas — tens de saber converter essas horas para o **teu fuso horário**. A plataforma tem um relógio de sessões que faz essa conversão.`,
      example: `Se vives em **Lisboa** e a sessão regular norte-americana abre às 9:30 em Nova Iorque, na maior parte do ano abre às **14:30 em Lisboa** (a diferença é de 5 horas, mas pode variar nas semanas em que os EUA e a Europa mudam o relógio em datas diferentes).

Por isso, em vez de decorar horas, usa o **relógio de sessões** da plataforma: ele mostra a hora local atualizada.`,
      visual: { kind: "diagram", id: "session-timeline", caption: "As sessões de mercado ao longo de 24 horas (convenção ilustrativa)." },
      exercise: { kind: "link", href: "/tools/sessions", label: "Abrir o relógio de sessões", prompt: "Abre o relógio e confirma em que sessão estás agora no teu fuso horário." },
      takeaways: ["Globex negoceia quase 24h, 5 dias por semana, com pausa diária.", "RTH = sessão regular das ações dos EUA (9:30–16:00 em Nova Iorque); fora dela há menos liquidez.", "Converte sempre as horas para o teu fuso e confirma-as no CME."],
      quiz: [
        mc("O que significa RTH?", ["Real Trade Hedge", "Regular Trading Hours", "Rapid Trend High", "Risk Transfer Hub"], 1, "Regular Trading Hours: o horário da sessão regular das ações dos EUA."),
        tf("Os futuros do Dow só negoceiam durante o horário da bolsa de Nova Iorque.", false, "Negoceiam quase 24 horas por dia na Globex, com uma pausa diária."),
        mc("Porque é que os spreads costumam ser maiores fora do RTH?", ["Porque o broker quer", "Porque há menos participantes e menos liquidez", "Porque o preço está sempre errado", "Porque as regras mudam"], 1, "Com menos volume, a diferença entre bid e ask tende a aumentar."),
      ],
    },
    {
      slug: "liquidez-slippage-e-comissoes",
      title: "Liquidez, slippage e comissões: o custo real de operar",
      summary: "Como somar spread, slippage e comissões e perceber que peso têm face ao teu risco.",
      minutes: 7,
      content: `Quem ignora os custos descobre-os nas estatísticas. Há três camadas principais:

## 1. Spread
A diferença entre **ask** e **bid** — pagas-a em cada ida e volta. Nos futuros do Dow costuma ser pequena em horário líquido, mas cresce fora de horas e em notícias.

## 2. Slippage
A diferença entre o preço que esperavas e o preço que obtiveste. É maior com **ordens a mercado**, ordens **stop** (que se convertem em ordens a mercado) e em **momentos de pouca liquidez ou muita volatilidade**.

## 3. Comissões e taxas
Variam por broker: comissão do broker, taxas da bolsa/câmara de compensação e da NFA. **Confirma a tabela do teu broker** — os valores abaixo são ilustrativos.

## O custo como fração do risco
O que interessa não é o dólar isolado, mas **quanto do teu risco por trade é consumido pelos custos**. Com stops curtos, os custos pesam proporcionalmente mais — e podem transformar uma estratégia lucrativa em teoria numa perdedora na prática.

> Backtests sem custos e sem slippage costumam ser demasiado otimistas.`,
      example: `**4 MYM**, stop de 40 pontos (risco de mercado = 40 × $0,50 × 4 = **$80**). Custos ilustrativos por ida e volta:

- Spread: 1 ponto × $0,50 × 4 = **$2**
- Comissões: $0,50 por lado × 2 lados × 4 = **$4**
- Slippage na saída (1 ponto): 1 × $0,50 × 4 = **$2**

Total de custos: **$8 = 10% do risco de $80**. Se o mesmo trade tivesse um stop de 20 pontos (risco $40), os mesmos $8 pesariam **20%**. Stops muito curtos tornam os custos num adversário constante.`,
      exercise: { kind: "calculator", tool: "costs", prompt: "Insere 4 MYM, spread 1 ponto, comissão de $1 por contrato (ida e volta) e 1 ponto de slippage. Quanto custa a operação?" },
      takeaways: ["Os custos reais são spread + slippage + comissões e taxas.", "Ordens a mercado e stops são as mais expostas a slippage.", "Avalia os custos como percentagem do risco do trade — stops curtos agravam o peso."],
      quiz: [
        mc("Que ordem é tipicamente mais exposta a slippage?", ["Limite", "Stop (que se converte em ordem a mercado)", "Nenhuma", "Todas igual"], 1, "Quando o stop é tocado, vira ordem a mercado e executa ao melhor preço disponível, que pode ser pior."),
        num("Custos totais de $12 num trade com risco de mercado de $60. Que percentagem do risco consomem?", 20, 0.1, "%", "Custos ÷ risco = 12 ÷ 60 = 20%: um em cada cinco dólares arriscados é consumido por custos antes de o mercado se mexer."),
        tf("Um backtest sem custos é uma boa estimativa do que acontece em tempo real.", false, "Sem spread, slippage e comissões, os resultados tendem a ser otimistas."),
        mc("Com o mesmo valor de custos, em que caso o impacto relativo é maior?", ["Num stop largo", "Num stop curto", "Em nenhum", "Só em ações"], 1, "Custos fixos pesam mais quando o risco por trade é pequeno."),
      ],
    },
    {
      slug: "ym-vs-mym-na-pratica",
      title: "YM vs MYM na prática: escolher o tamanho certo",
      summary: "Como a diferença de 10× entre os contratos muda o que cabe no teu orçamento de risco.",
      minutes: 6,
      content: `A mesma análise pode ser executada com contratos de tamanhos muito diferentes. O que decide **qual** usar não é a convicção — é o **orçamento de risco** e a **distância ao stop**.

## Passo a passo
1. Define o **risco por trade** (por exemplo 1% da conta);
2. Define o **stop** num ponto técnico — não num valor que "dê jeito";
3. Calcula o **risco por contrato** = pontos até ao stop × valor por ponto;
4. **Contratos = orçamento de risco ÷ risco por contrato**, arredondado **para baixo**.

Se der **0**, a ideia não cabe nesse contrato com esse stop. Não aumentes o risco para "caber" — escolhe um contrato mais pequeno (o MYM), um stop tecnicamente válido mais curto ou simplesmente passa.

## Vantagens do micro
- Permite **afinar o tamanho** com muito mais precisão;
- Reduz o risco por contrato em 90% face ao YM;
- É útil para aprender com dinheiro real em pequeno — mas **os custos por contrato pesam mais** em percentagem.

## Atenção
Mais contratos **não** significam mais convicção. Escalar tamanho depois de uma série de ganhos, ou para "recuperar", é um padrão clássico de **overtrading**.`,
      example: `Conta **$10.000**, risco **1% = $100**, stop a **40 pontos**:

- **YM:** 40 × $5 = **$200** por contrato → $100 ÷ $200 = 0,5 → **0 contratos** (não cabe).
- **MYM:** 40 × $0,50 = **$20** por contrato → $100 ÷ $20 = **5 contratos** (risco total $100).

Com stop de **100 pontos**: YM = $500/contrato → 0; MYM = $50/contrato → **2 contratos**. A distância ao stop manda no tamanho.`,
      exercise: { kind: "calculator", tool: "position-size", prompt: "Conta $10.000, risco 1%, entrada 39.000, stop 38.960. Quantos MYM? E quantos YM?" },
      takeaways: ["Contratos = orçamento de risco ÷ risco por contrato, arredondado para baixo.", "Se der zero contratos, reduz o contrato ou passa — não aumentes o risco.", "O MYM tem 1/10 do valor por ponto do YM e permite afinar melhor o tamanho."],
      quiz: [
        sizing("Conta $10.000, risco 1% ($100), MYM, stop a 40 pontos. Quantos contratos?", 5, "contratos", "Risco por MYM = 40 × $0,50 = $20 → $100 ÷ $20 = 5."),
        sizing("Conta $25.000, risco 1% ($250), YM, stop a 25 pontos. Quantos contratos?", 2, "contratos", "Risco por YM = 25 × $5 = $125 → $250 ÷ $125 = 2."),
        mc("O cálculo dá 0,6 contratos. O que fazes?", ["Arredondas para 1 para não perder a oportunidade", "Arredondas para baixo (0) e escolhes outro contrato, um stop tecnicamente válido mais curto, ou passas", "Aumentas o risco por trade", "Ignoras o stop"], 1, "Arredondar para cima aumenta o risco acima do planeado; a regra é arredondar para baixo."),
        tf("Mais contratos significam sempre mais convicção na análise.", false, "O tamanho vem do risco definido, não da convicção; escalar sem regra é fonte de overtrading."),
      ],
    },
    {
      slug: "posicoes-overnight",
      title: "Manter posições overnight: gaps, notícias e liquidez",
      summary: "Porque é que o stop pode não proteger como esperas quando o mercado salta.",
      minutes: 6,
      content: `Manter uma posição **fora do horário em que a podes vigiar** acrescenta riscos que o stop não elimina.

## Gaps
Se o mercado fecha (ou fica pouco líquido) e reabre noutro nível, o preço **salta** sem negociar os valores intermédios. Um stop dentro do salto não é executado ao preço do stop: executa-se ao **primeiro preço disponível**, que pode ser muito pior (**slippage de gap**).

## Notícias e eventos
Resultados de empresas, decisões de bancos centrais ou acontecimentos geopolíticos acontecem a qualquer hora. A sessão noturna reage com **menos liquidez**.

## Liquidez reduzida
Menos participantes → spreads maiores e movimentos mais bruscos com pouco volume.

## Margem
Muitos brokers exigem **margem diferente** para posições mantidas durante a noite (confirma a política do teu). Uma conta pequena pode ficar subitamente sobrealavancada.

## Como lidar
- Decide **antes** se vais manter overnight e com que tamanho;
- Considera **reduzir** ou fechar antes de eventos relevantes;
- Compreende que o **risco real** pode ser superior ao risco planeado no stop;
- Regista em journal as decisões overnight para perceberes o impacto ao longo do tempo.`,
      example: `Posição de **2 MYM** comprada a 39.000 com stop a **38.950** (risco planeado: 50 × $0,50 × 2 = **$50**). Durante a noite, uma notícia leva o mercado a **abrir a 38.900**, abaixo do stop.

O stop executa ao primeiro preço disponível: perda = 100 pontos × $0,50 × 2 = **$100** — o **dobro** do risco planeado. O stop limitou o prejuízo, mas **não ao valor que esperavas**.`,
      takeaways: ["O stop não garante execução ao preço definido: gaps podem executá-lo bem pior.", "Fora do RTH há menos liquidez e mais risco de movimentos bruscos.", "Decide antes se manténs overnight, com que tamanho, e confirma a margem exigida pelo broker."],
      quiz: [
        mc("O que acontece a um stop quando o mercado abre com um gap para além dele?", ["Executa sempre ao preço do stop", "Executa ao primeiro preço disponível, possivelmente pior", "Não executa nunca", "É cancelado automaticamente"], 1, "O stop converte-se em ordem a mercado e executa ao preço disponível, que pode estar longe do nível definido."),
        num("2 MYM, stop planeado a 50 pontos. Um gap executa o stop 100 pontos abaixo da entrada. Qual é a perda real, em dólares?", 100, 0, "$", "100 pontos × $0,50 × 2 = $100."),
        tf("O risco máximo de uma posição é sempre igual à distância ao stop.", false, "Gaps, slippage e liquidez reduzida podem tornar a perda real superior à planeada."),
      ],
    },
  ],
  quiz: {
    title: "Quiz do módulo — Futures Fundamentals",
    passScore: 70,
    questions: [
      mc("Qual destas afirmações sobre o YM e o MYM é correta?", ["O MYM vale $5 por ponto", "O YM vale $5 por ponto e o MYM $0,50 por ponto", "Ambos valem $1 por ponto", "O MYM vale o dobro do YM"], 1, "YM = $5 × índice; MYM = $0,50 × índice (1/10 do YM). Fonte: CME Group, confirmado por excerto em 2026-10-06."),
      mc("Em que meses vencem os futuros do Dow?", ["Fevereiro, maio, agosto, novembro", "Março, junho, setembro, dezembro", "Todos os meses", "Janeiro e julho"], 1, "Ciclo trimestral: março, junho, setembro e dezembro."),
      num("O Dow está a 39.000. Qual é o nocional de 3 MYM, em dólares?", 58500, 0, "$", "3 × 39.000 × $0,50 = $58.500."),
      num("Conta $10.000 com 1 YM a 39.000. Qual é a alavancagem efetiva?", 19.5, 0.05, "×", "$195.000 ÷ $10.000 = 19,5×."),
      sizing("Conta $20.000, risco 0,5% ($100), MYM, stop a 25 pontos. Quantos contratos?", 8, "contratos", "Risco por MYM = 25 × $0,50 = $12,50 → $100 ÷ $12,50 = 8."),
      sizing("Conta $10.000, risco 1% ($100), YM, stop a 30 pontos. Quantos contratos?", 0, "contratos", "Risco por YM = 30 × $5 = $150, acima de $100 → 0 contratos. O orçamento não cobre 1 YM com este stop."),
      tf("Uma margem inicial baixa significa que o risco é baixo.", false, "A margem é só uma garantia; o risco depende do nocional e da distância ao stop. As perdas podem exceder a margem."),
      mc("Qual é a melhor leitura de um salto de preço na data de rollover num gráfico contínuo?", ["Um sinal certo de compra", "Possivelmente a diferença entre dois contratos, não um movimento real", "Um erro do mercado", "Sempre um gap de abertura"], 1, "A junção de contratos pode criar um salto que nunca foi negociável."),
      mc("Que ordem tem maior risco de slippage em picos de volatilidade?", ["Limite", "Stop (converte-se em ordem a mercado)", "Nenhuma", "Todas igual"], 1, "Um stop executa a mercado quando tocado e pode obter pior preço."),
      num("Custos de $9 num trade com risco de mercado de $45. Que % do risco consomem?", 20, 0.1, "%", "Custos ÷ risco = 9 ÷ 45 = 20%: com stops curtos, o mesmo custo fixo pesa muito mais no risco do trade."),
    ],
  },
};
