import { mc, num, rr, tf } from "../dsl";
import type { ModuleDef } from "../types";

/**
 * Module 20 — Daily Trading Plan & Pre-Trade Checklist (Level 8). Mirrors the platform's /tools/daily-plan form
 * (bias, key levels PDH/PDL/PWH/PWL, major S/R, supply/demand, events, "what must happen", invalidation, max risk, max trades,
 * notes, review, followed plan) and the 12-item checklist in the order ticket. The checklist only ever WARNS — it never blocks.
 */
export const dailyPlanAndChecklist: ModuleDef = {
  slug: "daily-plan-and-checklist",
  number: 20,
  level: 8,
  title: "Daily Trading Plan & Pre-Trade Checklist",
  summary: "O plano do dia (viés, níveis, eventos, limites) e a checklist de 12 itens antes de cada entrada — como ferramentas de disciplina, não de burocracia.",
  difficulty: "ADVANCED",
  icon: "ClipboardCheck",
  lessons: [
    {
      slug: "porque-um-plano-diario",
      title: "Porque escrever um plano diário",
      summary: "Decidir o contexto e os limites com a cabeça fria, antes de a sessão começar.",
      minutes: 6,
      content: `Quando o mercado abre, tudo acelera: velas, notícias, emoções. O **plano diário** é a tua âncora: uma página, escrita **antes** da sessão, que responde ao essencial.

## O que o plano resolve
- **Contexto:** em que mercado estou? (viés, níveis, eventos);
- **Hipóteses:** o que **tem** de acontecer para eu operar? O que **invalida** a ideia?
- **Limites:** quanto posso perder hoje? Quantos trades faço?
- **Comportamento:** o que **não** vou fazer.

## O que o plano NÃO é
- ✘ **Não é previsão:** o viés é uma **hipótese**; o mercado decide;
- ✘ **Não é obrigação de operar:** "hoje não há setup" é um plano válido;
- ✘ **Não é um documento enorme:** se demora mais de 10 minutos, simplifica.

## Os campos do plano nesta plataforma
Na página **Plano diário** (Ferramentas) registas:
1. **Data;**
2. **Viés** (altista, baixista ou neutro);
3. **Níveis-chave** (máximo/mínimo do dia anterior, da semana anterior, S/R principais, zonas de oferta e procura);
4. **Eventos** do dia (dados económicos, discursos);
5. **O que tem de acontecer** (condições) e **o que invalida**;
6. **Risco máximo do dia** (em $ ou %) e **máximo de trades**;
7. **Notas**;
8. **Revisão** no fim do dia e se **seguiste o plano**.

## Planear é treinar
Um plano que **nunca se revê** não melhora. A revisão fecha o ciclo: previste, agiste, mediste, ajustaste.

## Quanto tempo?
**5 a 10 minutos** por dia. Com a prática, a parte difícil deixa de ser escrever e passa a ser **obedecer** — e é aí que está o valor.`,
      example: `Plano fictício de uma terça-feira (**DEMO/educativo**):

- **Viés:** neutro (o preço está num range dentro da zona 38.900–39.100);
- **Níveis:** máximo do dia anterior 39.140; mínimo 38.880;
- **Eventos:** dados de emprego às 13:30 (hora de Lisboa) — **impacto alto**;
- **Tem de acontecer:** teste do suporte 38.900 com rejeição em velas de 5 min;
- **Invalida:** fecho de 15 min abaixo de 38.880;
- **Limites:** risco máximo **$200** (2% de $10.000), **máximo 3 trades**.

Se às 13:25 nada disto estiver a acontecer, **o plano diz: não operar** — e isso conta como uma boa decisão.`,
      exercise: { kind: "link", href: "/tools/daily-plan", label: "Abrir o Plano diário", prompt: "Preenche o plano de hoje (ou de um dia fictício). Define o que tem de acontecer, o que invalida, o risco máximo e o máximo de trades." },
      takeaways: ["O plano diário fixa contexto, hipóteses e limites antes de a emoção aparecer.", "O viés é uma hipótese, não uma previsão; 'não operar' é um plano válido.", "Dura 5–10 minutos e fecha-se com revisão no fim do dia."],
      quiz: [
        tf("O viés do plano diário é uma previsão do que o mercado vai fazer.", false, "É uma hipótese de trabalho; o mercado decide."),
        mc("Qual destes campos pertence ao plano diário?", ["O resultado esperado do dia", "O risco máximo do dia e o máximo de trades", "A garantia de lucro", "O nome do broker"], 1, "O plano define limites; não prevê resultado."),
        tf("Um dia em que o plano diz 'não operar' é um dia falhado.", false, "Respeitar a ausência de setup é uma boa decisão de processo."),
        mc("Quanto tempo deve demorar tipicamente o plano diário?", ["2 horas", "5 a 10 minutos", "Um dia inteiro", "Não precisa de tempo"], 1, "Curto e útil; se demorar mais, simplifica."),
      ],
    },
    {
      slug: "contexto-niveis-e-vies",
      title: "Contexto, níveis-chave e viés",
      summary: "Do gráfico de timeframe superior ao viés do dia: níveis, zonas e o que fazer quando o viés é neutro.",
      minutes: 8,
      content: `O contexto vem de cima para baixo: do **timeframe superior** para o de execução.

## 1. Timeframe superior
- **Diário/4H:** tendência, estrutura, zonas relevantes;
- **1H:** swing recente e níveis intradiários;
- **Execução (por exemplo 5–15 min):** onde se procuram setups.

## 2. Níveis-chave do dia
- **PDH / PDL** — máximo e mínimo do **dia anterior**;
- **PWH / PWL** — máximo e mínimo da **semana anterior**;
- **S/R principais** e **zonas de oferta e procura** relevantes;
- **Equal highs/lows** (liquidez) próximos;
- **Níveis redondos** (por exemplo 39.000), que muitas vezes atraem ordens.

Regista **poucos** níveis: o mapa serve para decidir, não para decorar.

## 3. O viés
- **Altista:** estrutura a subir (HH/HL) e preço acima das zonas relevantes → procuras **compras** em recuos;
- **Baixista:** o inverso → procuras **vendas** em repiques;
- **Neutro:** range ou sinais mistos → **reduz tamanho**, opera apenas setups muito claros ou **não operes**.

O viés é **condicional**: *"Se o preço mantiver 38.900, o viés é altista; se fechar abaixo, fica neutro/baixista."* Isto evita **teimosia** e prepara a tua reação.

## 4. Ligação com o resto do currículo
O viés usa os **módulos 4 a 11**: tendência, S/R, oferta/procura, estrutura, Fibonacci, price action, liquidez e confluência. O plano diário é onde isto **converge** num texto curto.

## 5. Erros comuns
- Viés **rígido** que ignora o que o mercado mostra;
- **Demasiados** níveis, sem prioridade;
- Planear só **no sentido que queres** (viés de confirmação).

## Alerta
Os níveis e o viés **não são previsões** nem sinais: são o teu mapa de hipóteses. A decisão final é sempre a do **plano de trade** com stop e risco definidos.`,
      example: `Mapa fictício (DEMO):

- **Diário:** tendência de alta, mas o preço está numa zona de resistência (39.150–39.200);
- **1H:** máximos descendentes recentes (LH);
- **PDH:** 39.140 · **PDL:** 38.880 · **PWH:** 39.320 · **PWL:** 38.600;
- **Nível redondo:** 39.000.

**Viés do dia:** neutro, com inclinação a vender se houver rejeição em 39.140 e a comprar apenas se o preço recuperar e fechar acima de 39.200. **Condicional**, não opinião.

Plano: **só opero** um dos dois cenários, com stop definido pela invalidação e risco de 1%; senão **espero**.`,
      takeaways: ["O contexto vai do timeframe superior ao de execução; os níveis são poucos e priorizados.", "O viés é condicional ('se mantiver X, então…') e pode ser neutro.", "Níveis e viés são hipóteses, não previsões nem sinais."],
      quiz: [
        mc("O que são PDH e PDL?", ["Máximo e mínimo do dia anterior", "Preço e stop", "Piso e teto da semana", "Dois indicadores"], 0, "Previous Day High e Previous Day Low são níveis de referência."),
        tf("Um viés neutro pode justificar não operar ou reduzir o tamanho.", true, "Sem direção clara, a prudência é uma decisão legítima do plano."),
        mc("Qual é a melhor formulação de um viés?", ["Vai subir hoje", "Se o preço mantiver 38.900, viés altista; se fechar abaixo, neutro/baixista", "O mercado nunca falha", "Compra sempre"], 1, "Um viés condicional prepara a reação e evita teimosia."),
        tf("Quantos mais níveis marcares, melhor será o plano.", false, "Níveis a mais criam ruído; prioriza os mais relevantes."),
      ],
    },
    {
      slug: "eventos-e-limites-do-dia",
      title: "Eventos e limites do dia",
      summary: "Calendário económico, perda máxima, máximo de trades e as regras 'se… então…' do dia.",
      minutes: 7,
      content: `Um bom plano diário tem **menos previsões e mais limites**.

## Eventos
Consulta o **calendário económico** da plataforma (impacto Baixo, Médio, Alto ou Extremo) e regista no plano:
- **Hora** do evento (em **tua** hora local);
- **Impacto** esperado;
- **O que farás:** não operar nos minutos à volta? Reduzir tamanho? Operar a reação?

Não existe regra universal de "não operar notícias": **depende do teu método e do teu risco**. Mas **decide antes**.

## Limites do dia
1. **Perda máxima diária** (em $ ou % da conta) — ao atingi-la, **paras**;
2. **Máximo de trades** — protege contra overtrading;
3. **Máximo de perdas seguidas** — por exemplo 2;
4. **Horário de operação** — só nas janelas que usas.

## O que tem de acontecer / o que invalida
- **Tem de acontecer:** condições para considerares um setup (por exemplo "teste de 38.900 com rejeição");
- **Invalida:** quando o cenário deixa de existir ("fecho de 15 min abaixo de 38.880").

## Exemplo de linhas "se… então…"
- **Se** atinjo a perda máxima do dia, **então** fecho a plataforma;
- **Se** surge um evento de impacto alto nos próximos 15 minutos, **então** não abro novo trade;
- **Se** o setup só cumpre 9 de 12 itens da checklist, **então** não entro.

## Atenção
Estes limites são **parte do risco** (módulo 17); o plano é o sítio onde se **escrevem** e se **assumem**. Um limite que não está escrito **negoceia-se** com a emoção.`,
      example: `Conta $10.000 · risco por trade **1% ($100)** · perda máxima diária **2% ($200)** · máximo **3 trades** · máximo **2 perdas seguidas**.

Dia fictício:
- Trade 1: **−$100**; Trade 2: **−$100** → **2 perdas** e **$200 perdidos** → **fim do dia**, mesmo com um terceiro "setup perfeito" à vista;
- Alternativa: Trade 1 **+$180**; Trade 2 **−$100**; Trade 3 **−$100** → saldo **−$20**, limite de 3 trades atingido → **fim do dia**.

As regras valem **nos dois sentidos**: protegem-te de dias maus e de dias bons que se estragam por excesso de confiança.`,
      takeaways: ["Um bom plano tem mais limites do que previsões: perda máxima, máximo de trades, perdas seguidas.", "Decide antes o que fazes nos eventos de impacto; não há regra universal.", "Os limites têm de estar escritos para não serem negociados com a emoção."],
      quiz: [
        num("Conta $10.000 e perda máxima diária de 2%. Quantos dólares podes perder no máximo nesse dia?", 200, 0, "$", "10.000 × 2% = $200."),
        mc("Qual destas regras 'se… então…' está bem formulada?", ["Se perder, tento mais uma vez", "Se atinjo a perda máxima do dia, fecho a plataforma", "Se estiver confiante, aumento o tamanho", "Se houver notícias, aposto"], 1, "É objetiva, escrita antes e protetora."),
        tf("Existe uma regra universal que diz que se deve sempre evitar operar notícias.", false, "Depende do método e do risco; o importante é decidir antes."),
        tf("Os limites diários só são úteis nos dias maus.", false, "Também travam o excesso de confiança nos dias bons."),
      ],
    },
    {
      slug: "a-checklist-pre-trade-de-12-itens",
      title: "A checklist pré-trade de 12 itens",
      summary: "O que cada item verifica, porque existe e como a plataforma o trata (aviso educativo, nunca bloqueio).",
      minutes: 9,
      content: `Antes de cada entrada, a plataforma apresenta uma **checklist de 12 itens**. Funciona como um **piloto antes de descolar**: não garante um voo perfeito, evita falhas evitáveis.

## Os 12 itens
1. **Higher timeframe analisado** — estás a operar a favor ou contra o contexto?
2. **Market structure identificada** — sabes o que invalida a ideia?
3. **Nível-chave identificado** — dá sentido a entrada, stop e alvo;
4. **Tendência identificada** — operar a favor (ou contra, com consciência);
5. **Zona de entrada definida** — evita perseguir o preço;
6. **Confluência identificada** — mais do que uma razão independente;
7. **Confirmação presente** — reduz entradas por esperança;
8. **Stop loss definido** — **verificado automaticamente** a partir da ordem;
9. **Risco calculado** — **automático**: há stop e contratos;
10. **R:R aceitável (≥ 1,5)** — **automático**: calculado a partir da entrada, do stop e do alvo;
11. **Notícias económicas verificadas** — eventos mexem em spread, slippage e volatilidade;
12. **Nenhuma razão emocional para entrar** — FOMO, vingança e tédio são más razões; sê honesto.

## Automático vs declarado
Os itens 8, 9 e 10 vêm de **factos** (a plataforma verifica se tens stop, se o risco está calculado e qual é o R:R): **não os podes "marcar" sem os teres**. Os restantes são **declarados** por ti — dependem da tua honestidade.

## O aviso educativo (nunca bloqueia)
Se faltarem itens, a plataforma mostra uma **mensagem educativa** com os itens em falta e **deixa-te avançar**: **é tua a decisão**. Em troca, pede-te para refletires: *"faltou-te informação ou foi pressa?"*. O objetivo é **treino de consciência**, não de obediência cega.

## Ligações
- O **Process Score** inclui o **peso da checklist** (percentagem preenchida);
- As **estatísticas comportamentais** comparam o teu **R médio** com checklist completa vs incompleta — com a **ressalva** de que é amostra pequena e **associação**, não causa.`,
      example: `Entrada fictícia (compra em MYM): entrada **39.000**, stop **38.960**, alvo **39.060**.

- R:R = 60 ÷ 40 = **1,5** → **cumpre** o mínimo (≥ 1,5);
- Se o alvo fosse **39.059** → R:R = 59 ÷ 40 = 1,475 → **não cumpre**: a checklist assinala-o (**automático**);
- O trader assinalou 9 dos 12 itens: **75%** (9 ÷ 12). Faltam "confirmação", "notícias verificadas" e "nenhuma razão emocional".

A plataforma avisa — e **deixa avançar**. O trader decide e regista no journal **porquê**: *"entrei por impulso, não esperei confirmação"* — o dado mais valioso de todos.`,
      exercise: { kind: "calculator", tool: "rr", prompt: "Entrada 39.000, stop 38.960. Testa alvos de 39.059 e 39.060 e observa quando o R:R passa a ≥ 1,5." },
      takeaways: ["A checklist tem 12 itens; stop, risco e R:R (≥ 1,5) são verificados automaticamente.", "Se faltarem itens, a plataforma avisa com fins educativos e nunca bloqueia.", "A percentagem preenchida alimenta o Process Score e as estatísticas comportamentais."],
      quiz: [
        num("A checklist tem 12 itens e marcaste 9. Que percentagem preencheste?", 75, 0.01, "%", "9 ÷ 12 = 0,75, ou seja, 75%."),
        tf("A plataforma bloqueia a entrada quando a checklist está incompleta.", false, "Mostra um aviso educativo, mas deixa-te avançar; a decisão é tua."),
        rr("Entrada 39.000, stop 38.960, alvo 39.060. Qual é o R:R?", 1.5, 0.01, "Alvo 60 ÷ stop 40 = 1,5; cumpre o mínimo."),
        mc("Qual destes itens é verificado automaticamente pela plataforma?", ["Confluência identificada", "Stop loss definido", "Nenhuma razão emocional", "Tendência identificada"], 1, "A existência de stop vem da ordem; os outros dependem de ti."),
      ],
    },
    {
      slug: "usar-a-checklist-sem-burocracia",
      title: "Usar a checklist sem a transformar em burocracia",
      summary: "Quando é útil, quando falha e como adaptá-la ao teu método.",
      minutes: 7,
      content: `Uma checklist só serve se for **usada com intenção** — nem ignorada, nem preenchida **por reflexo**.

## O que a checklist faz bem
- Obriga a **pensar** antes de agir;
- **Reduz esquecimentos** (stop, notícias, risco);
- Cria **dados** para a revisão (que itens falham mais vezes?).

## Onde falha
- **Marcada por hábito**, sem verificar → falsa segurança;
- Tratada como **garantia**: 12/12 **não** garante resultado — só que o **processo** foi cumprido;
- Transformada numa **desculpa** para entradas tardias ("tudo marcado, entro").

## Como usar bem
1. **Preenche** depois de olhar para o gráfico, não antes;
2. **Verifica factualmente** cada item (consigo apontar a estrutura? o nível?);
3. Se faltam itens, **pergunta porquê**: sem informação ou com pressa?
4. **Regista** no journal quando entraste com itens em falta e o que aconteceu — sem te culpares;
5. Revê **mensalmente**: que itens falham mais? Cria uma regra para esse.

## Adaptar ao teu método
A checklist da plataforma é **geral**. O teu método tem **itens específicos** (por exemplo, "sessão de Nova Iorque aberta", "setup 3 da lista de setups"). Acrescenta-os **ao teu plano**, sem remover os essenciais (stop, risco, R:R).

## O valor real
Não está em evitar perdas, está em **tornar visíveis** as decisões: com o tempo, os dados mostram como te comportas quando **cumpres** e **não cumpres** a checklist.

## Aviso
Qualquer estatística sobre checklist completa vs incompleta é **uma associação numa amostra pequena** — não prova que preencher a checklist causa melhores resultados. Interpreta com cautela.`,
      example: `Journal de 30 trades fictício:

- **Checklist completa (12/12):** 12 trades, **R médio +0,32R**;
- **Checklist incompleta:** 18 trades, **R médio −0,10R**.

Parece conclusivo, mas: amostra pequena; os trades de checklist incompleta podem ter ocorrido em **horas de mais cansaço**; e ninguém sabe se a checklist **causa** a diferença.

O uso correto: **hipótese de trabalho** ("quando a checklist falha, o meu comportamento piora") + **regra experimental** (sem 12/12, não entro durante um mês) + **nova medição**.`,
      takeaways: ["A checklist é útil quando é verificada com intenção; marcada por reflexo dá falsa segurança.", "12/12 não garante resultado: só que o processo foi cumprido.", "Estatísticas de checklist completa vs incompleta são associações em amostras pequenas."],
      quiz: [
        tf("Uma checklist 12/12 garante que o trade vai ganhar.", false, "Mostra que o processo foi cumprido; não determina o resultado."),
        mc("Qual é um uso correto da checklist?", ["Marcar tudo automaticamente", "Preencher depois de olhar o gráfico e verificar cada item", "Usá-la só nos dias bons", "Usá-la só quando perdes"], 1, "Preencher com intenção cria consciência."),
        tf("Uma diferença de R médio entre checklist completa e incompleta prova causalidade.", false, "É associação numa amostra pequena; interpreta com cautela."),
        mc("O que fazer quando faltam itens na checklist?", ["Ignorar", "Perguntar porquê (falta de informação ou pressa) e registar no journal", "Marcar tudo", "Aumentar o tamanho"], 1, "A resposta alimenta o processo e a revisão."),
      ],
    },
    {
      slug: "revisao-do-dia-e-da-semana",
      title: "Revisão do dia e da semana",
      summary: "Fechar o ciclo: seguiste o plano? o que repetir? o que alterar?",
      minutes: 6,
      content: `O plano ganha valor quando é **revisto**. A revisão é curta, regular e **sem culpa**.

## Revisão diária (5 minutos)
No campo **Revisão** do plano diário e no **journal**:
1. **Seguiste o plano?** (sim/não — é um campo do plano);
2. **Quantos trades** fizeste face ao máximo? Respeitaste os limites?
3. **Qual foi a melhor decisão** do dia? (Pode ter sido **não operar**.)
4. **Qual foi o pior comportamento?** (afastar o stop, entrar por FOMO…)
5. **Uma coisa** a mudar amanhã (apenas uma).

## Revisão semanal (20–30 minutos)
- **Estatísticas do journal:** número de trades, R total, R médio, win rate, drawdown;
- **Comportamento:** percentagem de entradas emocionais, checklist média, trades com stop;
- **Padrões:** hora do dia, dia da semana, tipo de setup;
- **Decisão:** manter, ajustar uma regra ou parar para estudar.

## Estatísticas, não histórias
Resume em números: *"Respeitei o limite de trades em 4 de 5 dias"*; *"Entradas emocionais: 20%"*; *"R médio: +0,12"*. Os números **desinflacionam** as histórias do tipo "foi uma semana horrível".

## Resultado ≠ processo
Uma semana de **ganhos com plano quebrado** é pior para o futuro do que uma semana de **pequenas perdas com plano cumprido**. Mede o **processo**: ele é o que se **repete**.

## Mantém a simplicidade
A melhor revisão é a que **fazes**. Se o sistema é demasiado complexo, **abandonas-o** — e o ciclo plano → ação → revisão perde-se.`,
      example: `Revisão semanal fictícia:

- **Plano seguido:** 4/5 dias;
- **Trades:** 11 (máximo permitido: 15);
- **R total:** **+1,4R**; **win rate:** 45%;
- **Entradas emocionais:** 2 de 11 → **18%**;
- **Melhor decisão:** quarta-feira, **não operar** durante o dado de emprego;
- **Pior comportamento:** sexta, **afastou o stop** em 12 pontos (−1,3R em vez de −1R);
- **Uma mudança:** **stop real** na plataforma, sempre.

Semana modesta, mas com **processo claro** e **uma ação concreta** para a próxima.`,
      exercise: { kind: "reflection", prompt: "Escreve a tua revisão da última sessão: seguiste o plano? melhor decisão? pior comportamento? uma coisa a mudar?", placeholder: "Revisão em 5 linhas…" },
      takeaways: ["A revisão diária é curta: plano seguido? melhor decisão? pior comportamento? uma mudança.", "A revisão semanal usa números do journal e procura padrões.", "Mede o processo: ele é o que se repete, não o resultado de uma semana."],
      quiz: [
        mc("Qual destas perguntas pertence à revisão diária?", ["Qual será o preço amanhã?", "Segui o plano? Qual foi o pior comportamento?", "Quem ganhou mais?", "Vou aumentar o tamanho?"], 1, "A revisão avalia o teu comportamento e o cumprimento do plano."),
        tf("Uma semana com ganhos mas plano quebrado é melhor para o futuro do que uma com pequenas perdas e plano cumprido.", false, "O processo é o que se repete; resultados sem processo são frágeis."),
        num("Cumpriste os limites em 4 de 5 dias. Que percentagem dos dias?", 80, 0.01, "%", "4 ÷ 5 = 0,8, ou seja, 80%."),
        tf("Não operar num dia de evento pode ser a melhor decisão do dia.", true, "Se o plano o prevê, respeitar a ausência de setup é boa decisão."),
      ],
    },
  ],
  quiz: {
    title: "Quiz do módulo — Daily Plan & Pre-Trade Checklist",
    passScore: 70,
    questions: [
      tf("O viés do plano diário é uma previsão que o mercado tem de cumprir.", false, "É uma hipótese condicional, não uma previsão."),
      mc("Qual destes campos pertence ao plano diário?", ["Perda máxima do dia e máximo de trades", "Lucro garantido", "Sinal de compra", "Nome do instrumento apenas"], 0, "O plano fixa limites e condições, não resultados."),
      num("Conta $20.000, perda máxima diária 1,5%. Quanto, em dólares?", 300, 0, "$", "20.000 × 1,5% = $300."),
      mc("Quantos itens tem a checklist pré-trade da plataforma?", ["6", "8", "12", "20"], 2, "São 12 itens, do timeframe superior à razão emocional."),
      rr("Entrada 39.000, stop 38.960, alvo 39.060. Qual é o R:R?", 1.5, 0.01, "Alvo 60 ÷ stop 40 = 1,5; cumpre o mínimo."),
      tf("Se faltarem itens na checklist, a plataforma bloqueia a ordem.", false, "Dá um aviso educativo mas deixa avançar; a decisão é tua."),
      mc("Quais dos itens da checklist são verificados automaticamente?", ["Stop, risco calculado e R:R", "Tendência e estrutura", "Notícias e emoção", "Nenhum"], 0, "Derivam de factos da ordem (stop, contratos, R:R)."),
      num("Marcaste 9 de 12 itens. Percentagem de checklist preenchida?", 75, 0.01, "%", "9 ÷ 12 = 0,75, ou seja, 75% dos itens."),
      tf("Checklist 12/12 garante que o trade será ganhador.", false, "Mostra apenas que o processo foi cumprido."),
      mc("O que fazer após atingir a perda máxima diária?", ["Continuar para recuperar", "Parar de operar nesse dia", "Aumentar o risco", "Mudar de instrumento"], 1, "Os limites existem para que pares quando a emoção quer continuar."),
    ],
  },
};
