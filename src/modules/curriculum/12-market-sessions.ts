import { mc, num, tf } from "../dsl";
import type { ModuleDef } from "../types";

/**
 * Module 12 — Market Sessions (Level 5).
 * Session hours are CONVENTIONS used by traders (not official schedules) and are always presented as approximate.
 * Statements about "typical" activity are hedged: the student is told to measure them in their own data.
 */
export const marketSessions: ModuleDef = {
  slug: "market-sessions",
  number: 12,
  level: 5,
  title: "Market Sessions",
  summary: "Sessões asiática, de Londres e de Nova Iorque, pré-mercado, abertura do cash dos EUA, volatilidade de abertura e overlap — com conversão automática para o teu fuso horário.",
  difficulty: "INTERMEDIATE",
  icon: "Clock",
  lessons: [
    {
      slug: "as-sessoes-do-mercado",
      title: "As sessões: Ásia, Londres e Nova Iorque",
      summary: "Três blocos de atividade que passam o testemunho ao longo das 24 horas — e porque importam para o Dow.",
      minutes: 6,
      content: `Os futuros do Dow negoceiam quase 24 horas por dia, mas a **atividade não é uniforme**: ela acompanha a abertura dos grandes centros financeiros.

## As três sessões (convenção)
| Sessão | Horário local (aprox.) | Notas |
| --- | --- | --- |
| **Ásia** (Tóquio) | ≈ 09:00–15:00 em Tóquio | Costuma ter menos volume no Dow; o preço tende a oscilar em ranges mais estreitos (não é regra) |
| **Londres** | 08:00–16:30 em Londres | Aumenta a atividade em mercados globais; o Dow reage ao contexto europeu |
| **Nova Iorque (RTH)** | 09:30–16:00 em Nova Iorque | Sessão regular das ações dos EUA: mais volume e volatilidade em geral |

> Estes horários são **convenções usadas por traders**, não calendários oficiais de bolsas. A plataforma usa-os no **relógio de sessões**. Confirma o horário do CME e feriados em Learning Sources.

## Porque é que o Dow é especial
O Dow é um índice de **ações dos EUA**: a sessão de Nova Iorque é onde o seu "subjacente" negoceia. Quando as ações dos EUA estão fechadas, o futuro continua a negociar — mas com **menos participantes**.

## O que muda ao longo do dia
- **Volume e volatilidade** variam;
- **Spreads** tendem a ser menores em horário ativo e maiores fora dele;
- **Notícias** saem a horas fixas (sobretudo na hora de Nova Iorque);
- O **comportamento** do preço (tendência, range, falsos rompimentos) varia por sessão — mas isso **mede-se, não se assume**.

## Tarefa
Usa o **relógio de sessões** da plataforma: ele mostra em que sessão estás agora **no teu fuso horário** e quando começa a seguinte.`,
      example: `Se vives em **Lisboa**, na maior parte do ano:

- **Londres** abre às 08:00 (mesma hora — Lisboa e Londres partilham fuso);
- **Nova Iorque (RTH)** abre às **14:30** e fecha às **21:00**;
- **Tóquio** abre por volta das 00:00 ou 01:00 (consoante o horário de verão).

Em vez de decorar, **confia no relógio**: ele converte automaticamente e trata as mudanças de horário.`,
      visual: { kind: "diagram", id: "session-timeline", caption: "As sessões ao longo de 24 horas (convenção ilustrativa)." },
      exercise: { kind: "link", href: "/tools/sessions", label: "Abrir o relógio de sessões", prompt: "Confirma em que sessão estás agora e a que horas abre a de Nova Iorque no teu fuso horário." },
      takeaways: ["Três grandes sessões: Ásia, Londres e Nova Iorque; a atividade varia ao longo do dia.", "Os horários são convenções aproximadas; confirma o CME e os feriados.", "Usa o relógio de sessões para converter para o teu fuso horário."],
      quiz: [
        mc("Qual é a sessão da qual depende diretamente o 'subjacente' do Dow (ações dos EUA)?", ["Ásia", "Londres", "Nova Iorque (RTH)", "Nenhuma"], 2, "O Dow é composto por ações dos EUA, que negoceiam durante o RTH."),
        tf("Os horários das sessões são calendários oficiais definidos pelas bolsas.", false, "São convenções usadas por traders; os horários oficiais das bolsas estão nas fontes e podem mudar."),
        mc("Qual é a melhor forma de lidar com horários de sessões no teu fuso?", ["Decorar tudo", "Usar um relógio que converta automaticamente e trate mudanças de horário", "Ignorar", "Perguntar a um amigo"], 1, "Os fusos e o horário de verão mudam: o relógio da plataforma trata disso."),
      ],
    },
    {
      slug: "abertura-de-nova-iorque-e-rth",
      title: "Pré-mercado, abertura do cash e RTH",
      summary: "Porque a abertura da sessão regular dos EUA é um momento especial — e como o tratar com cuidado.",
      minutes: 7,
      content: `## Pré-mercado
Antes de as ações dos EUA abrirem, os **futuros já negoceiam** e vão refletindo notícias, dados económicos e a abertura da Europa. Muitos dados económicos importantes saem **antes da abertura**, tipicamente por volta das **08:30 ET** (confirma sempre no calendário oficial).

## Abertura do cash (**09:30 ET**)
É quando as ações dos EUA começam a negociar. Costuma haver um **aumento súbito de volume e de ordens** — e, muitas vezes, **volatilidade elevada** nos primeiros minutos.

## RTH — Regular Trading Hours
O período **09:30–16:00 ET** (convenção). É onde a maior parte do volume do dia costuma concentrar-se — **mas mede-o nos teus dados**, porque o padrão pode mudar.

## Riscos específicos da abertura
- **Movimentos rápidos** em sentidos opostos nos primeiros minutos (whipsaws);
- **Spreads** e **slippage** podem aumentar;
- **Sinais falsos**: candles grandes de abertura que são desmentidos minutos depois;
- A tentação de **entrar por emoção**, sobretudo em dias de notícias.

## Como lidar
- **Observa** os primeiros minutos antes de agir (muitos traders esperam 5, 15 ou 30 minutos para o preço "mostrar" um lado);
- Marca o **opening range** (ver lição seguinte) e planeia os dois lados;
- Considera **reduzir o tamanho** na abertura (o stop pode ter de ser maior);
- Evita **perseguir** o primeiro impulso.`,
      example: `O Dow fecha ontem em 39.100 e abre hoje com **gap** de +60 pontos (39.160) no pré-mercado. Às 09:30 ET, o primeiro candle de 5 minutos tem **range de 120 pontos** (ATR habitual de 5 minutos ≈ 25), com pavio superior longo. Quem entrou "porque o candle é forte" está exposto a um stop de 120 pontos — ou a um desvio contra de 100 pontos em minutos.

Esperar 15 minutos custou-lhe parte do movimento, mas deu-lhe um **range de abertura** (por exemplo, 39.130–39.215) e um plano: "se romper e aguentar → …; se rejeitar → …".`,
      takeaways: ["A abertura do cash às 09:30 ET traz aumento súbito de volume e, muitas vezes, volatilidade elevada.", "Muitos dados económicos saem pouco antes (≈ 08:30 ET — confirma no calendário).", "Observa os primeiros minutos, marca o range de abertura e reduz o tamanho se necessário."],
      quiz: [
        mc("A que horas abre o cash dos EUA (convenção), hora de Nova Iorque?", ["06:00", "09:30", "12:00", "16:00"], 1, "A sessão regular das ações dos EUA abre às 09:30 ET."),
        tf("Os primeiros minutos da abertura são sempre os mais fáceis de operar.", false, "Costumam trazer whipsaws, slippage e sinais falsos."),
        mc("Qual é uma abordagem prudente na abertura?", ["Entrar com o dobro do tamanho", "Observar os primeiros minutos, marcar o range de abertura e planear os dois lados", "Retirar o stop", "Ignorar as notícias"], 1, "Esperar informação e planear cenários reduz decisões emocionais."),
        mc("Porque é que um candle de abertura muito forte pode induzir em erro?", ["É sempre falso", "Pode ser desmentido minutos depois; a volatilidade é elevada e o stop teria de ser largo", "É um erro de dados", "Não tem pavios"], 1, "Candles grandes na abertura obrigam a stops largos e podem ser revertidos."),
      ],
    },
    {
      slug: "opening-range-e-volatilidade-de-abertura",
      title: "Opening range e volatilidade de abertura",
      summary: "Como definir e usar o range dos primeiros minutos como referência — sem o transformar em sinal.",
      minutes: 7,
      content: `O **opening range** é o intervalo entre o **máximo e o mínimo** de um período inicial da sessão — por exemplo, os primeiros **5, 15 ou 30 minutos** a seguir às 09:30 ET.

## Para que serve
- Dá **dois níveis objetivos** (máximo e mínimo) que muitos participantes observam;
- Permite planear **cenários**: rompimento para cima, rompimento para baixo, rejeição de um dos lados;
- Dá um **tamanho de referência** para o risco (a largura do range).

## Escolher o período
Não existe um período "certo": 5, 15 e 30 minutos dão leituras diferentes. **Escolhe um, define a regra e testa-a** com replay/backtest.

## Como pensar nos cenários
1. **Rompimento e aceitação:** o preço fecha fora do range e mantém → ideia de continuação (reteste);
2. **Rompimento falso:** fura e volta para dentro → ideia de regresso ao range;
3. **Dentro do range:** sem vantagem clara → esperar.

## Cuidados
- Um **range estreito** gera rompimentos muito frequentes e muitos falsos;
- Um **range largo** implica stop largo e R:R pior;
- **Dias de notícias** distorcem tudo: o range pode ser enorme;
- A **estatística** "o range de abertura rompe X% das vezes" não é universal — mede no teu mercado e período, e com custos.

> O opening range é uma **referência**, não um sinal. Regista nos teus journals o que acontece em cada caso.`,
      example: `Opening range de 15 minutos: **máximo 39.215, mínimo 39.130** (**85 pontos**).

- **Cenário A:** fecha acima de 39.215 e o reteste aguenta → ideia de continuação, stop abaixo do reteste (por exemplo 39.190 → **25–30 pontos** de risco);
- **Cenário B:** fura 39.215, fecha dentro e rompe 39.130 → ideia de venda, stop acima de 39.230 (**~85 pontos** de risco).

A **largura** do range (85 pontos) e o ATR determinam se o R:R vale a pena.`,
      takeaways: ["O opening range é o máximo e o mínimo de um período inicial (5, 15 ou 30 minutos).", "Dá níveis objetivos e tamanho de referência; escolhe uma regra e testa-a.", "As estatísticas de rompimento não são universais — mede no teu mercado e período."],
      quiz: [
        mc("O que é o opening range?", ["O preço de fecho do dia anterior", "O máximo e mínimo de um período inicial da sessão (por exemplo, 15 minutos)", "O spread da abertura", "O volume do dia"], 1, "É o intervalo dos primeiros minutos depois da abertura."),
        num("Opening range com máximo 39.215 e mínimo 39.130. Qual é a largura, em pontos?", 85, 0, "pontos", "39.215 − 39.130 = 85 pontos."),
        tf("Existe uma percentagem universal e fiável de rompimentos do opening range.", false, "Depende do mercado, do período e do contexto; mede no teu caso."),
        mc("Porque é que um range de abertura muito largo pode ser um problema?", ["Não pode", "Obriga a stop largo e piora o R:R", "Aumenta a margem", "Fecha o mercado"], 1, "A largura do range define o risco de referência."),
      ],
    },
    {
      slug: "overlap-e-janelas-de-liquidez",
      title: "Overlap e janelas de liquidez",
      summary: "O que significa Londres + Nova Iorque em simultâneo — e como medir se isso importa para ti.",
      minutes: 6,
      content: `O **overlap** é o período em que **duas sessões estão ativas em simultâneo**. O mais citado é o de **Londres + Nova Iorque**, em que os mercados europeus ainda estão abertos enquanto os dos EUA já começaram.

## O que se costuma observar (e o que não é garantido)
- **Mais participantes** ativos → tende a haver **mais volume**;
- Mais **notícias** (os dados dos EUA saem durante a sessão europeia);
- **Spreads** tendem a ser mais estreitos em instrumentos líquidos.

Estas são **tendências típicas**, não garantias: dependem do dia, do ciclo económico e de eventos específicos.

## Como medir por ti próprio
No **Trading Journal**, cada trade pode ser etiquetado com a **sessão** em que foi feito. Depois, as estatísticas mostram **melhor e pior sessão** — para ti, com os teus dados. Podes descobrir que:

- Tens mais disciplina numa sessão do que noutra;
- Os custos pesam menos em horário líquido;
- Há uma janela horária em que cometes mais erros.

## Janelas de liquidez
Conhecer **os teus horários mais líquidos** ajuda a:
- Concentrar a atenção numa ou duas **janelas** em vez de estar o dia todo no ecrã;
- Reduzir o **overtrading**;
- Evitar horas de **pouca liquidez** com spreads maiores.

## Armadilha
Achar que "o overlap é sempre melhor" — pode ser mais difícil por ter mais ruído. O que importa é **a tua amostra**.`,
      example: `Aluno com 80 trades registados: **28** feitos na sessão de NY (R médio **+0,15**), **30** no overlap (R médio **−0,05**) e **22** noutras horas (R médio **−0,3**). Com estes números, parece haver mais valor em NY — **mas com 28 trades é cedo para concluir**: a diferença pode ser ruído. O passo certo é continuar a registar e testar a hipótese com mais dados.`,
      takeaways: ["Overlap = duas sessões ativas em simultâneo; costuma coincidir com mais volume, sem garantias.", "Etiqueta a sessão no journal e mede o teu melhor e pior horário.", "Com amostras pequenas, evita concluir cedo."],
      quiz: [
        mc("O que é o overlap?", ["Uma pausa do mercado", "Período em que duas sessões estão ativas em simultâneo", "Um tipo de ordem", "Um gap"], 1, "Por exemplo, Londres + Nova Iorque."),
        tf("O overlap é sempre a melhor altura para operar.", false, "Pode ter mais volume, mas também mais ruído; o que conta é a tua amostra."),
        mc("Como descobrir qual é a tua melhor janela horária?", ["Por intuição", "Etiquetando a sessão de cada trade no journal e analisando as estatísticas", "Perguntando a outros", "Não é possível"], 1, "O journal permite medir por sessão com os teus dados."),
      ],
    },
    {
      slug: "converter-horas-e-horario-de-verao",
      title: "Converter horas e o problema do horário de verão",
      summary: "Porque 'as 14:30 de Lisboa' nem sempre é a abertura de Nova Iorque — e como não cair nessa armadilha.",
      minutes: 6,
      content: `As sessões são definidas na **hora local de cada mercado** e os países mudam o relógio em **datas diferentes**. Isto cria duas armadilhas.

## Armadilha 1 — a diferença entre fusos não é constante
- Os **EUA** mudam para horário de verão em **março** (segundo domingo) e voltam em **novembro** (primeiro domingo);
- A **Europa** muda no **último domingo de março** e volta no **último domingo de outubro**.

Durante algumas semanas por ano, a diferença Lisboa–Nova Iorque passa de **5 horas** para **4 horas** (ou vice-versa). Nessas semanas, a abertura de Nova Iorque (09:30) em Lisboa é às **13:30** em vez das 14:30.

## Armadilha 2 — "o meu relógio mente"
O fuso da tua plataforma de gráficos, o do teu broker e o teu fuso pessoal podem ser **três diferentes**. Um candle "das 15:00" pode ser das 15:00 do servidor, de UTC ou de Nova Iorque.

## Boas práticas
- **Fixa um fuso de referência** (o teu, ou ET) e usa-o em tudo — gráficos, journal, plano diário;
- Usa um **relógio de sessões** que converta com a base de dados oficial de fusos (como o da plataforma);
- No **Journal**, regista a hora com fuso explícito ou usa UTC;
- Nos **dias de mudança de hora**, verifica duas vezes as horas das notícias;
- Verifica o **horário do broker** nos feriados (o CME pode fechar ou encurtar a sessão).

## O que a plataforma faz por ti
O relógio de sessões e o calendário económico **convertem automaticamente** para o fuso definido no teu **perfil**. Confirma-o em *Perfil*.`,
      example: `Semana de **final de março**: os EUA já mudaram para horário de verão e a Europa ainda não.

- Abertura de NY: 09:30 em Nova Iorque = **13:30 em Lisboa** (4 h de diferença);
- Semanas depois, quando Lisboa também já mudou: **14:30**.

Um trader que programa o alarme "14:30 = abertura" ficaria **uma hora atrasado** durante essas semanas.`,
      exercise: { kind: "link", href: "/profile", label: "Verificar o meu fuso horário", prompt: "Confirma o fuso horário definido no teu perfil: é nele que o relógio e o calendário se baseiam." },
      takeaways: ["Os EUA e a Europa mudam de horário em datas diferentes: a diferença de fusos varia ao longo do ano.", "Fixa um fuso de referência e regista a hora com fuso explícito.", "Usa o relógio da plataforma e confirma o fuso no perfil."],
      quiz: [
        mc("Porque pode a diferença Lisboa–Nova Iorque variar durante o ano?", ["Por erro", "Porque os EUA e a Europa mudam o relógio em datas diferentes", "Porque o CME muda", "Porque o mercado fecha"], 1, "Algumas semanas por ano as duas regiões estão em horários diferentes."),
        num("Numa semana em que a diferença é de 4 horas, a abertura de NY (09:30 ET) corresponde a que hora em Lisboa, em minutos desde a meia-noite?", 810, 0, "min", "09:30 + 4 h = 13:30 = 13 × 60 + 30 = 810 minutos."),
        tf("O fuso do gráfico, o do broker e o teu são sempre iguais.", false, "Podem ser três diferentes: fixa uma referência."),
        mc("Qual é uma boa prática ao registar trades no journal?", ["Registar a hora sem fuso", "Registar a hora com fuso explícito ou em UTC", "Não registar a hora", "Usar sempre a hora do broker sem verificar"], 1, "Evita ambiguidades quando há mudanças de horário."),
      ],
    },
    {
      slug: "plano-por-sessao",
      title: "Planear por sessão e não operar tudo",
      summary: "Transformar o conhecimento das sessões numa rotina simples que reduz o overtrading.",
      minutes: 6,
      content: `Conhecer as sessões só ajuda se mudar o **comportamento**. Uma rotina simples:

## 1. Escolhe a(s) tua(s) janela(s)
Não precisas de estar no mercado 24 horas. Define **uma a duas janelas** em que és mais atento e em que os custos são razoáveis — e **fora delas, não operas**.

## 2. Prepara antes da janela
No **Daily Trading Plan**:
- Viés e níveis (PDH, PDL, PWH, PWL, S/R, zonas);
- Eventos económicos do dia (a que horas, impacto);
- O que tem de acontecer antes da entrada, o que invalida, risco máximo e **número máximo de trades**.

## 3. Durante a janela
- Segue o plano; não improvises;
- Se o preço fizer algo **fora** do plano, a resposta válida é **não fazer nada**.

## 4. Fecha a janela
- **Revê** os trades e regista no journal;
- Se atingires o **limite diário de perdas** ou de trades, **paras**;
- O **overtrading** (trades por tédio) é um dos erros mais comuns e custosos.

## 5. Avalia por sessão
No fim de cada semana, analisa o **R médio por sessão** e o número de trades. Se uma janela produz sistematicamente pior resultado **e** pior processo, reduz a exposição lá.

> Menos horas, mais foco, melhor registo: um processo repetível.`,
      example: `Plano de um trader em Lisboa: **janela única** das 14:30 às 16:30 (abertura de NY + 2 horas). Máximo de **2 trades** e perda diária máxima de **2R**. Antes da janela: níveis, eventos e dois cenários. Às 16:30, **fecha o ecrã** — mesmo que o mercado "esteja a andar". No fim do mês: 38 trades, 94% cumpriram o plano; R médio +0,1 — uma amostra ainda curta, mas com **processo** consistente.`,
      exercise: { kind: "link", href: "/tools/daily-plan", label: "Abrir o Daily Trading Plan", prompt: "Escreve o plano da tua próxima janela de sessão: níveis, eventos, o que invalida, risco máximo e número máximo de trades." },
      takeaways: ["Escolhe uma a duas janelas e não operes fora delas.", "Prepara no Daily Trading Plan e define limites de perda e de trades.", "Avalia o desempenho por sessão com o journal e reduz exposição onde o processo é pior."],
      quiz: [
        mc("Qual é um benefício de operar só em janelas definidas?", ["Mais trades por dia", "Menos overtrading e mais foco", "Spreads menores sempre", "Sem risco"], 1, "Janelas definidas reduzem o excesso de operações e aumentam o foco."),
        tf("Se o preço fizer algo fora do plano, a resposta correta é improvisar uma entrada.", false, "Fora do plano, a resposta válida é não fazer nada."),
        mc("O que fazer ao atingir o limite diário de perdas?", ["Aumentar o tamanho para recuperar", "Parar de operar nesse dia", "Retirar o stop", "Mudar de instrumento"], 1, "O limite existe para evitar espirais emocionais."),
      ],
    },
  ],
  quiz: {
    title: "Quiz do módulo — Market Sessions",
    passScore: 70,
    questions: [
      mc("Qual é a sessão que mais diretamente influencia o subjacente do Dow?", ["Ásia", "Londres", "Nova Iorque (RTH)", "Nenhuma"], 2, "O RTH é a sessão regular das ações dos EUA."),
      mc("A que horas abre o cash dos EUA (ET)?", ["08:30", "09:30", "10:00", "16:00"], 1, "A sessão regular das ações dos EUA (RTH) abre às 09:30, hora de Nova Iorque."),
      tf("Os horários das sessões são calendários oficiais das bolsas.", false, "São convenções de traders; confirma o CME."),
      mc("O que é o opening range?", ["O gap", "O máximo e mínimo de um período inicial da sessão", "O spread", "O volume"], 1, "É o intervalo dos primeiros minutos."),
      num("Opening range de 39.140 a 39.220. Qual é a largura, em pontos?", 80, 0, "pontos", "39.220 − 39.140 = 80 pontos."),
      mc("Em que consiste o overlap Londres + NY?", ["Uma pausa", "Duas sessões ativas em simultâneo", "Um gap", "Uma ordem"], 1, "É o período em que ambas estão ativas."),
      tf("O overlap é sempre a melhor janela para toda a gente.", false, "Pode ter mais ruído; mede com os teus dados."),
      mc("Porque convém registar a hora com fuso explícito?", ["Por estética", "Porque o horário muda e os fusos podem diferir (gráfico, broker, pessoal)", "Porque o CME exige", "Não convém"], 1, "Evita ambiguidades."),
      mc("O que fazes quando o preço faz algo fora do teu plano?", ["Improvisas", "Não fazes nada", "Dobras a posição", "Moves o stop"], 1, "Fora do plano, a resposta válida é não agir."),
      num("Numa semana com 4 h de diferença Lisboa–NY, a abertura de NY (09:30) em Lisboa é às 13:30. Qual é a hora, em minutos desde a meia-noite?", 810, 0, "min", "13 × 60 + 30 = 810 minutos."),
    ],
  },
};
