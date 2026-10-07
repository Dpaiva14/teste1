import { mc, num, tf } from "../dsl";
import type { ModuleDef } from "../types";

/**
 * Module 13 — US30 / Dow Specific (Level 5).
 * Anything about "typical" Dow behaviour is hedged and framed as something to MEASURE; facts that depend on the
 * broker (CFD) are never given as universal numbers.
 */
export const us30Dow: ModuleDef = {
  slug: "us30-dow",
  number: 13,
  level: 5,
  title: "US30 / Dow Specific",
  summary: "Características do Dow, relação com as ações dos EUA, comportamento na sessão de NY, opening range, PDH/PDL e níveis semanais, gaps, momentum, reversões, trend days e range days — e as diferenças entre o CFD US30 e os futuros YM/MYM.",
  difficulty: "INTERMEDIATE",
  icon: "Landmark",
  lessons: [
    {
      slug: "caracteristicas-do-dow",
      title: "Características do Dow e do US30",
      summary: "Um índice ponderado por preço de grandes empresas dos EUA — e o que isso implica no comportamento do preço.",
      minutes: 6,
      content: `O **Dow Jones Industrial Average (DJIA)** é um índice de **30 grandes empresas dos EUA**. Duas características definem o seu comportamento:

## 1. Ponderação por preço
Ao contrário de índices ponderados por capitalização (como o S&P 500), o Dow é **ponderado por preço**: uma ação com **preço por ação mais alto** tem **mais influência** nos pontos do índice, independentemente do tamanho da empresa. Uma variação de 1 dólar numa ação influencia o índice **do mesmo modo** em qualquer componente (dividida por um divisor).

Consequência: **algumas ações movem o índice mais** do que o seu peso económico sugere.

## 2. Poucas empresas, muito grandes
Com apenas 30 componentes, o Dow é **mais concentrado** do que índices com centenas de ações. Resultados de uma empresa grande podem **mexer visivelmente** com o índice no dia.

> A composição e o divisor mudam ao longo do tempo. Confirma a metodologia na fonte (S&P Dow Jones Indices — ver Learning Sources; verificação **por fazer** nesta plataforma).

## Comparação qualitativa
| | Dow | S&P 500 | Nasdaq-100 |
| --- | --- | --- | --- |
| Nº de empresas | 30 | ~500 | ~100 |
| Ponderação | **preço** | capitalização | capitalização (modificada) |
| Perfil | Industriais, financeiras, consumo… | Amplo | Tecnologia dominante |

(Comparação geral e aproximada; a composição varia.)

## O que NÃO assumir
- Que o Dow é "mais seguro" ou "menos volátil" do que outros — mede a volatilidade (ATR) no teu timeframe;
- Que o Dow se comporta como o Nasdaq: tendem a correlacionar-se, mas não são iguais.

## O US30
É o nome comum, em muitos brokers, do **CFD** sobre o Dow. Não é o mesmo produto que os futuros **YM/MYM** (ver lição própria).`,
      example: `Num dia, uma ação de **preço muito alto** no Dow sobe **2%**, enquanto as restantes ficam quase paradas: o índice pode subir visivelmente, porque essa ação pesa mais nos pontos. Num índice ponderado por capitalização, o efeito seria diferente.

Conclusão prática: **olhar só para o índice pode esconder** que o movimento vem de uma ou duas ações. Isto não é um sinal — é contexto sobre **a qualidade do movimento**.`,
      takeaways: ["O Dow tem 30 empresas e é ponderado por preço: ações com preço mais alto têm mais influência.", "É mais concentrado do que índices maiores; resultados de uma grande empresa podem mexer com o índice.", "US30 é, tipicamente, o CFD sobre o Dow — não é o mesmo produto que os futuros YM/MYM."],
      quiz: [
        mc("Como é ponderado o Dow?", ["Por capitalização de mercado", "Por preço das ações", "Por volume", "Igualmente"], 1, "No Dow, ações com preço mais alto têm mais influência."),
        tf("O Dow é necessariamente menos volátil do que o Nasdaq.", false, "Mede a volatilidade (ATR) em vez de assumir."),
        mc("O que é tipicamente o US30 nas plataformas de CFD?", ["O contrato YM", "Um CFD sobre o Dow", "Uma ação", "Um ETF"], 1, "É o nome comum do CFD sobre o Dow; o símbolo e as especificações variam por broker."),
        mc("Uma consequência da concentração do Dow (30 empresas) é…", ["Nunca haver surpresas", "Resultados de uma empresa grande poderem mexer visivelmente com o índice", "Spreads fixos", "Margem menor"], 1, "Poucos componentes aumentam a sensibilidade a cada um."),
      ],
    },
    {
      slug: "dow-e-as-acoes-dos-eua",
      title: "O Dow e o resto do mercado dos EUA",
      summary: "Correlações típicas, o que as quebra e porque convém olhar para mais do que um índice.",
      minutes: 6,
      content: `O Dow faz parte de um ecossistema: as **ações dos EUA**, os **juros**, o **dólar**, as **matérias-primas**. Costuma haver **correlação** com outros índices dos EUA (S&P 500, Nasdaq), mas ela **não é fixa**.

## O que costuma acontecer (e que convém medir)
- Em dias de **forte movimento macro** (dados, Fed), os índices dos EUA tendem a mover-se **na mesma direção**;
- Há dias de **divergência**: o Nasdaq sobe enquanto o Dow desce (ou vice-versa) por causa de **rotação setorial** (tecnologia vs industriais/financeiras);
- A **intensidade** do movimento do Dow pode diferir da do S&P.

## Como usar a informação
- **Contexto:** ver o S&P 500 e o Nasdaq ajuda a perceber se o movimento do Dow é **amplo** (vários índices a confirmar) ou **isolado**;
- **Confirmação** ou **divergência** são observações, não sinais. Uma divergência pode resolver-se em qualquer direção;
- **Juros e dólar** podem explicar parte do comportamento; mas relacionar causas é **interpretação**.

## Cuidados
- Mais gráficos nem sempre = mais clareza (ver multi-timeframe);
- Correlações **mudam** ao longo do tempo e entre regimes de mercado;
- Evita "narrativas" que expliquem tudo depois do movimento.

## Boa prática
Escolhe **um ou dois** índices de comparação e **regista** no journal: "Dow subiu, S&P confirmou/não confirmou" — e verifica, com dados teus, se a informação ajuda.`,
      example: `Dia com dados económicos a favor: Dow +150 pontos, S&P +0,8%, Nasdaq +1,1% — movimento **amplo**. Noutro dia: Dow −90, S&P +0,1% e Nasdaq +0,6% — **divergência** (rotação para tecnologia). A leitura não prevê o fecho: indica que o movimento do Dow **não** é o do "mercado inteiro", e que o contexto tem de ser avaliado.`,
      takeaways: ["O Dow costuma correlacionar-se com outros índices dos EUA, mas a correlação muda.", "Ver S&P e Nasdaq dá contexto (movimento amplo ou isolado), não sinais.", "Regista confirmações/divergências no journal e testa se ajudam."],
      quiz: [
        mc("O que pode causar divergência entre o Dow e o Nasdaq?", ["Erro de dados", "Rotação setorial entre tecnologia e outros setores", "O broker", "O spread"], 1, "Setores diferentes dominam cada índice."),
        tf("A correlação entre o Dow e o S&P 500 é constante ao longo do tempo.", false, "Muda com os regimes de mercado."),
        mc("Qual é uma boa prática com índices de comparação?", ["Usar dez", "Escolher um ou dois e registar confirmações/divergências para testar a utilidade", "Ignorar", "Usar só o mais volátil"], 1, "Poucos índices, registo e teste."),
      ],
    },
    {
      slug: "abertura-gaps-e-opening-range-no-dow",
      title: "Gaps e abertura no Dow",
      summary: "O que é um gap em futuros e CFDs, e porque 'o gap fecha sempre' não é uma regra.",
      minutes: 7,
      content: `Um **gap** é um salto de preço entre o fecho de um período e a abertura do seguinte, sem negociação nos níveis intermédios.

## Em que contexto surgem
- **Fim de semana** (fecho de sexta → reabertura de domingo);
- **Pausa diária** (17:00–18:00 ET na convenção usada — confirma no CME);
- **Entre sessões** quando há notícias ou dados fora do horário;
- **Diferença** entre o fecho do cash (16:00 ET) e a abertura do cash no dia seguinte (09:30 ET).

## Tipos observáveis (descritivos)
- **Gap para cima/baixo** face ao fecho anterior;
- **Gap pequeno** (dentro do ATR diário) vs **gap grande**;
- **Gap com continuação** vs **gap preenchido** (o preço regressa ao fecho anterior).

## "O gap tem de fechar": ideia a questionar
Muitos gaps **fecham** em horas ou dias; outros **demoram semanas** ou nunca fecham. Não existe uma percentagem universal. Mede nos teus dados e no teu horizonte.

## Como pensar num gap
1. **Contexto:** estrutura do timeframe superior e tamanho do gap face ao ATR;
2. **Causa observável:** notícias, dados, abertura de outras bolsas;
3. **Cenários:** continuação, preenchimento parcial/total, lateralização;
4. **Risco:** o stop precisa de tomar em conta a volatilidade da abertura (e um possível slippage).

## Gaps e stops
Um **stop** dentro do gap pode ser executado **bem longe** do preço definido. Ao planear manter posições durante a pausa ou o fim de semana, **aceita esse risco** ou **reduz o tamanho** antes.`,
      example: `O Dow fechou na sexta a **39.100** e reabre no domingo a **39.230** (**gap de +130 pontos**; ATR diário ≈ 350). O gap é **moderado** face ao ATR. Cenário de preenchimento (regresso a 39.100) e cenário de continuação são ambos plausíveis. Um stop de 40 pontos abaixo da abertura **pode** ser ultrapassado só pela volatilidade da reabertura — o tamanho da posição deve refletir um stop realista.`,
      takeaways: ["Um gap é um salto de preço sem negociação nos níveis intermédios.", "Não há percentagem universal de gaps que fecham: mede nos teus dados.", "Stops dentro do gap podem ser executados longe do nível; ajusta o tamanho."],
      quiz: [
        mc("O que é um gap?", ["Um tipo de ordem", "Um salto de preço entre dois períodos sem negociação nos níveis intermédios", "Um indicador", "Um spread"], 1, "Surge, por exemplo, entre o fecho de sexta e a reabertura de domingo."),
        tf("Um gap fecha sempre dentro do dia.", false, "Alguns fecham em horas, outros em semanas, outros nunca."),
        mc("O que acontece a um stop dentro de um gap?", ["Executa sempre ao preço definido", "Pode ser executado bem longe do preço definido", "É cancelado", "Duplica"], 1, "Executa-se ao primeiro preço disponível."),
        num("Fecho de sexta 39.100, reabertura 39.230. Qual é o tamanho do gap, em pontos?", 130, 0, "pontos", "39.230 − 39.100 = 130 pontos."),
      ],
    },
    {
      slug: "dias-de-tendencia-e-dias-de-range",
      title: "Dias de tendência, dias de range, momentum e reversões",
      summary: "Dois tipos de dia muito diferentes — e como evitar usar a mesma abordagem em ambos.",
      minutes: 7,
      content: `Na prática intradiária, é útil distinguir dois tipos de dia:

## Dia de tendência (*trend day*)
O preço **move-se numa direção** durante a maior parte da sessão, com **recuos curtos** e fecho perto de um extremo do dia.

- **Range** grande face ao ATR diário;
- Poucos recuos profundos; **momentum** persistente;
- Em retrospetiva, o **máximo/mínimo do dia** fica perto da abertura ou do fecho.

## Dia de range (*range day*)
O preço **oscila** entre limites sem direção clara.

- **Range** pequeno face ao ATR;
- Muitos **rompimentos falsos** nos extremos;
- Fecho a meio do range.

## Os dias só se classificam bem **depois**
Em tempo real, só tens **pistas**: velocidade da abertura, estrutura nos primeiros swings, reação a níveis, notícias. Qualquer classificação intradiária é uma **hipótese** — que pode ser desmentida.

## Adaptar a abordagem
| | Dia de tendência | Dia de range |
| --- | --- | --- |
| Ideias | continuação em recuos | reação nos extremos |
| Risco típico | entrar tarde | rompimentos falsos |
| Gestão | deixar espaço (se o plano o previr) | alvos mais curtos |

## Momentum e reversões
- **Momentum** mede-se por corpos grandes, fechos perto do extremo e recuos curtos;
- **Reversão** exige **mudança de estrutura** — não basta uma vela contra;
- Em dias de tendência, **apanhar o topo/fundo** é tentador e muito difícil: o custo de estar errado é grande.

> Nada disto é um sinal: é uma forma de decidir **que tipo de ideia faz sentido** e de **ajustar o risco**.`,
      example: `**Dia A:** abre 39.000, range de **410 pontos** (ATR diário ≈ 350), fecha em 39.390 — perto do máximo do dia (39.410). Recuos de 40–60 pontos: dia de tendência.

**Dia B:** range de **140 pontos** (39.020–39.160), 3 toques em cada extremo, fecha em 39.090: dia de range.

A mesma estratégia de "comprar recuos" daria resultados **muito diferentes** em A e em B — por isso a adaptação ao tipo de dia importa.`,
      takeaways: ["Dia de tendência: direção persistente, recuos curtos, range grande face ao ATR; dia de range: oscilação sem direção.", "Só se classificam bem depois: em tempo real são hipóteses.", "Adapta o tipo de ideia e o risco; reversão exige mudança de estrutura."],
      quiz: [
        mc("O que caracteriza um dia de tendência?", ["Range muito pequeno", "Direção persistente, recuos curtos e fecho perto de um extremo", "Fecho a meio do range", "Muitos rompimentos falsos"], 1, "É um dia direcional com momentum persistente."),
        tf("É possível classificar sempre com certeza o tipo de dia logo na abertura.", false, "Só se classifica bem depois; em tempo real são hipóteses."),
        mc("O que é preciso para falar de reversão?", ["Uma vela contra", "Uma mudança de estrutura", "Só volume alto", "Uma notícia"], 1, "A reversão exige quebra e nova sequência de swings."),
        num("Range do dia de 410 pontos e ATR diário de 350. Quantos ATR tem o range (2 casas decimais)?", 1.17, 0.01, "×", "410 ÷ 350 = 1,17."),
      ],
    },
    {
      slug: "us30-cfd-vs-ym-mym",
      title: "US30 CFD vs YM/MYM: cotação, especificações e execução",
      summary: "Porque os mesmos 'pontos' não são exatamente o mesmo — e o que confirmar no teu broker.",
      minutes: 8,
      content: `É comum falar de "US30" e "YM" como se fossem o mesmo. **Não são.** Têm diferenças relevantes em **três planos**.

## 1. Cotação
- **YM/MYM** cotam o **preço do futuro** (contrato com vencimento);
- O **US30 CFD** pode seguir o **índice à vista** (cash) ou um **futuro** (com ajustes), conforme o broker;
- O futuro e o índice **diferem** por uma **base** (juros, dividendos, vencimento) que **varia ao longo do tempo**.

Por isso, os mesmos níveis (PDH, 39.000…) **não coincidem exatamente** entre instrumentos. Na plataforma, o **US30 DEMO** cota 15 pontos abaixo do YM — um valor **ilustrativo** para praticares esta diferença.

## 2. Especificações
| | YM / MYM | US30 CFD |
| --- | --- | --- |
| Definição | CME Group | Broker |
| Valor por ponto | YM $5 · MYM $0,50 | **Depende do broker** |
| Tick | 1 ponto | Depende do broker (pode ter décimas) |
| Vencimento | Trimestral | Normalmente "perpétuo" |
| Margem | Bolsa + broker | Alavancagem definida pelo broker/regulador |
| Custos | Comissão + taxas | Spread (e por vezes comissão) + financiamento overnight |

## 3. Execução
- **Horários** podem diferir (o broker pode fechar o CFD antes ou depois do futuro);
- **Slippage**, **requotes** e execução dependem do tipo de conta e do broker;
- **Financiamento (swap)**: o CFD paga/recebe um custo por manter posições overnight;
- **Proteções regulatórias** (limites de alavancagem, proteção contra saldo negativo) variam por país — ver Learning Sources.

## O que fazer
- **Confirma no teu broker** o valor por ponto, o tamanho do contrato, o spread típico, o swap e os horários **antes** de calcular risco;
- Usa **uma** família de preços para análise (os teus níveis) e **não mistures** gráficos de instrumentos diferentes como se fossem iguais;
- Nos cálculos, usa o **valor por ponto do instrumento que realmente vais negociar**.`,
      example: `Mesma ideia, dois instrumentos (valores **ilustrativos**):

- **MYM:** risco = 50 pontos × $0,50 = **$25** por contrato;
- **US30 CFD** com **$1 por ponto por lote** (valor de exemplo — depende do broker): risco = 50 × $1 = **$50** por lote; com 0,5 lotes, $25.

Se ignorasses esta diferença e assumisses os mesmos $ por ponto, o risco real ficaria **errado** — na pior das hipóteses, para o dobro ou para metade do planeado.`,
      exercise: { kind: "calculator", tool: "position-size", prompt: "Calcula o tamanho para MYM e para US30 DEMO com o mesmo stop e compara o risco por contrato." },
      takeaways: ["US30 CFD e YM/MYM diferem em cotação, especificações e execução.", "Valor por ponto, tick, spread, swap e horários do CFD dependem do broker: confirma antes de calcular risco.", "Calcula sempre com o valor por ponto do instrumento que vais mesmo negociar."],
      quiz: [
        mc("Qual destas afirmações é correta?", ["US30 e YM são exatamente o mesmo produto", "O valor por ponto de um CFD US30 depende do broker; o do YM é definido pelo CME", "O MYM é um CFD", "O YM não tem vencimento"], 1, "Os futuros têm especificações do CME; o CFD tem as do broker."),
        tf("Os níveis de preço do US30 e do YM coincidem sempre ao ponto.", false, "Podem diferir por uma base que varia ao longo do tempo."),
        num("MYM: risco por contrato com stop de 50 pontos ($0,50/ponto), em dólares?", 25, 0, "$", "50 × $0,50 = $25.", "POSITION_SIZE"),
        mc("Qual custo adicional é típico de manter um CFD overnight?", ["Comissão da bolsa", "Financiamento (swap)", "Nenhum", "Margem fixa"], 1, "Os CFDs costumam ter custo/crédito de financiamento overnight (a confirmar com o broker)."),
      ],
    },
    {
      slug: "niveis-semanais-e-plano-do-dow",
      title: "Níveis diários e semanais e um plano para o Dow",
      summary: "Juntar PDH/PDL, PWH/PWL, números redondos e o plano da sessão num processo curto.",
      minutes: 6,
      content: `Pela especificidade do Dow, o planeamento pré-sessão costuma passar por poucos itens **objetivos**:

## Níveis
- **PDH / PDL** (dia anterior);
- **PWH / PWL** (semana anterior);
- **Máximos e mínimos de sessão** (por exemplo, o range asiático e o de Londres);
- **Números redondos** (milhares e centenas relevantes, como 39.000 e 39.500);
- **Zonas** de S/R e de oferta/procura do timeframe superior;
- **Pontos de abertura**: abertura do dia e opening range (depois da abertura).

## Contexto
- Estrutura do timeframe superior (D1/H4) e último HL/LH;
- **Eventos económicos** do dia e a que horas saem (no teu fuso);
- Tipo de dia **provável** (hipótese): notícias fortes → mais probabilidade de movimento; fim de semana longo → liquidez menor.

## Plano
1. **O que tem de acontecer** antes de agir (confirmação)?
2. **O que invalida** a ideia?
3. **Risco máximo** por trade e por dia;
4. **Número máximo de trades**;
5. **Janela** em que vais operar.

## Depois
Revê no fim: "O que previ? O que fiz? O que aconteceu? O processo foi cumprido?"

> Um plano **curto e escrito** vale mais do que 20 níveis num gráfico. O **Daily Trading Plan** da plataforma guia estes passos e dá XP (pequeno, uma vez por dia) ao preencheres "o que tem de acontecer" e "o que invalida".`,
      example: `Manhã de terça: PDH 39.180, PDL 38.920, PWH 39.320, PWL 38.700; número redondo 39.000 (dentro do range de ontem); CPI às 08:30 ET (extremo). Plano: **não operar antes da publicação**; depois, observar a reação; se rejeitar o PDH e quebrar o último HL do M15 → ideia de venda com stop acima do pavio; risco máximo $80 (MYM: 80 ÷ ($0,50 × pontos do stop)); **máximo 2 trades**; paro às 11:00 ET.`,
      exercise: { kind: "link", href: "/tools/daily-plan", label: "Abrir o Daily Trading Plan", prompt: "Escreve o teu plano para a próxima sessão usando os níveis que aprendeste neste módulo." },
      takeaways: ["O planeamento do Dow assenta em poucos níveis objetivos: PDH/PDL, PWH/PWL, extremos de sessão, números redondos e zonas.", "Plano = o que confirma, o que invalida, risco máximo, nº máximo de trades e janela.", "Revê no fim: processo cumprido? — não só o resultado."],
      quiz: [
        mc("Qual destes é um item típico do planeamento pré-sessão?", ["Prever o fecho do dia", "Marcar PDH/PDL, eventos do dia, o que invalida a ideia e o risco máximo", "Escolher o tamanho pelo palpite", "Ignorar notícias"], 1, "O plano é curto e escrito, com níveis, eventos, invalidação e risco."),
        tf("Um plano com 20 níveis é melhor do que um com 4 níveis bem justificados.", false, "Menos níveis, mais relevantes e mais justificados, dão um plano mais acionável."),
        mc("O que se revê no fim do dia?", ["Só o P&L", "O que previ, o que fiz, o que aconteceu e se o processo foi cumprido", "Nada", "Só os erros dos outros"], 1, "A revisão avalia o processo, não só o resultado."),
      ],
    },
  ],
  quiz: {
    title: "Quiz do módulo — US30 / Dow Specific",
    passScore: 70,
    questions: [
      mc("Como é ponderado o Dow?", ["Por capitalização", "Por preço das ações", "Por volume", "Igual"], 1, "Ações com preço mais alto têm mais influência nos pontos."),
      mc("Quantas empresas tem o Dow?", ["10", "30", "100", "500"], 1, "Trinta componentes (a composição pode mudar)."),
      tf("O US30 CFD e o futuro YM têm sempre as mesmas especificações.", false, "O CFD é definido pelo broker; o YM pelo CME."),
      num("MYM: risco por contrato com stop de 40 pontos, em dólares?", 20, 0, "$", "40 × $0,50 = $20.", "POSITION_SIZE"),
      mc("O que é um gap?", ["Um tipo de ordem", "Um salto de preço entre dois períodos sem negociação nos níveis intermédios", "O spread", "Um indicador"], 1, "Surge entre sessões, pausas ou fins de semana."),
      tf("Os gaps fecham sempre no mesmo dia.", false, "Não existe percentagem universal."),
      mc("O que caracteriza um dia de tendência?", ["Fecho a meio do range", "Direção persistente, recuos curtos e fecho perto de um extremo", "Range pequeno", "Rompimentos falsos constantes"], 1, "É um dia direcional."),
      num("Fecho de sexta 39.050, reabertura 39.170. Qual é o gap, em pontos?", 120, 0, "pontos", "39.170 − 39.050 = 120 pontos."),
      mc("O que fazer antes de calcular o risco num CFD US30?", ["Assumir $1 por ponto", "Confirmar com o broker o valor por ponto, o tamanho do contrato, o spread e o swap", "Usar o valor do YM", "Ignorar"], 1, "O valor por ponto do CFD depende do broker."),
      mc("Qual é uma boa prática com divergências entre o Dow e o Nasdaq?", ["Tratá-las como sinais de entrada", "Tratá-las como contexto e registar para testar a utilidade", "Ignorar sempre", "Operar contra o mais forte"], 1, "São observações, não sinais."),
    ],
  },
};
