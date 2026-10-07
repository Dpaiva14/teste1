import { mc, num, tf } from "../dsl";
import type { ModuleDef } from "../types";

/**
 * Module 21 — Chart Replay (Level 8). Mirrors /labs/replay: DEMO synthetic series (YM/MYM/US30 · M5/M15/H1), the server only ever
 * sends candles up to the cursor, drawings (level, zone, trend, fib; max 40), trades through the shared engine and a PROCESS
 * evaluation: stop 20 · R:R≥1,5 15 · risk≤2% 15 · checklist 15 · preparation 15 · entry reason 10 · exit discipline 10 = 100.
 * Grades: ≥85 excelente · ≥70 bom · ≥50 a melhorar · else fraco.
 */
export const chartReplay: ModuleDef = {
  slug: "chart-replay",
  number: 21,
  level: 8,
  title: "Chart Replay",
  summary: "Treinar decisões num gráfico que revela uma vela de cada vez: método de estudo, viés de antecipação, Process Score e limites do replay.",
  difficulty: "ADVANCED",
  icon: "Rewind",
  lessons: [
    {
      slug: "o-que-e-o-replay-e-para-que-serve",
      title: "O que é o Replay e para que serve",
      summary: "Um gráfico DEMO que avança vela a vela para treinares decisões sem ver o futuro.",
      minutes: 6,
      content: `O **Chart Replay** revela o gráfico **vela a vela**: tu decides, depois avanças. É a forma mais **barata** e **rápida** de acumular **repetições de decisão** — sem arriscar dinheiro real.

## O que podes fazer
- Escolher o **símbolo** (YM, MYM ou US30) e o **timeframe** (5 min, 15 min ou 1 hora);
- **Avançar** barras (uma a uma ou em blocos);
- **Desenhar** níveis, zonas, linhas de tendência e Fibonacci (até 40 desenhos);
- **Abrir trades** com stop e alvo, usando as **mesmas regras** do Simulador (spread, comissão, execução de stop/alvo);
- **Fechar** manualmente;
- Receber uma **avaliação de processo** de cada trade e da sessão.

## Dados: sempre DEMO
Os gráficos do Replay são **séries sintéticas determinísticas, claramente rotuladas DEMO**. **Não são dados de mercado reais** e a data de início é apenas uma posição no calendário sintético. A plataforma **nunca inventa dados** apresentando-os como reais.

## Sem espreitar o futuro
O servidor só te envia as velas **até ao ponto atual**. As seguintes não existem no teu browser: é impossível "ver o que vem a seguir" abrindo as ferramentas de programador.

## Para que serve, de facto
- Treinar **leitura**: estrutura, níveis, contexto;
- Treinar **execução**: stop, alvo, tamanho, regras de saída;
- Treinar **comportamento**: esperar, não entrar por FOMO, aceitar o stop;
- **Acumular** repetições para depois testar uma estratégia (módulo de backtesting).

## Para que NÃO serve
- ✘ Provar que um método **vai funcionar** no mercado real;
- ✘ Substituir dados reais e verificados de um fornecedor;
- ✘ "Ganhar o jogo": a pontuação é de **processo**, não de lucro.`,
      example: `Sessão fictícia: MYM em 5 minutos. O trader:

1. Avança 60 barras e **desenha** a resistência 39.060 e a zona de procura 38.950–38.970;
2. **Espera** pelo recuo à zona e define o plano: entrada 38.975, stop 38.945, alvo 39.050;
3. Abre a compra, escolhe a razão **"setup válido"**, preenche a checklist;
4. **Avança** barra a barra até o stop ou o alvo serem atingidos.

Cada passo é uma **decisão registada**; no fim, a avaliação analisa **como** operou, não só o saldo.`,
      exercise: { kind: "link", href: "/labs/replay", label: "Abrir o Replay", prompt: "Cria uma sessão de Replay (MYM, 5 min). Marca níveis antes de avançar e abre apenas um trade com stop, alvo e razão honesta." },
      takeaways: ["O Replay revela o gráfico vela a vela: treino de decisões sem dinheiro real.", "Os dados são DEMO (sintéticos) e o servidor nunca envia velas futuras.", "A avaliação é de processo, não de lucro."],
      quiz: [
        tf("Os gráficos do Replay são dados reais de mercado.", false, "São séries sintéticas DEMO, rotuladas como tal."),
        mc("Que desenhos podes fazer no Replay?", ["Apenas linhas horizontais", "Níveis, zonas, linhas de tendência e Fibonacci", "Nenhum", "Só texto"], 1, "As quatro ferramentas existem para marcar contexto antes da entrada."),
        tf("É possível ver as velas futuras abrindo as ferramentas de programador do browser.", false, "O servidor só envia as velas até ao ponto atual."),
        mc("Qual é o objetivo principal do Replay?", ["Ganhar muito dinheiro fictício", "Treinar decisões e comportamento com repetições", "Prever o mercado real", "Copiar sinais"], 1, "O foco é a qualidade do processo, não o lucro fictício."),
      ],
    },
    {
      slug: "como-estudar-no-replay",
      title: "Como estudar no Replay: método e disciplina",
      summary: "Um ciclo simples — marcar, decidir, avançar, rever — e as regras para não transformar o replay num jogo.",
      minutes: 8,
      content: `O Replay é uma **ferramenta de treino**. O resultado depende do **método** com que o usas.

## O ciclo
1. **Marcar antes de avançar:** níveis, zonas, estrutura, Fibonacci (a plataforma regista que preparaste o gráfico);
2. **Escrever a hipótese:** *"Se o preço recuar à zona X e rejeitar, procuro compra com stop abaixo de Y"*;
3. **Avançar com intenção:** uma barra de cada vez nos momentos críticos; blocos maiores apenas quando não há decisão pendente;
4. **Decidir:** entrar, esperar ou cancelar a hipótese — **qualquer uma é válida**;
5. **Gerir** o trade pelo plano (módulo 18);
6. **Rever** no final: o que previ? o que aconteceu? cumpri o plano?

## Regras de disciplina
- **Trata-o como real:** o mesmo risco por trade, a mesma checklist, os mesmos limites diários;
- **Não repitas o mesmo cenário** para "acertar": com a repetição já conheces o futuro. Muda de símbolo/timeframe ou de série;
- **Não avances à pressa** só para ver o resultado — isso treina impulsividade;
- **Uma decisão de cada vez:** evita ter vários trades em simultâneo enquanto aprendes;
- **Regista** em notas o que sentiste (dúvida, ansiedade, vontade de entrar).

## O que treinar
- **Sessões curtas e focadas** (30–60 minutos), com um objetivo claro: "hoje treino apenas retestes de nível";
- **Repetição deliberada**: o mesmo setup ao longo de dezenas de trades, para avaliar o processo;
- **Registo e revisão**: no fim, revê a avaliação de processo e a lista de trades.

## Evita
- Operar **muitos** trades para "ver o que acontece" — é jogar, não treinar;
- **Mudar** de regras a meio de uma sessão;
- Usar o Replay para **comparar resultados** com outros alunos — não é uma competição.`,
      example: `Objetivo da sessão: **treinar apenas compras em recuos a zonas de procura**, com risco fixo de **1%**.

- 8 setups identificados em 90 minutos de replay;
- **5 entradas** (3 setups não cumpriam a checklist e foram ignorados — **boa decisão**);
- **Process Score médio: 82** (grau "bom"); 2 trades sem marcações prévias baixaram a nota;
- Nota para a próxima sessão: **marcar a zona antes de avançar** — a preparação vale 15 pontos.

O saldo do dia é **secundário**; o que fica é a lista de comportamentos para melhorar.`,
      exercise: { kind: "reflection", prompt: "Escreve o objetivo da tua próxima sessão de Replay numa frase (um único setup ou comportamento) e como vais medir se o cumpriste.", placeholder: "Hoje treino… e meço…" },
      takeaways: ["Marca antes de avançar, escreve a hipótese, decide e revê: é o ciclo do Replay.", "Trata-o como real (mesmo risco, checklist e limites) e não repitas o mesmo cenário para 'acertar'.", "Sessões curtas e focadas com um objetivo claro valem mais do que muitas horas dispersas."],
      quiz: [
        mc("Qual é o primeiro passo recomendado antes de avançar no Replay?", ["Abrir um trade", "Marcar níveis/zonas e escrever uma hipótese", "Avançar 100 barras", "Mudar o timeframe"], 1, "A preparação do gráfico e a hipótese orientam a decisão."),
        tf("Repetir o mesmo cenário várias vezes é uma boa forma de treinar a leitura.", false, "Depois da primeira vez conheces o futuro; o treino perde valor."),
        mc("Qual destas é uma boa decisão no Replay?", ["Ignorar um setup que não cumpre a checklist", "Entrar sempre que o preço mexe", "Avançar sem olhar", "Remover o stop"], 0, "Não operar quando o plano não se cumpre é parte do processo."),
        tf("Uma sessão curta e com um objetivo específico costuma ser mais útil do que horas de replay sem foco.", true, "O foco permite medir a melhoria e corrigir um comportamento de cada vez."),
      ],
    },
    {
      slug: "vies-de-antecipacao-e-hindsight",
      title: "Viés de antecipação, hindsight e look-ahead",
      summary: "Porque o passado parece sempre óbvio — e como não enganar a tua própria avaliação.",
      minutes: 8,
      content: `Três ilusões de **informação futura** contaminam o estudo de gráficos.

## 1. Hindsight bias ("já sabia")
Depois de um movimento, olhar para o gráfico parece **evidente**: "claro que ia romper". Esquecemos a **incerteza** que existia **na altura**. Resultado: sobrestimas a tua capacidade de leitura e subestimas o risco.

## 2. Look-ahead bias (espreitar o futuro)
Usar, na decisão, informação que **só existia depois**. Exemplos:
- Marcar um nível **depois** de ver o preço respeitá-lo;
- Decidir o **stop** sabendo o mínimo seguinte;
- Mudar os parâmetros de uma estratégia depois de ver os resultados.

A plataforma **bloqueia a forma técnica** deste viés: o servidor nunca envia velas futuras, e a **preparação** de um trade é calculada **no servidor, no momento em que o abres**, a partir das marcações já guardadas — o que desenhares **depois** não conta para esse trade.

## 3. Seleção de exemplos
Escolher **só** os exemplos bonitos ("este setup funciona sempre") ignora os que falham. Num estudo honesto, **registas todos**, incluindo os feios.

## Como te proteger
1. **Decide primeiro, avança depois:** escreve a hipótese **antes** de revelar a vela seguinte;
2. **Marca níveis antes** do movimento e **não os apagues** para os "corrigir" depois;
3. **Conta todos os setups**, vencedores e perdedores, não só os memoráveis;
4. **Divide os dados:** treina com uma parte e testa noutra, sem retocar as regras com o que vês;
5. **Desconfia de resultados espetaculares:** ou há **erro** ou há **look-ahead**.

## Humildade
O mercado real **não vai deixar-te ver a vela seguinte**. Ver o passado de forma honesta é aceitar que **a incerteza era real**.

## Aviso sobre dados DEMO
Os dados do Replay são sintéticos: servem para treinar **método**, não para concluir nada sobre o comportamento do mercado real.`,
      example: `Dois traders olham para o mesmo gráfico depois de um rompimento de 120 pontos:

- **Trader A** diz *"era óbvio"* e **marca** a resistência rompida — **depois** de o rompimento ter acontecido;
- **Trader B** escreveu, **antes de avançar**, *"nível em 39.060; se romper com fecho acima, procuro reteste"*.

Se o preço **tivesse falhado** o rompimento, o trader A teria marcado outro nível "óbvio". O trader B tem **prova** do que pensou. Só o B treina a **decisão** — o A treina a **narrativa**.`,
      takeaways: ["Hindsight bias faz o passado parecer óbvio; look-ahead usa informação que só existia depois.", "Marca e escreve a hipótese antes de avançar, e conta todos os setups, incluindo os que falham.", "Resultados demasiado bons são suspeitos de look-ahead."],
      quiz: [
        mc("O que é look-ahead bias?", ["Usar informação que só existia depois da decisão", "Olhar para o timeframe superior", "Usar stop apertado", "Operar noutro mercado"], 0, "É contaminar a decisão com informação futura."),
        tf("Depois de ver o movimento, é legítimo marcar o nível 'óbvio' e contá-lo como preparação.", false, "A preparação só conta se for marcada antes da entrada."),
        mc("Qual destas práticas ajuda a evitar o hindsight bias?", ["Escrever a hipótese antes de avançar", "Apagar marcações erradas", "Mostrar só os melhores exemplos", "Aumentar o tamanho"], 0, "Registar antes cria prova do que pensaste na altura."),
        tf("Resultados espetaculares num estudo devem ser tratados com desconfiança.", true, "Muitas vezes indicam erro ou informação futura a contaminar o teste."),
      ],
    },
    {
      slug: "o-process-score-explicado",
      title: "O Process Score explicado",
      summary: "Os sete critérios, os pesos e como a nota premia o processo, não o resultado.",
      minutes: 8,
      content: `Cada trade do Replay (e do Simulador) recebe uma **avaliação de processo** de **0 a 100**. Mede **como** operaste, **não** quanto ganhaste.

## Os sete critérios (soma = 100)
| Critério | Pontos | O que premeia |
|---|---|---|
| **Stop definido** | 20 | Ter um ponto de invalidação antes de entrar |
| **R:R ≥ 1,5** | 15 | Alvo planeado com relação adequada (7 pontos se entre 1 e 1,5) |
| **Risco ≤ 2%** | 15 | Tamanho coerente com o risco (7 pontos entre 2% e 3%) |
| **Checklist** | 15 | Percentagem de itens preenchidos |
| **Preparação** | 15 | Marcaste níveis/zonas/estrutura/Fibonacci **antes** de entrar |
| **Razão de entrada** | 10 | "Setup válido" = 10; "Outra" = 4; razão emocional = 0 |
| **Disciplina de saída** | 10 | Stop/alvo = 10; saída manual ou fim dos dados = 5 |

## Graus
- **≥ 85:** excelente · **≥ 70:** bom · **≥ 50:** a melhorar · **< 50:** fraco.

## O que isto significa
- **Um trade ganho com mau processo** (sem stop, por FOMO, sem preparação) pontua **mal**;
- **Um trade perdido com bom processo** pontua **bem**;
- A nota **não** é uma previsão do futuro: é um **espelho** do processo naquele trade.

## Revisão da sessão
O resumo da sessão calcula a **média de processo** dos trades fechados e gera notas específicas: trades sem preparação, sem stop, com razões emocionais, poucos trades para conclusões.

## Onde se liga ao resto
- **Checklist** (módulo 20): contribui diretamente;
- **Risco** (módulo 17): o limite de 2% é uma **referência educativa**, não uma regra universal;
- **Psicologia** (módulo 19): a razão de entrada;
- **Gestão** (módulo 18): saída por plano vs discricionária.

## Limitações
Nenhuma nota resume por completo a qualidade de uma decisão. O score é uma **ferramenta de feedback**, não um veredito.`,
      example: `Trade fictício **A**: stop definido (20), R:R 2,0 (15), risco 1% (15), checklist 100% (15), preparado (15), razão "setup válido" (10), saída pelo alvo (10) → **100 pontos**, mesmo que a vela seguinte tivesse atingido o stop — o score avalia o processo.

Trade fictício **B**: stop definido (20), R:R 2,0 (15), risco 1% (15), checklist 100% (15), **sem marcações** (0), razão **FOMO** (0), stop atingido (10) → **75 pontos**, grau "bom", com duas áreas claras de melhoria: **preparação** e **razão de entrada**.

Trade fictício **C**: **sem stop** (0), sem alvo (0), risco desconhecido (0), checklist 50% (7,5), sem marcações (0), "tédio" (0), saída manual (5) → **12,5 pontos** (arredondado: 13), grau "fraco" — **mesmo que tenha ganho dinheiro**.`,
      takeaways: ["O Process Score soma sete critérios (stop 20, R:R 15, risco 15, checklist 15, preparação 15, razão 10, saída 10).", "Os graus são: ≥85 excelente, ≥70 bom, ≥50 a melhorar, abaixo fraco.", "Mede o processo: um trade ganho com mau processo pontua mal e um perdido com bom processo pontua bem."],
      quiz: [
        num("Um trade tem stop (20), R:R 2 (15), risco 1% (15), checklist 100% (15), preparado (15), razão FOMO (0) e saída pelo stop (10). Qual é o score?", 90, 0, "pontos", "20 + 15 + 15 + 15 + 15 + 0 + 10 = 90."),
        mc("Que grau corresponde a um score de 72?", ["Excelente", "Bom", "A melhorar", "Fraco"], 1, "70 a 84 é 'bom'; 85 ou mais é 'excelente'."),
        tf("O Process Score depende de o trade ter ganho ou perdido dinheiro.", false, "Avalia a preparação e a gestão; não o resultado."),
        mc("Quantos pontos vale a marcação prévia no gráfico (preparação)?", ["5", "10", "15", "20"], 2, "A preparação soma 15 pontos."),
      ],
    },
    {
      slug: "replay-versus-mercado-real",
      title: "Replay versus mercado real: o que muda",
      summary: "Dinheiro real, emoção, custos e execução: porque o treino não prova nada sobre o futuro.",
      minutes: 7,
      content: `O Replay ensina **método**. O mercado real exige **método + carácter**. Conhece as diferenças para não saltares demasiado depressa.

## O que o Replay simula
- **Spread** e **comissão** (valores ilustrativos);
- **Execução de stop e alvo** com regras claras (num gap, o stop é executado no preço de abertura da vela; quando stop e alvo estão na mesma vela, assume-se o pior caso: **o stop vence**);
- **Margem e P&L** do Simulador (valores ilustrativos);
- **Process Score** e estatísticas.

## O que NÃO simula bem
- **Emoção real:** dinheiro verdadeiro muda a respiração, a decisão e a disciplina;
- **Slippage real e profundidade de mercado:** em volatilidade extrema, o preço executado pode ser muito pior;
- **Rejeições e falhas técnicas** (ordens, ligação, latência);
- **Mudanças de regime reais** (notícias, liquidez, horário) — os dados são **DEMO** e sintéticos;
- **Cansaço e rotina** (sessões longas, fusos horários).

## Armadilhas
1. **Excesso de confiança:** "no Replay faço sempre 85+" não garante comportamento semelhante com dinheiro real;
2. **Replay como casino:** muitos trades rápidos só para ver o resultado;
3. **Ignorar custos:** os custos reais variam por corretora; confirma-os antes de operar;
4. **Passagem brusca:** saltar do Replay para risco alto.

## Transição prudente
1. **Replay** (volume de decisões, process score estável);
2. **Backtest** (amostra e estatísticas por setup);
3. **Conta demo** da corretora (execução real, sem dinheiro);
4. **Tamanho mínimo** (MYM) com limites estritos, só quando o processo for consistente — **por tua decisão e risco**.

## Nota
A plataforma é **educativa**. Futuros usam **alavancagem** e podem causar perdas **superiores** ao esperado; nada aqui é recomendação de investimento.`,
      example: `Duas sessões do mesmo trader com o mesmo método:

- **Replay:** 40 trades, process score médio **84**, disciplina estável;
- **Conta demo da corretora:** primeiros 20 trades, score **68**: ordens atrasadas, stop afastado "só desta vez" duas vezes.

A diferença não é o método, é a **pressão** e a **execução**. A decisão sensata: **mais volume em demo** e só depois (se houver processo estável) **tamanho mínimo** com limites claros.

Nenhuma destas fases prova resultados futuros: serve para **eliminar erros evitáveis** antes de arriscar capital.`,
      takeaways: ["O Replay simula spread, comissão, stop/alvo e margem com regras claras, mas não a emoção do dinheiro real.", "Em gaps, o stop executa na abertura; quando stop e alvo coincidem na mesma vela, o stop vence.", "A transição para o real deve ser gradual e por tua decisão: Replay → backtest → demo → tamanho mínimo."],
      quiz: [
        mc("Quando stop e alvo são atingidos na mesma vela, o que assume o Replay?", ["Que o alvo foi atingido primeiro", "O pior caso: o stop vence", "Que o trade é cancelado", "Que o preço médio é usado"], 1, "Assumir o pior caso evita inflar os resultados do treino."),
        tf("Um bom Process Score no Replay garante o mesmo comportamento com dinheiro real.", false, "A pressão emocional e a execução reais são diferentes."),
        mc("Qual destas é uma limitação do Replay?", ["Não permite desenhar", "Não reproduz a emoção do dinheiro real", "Não tem stops", "Só funciona de dia"], 1, "O dinheiro real altera o comportamento de formas que o treino não capta."),
        tf("Os custos do Replay são os mesmos de qualquer corretora real.", false, "São ilustrativos; confirma os custos da tua corretora."),
      ],
    },
    {
      slug: "plano-de-treino-com-replay",
      title: "Plano de treino de 100 decisões",
      summary: "Um protocolo simples para transformar horas de Replay em dados utilizáveis.",
      minutes: 7,
      content: `Sem **protocolo**, o Replay vira entretenimento. Com protocolo, gera **dados**.

## Protocolo de 100 decisões
1. **Escolhe um único setup** (por exemplo, o setup 1 do módulo 16) e **escreve as regras**: contexto, condições, entrada, stop, alvo, invalidação;
2. **Define o risco por trade** (por exemplo, 1%) e os limites diários;
3. **Treina em lotes de 20 decisões**: marca antes de avançar, regista a hipótese, executa e gere pelo plano;
4. **Regista tudo no journal** (ou numa folha): setup, razão, checklist, R, erros;
5. **No fim de cada lote**, revê: Process Score médio, % de entradas emocionais, % com stop, R médio, pior sequência;
6. **Só depois de 100 decisões** altera regras — **uma** de cada vez — e **repete** com outras séries.

## O que contar como "decisão"
Cada **entrada** conta, mas também cada **decisão de não entrar** num setup que não cumpria as regras. Treinar a **espera** é treinar o mais difícil.

## O que medir
- **Process Score médio** e a sua evolução;
- **Percentagem de trades** com stop, R:R ≥ 1,5, preparação, razão válida;
- **R médio** e **win rate** (com cautela: amostra pequena);
- **Pior sequência de perdas** (e como reagiste).

## Ligação ao backtesting
O Replay treina **decisão** com contexto de leitura; o **laboratório de backtesting** (módulo 24) gera **estatísticas** em amostras maiores, com regras fixas. Usa os dois: um **complementa** o outro.

## Disciplina
Se algum lote correr mal, **não mudes de setup** por impulso: revê o processo, **mantém** o protocolo e termina a amostra.

## O objetivo final
Não é "ficar bom no Replay". É criar um **processo repetível** que possas **medir** e depois transferir, com prudência, para uma conta demo.`,
      example: `Protocolo fictício (5 lotes de 20 decisões):

| Lote | Score médio | Entradas emocionais | R médio |
|---|---|---|---|
| 1 | 71 | 25% | −0,05 |
| 2 | 76 | 15% | +0,10 |
| 3 | 80 | 10% | +0,18 |
| 4 | 82 | 5% | +0,12 |
| 5 | 84 | 5% | +0,20 |

O **processo** melhorou de forma consistente; o R médio continua pequeno e variável (**amostra de 100**, por isso **sem conclusões definitivas**). O que dá confiança é a **tendência do processo**, não um lote isolado.`,
      exercise: { kind: "reflection", prompt: "Escolhe um único setup e escreve as 6 linhas do teu protocolo de 100 decisões: regras, risco, lotes, o que registas, o que medes e o que NÃO farás durante a amostra.", placeholder: "Setup…, risco…, lotes de 20…" },
      takeaways: ["Um protocolo de 100 decisões, em lotes de 20, transforma o Replay em dados.", "Conta também as decisões de não entrar: treinar a espera é treinar o mais difícil.", "Altera regras só depois da amostra e uma de cada vez; o objetivo é um processo repetível e mensurável."],
      quiz: [
        mc("Quantas decisões tem o protocolo proposto antes de alterar regras?", ["10", "20", "100", "1000"], 2, "100 decisões dão uma primeira amostra com algum significado."),
        tf("Só as entradas contam como decisões no protocolo.", false, "As decisões de não entrar num setup inválido também contam."),
        mc("O que fazer se um lote correr mal?", ["Trocar de setup imediatamente", "Rever o processo e manter o protocolo até terminar a amostra", "Duplicar o risco", "Abandonar o Replay"], 1, "Variância é normal; muda-se por razão estatística, não por impulso."),
        num("5 lotes de 20 decisões. Quantas decisões no total?", 100, 0, "decisões", "5 × 20 = 100 decisões."),
      ],
    },
  ],
  quiz: {
    title: "Quiz do módulo — Chart Replay",
    passScore: 70,
    questions: [
      tf("Os gráficos do Replay são dados reais de mercado.", false, "São séries sintéticas DEMO."),
      mc("O que o servidor envia ao browser no Replay?", ["Todas as velas da série", "Apenas as velas até ao ponto atual", "Só o último preço", "Nada"], 1, "Impede a visão do futuro no cliente."),
      mc("Qual é o primeiro passo recomendado antes de avançar?", ["Abrir um trade", "Marcar níveis e escrever uma hipótese", "Ajustar o timeframe", "Ver o score"], 1, "A preparação orienta a decisão e conta para a avaliação."),
      tf("Marcar o nível depois de ver o movimento conta como preparação válida.", false, "A preparação só conta se for feita antes da entrada."),
      num("Stop (20) + R:R 2 (15) + risco 1% (15) + checklist 100% (15) + preparado (15) + razão válida (10) + saída pelo alvo (10). Score total?", 100, 0, "pontos", "20 + 15 + 15 + 15 + 15 + 10 + 10 = 100."),
      mc("Qual é o grau de um Process Score de 85?", ["Bom", "Excelente", "A melhorar", "Fraco"], 1, "85 ou mais é excelente."),
      mc("Quando stop e alvo coincidem na mesma vela, o Replay assume…", ["O alvo vence", "O stop vence (pior caso)", "O trade é anulado", "A média"], 1, "Evita resultados inflacionados."),
      tf("Um trade ganho com mau processo pode ter um Process Score baixo.", true, "O score mede o processo, não o resultado."),
      mc("Qual é uma limitação do Replay?", ["Não reproduz a emoção do dinheiro real", "Não permite stops", "Não mostra velas", "É demasiado caro"], 0, "A pressão emocional real altera o comportamento."),
      num("Protocolo de 20 decisões por lote, 5 lotes. Total de decisões?", 100, 0, "decisões", "5 lotes × 20 decisões = 100 decisões."),
    ],
  },
};
