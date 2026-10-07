import { mc, num, rr, tf } from "../dsl";
import type { ModuleDef } from "../types";

/**
 * Module 18 — Trade Management (Level 7). Everything here is a *trade-off to be tested*, never a rule: breakeven, trailing
 * stops and partial exits change the distribution of results, not the expected quality of an idea. Dollar figures were
 * computed from the MYM tick value ($0,50 per point, CME — confirmed by official excerpt 2026-10-06).
 * The platform's replay/simulator fix stop and target at entry (manual close allowed); moving stops and partials are
 * practised on paper and in the journal — the lessons say so instead of pretending otherwise.
 */
export const tradeManagement: ModuleDef = {
  slug: "trade-management",
  number: 18,
  level: 7,
  title: "Trade Management",
  summary: "O que fazer entre a entrada e a saída: plano de gestão, stop loss, breakeven, trailing stop, saídas parciais, várias posições e saídas por tempo ou condição.",
  difficulty: "ADVANCED",
  icon: "SlidersHorizontal",
  lessons: [
    {
      slug: "plano-de-gestao-do-trade",
      title: "O plano de gestão: decidir antes de estar dentro",
      summary: "Escrever, antes da entrada, o que fazes em cada cenário — para que a emoção não decida por ti.",
      minutes: 7,
      content: `Depois da entrada, o preço mexe-se e a **emoção entra na sala**. A defesa é simples: **decidir tudo antes**, quando estás calmo, e executar depois.

## O que um plano de gestão responde
Antes de clicar, escreve (de forma curta):

1. **Onde fica o stop** e porquê (a invalidação da ideia);
2. **Onde fica o alvo** (ou alvos) e porquê;
3. **O que fazes se o preço andar a favor** (mantens, moves o stop, sais em parte?);
4. **O que fazes se o preço andar de lado** (há um limite de tempo?);
5. **O que te faz sair antes do stop ou do alvo** (condições de saída);
6. **O que NÃO vais fazer** (afastar o stop, aumentar a posição para "recuperar").

## Formato "se… então…"
- **Se** o preço fechar abaixo do último swing de suporte, **então** saio — a ideia ficou invalidada;
- **Se** o preço atingir +1R, **então** mantenho o stop onde está (ou movo-o para o breakeven — o que o plano disser);
- **Se** passarem 12 barras sem seguimento, **então** reavalio e, se não houver razão para continuar, saio.

## Gestão ativa não é gestão impulsiva
Gerir um trade **não** é mexer nele a cada vela. As **alterações permitidas** estão no plano; qualquer outra é uma **decisão emocional** disfarçada de gestão — e vai para o journal como erro de processo.

## O que o plano garante (e o que não)
Garante **consistência** e **mede-se** depois (cumpriste ou não?). **Não garante** lucro: um plano disciplinado também perde — o objetivo é que as perdas sejam **as planeadas**.

## Nesta plataforma
No Replay e no Simulador defines **stop e alvo à entrada** e podes **fechar manualmente**. Mover o stop e fechar em parcelas pratica-se no papel e no journal; a avaliação de processo regista se **cumpriste o plano**.`,
      example: `Plano escrito antes de uma entrada fictícia em MYM (DEMO):

- **Entrada:** 39.000 · **Stop:** 38.960 (abaixo do último swing low) · **Alvo:** 39.080;
- **Se +1R (39.040):** mantenho o stop; não mexo antes;
- **Se 10 barras sem seguimento:** reavalio e saio a mercado se não houver novo argumento;
- **Proibido:** afastar o stop; aumentar a posição.

Resultado possível: o preço faz uma vela de recuo forte a meio. Sem plano, a vontade é **fechar já**. Com plano, a pergunta é só **"a invalidação foi atingida?"** — se não, **nada a fazer**.`,
      exercise: { kind: "reflection", prompt: "Pega num trade recente (ou fictício) e escreve o teu plano de gestão em 5 linhas 'se… então…'. Que ação emocional costuma tentar-te depois da entrada?", placeholder: "Se… então…" },
      takeaways: ["O plano de gestão decide-se antes da entrada, em formato 'se… então…'.", "Só as alterações previstas no plano são gestão; as restantes são decisões emocionais.", "O plano mede-se depois: cumpri-o? Consistência vale mais do que mexer no trade."],
      quiz: [
        mc("Quando deve ser definido o plano de gestão?", ["Quando o trade está no vermelho", "Antes da entrada, com a cabeça fria", "Depois do primeiro alvo", "Só nos dias de notícia"], 1, "A emoção aparece com o trade aberto; as regras têm de existir antes."),
        tf("Mexer no trade a cada vela é sinal de boa gestão.", false, "Só as alterações previstas no plano são gestão; o resto é impulso."),
        mc("Qual destes pontos NÃO pertence a um plano de gestão?", ["Onde fica o stop", "O que fazer se o preço ficar de lado", "Garantir que este trade vai ganhar", "O que não vais fazer"], 2, "Nenhum plano garante o resultado; define o comportamento."),
        tf("Um plano de gestão disciplinado elimina as perdas.", false, "Elimina o improviso, não as perdas: as perdas passam a ser as planeadas."),
      ],
    },
    {
      slug: "stop-loss-colocacao-e-regras",
      title: "Stop loss: onde, porquê e quando mexer",
      summary: "O stop como ponto de invalidação, a folga para o ruído e a regra de ouro: nunca afastar o stop.",
      minutes: 8,
      content: `O stop loss é o **ponto onde a ideia fica errada** — não o ponto onde "dói demasiado".

## Onde colocar
- **Para lá da invalidação estrutural:** abaixo do swing low (numa compra) ou acima do swing high (numa venda) que sustenta a ideia;
- **Com uma folga para o ruído:** uns pontos para lá do nível, para não seres retirado por um "pavio" normal;
- **Longe o suficiente de zonas óbvias de liquidez** (equal lows/highs), onde os stops se acumulam e o preço costuma varrer (ver módulo de liquidez).

## Regras de gestão do stop
1. **Define-o antes de entrares** (e dimensiona a posição a partir dele);
2. **Nunca o afastes** depois de entrares: é a única regra quase sem exceções. Afastar o stop é **aumentar o risco** do plano original;
3. **Só o aproximas** (a favor do preço) se o plano o previr — breakeven ou trailing;
4. **Respeita-o:** sair "antes do stop porque dá mau pressentimento" tem de estar previsto no plano (condição de saída), não ser um impulso.

## Stop "na cabeça" (mental)
Um stop que só existe na tua cabeça **depende da tua disciplina no pior momento**. Um stop **colocado na plataforma** executa-se sozinho. Para quem está a aprender, a ordem de stop **real** é o padrão profissional; o stop mental é um risco comportamental extra.

## Slippage e gaps
Em movimentos rápidos ou com *gaps*, o stop **pode ser executado pior do que o preço definido**. O risco real inclui essa possibilidade — mais uma razão para arriscar uma fração pequena da conta.

## Stops demasiado apertados também custam
Um stop **dentro do ruído** perde muitas vezes e transforma uma boa ideia numa série de pequenas perdas. O stop certo vem do gráfico, não da vontade de arriscar pouco.`,
      example: `Compra em MYM (DEMO). Último swing low em **38.970**. Entrada em **39.000**.

- Stop **no** swing low (38.970) → 30 pontos, mas um simples toque no nível retira-te;
- Stop **38.955** (15 pontos de folga) → distância de **45 pontos** = 45 × $0,50 = **$22,50** por contrato.

O trader não afasta o stop mais tarde para "dar espaço": se 38.955 for atingido, a ideia está invalidada e o **risco planeado** ($22,50 por contrato) é a perda. Se achava que precisava de mais folga, devia tê-la **calculado antes** — reduzindo o número de contratos.`,
      visual: { kind: "scenario", scenarioId: "structure-bull-01", annotations: "none", caption: "Cenário DEMO: onde ficaria o stop de uma compra? Procura o último swing low que sustenta a ideia (ilustração educativa)." },
      takeaways: ["O stop marca a invalidação da ideia: para lá do swing que a sustenta, com folga para o ruído.", "Nunca se afasta o stop depois da entrada; só se aproxima, se o plano previr.", "Stop real na plataforma protege contra a tua indisciplina; gaps e slippage podem piorar a execução."],
      quiz: [
        tf("Se o trade está contra ti, é boa ideia afastar o stop para lhe 'dar espaço'.", false, "Afastar o stop aumenta o risco do plano original e é um erro de processo clássico."),
        mc("Onde se coloca normalmente o stop de uma compra?", ["Exatamente no preço de entrada", "Para lá da invalidação estrutural, com folga para o ruído", "Onde o saldo permita", "Sempre a 10 pontos"], 1, "O stop vem da análise; o tamanho adapta-se."),
        num("MYM: entrada 39.000, stop 38.955. Risco por contrato em dólares (sem custos)?", 22.5, 0.01, "$", "45 pontos × $0,50 = $22,50."),
        mc("Qual é o principal risco de um stop apenas 'mental'?", ["Custa mais comissões", "Depende da disciplina no pior momento", "Não funciona em futuros", "É ilegal"], 1, "Na hora H a emoção negoceia contigo; uma ordem real não negoceia."),
      ],
    },
    {
      slug: "breakeven-e-trailing-stop",
      title: "Breakeven e trailing stop: proteger sem sufocar",
      summary: "Mover o stop a favor do preço: o que ganhas, o que perdes e três formas de o fazer.",
      minutes: 8,
      content: `Mover o stop **a favor** do preço pode **proteger** ganhos — mas tem um preço: **tiras o trade da zona de ruído** onde a ideia precisava de respirar.

## Breakeven
Mover o stop para o **preço de entrada** (idealmente ligeiramente acima, para cobrir **comissões**). Se o preço voltar, saís **sem perda** (ou com perda mínima).
- ✔ Reduz o risco emocional e remove a perda;
- ✘ **Muitos trades "normais"** voltam à entrada antes de seguirem — o breakeven precoce **transforma ganhadores em zeros**.

## Trailing stop
O stop **acompanha** o preço à medida que a ideia progride. Formas comuns:
1. **Por estrutura:** sobe-se o stop para baixo do **último swing low** que se forma (numa compra). Respeita a lógica do mercado;
2. **Por pontos fixos:** o stop fica sempre X pontos atrás do máximo (simples, mas ignora a estrutura);
3. **Por volatilidade:** X vezes um indicador de amplitude média (por exemplo o ATR) atrás do preço, adaptando-se ao ruído.

## O trade-off central
Quanto **mais apertado** o trailing: **menos devolves**, mas **mais vezes** és retirado cedo e perdes os grandes movimentos. Quanto **mais largo**: aguentas mais ruído, mas **devolves mais** lucro aberto. **Não há valor ótimo universal** — testa em backtest e no replay.

## Quando mover
- **Com regra objetiva** (ex.: após cada novo swing confirmado) e **escrita no plano**;
- **Nunca por medo** a meio de uma vela;
- **Nunca para trás** (afastar o stop).

## Cuidado com a ilusão do "não perdi"
Sair no breakeven **parece** uma vitória, mas conta como **0R**. Se acontece muitas vezes, o teu **valor esperado** cai — e isso só se vê nas estatísticas.`,
      example: `Compra em MYM: entrada 39.000, stop 38.960 (**40 pontos = $20 por contrato**).

- Preço sobe para 39.040 (+1R) e o trader move o stop para **39.000** (breakeven);
- Um recuo normal toca 38.998 e **retira-o** — depois o preço sobe para 39.120 (+3R).

Com o stop original teria ficado no trade: **+3R**. Com o breakeven precoce: **0R**. Noutros trades o breakeven teria poupado -1R. **Nem sempre vale a pena, nem nunca vale a pena** — decide-se com **dados** (journal e backtest), não com a última experiência.`,
      exercise: { kind: "reflection", prompt: "Em quantos dos teus últimos 10 trades teria sido melhor mover o stop para o breakeven? E em quantos teria sido pior? Que regra objetiva usarias?", placeholder: "Anota os teus trades e a regra que testarias…" },
      takeaways: ["Breakeven e trailing protegem ganhos, mas aumentam a probabilidade de seres retirado cedo.", "Trailing apertado devolve menos, mas perde mais movimentos; largo faz o contrário — sem ótimo universal.", "Move o stop com regra objetiva e escrita, nunca por medo; e nunca para trás."],
      quiz: [
        mc("Qual é um risco de mover o stop para breakeven demasiado cedo?", ["Aumenta o risco inicial", "Retira ganhadores potenciais em recuos normais", "Elimina as comissões", "Obriga a usar mais margem"], 1, "O trade perde espaço para respirar e sai a 0R antes de seguir."),
        tf("Existe um valor de trailing stop que é ótimo para todos os mercados e traders.", false, "Depende do mercado, do timeframe e da tua ideia; testa-se."),
        mc("Qual destas formas de trailing segue a lógica da estrutura de mercado?", ["Stop fixo a 20 pontos do máximo", "Stop abaixo do último swing low formado", "Stop no preço de entrada para sempre", "Stop aleatório"], 1, "O trailing por estrutura acompanha os swings que a ideia vai criando."),
        tf("Sair no breakeven conta como vitória nas estatísticas.", false, "Conta como 0R; muitas saídas assim reduzem o valor esperado."),
      ],
    },
    {
      slug: "saidas-parciais",
      title: "Saídas parciais: reduzir risco, mudar a distribuição",
      summary: "Fechar uma parte da posição num alvo intermédio — e o que isso altera nos resultados possíveis.",
      minutes: 8,
      content: `Uma **saída parcial** fecha **parte** da posição num alvo intermédio (por exemplo +1R) e deixa o resto correr até ao alvo final ou ao stop.

## Porque se usa
- **Realiza** parte do ganho e **reduz a exposição** (menos contratos em risco);
- Costuma permitir **mover o stop do resto** para o breakeven com menos "dor";
- Ajuda alguns traders a manterem-se **calmos** — o que tem valor, desde que não destrua a lógica do trade.

## O que muda (e o que não muda)
A parcial **não melhora a ideia**. Muda a **forma** dos resultados: ganhos mais frequentes e mais pequenos, grandes ganhos mais raros e **mais pequenos** do que sem parcial. O **valor esperado** pode subir, descer ou ficar igual — depende do mercado e da regra.

## Condições para fazer sentido
- Precisas de **mais de 1 contrato** (em MYM é possível dividir; em 1 YM não);
- A regra tem de ser **escrita no plano** (onde, quanto, o que acontece ao stop do resto);
- Deve ser **testada** em backtest — "sentir-se melhor" não é evidência.

## Armadilhas
1. **Parcial precoce por medo** que, repetida, corta todos os ganhadores e deixa os perdedores inteiros — o pior dos dois mundos;
2. **Custos:** cada saída paga comissão; com poucos contratos, as comissões pesam;
3. **Complicar demais:** 3 alvos e 4 stops dificultam a análise e geram erros de execução.

## Como medir
No journal, regista **cada saída** e calcula o resultado **total do trade em R**. Compara depois a gestão com e sem parcial **nos mesmos trades** (backtest).`,
      example: `**4 MYM**, entrada 39.000, stop 38.960 (40 pontos = $20 por contrato → **risco $80**), alvo final 39.120 (+120 pontos = **3R**). Valor por ponto: $0,50.

**Sem parcial** (4 contratos até ao alvo): 4 × 120 × $0,50 = **+$240** (+3R).

**Com parcial** (2 contratos em +1R = 39.040; o resto com stop em breakeven):
- **A)** O preço vai ao alvo: 2 × 40 × $0,50 + 2 × 120 × $0,50 = $40 + $120 = **+$160** (+2R);
- **B)** O preço toca 39.040 e volta à entrada: $40 + $0 = **+$40** (+0,5R) — sem parcial: **−$80** (−1R);
- **C)** O preço nunca chega a 39.040: **−$80** (−1R) nos dois casos.

A parcial **dá menos** quando a ideia funciona (A) e **poupa** quando falha após uma subida (B). O que compensa depende da **frequência** de cada cenário — um número que só os teus dados mostram.`,
      exercise: { kind: "reflection", prompt: "Com os teus últimos 10 trades, estima: quantos teriam tocado +1R? Quantos depois voltaram à entrada? Quantos chegaram ao alvo? Que gestão teria dado melhor resultado total?", placeholder: "Contagens e conclusão provisória (a confirmar em backtest)…" },
      takeaways: ["A saída parcial muda a distribuição dos resultados; não melhora a ideia.", "Define no plano onde, quanto e o que acontece ao stop do resto; testa em backtest.", "Cuidado com parciais por medo: cortam ganhadores e mantêm perdedores inteiros."],
      quiz: [
        num("Com 4 MYM, parcial de 2 contratos a +40 pontos e 2 até +120 pontos (stop do resto no breakeven). Resultado total em dólares se o alvo final for atingido?", 160, 0, "$", "2 × 40 × $0,50 + 2 × 120 × $0,50 = $40 + $120 = $160."),
        num("Com os mesmos 4 MYM sem parcial, resultado em dólares se o alvo (+120 pontos) for atingido?", 240, 0, "$", "4 × 120 × $0,50 = $240."),
        tf("Uma saída parcial aumenta sempre o valor esperado da estratégia.", false, "Pode subir, descer ou ficar igual; depende dos dados e da regra."),
        mc("Qual é um risco típico das parciais feitas por medo?", ["Aumentam o risco inicial", "Cortam ganhadores cedo e deixam perdedores inteiros", "Obrigam a operar mais", "Eliminam as comissões"], 1, "Ganhos pequenos e perdas inteiras pioram a relação ganho/perda."),
      ],
    },
    {
      slug: "varias-posicoes-e-correlacao",
      title: "Várias posições, correlação e risco total aberto",
      summary: "Dois trades correlacionados não são dois riscos independentes — e porque não se aumenta uma posição perdedora.",
      minutes: 7,
      content: `Gerir um trade é uma coisa; gerir **vários ao mesmo tempo** é outra: o que conta é o **risco total aberto**.

## Risco total aberto
\`risco total = soma do risco planeado de todas as posições abertas\`

Define um **teto** (por exemplo 2% da conta) e respeita-o, **além** do risco por trade. Se já tens 1% aberto e o teto é 2%, só tens **mais 1%** disponível.

## Correlação
Instrumentos que se movem em conjunto **não diversificam**. **YM, MYM e US30 CFD** acompanham o **mesmo índice** (o Dow Jones): estar comprado em YM **e** em MYM é **a mesma aposta** — o risco soma-se. Vários índices dos EUA também tendem a mover-se juntos, sobretudo em dias de notícias.

Regra prática: trata posições correlacionadas como **um único trade** para efeitos de risco.

## Aumentar a posição
- **A favor do preço** (adicionar a uma posição que **já funciona**): só com **regra prévia**, risco **total** dentro do teto, e stop reavaliado — caso contrário o risco acumula;
- **Contra o preço (promediar):** adicionar a uma posição perdedora é **aumentar a aposta numa ideia que o mercado está a negar**. Faz crescer as perdas e é uma das causas mais comuns de contas arruinadas. **Não recomendado** num plano educativo.

## Reentradas
Depois de um stop, **reentrar** só faz sentido se houver **novo setup** (nova razão), não para "recuperar". Faz parte do limite diário: após X perdas, **paras**.

## Na prática
Antes de abrir uma posição adicional pergunta: **"Qual é o meu risco total aberto se tudo correr mal ao mesmo tempo?"** Se a resposta te desconforta, **não abras**.`,
      example: `Conta de **$10.000**, risco por trade **1% ($100)**, teto de risco total aberto **2% ($200)**.

- Trade 1: compra em MYM com risco **$100**;
- Trade 2 (quase ao mesmo tempo): compra em **YM** no mesmo índice, com risco **$100**.

Risco total: **$200 = 2%** — no teto, mas como ambas as posições dependem do **mesmo movimento**, uma perda fica nos **$200**, não nos $100. Uma terceira posição estaria **acima do teto**. Se o trade 1 perder $100, **não** se "compensa" aumentando o trade 2: respeita-se o stop e o limite diário.`,
      takeaways: ["O risco que conta é o total aberto: soma do risco planeado de todas as posições.", "YM, MYM e US30 CFD seguem o mesmo índice: posições simultâneas somam risco, não diversificam.", "Promediar perdas aumenta a aposta numa ideia negada; não é gestão de risco."],
      quiz: [
        num("Conta $20.000 e teto de risco total aberto de 2%. Já tens $150 de risco aberto. Quanto resta (em dólares) dentro do teto?", 250, 0, "$", "Teto = $400; $400 − $150 = $250."),
        tf("Comprar YM e MYM ao mesmo tempo diversifica o risco, porque são contratos diferentes.", false, "Seguem o mesmo índice; é a mesma aposta, e o risco soma-se."),
        mc("O que significa 'promediar' uma posição perdedora?", ["Fechar metade para reduzir o risco", "Adicionar à posição enquanto o preço anda contra ti", "Mover o stop para breakeven", "Operar outro instrumento"], 1, "É aumentar a aposta contra o mercado, o que cresce o risco."),
        mc("Depois de um stop, quando é aceitável reentrar?", ["Imediatamente, para recuperar", "Quando há um novo setup que cumpre o plano", "Só se o saldo estiver negativo", "Nunca em nenhum caso"], 1, "A reentrada exige uma razão nova, não o desejo de recuperar."),
      ],
    },
    {
      slug: "saidas-por-tempo-e-condicao",
      title: "Saídas por tempo e por condição",
      summary: "Sair porque a ideia já não se aplica, mesmo que o stop e o alvo ainda não tenham sido tocados.",
      minutes: 7,
      content: `Nem todos os trades terminam no stop ou no alvo. Um plano completo prevê **outras razões de saída**, sempre **objetivas** e escritas antes da entrada.

## Saída por tempo
Se o preço **não faz o que a ideia previa dentro de um prazo**, a ideia perde força.
- *Exemplo:* "Se em 12 barras não houver seguimento, saio ou reavalio";
- Útil para **não ficar "refém"** de trades mortos, que ocupam risco e atenção;
- O prazo tem de ser **testado** (varia com o timeframe e o setup).

## Saída por condição
A estrutura que sustentava a ideia **deixa de existir** antes do stop:
- **Quebra de estrutura** contra a posição (por exemplo, fecho abaixo do swing que a sustentava);
- **Mudança de contexto:** o preço entra numa zona de força oposta;
- **Evento de risco** a aproximar-se (dado macroeconómico de impacto) — se o plano diz que **não se atravessa** um evento, fecha-se **antes**;
- **Fim de sessão:** muitos traders de curto prazo fecham tudo antes do fim da sessão que usam; a regra é **tua** e deve ser coerente com a margem exigida.

## Cuidado com a "condição" emocional
Saídas por **sensação** ("não me estou a sentir bem neste trade") **não** são condições objetivas. A diferença: uma condição de saída **escreve-se** e **verifica-se** no gráfico.

## Margem e posições overnight
Manter posições de futuros fora do horário principal pode exigir **margem diferente** e implica **risco de gap**. Os valores dependem da corretora e do contrato e **variam**: confirma sempre com a fonte oficial e a tua corretora.

## Medição
Regista no journal o **motivo da saída**: stop, alvo, tempo, condição ou emoção. No fim do mês, vê quantas saídas foram "emoção" — é o teu maior espaço de melhoria.`,
      example: `Compra em MYM em 39.000 com stop em 38.960 e alvo 39.080. O plano diz: **"se em 10 barras o preço não chegar a +0,5R (39.020), saio a mercado"**.

Na barra 10, o preço está em **39.005**. O trader sai a 39.005: +5 pontos × $0,50 = **+$2,50** por contrato.

Em vez de ficar à espera de um stop de −$20 ou de um alvo de +$40, **libertou o risco** e a atenção para o próximo setup. Se a regra for má (tira trades que depois funcionam), o **backtest** mostra-o; é para isso que o motivo de saída se regista.`,
      takeaways: ["Um plano completo prevê saídas por tempo e por condição, além de stop e alvo.", "Condições de saída são objetivas e verificáveis no gráfico; sensações não contam.", "Regista o motivo da saída no journal: stop, alvo, tempo, condição ou emoção."],
      quiz: [
        mc("Qual destes é uma saída por condição objetiva?", ["Estou ansioso", "Fecho abaixo do swing low que sustentava a compra", "Já ganhei esta semana", "Ouvi um comentário"], 1, "É verificável no gráfico e deve estar escrita no plano."),
        tf("Uma saída por tempo só faz sentido se o prazo for adivinhado.", false, "O prazo deve ser testado em backtest e adaptado ao timeframe."),
        num("MYM: entrada 39.000, saída a mercado em 39.005 (compra). Resultado por contrato em dólares?", 2.5, 0.01, "$", "5 pontos × $0,50 = $2,50."),
        tf("Os valores de margem overnight dos futuros são iguais para todas as corretoras.", false, "Variam por corretora e contrato; confirma sempre na fonte oficial."),
      ],
    },
    {
      slug: "rever-a-gestao-depois-do-trade",
      title: "Rever a gestão depois do trade",
      summary: "Medir se cumpriste o plano, separar erros de gestão do azar e transformar isso em melhoria.",
      minutes: 7,
      content: `A gestão só melhora com **revisão**. Depois de cada trade (e todas as semanas), responde a perguntas **objetivas**.

## Checklist de revisão
1. **Cumpri o plano?** (stop, alvo, regras de gestão, tamanho);
2. **Fiz alguma alteração não prevista?** (afastei o stop, saí cedo, aumentei a posição);
3. **Qual foi o motivo da saída?** (stop, alvo, tempo, condição, emoção);
4. **O resultado em R** (positivo ou negativo) e o **R planeado**;
5. **Se repetisse o mesmo trade, faria igual?**

## Erros de gestão típicos
- **Afastar o stop** (a perda cresce);
- **Fechar vencedores cedo** por medo (o ganho médio encolhe);
- **Deixar perdedores correr** por esperança (a perda média cresce);
- **Mover o stop para breakeven cedo demais**;
- **Aumentar a posição para recuperar**.

Cada um destes degrada a **relação ganho/perda** (ver expectancy no módulo 17) sem que a **ideia** tenha mudado.

## Processo vs resultado
Um trade pode **ter sido bem gerido e perder** (o stop foi tocado como planeado) ou **mal gerido e ganhar** (afastaste o stop e o preço voltou). Só o primeiro é **processo correto**. A revisão avalia o **processo**, não o resultado: é por isso que esta plataforma avalia os trades do Replay e do Simulador com um **Process Score**.

## Padrões
Depois de ~20 trades, procura **padrões nos erros**: sempre à segunda-feira? depois de duas perdas? em notícias? Cada padrão vira uma **regra do plano**.

## Meta
O objetivo não é nunca perder. É que **cada perda seja a perda planeada**, e cada ganho resulte do plano — para que a tua estratégia possa ser avaliada com honestidade.`,
      example: `Três trades, riscos de $100 cada:

1. **−$100** (stop atingido como planeado) → **bem gerido**: processo correto;
2. **+$150** (+1,5R), mas o trader **afastou o stop** durante o trade e teve sorte → **mal gerido**: resultado positivo, processo incorreto;
3. **−$180**, porque **afastou o stop** e saiu mais tarde → **mal gerido**: perdeu **mais** do que o planeado ($80 a mais).

Se olhasses só para o saldo (−$130), parecia um mau dia. Olhando para o processo: **um trade impecável** e **dois erros evitáveis** — e a revisão diz exatamente o que corrigir.`,
      exercise: { kind: "link", href: "/journal", label: "Abrir o Journal", prompt: "Revê os teus últimos trades: marca em cada um o motivo da saída e se cumpriste o plano." },
      takeaways: ["Revê cada trade com perguntas objetivas: cumpri o plano? alterei algo? qual o motivo da saída?", "Gestão errada degrada a relação ganho/perda sem que a ideia mude.", "Avalia o processo, não o resultado: um trade bem gerido pode perder e um mal gerido pode ganhar."],
      quiz: [
        mc("Um trade com stop atingido como planeado e perda de −1R é…", ["Um erro de gestão", "Processo correto com resultado negativo", "Sinal para aumentar o risco", "Invalidado"], 1, "O resultado é negativo, mas o processo foi cumprido."),
        mc("Qual destes é um erro de gestão típico?", ["Respeitar o stop", "Afastar o stop depois da entrada", "Registar o motivo da saída", "Rever o trade no journal"], 1, "Afastar o stop cresce a perda e foge ao plano."),
        tf("Um trade que ganhou mas em que afastaste o stop é um bom exemplo de processo.", false, "O resultado foi positivo por sorte; o processo foi incorreto."),
        num("Risco planeado $100; saíste com perda de $180 após afastar o stop. Quanto perdeste a mais do que o planeado, em dólares?", 80, 0, "$", "$180 − $100 = $80."),
      ],
    },
  ],
  quiz: {
    title: "Quiz do módulo — Trade Management",
    passScore: 70,
    questions: [
      mc("Quando deve ser decidido o que fazer durante o trade?", ["Durante, conforme a emoção", "Antes da entrada, num plano escrito", "Só quando o trade ganha", "Depois do fecho"], 1, "As regras têm de existir antes de a emoção aparecer."),
      tf("Afastar o stop depois de entrar é uma forma de dar espaço à ideia.", false, "Aumenta o risco do plano original e é um erro de processo."),
      num("MYM: entrada 39.000, stop 38.960. Risco por contrato em dólares (sem custos)?", 20, 0, "$", "40 pontos × $0,50 = $20."),
      num("Com 4 MYM, parcial de 2 contratos a +40 pontos e 2 até +120 pontos (resto com stop no breakeven). Resultado total em dólares se o alvo final for atingido?", 160, 0, "$", "$40 + $120 = $160."),
      rr("Entrada 39.000, stop 38.960, alvo 39.120. Qual é o R:R?", 3, 0.01, "Alvo 120 ÷ stop 40 = 3,0."),
      mc("Qual é o principal trade-off de um trailing stop muito apertado?", ["Mais risco inicial", "Menos devolução de lucro, mas mais saídas cedo", "Mais comissões fixas", "Nenhum"], 1, "Apertado reduz o que devolves, mas retira-te de movimentos normais."),
      tf("YM e MYM em simultâneo diversificam o risco porque são contratos diferentes.", false, "Seguem o mesmo índice; o risco soma-se."),
      mc("Porque não se deve promediar uma posição perdedora?", ["Porque é ilegal", "Porque aumenta a aposta numa ideia que o mercado está a negar", "Porque aumenta as comissões apenas", "Porque o stop fica mais perto"], 1, "Promediar faz crescer as perdas quando a ideia já está invalidada."),
      mc("Qual destes é um motivo de saída objetivo?", ["Estou nervoso", "Fecho abaixo do swing que sustentava a ideia", "Perdi ontem", "Vi uma notícia no telemóvel"], 1, "É verificável no gráfico e previsto no plano."),
      tf("Na revisão, avalia-se o processo e não apenas o resultado do trade.", true, "Um trade bem gerido pode perder e um mal gerido pode ganhar."),
    ],
  },
};
