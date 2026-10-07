import { mc, num, tf } from "../dsl";
import type { ModuleDef } from "../types";

/**
 * Module 19 — Trading Psychology (Level 7). Educational, behaviour-focused; not therapy or clinical advice.
 * Probabilities of "no profit after N trades" were computed exactly from the binomial distribution
 * (win rate 50%, +1,5R / −1R, i.e. a positive expectancy of +0,25R per trade): 10 trades → 37,7%; 20 → 25,2%;
 * 50 → 10,1%; 100 → 2,8%; 200 → 0,3% (includes exactly break-even).
 * Platform references: the "Why are you entering?" prompt (SETUP_VALID, FOMO, REVENGE, BOREDOM, FEAR_OF_MISSING_MOVE, OTHER)
 * and the behaviour card in the Journal statistics.
 */
export const tradingPsychology: ModuleDef = {
  slug: "trading-psychology",
  number: 19,
  level: 7,
  title: "Trading Psychology",
  summary: "FOMO, vingança, overtrading, medo, ganância, hesitação, mudar de estratégia a toda a hora — e como a pergunta 'Porque estás a entrar?' e as estatísticas comportamentais ajudam.",
  difficulty: "ADVANCED",
  icon: "Brain",
  lessons: [
    {
      slug: "processo-variancia-e-amostra",
      title: "Processo, variância e tamanho da amostra",
      summary: "Porque um método com valor esperado positivo pode perder durante muito tempo — e como isso afeta o teu comportamento.",
      minutes: 8,
      content: `A maior parte dos erros psicológicos nasce de **uma ilusão**: a de que um resultado isolado diz algo sobre a **qualidade da decisão**.

## Variância
Mesmo com um método de **valor esperado positivo**, os resultados oscilam por **acaso**. Quanto **menos trades**, mais o acaso domina. É o que se chama **variância**.

## Amostra pequena engana
Se avalias a estratégia por 5, 10 ou 20 trades, estás a tirar conclusões **de ruído**. A mente humana procura padrões e **sobre-reage**:
- Duas perdas seguidas → "o método deixou de funcionar";
- Três ganhos seguidos → "descobri o segredo".

Nenhuma das frases tem suporte estatístico.

## Resultado ≠ decisão
Uma decisão **boa** pode dar mau resultado; uma **má** pode dar bom resultado. **Boa decisão** = seguiste o plano, com risco controlado, numa situação em que o plano se aplicava. O resultado de **um** trade é quase irrelevante; o **processo repetido** é que conta.

## O desafio emocional
- A **perda** dói mais do que o ganho equivalente alegra;
- O ganho recente **inflaciona** a confiança; a perda recente **mina-a**;
- A tentação é **mudar** de método ou **aumentar** o risco justamente quando não devia.

## O que fazer
1. **Mede o processo** (cumpri o plano? seguiu as regras?) e não só o saldo;
2. **Define a amostra mínima** antes de julgar (por exemplo, 50–100 trades do mesmo método);
3. **Mantém o risco constante e pequeno** — para que a variância não te deite a conta abaixo;
4. **Revê** com estatísticas (módulo de journal), não com a memória.

## Esta plataforma
O **Process Score** do Replay e do Simulador avalia **como** operaste (stop, R:R, risco, checklist, preparação, razão da entrada, saída) e **não só** quanto ganhaste. Foi desenhado para treinar esta separação.`,
      example: `Estratégia **fictícia**: 50% de trades ganhadores, ganho médio **+1,5R**, perda média **−1R**. Valor esperado: 0,5 × 1,5 − 0,5 × 1 = **+0,25R por trade** (positivo).

Mesmo assim, a probabilidade (calculada pela distribuição binomial) de **não ter lucro** ao fim de:
- **10 trades:** cerca de **37,7%**;
- **20 trades:** **25,2%**;
- **50 trades:** **10,1%**;
- **100 trades:** **2,8%**.

Um método com vantagem pode parecer "falhado" durante dezenas de trades. Quem muda de método ao fim de 10 trades nunca chega à fase em que a vantagem se manifesta — e isto assume que a vantagem existe, o que **tens de verificar** com dados.`,
      exercise: { kind: "reflection", prompt: "Pensa nos teus últimos 10 trades. Quantos seguiram o plano? Quantos resultados foram bons ou maus só por acaso? Que decisão tomarias diferente — e porquê, independentemente do resultado?", placeholder: "Escreve o teu processo, não o saldo…" },
      takeaways: ["Resultados isolados dizem pouco; um método com vantagem pode ficar muito tempo sem lucro.", "Define uma amostra mínima antes de julgar uma estratégia.", "Mede o processo (cumpri o plano?) e mantém o risco pequeno e constante."],
      quiz: [
        num("Um método tem 50% de ganhadores, +1,5R e −1R. Qual é o valor esperado por trade, em R?", 0.25, 0.001, "R", "0,5 × 1,5 − 0,5 × 1 = +0,25R."),
        tf("Dez trades chegam para concluir que uma estratégia deixou de funcionar.", false, "Com 10 trades o acaso domina; é uma amostra muito pequena."),
        mc("O que significa avaliar o 'processo'?", ["Ver só o saldo no fim do dia", "Verificar se seguiste o plano com o risco definido", "Contar quantas vezes ganhaste", "Copiar outro trader"], 1, "Processo é a qualidade das decisões, independente do resultado."),
        tf("Um trade que ganha prova que a decisão foi boa.", false, "Uma decisão má pode ganhar por sorte; um trade isolado prova pouco."),
      ],
    },
    {
      slug: "fomo-e-medo-de-ficar-de-fora",
      title: "FOMO: o medo de perder o movimento",
      summary: "Reconhecer a entrada por urgência e substituí-la por critérios.",
      minutes: 7,
      content: `**FOMO** (*fear of missing out*) é a pressão de entrar **porque o preço já se está a mexer**, não porque o plano o mandou.

## Como se manifesta
- Vês uma vela grande e **entras logo**, sem stop pensado;
- Entras **tarde**, no meio do movimento, com o stop **muito afastado**;
- Pensas "se não entro agora, perco tudo";
- Abres posições em instrumentos ou setups que **não costumas operar**.

## Porque acontece
O cérebro lê o **movimento rápido** como oportunidade urgente e a **vela perdida** como perda. Mas **não existe** "o movimento que perdi": existem apenas **setups futuros** — e o mercado produz muitos.

## O que custa
- **Entrada pior** (mais longe do nível) → stop maior → **menos contratos** ou **mais risco**;
- **R:R pior** por definição: o alvo está mais perto do que estava;
- **Sem plano** → saídas emocionais.

## Antídotos práticos
1. **Regra de ouro:** sem setup do plano, **não há trade**. Se o setup já passou, **espera o próximo**;
2. **Checklist antes de cada entrada** (módulo seguinte); se não preenches, não entras;
3. **Pergunta "Porque estou a entrar?"** — nesta plataforma, a razão "FOMO" ou "medo de perder o movimento" é uma opção honesta, e **ficará registada** nas tuas estatísticas;
4. **Atraso deliberado:** respira, espera 60 segundos, relê o plano;
5. **Desliga o ruído:** menos telas, menos redes sociais a mostrar movimentos "épicos";
6. Reconhece que **há sempre outro setup**.

## O lado bom
FOMO é **informação**: mostra que o teu plano **não define bem** onde entrar (ou que estás a olhar demasiado tempo). Torna-o mais claro.`,
      example: `O preço sobe 80 pontos em 5 minutos. O trader **não tinha** posição e **entra comprado** no topo, no 39.080, com stop "no sítio onde dói" a 39.020 (60 pontos, **$30 por MYM**). O alvo do setup original estaria em 39.090 — apenas **10 pontos acima**: **R:R de 0,17:1**. O preço recua e o stop é atingido: **−$30 por contrato**.

Se tivesse esperado, haveria um **recuo ao suporte anterior** e uma entrada com R:R de 3:1. O FOMO transforma uma boa oportunidade (esperar o setup) numa **má** (perseguir o preço).`,
      takeaways: ["FOMO é entrar por urgência, sem setup; a entrada tardia piora stop e R:R.", "Não existe 'o movimento que perdi': existem setups futuros.", "Antídotos: checklist, razão da entrada registada, pausa deliberada e menos ruído."],
      quiz: [
        mc("O que caracteriza uma entrada por FOMO?", ["Cumprir exatamente o plano", "Entrar porque o preço já está a mexer-se, sem setup", "Esperar confirmação", "Reduzir o tamanho"], 1, "A urgência substitui os critérios do plano."),
        tf("Se perdi um movimento, devo perseguir o preço com stop largo para compensar.", false, "Entrada tardia com stop largo piora o R:R; espera o próximo setup."),
        mc("Qual é um bom antídoto contra FOMO?", ["Aumentar o tamanho", "Checklist antes de entrar e esperar o próximo setup", "Desligar o stop", "Operar outro instrumento ao acaso"], 1, "Critérios escritos substituem a urgência."),
        tf("Registar 'FOMO' como razão da entrada é inútil porque ninguém olha para isso.", false, "As estatísticas comportamentais mostram quantas entradas foram emocionais e os resultados dessas."),
      ],
    },
    {
      slug: "vinganca-e-overtrading",
      title: "Vingança e overtrading",
      summary: "O trade para 'recuperar' e o excesso de trades: dois ciclos que se alimentam.",
      minutes: 8,
      content: `Depois de uma perda, a mente quer **resolver o desconforto** — e o mercado parece o local para o fazer. É o chamado **revenge trading**.

## Revenge trading
- Entras logo a seguir a uma perda, **sem setup**;
- **Aumentas o tamanho** para "recuperar" mais depressa;
- **Afastas o stop** para "dar espaço";
- Quebras regras que tinhas escrito minutos antes.

O que parece racional ("preciso de recuperar $100") é **emocional**: o mercado não sabe que perdeste e **não te deve** nada.

## Overtrading
É operar **mais do que o plano prevê**: por tédio, adrenalina, ou para "ser produtivo". Consequências:
- **Comissões e spread** acumulam;
- A **qualidade** média dos setups desce (aceitas o mediano);
- **Cansaço** e erros;
- Mais **exposição** a ruído.

## Um ciclo que se alimenta
Perda → vingança → mais trades → mais perdas → mais vingança. Quebrá-lo exige **regras externas** — limites que **não negoceias** em tempo real.

## Regras anti-ciclo
1. **Máximo de trades por dia** (por exemplo 3) e **máximo de perdas seguidas** (por exemplo 2);
2. **Perda máxima diária** (ver módulo 17): ao atingi-la, **paras**;
3. **Pausa obrigatória** depois de uma perda (15–30 min), longe do ecrã;
4. **O tamanho nunca aumenta** depois de perdas;
5. **Registo da razão**: se a razão da entrada é "VINGANÇA" ou "TÉDIO", o plano manda **fechar a plataforma**.

## Nota sobre gamificação
O XP e as conquistas desta plataforma **não premiam** o volume de trades; a avaliação de processo penaliza razões emocionais e falta de stop. **Mais trades não é melhor.**`,
      example: `Trader com conta de **$10.000**, risco 1% ($100), limite diário de **2 perdas**:

- 10h05: perde $100 (stop); 10h30: segunda perda de **$100** → **regra:** acabou o dia;
- Sem a regra, entra mais 3 vezes "para recuperar" com **o dobro do tamanho**: perde $200, $200 e $150 → **−$750** no dia (7,5% da conta).

**Custos ilustrativos** (comissão de $1 ida e volta por MYM, 4 contratos): 5 trades/dia custam 5 × 4 × $1 = **$20/dia**; ao fim de 20 dias, **$400** — só em comissões, antes de qualquer erro.`,
      exercise: { kind: "reflection", prompt: "Quais são os teus sinais de alarme depois de uma perda (pensamentos, sensações, ações)? Que regra concreta e externa vais escrever no teu plano para os travar?", placeholder: "Ex.: Depois de 2 perdas seguidas, fecho a plataforma por hoje." },
      takeaways: ["Revenge trading tenta resolver o desconforto da perda, não uma oportunidade do mercado.", "Overtrading acumula custos e degrada a qualidade dos setups.", "Limites externos (trades, perdas seguidas, perda diária, pausa) travam o ciclo; não negoceies no momento."],
      quiz: [
        mc("O que é revenge trading?", ["Entrar por vingança contra o mercado para recuperar uma perda", "Operar apenas em notícias", "Usar stop apertado", "Reduzir risco após perdas"], 0, "É uma decisão emocional; o mercado não te deve nada."),
        num("Comissão ilustrativa de $1 ida e volta por contrato. 5 trades/dia com 4 contratos cada. Custo diário em dólares?", 20, 0, "$", "5 × 4 × $1 = $20."),
        tf("Aumentar o tamanho depois de perdas é uma forma sensata de recuperar.", false, "Aumenta o risco quando estás emocionalmente pior; o tamanho não sobe após perdas."),
        mc("Qual regra ajuda a travar o ciclo de vingança?", ["Perda máxima diária e máximo de perdas seguidas", "Operar só às sextas", "Remover stops", "Trocar de estratégia no mesmo dia"], 0, "Limites externos funcionam porque não se negociam no momento."),
      ],
    },
    {
      slug: "medo-hesitacao-e-saidas-precoces",
      title: "Medo, hesitação e saídas precoces",
      summary: "Não entrar no setup válido, fechar ganhadores cedo, deixar perdedores correr — o outro lado do espelho.",
      minutes: 8,
      content: `O medo também decide trades — normalmente pelo **lado oposto** ao FOMO.

## Formas do medo
- **Hesitação:** o setup cumpre todas as regras e **não entras** por medo de perder (depois olhas e "fazia sentido"). Quem hesita regista só os setups que **correram mal**, e acaba a operar os piores;
- **Saída precoce:** fechas um ganhador a +0,3R porque **"já é lucro"** — o ganho médio encolhe;
- **Deixar perdedores correr:** não executas o stop por **esperança** ("vai voltar") — a perda média cresce;
- **Mover o stop:** afasta-se para evitar a dor da perda;
- **Paralisia após perdas:** depois de uma sequência negativa, ficas sem operar um setup bom.

## A assimetria que destrói contas
Muitos traders **cortam ganhos** cedo (para travar o medo de perder o ganho) e **seguram perdas** (para evitar a dor de as realizar). Resultado: ganhos médios **pequenos**, perdas médias **grandes** — a relação ganho/perda **estraga** qualquer win rate.

## O que fazer
1. **Plano escrito:** o que acontece em cada cenário (módulo 18);
2. **Risco pequeno:** se uma perda dói, o risco está **acima do teu conforto** — baixa-o;
3. **Executar o stop** como parte do plano (stop real na plataforma);
4. **Exposição gradual:** depois de uma série má, reduz o tamanho (nunca aumentes) até recuperares a confiança no processo;
5. **Registar** as ocasiões em que não entraste num setup válido e as saídas antecipadas — no journal.

## A pergunta certa
Em vez de "vai ganhar?", pergunta **"este trade cumpre o meu plano?"**. Se sim, **executa** — qualquer resultado individual é aceitável.`,
      example: `Duas séries de 10 trades com **50% de ganhadores**:

- **Disciplinada:** ganho médio **+1,5R**, perda média **−1R** → 5 × 1,5 − 5 × 1 = **+2,5R**;
- **Emocional:** ganhadores cortados a **+0,6R** e perdedores deixados a correr até **−1,4R** → 5 × 0,6 − 5 × 1,4 = 3 − 7 = **−4,0R**.

**Mesmo win rate**, resultados opostos: a diferença está no comportamento depois da entrada — não na análise.`,
      takeaways: ["O medo gera hesitação, saídas precoces, perdas seguradas e stops movidos.", "Cortar ganhos e segurar perdas destrói a relação ganho/perda, mesmo com bom win rate.", "Risco pequeno, plano escrito e stop real reduzem a necessidade de decidir sob pressão."],
      quiz: [
        num("10 trades, 50% ganhadores. Ganhadores cortados em +0,6R e perdedores até −1,4R. Resultado total em R?", -4, 0.01, "R", "5 × 0,6 − 5 × 1,4 = 3 − 7 = −4R."),
        mc("Qual combinação é típica de um comportamento movido pelo medo?", ["Cortar ganhos cedo e segurar perdas", "Seguir o plano sempre", "Reduzir o risco de forma planeada", "Esperar confirmação"], 0, "Ganhos pequenos e perdas grandes estragam a relação ganho/perda."),
        tf("Se uma perda dói demasiado, o risco por trade provavelmente está acima do teu conforto.", true, "Reduzir o risco é a resposta saudável; não 'endurecer'."),
        tf("Depois de uma série má, deve-se aumentar o tamanho para recuperar a confiança.", false, "Reduz-se o tamanho até recuperar confiança no processo; nunca se aumenta."),
      ],
    },
    {
      slug: "ganancia-euforia-e-excesso-de-confianca",
      title: "Ganância, euforia e excesso de confiança",
      summary: "O risco das boas fases: aumentar o tamanho, relaxar regras, esticar alvos.",
      minutes: 7,
      content: `As **fases boas** são tão perigosas como as más — porque ninguém as vigia.

## Sinais
- **Aumentar o tamanho** depois de uma série de ganhos ("estou em forma");
- **Relaxar regras:** sem checklist, stop mais largo, trades fora do plano;
- **Esticar alvos** além do que o plano previa, deixando ganhos abertos desaparecerem;
- **Sentir-se imbatível:** aceitar trades de menor qualidade;
- **Falar de um 'sistema perfeito'** — qualquer frase que prometa o impossível.

## Porque é perigoso
A ligação entre **ganho recente e capacidade** é falsa em amostras pequenas (ver lição 1): uma série boa **pode ser sorte**. Aumentar o risco depois dela é apostar **mais** quando a probabilidade de reversão à média existe.

## A regra
O **risco por trade** é definido no plano e **não** sobe com séries de ganhos. Se queres aumentar o tamanho, faz-o por **regra objetiva** e **lenta** — por exemplo, rever mensalmente com base em estatísticas de 100+ trades — e nunca num dia bom.

## Alvo e ganância
Esticar o alvo "porque está a correr" só faz sentido **se o plano o previr** (trailing por estrutura, por exemplo). Caso contrário, o ganho aberto é devolvido e o trader sente-se **pior** do que se tivesse perdido.

## Fase de euforia = hora de rever o plano
Quando te sentires **invencível**, escreve o que te levou ao resultado (setup, risco, execução) e verifica se **repetirias** o mesmo com o mesmo tamanho. Se a resposta for "sim, mas com o dobro", é um sinal para **parar** e rever.

## Sem promessas
Nesta plataforma **não existem** garantias de resultado, "sistemas perfeitos" ou taxas de acerto mágicas — e desconfia de quem os vende.`,
      example: `Conta $10.000, risco 1% ($100). Três ganhos seguidos (+$150, +$120, +$180). O trader sente-se imbatível e **duplica o risco** para 2% ($200) no quarto trade — sem alterar o plano.

O quarto trade perde **−$200** e as duas seguintes também (**2 × −$200**): **−$600** no total, que deixam os três ganhos ($450) num saldo de **−$150**. Com o risco constante de 1%, as mesmas três perdas teriam custado **$300**, deixando **+$150**.

Duplicar o risco **não melhorou** a análise; só duplicou o custo do erro.`,
      takeaways: ["As boas fases também são perigosas: relaxar regras e aumentar o tamanho é o erro típico.", "O risco por trade não sobe com séries de ganhos; ajustes fazem-se por regra objetiva e lenta.", "Esticar alvos só faz sentido se o plano o previr."],
      quiz: [
        mc("Qual é um sinal típico de excesso de confiança?", ["Seguir o plano", "Aumentar o risco depois de uma série de ganhos", "Rever o journal", "Usar stop real"], 1, "A série pode ser sorte; aumentar o risco duplica o custo do erro."),
        tf("Uma série de 3 ganhos prova que o método tem vantagem.", false, "Três trades são uma amostra minúscula."),
        mc("Quando é razoável considerar aumentar o tamanho?", ["Logo a seguir a um dia muito bom", "Por regra objetiva, com estatísticas de muitos trades", "Quando se sente confiança", "Nunca existe razão"], 1, "Ajustes lentos e baseados em dados, não em emoção."),
        tf("Esticar o alvo em direção ao ganho máximo é sempre a melhor decisão.", false, "Sem regra no plano, o ganho aberto pode ser devolvido."),
      ],
    },
    {
      slug: "mudar-de-estrategia-constantemente",
      title: "Mudar de estratégia constantemente",
      summary: "O ciclo de 'o próximo método é que é' e porque impede qualquer aprendizagem real.",
      minutes: 7,
      content: `Um dos hábitos mais caros do trading é **trocar de método** ao primeiro período mau.

## O ciclo
1. Aprendes um método; **corre bem** uns dias;
2. Surge uma série de perdas (**normal**, ver lição 1);
3. Concluis que o método **não funciona**;
4. Procuras outro (vídeo novo, indicador novo, "estratégia secreta");
5. Recomeças — **sempre com amostra pequena**.

## Porque falha
- **Nunca testas** nenhum método até ao fim: não sabes o seu comportamento real;
- **Misturas regras** de vários métodos (um híbrido incoerente);
- **Reinicias a curva de aprendizagem** de cada vez;
- Alimentas a esperança de um "método mágico", que **não existe** — e é a isca típica de promessas enganosas.

## O que fazer
1. **Escolhe um método** (por exemplo, um dos setups educativos do módulo 16 ou o *Confluence Trading Framework*) e **define a amostra mínima** (por exemplo, 100 trades no Replay/backtest);
2. **Testa** com regras escritas, no Replay e depois em conta demo;
3. **Só alteras** o método depois de terminar a amostra e **por razão estatística** (não por emoção);
4. **Mudanças pequenas e uma de cada vez**, com data e motivo no journal;
5. **Aceita que é normal** passar por períodos sem resultados.

## Não é o mesmo que evoluir
**Evoluir** é ajustar com **dados** (por exemplo, "o breakeven precoce corta ganhadores — vou testar um trailing por estrutura"). **Saltar de método** é fugir ao desconforto.

## Cuidado com as promessas
Qualquer venda de "método secreto", de taxas de acerto quase perfeitas ou de "copy trading" com ganhos prometidos é um **sinal de alarme**. Esta plataforma recusa explicitamente essas ideias.`,
      example: `Trader testa **4 métodos em 4 semanas**, 12 trades de cada. Em cada um tem uma má série e abandona.

Se tivesse mantido o **método 1** durante **100 trades** (seguindo as regras), teria dados sobre:
- win rate e R médio reais;
- pior sequência de perdas;
- onde o processo falha (stop, saídas).

Com 4 × 12 = 48 trades repartidos por 4 métodos, **não tem informação sobre nenhum**. O custo não foi só dinheiro: foi **tempo de aprendizagem**.`,
      takeaways: ["Mudar de método ao primeiro mau período impede qualquer aprendizagem estatística.", "Escolhe um método, define a amostra mínima e só ajusta depois, por razão estatística.", "Desconfia de 'métodos secretos' e promessas de win rate: não existem."],
      quiz: [
        mc("Qual é a melhor resposta a uma série de perdas num método com regras claras?", ["Abandonar de imediato", "Verificar se o processo foi cumprido e continuar a amostra planeada", "Aumentar o risco", "Misturar com outro método"], 1, "Variância é normal; primeiro verifica o processo e a amostra."),
        tf("Trocar de método de duas em duas semanas é uma forma eficaz de encontrar o melhor.", false, "Nunca chegas a uma amostra com significado."),
        mc("O que distingue 'evoluir' de 'saltar de método'?", ["Evoluir usa dados e muda uma coisa de cada vez", "Evoluir é mudar tudo", "Não há diferença", "Saltar de método usa mais dados"], 0, "Evolução é metódica e baseada em estatística."),
        tf("Um vendedor que promete uma taxa de acerto quase perfeita é um sinal de alarme.", true, "Promessas de resultado fixo são típicas de esquemas enganosos."),
      ],
    },
    {
      slug: "porque-estas-a-entrar",
      title: "A pergunta 'Porque estás a entrar?' e as estatísticas comportamentais",
      summary: "Usar o registo da razão da entrada e o painel de comportamento do journal para te conheceres.",
      minutes: 7,
      content: `Antes de abrir um trade no Replay ou no Simulador, a plataforma pergunta: **"Porque estás a entrar?"**

## As razões disponíveis
- **Setup válido:** cumpre o plano e a checklist;
- **FOMO:** pressão de entrar porque o preço se está a mexer;
- **Vingança:** vontade de recuperar uma perda;
- **Tédio:** nada a fazer e vontade de "fazer alguma coisa";
- **Medo de perder o movimento:** variante do FOMO focada no movimento;
- **Outra:** razão não listada (descreve-a).

Não é um teste moral. É uma forma de **tornar visível** o que normalmente fica implícito.

## Como é usada
- A razão **entra no Process Score**: razão válida soma pontos; razões emocionais **não**;
- As **estatísticas comportamentais** (no Journal) mostram a **percentagem de entradas emocionais**, o win rate e o R médio de **cada** razão, a percentagem de trades **com stop**, com **R:R ≥ 1,5** e a checklist média;
- **Nada disto bloqueia**: podes entrar por FOMO — só fica registado.

## Como ler os números (com cuidado)
- **Amostra pequena** (menos de ~20 trades por categoria) → conclusões **provisórias**;
- Compara **razões** entre si (por exemplo, R médio de "setup válido" vs "FOMO");
- Procura **padrões**, não culpados: "as entradas por tédio acontecem à tarde"?

## Boas práticas
1. **Sê honesto**; se mentires ao registo, só te enganas a ti;
2. **Revê semanalmente**: qual razão emocional foi mais comum?
3. **Cria uma regra** para ela: "se for tédio, faço uma pausa de 15 minutos";
4. **Celebra a honestidade**: registar "FOMO" é melhor do que fingir que foi "setup válido".

## Limites
As estatísticas **não prevêem** o futuro nem decidem por ti. São um **espelho**.`,
      example: `Journal fictício com 40 trades:

| Razão | Trades | R médio |
|---|---|---|
| Setup válido | 28 (70%) | +0,35R |
| FOMO | 8 (20%) | −0,40R |
| Tédio | 4 (10%) | −0,55R |

**Entradas emocionais: 30%.** A estatística não prova causalidade (amostra pequena), mas sugere uma regra experimental: **"sem setup, sem trade — pausa de 15 minutos quando surge a vontade"**. No mês seguinte, verifica-se se a percentagem desceu e o que aconteceu ao R médio.`,
      exercise: { kind: "link", href: "/journal", label: "Ver estatísticas de comportamento", prompt: "Abre as estatísticas do Journal e identifica a razão de entrada mais comum fora de 'setup válido'. Escreve uma regra para a reduzir." },
      takeaways: ["A pergunta 'Porque estás a entrar?' torna visível a razão real da entrada.", "O painel de comportamento mostra a percentagem de entradas emocionais e o R médio por razão.", "Lê os números com cautela (amostra pequena) e transforma-os em regras experimentais."],
      quiz: [
        mc("Para que serve a pergunta 'Porque estás a entrar?'?", ["Bloquear entradas emocionais", "Tornar visível a razão e alimentar as estatísticas e o Process Score", "Dar um sinal de compra", "Prever o mercado"], 1, "Regista a razão; não bloqueia."),
        tf("Registar 'FOMO' como razão é preferível a fingir que foi um 'setup válido'.", true, "A honestidade dá dados úteis; mentir ao registo só engana quem o faz."),
        num("40 trades, 12 entradas emocionais (FOMO + tédio). Qual é a percentagem de entradas emocionais?", 30, 0.01, "%", "12 ÷ 40 = 0,30, ou seja, 30%."),
        tf("As estatísticas comportamentais permitem prever os resultados futuros.", false, "São um espelho do passado; não preveem."),
      ],
    },
    {
      slug: "rotinas-limites-e-quando-parar",
      title: "Rotinas, limites e quando parar",
      summary: "Preparação antes da sessão, disjuntores durante e revisão depois — e quando procurar ajuda externa.",
      minutes: 8,
      content: `A estabilidade emocional constrói-se com **estrutura**, não com força de vontade no momento.

## Antes da sessão
1. **Dormir e comer** razoavelmente — decisões sob cansaço são piores;
2. **Plano diário** (módulo seguinte): contexto, níveis, eventos, limites do dia;
3. **Estado emocional:** se estás irritado, ansioso ou com pressa, **reduz** ou **não operes**;
4. **Define o que fazes** se algo correr mal.

## Durante
- **Checklist** antes de cada entrada;
- **Disjuntores:** perda máxima diária, máximo de perdas seguidas, máximo de trades;
- **Pausas:** 5 min a cada hora; 15–30 min depois de uma perda;
- **Sem multitarefa:** nada de redes sociais, notícias aleatórias ou conversas durante a execução.

## Depois
- **Journal** com razão da entrada, estado emocional e erros;
- **Revisão semanal** de padrões e **uma** regra a alterar;
- **Descanso:** o corpo e a mente também são parte do sistema.

## Sinais de tilt
Irritação, pressa, vontade de "mostrar ao mercado", **ignorar o plano**, aumentar o tamanho, falar sozinho/a. Ao reconhecer **dois sinais**, o plano manda **fechar a plataforma**.

## Dinheiro que podes perder
Opera apenas com capital que **não precisas** para despesas essenciais. Usa a **conta demo** até teres processo consistente. A alavancagem dos futuros **amplifica ganhos e perdas**.

## Quando procurar ajuda
Esta plataforma é **educativa** e não substitui apoio profissional. Se o trading estiver a afetar a tua **saúde, relações ou finanças** — ansiedade, insónia, impulsos de recuperar perdas a qualquer custo, dívidas — **pára** e fala com alguém de confiança ou com um profissional (por exemplo, médico, psicólogo ou serviços de apoio a problemas de jogo). **Não é fraqueza.**`,
      example: `Rotina de uma sessão **fictícia**:

- **08:30** — lê o calendário económico, preenche o plano diário (limites: 2 perdas ou $200 → para);
- **09:30** — primeiro setup: checklist 12/12, entra, perde −$100 (stop);
- **09:50** — pausa de 15 minutos; **não** abre trade;
- **10:15** — segundo setup: checklist 11/12 (falha a confluência) → **não entra**;
- **10:45** — novo setup válido, checklist 12/12; perde −$100. **Limite atingido (2 perdas)** → fecha a plataforma e preenche o journal.

Dia **−$200**, exatamente o planeado. Sem rotina e limites, poderia ter sido **−$600**.`,
      takeaways: ["A estabilidade emocional vem de estrutura: rotina, plano, limites e pausas.", "Ao reconhecer dois sinais de tilt, fecha a plataforma.", "O trading não substitui apoio profissional: se te afetar a saúde ou finanças, pede ajuda."],
      quiz: [
        mc("Qual é o objetivo dos disjuntores (limites diários) num plano?", ["Impedir qualquer perda", "Parar o ciclo emocional antes de causar danos maiores", "Aumentar o número de trades", "Substituir o stop loss"], 1, "Limites externos funcionam porque não dependem do teu estado emocional."),
        tf("Se estás irritado, é boa ideia operar mais para recuperar o humor.", false, "Estado emocional negativo é razão para reduzir ou parar."),
        mc("O que fazer se o trading estiver a afetar gravemente a tua saúde ou finanças?", ["Aumentar o risco", "Parar e procurar apoio de pessoas de confiança ou profissionais", "Esconder o problema", "Operar mais depressa"], 1, "A plataforma é educativa; a saúde e as finanças vêm primeiro."),
        tf("Operar com dinheiro de que precisas para despesas essenciais reduz a pressão.", false, "Aumenta a pressão emocional; opera só com capital que podes perder."),
      ],
    },
  ],
  quiz: {
    title: "Quiz do módulo — Trading Psychology",
    passScore: 70,
    questions: [
      num("Método com 50% de ganhadores, +1,5R e −1R. Valor esperado por trade em R?", 0.25, 0.001, "R", "0,5 × 1,5 − 0,5 × 1 = +0,25R."),
      tf("Dez trades chegam para concluir que um método com regras claras deixou de funcionar.", false, "Com amostras pequenas, o acaso domina."),
      mc("Qual destas razões de entrada é emocional?", ["Setup válido que cumpre a checklist", "FOMO", "Plano diário", "Confluência de 6/8 fatores"], 1, "FOMO é urgência, não critério."),
      mc("O que fazer depois de uma perda, segundo o processo?", ["Entrar logo a seguir com o dobro do tamanho", "Pausa e rever se o plano foi cumprido", "Mudar de estratégia no mesmo dia", "Remover o stop"], 1, "Pausa e revisão quebram o ciclo de vingança."),
      num("10 trades, 50% ganhadores. Ganhadores em +0,6R e perdedores em −1,4R. Resultado total em R?", -4, 0.01, "R", "5 × 0,6 − 5 × 1,4 = −4R."),
      tf("Aumentar o risco depois de uma série de ganhos é prática prudente.", false, "A série pode ser sorte; aumenta o custo do erro."),
      mc("Qual é o hábito mais destrutivo mencionado no módulo para a relação ganho/perda?", ["Registar o journal", "Cortar ganhos cedo e segurar perdas", "Ter plano escrito", "Usar stop real"], 1, "Ganhos pequenos e perdas grandes estragam qualquer win rate."),
      tf("Mudar de método ao primeiro mau período permite aprender mais depressa.", false, "Impede a amostra necessária para avaliar qualquer método."),
      num("40 trades, 12 com razão emocional. Percentagem de entradas emocionais?", 30, 0.01, "%", "12 ÷ 40 = 0,30, ou seja, 30%."),
      mc("Quando procurar apoio externo?", ["Nunca; o trading resolve-se sozinho", "Quando o trading afeta a saúde, relações ou finanças", "Só depois de perder tudo", "Apenas quando o broker pedir"], 1, "A plataforma é educativa; a saúde vem primeiro."),
    ],
  },
};
