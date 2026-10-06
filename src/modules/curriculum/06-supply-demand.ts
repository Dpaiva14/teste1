import { chart, mc, num, tf } from "../dsl";
import type { ModuleDef } from "../types";

/** Module 06 — Supply & Demand (Level 2). Zones are a lens, never a promise of reversal. */
export const supplyDemand: ModuleDef = {
  slug: "supply-demand",
  number: 6,
  level: 2,
  title: "Supply & Demand",
  summary: "Oferta e procura como zonas: origem de movimentos impulsivos, base e partida, desequilíbrio, zonas frescas, testadas e invalidadas — e porque não garantem reversões.",
  difficulty: "BEGINNER",
  icon: "ArrowUpDown",
  lessons: [
    {
      slug: "oferta-e-procura",
      title: "Oferta e procura como zonas do gráfico",
      summary: "O que são zonas de oferta e de procura e como se diferenciam de suporte/resistência clássicos.",
      minutes: 6,
      content: `Toda a variação de preço resulta de um desequilíbrio entre **compradores** (procura, *demand*) e **vendedores** (oferta, *supply*). No gráfico, essa ideia traduz-se em **zonas**:

- **Zona de procura (*demand zone*):** região onde, no passado, os compradores dominaram e o preço **se afastou para cima** com força;
- **Zona de oferta (*supply zone*):** região onde os vendedores dominaram e o preço **se afastou para baixo** com força.

## Em que difere de suporte/resistência?
- **Suporte/resistência** nasce de **reações repetidas** (vários toques);
- **Oferta/procura** foca-se na **origem de um movimento impulsivo**: a zona de onde o preço *partiu* com força, mesmo que só uma vez.

Na prática, as duas lentes **sobrepõem-se** muitas vezes: uma zona de procura pode coincidir com um suporte testado.

## O que se pode afirmar
- ✔ "Esta região foi a origem de um movimento forte."
- ✘ "O preço **vai** reagir aqui." Pode reagir, atravessar ou consumir a zona.

> **Oferta/procura não é uma garantia de reversão.** É uma forma de organizar o gráfico em regiões onde o comportamento passado foi invulgar — e de planear stops e alvos com mais lógica.

## Limites
- A identificação tem **margem de subjetividade** (onde começa e acaba a zona?);
- Diferentes traders desenham zonas diferentes: o importante é **ser consistente** e testar;
- Uma zona só serve se ajudar a **decidir** algo (localização, stop, alvo).`,
      example: `O Dow desce até **39.000**, lateraliza em pequenos candles e depois **sobe 200 pontos** em duas barras grandes. A região **38.970–39.015** foi a origem do impulso: uma possível **zona de procura**.

Quando o preço regressa a essa região, **observa** o que faz: reage com candles de rejeição? Atravessa? Fica indeciso? Só depois dessa informação avalias se há uma ideia com stop lógico abaixo da zona.`,
      visual: {
        kind: "candles",
        candles: [
          [39100, 39110, 39040, 39050],
          [39050, 39060, 38990, 39000],
          [39000, 39015, 38970, 38990],
          [38990, 39010, 38975, 39000],
          [39000, 39012, 38972, 38985],
          [38985, 39120, 38980, 39110],
          [39110, 39200, 39100, 39190],
          [39190, 39240, 39170, 39230],
          [39230, 39235, 39150, 39160],
          [39160, 39170, 39080, 39090],
          [39090, 39100, 38995, 39020],
          [39020, 39110, 39010, 39100],
        ],
        overlays: [{ type: "zone", id: "dz", top: 39015, bottom: 38970, fromIndex: 2, label: "Zona de procura", tone: "success" }],
        caption: "Zona de procura: a origem do impulso, revisitada mais tarde.",
        height: 300,
      },
      takeaways: ["Procura/oferta são zonas onde o preço partiu com força no passado.", "Diferem de suporte/resistência por se focarem na origem de um impulso, mas sobrepõem-se muitas vezes.", "Não são garantia de reversão: são regiões a observar e a planear."],
      quiz: [
        mc("O que é uma zona de procura?", ["Região onde compradores dominaram e o preço partiu para cima com força", "Um indicador", "O preço de fecho", "Uma ordem de compra"], 0, "É a origem de um movimento ascendente forte."),
        tf("Uma zona de oferta garante que o preço vai descer ao lá chegar.", false, "Pode reagir, atravessar ou consumir a zona; não há garantias."),
        mc("Qual é a principal diferença de foco entre suporte/resistência e oferta/procura?", ["Nenhuma", "S/R nasce de reações repetidas; oferta/procura foca-se na origem de movimentos impulsivos", "S/R só existe em futuros", "Oferta/procura é ilegal"], 1, "S/R vem de vários toques; oferta/procura da origem do impulso, mesmo que única."),
      ],
    },
    {
      slug: "base-e-partida",
      title: "Origem do impulso: base e partida",
      summary: "Como reconhecer a base (consolidação) e a partida (candles de expansão) que definem uma zona.",
      minutes: 7,
      content: `Uma zona de oferta/procura costuma ter duas componentes:

## 1. Base
Um conjunto de **candles pequenos** (2 a 5, em geral), com **pouco range**, onde o preço **hesita**. Representa uma região onde houve negociação equilibrada antes do movimento.

## 2. Partida (*departure*)
Candles de **corpo grande**, na mesma direção, que **saem da base** com força — normalmente com range **bem acima do ATR**. É o **impulso** que dá origem à zona.

## Quatro combinações clássicas
| Antes | Base | Depois | Zona |
| --- | --- | --- | --- |
| Descida | pausa | Subida | **Procura** (*drop–base–rally*) |
| Subida | pausa | Subida | Procura de continuação (*rally–base–rally*) |
| Subida | pausa | Descida | **Oferta** (*rally–base–drop*) |
| Descida | pausa | Descida | Oferta de continuação (*drop–base–drop*) |

## Como desenhar
- A **zona** engloba a **base** (pavios incluídos ou só corpos — escolhe uma regra e mantém-na);
- A **partida** não faz parte da zona, serve para a validar;
- Quanto **mais forte** a partida (face ao ATR), mais interessante a zona — mas "forte" é um juízo, não um número mágico.

## Cuidados
- Muitas "bases" são só ruído: se o preço não partiu com clareza, não há zona;
- Zonas em **timeframes superiores** costumam ter mais peso do que em timeframes de 1 ou 5 minutos;
- Uma base que dura muitos candles transforma-se num **range** — usa as ferramentas de suporte/resistência.`,
      example: `No gráfico: 3 candles pequenos (ranges de 40, 35 e 40 pontos; ATR ≈ 50) formam a **base** entre 38.970 e 39.015. Seguem-se dois candles com corpos de **125 e 80 pontos** (acima de 1,5× o ATR): a **partida**.

Zona = **45 pontos** de largura (39.015 − 38.970). Se o preço regressar e a ideia for comprar na reação, o stop lógico fica **abaixo** da zona (por exemplo 38.955), a ~60 pontos de uma entrada em 39.015.`,
      visual: {
        kind: "candles",
        candles: [
          [39100, 39110, 39040, 39050],
          [39050, 39060, 38990, 39000],
          [39000, 39015, 38970, 38990],
          [38990, 39010, 38975, 39000],
          [39000, 39012, 38972, 38985],
          [38985, 39120, 38980, 39110],
          [39110, 39200, 39100, 39190],
          [39190, 39240, 39170, 39230],
        ],
        overlays: [
          { type: "marker", id: "base", index: 3, price: 38975, label: "Base", placement: "below", tone: "muted" },
          { type: "marker", id: "dep", index: 5, price: 39120, label: "Partida", placement: "above", tone: "success" },
          { type: "zone", id: "z", top: 39015, bottom: 38970, fromIndex: 2, toIndex: 4, label: "Zona", tone: "success" },
        ],
        caption: "Base (candles pequenos) e partida (candles de expansão).",
        height: 280,
      },
      takeaways: ["Zona = base (candles pequenos) + partida (candles de expansão).", "Quatro combinações: drop–base–rally, rally–base–rally, rally–base–drop, drop–base–drop.", "Escolhe uma regra de desenho (pavios ou corpos) e mantém-na."],
      quiz: [
        mc("O que é a 'partida' (departure)?", ["A pausa antes do movimento", "Candles de corpo grande que saem da base com força", "O fim do dia", "O gap de abertura"], 1, "É o impulso que dá origem à zona."),
        mc("Rally–base–drop dá origem a…", ["Uma zona de procura", "Uma zona de oferta", "Um suporte", "Nada"], 1, "Subida, pausa e descida: a pausa (base) é a origem de uma descida = zona de oferta."),
        tf("Qualquer grupo de candles pequenos é uma zona válida.", false, "Sem uma partida clara, é só ruído ou range."),
        num("Base entre 38.970 e 39.015. Qual é a largura da zona, em pontos?", 45, 0, "pontos", "39.015 − 38.970 = 45 pontos."),
      ],
    },
    {
      slug: "desequilibrio-e-forca-da-zona",
      title: "Desequilíbrio e força da zona",
      summary: "O que o desequilíbrio descreve de forma observável e o que são interpretações teóricas.",
      minutes: 6,
      content: `Quando o preço **se afasta depressa** de uma zona, com poucos candles e pouca sobreposição, diz-se que há **desequilíbrio** (*imbalance*): durante esse trecho, um lado dominou claramente.

## O que é observável
- Candles **grandes**, seguidos, com **pouca sobreposição** entre si;
- **Fecho perto do extremo** na direção do impulso;
- **Pouco tempo** a negociar em cada nível durante o movimento.

## O que é interpretação
Explicações como "ordens institucionais por preencher" ou "o mercado tem de voltar para equilibrar" são **teorias**: podem fazer sentido, mas **não são observáveis no gráfico** e **não são garantidas**. Usa o que vês — candles, ranges, ATR — e trata o resto como hipótese.

## Força da zona (critérios descritivos)
1. **Partida clara** (impulso acima do ATR);
2. **Pouca sobreposição** na saída;
3. **Zona pequena** face ao impulso (stop curto, melhor R:R potencial);
4. **Alinhada** com a estrutura do timeframe superior;
5. **Não testada** (ou testada poucas vezes).

Estes critérios ajudam a **ordenar** zonas por interesse — não a **prever** o resultado.

> Pergunta útil: "Se o preço voltar a esta zona, o que **não** me deixaria entrar?" Pensa na invalidação antes de pensar no lucro.`,
      example: `Duas zonas, ambas com 45 pontos de largura:

- **Zona A:** partida de **300 pontos** em 3 candles sem sobreposição; alinhada com a tendência do H4;
- **Zona B:** partida de **90 pontos** em 6 candles com muita sobreposição; contra a tendência.

A zona A cumpre mais critérios descritivos e teria um **R:R potencial** muito melhor para um alvo próximo. Isso **não** garante que funcione — só significa que, se tivesses de escolher uma, merece mais atenção.`,
      takeaways: ["Desequilíbrio descreve uma saída rápida de uma zona — observável no gráfico.", "Explicações sobre ordens por preencher são teorias, não factos.", "Os critérios de força ordenam zonas por interesse; não prevêem resultados."],
      quiz: [
        mc("O que descreve o 'desequilíbrio' de forma observável?", ["Ordens institucionais ocultas", "Candles grandes seguidos, com pouca sobreposição", "O volume do dia anterior", "O spread"], 1, "É a saída rápida de uma zona com pouca negociação intermédia."),
        tf("A teoria de que 'o mercado tem de voltar a preencher o desequilíbrio' é um facto comprovado.", false, "É uma hipótese popular; não é observável nem garantida."),
        mc("Qual destas condições torna uma zona mais interessante, descritivamente?", ["Partida fraca", "Partida forte e alinhada com a estrutura do timeframe superior", "Zona muito larga", "Muitos testes anteriores"], 1, "Partida clara e alinhamento aumentam o interesse; não garantem o resultado."),
      ],
    },
    {
      slug: "zonas-frescas-testadas-invalidadas",
      title: "Zonas frescas, testadas e invalidadas",
      summary: "O ciclo de vida de uma zona e o que cada fase significa para o planeamento.",
      minutes: 6,
      content: `Uma zona **muda de estado** à medida que o preço interage com ela.

## Fresca (*fresh*)
O preço **ainda não regressou** à zona desde que ela se formou. É a que atrai mais atenção, porque nenhum comprador ou vendedor a "gastou".

## Testada (*tested*)
O preço **regressou** à zona e reagiu (uma ou mais vezes). Cada teste pode confirmá-la ou **desgastá-la**: quantos mais toques, mais provável é que a oferta/procura inicial já tenha sido absorvida.

## Invalidada (*invalidated*)
O preço **fechou claramente para lá** da zona, no sentido oposto à reação esperada. A zona deixa de ser um bom guia — pode até **inverter o papel** (uma zona de procura rompida pode tornar-se oferta; ver o módulo de Support & Resistance).

## Cuidados
- "Fresca" **não é** "garantida": é só uma etiqueta descritiva;
- A passagem para "testada" ou "invalidada" depende da tua regra (toque? fecho dentro? fecho para lá?). **Define-a e mantém-na**;
- Uma zona **invalidada** não deve ser "ressuscitada" por teimosia: se a ideia falhou, o stop existe para isso;
- Regista no journal o **estado da zona** em cada trade — com o tempo percebes se as tuas zonas frescas valem mais do que as testadas **para ti**.

> O objetivo não é achar a zona perfeita, mas **ter regras claras** para o seu ciclo de vida.`,
      example: `A zona de procura **38.970–39.015** formou-se de manhã.

- 10h00: fresca (preço longe);
- 11h30: o preço regressa e **reage** acima de 39.015 → **testada** (1 toque);
- 14h00: novo regresso, desta vez o preço **fecha em 38.940**, claramente abaixo → **invalidada** pela tua regra de "fecho para lá da zona". Qualquer ideia de compra nesse ponto estaria **errada** — e o stop abaixo de 38.955 teria limitado o dano.`,
      takeaways: ["Fresca (não visitada), testada (reação) e invalidada (fecho para lá da zona).", "Define a tua regra de estado e mantém-na.", "Uma zona invalidada não se ressuscita por teimosia."],
      quiz: [
        mc("O que é uma zona invalidada?", ["Uma zona que nunca foi visitada", "Uma zona cujo preço fechou claramente para lá, no sentido oposto à reação esperada", "Uma zona pequena", "Uma zona do dia anterior"], 1, "Já não serve de guia; pode até inverter o papel."),
        tf("Uma zona fresca garante que o preço vai reagir quando lá chegar.", false, "Fresca é uma etiqueta descritiva, não uma garantia."),
        mc("Qual é uma boa prática com o estado das zonas?", ["Mudar a regra a cada trade", "Definir uma regra e registar o estado da zona no journal", "Ignorar os testes", "Remover as zonas invalidadas sem registo"], 1, "Regras consistentes e registo permitem avaliar o que funciona para ti."),
      ],
    },
    {
      slug: "usar-oferta-e-procura-com-criterio",
      title: "Usar oferta e procura com critério",
      summary: "Integrar zonas com estrutura, níveis e risco — e os erros que mais custam.",
      minutes: 6,
      content: `Uma zona **não é um sinal de entrada**. É uma **localização** que pode fazer sentido num plano completo.

## Integração
1. **Estrutura primeiro:** a zona está a favor da estrutura do timeframe superior? (módulo de Market Structure);
2. **Confluência:** coincide com um nível de suporte/resistência, um Fibonacci ou um nível redondo? (módulo de Confluence);
3. **Confirmação:** o preço mostra algum comportamento na zona (rejeição, mudança de estrutura no timeframe inferior)?
4. **Risco:** stop para lá da zona; alvo antes do próximo obstáculo; **R:R** razoável; tamanho pelo risco.

## Erros frequentes
- **Entrar "à cega" quando o preço toca a zona** (sem confirmação nem plano);
- **Zonas por todo o lado**;
- **Ignorar a tendência dominante** (uma zona de procura contra uma queda forte é um trade contra-tendência);
- **Aumentar o tamanho** porque a zona "parece perfeita";
- **Mexer no stop** quando o preço se aproxima do fim da zona.

## Exercício
No laboratório **Draw Your Levels** podes praticar a marcação de zonas e comparar com a solução educativa. Faz o mesmo no **Chart Replay**: marca as zonas **antes** de avançar candles e regista o que acontece quando o preço volta.

> O melhor teste de uma zona é **como o preço se comporta quando lá regressa** — não a história bonita que contas antes.`,
      example: `Zona de procura 38.970–39.015 **dentro** de uma tendência de alta no H4, coincidente com o suporte de um range anterior e perto do nível redondo 39.000. Três fatores a alinhar: **estrutura**, **zona** e **nível**.

Plano educativo: esperar um candle de rejeição ou uma mudança de estrutura no M15. Entrada em 39.020, stop em 38.955 (**65 pontos**), alvo no máximo anterior a 39.200 (**180 pontos**): **R:R ≈ 2,8:1**. Sem os fatores a alinhar, a mesma zona seria só um desenho no gráfico.`,
      exercise: { kind: "levels", scenarioId: "levels-flip-01", prompt: "Marca as zonas de oferta/procura que vês e compara com a solução educativa." },
      takeaways: ["Uma zona é uma localização, não um sinal de entrada.", "Integra estrutura, confluência, confirmação e risco antes de qualquer decisão.", "Evita entradas 'à cega' no toque e excesso de zonas."],
      quiz: [
        mc("Qual é a ordem mais sensata antes de considerar uma ideia numa zona?", ["Entrada imediata no toque", "Estrutura, confluência, confirmação e risco", "Apenas tamanho", "Apenas hora do dia"], 1, "A zona é só parte do plano: contexto, confirmação e risco completam-no."),
        num("Entrada 39.020, stop 38.955, alvo 39.200. Qual é o R:R, arredondado a 1 casa decimal?", 2.8, 0.05, ":1", "Risco 65 pontos; alvo 180 pontos → 180 ÷ 65 ≈ 2,8.", "CALCULATE_RR"),
        tf("Uma zona 'perfeita' justifica aumentar o tamanho da posição.", false, "O tamanho vem do risco definido; convicção não é razão para aumentar o risco."),
        chart("IDENTIFY_SUPPORT_RESISTANCE", "levels-flip-01", "Neste gráfico, qual região foi, em sequência, resistência e depois suporte?", ["Perto de 38.305", "Perto de 38.150", "Perto de 38.700", "Perto de 38.000"], 0, "A zona perto de 38.305 foi rejeitada, rompida e depois segurou como suporte."),
      ],
    },
  ],
  quiz: {
    title: "Quiz do módulo — Supply & Demand",
    passScore: 70,
    questions: [
      mc("Uma zona de procura é…", ["Região de onde o preço partiu para cima com força no passado", "O preço de fecho", "Um indicador", "Um tipo de ordem"], 0, "É a origem de um movimento ascendente forte."),
      mc("Drop–base–rally dá origem a…", ["Zona de oferta", "Zona de procura", "Um gap", "Nada"], 1, "Descida, pausa e subida: a base é a origem da subida."),
      tf("Oferta/procura garante a reversão quando o preço lá regressa.", false, "Nenhuma zona garante reação."),
      mc("O que é uma zona fresca?", ["Uma zona já testada várias vezes", "Uma zona que o preço ainda não revisitou", "Uma zona nova no timeframe M1", "Uma zona com muito volume"], 1, "Fresca = ainda não revisitada desde a formação."),
      mc("Quando se considera uma zona invalidada?", ["Quando o preço lá regressa", "Quando fecha claramente para lá da zona no sentido oposto à reação esperada", "Quando passa uma hora", "Quando o ATR sobe"], 1, "O fecho para lá da zona invalida a hipótese de reação."),
      num("Base 38.970–39.015 e stop 15 pontos abaixo da zona (38.955). Entrada em 39.015. Quantos pontos de risco?", 60, 0, "pontos", "39.015 − 38.955 = 60 pontos."),
      num("Zona com stop a 60 pontos, MYM ($0,50/ponto) e orçamento de $90. Quantos contratos?", 3, 0, "contratos", "Risco por MYM = 60 × $0,50 = $30; $90 ÷ $30 = 3.", "POSITION_SIZE"),
      chart("IDENTIFY_SUPPORT_RESISTANCE", "levels-range-01", "Qual região deste gráfico seria uma candidata a zona de oferta (origem de descidas)?", ["Perto de 38.600", "Perto de 38.300", "Perto de 38.450", "Nenhuma"], 0, "Três máximos rejeitados perto de 38.600: o preço partiu daí para baixo várias vezes."),
      mc("Qual é uma explicação teórica (não observável) frequentemente associada ao desequilíbrio?", ["Candles grandes sem sobreposição", "Ordens por preencher que obrigam o preço a regressar", "Fecho perto do extremo", "Range acima do ATR"], 1, "É uma teoria; o que se observa são candles e ranges."),
      tf("Aumentar o tamanho quando a zona parece perfeita é boa gestão.", false, "O tamanho vem do risco definido, não da convicção."),
    ],
  },
};
