import { chart, mc, num, tf } from "../dsl";
import type { ModuleDef } from "../types";

/** Module 05 — Support & Resistance (Level 2). Connects to the "Draw Your Levels" lab. */
export const supportResistance: ModuleDef = {
  slug: "support-resistance",
  number: 5,
  level: 2,
  title: "Support & Resistance",
  summary: "Níveis horizontais e de swing, máximos/mínimos anteriores (PDH/PDL/PWH/PWL), níveis psicológicos, inversão suporte↔resistência e a diferença entre zonas e linhas exatas.",
  difficulty: "BEGINNER",
  icon: "Minus",
  lessons: [
    {
      slug: "suporte-e-resistencia",
      title: "O que são suporte e resistência",
      summary: "Zonas onde o preço já reagiu — e porque tendem a ser observadas outra vez.",
      minutes: 6,
      content: `- **Suporte:** região de preço **abaixo** do preço atual onde, no passado, a **procura** conseguiu travar quedas;
- **Resistência:** região **acima** onde a **oferta** conseguiu travar subidas.

## Porque se formam
Muita gente olha para os **mesmos** pontos do gráfico — máximos e mínimos anteriores, números redondos — e deixa **ordens** perto deles: entradas, stops, alvos. Por isso o preço tende a **reagir** nessas zonas. Isto é uma **hipótese útil** sobre comportamento coletivo, não uma lei.

## O que se pode afirmar (e o que não)
- ✔ O preço **já reagiu** ali, e vale a pena **observar** o que faz quando lá voltar;
- ✘ "O preço **vai** inverter aqui". Pode inverter, atravessar ou ficar lateralizado.

## Duas utilidades principais
1. **Contexto e planeamento:** onde faz sentido o stop, onde está o próximo obstáculo antes do alvo?
2. **Localização:** uma ideia a favor da estrutura tem mais sentido perto de um nível do que "no ar".

> Quanto mais claro e testado um nível, mais atenção ele recebe — mas também pode ser mais **visitado e esgotado**. Nenhum nível é imune a rompimentos.`,
      example: `No gráfico acima, o preço **rejeita três vezes** uma zona perto de **38.600** e **três vezes** uma zona perto de **38.300**. Entre elas, o mercado oscila num range de cerca de **300 pontos**.

Um aluno que apenas "vê" os níveis pode planear: perto do suporte, qual seria o stop lógico (abaixo da zona) e qual o primeiro obstáculo (a resistência de cima, a ~300 pontos)? Isso dá uma noção de **R:R potencial** antes de entrar.`,
      visual: { kind: "scenario", scenarioId: "levels-range-01", annotations: "none", caption: "Três rejeições em cima e três em baixo definem um suporte e uma resistência claros." },
      exercise: { kind: "levels", scenarioId: "levels-range-01", prompt: "Desenha as zonas de suporte e resistência deste gráfico e compara com a solução educativa." },
      takeaways: ["Suporte e resistência são zonas onde o preço já reagiu no passado.", "Formam-se porque muitos participantes observam os mesmos pontos — uma hipótese, não uma lei.", "Servem para contexto, localização e planeamento do stop e do alvo."],
      quiz: [
        mc("O que é uma resistência?", ["Região acima do preço onde a oferta travou subidas no passado", "Uma ordem de venda", "Um indicador", "O preço mais baixo do dia"], 0, "Resistência = região de preço acima onde a oferta já travou subidas."),
        tf("Um suporte garante que o preço vai subir quando lá chegar.", false, "O preço já reagiu ali no passado; no futuro pode atravessar o nível."),
        chart("IDENTIFY_SUPPORT_RESISTANCE", "levels-range-01", "Neste gráfico, qual é a zona de resistência claramente testada?", ["Perto de 38.600", "Perto de 38.450", "Perto de 38.000", "Não existe"], 0, "Três máximos próximos de 38.600 foram rejeitados."),
        chart("IDENTIFY_SUPPORT_RESISTANCE", "levels-range-01", "E o suporte?", ["Perto de 38.300", "Perto de 38.600", "Perto de 38.900", "Perto de 39.000"], 0, "Três mínimos próximos de 38.300 seguraram o preço."),
      ],
    },
    {
      slug: "zonas-vs-linhas",
      title: "Zonas em vez de linhas exatas",
      summary: "Porque um nível deve ser desenhado como uma faixa, e como definir a largura com a ajuda do ATR.",
      minutes: 6,
      content: `Quem desenha um nível como uma **linha de 1 ponto** assume uma precisão que o mercado não tem. Os toques raramente coincidem ao ponto: um máximo fica em 38.600, o seguinte em 38.605, outro em 38.595. A informação está na **zona**.

## Como desenhar uma zona
1. Marca os **swings** que reagiram na região;
2. Considera **os extremos dos pavios e os fechos dos corpos**: a zona engloba onde o preço "andou";
3. A **largura** deve ser razoável face à volatilidade. Um ponto de partida: entre **0,3 e 0,5 × ATR** (convenção a testar, não regra);
4. Zonas **demasiado largas** perdem utilidade (stops longos); **demasiado estreitas** falham por pouco.

## Porque importa para o risco
- O **stop** costuma ficar **para lá da zona**, não "em cima da linha";
- O **alvo** costuma ficar **antes** da zona seguinte (para não depender de um nível que pode rejeitar);
- A largura da zona entra no cálculo de **tamanho de posição**.

## Qualidade de uma zona
- **Nº de toques** (mais toques = mais testada, mas também mais gasta);
- **Idade** (níveis recentes costumam ser mais relevantes que antigos);
- **Reação** forte (candles grandes a afastar-se do nível) ou fraca;
- **Visibilidade**: é óbvia no timeframe superior?

> Desenha o nível **depois** de olhares para o gráfico do timeframe superior. O que parece óbvio no M5 pode ser ruído no H4.`,
      example: `Máximos rejeitados em **38.600, 38.605 e 38.595**. O ATR de 15 min é ≈ **50 pontos**. Uma zona de **0,4 × ATR** = 20 pontos: **38.585–38.625**.

Se pensares em vender na rejeição, o stop lógico fica **acima da zona**, por exemplo 38.640. Com entrada em 38.595, o risco é **45 pontos** — não os 5 que um nível "exato" sugeriria. Esse número é que determina o tamanho da posição.`,
      visual: { kind: "scenario", scenarioId: "levels-range-01", annotations: "none", caption: "Os toques não coincidem exatamente: o nível é uma zona." },
      takeaways: ["Os níveis são zonas, não linhas de 1 ponto.", "A largura razoável depende da volatilidade; 0,3–0,5 × ATR é um ponto de partida a testar.", "O stop costuma ficar para lá da zona e o alvo antes da próxima."],
      quiz: [
        mc("Porque é que um nível deve ser desenhado como zona?", ["Porque é mais bonito", "Porque os toques raramente coincidem ao ponto", "Porque o broker obriga", "Porque o ATR é fixo"], 1, "Os swings reagem numa região, não num ponto exato."),
        num("ATR de 15 min = 60 pontos. Qual é a largura de uma zona de 0,5 × ATR, em pontos?", 30, 0, "pontos", "0,5 × 60 = 30 pontos de largura."),
        tf("Quanto mais larga a zona, melhor, porque assim nunca falha.", false, "Zonas demasiado largas obrigam a stops longos e reduzem a utilidade."),
        mc("Onde costuma ficar o stop de uma ideia baseada na rejeição de uma resistência?", ["Em cima da linha", "Para lá da zona", "Sempre a 5 pontos", "Não se usa"], 1, "O stop deve ficar além da zona, onde a ideia deixa de fazer sentido."),
      ],
    },
    {
      slug: "maximos-e-minimos-anteriores",
      title: "Máximos e mínimos anteriores: PDH, PDL, PWH, PWL",
      summary: "Os níveis mais observados por todos: o máximo e o mínimo do dia e da semana anteriores.",
      minutes: 6,
      content: `Alguns dos níveis mais úteis são **objetivos**: qualquer pessoa os encontra no gráfico e são observados por muita gente.

- **PDH** — *Previous Day High*: máximo do dia anterior;
- **PDL** — *Previous Day Low*: mínimo do dia anterior;
- **PWH** — *Previous Week High*: máximo da semana anterior;
- **PWL** — *Previous Week Low*: mínimo da semana anterior.

Há ainda os **máximos e mínimos de sessão** (por exemplo, o máximo da sessão asiática ou o da abertura de Nova Iorque) e o **máximo/mínimo de swing** mais recente.

## Para que servem
- Marcam **limites do contexto**: acima do PDH o preço está "a fazer novos máximos" face a ontem;
- São **referências de planeamento**: alvos, zonas de reação e áreas onde se espera mais atividade;
- Alinham-se frequentemente com outros fatores (um PDL a coincidir com um suporte antigo e um nível redondo = **confluência**).

## Cuidados
- A definição de "dia" depende da **plataforma e do fuso horário** (o dia de futuros e o dia civil não coincidem). **Define a tua convenção** e usa-a sempre;
- Um PDH rompido pode ser rompimento verdadeiro ou **rompimento falso** (varrer o nível e voltar);
- Nenhum destes níveis garante reação.

> Marca estes níveis **antes** de a sessão começar, no teu Daily Trading Plan — assim decides com calma e não a meio do movimento.`,
      example: `Ontem o Dow fez máximo **39.180** e mínimo **38.920** (range de 260 pontos). Esta semana, a abertura é em **39.050**.

- **PDH = 39.180**, **PDL = 38.920**;
- Dentro do range de ontem, o preço está **no meio** (39.050): não há nível próximo;
- Se subir até ao PDH, o que acontece ali é informação: rompe e aguenta, ou varre e rejeita?

Antes de agir, regista no plano: "Se romper 39.180 e fechar acima, espero…; se rejeitar, espero…; invalida em…".`,
      exercise: { kind: "link", href: "/tools/daily-plan", label: "Abrir o Daily Trading Plan", prompt: "Marca PDH, PDL, PWH e PWL no teu plano diário (podes usar valores do teu gráfico)." },
      takeaways: ["PDH/PDL/PWH/PWL são níveis objetivos e muito observados.", "Define uma convenção de 'dia' (fuso e sessão) e mantém-na.", "Marca-os antes da sessão no teu plano; nenhum garante reação."],
      quiz: [
        mc("O que é o PDL?", ["Preço de fecho da semana", "Mínimo do dia anterior", "Máximo da semana anterior", "Preço de abertura"], 1, "PDL = Previous Day Low."),
        tf("O dia de futuros e o dia civil coincidem sempre, por isso não é preciso definir convenção.", false, "Dependem da plataforma e do fuso; define a tua convenção e usa-a sempre."),
        mc("Qual é o principal valor de marcar estes níveis antes da sessão?", ["Prever o resultado", "Decidir com calma e planear cenários antes do movimento", "Evitar custos", "Garantir execução"], 1, "Planear antecipadamente evita decisões impulsivas a meio do movimento."),
      ],
    },
    {
      slug: "niveis-psicologicos",
      title: "Níveis psicológicos (números redondos)",
      summary: "Porque 39.000 ou 40.000 chamam a atenção — e porque isso não os torna mágicos.",
      minutes: 5,
      content: `**Níveis psicológicos** são números **redondos** que atraem a atenção humana: 39.000, 39.500, 40.000. Há várias razões possíveis para o preço reagir perto deles:

- Muitas pessoas colocam **alvos e stops** em números redondos;
- Têm presença nos **títulos de notícias** ("o Dow ultrapassa os 40.000");
- Servem de referência mental para **opções** e **objetivos** de investidores.

São **hipóteses razoáveis**, não factos garantidos.

## Hierarquia
- **Milhares** (39.000, 40.000) tendem a ser mais notados do que **centenas** (39.100) e muito mais do que **dezenas**;
- A reação costuma ocorrer numa **zona** à volta do número, não exatamente nele.

## Como usá-los
- Como **confluência**: um nível redondo que coincide com um suporte testado e um Fibonacci merece mais atenção do que cada um isolado;
- Como **referência de alvo** parcial: antes de um número redondo costuma haver atividade;
- **Sem** os tratar como "paredes": muitas vezes são atravessados sem pausa.

## Cuidado com o viés de confirmação
É fácil encontrar reações em números redondos **depois** do facto — o cérebro lembra-se das vezes em que funcionou e esquece as outras. Para testar a sério, regista casos em journal e em backtests.`,
      example: `O Dow sobe para **39.990** e recua **120 pontos** a partir de 40.000. Parece "o nível funcionou". Mas, noutra semana, o índice atravessou 39.000 sem pausa. Se só registares o primeiro caso, concluirás que o número redondo é sempre relevante — um exemplo de **viés de seleção**.`,
      takeaways: ["Níveis redondos atraem atenção e ordens — uma hipótese razoável, não uma garantia.", "Milhares > centenas > dezenas em relevância típica; a reação é numa zona.", "Combina com outros fatores e testa com registo e backtest para evitar viés de confirmação."],
      quiz: [
        mc("Qual é uma possível razão para o preço reagir em números redondos?", ["Garantia legal", "Concentração de ordens e atenção dos participantes", "Fórmula matemática exata", "Ordem do broker"], 1, "Muitos participantes colocam alvos e stops em números redondos, concentrando ordens."),
        tf("O preço inverte sempre em 40.000.", false, "Pode reagir, atravessar ou lateralizar; é uma hipótese, não um facto."),
        mc("Como evitar o viés de confirmação com níveis redondos?", ["Lembrar só dos casos em que funcionou", "Registar todos os casos em journal e testar em backtests", "Ignorar os que falharam", "Aumentar o tamanho"], 1, "Registos completos e testes impedem que a memória seletiva distorça a conclusão."),
      ],
    },
    {
      slug: "suporte-vira-resistencia",
      title: "Suporte que vira resistência (e vice-versa)",
      summary: "A inversão de papéis dos níveis depois de um rompimento — e como pode falhar.",
      minutes: 6,
      content: `Quando um nível **é rompido**, é comum que o seu **papel se inverta**:

- Uma **resistência** rompida para cima pode passar a **suporte**;
- Um **suporte** rompido para baixo pode passar a **resistência**.

## A ideia
- Quem vendeu perto da resistência pode estar "preso" quando o preço sobe acima — e aproveita o regresso ao nível para sair;
- Quem não comprou antes do rompimento pode ver no **reteste** uma segunda oportunidade;
- O nível passa a ser referenciado **pelo outro lado**.

## O reteste
O momento mais observado é o **reteste**: o preço volta ao nível rompido e reage (ou não). Três resultados possíveis:
1. **Reage a favor do rompimento** (nível invertido aguenta);
2. **Regressa para dentro** do range — o rompimento era **falso**;
3. **Fica lateral** e perde direção.

## Como pensar em risco
- A invalidação costuma ficar **do outro lado** do nível (se tornou suporte, perde sentido se o preço fechar claramente abaixo);
- A inversão é **frequentemente invocada** — mas há muitos casos em que o nível rompido é só atravessado;
- Procura **confirmação** no reteste (por exemplo, um candle de rejeição ou uma mudança de estrutura no timeframe inferior).`,
      example: `No gráfico, a zona perto de **38.305** rejeita o preço três vezes e depois é rompida. O preço sobe para 38.520 e volta a **38.302**: o reteste reage e retoma a subida.

Uma ideia educativa: comprar a reação no reteste, com invalidação abaixo de ~38.285 (perto de **20 pontos**). Mas se tivesse **fechado** claramente abaixo da zona, o rompimento teria sido falso e a ideia estaria invalidada — **o stop existe para esse caso**.`,
      visual: { kind: "scenario", scenarioId: "levels-flip-01", annotations: "none", caption: "Uma resistência testada três vezes é rompida e depois testada por cima como suporte." },
      exercise: { kind: "levels", scenarioId: "levels-flip-01", prompt: "Marca as zonas deste gráfico. Qual passou de resistência a suporte?" },
      takeaways: ["Níveis rompidos tendem a inverter o papel — mas nem sempre.", "O reteste é o momento mais observado; pode confirmar ou falhar.", "A invalidação fica do outro lado do nível."],
      quiz: [
        mc("O que acontece frequentemente quando uma resistência é rompida para cima?", ["Desaparece", "Pode passar a atuar como suporte", "Passa a ser stop", "Torna-se um gap"], 1, "É a inversão de papéis: a resistência rompida pode tornar-se suporte."),
        tf("Um nível rompido torna-se sempre suporte ou resistência do outro lado.", false, "É comum, mas não é regra; pode ser atravessado sem reação."),
        chart("IDENTIFY_SUPPORT_RESISTANCE", "levels-flip-01", "Neste gráfico, qual zona passou de resistência a suporte?", ["Perto de 38.305", "Perto de 38.150", "Perto de 38.600", "Nenhuma"], 0, "A zona perto de 38.305 foi rejeitada três vezes, rompida e depois segurou o reteste."),
        mc("O que invalida uma ideia de compra no reteste de uma resistência rompida?", ["Subir mais um ponto", "Fecho claramente abaixo da zona rompida", "O volume subir", "Mais um candle verde"], 1, "Se o preço regressa abaixo do nível, o rompimento foi falso e a ideia perde sentido."),
      ],
    },
    {
      slug: "qualidade-dos-niveis-e-erros-comuns",
      title: "Qualidade dos níveis e erros comuns",
      summary: "Menos é mais: como escolher os níveis que importam e evitar encher o gráfico de linhas.",
      minutes: 6,
      content: `Um gráfico cheio de linhas não é um gráfico bem analisado. A pergunta é: **que níveis mudam a decisão?**

## Critérios para um nível relevante
- **Visibilidade** no timeframe superior;
- **Reações claras** (afastamento forte do nível) e **mais de um toque**;
- **Recência**: o mercado "esquece" níveis muito antigos;
- **Confluência** com outro fator (PDH/PDL, nível redondo, Fibonacci, linha de tendência);
- **Utilidade**: ajuda a definir stop, alvo ou localização.

## Erros comuns
1. **Linhas por todo o lado** — se tudo é nível, nada é nível;
2. **Linhas exatas** em vez de zonas;
3. **Forçar** o gráfico a obedecer ao nível (o preço não "deve" nada ao teu traço);
4. **Ignorar o contexto** (um suporte numa tendência de baixa forte tem menos peso);
5. **Esquecer a invalidação**: um nível é uma referência, não um seguro;
6. **Mudar os níveis a posteriori** para encaixar no trade.

## Laboratório: Draw Your Levels
Pratica no laboratório: desenha as zonas de um gráfico e compara com uma **solução educativa**. A pontuação premeia a **identificação de zonas relevantes** com largura razoável — não é preciso acertar ao ponto.

> Tenta desenhar **poucos níveis, bons**. A seguir, compara com a solução e percebe o que escapou ou o que era excesso.`,
      example: `Num gráfico de 300 pontos de range, marcar 15 linhas dá um nível a cada 20 pontos: o preço "reage" em todas só porque há linhas por todo o lado. Com **2 a 4 zonas** (as que tiveram várias rejeições claras) a análise é mais limpa e acionável.`,
      exercise: { kind: "levels", scenarioId: "levels-range-01", prompt: "Desenha o menor número de zonas que descrevam bem este gráfico." },
      takeaways: ["Escolhe poucos níveis, com reações claras, recentes e visíveis no timeframe superior.", "Evita linhas exatas, excesso de níveis e ajustes a posteriori.", "Um nível é uma referência, não um seguro: define sempre invalidação."],
      quiz: [
        mc("Qual é um erro comum ao marcar níveis?", ["Usar zonas", "Encher o gráfico de linhas", "Olhar para o timeframe superior", "Registar no journal"], 1, "Demasiados níveis transformam tudo em referência e a análise perde utilidade."),
        tf("Um nível testado muitas vezes está sempre mais forte.", false, "Pode estar mais testado, mas também mais gasto; avalia o contexto."),
        mc("O que fazer com a pontuação do laboratório Draw Your Levels?", ["Ver só se acertaste ao ponto", "Usar como feedback sobre zonas relevantes e largura razoável", "Ignorar a solução", "Copiar a resposta"], 1, "A comparação com a solução educativa mostra o que escapou e o que era excesso."),
      ],
    },
  ],
  quiz: {
    title: "Quiz do módulo — Support & Resistance",
    passScore: 70,
    questions: [
      mc("Qual é a melhor descrição de um suporte?", ["Uma linha exata que o preço nunca atravessa", "Uma região onde a procura travou quedas no passado", "Um indicador", "O preço mais baixo de sempre"], 1, "Suporte = região onde a procura já travou quedas; pode ser atravessada no futuro."),
      chart("IDENTIFY_SUPPORT_RESISTANCE", "levels-range-01", "Neste gráfico, a zona de resistência está perto de…", ["38.300", "38.600", "38.450", "39.000"], 1, "Três máximos rejeitados perto de 38.600."),
      chart("IDENTIFY_SUPPORT_RESISTANCE", "levels-flip-01", "Qual zona deste gráfico inverteu o seu papel após o rompimento?", ["Perto de 38.305 (resistência que passou a suporte)", "Perto de 38.150", "Perto de 38.600", "Nenhuma"], 0, "A zona perto de 38.305 foi rompida e depois segurou como suporte."),
      mc("Como se deve desenhar um nível?", ["Como linha de 1 ponto", "Como zona, com largura razoável face à volatilidade", "Sempre a 100 pontos", "Não se desenha"], 1, "Os toques não coincidem ao ponto; a zona descreve melhor a região."),
      num("ATR = 40 pontos. Qual é a largura de uma zona de 0,4 × ATR, em pontos?", 16, 0, "pontos", "0,4 × 40 = 16 pontos."),
      mc("O que é o PWH?", ["Preço de abertura da semana", "Máximo da semana anterior", "Mínimo do mês", "Preço médio"], 1, "PWH = Previous Week High."),
      tf("O dia de futuros e o dia civil coincidem sempre.", false, "Dependem da plataforma e do fuso: define a tua convenção."),
      mc("Qual é uma boa razão para considerar um número redondo como referência?", ["É uma lei do mercado", "Concentra atenção e ordens de muitos participantes", "Elimina o risco", "É definido pelo CME"], 1, "É uma hipótese comportamental, não uma lei."),
      mc("Num reteste de uma resistência rompida, um fecho claramente abaixo da zona significa…", ["Que o rompimento falhou e a ideia perdeu sentido", "Que o preço vai subir", "Que o stop deve ser retirado", "Nada"], 0, "O regresso abaixo do nível rompido invalida a ideia de continuação."),
      num("Entrada em 38.595 (venda), stop em 38.640. Quantos pontos de risco por contrato?", 45, 0, "pontos", "Risco = 38.640 − 38.595 = 45 pontos."),
    ],
  },
};
