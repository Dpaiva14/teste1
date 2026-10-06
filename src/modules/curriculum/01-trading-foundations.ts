import { mc, num, tf } from "../dsl";
import type { ModuleDef } from "../types";

/**
 * Module 01 — Trading Foundations (Level 1). The 26 "Level 0" lessons, from absolute zero.
 * Numbers marked "ilustrativo" are teaching figures, NOT live market or broker values.
 */
export const tradingFoundations: ModuleDef = {
  slug: "trading-foundations",
  number: 1,
  level: 1,
  title: "Trading Foundations",
  summary: "Do zero: o que é trading, índices, o Dow Jones e o US30, CFDs vs futuros, tick/ponto/margem, custos e tipos de ordens.",
  difficulty: "BEGINNER",
  icon: "Compass",
  lessons: [
    {
      slug: "o-que-e-trading",
      title: "O que é trading?",
      summary: "Comprar e vender para lucrar com variações de preço — e porque o foco é o processo, não a previsão.",
      minutes: 4,
      content: `**Trading** é a atividade de comprar e vender instrumentos financeiros com o objetivo de lucrar com variações de preço, normalmente em horizontes curtos (minutos, horas, dias ou semanas).

É diferente de **investir**, onde se compra um ativo para o manter durante anos, beneficiando do crescimento do negócio, de dividendos ou de juros.

## O que faz um trader
- Analisa o preço e o contexto;
- Define **antes** da entrada onde a ideia fica errada (*stop*) e onde pretende sair (*objetivo*);
- Decide **quanto** arrisca;
- Executa, gere a posição e regista o resultado para aprender.

## Pode-se ganhar a subir e a descer
Compra-se (**long**) quando se espera subida; vende-se (**short**) quando se espera descida. Em ambos os casos também se pode **perder**. Nada é garantido, e a maioria dos traders de retalho perde dinheiro — por isso esta academia ensina **processo e gestão de risco**, não previsões.

> Esta plataforma é exclusivamente educativa. Usa contas de simulação, não dá sinais e não promete rentabilidade.`,
      example: `O índice está a **39.000**. Compras 1 contrato e o preço sobe para 39.040: ganhaste **40 pontos**. Se descesse para 38.960, perderias 40 pontos.

O trading é a gestão dessa incerteza: **quanto estás disposto a perder** para tentar ganhar, e **o que te diz que estás errado**?`,
      exercise: { kind: "reflection", prompt: "Com as tuas palavras: porque é que \"saber para onde o mercado vai\" não é o objetivo desta academia?", placeholder: "Escreve a tua reflexão (não é avaliada)…" },
      takeaways: ["Trading = comprar/vender para lucrar com variações de preço em prazos curtos.", "Podes lucrar a subir (long) ou a descer (short) — e perder nos dois casos.", "O objetivo é construir um processo repetível, não adivinhar o mercado."],
      quiz: [
        mc("Qual é a principal diferença entre trading e investimento?", ["Trading procura lucrar com variações de preço em prazos mais curtos; investir normalmente mantém o ativo durante anos", "Trading é sempre ilegal", "Investir nunca tem risco", "Não existe diferença"], 0, "Trading é orientado a variações de preço de curto prazo; investir é tipicamente de longo prazo. Ambos têm risco."),
        tf("Num mercado em queda é impossível ganhar dinheiro.", false, "É possível lucrar com vendas (short), mas isso exige perceber os riscos — as perdas também podem ser grandes se o preço subir."),
        mc("Qual destes é o foco central desta academia?", ["Prever o próximo movimento do mercado", "Construir um processo de decisão repetível com gestão de risco", "Copiar sinais de terceiros", "Garantir uma taxa de acerto elevada"], 1, "O objetivo é um processo repetível: razões claras para entrar, invalidação definida e risco controlado. Não há previsões garantidas."),
      ],
    },
    {
      slug: "mercado-financeiro",
      title: "O que é um mercado financeiro?",
      summary: "Onde compradores e vendedores se encontram, e o que determina o preço.",
      minutes: 4,
      content: `Um **mercado financeiro** é o local (físico ou eletrónico) onde compradores e vendedores negoceiam instrumentos financeiros — ações, obrigações, moedas, matérias-primas, índices, contratos de futuros.

## Como se forma o preço
O preço é o valor ao qual **alguém aceita comprar** e **alguém aceita vender** nesse momento:
- **Bid**: o melhor preço a que há quem queira comprar;
- **Ask (offer)**: o melhor preço a que há quem queira vender.

Se entram mais compradores agressivos, o preço sobe até encontrar vendedores; se dominam os vendedores, desce. É a **oferta e procura** em tempo real.

## Participantes
Bancos, fundos, empresas, market makers, algoritmos e traders individuais. Todos influenciam o preço, mas nenhum o controla por completo.

## Liquidez
Um mercado é **líquido** quando há muitos participantes e as ordens executam facilmente perto do preço desejado. Os futuros sobre índices norte-americanos estão entre os mercados mais líquidos do mundo, o que ajuda a execução — mas não elimina o risco.`,
      example: `Num dado instante: **bid 39.000 / ask 39.001**. Se enviares uma ordem de compra a mercado, compras ao ask (39.001); se venderes a mercado, vendes ao bid (39.000). A diferença de 1 ponto é o **spread** — o primeiro custo de qualquer operação.`,
      takeaways: ["O preço resulta do encontro entre quem compra e quem vende.", "Bid = melhor preço de compra; ask = melhor preço de venda.", "Liquidez facilita a execução, mas não reduz o risco do mercado."],
      quiz: [
        mc("O que representa o 'ask'?", ["O melhor preço a que há quem queira comprar", "O melhor preço a que há quem queira vender", "O preço médio do dia", "A comissão do broker"], 1, "O ask (ou offer) é o melhor preço a que existem vendedores. É o preço a que compras a mercado."),
        tf("Um mercado líquido garante que não perdes dinheiro.", false, "Liquidez ajuda a executar perto do preço pretendido, mas não protege contra movimentos adversos."),
        mc("Se no mercado o bid é 39.000 e o ask é 39.002, o spread é…", ["1 ponto", "2 pontos", "39.002 pontos", "0 pontos"], 1, "Spread = ask − bid = 39.002 − 39.000 = 2 pontos."),
      ],
    },
    {
      slug: "o-que-e-um-indice",
      title: "O que é um índice?",
      summary: "Um número calculado que resume o comportamento de um conjunto de ativos.",
      minutes: 4,
      content: `Um **índice** bolsista é um número calculado a partir dos preços de um conjunto de ativos (normalmente ações) para resumir o desempenho de um mercado ou setor.

## Características
- **Não é um produto que se compra diretamente**: é uma medida. Negoceia-se **através de instrumentos que o replicam** — ETFs, futuros, opções, CFDs;
- Tem uma **regra de cálculo** (metodologia): quais os componentes e com que peso;
- É **rebalanceado**: os componentes mudam ao longo do tempo.

## Tipos de ponderação
- **Por capitalização** (ex.: S&P 500): empresas maiores pesam mais;
- **Por preço** (ex.: Dow Jones): ações com preço mais alto pesam mais, independentemente do tamanho da empresa;
- **Igual peso**: cada componente pesa o mesmo.

## Porque é que os traders gostam de índices
Diversificam o risco específico de uma empresa e são muito líquidos. Mas continuam sujeitos ao risco de mercado: um índice também pode cair fortemente.`,
      example: `Se o índice sobe de 39.000 para 39.390, subiu **390 pontos** = **1%**. Os pontos são a unidade em que se mede o movimento; a **percentagem** dá a dimensão relativa.`,
      takeaways: ["Um índice é uma medida calculada, não um ativo que se compre diretamente.", "Negoceia-se através de futuros, ETFs, opções ou CFDs que o replicam.", "A metodologia (componentes e ponderação) determina como o índice se comporta."],
      quiz: [
        mc("Como se negoceia, na prática, um índice?", ["Comprando o índice diretamente na bolsa", "Através de instrumentos que o replicam (futuros, ETFs, CFDs…)", "Só por telefone", "Não se pode negociar"], 1, "O índice é um número. Negoceias produtos que o acompanham: futuros, ETFs, opções ou CFDs."),
        mc("O Dow Jones é ponderado por…", ["Capitalização bolsista", "Preço das ações", "Volume diário", "Igual peso"], 1, "O DJIA é um índice price-weighted: ações com preço mais alto têm mais influência."),
        num("Um índice sobe de 39.000 para 39.390 pontos. Qual foi a variação percentual?", 1, 0.01, "%", "390 / 39.000 = 0,01 = 1%."),
      ],
    },
    {
      slug: "o-que-e-o-dow-jones",
      title: "O que é o Dow Jones?",
      summary: "O Dow Jones Industrial Average: 30 grandes empresas dos EUA, ponderadas por preço.",
      minutes: 5,
      content: `O **Dow Jones Industrial Average (DJIA)**, ou simplesmente **"o Dow"**, é um dos índices mais antigos e conhecidos do mundo. Foi criado por Charles Dow em 1896 e é hoje calculado e publicado pela **S&P Dow Jones Indices**.

## Composição
Acompanha **30 grandes empresas** cotadas nos EUA (as chamadas *blue chips*). Os componentes são escolhidos por um comité, **não** por uma regra automática de tamanho, e mudam ao longo do tempo.

## Ponderação por preço
No Dow, uma ação com preço mais alto influencia mais o índice do que uma de preço baixo — **independentemente do valor da empresa**. O índice é a soma dos preços dividida por um **divisor** (ajustado por splits e alterações de componentes; o divisor é atualmente inferior a 1, pelo que 1 dólar de variação numa ação mexe mais de 1 ponto no índice).

## Limitações
Só 30 empresas e ponderação por preço fazem do Dow uma representação **imperfeita** da economia dos EUA. Ainda assim é muito seguido e extremamente líquido, em parte por causa dos seus derivados (YM/MYM).

> Fonte e data de verificação das especificações: ver a página **Learning Sources**.`,
      example: `Se uma ação com preço de $400 subir 1% ($4) e outra de $40 subir 1% ($0,40), a primeira tem **10× mais impacto** no índice, embora ambas tenham subido o mesmo em percentagem. É a consequência da ponderação por preço.`,
      takeaways: ["O Dow acompanha 30 grandes empresas dos EUA, escolhidas por um comité.", "É ponderado por preço, não por capitalização.", "É um índice muito líquido, mas uma representação limitada da economia."],
      quiz: [
        mc("Quantas empresas compõem o Dow Jones Industrial Average?", ["10", "30", "100", "500"], 1, "O DJIA tem 30 componentes."),
        tf("No Dow, as empresas maiores têm sempre mais peso.", false, "A ponderação é por PREÇO da ação, não por dimensão da empresa."),
        mc("Quem escolhe os componentes do Dow?", ["Um comité", "Uma regra automática que escolhe as 30 maiores empresas", "Os traders por votação", "A Reserva Federal"], 0, "Os componentes são selecionados por um comité — por isso o Dow não é simplesmente 'as 30 maiores'."),
      ],
    },
    {
      slug: "o-que-e-o-us30",
      title: "O que é o US30?",
      summary: "O nome que muitas plataformas de CFDs dão ao Dow Jones.",
      minutes: 4,
      content: `**US30** é o símbolo que muitas plataformas de trading de **CFDs** usam para o **Dow Jones Industrial Average** (o "30" refere-se às 30 empresas).

## Atenção aos nomes
O mesmo índice aparece com símbolos diferentes consoante o broker: *US30*, *DJ30*, *WS30*, *DJIA*, *Wall Street 30*… Verifica sempre a **especificação do contrato** no teu broker.

## O que é (e o que não é)
- É o **preço de um CFD** quotado pelo broker, derivado do índice (ou do futuro do índice);
- **Não** é o índice "puro" nem um contrato de futuros;
- O preço pode diferir ligeiramente do DJIA e dos futuros YM/MYM (ex.: o CFD pode seguir o futuro com ajuste de basis/financiamento — depende do broker);
- O tamanho do contrato, valor por ponto, spread, margem, horários e financiamento overnight **dependem do broker**.

## Nesta plataforma
Quando vires **"US30 (CFD — DEMO)"**, trata-se de um instrumento **simulado**, com um valor por ponto fictício de $1 por lote, apenas para fins educativos.`,
      example: `Num broker, 1 lote de US30 pode valer $1 por ponto; noutro, $10 por ponto; noutro ainda, $0,10. Um stop de 50 pontos arrisca $50, $500 ou $5 — consoante o contrato. **Nunca assumas o valor por ponto: confirma-o.**`,
      takeaways: ["US30 é o nome comum do CFD sobre o Dow em muitas plataformas.", "O símbolo e as especificações variam de broker para broker.", "O valor por ponto tem de ser confirmado antes de calcular qualquer risco."],
      quiz: [
        mc("O que é o 'US30'?", ["Um contrato de futuros do CME", "O nome que muitas plataformas de CFDs dão ao Dow Jones", "Uma ação americana", "Um ETF"], 1, "US30 é o CFD sobre o Dow em muitas plataformas; o nome pode variar (DJ30, WS30…)."),
        tf("O valor por ponto do US30 é igual em todos os brokers.", false, "Depende do broker e do contrato: confirma sempre a especificação."),
        mc("Porque é que o preço do US30 pode diferir do índice e do futuro YM?", ["Porque o CFD é um produto do broker, com a sua própria formação de preço", "Porque o índice é falso", "Porque os futuros não existem", "Nunca difere"], 0, "O CFD é quotado pelo broker; pode incorporar ajustes (basis, financiamento) e spread próprios."),
      ],
    },
    {
      slug: "o-que-e-o-nasdaq",
      title: "O que é o NASDAQ?",
      summary: "Uma bolsa e dois índices famosos — e a diferença para o Dow.",
      minutes: 4,
      content: `**NASDAQ** é, antes de mais, uma **bolsa de valores** eletrónica dos EUA. O nome é também usado, por simplificação, para dois índices:

- **NASDAQ Composite**: inclui praticamente todas as ações cotadas nessa bolsa (milhares);
- **Nasdaq-100**: as 100 maiores empresas **não financeiras** cotadas no NASDAQ, ponderado por capitalização (com regras de ajuste). É o que a maioria dos traders quer dizer por "NASDAQ".

## Dow vs Nasdaq-100
| | Dow (DJIA) | Nasdaq-100 |
|---|---|---|
| Nº de componentes | 30 | 100 |
| Ponderação | Preço | Capitalização (ajustada) |
| Perfil | Empresas industriais e de serviços tradicionais, "blue chips" | Mais tecnologia e crescimento |

## Nomes e derivados
Nos CFDs aparece como *US100*, *NAS100* ou *USTEC*; em futuros, *NQ* (E-mini) e *MNQ* (Micro). Os futuros do Dow são *YM* e *MYM*.

Os índices **não se movem em uníssono**: em certos dias o Nasdaq-100 sobe e o Dow cai (ou vice-versa) — a composição explica muita da diferença.`,
      example: `Num dia em que as tecnológicas sobem fortemente mas as indústrias recuam, o Nasdaq-100 pode ganhar +1,2% enquanto o Dow ganha apenas +0,2% (ou até desce). Por isso o Dow **não é um substituto** do Nasdaq para medir "o mercado".`,
      takeaways: ["NASDAQ é uma bolsa; o Nasdaq-100 e o Composite são índices.", "O Dow tem 30 componentes ponderados por preço; o Nasdaq-100 tem 100, ponderados por capitalização.", "Os índices podem divergir no mesmo dia por causa da composição."],
      quiz: [
        mc("O Nasdaq-100 é…", ["O índice das 100 maiores empresas não financeiras cotadas no NASDAQ", "O mesmo que o Dow Jones", "Uma moeda", "Um contrato de matérias-primas"], 0, "O Nasdaq-100 reúne as 100 maiores empresas não financeiras do NASDAQ."),
        tf("O Dow e o Nasdaq-100 movem-se sempre exatamente da mesma forma.", false, "A composição e a ponderação são diferentes, por isso podem divergir."),
        mc("Qual é a ponderação do Dow?", ["Por capitalização", "Por preço", "Igual peso", "Por volume"], 1, "O Dow é ponderado por preço."),
      ],
    },
    {
      slug: "indice-vs-acao",
      title: "Diferença entre índice e ação",
      summary: "Risco específico vs risco de mercado, propriedade e o que realmente compras.",
      minutes: 4,
      content: `Uma **ação** representa uma fração da propriedade de **uma empresa**. Um **índice** é uma **medida** de um conjunto de ações.

| | Ação | Índice |
|---|---|---|
| O que é | Parte do capital de uma empresa | Número calculado sobre várias ações |
| Compra direta | Sim | Não (via ETF, futuro, CFD…) |
| Risco específico da empresa | Elevado (resultados, escândalos, gestão) | Diluído pela diversificação |
| Risco de mercado | Sim | Sim |
| Direitos (dividendos, voto) | Sim | Depende do instrumento |

## Implicações para o trader
- Num índice, uma má notícia numa só empresa tem **impacto limitado**; numa ação pode haver *gaps* violentos;
- Os índices reagem mais a **macroeconomia** (taxas de juro, inflação, emprego) do que a notícias de uma empresa;
- Não eliminas risco por negociar um índice: **diversificação não é proteção contra uma queda geral do mercado**.`,
      example: `Uma empresa do Dow reporta maus resultados e cai 8% de um dia para o outro. Como é só 1 de 30 componentes, o impacto no índice é bem menor do que os 8% sentidos por quem tinha apenas essa ação. Mas se a Fed surpreender com taxas mais altas e **todas** as ações caírem, o índice cai também.`,
      takeaways: ["Ação = parte de uma empresa; índice = medida de um conjunto.", "Índices diluem o risco específico, mas não o risco de mercado.", "Os índices reagem mais a macroeconomia do que a notícias isoladas."],
      quiz: [
        mc("Qual dos riscos é reduzido por negociar um índice em vez de uma só ação?", ["Risco de mercado geral", "Risco específico de uma empresa", "Risco de taxa de juro", "Nenhum"], 1, "A diversificação dilui o risco específico de cada empresa, mas não o risco de mercado."),
        tf("Podes comprar o índice Dow Jones diretamente, como uma ação.", false, "Só indiretamente: ETFs, futuros, opções ou CFDs."),
        mc("Que tipo de notícia tende a mexer mais com um índice?", ["Resultados de uma empresa pequena", "Dados macro (inflação, emprego, taxas de juro)", "Mudanças de logótipo", "Nenhuma"], 1, "Os índices reagem sobretudo a macroeconomia e política monetária."),
      ],
    },
    {
      slug: "o-que-e-um-cfd",
      title: "O que é um CFD?",
      summary: "Contract for Difference: derivado OTC com o broker como contraparte.",
      minutes: 5,
      content: `Um **CFD** (*Contract for Difference*) é um contrato entre ti e o **broker**: no fecho, trocam-se apenas a **diferença** entre o preço de abertura e o de fecho (vezes o tamanho). **Não és proprietário** de nada.

## Características
- **OTC** (fora de bolsa): o preço e a execução vêm do broker, que normalmente é a tua **contraparte**;
- **Alavancagem**: depositas apenas uma margem; ampliam-se ganhos **e perdas**;
- **Long e short** com facilidade;
- **Custos**: spread, financiamento *overnight* (swap) e, nalguns casos, comissão.

## Riscos específicos
- Perdas rápidas por alavancagem;
- **Risco de contraparte** (o broker);
- Qualidade de execução e *slippage*;
- Regras diferentes consoante o país. Na UE, desde 2018 a ESMA limita a alavancagem de retalho (20:1 para os principais índices), exige proteção contra saldo negativo e impõe avisos de risco — confirma a regulamentação do teu país e do teu broker.

Os brokers regulados na UE têm de divulgar a percentagem de contas de retalho que **perdem dinheiro** com CFDs; é tipicamente a **maioria**.`,
      example: `Compras 1 CFD US30 a **39.000** (suposto $1/ponto) e fechas a **39.040**: ganhas 40 × $1 = **$40**. Se fechasses a 38.960, perdias $40. Não houve entrega de nada: só se liquidou a diferença (menos custos).`,
      takeaways: ["CFD = contrato sobre a diferença de preço; não possuis o ativo.", "O broker é normalmente a tua contraparte e define spread, margem e swap.", "A alavancagem amplia perdas tanto quanto ganhos."],
      quiz: [
        mc("Num CFD, o que se liquida no fecho?", ["A entrega física do ativo", "A diferença entre o preço de abertura e o de fecho", "Apenas a comissão", "O valor total do contrato"], 1, "Liquida-se a diferença de preço (vezes o tamanho), menos custos."),
        tf("Ao comprar um CFD sobre o Dow, passas a ser dono das ações que o compõem.", false, "Não possuis nenhum ativo subjacente; é só um contrato de diferença."),
        mc("Qual é um risco típico dos CFDs?", ["Não existir spread", "Perdas ampliadas pela alavancagem e dependência do broker", "Só poder comprar", "Ser negociado apenas em bolsa"], 1, "A alavancagem amplia perdas e há dependência do broker (contraparte, execução)."),
      ],
    },
    {
      slug: "o-que-e-um-futuro",
      title: "O que é um futuro?",
      summary: "Contrato padronizado, negociado em bolsa, com data de expiração.",
      minutes: 5,
      content: `Um **contrato de futuros** é um acordo **padronizado**, negociado em **bolsa**, para comprar ou vender um ativo a um preço definido numa data futura.

## Padronização
Cada contrato define: o ativo subjacente, o **tamanho** (multiplicador), o **tick** (variação mínima), o **mês de expiração** e as regras de liquidação. Isso torna-o transparente e comparável entre participantes.

## Futuros sobre índices
Os futuros sobre índices (como o Dow) são **liquidados em dinheiro** (*cash-settled*): no vencimento não há entrega das 30 ações, só se acertam ganhos/perdas.

## Elementos-chave
- **Câmara de compensação** (*clearing house*): fica entre comprador e vendedor, reduzindo o risco de contraparte;
- **Margem**: depósito de garantia (*performance bond*), não é um "pagamento" parcial do contrato;
- **Mark-to-market diário**: ganhos e perdas são liquidados na conta todos os dias;
- **Expiração/rollover**: contratos têm vencimento (os de índices são trimestrais: março, junho, setembro, dezembro) e quem quer manter exposição "rola" para o contrato seguinte.

## Alavancagem e risco
O valor nocional controlado é muito superior à margem: ganhos e perdas são **ampliados**, e as perdas podem exceder o depósito de margem.`,
      example: `Um contrato de futuros do Dow com o índice a 39.000 e multiplicador de $5 controla **$195.000** de exposição (39.000 × $5). Mesmo que a margem exigida seja de apenas uma fração disso, um movimento de 1% (390 pontos) representa **$1.950** de ganho ou perda por contrato.`,
      takeaways: ["Futuro = contrato padronizado, em bolsa, com vencimento.", "Os de índices são liquidados em dinheiro e têm vencimentos trimestrais.", "Margem é garantia, não custo; a alavancagem amplia ganhos e perdas."],
      quiz: [
        mc("Os futuros sobre o Dow são liquidados por…", ["Entrega das 30 ações", "Dinheiro (cash-settled)", "Ouro", "Obrigações"], 1, "Futuros de índices são cash-settled: acertam-se apenas ganhos/perdas."),
        tf("A margem num contrato de futuros é um custo que não se recupera.", false, "A margem é um depósito de garantia (performance bond); não é uma taxa."),
        mc("Qual é a vantagem principal da câmara de compensação?", ["Garante lucros", "Reduz o risco de contraparte entre comprador e vendedor", "Elimina a volatilidade", "Define o preço do mercado"], 1, "A clearing house interpõe-se entre as partes, reduzindo o risco de contraparte."),
      ],
    },
    {
      slug: "o-que-e-o-ym",
      title: "O que é o YM?",
      summary: "O E-mini Dow: $5 por ponto do índice.",
      minutes: 4,
      content: `**YM** é o símbolo do contrato de futuros **E-mini Dow** ($5), listado na **CBOT**, uma bolsa do **CME Group**.

## Especificações essenciais
- **Subjacente:** Dow Jones Industrial Average;
- **Multiplicador:** **$5 × índice**;
- **Tick (variação mínima):** **1,00 ponto do índice = $5,00**;
- **Vencimentos:** ciclo trimestral (março, junho, setembro, dezembro);
- **Liquidação:** em dinheiro.

> As especificações são definidas pelo CME Group e podem ser alteradas. Consulta a fonte e a data de verificação na página **Learning Sources** — e confirma sempre no site do CME.

## O que isto significa na prática
Cada ponto de movimento do índice vale **$5** por contrato. Como o tick é de 1 ponto, **cada variação mínima de preço mexe $5**.`,
      example: `Compras 1 YM a **39.000** e vendes a **39.040**: 40 pontos × $5 = **$200** (antes de comissões). Se o stop de 25 pontos fosse atingido: 25 × $5 = **$125** de perda.`,
      exercise: { kind: "calculator", tool: "tick-value", prompt: "Experimenta: escolhe YM, 1 contrato e 40 pontos. Quanto vale o movimento?" },
      takeaways: ["YM = E-mini Dow, $5 por ponto do índice.", "O tick é 1 ponto = $5 por contrato.", "Vencimentos trimestrais e liquidação em dinheiro."],
      quiz: [
        mc("Quanto vale 1 ponto do Dow num contrato YM?", ["$0,50", "$1", "$5", "$50"], 2, "YM = $5 × índice; 1 ponto = $5."),
        num("Compras 1 YM a 39.000 e fechas a 39.060. Qual é o lucro bruto em dólares?", 300, 0, "$", "60 pontos × $5 = $300."),
        tf("As especificações do YM nunca mudam, por isso não é preciso confirmá-las.", false, "São definidas pelo CME e podem ser revistas; confirma sempre a fonte oficial."),
      ],
    },
    {
      slug: "o-que-e-o-mym",
      title: "O que é o MYM?",
      summary: "O Micro E-mini Dow: $0,50 por ponto, um décimo do YM.",
      minutes: 4,
      content: `**MYM** é o contrato **Micro E-mini Dow**, também do CME Group (CBOT).

## Especificações essenciais
- **Multiplicador:** **$0,50 × índice** — **1/10 do YM**;
- **Tick:** **1,00 ponto = $0,50**;
- **Vencimentos:** trimestrais (março, junho, setembro, dezembro);
- **Liquidação:** em dinheiro.

> Confirma as especificações atuais na fonte oficial do CME (ver **Learning Sources**).

## Porque é que existe
Contratos mais pequenos permitem **dimensionar o risco** com mais granularidade: com um stop de 50 pontos, 1 YM arrisca $250, mas 1 MYM arrisca apenas $25.

## Atenção
Contratos pequenos não são "mais seguros" por si: **10 MYM expõem o mesmo que 1 YM**. O que importa é o **risco total** da posição, não o número de contratos.`,
      example: `Stop de 50 pontos:
- **1 YM** → 50 × $5 = **$250**
- **1 MYM** → 50 × $0,50 = **$25**
- **10 MYM** → **$250** (igual a 1 YM)`,
      exercise: { kind: "calculator", tool: "tick-value", prompt: "Compara: 1 YM vs 10 MYM com os mesmos 50 pontos de stop." },
      takeaways: ["MYM = Micro E-mini Dow, $0,50 por ponto.", "Equivale a 1/10 do YM.", "O que conta é o risco total, não o número de contratos."],
      quiz: [
        mc("Quantos MYM expõem o mesmo que 1 YM?", ["2", "5", "10", "100"], 2, "YM = $5/ponto; MYM = $0,50/ponto → 10 MYM = 1 YM."),
        num("Compras 1 MYM a 39.000 e fechas a 39.060. Qual é o lucro bruto em dólares?", 30, 0, "$", "60 pontos × $0,50 = $30."),
        tf("Usar contratos micro garante que o risco é baixo.", false, "O risco depende do tamanho total da posição e da distância ao stop, não do tipo de contrato."),
      ],
    },
    {
      slug: "cfd-vs-futuros",
      title: "CFD US30 vs Futures YM/MYM",
      summary: "Quotação, especificações, custos e execução: o que muda entre os dois.",
      minutes: 6,
      content: `Ambos permitem negociar o Dow com alavancagem, mas são produtos **diferentes**.

| | **CFD US30** | **Futuros YM / MYM** |
|---|---|---|
| Onde se negoceia | OTC, com o broker | Em bolsa (CME/CBOT), com câmara de compensação |
| Contraparte | Normalmente o broker | Mercado / clearing house |
| Tamanho / valor por ponto | **Depende do broker** | Padronizado: YM $5, MYM $0,50 |
| Tick | Depende do broker | 1 ponto |
| Custos | Spread (+ swap overnight) | Spread de mercado + comissões + taxas de bolsa/NFA |
| Vencimento | Normalmente não tem (CFD "perpétuo") | Trimestral; exige rollover |
| Horário | Definido pelo broker | Globex quase 24h (com pausa diária) |
| Preço | Quotado pelo broker; pode divergir | Preço de mercado do contrato |
| Fiscalidade/regulação | Varia por país (retalho UE: limites ESMA) | Varia por país |

## Consequências para o trader
- O **mesmo gráfico** pode ter níveis ligeiramente diferentes (basis, spread, horários);
- O mesmo setup pode ter **stops e custos** diferentes;
- Uma posição de futuros mostra **o mercado real**; num CFD vês o que o broker oferece;
- **Nenhum dos dois é "melhor"**: depende do teu país, capital, regras e preferências.`,
      example: `Mesmo stop de 50 pontos:
- **CFD US30** (suposto $1/ponto): arrisca $50 por lote.
- **YM**: $250 por contrato. **MYM**: $25.

Os valores do CFD **variam por broker**; os do YM/MYM são padronizados pelo CME.`,
      visual: { kind: "diagram", id: "futures-vs-cfd", caption: "Dois caminhos para o mesmo índice, com estruturas diferentes." },
      takeaways: ["CFD: OTC, broker como contraparte, especificações variam.", "Futuros: em bolsa, padronizados, com vencimento e comissões.", "Os preços e custos podem diferir; adapta os cálculos ao instrumento real que usas."],
      quiz: [
        mc("Qual das afirmações é verdadeira?", ["O valor por ponto do YM varia de broker para broker", "O valor por ponto do YM é padronizado pelo CME", "O CFD tem sempre o mesmo valor por ponto em todos os brokers", "Futuros não têm vencimento"], 1, "YM = $5/ponto (CME). O CFD é que varia por broker."),
        mc("Que custo é típico de futuros mas normalmente NÃO é cobrado da mesma forma num CFD?", ["Comissão por contrato e taxas de bolsa", "Spread", "Nenhum", "IVA sobre o preço"], 0, "Futuros têm comissões por contrato e taxas de bolsa/NFA; no CFD o custo está sobretudo no spread (e swap)."),
        tf("Um CFD de US30 e um futuro YM têm sempre exatamente o mesmo preço.", false, "Podem diferir (basis, spread, horários, forma de cotação do broker)."),
      ],
    },
    {
      slug: "tick",
      title: "Tick",
      summary: "A menor variação de preço possível.",
      minutes: 3,
      content: `O **tick** é a **menor variação de preço** que um instrumento permite.

- **YM e MYM:** 1,00 ponto do índice;
- **CFD US30:** depende do broker (pode ser 1, 0,1 ou 0,01).

## Porque interessa
- O preço **só pode existir em múltiplos do tick**: não se negoceia o YM a 39.000,5;
- A distância do stop mede-se em **ticks** ou **pontos**;
- Cada tick tem um **valor em dólares** (*tick value*): YM $5, MYM $0,50.

## Tick vs ponto
Quando o tick do instrumento é de 1 ponto (YM/MYM), os dois coincidem. Noutros instrumentos podem não coincidir: um tick de 0,25 pontos tem 4 ticks por ponto.`,
      example: `Num instrumento com tick de **0,25 pontos** e valor de tick de **$12,50**: um movimento de 3 pontos são 12 ticks → 12 × $12,50 = **$150**. (Ilustrativo — não é o YM.)`,
      takeaways: ["Tick = menor variação de preço permitida.", "YM e MYM: 1 tick = 1 ponto.", "Cada tick tem um valor em dólares."],
      quiz: [
        mc("Qual é o tick do YM?", ["0,01 pontos", "0,25 pontos", "1 ponto", "5 pontos"], 2, "O YM tem tick de 1,00 ponto = $5."),
        tf("É possível negociar o YM a 39.000,5.", false, "Os preços têm de ser múltiplos do tick (1 ponto)."),
        num("Um movimento de 2 pontos num instrumento com tick de 0,25 pontos corresponde a quantos ticks?", 8, 0, "ticks", "2 / 0,25 = 8 ticks."),
      ],
    },
    {
      slug: "point",
      title: "Point (ponto)",
      summary: "A unidade em que se mede o movimento de um índice.",
      minutes: 3,
      content: `Um **ponto** é 1,00 unidade do valor do índice. Se o Dow passa de 39.000 para 39.050, subiu **50 pontos**.

## Ponto, pip, tick e percentagem
- **Ponto**: unidade do índice (39.000 → 39.001 = 1 ponto);
- **Tick**: menor variação permitida (no YM, = 1 ponto);
- **Pip**: termo de forex (4.ª/5.ª casa decimal); **não** se usa em índices;
- **%**: variação relativa — 1% de 39.000 = 390 pontos.

## Pontos não são dólares
O valor em dólares de um ponto depende do **contrato**: YM $5, MYM $0,50, CFD depende do broker. Por isso o risco calcula-se sempre como **pontos × valor por ponto × contratos**.`,
      example: `O Dow sobe de **38.912** para **39.047**: variação = 39.047 − 38.912 = **135 pontos** (≈ +0,35%). Com 2 MYM longos: 135 × $0,50 × 2 = **$135**.`,
      takeaways: ["1 ponto = 1,00 unidade do índice.", "Pontos medem movimento; o valor em dólares depende do contrato.", "Risco = pontos × valor por ponto × contratos."],
      quiz: [
        num("O Dow passa de 38.912 para 39.047. Quantos pontos subiu?", 135, 0, "pontos", "39.047 − 38.912 = 135."),
        mc("O 'pip' é uma unidade usada…", ["Em índices como o Dow", "Principalmente em forex", "Em futuros de petróleo", "Em obrigações"], 1, "Pip é um termo de forex; nos índices fala-se em pontos."),
        num("1% de um índice a 39.000 corresponde a quantos pontos?", 390, 0, "pontos", "39.000 × 0,01 = 390."),
      ],
    },
    {
      slug: "contract-size",
      title: "Contract size",
      summary: "Quanto vale, em dólares, cada ponto — e qual é o valor nocional.",
      minutes: 4,
      content: `O **tamanho do contrato** define quanto vale cada ponto do índice por contrato (multiplicador) e, portanto, o **valor nocional** que controlas.

- **YM:** $5 × índice;
- **MYM:** $0,50 × índice;
- **CFD US30:** definido pelo broker (ex.: 1 lote = $1/ponto, ou outro).

## Valor nocional
Nocional = **preço do índice × multiplicador × nº de contratos**.

É a exposição real da posição, muito maior do que a margem depositada — e é por isso que pequenos movimentos percentuais têm grande efeito na conta.`,
      example: `Índice a **39.000**:
- 1 YM → 39.000 × $5 = **$195.000** de nocional
- 1 MYM → 39.000 × $0,50 = **$19.500**
- 3 MYM → **$58.500**`,
      takeaways: ["Tamanho do contrato = valor por ponto (multiplicador).", "Nocional = preço × multiplicador × contratos.", "A exposição real é muito maior do que a margem."],
      quiz: [
        num("Índice a 39.000. Qual é o valor nocional de 1 MYM ($0,50 por ponto)?", 19500, 0, "$", "39.000 × 0,50 = $19.500."),
        num("Índice a 40.000. Qual é o valor nocional de 2 YM ($5 por ponto)?", 400000, 0, "$", "40.000 × 5 × 2 = $400.000."),
        mc("Porque é importante conhecer o valor nocional?", ["Porque é a exposição real, muito superior à margem", "Porque é a comissão", "Porque define o spread", "Não é importante"], 0, "O nocional é a exposição real ao mercado; a margem é apenas a garantia."),
      ],
    },
    {
      slug: "tick-value",
      title: "Tick value",
      summary: "Quanto vale, em dólares, cada tick — a ponte entre pontos e dinheiro.",
      minutes: 4,
      content: `O **tick value** é o valor em dólares de **um tick** por contrato.

- **YM:** 1 tick (1 ponto) = **$5,00**;
- **MYM:** 1 tick (1 ponto) = **$0,50**.

## A fórmula que vais usar sempre
**P&L = pontos movidos × valor por ponto × nº de contratos** (menos custos)

Para calcular **risco**, usa a distância até ao stop:
**Risco = pontos até ao stop × valor por ponto × contratos**.

## Erros típicos
- Esquecer que o MYM vale 1/10 do YM;
- Trocar pontos por dólares;
- Usar o valor por ponto de um CFD sem o confirmar com o broker.`,
      example: `Compras **3 MYM** a 39.000, stop a 38.960 (40 pontos). Risco = 40 × $0,50 × 3 = **$60**. Se fosse **1 YM** com o mesmo stop: 40 × $5 = **$200**.`,
      exercise: { kind: "calculator", tool: "tick-value", prompt: "Calcula o risco: 3 MYM com stop a 40 pontos." },
      takeaways: ["YM = $5/tick; MYM = $0,50/tick.", "P&L = pontos × valor por ponto × contratos.", "Calcula sempre o risco em dólares antes de entrar."],
      quiz: [
        num("3 MYM com um stop a 40 pontos. Qual é o risco em dólares (sem custos)?", 60, 0, "$", "40 × $0,50 × 3 = $60.", "POSITION_SIZE"),
        num("2 YM com um stop a 25 pontos. Qual é o risco em dólares (sem custos)?", 250, 0, "$", "25 × $5 × 2 = $250.", "POSITION_SIZE"),
        mc("Qual é o valor de 1 tick do MYM?", ["$0,05", "$0,50", "$5", "$50"], 1, "MYM: 1 tick (1 ponto) = $0,50."),
      ],
    },
    {
      slug: "margin",
      title: "Margin",
      summary: "O depósito de garantia: inicial, de manutenção e o que acontece quando falta.",
      minutes: 5,
      content: `**Margem** é o dinheiro que tens de ter na conta para **abrir e manter** uma posição alavancada. Em futuros é um **depósito de garantia** (*performance bond*), não o preço do contrato.

## Tipos
- **Margem inicial**: necessária para abrir a posição;
- **Margem de manutenção**: mínimo para a manter. Se o saldo cair abaixo, recebes uma **margin call** e podes ser **liquidado** à força.

## Quem a define
A **bolsa** (CME) define os mínimos e altera-os com a volatilidade; o **broker** pode exigir **mais** (e, para *day trading*, às vezes menos, dentro de regras próprias). Em CFDs a margem é definida pelo broker e pela regulação.

> **Não existe um valor fixo.** Nesta plataforma, as margens da simulação são **ilustrativas** e rotuladas como tal. Consulta o CME Group e o teu broker para valores reais e atuais.

## Margem não é risco máximo
A margem usada **não limita a perda**: podes perder mais do que a margem depositada. O risco real é definido pelo **stop** e pelo **tamanho da posição**.`,
      example: `Suponhamos (valor **ilustrativo**) uma margem de **$9.000** para 1 YM com o índice a 39.000 (nocional $195.000).
- Margem = 4,6% do nocional;
- Um movimento adverso de 390 pontos (1%) custa **$1.950** → **21,7% da margem**.`,
      exercise: { kind: "calculator", tool: "leverage", prompt: "Introduz nocional $195.000 e margem $9.000 (ilustrativo). Qual é a alavancagem?" },
      takeaways: ["Margem = garantia para abrir/manter a posição, não o preço do contrato.", "Bolsa e broker definem valores que mudam com o tempo.", "A margem não limita a perda: o stop e o tamanho é que limitam."],
      quiz: [
        mc("O que acontece se o saldo cair abaixo da margem de manutenção?", ["Nada", "Pode haver margin call e liquidação forçada", "O broker devolve o dinheiro", "O contrato expira"], 1, "Abaixo da margem de manutenção há margin call e possível liquidação."),
        tf("A margem usada é o máximo que podes perder numa posição de futuros.", false, "As perdas podem exceder a margem; o risco é definido pelo stop e pelo tamanho."),
        mc("Quem define os valores mínimos de margem de futuros?", ["O trader", "A bolsa (e o broker pode exigir mais)", "A Fed", "O Google"], 1, "O CME define mínimos; o broker pode acrescentar requisitos."),
      ],
    },
    {
      slug: "leverage",
      title: "Leverage",
      summary: "Alavancagem: o amplificador de ganhos e de perdas.",
      minutes: 5,
      content: `**Alavancagem** é a relação entre a **exposição** (valor nocional) e o **capital** (margem) que a suporta.

**Alavancagem = Nocional ÷ Margem**

## O que a alavancagem faz
- **Amplia ganhos** — mas amplia **igualmente as perdas**;
- Permite posições grandes com pouco capital — o que também permite **perder o capital rapidamente**;
- Não muda a probabilidade de acertar; muda a **consequência** de errar.

## Alavancagem efetiva
O que interessa não é a alavancagem máxima do broker, mas a tua **alavancagem efetiva**: nocional da posição ÷ saldo da conta. Quanto maior, mais frágil é a conta.

> Os futuros e os CFDs são produtos de risco elevado. A alavancagem pode amplificar significativamente ganhos e perdas, incluindo perdas superiores ao capital depositado em certos produtos.`,
      example: `Conta de **$10.000** com **1 YM** (nocional $195.000 a 39.000):
- Alavancagem efetiva ≈ 195.000 ÷ 10.000 = **19,5×**
- Movimento de 1% contra (−390 pts) = −$1.950 = **−19,5% da conta**, num único dia.

Com **1 MYM** (nocional $19.500): alavancagem ≈ **1,95×**; −1% = −$195 = −1,95% da conta.`,
      exercise: { kind: "calculator", tool: "leverage", prompt: "Testa alavancagem efetiva: nocional $195.000 numa conta de $10.000." },
      takeaways: ["Alavancagem = nocional ÷ margem (ou ÷ saldo, na versão efetiva).", "Amplia ganhos e perdas por igual.", "A alavancagem efetiva da tua conta é um indicador de fragilidade."],
      quiz: [
        num("Nocional $195.000 e conta de $10.000. Qual é a alavancagem efetiva?", 19.5, 0.05, "×", "195.000 ÷ 10.000 = 19,5×."),
        tf("A alavancagem aumenta a probabilidade de a operação ganhar.", false, "Não altera a probabilidade; amplia ganhos e perdas."),
        mc("Qual é a consequência de usar uma alavancagem efetiva muito alta?", ["Menos risco", "Uma pequena variação adversa pode causar grande perda percentual na conta", "Comissões menores", "Nenhuma"], 1, "Com alavancagem alta, um pequeno movimento contrário já representa uma fatia grande do capital."),
      ],
    },
    {
      slug: "spread",
      title: "Spread",
      summary: "A diferença entre bid e ask: o custo de entrar e sair.",
      minutes: 4,
      content: `O **spread** é a diferença entre o preço de **compra (ask)** e o de **venda (bid)**.

- Compras ao **ask**, vendes ao **bid**;
- Ao abrir uma posição já estás **ligeiramente negativo**: tens de "recuperar" o spread antes de teres lucro;
- Em **CFDs** o spread é a principal fonte de custo (o broker define-o e pode **alargá-lo** em momentos voláteis ou de baixa liquidez);
- Em **futuros** o spread é determinado pelo mercado: em horário líquido o YM tende a negociar com 1 tick de diferença, mas pode alargar em notícias ou fora de horas.

## Quando o spread alarga
Notícias de impacto, abertura/fecho de sessões, horas de baixa liquidez e movimentos violentos.`,
      example: `CFD US30: **bid 39.000,0 / ask 39.001,5** → spread **1,5 pontos**. Se comprares e venderes logo a seguir, perdes 1,5 pontos (×valor por ponto).

Com 1 YM, 1 tick de spread = 1 ponto = **$5** de custo implícito por operação (ilustrativo).`,
      exercise: { kind: "calculator", tool: "costs", prompt: "Estima o custo total de uma operação: spread, comissão e slippage." },
      takeaways: ["Spread = ask − bid; comprar ao ask, vender ao bid.", "É um custo implícito: começas a operação ligeiramente em perda.", "Pode alargar em notícias e fora de horário líquido."],
      quiz: [
        num("Bid 39.000,0 e ask 39.001,5. Qual é o spread em pontos?", 1.5, 0, "pontos", "39.001,5 − 39.000,0 = 1,5."),
        mc("Em que situações o spread tende a alargar?", ["Em horas de grande liquidez", "Em notícias de impacto e baixa liquidez", "Nunca", "Só ao fim de semana"], 1, "Notícias fortes e baixa liquidez alargam spreads."),
        tf("Quando compras a mercado, executas ao bid.", false, "Compras ao ask e vendes ao bid."),
      ],
    },
    {
      slug: "commission",
      title: "Commission",
      summary: "Comissões e taxas: pequenas por operação, grandes ao longo do tempo.",
      minutes: 4,
      content: `A **comissão** é o que o broker cobra pela execução. Em futuros costuma ser **por contrato e por lado** (entrada e saída), a que se somam **taxas da bolsa e regulatórias**.

- Exemplo de estrutura: comissão do broker + taxa de bolsa + taxa NFA, por contrato, por lado;
- **Round turn** = entrada + saída;
- Em CFDs, muitos brokers não cobram comissão explícita (o custo vem no spread/swap), mas outros sim.

> Os valores variam por broker e mudam com o tempo. Usa a tua tabela de custos real.

## Custos pesam mais em estratégias de curto prazo
Se arriscas $50 por trade e os custos são $5, **10% do risco** vai logo em fricção. Numa estratégia com muitos trades e alvos pequenos, os custos podem anular a vantagem.`,
      example: `Suponhamos (**ilustrativo**) $2,50 por contrato por lado → round turn **$5,00**. Com 2 YM em 20 operações por mês: 2 × $5 × 20 = **$200/mês** só em comissões, antes de spread e slippage.`,
      takeaways: ["Comissão por contrato e por lado; round turn = entrada + saída.", "Custos fixos pesam mais com alvos pequenos e muitas operações.", "Inclui sempre os custos reais nos teus cálculos."],
      quiz: [
        num("Comissão (ilustrativa) de $2,50 por contrato por lado. Qual é o custo round turn de 2 contratos?", 10, 0, "$", "2 × $2,50 × 2 lados = $10."),
        tf("Os custos só importam para quem opera muito grande.", false, "Importam sobretudo a quem opera alvos pequenos e com frequência: a fricção consome a vantagem."),
        mc("O que é 'round turn'?", ["Só a entrada", "Entrada + saída", "A margem", "O spread"], 1, "Round turn é o ciclo completo: abrir e fechar a posição."),
      ],
    },
    {
      slug: "slippage",
      title: "Slippage",
      summary: "A diferença entre o preço esperado e o preço executado.",
      minutes: 4,
      content: `**Slippage** é a diferença entre o preço a que esperavas executar e o preço a que **efetivamente** executaste.

## Quando acontece
- **Ordens a mercado** em mercado rápido;
- **Ordens stop** (viram ordens a mercado quando o preço é tocado): em *gaps* ou picos de volatilidade podem ser preenchidas **muito além** do stop;
- Baixa liquidez ou notícias.

## Pode ser favorável
Se o preço melhora entre o envio e a execução, há *slippage positivo* — mas não deves contar com isso.

## Como lidar
- Inclui uma **margem de slippage** nos teus cálculos de risco;
- Evita ordens a mercado em momentos de iliquidez;
- Usa **ordens limite** quando a execução exata do preço importa mais do que a execução garantida.`,
      example: `Longo em YM com stop a **38.950**. Numa queda rápida, o stop é executado a **38.944**: **6 pontos de slippage** × $5 = **$30** a mais do que o planeado, por contrato. Com 2 contratos: $60.`,
      takeaways: ["Slippage = preço executado − preço esperado.", "É mais provável em stops, notícias e baixa liquidez.", "Inclui-o no cálculo de risco e usa limites quando apropriado."],
      quiz: [
        num("Stop a 38.950, executado a 38.944 num YM. Qual foi o custo extra em dólares por contrato?", 30, 0, "$", "6 pontos × $5 = $30."),
        mc("Que tipo de ordem é mais exposta a slippage em picos de volatilidade?", ["Ordem limite", "Ordem stop (vira ordem a mercado)", "Nenhuma", "Todas por igual, sempre"], 1, "Uma ordem stop converte-se em ordem a mercado quando tocada: pode ser executada longe do stop."),
        tf("O slippage só pode ser desfavorável.", false, "Pode ser favorável ou desfavorável; mas planeia para o desfavorável."),
      ],
    },
    {
      slug: "market-order",
      title: "Market order",
      summary: "Execução imediata ao melhor preço disponível.",
      minutes: 3,
      content: `Uma **ordem a mercado** é executada **imediatamente** ao melhor preço disponível.

- **Vantagem:** quase certeza de execução;
- **Desvantagem:** **incerteza do preço** — pagas o spread e podes sofrer slippage.

## Quando faz sentido
Quando a **execução** é mais importante do que o preço exato (ex.: sair rapidamente de uma posição que deixou de fazer sentido).

## Quando evitar
Em mercados muito finos, no meio de notícias ou quando o spread está anormalmente largo.`,
      example: `Vês bid 39.000 / ask 39.001 e envias uma compra a mercado: executas a **39.001** (ou pior, se o mercado se mexer ao mesmo tempo).`,
      takeaways: ["Ordem a mercado = execução imediata, preço incerto.", "Pagas o spread e podes ter slippage.", "Evita-a quando a liquidez é fraca ou o spread está alargado."],
      quiz: [
        mc("Qual é a garantia de uma ordem a mercado?", ["Preço exato", "Execução imediata (quase certa)", "Zero custos", "Lucro"], 1, "Execução imediata, mas sem garantia de preço."),
        tf("Uma ordem a mercado de compra executa ao bid.", false, "Compras ao ask."),
        mc("Quando é mais arriscado usar ordens a mercado?", ["Em mercado líquido e calmo", "Durante notícias de alto impacto", "Nunca", "Só ao domingo"], 1, "Durante notícias o spread alarga e o preço move-se depressa: maior slippage."),
      ],
    },
    {
      slug: "limit-order",
      title: "Limit order",
      summary: "Executa ao preço que definiste (ou melhor) — se o mercado lá chegar.",
      minutes: 3,
      content: `Uma **ordem limite** só executa ao **preço indicado ou melhor**.

- **Buy limit:** abaixo do preço atual (compras mais barato);
- **Sell limit:** acima do preço atual (vendes mais caro);
- **Vantagem:** controlas o preço; muitas vezes poupas o spread;
- **Desvantagem:** **pode nunca ser executada** (o preço pode tocar quase no teu nível e inverter), e podes ficar de fora de um movimento.

## Uso comum
Entrar numa zona de interesse com antecedência, ou **take profit** (o alvo é uma ordem limite).`,
      example: `Preço a 39.050 e queres comprar uma correção a **39.000**: colocas uma *buy limit* a 39.000. Se o preço descer e tocar, executas a 39.000 ou melhor. Se subir sem lá chegar, **a ordem não executa** — o preço ficou "perto", mas sem execução.`,
      takeaways: ["Limit = preço controlado, execução não garantida.", "Buy limit abaixo do mercado; sell limit acima.", "O take profit é, na prática, uma ordem limite."],
      quiz: [
        mc("Uma buy limit coloca-se…", ["Acima do preço atual", "Abaixo do preço atual", "Exatamente no preço atual", "Em qualquer lado"], 1, "Buy limit: abaixo do preço atual, para comprar mais barato."),
        tf("Uma ordem limite garante sempre a execução.", false, "Só executa se o mercado atingir o preço indicado."),
        mc("Qual é a principal vantagem de uma ordem limite?", ["Executar sempre", "Controlar o preço de execução", "Eliminar o risco", "Evitar o stop"], 1, "Controlas o preço, à custa de poder não executar."),
      ],
    },
    {
      slug: "stop-order",
      title: "Stop order",
      summary: "Ativa-se quando o preço toca um nível — e depois executa a mercado.",
      minutes: 4,
      content: `Uma **ordem stop** fica inativa até o preço **tocar o nível de stop**; nessa altura é enviada como **ordem a mercado** (stop-market) ou como **ordem limite** (stop-limit).

- **Sell stop:** abaixo do mercado — para **sair** de uma compra (stop loss) ou entrar curto num rompimento para baixo;
- **Buy stop:** acima do mercado — para sair de uma venda ou entrar longo num rompimento para cima.

## Riscos
- **Slippage** em stop-market: executa ao melhor preço disponível *depois* de tocado;
- **Stop-limit:** pode **não executar** se o preço saltar o limite — protege o preço, mas não garante a saída;
- **Stop hunting/sweeps:** os preços podem tocar zonas óbvias de stop e inverter (ver módulo Liquidity).

## Quando usar
Para **proteger** uma posição (stop loss) ou para **entrar apenas quando** o mercado confirmar uma direção.`,
      example: `Longo a 39.000, **sell stop** em 38.950. Se o preço tocar 38.950, é enviada uma ordem a mercado para vender: executa ao melhor preço disponível (pode ser 38.950 ou pior).`,
      takeaways: ["Stop = ordem condicional ativada pelo toque num nível.", "Stop-market garante saída, não o preço; stop-limit o inverso.", "Pode ser usada para proteger ou para entrar em rompimentos."],
      quiz: [
        mc("Uma sell stop coloca-se…", ["Acima do mercado", "Abaixo do mercado", "No preço atual", "Em qualquer lado"], 1, "Sell stop: abaixo do mercado (para sair de longos ou entrar curto em rompimentos para baixo)."),
        mc("Qual é o risco de uma stop-limit?", ["Slippage ilimitado", "Pode não executar se o preço saltar o limite", "Custos fixos", "Nenhum"], 1, "A parte 'limit' pode impedir a execução num gap."),
        tf("Uma stop-market garante o preço de execução.", false, "Garante (quase) a execução depois de tocada, mas não o preço."),
      ],
    },
    {
      slug: "stop-loss",
      title: "Stop Loss",
      summary: "O nível onde a tua ideia fica invalidada — e onde a perda é aceite.",
      minutes: 5,
      content: `O **Stop Loss (SL)** é uma ordem que fecha a posição se o preço atingir um nível **onde a tua ideia fica invalidada**.

## Boas práticas (conceitos)
- Coloca-o num nível **técnico** (além de uma estrutura/zona que, se rompida, invalida a tese) — **não** num valor arbitrário em dólares;
- Define-o **antes** de entrar e **não o afastes** a meio da operação;
- A distância ao stop **determina o tamanho** da posição (e não o contrário);
- Considera o spread e o slippage: stops "colados" ao preço são varridos facilmente.

## O que o stop não faz
Não **garante** a perda máxima: com slippage ou gaps o prejuízo pode ser maior (existem *stops garantidos* em alguns CFDs, normalmente com custo).

## Perguntas a responder
"O que me diz que estou errado? A que distância? Quanto custa essa distância em dólares com o meu tamanho?"`,
      example: `Longo YM a **39.000**; a estrutura invalida abaixo de **38.950**.
- Distância: **50 pontos**
- Risco por YM: 50 × $5 = **$250**
- Risco por MYM: 50 × $0,50 = **$25**
Se o teu orçamento por trade é **$100**: cabem **4 MYM** ($100) ou **0 YM** (1 YM arriscaria $250).`,
      exercise: { kind: "calculator", tool: "position-size", prompt: "Conta $10.000, risco 1%, entrada 39.000, stop 38.950. Quantos MYM cabem no orçamento?" },
      takeaways: ["O stop marca onde a ideia é invalidada, não um valor em dólares arbitrário.", "A distância ao stop determina o tamanho da posição.", "O stop não elimina slippage nem gaps."],
      quiz: [
        mc("Onde deve ser colocado o stop loss?", ["Num valor em dólares que 'dê jeito'", "Num nível técnico que, se rompido, invalida a ideia", "Sempre a 10 pontos", "Depois de entrar, quando perder"], 1, "O stop deve estar onde a tese é invalidada, definido antes da entrada."),
        num("Conta $10.000, risco 1% ($100), MYM, stop a 50 pontos. Quantos contratos cabem?", 4, 0, "contratos", "Risco por MYM = 50 × $0,50 = $25 → $100 ÷ $25 = 4.", "POSITION_SIZE"),
        tf("Mover o stop para mais longe a meio da operação é uma boa forma de 'dar espaço'.", false, "Afastar o stop aumenta o risco para além do plano; é um erro de disciplina clássico."),
      ],
    },
    {
      slug: "take-profit",
      title: "Take Profit",
      summary: "O alvo planeado e a relação risco/retorno.",
      minutes: 5,
      content: `O **Take Profit (TP)** é a ordem que fecha a posição com lucro num nível-alvo predefinido (normalmente uma ordem **limite**).

## Como escolher o alvo
- Em **níveis com sentido técnico**: um swing anterior, uma zona de suporte/resistência, uma extensão de Fibonacci;
- Em função da **relação risco/retorno (R:R)** mínima que a tua estratégia exige;
- Confirmando que existe **espaço** até ao alvo (sem obstáculos óbvios a meio).

## R:R
**R:R = distância ao alvo ÷ distância ao stop.** Com R:R de 2:1 precisas de acertar em **mais de 1 em cada 3** trades para ficares em equilíbrio (antes de custos). Com 1:1, em mais de 1 em 2.

## Gestão
Pode-se sair em parcelas, mover o stop para breakeven ou usar *trailing stop* — tudo isto é **gestão de trade** (módulo 18) e deve ser **planeado antes**.`,
      example: `Entrada **39.000**, stop **38.950** (50 pts), alvo **39.100** (100 pts) → **R:R = 2:1**.
Break-even de win rate = 1 ÷ (1 + 2) = **33,3%**. Se perderes 2 e ganhares 1 em 3 trades: −1R −1R +2R = **0R** (sem custos).`,
      exercise: { kind: "calculator", tool: "rr", prompt: "Testa um trade: entrada 39.000, stop 38.950, alvo 39.100. Qual é o R:R e a taxa de acerto mínima?" },
      takeaways: ["O alvo deve ter sentido técnico e espaço livre até lá.", "R:R = distância ao alvo ÷ distância ao stop.", "Quanto maior o R:R, menor a taxa de acerto necessária (mas o alvo tem de ser realista)."],
      quiz: [
        num("Entrada 39.000, stop 38.950, alvo 39.100. Qual é o R:R?", 2, 0.01, ":1", "Alvo 100 pts ÷ stop 50 pts = 2.", "CALCULATE_RR"),
        num("Com R:R de 3:1, qual é a taxa de acerto mínima (em %) para empatar, ignorando custos?", 25, 0.5, "%", "1 ÷ (1 + 3) = 25%.", "NUMERIC"),
        mc("Que cuidado se deve ter ao escolher o alvo?", ["Escolher o mais distante possível", "Ter sentido técnico e espaço livre até lá", "Ignorar o stop", "Usar sempre 100 pontos"], 1, "O alvo deve ter lógica técnica e não encontrar obstáculos óbvios no caminho."),
      ],
    },
  ],
  quiz: {
    title: "Quiz do módulo — Trading Foundations",
    passScore: 70,
    questions: [
      mc("O que é o US30 na maioria das plataformas de CFDs?", ["O contrato YM do CME", "Um CFD sobre o Dow Jones", "Um ETF", "Uma ação"], 1, "US30 é o nome comum do CFD sobre o Dow; o símbolo e as especificações variam por broker."),
      num("Quanto vale 1 ponto do Dow num YM e num MYM, respetivamente? (Indica o valor do YM.)", 5, 0, "$", "YM = $5 por ponto; MYM = $0,50 por ponto."),
      mc("Qual é o tick do YM?", ["0,25 pontos", "1 ponto", "5 pontos", "0,1 pontos"], 1, "O YM tem tick de 1 ponto ($5)."),
      mc("Qual afirmação sobre margem em futuros é correta?", ["É o custo do contrato", "É um depósito de garantia e não limita a perda máxima", "É igual para sempre", "É definida pelo trader"], 1, "A margem é um depósito de garantia que pode mudar; as perdas podem exceder a margem."),
      num("Conta de $10.000 com 1 YM a 39.000 (nocional $195.000). Qual é a alavancagem efetiva?", 19.5, 0.05, "×", "195.000 ÷ 10.000 = 19,5×."),
      tf("O spread é um custo implícito pago ao entrar numa posição.", true, "Compras ao ask e vendes ao bid; começas ligeiramente negativo."),
      mc("Que tipo de ordem é mais exposta a slippage num pico de volatilidade?", ["Limite", "Stop (vira ordem a mercado)", "Nenhuma", "Todas igual"], 1, "O stop converte-se em ordem a mercado quando tocado."),
      tf("Uma ordem limite garante sempre execução.", false, "Só executa se o preço for atingido."),
      num("Compras 2 MYM a 39.000 com stop em 38.960. Qual é o risco em dólares (sem custos)?", 40, 0, "$", "40 pontos × $0,50 × 2 = $40.", "POSITION_SIZE"),
      num("Entrada 39.000, stop 38.960, alvo 39.080. Qual é o R:R?", 2, 0.01, ":1", "Alvo 80 ÷ stop 40 = 2.", "CALCULATE_RR"),
    ],
  },
};
