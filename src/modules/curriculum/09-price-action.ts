import { chart, mc, num, rr, tf } from "../dsl";
import type { ModuleDef } from "../types";

/** Module 09 — Price Action (Level 3). The question is "what is price doing?", never "which indicator says BUY?". */
export const priceAction: ModuleDef = {
  slug: "price-action",
  number: 9,
  level: 3,
  title: "Price Action",
  summary: "Rejeição, momentum, deslocamento, consolidação, rompimento, rompimento falso, reteste, continuação, reversão e exaustão — a pergunta é 'o que o preço está a fazer?'.",
  difficulty: "FOUNDATION",
  icon: "Activity",
  lessons: [
    {
      slug: "o-que-o-preco-esta-a-fazer",
      title: "O que é que o preço está a fazer?",
      summary: "A mudança de pergunta que define o price action: descrever comportamento em vez de procurar 'qual indicador dá BUY'.",
      minutes: 6,
      content: `**Price action** é a leitura do **comportamento do preço** — candles, swings, níveis, velocidade — como fonte principal de informação, em vez de depender de indicadores.

## Duas perguntas muito diferentes
- ❌ "**Qual indicador está a dar BUY?**" — procura uma resposta pronta, externa ao mercado;
- ✔ "**O que o preço está a fazer?**" — descreve o que se passa e pergunta o que isso implica.

## Porque o preço primeiro
Os indicadores são **cálculos feitos sobre o preço** (médias, osciladores). Chegam **depois** dele e **reformulam** a mesma informação com atraso. Podem ser úteis para quantificar (volatilidade, força), mas **não acrescentam informação nova** que o preço não tenha mostrado.

## Um vocabulário para descrever o preço
- **Impulso / correção;**
- **Rejeição / aceitação** de um nível;
- **Momentum** (velocidade e convicção);
- **Consolidação** (pausa) e **expansão**;
- **Rompimento, falso rompimento, reteste**;
- **Continuação, reversão, exaustão**.

## O que isto NÃO é
- Não é "ler a mente do mercado";
- Não elimina a incerteza: é uma forma disciplinada de **descrever** e de **planear cenários**;
- Não dispensa risco, stop e tamanho.

> A prática: antes de cada decisão, escreve **uma frase** que descreva o preço: "A subir em impulso, a recuar para o nível X com candles pequenos e pavios longos". Se não consegues descrever, não tens informação suficiente para decidir.`,
      example: `Duas formas de olhar para o mesmo momento:

- **Indicador:** "O RSI está em 72 e a média móvel cruzou para cima: sinal de compra?"
- **Price action:** "O preço fez um impulso de 200 pontos com candles grandes, está a consolidar há 6 candles num range de 40 pontos, abaixo da resistência de 39.050. Há compressão; a pergunta é o que acontece ao romper um dos lados."

A segunda descrição diz **onde está o risco** (o outro lado do range) — a primeira só diz "compra".`,
      takeaways: ["Price action é ler o comportamento do preço em vez de procurar sinais prontos em indicadores.", "Os indicadores reformulam o preço com atraso; não acrescentam informação nova.", "Descreve o preço numa frase antes de cada decisão."],
      quiz: [
        mc("Qual é a pergunta central do price action?", ["Qual indicador está a dar BUY?", "O que o preço está a fazer?", "Quanto vou ganhar?", "Qual é o spread?"], 1, "A pergunta é descrever comportamento e perceber o que implica."),
        tf("Os indicadores acrescentam sempre informação que o preço não tinha mostrado.", false, "São cálculos sobre o preço e chegam com atraso; reformulam a mesma informação."),
        mc("Qual é um exemplo de descrição de price action?", ["O RSI cruzou 70", "Impulso de 200 pontos seguido de consolidação abaixo da resistência", "A média está a subir", "O volume está alto"], 1, "Descreve o comportamento do preço e a localização face a um nível."),
      ],
    },
    {
      slug: "rejeicao-e-momentum",
      title: "Rejeição e momentum",
      summary: "O que significa o preço ser rejeitado num nível — e como medir a convicção de um movimento.",
      minutes: 7,
      content: `## Rejeição
Há **rejeição** quando o preço **visita** uma região e é **empurrado de volta** antes de fechar: pavios longos, fechos longe do extremo, candles de reversão. Mostra que, ali, **um lado não conseguiu impor o preço**.

- Mais relevante **num nível** (suporte, resistência, zona);
- Mais fiável com **confirmação** (o candle seguinte vai no sentido da rejeição);
- Pode ser **temporária**: o preço volta a testar e atravessa.

## Aceitação
O oposto: o preço **entra** numa região e **fica lá** (vários fechos dentro/para lá do nível). Sinaliza que a região foi aceite como justa.

## Momentum
**Momentum** descreve **a velocidade e a convicção** do movimento. Sinais observáveis:

- **Candles grandes** (corpo acima do ATR) **na mesma direção**;
- **Fechos perto do extremo**;
- **Pouca sobreposição** entre candles;
- **Recuos curtos** que não devolvem muito.

**Perda de momentum:** candles mais pequenos, pavios contra, sobreposição crescente, recuos mais profundos.

## Medir
- **Corpo ÷ ATR**: 1,0 é um candle "normal", > 2 é forte, < 0,5 é fraco;
- **Contagem de fechos consecutivos** na mesma direção;
- **Distância percorrida por swing** face ao anterior.

> Momentum **descreve** — não garante continuação. Muitos movimentos fortes terminam; os que continuam fazem parte do que se vê no passado.`,
      example: `ATR = 50 pontos. Três candles seguidos com corpos de **110, 95 e 120 pontos** (2,2×, 1,9× e 2,4× o ATR), fechos perto do máximo e sem sobreposição: momentum **forte**.

Depois, dois candles de **15 e 20 pontos** (0,3× e 0,4× o ATR), com pavios superiores longos: o momentum **abrandou**. Não é um sinal de inversão — é informação para **reavaliar o risco**.`,
      takeaways: ["Rejeição mostra um lado a não conseguir impor o preço; ganha peso num nível e com confirmação.", "Momentum descreve velocidade e convicção: candles grandes, fechos perto do extremo, pouca sobreposição.", "Mede o corpo face ao ATR; perda de momentum é aviso, não inversão."],
      quiz: [
        mc("O que significa 'aceitação' de um nível?", ["O preço é rejeitado imediatamente", "O preço fica na região, com vários fechos dentro/para lá do nível", "O broker aceita a ordem", "O spread diminui"], 1, "Aceitação: o preço entra e mantém-se na região."),
        num("ATR = 50 pontos. Um candle com corpo de 130 pontos tem quantos ATR?", 2.6, 0.01, "×", "130 ÷ 50 = 2,6: corpo invulgarmente grande face ao ATR."),
        tf("Momentum forte garante que o movimento continua.", false, "Descreve o que aconteceu; muitos movimentos fortes terminam."),
        mc("Qual é um sinal observável de perda de momentum?", ["Candles cada vez maiores", "Candles mais pequenos, pavios contra e mais sobreposição", "Fechos sempre no máximo", "Gaps"], 1, "O abrandamento vê-se em corpos menores, pavios contra e sobreposição."),
      ],
    },
    {
      slug: "deslocamento-e-consolidacao",
      title: "Deslocamento e consolidação",
      summary: "O movimento rápido que muda o jogo e a pausa que o segue — o ritmo natural do preço.",
      minutes: 6,
      content: `## Deslocamento (*displacement*)
Um **deslocamento** é um movimento **rápido e forte**, com candles grandes e pouca sobreposição, que **rompe** de forma clara um nível ou uma estrutura. É um dos sinais mais claros de **mudança de comportamento**.

- Observável: corpos grandes, fecho perto do extremo, quebra de swing recente;
- Mostra que, durante esse trecho, **um lado dominou**;
- **Não garante** que o movimento continue.

## Consolidação
Depois de um deslocamento, o preço costuma **pausar**: candles pequenos, range estreito, sobreposição crescente. É a **consolidação** — um período de equilíbrio e de "digestão" do movimento.

## Ciclo natural
**Impulso → consolidação → (rompimento: continuação ou falha)**

A consolidação tende a terminar com:
1. **Continuação** do deslocamento original;
2. **Reversão** (a pausa foi, afinal, o fim do movimento);
3. **Rompimento falso** (a armadilha clássica).

Não se sabe qual **a priori**. Daí que **o plano seja condicional**: "se romper para cima e aguentar, então…; se romper e falhar, então…".

## Aplicação prática
- Quanto **maior** o deslocamento face ao ATR, mais relevante a consolidação seguinte;
- A **largura** da consolidação define o risco de uma ideia no rompimento (stop do outro lado do range);
- Em consolidações **muito longas**, o mercado fica lateral e a vantagem desaparece.`,
      example: `Um deslocamento de **+180 pontos** em 4 candles (ATR 50), seguido de uma consolidação de **6 candles** entre 39.150 e 39.190 (range de **40 pontos**). Um plano condicional:

- **Se** fechar acima de 39.190 e o reteste aguentar → ideia de continuação, stop abaixo de 39.150 (**~45 pontos** de risco);
- **Se** fechar abaixo de 39.150 → a consolidação falhou, ideia invalidada.`,
      takeaways: ["Deslocamento: movimento rápido e forte que rompe um nível ou uma estrutura.", "Consolidação: pausa de range estreito depois de um deslocamento; pode terminar em continuação, reversão ou rompimento falso.", "Planeia de forma condicional: 'se romper e aguentar… se falhar…'."],
      quiz: [
        mc("O que caracteriza um deslocamento?", ["Candles pequenos e sobrepostos", "Movimento rápido, forte e com pouca sobreposição que rompe um nível ou estrutura", "Um gap de fim de semana", "Volume baixo"], 1, "É um movimento direcional forte e claro."),
        tf("Depois de um deslocamento, o preço continua sempre na mesma direção.", false, "A consolidação seguinte pode terminar em continuação, reversão ou rompimento falso."),
        mc("Porque é que o plano deve ser condicional na consolidação?", ["Porque não há regras", "Porque não se sabe a priori como termina", "Para evitar stops", "Porque o spread varia"], 1, "O desfecho é incerto; os cenários e a invalidação têm de estar definidos antes."),
      ],
    },
    {
      slug: "rompimento-falso-e-reteste",
      title: "Rompimento, rompimento falso e reteste",
      summary: "Como distinguir um rompimento que se mantém de uma armadilha — e porque o fecho e o reteste contam.",
      minutes: 8,
      content: `## Rompimento (*breakout*)
O preço **fecha** para lá de um nível ou limite de range. Um rompimento mais **credível** costuma ter: candle de corpo grande, fecho claramente fora, contexto a favor (estrutura, tendência).

## Rompimento falso (*fake breakout / false breakout*)
O preço **fura** o nível — por vezes com pavio, por vezes com um fecho — mas **volta para dentro** do range. É das armadilhas mais comuns. Pode gerar movimentos fortes no sentido contrário porque **quem entrou no rompimento fica preso** e tem de sair.

## Reteste (*retest*)
Depois de um rompimento, o preço **regressa ao nível** rompido para o testar pelo outro lado:

- **Reteste que segura:** o nível rompido funciona como suporte/resistência invertido;
- **Reteste que falha:** o preço volta para dentro — o rompimento era falso.

## Como lidar
1. **Exige fecho** (não só pavio) para considerar o rompimento;
2. **Espera o reteste** — mais lento e muitas vezes com stop mais curto e melhor R:R;
3. **Define a invalidação** do outro lado do nível (se voltar para dentro, a ideia acabou);
4. **Aceita perder parte do movimento:** entrar mais tarde custa pontos, mas tende a eliminar parte das armadilhas — **não todas**;
5. **Sem estatísticas inventadas**: não existe uma percentagem universal de rompimentos falsos. Regista os teus casos.

## Ilusão comum
Muitos rompimentos "óbvios" falham; muitos "falhados" eram só retestes antes de continuar. A informação está no **comportamento depois** do rompimento, não no rompimento em si.`,
      example: `Resistência em **39.050**. Um candle fecha em **39.140** (rompimento). O preço sobe até 39.180 e depois recua; o **reteste** faz mínimo em **39.045**, junto do nível, e reage com um candle de rejeição que fecha em 39.130.

Ideia educativa: entrada acima do máximo do candle de rejeição (39.140) com stop abaixo de 39.030 (**110 pontos**) — mais longo do que "no reteste" (que seria ~25 pontos), porque a confirmação custa distância. O **trade-off** entre confirmação e preço é central no price action.`,
      visual: {
        kind: "candles",
        candles: [
          [39000, 39040, 38990, 39020],
          [39020, 39050, 39000, 39010],
          [39010, 39045, 38995, 39035],
          [39035, 39050, 39000, 39015],
          [39015, 39155, 39010, 39140],
          [39140, 39180, 39110, 39170],
          [39170, 39175, 39080, 39100],
          [39100, 39110, 39045, 39060],
          [39060, 39140, 39055, 39130],
          [39130, 39210, 39120, 39200],
        ],
        overlays: [
          { type: "hline", id: "lvl", price: 39050, label: "Resistência rompida", tone: "warning", dashed: true },
          { type: "marker", id: "bo", index: 4, price: 39155, label: "Rompimento", placement: "above", tone: "primary" },
          { type: "marker", id: "rt", index: 7, price: 39045, label: "Reteste", placement: "below", tone: "success" },
        ],
        caption: "Rompimento, reteste do nível e continuação.",
        height: 300,
      },
      takeaways: ["Exige fecho para lá do nível; o pavio sozinho não é um rompimento.", "O reteste pode confirmar (nível invertido segura) ou desmentir (preço volta para dentro).", "Confirmar custa preço; a escolha entre mais confirmação e melhor preço é um trade-off."],
      quiz: [
        mc("O que é um rompimento falso?", ["Um rompimento que se mantém", "O preço fura o nível mas volta para dentro do range", "Um gap de abertura", "Um nível sem toques"], 1, "A armadilha clássica: quem entrou no rompimento fica preso."),
        mc("O que é um reteste?", ["Voltar ao nível rompido para o testar pelo outro lado", "Fechar a posição", "Um novo máximo", "O primeiro candle do dia"], 0, "O preço regressa ao nível e reage (ou não)."),
        tf("Existe uma percentagem universal e fiável de rompimentos que falham.", false, "Não; depende do mercado, do contexto e do período. Regista os teus casos."),
        num("Entrada acima de 39.140 com stop em 39.030. Quantos pontos de risco por contrato?", 110, 0, "pontos", "39.140 − 39.030 = 110 pontos."),
      ],
    },
    {
      slug: "continuacao-reversao-e-exaustao",
      title: "Continuação, reversão e exaustão",
      summary: "Os três desfechos possíveis de um movimento — e as perguntas que ajudam a pesá-los.",
      minutes: 7,
      content: `Quando o preço atinge uma zona relevante depois de um movimento, há essencialmente três desfechos:

1. **Continuação:** o preço atravessa (ou recua e retoma) e prossegue na direção original;
2. **Reversão:** o preço muda de direção e forma nova estrutura;
3. **Lateralização:** o preço entra em range e não decide.

Não existe forma fiável de **saber** qual acontece. O que se pode fazer é pesar **evidências** a favor de cada cenário.

## Pistas a favor de continuação
- Estrutura do timeframe superior alinhada;
- Recuos **rasos** e curtos; momentum forte;
- A zona é testada e o preço **aceita** para lá dela;
- Reteste que segura.

## Pistas a favor de reversão
- **Exaustão** (esticões longos, candles de rejeição);
- **Mudança de estrutura** (quebra do último HL/LH com nova sequência);
- A zona é uma confluência forte (nível + zona + Fibonacci);
- Perda de momentum.

## Exaustão (relembrar)
Sinais de que um movimento "cansou": candles com pavios contra, ranges a diminuir, velocidade a cair, preço a ficar preso perto de um nível. **É uma hipótese**, não um sinal de entrada.

## Regra do plano
Para qualquer ideia, tens de saber:
- **O que me diria que estou certo?** (confirmação)
- **O que me diria que estou errado?** (invalidação)
- **Quanto perco se estiver errado?** (risco)

Se as respostas não existirem **antes** da entrada, é aposta — não é plano.`,
      example: `Uma subida de 300 pontos aproxima-se de um PDH com candles cada vez mais pequenos e pavios superiores. Há **duas hipóteses**: exaustão (reversão) ou pausa antes de continuar.

Um plano em condicional: **se** o preço rejeitar o PDH e quebrar o último HL, as ideias de alta perdem contexto e as de baixa ganham interesse (com stop acima do PDH). **Se** romper o PDH e o reteste aguentar, a continuação ganha peso. O plano **não** exige adivinhar — exige reagir ao que o preço faz.`,
      takeaways: ["Os desfechos possíveis: continuação, reversão ou lateralização — não se sabe qual a priori.", "Pesa evidências a favor de cada cenário e define confirmação, invalidação e risco antes de entrar.", "Exaustão é hipótese, não sinal de entrada."],
      quiz: [
        mc("Qual destas é uma pista a favor de reversão (não uma garantia)?", ["Recuos rasos e momentum forte", "Quebra do último HL com nova sequência de swings", "Candles grandes e seguidos", "Estrutura alinhada nos timeframes"], 1, "A mudança de estrutura é uma evidência a favor de reversão."),
        tf("É possível saber de antemão se um movimento vai continuar ou reverter.", false, "Não; só se podem pesar evidências e planear condicionalmente."),
        mc("Que três perguntas definem um plano?", ["Quanto ganho, quanto aposto, quando saio", "O que confirma, o que invalida e quanto perco se errar", "Qual o indicador, qual o timeframe, qual o broker", "Nenhuma"], 1, "Confirmação, invalidação e risco definidos antes da entrada."),
        chart("CHART_ANALYSIS", "structure-shift-bull-to-bear", "Neste gráfico, que evidência favoreceu a reversão de alta para baixa?", ["O volume subiu", "A quebra do último HL, depois LH e LL", "O spread alargou", "Um gap"], 1, "A quebra do último HL e a nova sequência LH/LL mostraram a mudança de estrutura."),
      ],
    },
    {
      slug: "ler-o-grafico-passo-a-passo",
      title: "Ler o gráfico passo a passo",
      summary: "Uma rotina simples para transformar tudo isto numa descrição e num plano — e como a treinar no Chart Replay.",
      minutes: 7,
      content: `Junta as peças numa rotina de leitura:

## 1. Contexto (timeframe superior)
- Estrutura (alta, baixa, lateral) e o **último HL/LH**;
- Níveis relevantes e zonas.

## 2. Fase atual
- Impulso, correção, consolidação ou deslocamento?
- Qual é o **momentum** (corpo ÷ ATR)?

## 3. Localização
- Está **perto de um nível/zona**? Há confluência (S/R + Fibonacci + nível redondo)?

## 4. Comportamento no nível
- **Rejeição** ou **aceitação**? Rompimento com fecho? Reteste?

## 5. Plano condicional
- **Cenário A** (a favor): o que confirma, onde fica a invalidação, quanto de risco, qual o alvo;
- **Cenário B** (contra): o que o pôs em causa;
- **Nada a fazer**: o que falta para haver uma ideia?

## 6. Revisão
- Regista no journal: **o que descrevi**, **o que decidi**, **o que aconteceu** — e se a descrição estava certa.

## Treino
No **Chart Replay** podes avançar candle a candle, marcar níveis, desenhar Fibonacci e abrir posições simuladas. A avaliação final premeia o **processo** (stop, R:R, preparação, razão de entrada) — não o P&L. Pratica a rotina **antes** de cada avanço: descreve, planeia, só depois avança.

> O objetivo não é acertar o próximo candle: é **decidir bem** com a informação que tens e **limitar o custo** de estar errado.`,
      example: `Uma leitura completa numa linha de cada passo:

1. **Contexto:** H1 em alta, último HL em 38.900.
2. **Fase:** recuo de 60% do impulso com candles pequenos; momentum fraco.
3. **Localização:** 38.950–39.000 (suporte anterior + nível redondo).
4. **Comportamento:** pin bar com pavio inferior de 70 pontos e fecho acima de 39.000.
5. **Plano:** compra acima do máximo do pin bar (39.030), stop abaixo de 38.940 (**90 pontos**), alvo no máximo anterior (39.250, **220 pontos**) → R:R ≈ 2,4:1. **Se** fechar abaixo de 38.940, a ideia acabou.
6. **Revisão:** registar tudo e comparar com o desfecho.`,
      exercise: { kind: "link", href: "/labs/replay", label: "Abrir o Chart Replay", prompt: "Cria uma sessão, marca níveis antes de avançar e descreve o preço numa frase em cada paragem." },
      takeaways: ["Contexto → fase → localização → comportamento → plano condicional → revisão.", "Descrever antes de decidir; planear cenários a favor, contra e 'nada a fazer'.", "O objetivo é decidir bem e limitar o custo de estar errado — não acertar o próximo candle."],
      quiz: [
        mc("Qual é o passo imediatamente a seguir à 'localização' na rotina?", ["Contexto", "Comportamento no nível", "Revisão", "Fechar a posição"], 1, "Depois de localizar, observa-se o comportamento (rejeição, aceitação, rompimento)."),
        rr("Entrada 39.030, stop 38.940, alvo 39.250. Qual é o R:R (1 casa decimal)?", 2.4, 0.05, "Alvo 220 ÷ stop 90 = 2,44."),
        tf("O objetivo principal da rotina é acertar o próximo candle.", false, "É decidir bem com a informação disponível e limitar o custo de estar errado."),
      ],
    },
  ],
  quiz: {
    title: "Quiz do módulo — Price Action",
    passScore: 70,
    questions: [
      mc("Qual é a pergunta que define o price action?", ["Qual indicador dá BUY?", "O que o preço está a fazer?", "Quanto posso ganhar?", "Qual o melhor broker?"], 1, "Descrever o comportamento do preço e o que implica."),
      num("ATR = 40 pontos. Um candle com corpo de 100 pontos tem quantos ATR?", 2.5, 0.01, "×", "100 ÷ 40 = 2,5."),
      mc("O que é um deslocamento?", ["Uma pausa", "Um movimento rápido e forte que rompe um nível ou estrutura", "Um gap", "Um indicador"], 1, "Candles grandes, pouca sobreposição e quebra clara."),
      tf("Um pavio que fura o nível é suficiente para considerar um rompimento.", false, "Convém exigir fecho para lá do nível."),
      mc("O que é um reteste?", ["Regresso ao nível rompido para o testar pelo outro lado", "Um novo máximo", "Um stop", "O fecho do dia"], 0, "O preço volta ao nível e reage (ou não)."),
      mc("Qual é a invalidação típica de uma ideia de reteste de uma resistência rompida?", ["O preço subir mais", "O preço voltar a fechar abaixo do nível", "O spread alargar", "Passar uma hora"], 1, "Se volta para dentro, o rompimento falhou."),
      chart("CHART_ANALYSIS", "structure-shift-bear-to-bull", "Neste gráfico, a mudança de estrutura de baixa para alta ficou marcada por…", ["Um gap", "A quebra do último LH e a sequência HL/HH", "O volume", "A abertura do dia"], 1, "O último LH foi quebrado e seguiu-se uma sequência de HL e HH."),
      rr("Entrada 39.030, stop 38.940, alvo 39.210. Qual é o R:R?", 2, 0.01, "Alvo 180 ÷ stop 90 = 2.0."),
      mc("Qual é um sinal observável de perda de momentum?", ["Candles maiores", "Candles menores com pavios contra e mais sobreposição", "Fechos no extremo", "Gaps"], 1, "O abrandamento vê-se nos corpos menores e nos pavios."),
      tf("Antes de entrar, o plano deve dizer o que confirma, o que invalida e quanto se perde se errar.", true, "Sem isso é uma aposta, não um plano."),
    ],
  },
};
