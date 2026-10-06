import { chart, mc, num, tf } from "../dsl";
import type { ModuleDef } from "../types";

/**
 * Module 03 — Reading Candles (Level 2).
 * Pattern illustrations are hand-made OHLC tuples: didactic shapes, never market data.
 */
export const readingCandles: ModuleDef = {
  slug: "reading-candles",
  number: 3,
  level: 2,
  title: "Reading Candles",
  summary: "OHLC, corpo e pavios, range e volatilidade (ATR) — e depois pin bar, engolfo, inside bar, rompimento e exaustão. Sempre com a regra: candle + contexto = informação.",
  difficulty: "BEGINNER",
  icon: "CandlestickChart",
  lessons: [
    {
      slug: "anatomia-do-candle",
      title: "Anatomia de um candle: OHLC, corpo e pavios",
      summary: "O que cada parte do candle diz sobre a luta entre compradores e vendedores num período.",
      minutes: 6,
      content: `Cada candle resume **um período de tempo** (1 minuto, 15 minutos, 1 hora, 1 dia…) em quatro preços — o **OHLC**:

- **Open** (abertura): o primeiro preço negociado no período;
- **High** (máximo): o preço mais alto atingido;
- **Low** (mínimo): o preço mais baixo atingido;
- **Close** (fecho): o último preço negociado.

## Corpo e pavios
- O **corpo** vai da abertura ao fecho. Mostra **onde o período acabou face a onde começou**;
- Os **pavios** (*wicks* ou *shadows*) vão do corpo ao máximo e ao mínimo. Mostram **preços que foram visitados e depois rejeitados**.

## Bullish e bearish
- **Bullish (de alta):** fecha **acima** da abertura;
- **Bearish (de baixa):** fecha **abaixo** da abertura.

(A cor depende da plataforma — verde/vermelho, branco/preto. Lê sempre a legenda do teu gráfico.)

## O que se lê
- **Corpo grande, pavios pequenos:** um lado dominou o período;
- **Corpo pequeno, pavios longos:** houve movimento nos dois sentidos, mas o fecho ficou perto da abertura — indecisão ou rejeição;
- O **range do candle** é máximo − mínimo e mede a **amplitude** do período.

> Um candle é um **resumo**. Não mostra o que aconteceu dentro do período (o preço pode ter subido primeiro e descido depois, ou vice-versa).`,
      example: `Um candle de 15 minutos no Dow: **Open 39.000, High 39.060, Low 38.980, Close 39.040**.

- É **bullish** (fechou 40 pontos acima da abertura);
- **Corpo** = 40 pontos; **pavio superior** = 39.060 − 39.040 = 20 pontos; **pavio inferior** = 39.000 − 38.980 = 20 pontos;
- **Range** = 39.060 − 38.980 = **80 pontos**.

O mercado foi visitar 38.980 e 39.060, mas aceitou fechar perto do máximo.`,
      visual: { kind: "diagram", id: "candle-anatomy", caption: "Anatomia de um candle bullish e de um candle bearish." },
      takeaways: ["OHLC: abertura, máximo, mínimo e fecho resumem um período.", "O corpo mostra o fecho face à abertura; os pavios mostram preços visitados e rejeitados.", "Um candle resume o período — não mostra a ordem em que o preço se moveu lá dentro."],
      quiz: [
        mc("Um candle é bullish quando…", ["Fecha acima da abertura", "Tem pavios longos", "O range é grande", "Abre no mínimo do dia"], 0, "Bullish = close > open. A cor concreta depende da plataforma."),
        num("Open 39.000, High 39.060, Low 38.980, Close 39.040. Qual é o range do candle, em pontos?", 80, 0, "pontos", "Range = máximo − mínimo = 39.060 − 38.980 = 80 pontos."),
        mc("Um corpo pequeno com pavios longos para os dois lados sugere…", ["Domínio claro de compradores", "Movimento nos dois sentidos com fecho perto da abertura (indecisão/rejeição)", "Erro dos dados", "Fecho de mercado"], 1, "O preço visitou extremos e voltou: nenhum lado conseguiu impor o fecho."),
        tf("Um candle mostra a ordem exata pela qual o preço se moveu dentro do período.", false, "O candle só resume OHLC; não revela a sequência intra-período."),
      ],
    },
    {
      slug: "range-volatilidade-e-atr",
      title: "Range, volatilidade e ATR",
      summary: "Como medir o 'tamanho normal' de um candle e porque isso decide stops e expectativas.",
      minutes: 7,
      content: `**Volatilidade** é a amplitude típica com que o preço se move. Uma mesma ideia pode exigir um stop de 30 pontos num dia calmo e de 120 num dia agitado — por isso é útil medir a volatilidade em vez de a adivinhar.

## True Range e ATR
- **True Range (TR)** de um candle = o maior de:
  1. máximo − mínimo;
  2. |máximo − fecho anterior|;
  3. |mínimo − fecho anterior|.

  Os pontos 2 e 3 incluem os **gaps** entre candles.
- **ATR (*Average True Range*)** é uma média (normalmente de 14 períodos, com suavização) do TR. Mede a **amplitude média por candle**.

O ATR **não** diz a direção. Diz só **quanto o preço costuma mexer**.

## Para que serve
- **Comparar candles:** um candle com corpo de 2,5× o ATR é invulgarmente forte; um com 0,3× é pequeno;
- **Dimensionar stops e alvos:** um stop mais curto do que o "ruído" normal do mercado tende a ser atingido por movimentos banais;
- **Perceber o regime:** ATR a subir = mercado mais agitado; a descer = mais calmo.

> O ATR é uma ferramenta descritiva. Não prevê rompimentos nem garante que o stop "seguro" é 1,5× ATR — essa regra é só um ponto de partida a testar.`,
      example: `Os ranges dos últimos 5 candles de 15 minutos: **40, 55, 35, 60, 50** pontos. Uma média simples dá **48 pontos** — um ATR intuitivo.

Agora um caso com gap: o fecho anterior foi **39.000** e o candle seguinte abre em 39.060 com máximo **39.080** e mínimo **39.050**.
- máximo − mínimo = 30; |máximo − fecho anterior| = **80**; |mínimo − fecho anterior| = 50.
- **TR = 80** (o gap conta).

Se o ATR é ≈ 48 pontos, um stop de 20 pontos está bem **abaixo do ruído normal** de um candle.`,
      takeaways: ["Volatilidade = amplitude típica dos movimentos; o ATR mede-a sem indicar direção.", "O True Range inclui os gaps entre candles.", "Stops e alvos devem ser pensados face à volatilidade, não em números arbitrários."],
      quiz: [
        mc("O que mede o ATR?", ["A direção da tendência", "A amplitude média dos candles", "O volume", "O spread"], 1, "O ATR é a média do true range: quanto o preço costuma mexer por candle, sem dar direção."),
        num("O fecho anterior foi 39.000. O candle seguinte tem máximo 39.080 e mínimo 39.050. Qual é o True Range, em pontos?", 80, 0, "pontos", "O maior entre 30 (H−L), 80 (|H−fecho anterior|) e 50 (|L−fecho anterior|) é 80."),
        tf("Um ATR alto garante que o preço vai subir.", false, "O ATR só mede amplitude; não prevê direção."),
        mc("Se o ATR de 15 min é ≈ 50 pontos, um stop de 15 pontos é…", ["Provavelmente largo demais", "Provavelmente apertado face ao ruído normal do mercado", "Sempre ideal", "Irrelevante"], 1, "Stops bem abaixo do ruído normal tendem a ser atingidos por oscilações banais."),
      ],
    },
    {
      slug: "candle-mais-contexto",
      title: "Candle + contexto = informação",
      summary: "O mesmo candle significa coisas diferentes em sítios diferentes — e porque nenhum padrão é um sinal por si só.",
      minutes: 6,
      content: `Há uma regra que atravessa tudo o que vem a seguir:

> **Candle + contexto = informação.** Um candle sozinho é apenas um desenho.

## Contexto significa…
- **Tendência e estrutura** à volta (estás num impulso, num recuo, num range?);
- **Localização:** o candle formou-se num nível relevante (suporte, resistência, zona) ou no "meio do nada"?;
- **Volatilidade:** é grande ou pequeno face ao ATR?;
- **Momento do dia:** abertura, notícia, hora de baixa liquidez;
- **O que veio antes e o que vem depois:** a confirmação.

## O erro clássico
Aprender uma lista de padrões e **procurá-los em todo o lado**. Os padrões aparecem constantemente; a maioria não significa nada. Os que merecem atenção são os que surgem **no sítio certo, com o contexto certo e com confirmação**.

## Como pensar em probabilidades
Um padrão pode **ligeiramente alterar** a probabilidade de um cenário, não a transforma em certeza. Por isso, mesmo num bom contexto, tens sempre de definir **invalidação** (onde a ideia deixa de fazer sentido) e **risco**.

## Perguntas úteis
1. Onde estou? (contexto e timeframe superior)
2. O que o preço está a fazer? (impulso, correção, indecisão)
3. Este candle está num sítio relevante?
4. O que o confirma? O que o invalida?`,
      example: `O mesmo candle — corpo pequeno, pavio inferior longo:

- **Depois de uma queda, a tocar num suporte testado várias vezes**, mostra que o preço foi empurrado para baixo e **rejeitado**: merece atenção;
- **No meio de um range, sem nível por perto**, é ruído: não há contexto que lhe dê significado.

A forma é idêntica. A **informação** é completamente diferente.`,
      visual: { kind: "scenario", scenarioId: "levels-range-01", annotations: "none", caption: "Os mesmos candles ganham ou perdem importância consoante estejam junto a um nível relevante ou no meio do range." },
      takeaways: ["Um padrão de candle sem contexto é só um desenho.", "Contexto = estrutura, localização, volatilidade, momento do dia e confirmação.", "Mesmo no melhor contexto, define invalidação e risco: nada é certo."],
      quiz: [
        mc("Qual é a melhor forma de usar um padrão de candle?", ["Entrar sempre que aparece", "Avaliá-lo no contexto: estrutura, nível, volatilidade e confirmação", "Ignorá-lo sempre", "Só usá-lo em timeframes de 1 minuto"], 1, "O padrão só ganha significado com contexto e confirmação."),
        tf("Se um padrão aparece num gráfico, o preço vai inverter.", false, "Nenhum padrão garante nada; apenas pode alterar ligeiramente a probabilidade de um cenário."),
        chart("CHART_ANALYSIS", "levels-range-01", "Neste gráfico, qual é a leitura mais prudente de um candle de rejeição que aparece a meio do range, longe de qualquer nível?", ["É um sinal forte de reversão", "Tem pouca informação por estar longe de um nível relevante", "Obriga a entrar de imediato", "Garante um rompimento"], 1, "Longe de níveis relevantes, o candle tem pouco contexto e portanto pouca informação."),
      ],
    },
    {
      slug: "pin-bar-e-rejeicao",
      title: "Pin bar e candles de rejeição",
      summary: "Um pavio longo mostra preço rejeitado — mas só interessa se estiver num sítio com sentido.",
      minutes: 7,
      content: `Um **candle de rejeição** tem um **pavio longo** face ao corpo: o preço foi a um extremo e foi **empurrado de volta** antes do fecho.

## Pin bar
O **pin bar** é o exemplo mais conhecido:
- **Pavio longo** numa direção (normalmente pelo menos 2× a 3× o corpo);
- **Corpo pequeno**, perto de uma das pontas;
- **Pavio curto** (ou ausente) do outro lado.

Um pin bar com **pavio inferior longo** mostra preços baixos rejeitados; com **pavio superior longo**, preços altos rejeitados.

## O que ele diz — e o que não diz
- **Diz:** durante esse período, o mercado tentou um extremo e não o aceitou;
- **Não diz:** que o próximo candle vai na direção contrária. É **uma observação**, não uma previsão.

## Como o usar com cabeça
1. **Localização:** só merece atenção junto a um nível/zona relevante;
2. **Contexto:** a favor ou contra a estrutura do timeframe superior?;
3. **Confirmação:** um candle seguinte que fecha na direção da rejeição, ou um rompimento do corpo/mínimo do pin bar, reduz a dependência de um único candle;
4. **Invalidação:** o extremo do pavio é um ponto natural para a invalidação — se for ultrapassado, a rejeição falhou.

> Pavios longos também aparecem em dias de notícias, aberturas e em momentos de pouca liquidez, sem significado técnico. Contexto primeiro.`,
      example: `Depois de uma queda, o preço toca **39.000** (suporte já testado) e forma um pin bar: abertura 39.020, mínimo **38.930**, fecho 39.030. O pavio inferior tem **90 pontos** e o corpo apenas 10.

Uma abordagem educativa: esperar um candle de **confirmação** a fechar acima do máximo do pin bar. A ideia fica **invalidada** se o preço fechar abaixo de 38.930. Se a invalidação estiver a **100 pontos** da entrada, o tamanho da posição tem de refletir essa distância — não o desejo de ganhar.`,
      visual: {
        kind: "candles",
        candles: [
          [39200, 39215, 39150, 39160],
          [39160, 39170, 39100, 39110],
          [39110, 39120, 39045, 39055],
          [39055, 39065, 39005, 39015],
          [39020, 39035, 38930, 39030],
          [39030, 39090, 39025, 39080],
          [39080, 39120, 39070, 39110],
        ],
        overlays: [
          { type: "hline", id: "sup", price: 39000, label: "Suporte (exemplo)", tone: "success", dashed: true },
          { type: "marker", id: "pin", index: 4, price: 38930, label: "Pin bar", placement: "below", tone: "primary" },
        ],
        caption: "Pin bar com pavio inferior longo junto a um suporte.",
        height: 300,
      },
      takeaways: ["Pavio longo = preço visitado e rejeitado nesse período.", "O pin bar só merece atenção num sítio relevante, com contexto e confirmação.", "O extremo do pavio é um ponto natural de invalidação."],
      quiz: [
        mc("O que caracteriza um pin bar?", ["Corpo enorme", "Pavio longo numa direção e corpo pequeno", "Dois pavios iguais", "Ausência de range"], 1, "Um pavio longo face ao corpo mostra rejeição de um extremo."),
        tf("Um pin bar garante que o preço vai na direção oposta ao pavio.", false, "Mostra rejeição naquele período; o seguinte pode fazer qualquer coisa."),
        mc("Onde é razoável colocar a invalidação de uma ideia baseada num pin bar de pavio inferior?", ["No meio do corpo", "Abaixo do extremo do pavio", "Dez pontos acima da entrada", "Não é preciso invalidação"], 1, "Se o preço ultrapassa o extremo rejeitado, a rejeição falhou."),
        num("Pin bar com abertura 39.020, mínimo 38.930 e fecho 39.030. Qual é o tamanho do pavio inferior, em pontos?", 90, 0, "pontos", "Pavio inferior = menor de (abertura, fecho) − mínimo = 39.020 − 38.930 = 90."),
      ],
    },
    {
      slug: "engolfo-e-inside-bar",
      title: "Engolfo e inside bar",
      summary: "Dois padrões de dois candles: um mostra mudança de domínio, o outro compressão.",
      minutes: 7,
      content: `## Engolfo (*engulfing*)
Um candle cujo **corpo cobre por completo o corpo do candle anterior**, na direção oposta.

- **Engolfo bullish:** candle de alta cujo corpo engloba o corpo do candle de baixa anterior;
- **Engolfo bearish:** o inverso.

Mostra que, nesse período, **um lado dominou o que o outro tinha feito no anterior**. Ganha peso junto a níveis relevantes, depois de um movimento que o precede, e com **confirmação**. Em meio de ruído, é só mais um desenho.

## Inside bar
Um candle cujo **máximo e mínimo ficam dentro do range do candle anterior** (a "barra-mãe").

- Indica **compressão**: o mercado parou para respirar;
- Um **rompimento** do máximo ou do mínimo da barra-mãe pode sinalizar o fim da pausa — mas **também pode falhar** (rompimento falso).

## Como pensar
- Os dois padrões descrevem **comportamento**, não o futuro;
- Pergunta: **o contexto sustenta este cenário?** (estrutura, nível, volatilidade);
- Define **invalidação** e **risco** antes de qualquer ideia — por exemplo, o extremo oposto da barra-mãe;
- Ver muitos inside bars seguidos numa zona de indecisão não é um sinal: é **falta de informação**.`,
      example: `**Engolfo bullish** após uma pequena descida: o candle anterior abriu em 39.110 e fechou em 39.090 (corpo pequeno de baixa). O candle seguinte abre em **39.080**, fecha em **39.155** — o corpo (75 pontos) cobre por completo o corpo anterior (20 pontos).

**Inside bar:** a barra-mãe tem range 38.990–39.100. O candle seguinte (39.020–39.095) fica **inteiramente dentro**. Rompimento acima de 39.100 ou abaixo de 38.990 marca o fim da compressão — ou uma armadilha, se o preço voltar.`,
      visual: {
        kind: "candles",
        candles: [
          [39200, 39210, 39160, 39170],
          [39170, 39180, 39130, 39140],
          [39140, 39150, 39100, 39110],
          [39110, 39120, 39080, 39090],
          [39080, 39160, 39075, 39155],
          [39155, 39190, 39150, 39185],
        ],
        overlays: [{ type: "marker", id: "eng", index: 4, price: 39075, label: "Engolfo", placement: "below", tone: "success" }],
        caption: "Engolfo bullish: o corpo do candle 5 cobre por completo o corpo do candle 4.",
        height: 280,
      },
      takeaways: ["Engolfo: o corpo cobre por completo o corpo anterior, na direção oposta.", "Inside bar: o candle fica dentro do range do anterior — compressão, não direção.", "Ambos descrevem comportamento; contexto, confirmação e invalidação decidem se merecem atenção."],
      quiz: [
        mc("O que é um inside bar?", ["Um candle com range maior que o anterior", "Um candle cujo máximo e mínimo ficam dentro do range do candle anterior", "Um candle sem pavios", "Um candle noturno"], 1, "É uma barra de compressão contida no range da barra-mãe."),
        tf("Um engolfo bullish garante subida.", false, "É um padrão de comportamento; precisa de contexto e confirmação, e pode falhar."),
        mc("Qual é uma invalidação razoável numa ideia de rompimento acima de um inside bar?", ["Nenhuma", "Fecho abaixo do mínimo da barra-mãe", "Fecho acima da abertura", "Quando o volume subir"], 1, "O extremo oposto da barra-mãe é um ponto natural de invalidação."),
      ],
    },
    {
      slug: "rompimento-e-exaustao",
      title: "Candles de rompimento e de exaustão",
      summary: "Corpo grande a fechar fora do range e o 'último esticão' com pavio longo — e o cuidado com ambos.",
      minutes: 7,
      content: `## Candle de rompimento (*breakout candle*)
Um candle com **corpo grande** (bem acima do ATR) que **fecha fora de uma zona de consolidação**, com pavios pequenos.

- Mostra **convicção** nesse período — um lado dominou;
- **Não garante continuação**: muitos rompimentos falham (voltam para dentro) — são os **rompimentos falsos**;
- O **fecho** conta mais do que um pavio que ultrapassou o nível e voltou.

## Candle de exaustão (*exhaustion candle*)
Depois de uma sequência de candles na mesma direção, surge um candle com:
- **range grande** e **pavio longo** na direção do movimento;
- corpo pequeno, a fechar longe do extremo.

Sugere que, naquele período, **não houve quem continuasse a empurrar** o preço até ao extremo. É uma **hipótese**: o movimento pode estar cansado — ou pode ser apenas uma pausa antes de continuar.

## O que fazer com isto
- Mede o candle com o **ATR**: é realmente grande ou só o parece?
- Vê **onde** aparece (perto de um nível, depois de um esticão longo?);
- Procura **confirmação** no candle seguinte; sem ela, é só um candle;
- Planeia a **invalidação** (por exemplo, o extremo do candle) e o risco.

> Rompimentos e exaustões são duas faces do mesmo problema: **distinguir continuação de reversão**. Ninguém acerta sempre; por isso se gere o risco.`,
      example: `Consolidação entre 38.990 e **39.050**. Um candle abre a 39.030 e fecha a **39.150**, com pavios curtos: corpo de 120 pontos, mais de **2× o ATR** (≈ 50). É um candle de rompimento — mas só um bom cenário se o preço **mantiver** a zona acima de 39.050 depois (reteste).

Noutro gráfico, depois de 5 candles de alta seguidos, surge um com máximo a **39.330**, abertura 39.225 e fecho **39.235**: pavio superior de 95 pontos. Pode indicar exaustão — ou ser só uma pausa. A confirmação decide.`,
      visual: {
        kind: "candles",
        candles: [
          [39000, 39040, 38990, 39020],
          [39020, 39050, 39000, 39010],
          [39010, 39045, 38995, 39035],
          [39035, 39050, 39000, 39015],
          [39015, 39045, 38995, 39030],
          [39030, 39160, 39025, 39150],
          [39150, 39185, 39120, 39170],
        ],
        overlays: [
          { type: "hline", id: "res", price: 39050, label: "Resistência do range", tone: "danger", dashed: true },
          { type: "marker", id: "bo", index: 5, price: 39160, label: "Rompimento", placement: "above", tone: "primary" },
        ],
        caption: "Candle de corpo grande a fechar acima da resistência do range.",
        height: 280,
      },
      takeaways: ["Rompimento: corpo grande (face ao ATR) a fechar fora da consolidação — mas pode falhar.", "Exaustão: range grande com pavio longo depois de uma sequência — uma hipótese, não uma certeza.", "Confirma, mede com o ATR e define invalidação antes de pensar em risco."],
      quiz: [
        mc("O que é um 'rompimento falso'?", ["Um rompimento que se mantém", "Um rompimento do nível que volta para dentro do range", "Um gap de abertura", "Um erro de dados"], 1, "Quando o preço ultrapassa um nível mas não se mantém e regressa ao range."),
        tf("Um candle de exaustão confirma sempre uma reversão.", false, "É uma hipótese; o movimento pode retomar."),
        mc("Como pode o ATR ajudar a identificar um candle de rompimento?", ["Dizendo a direção", "Comparando o tamanho do corpo com a amplitude normal", "Calculando o volume", "Indicando o spread"], 1, "Um corpo bem acima do ATR é invulgarmente forte."),
        chart("IDENTIFY_SUPPORT_RESISTANCE", "levels-range-01", "Neste gráfico, que nível seria uma referência razoável para avaliar se um candle de rompimento é credível?", ["Qualquer preço do meio do range", "A zona de resistência claramente testada", "O primeiro candle do gráfico", "Um número redondo qualquer"], 1, "Rompimentos fazem sentido face a níveis claros, testados várias vezes."),
      ],
    },
  ],
  quiz: {
    title: "Quiz do módulo — Reading Candles",
    passScore: 70,
    questions: [
      mc("O que representa o corpo de um candle?", ["O máximo e o mínimo", "A distância entre a abertura e o fecho", "O volume", "O spread"], 1, "O corpo vai da abertura ao fecho; os pavios mostram os extremos visitados."),
      num("Open 39.100, High 39.140, Low 39.060, Close 39.090. Qual é o range, em pontos?", 80, 0, "pontos", "Range = 39.140 − 39.060 = 80 pontos."),
      num("Fecho anterior 39.000; candle com máximo 39.090 e mínimo 39.060. Qual é o True Range, em pontos?", 90, 0, "pontos", "|máximo − fecho anterior| = 90 é o maior entre 30, 90 e 60."),
      mc("Qual destas frases resume a regra desta lição?", ["Padrões garantem direção", "Candle + contexto = informação", "Os pavios não importam", "Só os candles de 1 minuto contam"], 1, "O padrão isolado é só um desenho; contexto e confirmação dão-lhe significado."),
      tf("Um pin bar num sítio sem qualquer nível relevante tem tanto peso como um num suporte testado várias vezes.", false, "A localização é parte do contexto: junto a um nível relevante a rejeição tem mais informação."),
      mc("Um candle fica totalmente dentro do range do anterior. Chama-se…", ["Engolfo", "Inside bar", "Pin bar", "Gap"], 1, "Máximo e mínimo contidos no candle anterior = inside bar (compressão)."),
      chart("IDENTIFY_TREND", "structure-bull-01", "Qual é o contexto de tendência neste gráfico, que ajudaria a avaliar um padrão de candles?", ["Tendência de baixa", "Tendência de alta (máximos e mínimos mais altos)", "Sem estrutura nenhuma", "Impossível saber"], 1, "A sequência de HH/HL define estrutura de alta, contexto para avaliar padrões."),
      chart("CHART_ANALYSIS", "structure-range-01", "Num mercado lateral como este, um candle de rompimento deve ser lido…", ["Como confirmação automática de nova tendência", "Com cautela: pode ser um rompimento falso", "Como erro dos dados", "Como sinal de compra"], 1, "Em ranges, os rompimentos falsos são comuns; confirmação e contexto contam."),
      mc("Qual é uma invalidação razoável de uma ideia baseada num candle de rejeição inferior?", ["O preço ultrapassar o extremo do pavio", "O preço subir 10 pontos", "A hora do dia mudar", "Nenhuma"], 0, "Se o extremo rejeitado for ultrapassado, a hipótese de rejeição falhou."),
      num("ATR de 15 min = 50 pontos. Um candle com corpo de 125 pontos tem quantos ATR?", 2.5, 0.01, "×", "125 ÷ 50 = 2,5 ATR: um candle invulgarmente forte."),
    ],
  },
};
