import { chart, mc, num, tf } from "../dsl";
import type { ModuleDef } from "../types";

/**
 * Module 07 — Market Structure (Level 3). The most important module: everything later builds on it.
 * Numbers come from the DEMO scenarios (synthetic data) so they match what the labs show.
 */
export const marketStructure: ModuleDef = {
  slug: "market-structure",
  number: 7,
  level: 3,
  title: "Market Structure",
  summary: "Swings, HH/HL/LH/LL, estrutura bullish e bearish, mercado lateral e consolidação, recuo, continuação, expansão e mudança de estrutura — com exercícios interativos validados pelo sistema.",
  difficulty: "FOUNDATION",
  icon: "Waypoints",
  lessons: [
    {
      slug: "swings-altos-e-baixos",
      title: "Swing highs e swing lows",
      summary: "Os pontos de viragem do preço, como se definem objetivamente e porque só se confirmam depois.",
      minutes: 7,
      content: `A estrutura de mercado é construída com **swings** — os pontos de viragem do preço.

- **Swing high (máximo de swing):** um máximo local, mais alto do que os candles à volta;
- **Swing low (mínimo de swing):** um mínimo local, mais baixo do que os candles à volta.

## Uma definição objetiva
Para não depender do "olhómetro", esta plataforma usa uma regra **fractal**: um candle é **swing high** se o seu **máximo** é estritamente superior ao máximo dos **3 candles anteriores** e dos **3 seguintes** (e o inverso para swing low). Os swings consecutivos do mesmo tipo são reduzidos ao mais extremo, para que **máximos e mínimos se alternem**.

> Há muitas definições possíveis (2/2, 5/5, por percentagem, por ATR). O importante é **escolher uma regra e ser consistente**.

## Uma limitação importante: a confirmação
Com a regra 3/3, um swing só **fica confirmado 3 candles depois**. Em tempo real, o último candle "parece" um swing e depois o preço continua e a ideia desaparece. Por isso:

- Em **revisão** (gráfico passado) tudo parece óbvio — é o **viés retrospetivo** (*hindsight bias*);
- Em **tempo real**, tens de trabalhar com swings **confirmados** e aceitar que o mais recente ainda pode mudar.

## O que o swing representa
Um swing high é um ponto onde os vendedores conseguiram, naquele momento, travar a subida; um swing low, onde os compradores travaram a descida. A **sequência** desses pontos é que conta a história.`,
      example: `Num gráfico de M15, o preço sobe até **38.240**, recua até **38.090** e sobe de novo até **38.420**. Os pontos 38.240 (máximo), 38.090 (mínimo) e 38.420 (máximo) são **swings**: cada um é o extremo dos candles à volta.

Mas atenção ao tempo real: se o último máximo acabou de ser feito há 2 candles, **ainda não está confirmado** com a regra 3/3. Se o candle seguinte fizer um máximo mais alto, o "swing" anterior nunca chegou a existir.`,
      visual: { kind: "scenario", scenarioId: "structure-bull-01", annotations: "solution", caption: "Swings marcados num gráfico de alta (solução educativa)." },
      takeaways: ["Swings são os pontos de viragem do preço; a estrutura nasce da sua sequência.", "Define uma regra objetiva (por exemplo, fractal 3/3) e mantém-na.", "Em tempo real, os swings só se confirmam depois: cuidado com o viés retrospetivo."],
      quiz: [
        mc("O que é um swing high pela regra fractal 3/3?", ["Qualquer máximo do dia", "Um candle cujo máximo é superior ao dos 3 anteriores e dos 3 seguintes", "O máximo da semana", "Um candle verde"], 1, "A regra compara o máximo com 3 candles de cada lado."),
        tf("Os swings recentes estão sempre confirmados.", false, "Com a regra 3/3, o swing só se confirma 3 candles depois: o mais recente pode ainda mudar."),
        mc("O que é o viés retrospetivo (hindsight bias) na análise de estrutura?", ["Usar timeframes diferentes", "Achar tudo óbvio no gráfico passado e ignorar a incerteza do tempo real", "Usar indicadores", "Operar à noite"], 1, "Em revisão os swings parecem claros; em tempo real ainda não estão confirmados."),
        mc("Para que os máximos e mínimos de swing se alternem, o que se faz com swings consecutivos do mesmo tipo?", ["Mantêm-se todos", "Reduz-se ao mais extremo", "Apaga-se o primeiro", "Ignora-se o volume"], 1, "Mantém-se o mais extremo, para que o zig-zag alterne."),
      ],
    },
    {
      slug: "hh-hl-lh-ll",
      title: "HH, HL, LH e LL: etiquetar a estrutura",
      summary: "Como etiquetar cada swing comparando-o com o anterior do mesmo tipo — e o que a sequência diz.",
      minutes: 7,
      content: `Cada swing é **etiquetado** comparando-o com o **swing anterior do mesmo tipo**:

| Swing | Comparação | Etiqueta |
| --- | --- | --- |
| Máximo | acima do máximo anterior | **HH** (*Higher High*) |
| Máximo | abaixo do máximo anterior | **LH** (*Lower High*) |
| Mínimo | acima do mínimo anterior | **HL** (*Higher Low*) |
| Mínimo | abaixo do mínimo anterior | **LL** (*Lower Low*) |

O **primeiro máximo** e o **primeiro mínimo** de um gráfico **ficam sem etiqueta**, porque ainda não há swing anterior do mesmo tipo para comparar.

## O que as sequências dizem
- **HH + HL:** compradores a conseguir mais altura e a defender os recuos → estrutura de **alta**;
- **LH + LL:** vendedores a dominar os repiques e a empurrar para novos mínimos → estrutura de **baixa**;
- **Misturas** (HH com LL, ou LH com HL): sinais contraditórios → estrutura **lateral/indefinida**.

## Passo a passo para etiquetar
1. Marca todos os swings (máximos e mínimos) em ordem temporal;
2. Para cada máximo, compara com o **máximo** anterior; para cada mínimo, com o **mínimo** anterior;
3. Escreve a etiqueta; lê a **sequência mais recente**, não a história toda.

## Prática
Faz o exercício **Market Structure Lab**: clica nos swings e etiqueta cada um. O sistema valida a resposta e explica onde falhaste.`,
      example: `No gráfico de alta: máximos **38.240** (sem etiqueta), **38.420 (HH)**, **38.610 (HH)**, **38.800 (HH)**; mínimos **38.090** (sem etiqueta), **38.250 (HL)**, **38.440 (HL)**, **38.650 (HL)**. A sequência HH/HL ao longo de 4 oscilações descreve claramente uma estrutura de alta.

Já no gráfico de baixa os máximos e mínimos descem sempre: LH e LL em sequência.`,
      visual: { kind: "scenario", scenarioId: "structure-bear-01", annotations: "solution", caption: "Estrutura de baixa: LH e LL em sequência." },
      exercise: { kind: "structure", scenarioId: "structure-bull-01", prompt: "Marca os swings e etiqueta cada um (HH, HL, LH ou LL)." },
      takeaways: ["Cada swing compara-se com o anterior do mesmo tipo: HH/LH nos máximos, HL/LL nos mínimos.", "O primeiro máximo e o primeiro mínimo ficam sem etiqueta.", "A sequência mais recente é o que interessa; sinais mistos significam estrutura indefinida."],
      quiz: [
        mc("Um mínimo de 38.250 depois de um mínimo de 38.090 é um…", ["HH", "HL", "LH", "LL"], 1, "Mínimo mais alto que o anterior = HL."),
        mc("Um máximo de 38.520 depois de um máximo de 38.620 é um…", ["HH", "HL", "LH", "LL"], 2, "Máximo mais baixo que o anterior = LH."),
        chart("IDENTIFY_STRUCTURE", "structure-bull-01", "Que estrutura mostra este gráfico?", ["Bullish (HH/HL)", "Bearish (LH/LL)", "Lateral", "Sem swings"], 0, "Sequência de máximos e mínimos progressivamente mais altos."),
        chart("IDENTIFY_STRUCTURE", "structure-bear-01", "Observa o gráfico apresentado: que estrutura mostra?", ["Bullish (HH/HL)", "Bearish (LH/LL)", "Lateral", "Sem swings"], 1, "Máximos e mínimos progressivamente mais baixos."),
      ],
    },
    {
      slug: "estrutura-bullish-e-bearish",
      title: "Estrutura bullish e bearish: o que a sequência implica",
      summary: "O último HL (ou LH) como ponto de invalidação, e como a estrutura serve de contexto — não de previsão.",
      minutes: 7,
      content: `A estrutura de alta (HH + HL) e a de baixa (LH + LL) são **descrições do passado recente** que dão **contexto** para decisões.

## Ponto-chave: o último HL (ou LH)
- Numa estrutura de **alta**, o **último HL** é o mínimo que, **se quebrado**, destrói a sequência de mínimos mais altos. É o ponto onde a tese "alta" deixa de se sustentar;
- Numa estrutura de **baixa**, é o **último LH**.

Isto torna a estrutura **útil para o risco**: dá um local lógico para a **invalidação** (stop) de uma ideia a favor da estrutura.

## Como a estrutura é usada
- Como **contexto**: ideias a favor da estrutura dominante;
- Como **referência de invalidação**: abaixo do último HL (ou acima do último LH);
- Como **ponto de partida** para procurar zonas de entrada (recuos até níveis, zonas ou Fibonacci).

## O que a estrutura NÃO faz
- **Não prevê** o próximo swing;
- **Não garante** continuação — qualquer estrutura de alta pode virar;
- **Não é igual em todos os timeframes** (ver lição de multi-timeframe).

> A pergunta útil é: "**Se esta estrutura estiver certa, onde ficaria a minha ideia errada?**" A resposta é quase sempre o último HL ou LH.`,
      example: `Estrutura de alta com **último HL em 38.430**. Uma ideia de continuação de alta, com entrada em 38.520 e a invalidação **abaixo de 38.430** (por exemplo 38.420), tem **100 pontos** de risco. Se o preço fecha abaixo de 38.430, o HL é quebrado, a sequência de mínimos mais altos acaba e a ideia perde sentido.

O stop não "prova" nada: apenas **limita o custo de estar errado**.`,
      takeaways: ["O último HL (alta) ou LH (baixa) é a referência natural de invalidação.", "A estrutura dá contexto e referência de risco; não prevê nem garante continuação.", "Pergunta-te: 'se estiver certo, onde fica a minha ideia errada?'"],
      quiz: [
        mc("Numa estrutura de alta, qual é a referência natural de invalidação?", ["O último HH", "O último HL", "A abertura do dia", "O PDH"], 1, "A quebra do último HL destrói a sequência de mínimos mais altos."),
        tf("Uma estrutura de alta garante que o próximo swing será um HH.", false, "A estrutura descreve o passado recente; não prevê o próximo swing."),
        num("Entrada 38.520, invalidação em 38.420. Quantos pontos de risco por contrato?", 100, 0, "pontos", "38.520 − 38.420 = 100 pontos."),
        mc("Qual é a pergunta mais útil depois de ler a estrutura?", ["Qual será o próximo candle?", "Se a estrutura estiver certa, onde fica a minha ideia errada?", "Quantos contratos posso abrir?", "Qual é o melhor indicador?"], 1, "A estrutura é útil sobretudo para definir invalidação e risco."),
      ],
    },
    {
      slug: "mercado-lateral-e-consolidacao",
      title: "Mercado lateral e consolidação",
      summary: "Quando os swings se sobrepõem: os limites do range e os rompimentos falsos.",
      minutes: 7,
      content: `Quando **máximos e mínimos se sobrepõem** sem progressão clara, o mercado está **lateral** (*ranging*). A etiquetagem mistura HH, LH, HL e LL — sinais **contraditórios**, o que por si só é informação.

## Consolidação
Uma **consolidação** é uma pausa em que o preço oscila numa faixa **estreita** depois de um movimento. Pode terminar com **continuação** na direção anterior, **reversão** ou **rompimento falso**.

## Como se comporta o preço num range
- **Respeita** dois limites (zona superior e zona inferior);
- Tem **rejeições** nos extremos;
- A **meio** do range não há informação: é terra de ninguém.

## Riscos específicos
- **Rompimentos falsos:** o preço fura o limite e regressa — armadilhas frequentes;
- **Ruído:** tentar prever direção dentro do range dá muitas entradas pequenas e muitos custos;
- **Sobre-negociar** por tédio — um erro psicológico clássico.

## Formas de trabalhar um range
1. **Esperar** pelo rompimento claro e pelo reteste;
2. **Operar os extremos** com stops curtos para lá da zona e alvo no extremo oposto (contra-tendência de curto prazo, **com custos e risco** próprios);
3. **Não operar** — é uma decisão válida.

> A decisão de **não** negociar um range sem vantagem clara é parte do processo.`,
      example: `No gráfico lateral, o preço oscila entre **~38.200** e **~38.490** (cerca de **290 pontos**) durante várias horas. Os extremos têm 3 a 4 toques cada. A meio (38.350) não há nada.

Um aluno que entra a meio do range por impaciência fica com um stop sem sentido técnico. Quem espera os extremos, ou o rompimento com reteste, tem pelo menos uma **referência clara** para invalidar a ideia.`,
      visual: { kind: "scenario", scenarioId: "structure-range-01", annotations: "solution", caption: "Mercado lateral: swings sobrepostos, rótulos misturados." },
      exercise: { kind: "structure", scenarioId: "structure-range-01", prompt: "Etiqueta os swings deste gráfico. A estrutura é bullish, bearish ou lateral?" },
      takeaways: ["Swings sobrepostos e rótulos misturados = mercado lateral.", "Num range, a meio não há informação; os extremos têm rejeições e os rompimentos podem ser falsos.", "Não negociar um range sem vantagem clara também é uma decisão."],
      quiz: [
        chart("IDENTIFY_STRUCTURE", "structure-range-01", "Que estrutura mostra este gráfico?", ["Bullish", "Bearish", "Lateral (swings sobrepostos)", "Rompimento"], 2, "Os máximos e mínimos oscilam na mesma faixa, sem progressão."),
        tf("Dentro de um range, a direção do próximo candle é fácil de prever.", false, "A meio do range não há informação clara; muitas entradas dão apenas custos."),
        mc("O que é um rompimento falso?", ["Um rompimento que se mantém", "O preço fura o limite do range e regressa para dentro", "Um gap de fim de semana", "Um erro de dados"], 1, "A armadilha típica dos ranges."),
        mc("Qual destas é uma decisão legítima num range sem vantagem clara?", ["Forçar uma entrada por tédio", "Esperar o rompimento com reteste ou não operar", "Aumentar o tamanho", "Retirar o stop"], 1, "Esperar ou não operar faz parte de um processo disciplinado."),
      ],
    },
    {
      slug: "recuo-continuacao-e-expansao",
      title: "Recuo, continuação e expansão",
      summary: "O ciclo impulso → recuo → continuação, e o que significa a expansão (e a compressão) de amplitude.",
      minutes: 7,
      content: `O movimento do preço costuma alternar entre dois tipos de fases:

## Impulso (*impulse*)
Movimento **direcional e rápido** (candles grandes, pouca sobreposição) na direção da tendência.

## Recuo (*retracement / pullback*)
Movimento **contra** o impulso, geralmente **mais lento e mais curto**. Mede-se pela **fração do impulso que foi devolvida**:

\`recuo (%) = (extremo do impulso − ponto do recuo) ÷ tamanho do impulso\`

Não existe um recuo "certo", mas um recuo **muito profundo** (perto de 100%) pode indicar que o impulso perdeu força. O módulo de Fibonacci aprofunda a medição.

## Continuação
Depois do recuo, o preço **retoma** a direção do impulso e faz um novo **HH** (numa alta) ou **LL** (numa baixa). A continuação **confirma** a estrutura; a falha do recuo (quebra do último HL/LH) **questiona-a**.

## Expansão e compressão
- **Expansão:** os swings ficam **mais amplos** (ex.: HH e LL ao mesmo tempo) — a volatilidade aumenta e a estrutura fica instável;
- **Compressão:** os swings ficam **mais estreitos** (ex.: LH e HL) — o preço "aperta", muitas vezes antes de um rompimento (sem direção garantida).

A classificação da plataforma trata ambas como **estrutura mista/lateral**, porque nenhuma sequência HH/HL ou LH/LL as descreve.

## Porque interessa
Procurar entradas **nos recuos** de uma estrutura de alta (em vez de perseguir o impulso) tende a dar **stops mais curtos** e **R:R melhor** — mas exige paciência e aceitar que o recuo pode continuar.`,
      example: `Impulso de **38.290 → 38.620** (**330 pontos**). Recuo até **38.430**: devolveu 38.620 − 38.430 = **190 pontos**, ou **57,6%** do impulso. A seguir, o preço retoma e faz um novo máximo acima de 38.620: continuação.

Se, em vez disso, o recuo tivesse quebrado o **último HL** (38.290), o impulso teria sido totalmente devolvido: a estrutura de alta estaria **em causa**.`,
      takeaways: ["Impulso → recuo → continuação (ou falha) é o ciclo básico do preço.", "O recuo mede-se pela fração do impulso devolvida; recuos muito profundos questionam a estrutura.", "Expansão e compressão são estrutura mista: nenhuma sequência HH/HL ou LH/LL as descreve."],
      quiz: [
        num("Impulso de 38.290 a 38.620 e recuo até 38.430. Que percentagem do impulso foi devolvida (arredonda a 1 casa)?", 57.6, 0.1, "%", "(38.620 − 38.430) ÷ (38.620 − 38.290) = 190 ÷ 330 = 57,6%."),
        mc("O que caracteriza a expansão de amplitude?", ["Swings cada vez mais estreitos", "Swings mais amplos (por exemplo HH e LL simultâneos) e maior volatilidade", "Ausência de volume", "Apenas gaps"], 1, "A expansão aumenta a amplitude dos swings e a instabilidade."),
        tf("Um recuo que devolve 100% do impulso confirma a tendência.", false, "Devolver todo o impulso questiona a estrutura."),
        mc("Depois de um recuo, o que confirma a estrutura de alta?", ["Um novo HL mais baixo", "Um novo HH acima do máximo anterior", "Um gap", "Um candle vermelho"], 1, "A continuação com um novo HH confirma a estrutura de alta."),
      ],
    },
    {
      slug: "mudanca-de-estrutura-e-reversao",
      title: "Mudança de estrutura e reversão",
      summary: "Como a estrutura passa de alta para baixa (ou vice-versa) — passo a passo e com prudência.",
      minutes: 8,
      content: `Uma **mudança de estrutura** não acontece de um candle para o outro. Costuma desenrolar-se em fases:

## Estrutura bullish → bearish
1. **Aviso:** o preço falha em fazer um novo **HH** e faz um **LH** (máximo mais baixo);
2. **Quebra:** o preço **quebra o último HL** (fecha abaixo dele);
3. **Confirmação:** forma-se um **LL** e depois um novo **LH**, ou seja, a nova sequência de baixa.

## Estrutura bearish → bullish
O espelho: um **HL** (mínimo mais alto), a **quebra do último LH** (fecho acima), e depois um **HH** seguido de **HL**.

## Cuidados
- A **primeira** quebra pode ser um **rompimento falso**: o preço regressa e a estrutura original retoma;
- A mudança só se **confirma** quando existe uma nova sequência completa;
- Mudar de lado muito cedo é um erro comum: exige disciplina esperar pela confirmação, e aceitar que se **perde parte do movimento**;
- O que é mudança de estrutura no M5 pode ser apenas um recuo no H1 (ver multi-timeframe).

## Como usar
- Quando a estrutura **quebra**, as ideias a favor da estrutura antiga **perdem o contexto**: reduzir risco ou sair é uma decisão razoável;
- Para ideias novas **contra** a estrutura antiga, espera-se confirmação e define-se invalidação (o extremo da nova sequência);
- Regista no journal: **em que fase** estava a estrutura quando entraste?`,
      example: `Estrutura de alta: máximos **38.250 → 38.440 → 38.620**, mínimos **38.100 → 38.290 → 38.430 (último HL)**.

1. **Aviso:** o preço recupera até **38.520**, abaixo de 38.620 → **LH**;
2. **Quebra:** cai para **38.300**, abaixo de 38.430 → o último HL foi quebrado, e esse mínimo é um **LL** face ao swing low anterior;
3. **Confirmação:** recupera só até **38.410** (outro LH, abaixo do anterior) e volta a cair até **38.170** (outro LL).

Entre a primeira falha (LH em 38.520) e a quebra do HL passaram apenas **90 pontos**. A **confirmação** só chegou depois: mais uma recuperação falhada e uma nova queda de 130 pontos até 38.170.`,
      visual: { kind: "scenario", scenarioId: "structure-shift-bull-to-bear", annotations: "solution", caption: "A linha tracejada marca o último HL; a sua quebra muda a estrutura." },
      exercise: { kind: "structure", scenarioId: "structure-shift-bull-to-bear", prompt: "Qual é a estrutura no fim deste gráfico? Que swing marcou a mudança?" },
      takeaways: ["A mudança de estrutura desenrola-se em fases: falha (LH), quebra do último HL, nova sequência.", "A primeira quebra pode ser falsa; a confirmação exige nova sequência completa.", "Quando a estrutura quebra, ideias a favor da antiga perdem contexto."],
      quiz: [
        chart("IDENTIFY_STRUCTURE", "structure-shift-bull-to-bear", "Qual é a estrutura no final deste gráfico?", ["Bullish", "Bearish", "Lateral", "Indefinida por falta de swings"], 1, "O LH, a quebra do último HL e os novos LL marcam a mudança para estrutura de baixa."),
        num("Neste gráfico, qual é o nível do último HL cuja quebra muda a estrutura?", 38430, 0, undefined, "O último HL está em 38.430; o seu rompimento (LL em 38.300) sinaliza a mudança."),
        chart("IDENTIFY_STRUCTURE", "structure-shift-bear-to-bull", "E neste gráfico?", ["Bullish no final (quebra do último LH)", "Bearish no final", "Lateral", "Não há swings"], 0, "A quebra do último LH (38.570) e a sequência HL/HH marcam a mudança para alta."),
        mc("Qual é a prática mais prudente depois da primeira quebra de um HL?", ["Inverter a posição imediatamente com o dobro do tamanho", "Esperar confirmação da nova sequência e gerir o risco", "Ignorar a quebra", "Retirar todos os stops"], 1, "A primeira quebra pode ser falsa; a confirmação exige uma nova sequência."),
      ],
    },
    {
      slug: "estrutura-em-varios-timeframes",
      title: "Estrutura em vários timeframes",
      summary: "A natureza fractal do preço: estrutura externa e interna, e porque as leituras divergem.",
      minutes: 6,
      content: `O preço é **fractal**: a mesma lógica de swings aparece em qualquer escala. Isso dá duas camadas úteis:

- **Estrutura externa (maior):** a do timeframe superior — a tendência dominante;
- **Estrutura interna (menor):** a do timeframe inferior — o detalhe dentro de cada perna.

## Como interagem
- Um **recuo** no timeframe superior é, no inferior, uma **estrutura de baixa** (dentro de uma alta maior);
- A **quebra** do último HL no M15 pode ser só um **ruído** dentro de um recuo normal do H4;
- Quando **a interna vira a favor da externa**, muitas ideias baseiam-se nessa mudança como gatilho (por exemplo, o fim do recuo no M15 dentro de uma alta no H4).

## O que fazer
1. Identifica a **estrutura do timeframe superior** e o **seu último HL/LH**;
2. Espera o recuo chegar a uma zona relevante;
3. No timeframe inferior, procura uma **mudança de estrutura a favor** do superior;
4. Define a invalidação no inferior (stop mais curto) **sabendo** que o superior continua a ser o contexto.

## Atenção
- Mais timeframes **não** são necessariamente melhores;
- Quando a estrutura interna e a externa **discordam**, não existe "o certo": existem ideias a favor ou contra o contexto — com riscos diferentes;
- O alvo e o stop dependem do timeframe em que decides.`,
      example: `H4 em estrutura de alta com último HL em **38.300**. O preço recua do máximo (38.800) e, no M15, forma uma **estrutura de baixa** durante o recuo (LH/LL). Quando chega a **38.350**, o M15 quebra o último LH e faz um HL: **mudança de estrutura interna a favor da externa**.

Ideia educativa: entrada acima do LH do M15 em 38.400, invalidação abaixo de 38.300 (**100 pontos**). O stop curto vem do timeframe inferior; a razão para a ideia vem do superior.`,
      takeaways: ["O preço é fractal: a mesma lógica de swings aparece em várias escalas.", "Estrutura externa (timeframe maior) = contexto; interna (menor) = gatilho e detalhe.", "Quando discordam, não existe 'o certo' — existem ideias a favor ou contra o contexto."],
      quiz: [
        mc("O que é a estrutura externa?", ["A do timeframe inferior", "A do timeframe superior (tendência dominante)", "A do volume", "A do dia anterior"], 1, "É a estrutura do timeframe maior, que dá o contexto."),
        tf("Um recuo no H4 aparece, no M15, como uma estrutura de baixa dentro de uma alta maior.", true, "O que é recuo numa escala é uma tendência na escala inferior."),
        mc("Qual é um bom uso da estrutura interna?", ["Substituir o contexto superior", "Servir de gatilho e de referência para um stop mais curto", "Prever notícias", "Evitar custos"], 1, "A estrutura interna dá o gatilho e refina o stop; o superior dá a razão."),
      ],
    },
    {
      slug: "metodo-de-pratica-e-erros-comuns",
      title: "Método de prática e erros comuns",
      summary: "Como treinar estrutura no laboratório e fugir às armadilhas de análise.",
      minutes: 6,
      content: `Ler estrutura é uma **competência prática**. Treina assim:

## Rotina no Market Structure Lab
1. **Antes** de ver a solução, marca todos os swings e etiqueta-os;
2. Decide: **bullish, bearish ou lateral**;
3. Compara com a **solução educativa** e lê a explicação;
4. Anota **onde erraste**: swing em falta? etiqueta trocada? classificação precipitada?
5. Repete com cenários diferentes (alta, baixa, lateral, mudança de estrutura).

## Erros comuns
- **Marcar swings a mais** (todos os pequenos zigue-zagues): perde-se a estrutura relevante;
- **Marcar swings a menos**: ignoram-se os pontos que mudam a leitura;
- **Etiquetar comparando com o swing errado** (um máximo com um mínimo, ou com um swing não consecutivo);
- **Forçar uma resposta** onde os sinais são mistos — "lateral" é uma resposta legítima;
- **Redesenhar a análise depois do movimento** (repainting mental) para a "adaptar" ao resultado;
- **Confundir estrutura com previsão**.

## Dentro do processo de decisão
A estrutura responde a **uma** pergunta (qual é o contexto e onde fica a invalidação). As restantes — onde entrar, quanto arriscar, onde sair — têm as suas ferramentas: níveis, zonas, Fibonacci, confluência e gestão de risco.

> Uma boa prática: descreve a estrutura em **uma frase** antes de qualquer decisão. "Alta no H1, último HL em X, a recuar para a zona Y."`,
      example: `Resultado típico de um aluno no laboratório: 78% no primeiro cenário (esqueceu-se de um swing), 100% no seguinte. A pontuação premeia **identificar os swings relevantes e etiquetá-los corretamente**; é um feedback, não um exame — o que importa é perceber o que escapou.`,
      exercise: { kind: "link", href: "/labs/market-structure", label: "Abrir o Market Structure Lab", prompt: "Faz pelo menos três cenários diferentes e anota o que escapou em cada um." },
      takeaways: ["Marca os swings e classifica antes de veres a solução; depois compara e anota os erros.", "Evita swings a mais ou a menos, comparações erradas e análises refeitas depois do movimento.", "Descreve a estrutura numa frase antes de qualquer decisão."],
      quiz: [
        mc("O que fazer antes de ver a solução no laboratório?", ["Nada", "Marcar todos os swings e classificar a estrutura", "Copiar uma resposta anterior", "Passar logo à próxima"], 1, "Praticar ativamente é o que treina a competência."),
        tf("'Lateral' é uma resposta legítima quando os sinais são mistos.", true, "Forçar uma direção onde não existe é um erro."),
        mc("Qual é um erro comum ao marcar swings?", ["Usar uma regra objetiva", "Marcar todos os pequenos zigue-zagues", "Descrever a estrutura numa frase", "Comparar com a solução"], 1, "Swings a mais escondem a estrutura relevante."),
      ],
    },
  ],
  quiz: {
    title: "Quiz do módulo — Market Structure",
    passScore: 70,
    questions: [
      chart("IDENTIFY_STRUCTURE", "structure-bull-01", "Qual é a estrutura deste gráfico?", ["Bullish (HH/HL)", "Bearish (LH/LL)", "Lateral", "Indefinida"], 0, "HH e HL em sequência."),
      chart("IDENTIFY_STRUCTURE", "structure-bear-01", "Observa o gráfico apresentado: qual é a estrutura?", ["Bullish (HH/HL)", "Bearish (LH/LL)", "Lateral", "Indefinida"], 1, "LH e LL em sequência."),
      chart("IDENTIFY_STRUCTURE", "structure-range-01", "Observa o gráfico apresentado: qual é a estrutura do mercado?", ["Bullish", "Bearish", "Lateral (swings sobrepostos)", "Rompimento"], 2, "Swings sobrepostos, sem progressão."),
      chart("IDENTIFY_STRUCTURE", "structure-shift-bull-to-bear", "Neste gráfico, a estrutura final é…", ["Bullish", "Bearish", "Lateral", "Sem swings"], 1, "A quebra do último HL (38.430) e a sequência LH/LL."),
      num("Neste último gráfico, qual é o nível do último HL quebrado?", 38430, 0, undefined, "O último HL está em 38.430."),
      mc("Um máximo de 38.700 depois de um máximo de 38.610 é um…", ["HH", "HL", "LH", "LL"], 0, "Máximo mais alto = HH."),
      mc("O que fica sem etiqueta num gráfico?", ["O último swing", "O primeiro máximo e o primeiro mínimo", "Os swings do meio", "Nenhum"], 1, "Ainda não têm swing anterior do mesmo tipo para comparar."),
      num("Impulso de 38.000 a 38.400 e recuo até 38.200. Que percentagem do impulso foi devolvida?", 50, 0.1, "%", "(38.400 − 38.200) ÷ 400 = 50%."),
      tf("Uma estrutura de alta garante que o próximo swing será um HH.", false, "A estrutura descreve o passado recente e não prevê o futuro."),
      mc("Qual é a pergunta mais útil depois de ler a estrutura?", ["Qual será o próximo candle?", "Se estiver certa, onde fica a minha ideia errada?", "Qual é o melhor indicador?", "Quanto vou ganhar?"], 1, "A estrutura serve sobretudo para definir invalidação e risco."),
    ],
  },
};
