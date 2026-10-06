import { chart, mc, num, tf } from "../dsl";
import type { ModuleDef } from "../types";

/** Module 04 — Trend & Multi-Timeframe Analysis (Level 2). */
export const trend: ModuleDef = {
  slug: "trend",
  number: 4,
  level: 2,
  title: "Trend & Multi-Timeframe",
  summary: "Tendência de alta, de baixa e lateral; força, continuação e exaustão; linhas de tendência e canais; e análise multi-timeframe (sem fórmulas universais).",
  difficulty: "BEGINNER",
  icon: "TrendingUp",
  lessons: [
    {
      slug: "o-que-e-uma-tendencia",
      title: "O que é uma tendência (e quando é lateral)",
      summary: "Tendência de alta, de baixa e lateral definidas pelo comportamento dos swings — sempre relativas a um timeframe.",
      minutes: 6,
      content: `Uma **tendência** é uma **direção dominante do preço** durante um período, e não uma linha mágica. Define-se pelo comportamento dos **swings** (os pontos de viragem do preço):

- **Tendência de alta (*uptrend*):** sequência de **máximos mais altos (HH)** e **mínimos mais altos (HL)**;
- **Tendência de baixa (*downtrend*):** **máximos mais baixos (LH)** e **mínimos mais baixos (LL)**;
- **Lateral (*sideways / range*):** máximos e mínimos sobrepostos, sem progressão clara — o preço oscila entre uma zona de cima e uma de baixo.

(O módulo 7 aprofunda a estrutura de mercado. Aqui interessa a ideia geral.)

## Duas verdades importantes
1. **A tendência depende do timeframe.** O mesmo mercado pode estar em alta no diário, lateral no H1 e em baixa no M5. Não há uma tendência "verdadeira" — há uma por cada escala;
2. **Tendência é uma descrição do passado recente**, não uma garantia. Mudam, esgotam-se, invertem-se.

## Porque importa
Operar **a favor** do contexto dominante tende a exigir menos "esforço" do preço do que operar contra ele — mas isso não elimina o risco, nem torna cada trade a favor num vencedor. Operar contra a tendência é legítimo se for uma **decisão consciente**, com razões e risco definidos.

> Não se "adivinha" a tendência: **descreve-se**. O que as últimas oscilações estão a fazer?`,
      example: `No gráfico de alta acima, os máximos vão subindo (38.240 → 38.420 → 38.610 → 38.800) e os mínimos também (38.090 → 38.250 → 38.440 → 38.650). Mesmo assim, o preço teve **recuos** de 100–170 pontos pelo caminho: uma tendência de alta **não é uma subida contínua**.

No gráfico lateral, o preço volta várias vezes à mesma zona de cima e de baixo: a leitura de "tendência" não faz sentido; faz sentido pensar em **limites do range**.`,
      visual: { kind: "scenario", scenarioId: "structure-bull-01", annotations: "solution", caption: "Tendência de alta: máximos e mínimos progressivamente mais altos." },
      exercise: { kind: "structure", scenarioId: "structure-range-01", prompt: "Qual é a estrutura deste mercado? Marca os swings e classifica." },
      takeaways: ["Alta = HH e HL; baixa = LH e LL; lateral = swings sobrepostos.", "A tendência depende do timeframe: o mesmo mercado pode ter leituras diferentes em escalas diferentes.", "É uma descrição do passado recente, não uma garantia de continuação."],
      quiz: [
        mc("Como se define uma tendência de alta?", ["Preço acima da média", "Máximos mais altos e mínimos mais altos", "Candles verdes", "Volume a subir"], 1, "Alta = sequência de HH e HL."),
        tf("Se o diário está em alta, o M5 tem de estar em alta.", false, "Cada timeframe tem a sua leitura; podem divergir."),
        chart("IDENTIFY_TREND", "structure-bear-01", "Qual é a tendência neste gráfico?", ["Alta", "Baixa", "Lateral", "Impossível saber"], 1, "Máximos e mínimos progressivamente mais baixos (LH e LL) = tendência de baixa."),
        chart("IDENTIFY_TREND", "structure-range-01", "E neste?", ["Alta", "Baixa", "Lateral", "Rompimento"], 2, "Os swings sobrepõem-se, sem progressão: mercado lateral."),
      ],
    },
    {
      slug: "forca-continuacao-e-exaustao",
      title: "Força, continuação e exaustão da tendência",
      summary: "Sinais descritivos de que uma tendência está saudável, a abrandar ou cansada — sem os tratar como certezas.",
      minutes: 7,
      content: `Nem todas as tendências são iguais. Podes avaliar a **força** pela forma como o preço se comporta, **sem** prever o que vem a seguir.

## Sinais de uma tendência forte (descritivos)
- **Recuos curtos e rasos** face aos impulsos (o preço volta pouco do que andou);
- **Impulsos com candles grandes** (corpo bem acima do ATR) e **fecho perto do extremo**;
- Os **mínimos** (numa alta) são **respeitados** — os recuos acabam em níveis lógicos;
- Alinhamento da tendência em vários timeframes.

## Sinais de abrandamento
- **Recuos mais profundos** ou mais longos;
- **Impulsos mais pequenos** (menos distância por swing);
- Candles com **pavios longos** contra a direção;
- O preço **quebra** um mínimo recente (numa alta) — a sequência HL falha.

## Continuação vs exaustão
- **Continuação:** o preço recua, defende um nível e retoma na direção dominante;
- **Exaustão:** depois de um movimento prolongado, aparecem sinais de cansaço (pavios contra, perda de momentum). **Não é um sinal de inversão** — é um alerta para gerir o risco e esperar confirmação.

## O ADX (indicador de força)
O **ADX** mede a **força** da tendência, **não a direção**. Valores acima de cerca de 25 são frequentemente citados como "tendência forte", mas é só uma convenção. Um indicador não substitui ler o preço: **só reformula o que já se vê no gráfico**, com atraso.

> Nunca assumes que "forte" quer dizer "vai continuar". Forte só descreve o que aconteceu.`,
      example: `Duas subidas de **200 pontos**:

- **Tendência saudável:** recuos de 40, 50 e 45 pontos, cada um a acabar acima do mínimo anterior; cada impulso com 2 a 3 candles grandes.
- **Tendência a abrandar:** o primeiro recuo foi de 40 pontos, o segundo de 90 e o terceiro quebrou o mínimo anterior, com pavios longos a rejeitar máximos.

O 2.º cenário não **prova** que vai inverter — mas aumenta a incerteza. Uma gestão prudente reduz o risco ou espera por confirmação.`,
      takeaways: ["A força descreve-se por recuos rasos, impulsos grandes e mínimos respeitados.", "Exaustão é um alerta, não um sinal de inversão.", "Indicadores como o ADX reformulam o que o preço já mostrou — com atraso."],
      quiz: [
        mc("O que mede o ADX?", ["A direção da tendência", "A força da tendência, sem direção", "O volume", "O spread"], 1, "O ADX indica o quão forte é a tendência, mas não se é de alta ou de baixa."),
        tf("Exaustão significa que o preço vai inverter de certeza.", false, "É um alerta de cansaço; o movimento pode retomar."),
        mc("Qual é um sinal descritivo de abrandamento de uma tendência de alta?", ["Recuos cada vez mais rasos", "Quebra do último mínimo (HL)", "Impulsos cada vez maiores", "Fecho sempre perto do máximo"], 1, "Se o mínimo anterior é quebrado, a sequência HL falha."),
        mc("Se o preço mostra sinais de exaustão, uma resposta prudente é…", ["Dobrar a posição", "Ajustar o risco e esperar confirmação", "Ignorar o stop", "Inverter sem plano"], 1, "Perante incerteza maior, gere o risco e espera por mais informação."),
      ],
    },
    {
      slug: "linhas-de-tendencia-e-canais",
      title: "Linhas de tendência e canais",
      summary: "Como traçar uma linha de tendência com critério, o que é um canal e porque uma quebra não é uma inversão garantida.",
      minutes: 7,
      content: `## Linha de tendência
Uma **linha de tendência** liga pelo menos **dois** swings do mesmo tipo:

- Numa **alta**, liga **mínimos** crescentes (a linha fica *abaixo* do preço);
- Numa **baixa**, liga **máximos** decrescentes (a linha fica *acima* do preço).

Dois pontos **definem** a linha; um **terceiro toque** ajuda a **validá-la** como referência. Quanto mais toques e mais tempo, mais relevante — mas **mais subjetiva** é também.

## Canal
Um **canal** acrescenta uma linha **paralela** do outro lado, ligando os swings opostos. O preço oscila entre os dois limites — dá uma noção de **amplitude** da tendência.

## Cuidados
- Linhas de tendência são **zonas aproximadas**, não linhas exatas: dois traders razoáveis traçam linhas ligeiramente diferentes;
- **Não deformes** os dados para "caber" na linha;
- Quebrar a linha **não é** uma inversão: a tendência pode **abrandar**, passar a lateral ou retomar;
- Se for preciso redesenhar a linha a cada candle, ela não está a ajudar.

## Para que serve
- Dar **contexto** (o preço continua acima do suporte dinâmico?);
- Identificar possíveis **zonas de confluência** com outros fatores (nível horizontal, Fibonacci);
- Definir uma **invalidação** possível — por exemplo, "se fechar abaixo da linha, a ideia perde sentido".`,
      example: `No gráfico, a linha liga três mínimos crescentes (38.950, 39.030 e 39.110): sobe **20 pontos por candle**. Enquanto o preço se mantiver acima dela, a leitura de alta mantém-se. Um fecho **claramente abaixo** da linha não prova que o mercado inverteu — mostra que o ritmo da subida **mudou**. Confirma com a estrutura (quebrou o último HL?) antes de tirar conclusões.`,
      visual: {
        kind: "candles",
        candles: [
          [38990, 39010, 38960, 39000],
          [39000, 39040, 38950, 39030],
          [39030, 39090, 39020, 39080],
          [39080, 39120, 39050, 39060],
          [39060, 39080, 39040, 39045],
          [39045, 39060, 39030, 39055],
          [39055, 39150, 39050, 39140],
          [39140, 39190, 39120, 39180],
          [39180, 39200, 39140, 39150],
          [39150, 39160, 39110, 39130],
          [39130, 39230, 39125, 39220],
          [39220, 39260, 39200, 39250],
        ],
        overlays: [{ type: "trendline", id: "tl", from: { index: 1, price: 38950 }, to: { index: 9, price: 39110 }, tone: "warning", extend: true }],
        caption: "Linha de tendência de alta ligando três mínimos crescentes.",
        height: 300,
      },
      takeaways: ["Dois swings definem a linha; um terceiro toque ajuda a validá-la.", "Linhas de tendência são zonas aproximadas e subjetivas, não verdades exatas.", "Quebrar a linha não é uma inversão garantida; confirma com a estrutura."],
      quiz: [
        mc("Quantos pontos definem uma linha de tendência?", ["Pelo menos 1", "Pelo menos 2", "Exatamente 5", "Nenhum"], 1, "Dois swings definem a linha; um terceiro toque ajuda a validá-la."),
        tf("Quando o preço quebra uma linha de tendência, a tendência inverteu sempre.", false, "A quebra pode indicar abrandamento, lateralização ou um falso rompimento."),
        mc("O que é um canal?", ["Duas médias móveis", "Uma linha de tendência com uma paralela do lado oposto", "Um tipo de ordem", "Um horário de sessão"], 1, "O canal combina a linha de tendência com uma paralela, dando a amplitude do movimento."),
      ],
    },
    {
      slug: "analise-multi-timeframe",
      title: "Análise multi-timeframe: de cima para baixo",
      summary: "O timeframe superior dá o contexto; o inferior serve para refinar a entrada — e não existe combinação universal.",
      minutes: 7,
      content: `Cada timeframe é uma **lente** diferente sobre o mesmo mercado. A análise **multi-timeframe** (MTF) combina várias lentes.

## A cascata típica
**D1 → H4 → H1 → M15 → M5**

- Os **timeframes superiores** (D1, H4) dão **contexto**: tendência dominante, níveis importantes, zonas relevantes;
- Os **intermédios** (H1) ligam contexto e execução;
- Os **inferiores** (M15, M5) servem para **refinar a entrada**: stop mais preciso, confirmação, melhor R:R.

## Mas atenção
- **Não existe uma combinação universal.** D1/H1/M15 não é "a regra". Cada trader escolhe, testa e documenta a sua;
- Uma prática comum é usar **três timeframes** com um fator de cerca de **4 a 6 vezes** entre eles — é uma convenção, não uma lei;
- **Timeframe a mais gera paralisia**: se tens 7 gráficos abertos e sinais contraditórios, o problema é o excesso de lentes;
- Quando os timeframes **entram em conflito** (superior em baixa, inferior em alta), podes: reduzir o risco, esperar alinhamento ou tratar o trade como **contra-tendência** (com os seus riscos).

## Processo top-down
1. Superior: qual é a estrutura e onde estão os níveis-chave?
2. Intermédio: o preço está num recuo, num rompimento, num range?
3. Inferior: há um gatilho com stop lógico?
4. Registar tudo no journal: **a que timeframe pertencia a decisão?**`,
      example: `D1 em tendência de alta; H4 a recuar para uma zona de suporte; M15 a formar um mínimo mais alto e a recuperar. Esta **cascata alinhada** sugere uma ideia de continuação, com stop abaixo do mínimo do M15 — mais curto (menos risco por contrato) do que se usasses o H4.

Se, pelo contrário, o D1 e o H4 estivessem em baixa e só o M15 estivesse em alta, a mesma ideia seria **contra o contexto** e merecia menor tamanho ou ser evitada.`,
      visual: { kind: "diagram", id: "timeframes-cascade", caption: "Timeframes superiores dão contexto; os inferiores refinam a entrada." },
      takeaways: ["Superior = contexto; inferior = refinamento da entrada.", "Não há uma combinação universal: escolhe, testa e documenta a tua.", "Em conflito entre timeframes, reduz o risco, espera alinhamento ou assume que é contra-tendência."],
      quiz: [
        mc("Para que serve tipicamente o timeframe inferior na análise MTF?", ["Definir a tendência dominante", "Refinar a entrada e o stop", "Prever notícias", "Calcular margem"], 1, "O inferior ajuda a localizar o gatilho e a definir um stop mais preciso."),
        tf("A combinação D1/H1/M15 é a única correta.", false, "Não existe combinação universal; o importante é escolher, testar e ser consistente."),
        mc("D1 e H4 em baixa, M15 em alta. Qual é a leitura mais prudente?", ["O M15 manda sempre", "Há conflito: reduzir risco, esperar alinhamento ou assumir contra-tendência", "Ignorar o D1", "Dobrar o tamanho"], 1, "Em conflito, a prudência é gerir o risco e perceber que a ideia vai contra o contexto."),
        mc("Qual é o risco de usar demasiados timeframes?", ["Nenhum", "Sinais contraditórios e paralisia de decisão", "Spread maior", "Margem maior"], 1, "Mais lentes não significam mais clareza; podem gerar contradições."),
      ],
    },
    {
      slug: "alinhar-timeframes-na-pratica",
      title: "Alinhar timeframes na prática",
      summary: "Um método simples de três passos para usar contexto, localização e gatilho sem complicar.",
      minutes: 6,
      content: `Um modelo simples e flexível para estruturar o pensamento:

## 1. Contexto (timeframe superior)
- Em que **direção** está a estrutura dominante?
- Onde estão os **níveis** relevantes (máximos/mínimos anteriores, zonas testadas)?

## 2. Localização (timeframe intermédio)
- O preço está **perto** de um nível relevante?
- É um **recuo**, um **rompimento**, uma **lateralização**?

## 3. Gatilho (timeframe inferior)
- Há uma **confirmação** (mudança de estrutura, candle de rejeição, rompimento com reteste)?
- Onde está a **invalidação**? Quanto risco isso implica?
- **R:R** razoável face ao próximo obstáculo?

## Regras de higiene
- Escreve **antes** as razões de cada passo — evita justificar depois;
- Se um passo falha (por exemplo, não há nível por perto), **não há trade**;
- Em dias de **notícias**, o gatilho do timeframe inferior perde fiabilidade: volatilidade extra altera tudo;
- Faz uma **revisão** semanal: quais timeframes te dão mais clareza?

> A função do timeframe superior é **evitar que cada trade seja uma decisão isolada**. A do inferior é **tornar o risco pequeno e preciso**.`,
      example: `**Passo 1 (D1/H4):** estrutura em alta, o último mínimo importante é 38.900.
**Passo 2 (H1):** o preço recua para uma zona de suporte entre 38.950 e 39.000.
**Passo 3 (M15):** forma um mínimo mais alto e fecha acima do máximo anterior.

Hipótese educativa: entrada acima do máximo do M15 em **39.030**, invalidação abaixo de **38.940** → **90 pontos** de risco. Com um orçamento de $100 e MYM ($0,50/ponto): 90 × $0,50 = $45 por contrato → **2 contratos** (risco $90). Sem um dos passos, não haveria trade.`,
      exercise: { kind: "reflection", prompt: "Descreve com as tuas palavras um exemplo em que o timeframe superior e o inferior estão em conflito. O que farias?", placeholder: "Escreve a tua reflexão…" },
      takeaways: ["Contexto (superior) → localização (intermédio) → gatilho (inferior).", "Se um passo falha, não há trade.", "Escreve as razões antes de entrar, para não as inventar depois."],
      quiz: [
        mc("Em que ordem se faz uma análise top-down?", ["Gatilho, localização, contexto", "Contexto, localização, gatilho", "Só gatilho", "Só contexto"], 1, "Começa-se pelo contexto, depois a localização e só no fim o gatilho."),
        tf("Se o passo da localização falha (nenhum nível por perto), o sensato é tentar o trade na mesma.", false, "Se um passo falha, não há trade nesse modelo — é essa a disciplina."),
        num("Entrada 39.030, invalidação 38.940, MYM ($0,50/ponto), orçamento de $100. Quantos contratos?", 2, 0, "contratos", "Risco por MYM = 90 × $0,50 = $45; $100 ÷ $45 = 2,2 → 2 contratos.", "POSITION_SIZE"),
      ],
    },
  ],
  quiz: {
    title: "Quiz do módulo — Trend & Multi-Timeframe",
    passScore: 70,
    questions: [
      mc("Como se define uma tendência de baixa?", ["Máximos e mínimos mais baixos (LH e LL)", "Candles vermelhos", "Preço abaixo de 40.000", "Volume a descer"], 0, "Baixa = sequência de LH e LL."),
      chart("IDENTIFY_TREND", "structure-bull-01", "Qual é a tendência neste gráfico?", ["Alta", "Baixa", "Lateral", "Impossível saber"], 0, "Sequência de HH e HL = tendência de alta."),
      chart("IDENTIFY_TREND", "structure-range-01", "E neste?", ["Alta", "Baixa", "Lateral", "Rompimento"], 2, "Swings sobrepostos, sem progressão: mercado lateral."),
      chart("CHART_ANALYSIS", "structure-shift-bull-to-bear", "Neste gráfico, o que mudou a meio?", ["Nada", "A estrutura passou de alta para baixa (quebra do último mínimo e novos LH/LL)", "O volume", "O spread"], 1, "A quebra do último HL seguida de LH e LL marca uma mudança de estrutura."),
      mc("Qual é a função tipicamente atribuída ao timeframe superior?", ["Refinar a entrada", "Dar contexto: tendência e níveis", "Calcular margem", "Prever notícias"], 1, "O timeframe superior dá o contexto; o inferior refina a entrada."),
      tf("Existe uma combinação de timeframes universalmente correta.", false, "Não existe; o importante é escolher, testar e ser consistente."),
      tf("Quebrar uma linha de tendência prova sempre que o mercado inverteu.", false, "Pode apenas indicar abrandamento ou lateralização."),
      mc("O ADX mede…", ["A direção", "A força da tendência", "O volume", "O ATR"], 1, "O ADX indica força, não direção."),
      num("Entrada 39.100, invalidação 39.020, MYM ($0,50/ponto), orçamento de $80. Quantos contratos?", 2, 0, "contratos", "Risco por MYM = 80 × $0,50 = $40; $80 ÷ $40 = 2.", "POSITION_SIZE"),
      mc("Qual é a atitude mais prudente quando D1 e M15 apontam em sentidos opostos?", ["Ignorar o D1", "Reduzir o risco, esperar alinhamento ou assumir explicitamente que é contra-tendência", "Aumentar a posição", "Retirar o stop"], 1, "Perante conflito, gere-se o risco e assume-se a natureza contra-tendência do trade."),
    ],
  },
};
