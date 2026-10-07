import { chart, mc, num, rr, tf } from "../dsl";
import type { ModuleDef } from "../types";

/**
 * Module 08 — Fibonacci (Level 3).
 * Rule of the module: Fibonacci levels are STUDY tools. Nothing here claims a level "makes price reverse".
 * Numbers come from the DEMO scenarios and hand-made illustrations (synthetic).
 */
export const fibonacci: ModuleDef = {
  slug: "fibonacci",
  number: 8,
  level: 3,
  title: "Fibonacci",
  summary: "Retracement, extension e projection; escolha do swing; os rácios 38,2% a 261,8% e a sua origem — como ferramenta de estudo, nunca como garantia de reversão.",
  difficulty: "FOUNDATION",
  icon: "Percent",
  lessons: [
    {
      slug: "o-que-e-fibonacci",
      title: "O que é Fibonacci (e o que não é)",
      summary: "De onde vêm os rácios e porque devem ser tratados como régua de estudo, não como lei do mercado.",
      minutes: 6,
      content: `A **sequência de Fibonacci** é 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89… — cada número é a soma dos dois anteriores. À medida que avança, o **quociente entre números consecutivos** aproxima-se de **1,618** (o "número de ouro") e o inverso, **0,618**.

## O que se usa no gráfico
Os traders usam **rácios derivados** desses números (e de outros) como **régua** para medir **quanto** um movimento recuou ou **até onde** poderia estender-se. Por exemplo:

- **38,2%**, **61,8%** — derivados da razão de ouro;
- **50%** — não é um rácio de Fibonacci, mas é usado há muito (herdado da teoria de Dow);
- **70,7%, 78,6%, 88,6%** — raízes quadradas de outros rácios;
- **127,2%, 161,8%, 261,8%** — extensões.

## O que é — e o que NÃO é
- ✔ Uma **forma sistemática de medir** movimentos e **marcar zonas de interesse** para estudar o preço;
- ✔ Uma **linguagem comum**: muitos participantes olham para os mesmos rácios;
- ✘ **Não há prova** de que um nível de Fibonacci "faça o preço inverter". O preço **pode** reagir num nível, atravessá-lo ou ignorá-lo;
- ✘ Não substitui estrutura, níveis, confluência e gestão de risco.

> Neste módulo, Fibonacci é uma **ferramenta de estudo**. Nunca afirmamos que um nível "protege" uma entrada: **só o stop protege**.`,
      example: `Se um impulso subiu **600 pontos** (de 37.950 a 38.550), um recuo de **61,8%** devolve 0,618 × 600 = **370,8 pontos** → o preço estaria perto de 38.550 − 370,8 = **38.179,2**.

Isto é uma **medição**. Se o preço parar exatamente aí, é uma observação interessante; se passar por ali sem reação, a ferramenta não "falhou" — simplesmente não havia aí informação útil.`,
      takeaways: ["Os rácios de Fibonacci são uma régua para medir movimentos e marcar zonas de estudo.", "Não há prova de que causem reversões: o preço pode reagir, atravessar ou ignorar.", "Só o stop protege — o nível não."],
      quiz: [
        mc("Qual é a melhor descrição de Fibonacci no trading?", ["Uma lei que prevê reversões", "Uma régua para medir movimentos e marcar zonas de estudo", "Um indicador de volume", "Uma estratégia secreta"], 1, "É uma ferramenta de medição; não prevê reversões."),
        tf("O nível de 61,8% faz o preço inverter.", false, "Não há prova disso; o preço pode reagir, atravessar ou ignorar o nível."),
        num("Um impulso de 600 pontos recua 61,8%. Quantos pontos foram devolvidos (1 casa decimal)?", 370.8, 0.05, "pontos", "0,618 × 600 = 370,8 pontos."),
        mc("Qual destes rácios NÃO é, em sentido estrito, derivado da razão de ouro?", ["61,8%", "38,2%", "50%", "161,8%"], 2, "O 50% é uma convenção herdada da teoria de Dow; os restantes derivam da razão de ouro."),
      ],
    },
    {
      slug: "escolher-o-swing",
      title: "Escolher o swing: os pontos A e B",
      summary: "O passo mais importante — e o mais subjetivo: escolher a perna do movimento a medir.",
      minutes: 7,
      content: `Todo o uso de Fibonacci começa por **escolher a perna** do movimento a medir: um ponto **A** (início) e um ponto **B** (fim do impulso). **Tudo o resto depende desta escolha** — e é aqui que a maioria dos erros acontece.

## Regras práticas
1. **Usa swings confirmados** da estrutura (não o candle de agora);
2. **Mede o impulso mais recente e relevante**, na direção da estrutura dominante;
3. Numa **alta**, A = swing low (ponto mais baixo do impulso), B = swing high; numa **baixa**, A = swing high, B = swing low;
4. **Inclui pavios ou só corpos?** Escolhe uma regra e mantém-na (o mais comum é usar os extremos dos pavios);
5. **Perna suficientemente grande** face ao ATR: Fibonacci em movimentos minúsculos é ruído.

## Erros comuns
- Escolher o swing **depois** de ver onde o preço parou, só para "encaixar" um nível (viés de confirmação);
- Mudar A e B a cada candle;
- Medir pernas **contra** a estrutura dominante sem perceber que é uma ideia contra-tendência;
- Aplicar a **várias pernas** e ficar com 20 níveis no gráfico.

## Pergunta de controlo
"Se outro trader olhasse para este gráfico com a **mesma regra**, escolheria o mesmo A e B?" Se a resposta for "depende", a ferramenta vai acrescentar mais subjetividade do que informação.

> Regista no journal **qual perna** mediste e **porquê** — para poderes avaliar, mais tarde, se as tuas escolhas foram boas.`,
      example: `Numa estrutura de alta, o swing low **37.950** (A) e o swing high **38.550** (B) definem um impulso de **600 pontos**.

Se escolhesses antes um swing low menor (38.100) como A, o impulso mediria 450 pontos e o recuo de 61,8% cairia em **38.550 − 0,618 × 450 = 38.272** — um nível completamente diferente. A **mesma ferramenta** deu dois resultados porque a escolha do swing mudou. É por isso que a regra tem de ser **antes**, não depois.`,
      visual: {
        kind: "candles",
        candles: [
          [37960, 37990, 37950, 37985],
          [37985, 38110, 37980, 38100],
          [38100, 38240, 38090, 38230],
          [38230, 38360, 38220, 38350],
          [38350, 38470, 38340, 38460],
          [38460, 38550, 38450, 38530],
          [38530, 38540, 38440, 38450],
          [38450, 38460, 38330, 38340],
        ],
        overlays: [
          { type: "marker", id: "a", index: 0, price: 37950, label: "A (início)", placement: "below", tone: "primary" },
          { type: "marker", id: "b", index: 5, price: 38550, label: "B (fim)", placement: "above", tone: "primary" },
        ],
        caption: "O impulso A→B: o ponto de partida de qualquer medição de Fibonacci.",
        height: 280,
      },
      takeaways: ["A→B: A é o início do impulso, B o seu fim, na direção da estrutura.", "Usa swings confirmados e uma regra fixa (pavios ou corpos) definida antes.", "Se outro trader, com a mesma regra, não escolheria o mesmo A e B, a ferramenta acrescenta subjetividade."],
      quiz: [
        mc("Numa estrutura de alta, o ponto A de uma medição é…", ["O swing high", "O swing low do início do impulso", "O fecho do dia", "O PDH"], 1, "A = início do impulso (swing low numa alta); B = o seu fim (swing high)."),
        tf("É boa prática escolher o swing depois de ver onde o preço parou, para o nível 'encaixar'.", false, "Escolher a posteriori é viés de confirmação; a regra tem de ser definida antes."),
        num("Impulso de A = 38.100 a B = 38.550 (alta). Onde fica o recuo de 61,8%? (arredonda a 1 casa)", 38271.9, 0.2, undefined, "B − 0,618 × (B − A) = 38.550 − 0,618 × 450 = 38.271,9."),
        mc("Qual é uma pergunta de controlo útil?", ["Qual é o indicador mais popular?", "Outro trader, com a mesma regra, escolheria o mesmo A e B?", "Quanto vou ganhar?", "Qual é o spread?"], 1, "Se a resposta é 'depende', a escolha é demasiado subjetiva."),
      ],
    },
    {
      slug: "retracement",
      title: "Fibonacci retracement: medir recuos",
      summary: "Como calcular os níveis de recuo e ler a zona 38,2%–78,6% sem a tratar como garantia.",
      minutes: 8,
      content: `O **retracement** mede **quanto** do impulso A→B o preço devolveu no recuo seguinte.

## Fórmula
Numa alta (A baixo, B alto), o nível de rácio **r** é:

\`preço = B − r × (B − A)\`

Os rácios mais usados nos recuos: **23,6% · 38,2% · 50% · 61,8% · 70,7% · 78,6% · 88,6%** (e 100% = ponto A).

## Para que serve
- Dar uma **zona de interesse** para estudar o recuo (por exemplo, entre 38,2% e 78,6%);
- Medir a **profundidade** do recuo: recuos rasos sugerem tendência forte; recuos muito profundos questionam a estrutura;
- Perceber o **R:R potencial**: quanto mais perto do início do recuo (rácios baixos), mais curto o stop, mas maior a probabilidade de o recuo continuar.

## Como ler
- **Zonas, não linhas:** o preço pode reagir à volta do nível (use 0,3–0,5 × ATR de largura, como nas zonas de S/R);
- **Profundidade e estrutura:** um recuo que fecha **abaixo de 100%** (ponto A) invalida a ideia de continuação;
- **Confluência:** é mais interessante quando o nível coincide com um suporte/resistência, uma zona de oferta/procura, uma linha de tendência ou um nível redondo.

## O que NÃO assumir
- Que "o preço tem de recuar até 61,8%";
- Que **qualquer** nível dentro do recuo "segura" o preço;
- Que mais níveis significam mais precisão (ver lição seguinte).`,
      example: `Impulso **A = 37.950 → B = 38.550** (600 pontos). Níveis de recuo:

| Rácio | Preço |
| --- | --- |
| 38,2% | 38.550 − 0,382 × 600 = **38.320,8** |
| 50% | **38.250** |
| 61,8% | **38.179,2** |
| 78,6% | **38.078,4** |
| 100% | **37.950** (ponto A) |

Neste exemplo educativo o recuo terminou em **38.180**, a (38.550 − 38.180) ÷ 600 = **61,7%** do impulso. Mas, noutro cenário, o preço pode atravessar 61,8% sem pausa — e o **stop** é que limita o custo de estar errado.`,
      visual: {
        kind: "candles",
        candles: [
          [37960, 37990, 37950, 37985],
          [37985, 38110, 37980, 38100],
          [38100, 38240, 38090, 38230],
          [38230, 38360, 38220, 38350],
          [38350, 38470, 38340, 38460],
          [38460, 38550, 38450, 38530],
          [38530, 38540, 38440, 38450],
          [38450, 38460, 38330, 38340],
          [38340, 38350, 38240, 38250],
          [38250, 38260, 38180, 38200],
          [38200, 38300, 38190, 38290],
          [38290, 38420, 38280, 38410],
          [38410, 38560, 38400, 38545],
        ],
        overlays: [
          {
            type: "fib",
            id: "fib",
            fromIndex: 0,
            anchors: [
              { index: 0, price: 37950, label: "A" },
              { index: 5, price: 38550, label: "B" },
              { index: 9, price: 38180, label: "C" },
            ],
            levels: [
              { ratio: 0, price: 38550, label: "0%" },
              { ratio: 0.382, price: 38320.8, label: "38,2%", emphasis: true },
              { ratio: 0.5, price: 38250, label: "50%", emphasis: true },
              { ratio: 0.618, price: 38179.2, label: "61,8%", emphasis: true },
              { ratio: 0.786, price: 38078.4, label: "78,6%", emphasis: true },
              { ratio: 1, price: 37950, label: "100%" },
            ],
          },
        ],
        caption: "Retracement de A→B com o recuo C a terminar perto de 61,8% (ilustração).",
        height: 340,
      },
      exercise: { kind: "fibonacci", scenarioId: "fib-bull-618", prompt: "Marca A e B e escolhe o nível de recuo onde o pullback terminou." },
      takeaways: ["Numa alta, nível = B − r × (B − A).", "Dá uma zona de estudo para o recuo; a profundidade informa sobre a força da estrutura.", "Um recuo abaixo de 100% invalida a continuação; o nível não protege — o stop sim."],
      quiz: [
        num("A = 37.950, B = 38.550. Qual é o nível de 50% de recuo?", 38250, 0, undefined, "38.550 − 0,5 × 600 = 38.250."),
        num("A = 37.950, B = 38.550. Qual é o nível de 38,2% de recuo? (1 casa decimal)", 38320.8, 0.05, undefined, "38.550 − 0,382 × 600 = 38.320,8."),
        chart("CHART_ANALYSIS", "fib-bull-618", "Neste cenário, a que profundidade (aprox.) o recuo terminou?", ["Perto de 61,8% do impulso", "Perto de 23,6%", "Abaixo de 100%", "Não houve recuo"], 0, "O recuo terminou em ≈ 38.180, cerca de 61,7% do impulso de 600 pontos."),
        mc("O que invalida a ideia de continuação numa medição de retracement de uma alta?", ["Tocar em 38,2%", "O preço fechar abaixo do ponto A (100%)", "Fazer um doji", "O volume cair"], 1, "Devolver todo o impulso (e mais) questiona a estrutura de alta."),
      ],
    },
    {
      slug: "extensao-e-projecao",
      title: "Extensões e projeções: estudar objetivos",
      summary: "Como medir até onde um movimento poderia estender-se — como referência de alvo, não previsão.",
      minutes: 7,
      content: `As **extensões** e **projeções** servem para estudar **objetivos potenciais** depois de um impulso e um recuo — e para decidir **onde sair** ou onde esperar mais **resistência**.

## Extensão (A→B, a partir de A)
Mede o impulso A→B e prolonga-o **para lá de B**:

\`preço = A + r × (B − A)\`  (r = 1 é o próprio B)

Rácios comuns: **127,2% · 141,4% · 161,8% · 200% · 261,8%**.

## Projeção (a partir de C)
Aplica o **tamanho** do impulso A→B a partir do fim do recuo **C**:

\`preço = C + r × (B − A)\`

Com **r = 1**, a nova perna tem o mesmo tamanho da primeira (padrão "AB = CD").

## Para que servem
- Como **referência de alvo** parcial ou final;
- Para perceber se o **R:R** é razoável antes de entrar;
- Para antecipar zonas onde o preço **pode** encontrar resistência.

## O que NÃO são
- Não são "alvos que o preço tem de atingir";
- Num movimento forte, o preço pode **passar** vários níveis sem hesitar;
- Em movimentos fracos, **nem chega** ao primeiro.

## Boas práticas
- Prefere alvos que **coincidam** com outros fatores (máximo anterior, nível de S/R, extensão);
- Considera sair em **parcelas** (módulo de Trade Management);
- Ajusta o plano se o preço **perder** o ímpeto antes do alvo.`,
      example: `Impulso **A = 37.950 → B = 38.550** (600 pontos), recuo C = **38.180**.

**Extensões** (de A): 127,2% → 37.950 + 1,272 × 600 = **38.713,2**; 161,8% → **38.920,8**.
**Projeção** (de C) com r = 1: 38.180 + 600 = **38.780**.

Se entrares em 38.180 com stop em 38.080 (**100 pontos**), alvo em 38.713 (**533 pontos**) → R:R ≈ **5,3:1**. O R:R "bonito" não torna o alvo provável: serve para perceber se **vale a pena** o risco **se** o cenário correr bem.`,
      takeaways: ["Extensão mede-se a partir de A; projeção a partir de C.", "São referências de alvo para estudo, não alvos garantidos.", "Prefere alvos que coincidam com outros fatores e planeia saídas parciais."],
      quiz: [
        num("A = 37.950, B = 38.550. Qual é a extensão de 127,2% (1 casa decimal)?", 38713.2, 0.05, undefined, "37.950 + 1,272 × 600 = 38.713,2."),
        num("A = 37.950, B = 38.550, C = 38.180. Qual é a projeção com r = 1?", 38780, 0, undefined, "C + (B − A) = 38.180 + 600 = 38.780."),
        tf("O preço tem de atingir a extensão de 161,8% depois de um impulso.", false, "As extensões são referências de estudo; o preço pode parar antes ou ultrapassá-las."),
        rr("Entrada 38.180, stop 38.080, alvo 38.713. Qual é o R:R (arredonda a 1 casa)?", 5.3, 0.1, "Alvo 533 ÷ stop 100 = 5,33."),
      ],
    },
    {
      slug: "niveis-e-origem-dos-racios",
      title: "Os rácios: origem e o perigo de ter níveis a mais",
      summary: "De onde vêm os 12 rácios mais usados — e porque mais níveis dão a ilusão de mais acertos.",
      minutes: 7,
      content: `## Os rácios mais usados

| Rácio | Origem típica |
| --- | --- |
| 23,6% · 38,2% · 61,8% | derivados da **razão de ouro** (1/φ, 1/φ², 1/φ³) |
| 50% | convenção (herdada da teoria de Dow) |
| 70,7% · 78,6% · 88,6% | **raízes quadradas** (√0,5 · √0,618 · √0,786) |
| 100% | início (ponto A) |
| 127,2% · 141,4% | raízes (√1,618 · √2) |
| 161,8% · 261,8% | razão de ouro (φ e φ²) |
| 200% | convenção (o dobro) |

Alguns são "Fibonacci" no sentido estrito; outros são convenções. **Isto não lhes dá poder de previsão.**

## Níveis a mais: a ilusão
Imagina um impulso de **600 pontos** e oito níveis entre 23,6% e 88,6%. Entre esses dois extremos há **390 pontos** de espaço. Se considerares que o preço "respeitou" um nível sempre que parou a **±15 pontos** de um deles, cada nível cobre **30 pontos**: oito níveis cobrem **240 pontos** — cerca de **60%** do espaço possível.

Ou seja: mesmo que o preço parasse **ao acaso**, em **mais de metade** dos recuos haveria "um nível ali perto". Com tantos níveis, é fácil ver reações **depois do facto** — e esquecer os casos em que o preço os ignorou.

## Como se proteger
- Usa **poucos rácios**, definidos antes;
- **Regista** todos os casos (os que funcionaram e os que não);
- Testa em **backtest/replay** com regras fixas antes de acreditar;
- Exige **confluência** com outro fator independente;
- Lembra: o stop está para os casos em que **o nível não segura**.`,
      example: `Duas semanas de recuos num diário: o aluno anota 10 casos "em que o 61,8% funcionou" e esquece 14 em que o preço passou sem hesitar. Concluir "61,8% funciona" a partir dos 10 é **viés de seleção**. O registo completo (24 casos) mostra uma taxa de "reação" de 42% — sem qualquer evidência de que seja melhor do que ao acaso, tendo em conta que há tantos níveis no gráfico.`,
      takeaways: ["Os rácios têm origens diferentes (razão de ouro, raízes, convenções); nenhuma dá poder de previsão.", "Com muitos níveis, o preço parece 'respeitar' algum por acaso — cerca de 60% no exemplo.", "Usa poucos rácios, regista todos os casos e testa com regras fixas."],
      quiz: [
        mc("O 70,7% deriva de…", ["Da razão de ouro", "De uma raiz quadrada (√0,5)", "Do volume", "Do ATR"], 1, "0,707 ≈ √0,5: é a raiz quadrada de um rácio, não um número da sequência de Fibonacci em sentido estrito."),
        num("Oito níveis, cada um com tolerância de ±15 pontos (30 pontos por nível), num espaço de 390 pontos. Que percentagem do espaço é coberta (arredonda às unidades)?", 62, 1, "%", "8 × 30 = 240 pontos; 240 ÷ 390 ≈ 61,5% (≈ 62%)."),
        tf("Se o preço parar perto de um nível de Fibonacci, isso prova que o nível funciona.", false, "Com tantos níveis, é natural haver um perto por acaso; só o registo completo e testes dizem alguma coisa."),
        mc("Qual destas práticas ajuda a evitar o viés de seleção?", ["Lembrar só os casos de sucesso", "Registar todos os casos e testar com regras fixas", "Adicionar mais níveis", "Mudar o swing depois"], 1, "Registar tudo e testar com regras fixas é a única forma de avaliar a ferramenta."),
      ],
    },
    {
      slug: "fibonacci-com-confluencia",
      title: "Fibonacci com confluência e gestão de risco",
      summary: "Como integrar a medição no plano: estrutura, zona, confirmação e invalidação.",
      minutes: 7,
      content: `Fibonacci sozinho é uma **régua**. Integrado num plano, pode ajudar a **localizar** zonas e a **estimar risco**.

## Um processo educativo
1. **Estrutura:** a ideia é a favor da estrutura do timeframe superior?
2. **Medição:** A e B escolhidos por regra definida antes;
3. **Zona de interesse:** por exemplo entre 50% e 78,6% (ou a que definires);
4. **Confluência:** a zona coincide com um nível de S/R, uma zona de oferta/procura, linha de tendência ou nível redondo?
5. **Confirmação:** o preço mostra comportamento na zona (rejeição, mudança de estrutura no timeframe inferior)?
6. **Invalidação:** onde a ideia deixa de fazer sentido? (por exemplo, abaixo do ponto A ou abaixo de 78,6%/88,6% com folga);
7. **Alvo e R:R:** o objetivo (B ou uma extensão) compensa o risco?
8. **Tamanho:** vem do risco, não da convicção.

## Qual a invalidação?
Uma opção prudente: **abaixo do ponto A** (100%). Mas isso pode implicar um stop longo. Outra: abaixo de 78,6% com folga (mais curto, mais exposto a ser atingido). **Não há resposta certa** — há uma escolha de **risco** que se testa e regista.

## Honestidade estatística
Uma ideia com três fatores alinhados **não é garantida**: é uma ideia com **melhor contexto**. Mesmo assim vai falhar em muitos casos. Por isso o **risco por trade** é pequeno e fixo.`,
      example: `Estrutura de alta; A = 37.950; B = 38.550; zona de interesse 50%–61,8% (**38.250–38.179**), a coincidir com um suporte anterior perto de 38.200.

Plano educativo: entrada em 38.200 após rejeição no M15; invalidação abaixo de 38.080 (**120 pontos**); alvo em B = 38.550 (**350 pontos**) → **R:R ≈ 2,9:1**. Com MYM ($0,50/ponto) e orçamento de $100: 120 × $0,50 = $60 por contrato → **1 contrato** (risco $60). Se a invalidação for tocada, o plano **acabou** — sem mudar o stop.`,
      exercise: { kind: "fibonacci", scenarioId: "fib-failed-786", prompt: "Neste cenário, o recuo foi profundo e acabou por falhar. Que sinais mostravam o aumento do risco?" },
      takeaways: ["Integra Fibonacci num plano: estrutura, medição, confluência, confirmação, invalidação, R:R e tamanho.", "A invalidação é uma escolha de risco que se define antes.", "Três fatores alinhados dão melhor contexto, não certeza."],
      quiz: [
        mc("Qual é o papel de Fibonacci num plano de trade?", ["Dar o sinal de entrada", "Ajudar a localizar zonas de interesse e a estimar risco, em conjunto com outros fatores", "Eliminar o stop", "Prever o próximo candle"], 1, "É uma régua que ajuda a localizar zonas; o resto do processo decide."),
        rr("Entrada 38.200, stop 38.080, alvo 38.550. Qual é o R:R (arredonda a 1 casa)?", 2.9, 0.1, "Alvo 350 ÷ stop 120 = 2,92."),
        num("Orçamento de $100, MYM ($0,50/ponto), stop de 120 pontos. Quantos contratos?", 1, 0, "contratos", "Risco por MYM = 120 × $0,50 = $60; $100 ÷ $60 = 1,67 → 1 contrato.", "POSITION_SIZE"),
        chart("CHART_ANALYSIS", "fib-failed-786", "Neste cenário, o que aconteceu depois do recuo de ≈ 78,3%?", ["O preço continuou a subir", "O preço rompeu o ponto A: a estrutura falhou", "O preço ficou lateral", "Não há dados"], 1, "O recuo profundo acabou por romper o ponto A, invalidando a tese de continuação."),
      ],
    },
    {
      slug: "pratica-no-fibonacci-lab",
      title: "Prática no Fibonacci Lab e erros comuns",
      summary: "Rotina de treino e armadilhas ao aplicar a ferramenta.",
      minutes: 6,
      content: `No **Fibonacci Lab** recebes um gráfico, marcas **A** e **B** e indicas **onde o recuo terminou**. O sistema compara com a **solução educativa** e explica.

## Rotina
1. Identifica a **estrutura** do gráfico;
2. Escolhe **A** e **B** com a tua regra;
3. Prevê **onde** estaria a zona de interesse (sem espreitar);
4. Compara com a solução — **a pontuação mede a qualidade da identificação**, não a "previsão";
5. Lê a nota explicativa: muitas vezes o ponto não é "acertar no 61,8%", mas perceber que o recuo foi raso, profundo ou falhou.

## Erros comuns
- **Escolher swings pequenos demais** (ruído);
- **Ancorar no candle errado** (corpo vs pavio sem regra);
- **Aplicar Fibonacci contra a estrutura** sem o assumir;
- **Esperar que o preço pare num nível exato**;
- **Esquecer o stop** — "está no 61,8%, deve segurar";
- **Adicionar rácios a posteriori** para justificar o que aconteceu.

## Como registar
No journal, anota: swing escolhido, rácio da zona, resultado, e **o que o stop teria feito** se o nível não segurasse. Em 30–50 casos começas a ter dados teus — e a perceber se a ferramenta te ajuda **a ti**.

> Uma boa pontuação no laboratório significa que **sabes aplicar a ferramenta**. Não significa que a ferramenta funcione no mercado.`,
      example: `Aluno A faz 8 cenários, acerta A/B em 7 e identifica o recuo em 5. Conclusão útil: sabe medir mas precisa de rever como classifica recuos profundos. Conclusão **inútil**: "o Fibonacci funciona em 5 de 8" — são cenários **sintéticos** desenhados para ilustrar a ferramenta.`,
      exercise: { kind: "link", href: "/labs/fibonacci", label: "Abrir o Fibonacci Lab", prompt: "Faz os três cenários e anota o que escapou em cada um." },
      takeaways: ["A pontuação do laboratório mede a qualidade da identificação, não a eficácia da ferramenta no mercado.", "Evita swings pequenos, âncoras sem regra e rácios acrescentados a posteriori.", "Regista os casos no journal, incluindo o que o stop teria feito."],
      quiz: [
        mc("O que mede a pontuação do Fibonacci Lab?", ["A rentabilidade da ferramenta", "A qualidade da identificação face à solução educativa", "O ATR", "A tua sorte"], 1, "Mede como aplicas a ferramenta, não a sua eficácia em mercado real."),
        tf("Se acertares em 5 de 8 cenários do laboratório, podes concluir que o Fibonacci funciona 62% das vezes no mercado.", false, "Os cenários são sintéticos e desenhados para ilustração; não são uma amostra do mercado."),
        mc("Qual é um erro comum ao aplicar Fibonacci?", ["Definir A e B antes", "Adicionar rácios a posteriori para justificar o resultado", "Registar os casos", "Usar o stop"], 1, "Acrescentar rácios depois do movimento é viés de confirmação."),
      ],
    },
  ],
  quiz: {
    title: "Quiz do módulo — Fibonacci",
    passScore: 70,
    questions: [
      mc("Qual é o papel de Fibonacci neste curso?", ["Prever reversões", "Ferramenta de estudo para medir movimentos e marcar zonas", "Substituir o stop", "Indicador de volume"], 1, "É uma régua de estudo, nunca um oráculo."),
      num("A = 38.000, B = 38.400 (alta). Qual é o recuo de 50%?", 38200, 0, undefined, "38.400 − 0,5 × 400 = 38.200."),
      num("A = 38.000, B = 38.400. Qual é o recuo de 61,8% (1 casa decimal)?", 38152.8, 0.05, undefined, "38.400 − 0,618 × 400 = 38.152,8."),
      num("A = 38.000, B = 38.400. Qual é a extensão de 161,8% (1 casa decimal)?", 38647.2, 0.05, undefined, "38.000 + 1,618 × 400 = 38.647,2."),
      num("A = 38.000, B = 38.400, C = 38.150. Qual é a projeção com r = 1?", 38550, 0, undefined, "C + (B − A) = 38.150 + 400 = 38.550."),
      chart("CHART_ANALYSIS", "fib-bear-50", "Neste cenário de baixa, que fração do impulso recuperou o repique?", ["Cerca de 50%", "Cerca de 23,6%", "100%", "Nenhuma"], 0, "O repique recuperou 300 dos 600 pontos do impulso: 50%."),
      tf("Um nível de Fibonacci segura sempre o preço.", false, "Não há garantia: o preço pode reagir, atravessar ou ignorar."),
      mc("O 78,6% deriva de…", ["√0,618", "1,618", "50%", "O volume"], 0, "0,786 ≈ √0,618."),
      mc("O que invalida uma ideia de continuação baseada num recuo numa alta?", ["Tocar em 38,2%", "Fechar abaixo do ponto A", "Fazer um doji", "O volume baixar"], 1, "Devolver todo o impulso questiona a estrutura."),
      mc("Como evitar o viés de seleção ao avaliar Fibonacci?", ["Anotar só os sucessos", "Registar todos os casos e testar com regras fixas", "Usar mais rácios", "Mudar A e B depois"], 1, "O registo completo e regras fixas são a defesa."),
    ],
  },
};
