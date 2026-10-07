import { mc, num, tf } from "../dsl";
import type { ModuleDef } from "../types";

/**
 * Module 14 — Economic Fundamentals (Level 5).
 * No forecasts and no "this data = buy/sell" rules. Release times are described as typical and must be checked on the
 * official calendars (BLS, BEA, Federal Reserve). Impact levels are this platform's educational classification.
 */
export const economicFundamentals: ModuleDef = {
  slug: "economic-fundamentals",
  number: 14,
  level: 5,
  title: "Economic Fundamentals",
  summary: "CPI, PPI, NFP, FOMC e Fed Funds, desemprego, GDP, vendas a retalho, PMI, jobless claims e discursos da Fed; classificação de impacto, riscos em notícias e uso do calendário económico.",
  difficulty: "INTERMEDIATE",
  icon: "Landmark",
  lessons: [
    {
      slug: "os-eventos-que-movem-o-mercado",
      title: "Os eventos económicos que mais importam ao Dow",
      summary: "O que mede cada indicador e porque os mercados lhe prestam atenção — sem prever reações.",
      minutes: 7,
      content: `Os dados económicos dos EUA ajudam a perceber o **estado da economia** e, sobretudo, as **expectativas sobre a política monetária** — dois fatores que influenciam o preço das ações.

| Evento | O que mede (resumo) |
| --- | --- |
| **CPI** | Inflação ao consumidor: variação dos preços que os consumidores pagam |
| **PPI** | Inflação ao nível do produtor |
| **NFP / Employment Situation** | Criação mensal de emprego, taxa de **desemprego** e salários |
| **FOMC / Fed Funds** | Decisão de taxas de juro da Fed (a "taxa dos fundos federais"), comunicado e conferência |
| **GDP** | Produto Interno Bruto: crescimento da economia |
| **Retail Sales** | Consumo dos consumidores |
| **PMI / ISM** | Inquéritos à atividade (indústria e serviços) |
| **Jobless claims** | Pedidos semanais de subsídio de desemprego |
| **Discursos da Fed** | Comunicação de membros da Fed (incluindo o presidente) |

> Quem ocupa o cargo de presidente da Fed muda ao longo do tempo. Consulta o site oficial da Federal Reserve para o calendário e os oradores (Learning Sources).

## O que NÃO se pode dizer
- Que "CPI alto = Dow desce": depende do **esperado**, do contexto e das expectativas para a Fed;
- Que um evento "move sempre" o mercado: alguns passam quase sem reação;
- Que existe uma tabela fixa "dado X → movimento Y".

## Hora e frequência
Muitos dados dos EUA saem a **horas fixas** (por exemplo, às 08:30 ET para vários indicadores de inflação e emprego, e ao início da sessão para alguns inquéritos). **Confirma sempre no calendário oficial** — as horas mudam e há exceções.

## Utilidade para ti
Saber **o que cada indicador mede** ajuda a perceber **porque** o mercado se agita e a **planear o risco**: reduzir tamanho, esperar ou ficar de fora.`,
      example: `Três indicadores num mesmo dia: **jobless claims** (leitura semanal — normalmente pouco relevante isoladamente), **PMI** (inquérito) e **CPI** (inflação). Para o Dow, o CPI costuma concentrar a atenção. Mas num dia em que o CPI sai "em linha", o mercado pode reagir mais ao **tom** de um discurso da Fed à tarde.

Conclusão: a **hierarquia** dos eventos é uma hipótese — a reação real vê-se **depois** e varia.`,
      takeaways: ["CPI, PPI, NFP, FOMC, GDP, retail sales, PMI, claims e discursos da Fed medem inflação, emprego, política monetária e atividade.", "Não existe tabela 'dado X → movimento Y': depende do esperado e do contexto.", "As horas de publicação são típicas; confirma no calendário oficial."],
      quiz: [
        mc("O que mede o CPI?", ["O emprego", "A inflação ao consumidor", "O PIB", "O volume do mercado"], 1, "O CPI mede a variação dos preços ao consumidor."),
        mc("Qual destes é um indicador de emprego?", ["PMI", "NFP (Employment Situation)", "CPI", "PPI"], 1, "O NFP faz parte do relatório de emprego mensal."),
        tf("'CPI alto' significa sempre que o Dow desce.", false, "A reação depende do esperado, do contexto e das expectativas para a Fed."),
        mc("Onde confirmar a hora de uma publicação?", ["Num fórum", "No calendário oficial (BLS, BEA, Federal Reserve)", "Não é preciso", "No broker apenas"], 1, "As fontes oficiais são o ponto de verdade."),
      ],
    },
    {
      slug: "inflacao-emprego-e-taxas-de-juro",
      title: "Inflação, emprego e taxas de juro: a cadeia de leitura",
      summary: "Como os dados se ligam às expectativas sobre a Fed — e porque o 'mesmo' dado pode ter reações opostas.",
      minutes: 7,
      content: `Uma cadeia de raciocínio **frequente** (mas não determinística):

**Dados económicos → expectativas sobre a política da Fed → taxas de juro → avaliações das empresas e condições financeiras → preço das ações**

## Os elos
- **Inflação** mais alta do que o esperado → o mercado pode antecipar **taxas mais altas durante mais tempo**;
- **Emprego** muito forte → pode sugerir economia robusta (positivo para lucros) **ou** pressão de salários e inflação (negativo para a política monetária);
- **Taxas** mais altas tendem a pesar nas avaliações das empresas, sobretudo as de crescimento;
- A **Fed** comunica decisões e orientações no FOMC, no comunicado e na conferência de imprensa.

## Porque o mesmo dado pode ter reações opostas
O que conta é como o dado altera as **expectativas** face ao que **já estava no preço**:

- Num regime em que o mercado teme **inflação**, dados **fortes** podem ser lidos como **maus** (mais taxas);
- Num regime em que o mercado teme **recessão**, dados **fortes** podem ser lidos como **bons**.

Este "regime" muda — e nem sempre se sabe qual está em vigor até depois.

## O papel do FOMC
Reunião de política monetária com **decisão de taxas**, **comunicado**, e muitas vezes **projeções** e **conferência de imprensa**. Costuma haver **duas ondas** de volatilidade: à decisão e durante a conferência (as horas são típicas — verifica no calendário da Fed).

## Cuidado com histórias bonitas
É fácil criar uma narrativa **depois** de ver o movimento. A pergunta útil **antes**: "Qual é o **esperado**? Qual é o **meu plano** para os cenários acima e abaixo do esperado? Quanto arrisco?"`,
      example: `Cenário **hipotético**: o consenso para a inflação mensal é **0,3%** e o dado sai **0,4%**. Há dois regimes possíveis:

- **Regime "teme taxas":** o Dow desce (as taxas podem ficar mais altas);
- **Regime "teme recessão":** o mercado pode ler como sinal de procura forte e não reagir, ou reagir com subida.

A decisão prudente não é "prever" qual — é **reduzir o risco** e esperar pela reação.`,
      takeaways: ["Cadeia típica: dados → expectativas da Fed → taxas → avaliações → preços; não é determinística.", "O mesmo dado pode ter reações opostas conforme o regime e o que já estava no preço.", "Planeia cenários e risco antes; evita explicações bonitas depois."],
      quiz: [
        mc("O que importa mais para a reação a um dado económico?", ["O número isolado", "Como o dado altera as expectativas face ao que já estava no preço", "A cor do candle", "A hora do dia"], 1, "É a surpresa face às expectativas que move o preço."),
        tf("Um dado forte é sempre positivo para as ações.", false, "Em regimes de receio de inflação pode ser lido como negativo (mais taxas)."),
        mc("Porque costuma haver duas ondas de volatilidade no FOMC?", ["Erro de dados", "Decisão/comunicado e depois conferência de imprensa", "Fecho do mercado", "Spread fixo"], 1, "A decisão e a comunicação posterior são fontes separadas de informação."),
        mc("Qual é uma boa pergunta antes de um dado?", ["Qual será o resultado?", "Qual é o esperado e qual é o meu plano para cenários acima e abaixo?", "Quanto vou ganhar?", "Qual é o melhor indicador?"], 1, "Planeia cenários e risco em vez de prever."),
      ],
    },
    {
      slug: "surpresa-consenso-e-reacao",
      title: "Consenso, surpresa e reação",
      summary: "Porque 'o número' não é o que importa — e como a primeira reação pode ser desmentida.",
      minutes: 6,
      content: `Os dados são comparados com um **consenso** (previsão média de analistas), publicado antes. A **surpresa** é a diferença entre o **resultado** e o **consenso**:

\`surpresa = resultado − consenso\`

## O que se observa
- **Surpresa pequena** (em linha): reação normalmente contida — mas pode haver reação a **componentes** (por exemplo, "core", salários) ou a **revisões** de meses anteriores;
- **Surpresa grande:** reação maior, mas a **direção** depende do regime (ver lição anterior);
- **Revisões:** dados anteriores revistos podem pesar mais do que o número principal.

## Primeira reação vs. seguimento
Muitas vezes há um **primeiro movimento** (rápido, com spreads largos) e depois um **ajuste** — por vezes na direção contrária. O primeiro impulso pode ser **desmentido** em minutos.

## O que isto implica para ti
- **Não** persigas o primeiro candle — a liquidez é fraca e o custo de execução, alto;
- Se vais **operar**, planeia: onde fica o **stop** realista? Qual é o **tamanho** que cabe no risco com esse stop?
- Se vais **esperar**, define **o que observar**: aceitação do movimento? Mudança de estrutura? Reteste de um nível?
- Evita a **ilusão de controlo**: acertar a "direção da surpresa" é um jogo de azar.

## Ferramentas
No **Economic Calendar** da plataforma tens o evento, a hora **no teu fuso**, o impacto (classificação educativa) e uma explicação do que o evento mede. Os eventos DEMO são **ilustrativos** e assim identificados.`,
      example: `Consenso **0,3%**, resultado **0,4%**: surpresa de **+0,1 p.p.**. O índice recua 90 pontos em 2 minutos (spread alargado), depois recupera 60 em 10 minutos. Quem entrou **vendido** no primeiro candle com stop curto pode ter sido parado no ressalto; quem esperou pela **aceitação** perdeu parte do movimento, mas teve um stop mais lógico.

Não há "melhor": há **trade-offs** — e uma decisão que deve estar **escrita antes**.`,
      takeaways: ["Surpresa = resultado − consenso; a reação depende da surpresa, do regime e de componentes/revisões.", "A primeira reação pode ser desmentida em minutos; evita perseguir o primeiro candle.", "Define antes: tamanho com stop realista, ou o que observar se esperares."],
      quiz: [
        num("Consenso 0,3% e resultado 0,5%. Qual é a surpresa, em pontos percentuais (1 casa decimal)?", 0.2, 0.01, "p.p.", "0,5 − 0,3 = +0,2 pontos percentuais."),
        tf("A primeira reação a um dado nunca é desmentida.", false, "Pode ser desmentida em minutos."),
        mc("Que outro elemento pode pesar mais do que o número principal?", ["A hora", "Revisões de períodos anteriores e componentes (por exemplo, 'core')", "A cor do gráfico", "O volume do broker"], 1, "Revisões e componentes alteram a leitura."),
        mc("Qual é uma boa decisão sobre notícias?", ["Improvisar no candle", "Escrever antes se vais operar (com que stop e tamanho) ou esperar (o que observar)", "Dobrar o tamanho", "Retirar o stop"], 1, "Decisões escritas antes reduzem a reação emocional."),
      ],
    },
    {
      slug: "classificar-o-impacto-dos-eventos",
      title: "Classificar eventos: LOW, MEDIUM, HIGH e EXTREME",
      summary: "A classificação educativa da plataforma — e porque nenhuma classificação é universal.",
      minutes: 6,
      content: `Para planear, é útil **classificar** os eventos por **potencial de impacto**. A plataforma usa quatro níveis **educativos**:

| Nível | Quando faz sentido usar | Exemplos de referência |
| --- | --- | --- |
| **LOW** | Dados de menor atenção ou com reação pouco frequente | indicadores secundários |
| **MEDIUM** | Podem mexer com o preço de forma moderada | PMI/ISM, jobless claims |
| **HIGH** | Reação frequente; atenção elevada | PPI, vendas a retalho, GDP, discursos de membros da Fed |
| **EXTREME** | Costumam gerar volatilidade invulgar | CPI, NFP, decisão do FOMC |

## Atenção
- Esta classificação é **educativa e simplificada** — **não é oficial** nem universal; outros calendários usam escalas diferentes (por exemplo, 3 níveis);
- O impacto **real** muda com o **regime**: em alturas em que a inflação domina o debate, o CPI pesa mais; noutras, o emprego;
- Um evento "LOW" pode surpreender; um "EXTREME" pode passar sem grande reação;
- Mede **a tua experiência**: no journal, anota o **range** do primeiro minuto/quarto de hora depois de cada tipo de evento, para teres **dados teus**.

## Como usar a classificação
- **EXTREME / HIGH:** planeia explicitamente: ficar de fora, reduzir tamanho, ou estar preparado para spreads e slippage;
- **MEDIUM:** consciência e margem de manobra;
- **LOW:** sem alteração relevante do plano, salvo contexto particular.

## Fontes e honestidade
As **datas e horas reais** vêm de fontes oficiais (BLS, BEA, Federal Reserve). Os eventos marcados **DEMO** na plataforma são **ilustrativos** — não substituem o calendário oficial.`,
      example: `Num dia com **jobless claims (MEDIUM)** às 08:30 ET e **PMI (MEDIUM)** às 10:00 ET, o plano pode ser: operar normalmente, mas com atenção à volatilidade pontual. Noutro dia com **CPI (EXTREME)** às 08:30 ET e **FOMC (EXTREME)** às 14:00 ET, o plano pode incluir **não operar entre as 08:25 e as 08:45** e **reduzir o tamanho** à tarde. A classificação serve para **dimensionar a cautela**.`,
      exercise: { kind: "link", href: "/tools/economic-calendar", label: "Abrir o calendário económico", prompt: "Escolhe um evento EXTREME e escreve o teu plano: operar, reduzir ou ficar de fora — e porquê." },
      takeaways: ["A plataforma usa LOW, MEDIUM, HIGH e EXTREME como classificação educativa; não é oficial nem universal.", "O impacto real muda com o regime; mede a tua experiência no journal.", "A classificação serve para dimensionar a cautela e planear explicitamente."],
      quiz: [
        mc("Qual destes níveis a plataforma usa para eventos de maior potencial de volatilidade?", ["BASIC", "EXTREME", "ULTRA", "CRITICAL"], 1, "Os níveis são LOW, MEDIUM, HIGH e EXTREME."),
        tf("A classificação de impacto é oficial e universal.", false, "É educativa e simplificada; outras fontes usam escalas diferentes."),
        mc("Qual é a melhor forma de calibrar o impacto real de cada evento para ti?", ["Confiar só na etiqueta", "Anotar no journal o range após cada tipo de evento", "Ignorar", "Perguntar a amigos"], 1, "Dados teus são a melhor calibragem."),
      ],
    },
    {
      slug: "riscos-em-noticias",
      title: "Riscos em notícias: spread, slippage, volatilidade e liquidez",
      summary: "Os quatro riscos concretos — e porque 'não negociar durante notícias' não é uma regra universal.",
      minutes: 8,
      content: `Quando sai um dado importante, quatro riscos concretos aparecem:

## 1. Spread widening
O diferencial **bid/ask alarga** — sobretudo em CFDs — por segundos ou minutos. Entrar e sair custa **mais**.

## 2. Slippage
Ordens **a mercado** e **stops** executam longe do preço pretendido porque o preço salta por vários níveis.

## 3. Volatility spike
Candles de **centenas de pontos em segundos**: um stop "normal" pode ser varrido por ruído.

## 4. Liquidity changes
O livro de ordens **esvazia momentaneamente**: há saltos de preço (gaps intra-candle) e execuções parciais.

## "Não negociar durante notícias": é regra?
**Não é uma regra universal.** É uma **opção** entre várias, com **custos e benefícios**:

| Opção | Vantagem | Custo |
| --- | --- | --- |
| **Ficar de fora** | Evita os quatro riscos | Perdes oportunidades e o que se segue |
| **Reduzir tamanho** | Mantém exposição com risco menor | Stop maior → menos contratos |
| **Esperar a primeira reação** | Mais informação, melhor estrutura | Pior preço, parte do movimento perdida |
| **Operar a reação** | Potencial de movimento | Todos os riscos acima |

Cada abordagem é válida **se estiver planeada**, **medida** e consistente com o teu risco. Quem opera notícias sem plano **é o que mais perde**.

## Boas práticas
- **Sabe a hora** (no teu fuso) e **o impacto esperado**;
- **Reduz o tamanho** ou **não tenhas posições novas** perto do evento, se o teu plano não prevê;
- **Não** mexas no stop de forma emocional;
- **Ajusta o stop e o tamanho** para o ruído extra — e regista no journal a diferença entre risco **planeado** e risco **real**;
- Aceita que o stop pode ser executado **muito pior** do que definido.`,
      example: `Spread normal em MYM: 1 ponto. Durante o evento: **4 pontos**. Para 4 contratos, o custo do spread passa de $0,50 × 4 × 1 = **$2** para $0,50 × 4 × 4 = **$8**.

Stop normal de **40 pontos** ($20 por MYM). Durante o evento, o ruído exige **120 pontos** ($60 por MYM). Com orçamento de risco de **$100**: antes, **5 contratos**; durante, **1 contrato** ($100 ÷ $60 = 1,67 → 1). Nas mesmas condições de risco, o tamanho cai **80%** — por isso é que "operar notícias como num dia normal" estoura o risco.`,
      takeaways: ["Os quatro riscos: spread widening, slippage, volatility spike e mudanças de liquidez.", "'Não negociar durante notícias' não é regra universal: é uma opção entre várias, cada uma com custos.", "Planeia, ajusta stop e tamanho ao ruído extra, e regista risco planeado vs risco real."],
      quiz: [
        mc("Qual destes é um risco típico em notícias?", ["Spreads mais estreitos", "Spread widening e slippage", "Volume zero sempre", "Margem zero"], 1, "O diferencial bid/ask alarga e as execuções saltam de preço."),
        tf("'Não negociar durante notícias' é uma regra universal e obrigatória.", false, "É uma opção entre várias; cada uma tem vantagens e custos e deve ser planeada."),
        num("Orçamento $100, MYM ($0,50/ponto), stop de 120 pontos. Quantos contratos?", 1, 0, "contratos", "Risco por MYM = 120 × $0,50 = $60; $100 ÷ $60 = 1,67 → 1.", "POSITION_SIZE"),
        mc("Qual é a pior abordagem a uma notícia?", ["Ficar de fora com plano", "Reduzir tamanho", "Operar sem plano, com o tamanho habitual", "Esperar a reação"], 2, "Sem plano e com tamanho normal, o risco real excede o planeado."),
      ],
    },
    {
      slug: "usar-o-calendario-economico",
      title: "Usar o calendário económico",
      summary: "Uma rotina de verificação antes de cada sessão — com fontes, datas e fuso horário corretos.",
      minutes: 6,
      content: `O **Economic Calendar** da plataforma mostra eventos com **título, hora (no teu fuso), impacto** e uma **explicação educativa** do que o evento mede.

## Rotina pré-sessão
1. **Abre o calendário** para o dia (e para amanhã);
2. **Filtra** por impacto (HIGH e EXTREME primeiro);
3. **Confirma a hora** no teu fuso (o perfil define-o) e **a fonte oficial** quando for um dia importante;
4. **Marca** os eventos relevantes no **Daily Trading Plan**;
5. **Decide** o que fazes em cada um: operar, reduzir tamanho, esperar ou ficar de fora;
6. **Regista** no journal se houve evento e como o geriste.

## Fonte e data de verificação
Qualquer informação que **pode mudar** (datas, horas, estimativas) deve ter **fonte e data**. O calendário da plataforma identifica:

- eventos **reais** (com fonte indicada e a confirmar no site oficial);
- eventos **DEMO** (ilustrativos, **não** são calendário real).

Para dados reais, as fontes oficiais são o **BLS** (CPI, PPI, emprego), o **BEA** (GDP) e a **Federal Reserve** (FOMC e discursos). Consulta **Learning Sources**.

## O que NÃO fazer
- Confiar num único calendário sem verificar em dias importantes;
- Esquecer o **fuso horário**;
- Ignorar eventos fora dos EUA que também mexem com os mercados (decisões de outros bancos centrais, dados da Europa/China) — o Dow não vive isolado;
- Usar o calendário **para prever** o resultado.

## O calendário como ferramenta de disciplina
O objetivo é **ficar preparado**, não prever. Se o dia tem um evento EXTREME às 08:30 ET e não tens plano, **o plano é não operar** nessa janela.`,
      example: `Quarta-feira, calendário no teu fuso (Lisboa): **13:30** — CPI (EXTREME); **15:00** — discurso de membro da Fed (HIGH); **19:00** — decisão e comunicado do FOMC (EXTREME).

Plano: **não abrir posições entre 13:20 e 13:50**; reduzir o tamanho para metade até às 16:00; **sem posições abertas** durante o FOMC se o stop não for adequado ao ruído. Máximo de 2 trades no dia. Tudo escrito **antes** de a sessão começar.`,
      exercise: { kind: "link", href: "/tools/economic-calendar", label: "Abrir o calendário económico", prompt: "Escolhe os eventos HIGH/EXTREME da semana e escreve o que farás em cada um." },
      takeaways: ["Rotina: abrir o calendário, filtrar por impacto, confirmar hora e fonte, marcar no plano e decidir.", "Eventos reais têm fonte; eventos DEMO são ilustrativos e identificados como tal.", "O calendário serve para te preparar, não para prever resultados."],
      quiz: [
        mc("O que distingue um evento DEMO de um evento real no calendário?", ["Nada", "O DEMO é ilustrativo e não é calendário oficial", "O DEMO é mais preciso", "O real é gratuito"], 1, "Os eventos DEMO são placeholders educativos."),
        tf("Podes confiar num único calendário em dias importantes sem confirmar na fonte oficial.", false, "Em dias importantes, confirma na fonte oficial (BLS, BEA, Federal Reserve)."),
        mc("Qual é a função principal do calendário económico?", ["Prever o resultado", "Preparar o plano e decidir o que fazer em cada evento", "Substituir o stop", "Escolher o instrumento"], 1, "Serve para disciplina e preparação."),
      ],
    },
  ],
  quiz: {
    title: "Quiz do módulo — Economic Fundamentals",
    passScore: 70,
    questions: [
      mc("O que mede o NFP?", ["Inflação", "Criação mensal de emprego nos EUA (e outras métricas do relatório)", "PIB", "Vendas a retalho"], 1, "Faz parte do relatório de emprego mensal."),
      mc("Qual destes é tipicamente classificado como EXTREME pela plataforma?", ["Jobless claims", "CPI", "Consumer confidence", "PMI"], 1, "CPI, NFP e decisão do FOMC costumam estar no topo da escala educativa."),
      tf("Existe uma tabela fixa 'dado X → movimento Y'.", false, "A reação depende da surpresa, do regime e do contexto."),
      num("Consenso 0,2% e resultado 0,4%. Qual é a surpresa, em pontos percentuais?", 0.2, 0.01, "p.p.", "0,4 − 0,2 = +0,2 p.p."),
      mc("Qual é o risco de 'spread widening'?", ["Spread menor", "O diferencial bid/ask alarga e entrar/sair custa mais", "Margem zero", "Slippage negativo"], 1, "O custo implícito aumenta."),
      tf("'Não negociar durante notícias' é uma regra universal.", false, "É uma opção entre várias, com custos e benefícios."),
      num("Spread passa de 1 para 5 pontos, 3 MYM. Quanto custa o spread em dólares ($0,50/ponto)?", 7.5, 0.01, "$", "5 × $0,50 × 3 = $7,50."),
      mc("Que fontes oficiais usar para datas reais de CPI, PPI e emprego?", ["Redes sociais", "BLS", "Um fórum", "O broker apenas"], 1, "O BLS publica o calendário oficial."),
      num("Orçamento $90, MYM, stop de 90 pontos. Quantos contratos?", 2, 0, "contratos", "Risco por MYM = 90 × $0,50 = $45; $90 ÷ $45 = 2.", "POSITION_SIZE"),
      mc("O calendário económico serve para…", ["Prever o resultado", "Preparar o plano e decidir o que fazer em cada evento", "Eliminar o risco", "Substituir o stop"], 1, "É uma ferramenta de preparação e disciplina."),
    ],
  },
};
