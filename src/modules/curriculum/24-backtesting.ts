import { mc, num, tf } from "../dsl";
import type { ModuleDef } from "../types";

/**
 * Module 24 — Backtesting (Level 9). Mirrors the Backtesting Lab: DEMO synthetic series (300–1500 bars), five ORIGINAL educational rule-sets
 * (no demonstrated edge), decisions BUY / SELL / WAIT, WAIT advances 5 bars, a trade not closed by stop/target is closed at the market after
 * 200 bars, stop wins ties, gap fills at the open, per-decision rule adherence (rules met of total), report with adherence full vs partial.
 * Confidence figures: 95% half-width for a win rate of 50% ≈ 1,96 × √(0,25/n) → n=30: ±17,9 pp · n=100: ±9,8 pp · n=400: ±4,9 pp (computed).
 * 20 independent tests at a 5% level → 64,2% chance of at least one false positive (1 − 0,95²⁰, computed).
 */
export const backtesting: ModuleDef = {
  slug: "backtesting",
  number: 24,
  level: 9,
  title: "Backtesting",
  summary: "Testar regras escritas em dados passados: amostra, vieses (overfitting, look-ahead), custos, aderência às regras e a leitura honesta do relatório do laboratório.",
  difficulty: "ADVANCED",
  icon: "FlaskConical",
  lessons: [
    {
      slug: "o-que-e-o-backtesting",
      title: "O que é (e o que não é) o backtesting",
      summary: "Aplicar regras escritas a dados do passado — para treinar consistência e gerar hipóteses, não para provar certezas.",
      minutes: 7,
      content: `**Backtesting** é aplicar um conjunto de **regras escritas** a dados **do passado** e medir o que teria acontecido. Responde a: *"Se tivesse seguido estas regras, como teriam corrido os trades?"*

## Tipos
- **Manual (discricionário):** avanças o gráfico e decides segundo as regras (é o que faz o laboratório da plataforma);
- **Automático (algorítmico):** um programa aplica as regras sozinho (requer regras 100% objetivas).

## Para que serve
- **Gerar hipóteses** e **eliminar ideias más** rapidamente;
- **Treinar consistência**: aplicar as mesmas regras de forma idêntica;
- **Medir** estatísticas básicas (win rate, R médio, drawdown, pior sequência);
- Preparar a **fase seguinte** (demo) com expectativas realistas.

## O que NÃO é
- ✘ **Não é prova** de que uma estratégia funcionará no futuro;
- ✘ **Não elimina** o risco nem a variância;
- ✘ **Não é válido** com amostras pequenas, dados maus ou regras ambíguas.

## O laboratório da plataforma
- Dados **sintéticos DEMO** (determinísticos), com 300 a 1500 barras;
- **Cinco conjuntos de regras originais** (pullback na tendência, rompimento de range, rejeição em nível, sweep de liquidez + reversão e "livre") — **sem vantagem demonstrada**, só para praticar;
- Em cada ponto, escolhes **Comprar**, **Vender** ou **Esperar** (avança 5 barras);
- Só vês as velas **até ao ponto atual** — o futuro é revelado após a decisão;
- Um trade que não é fechado pelo stop ou alvo é encerrado **a mercado após 200 barras**.

## Aviso importante
O próprio laboratório mostra: *"Backtesting em dados sintéticos (DEMO) serve para treinar a aplicação consistente de regras, não para provar que uma estratégia funciona. Mesmo com dados reais, uma amostra pequena não prova vantagem e resultados passados não garantem resultados futuros."*`,
      example: `Duas conclusões a partir de 15 trades num backtest manual:

- **Errada:** *"A estratégia tem 60% de win rate e R médio +0,4: funciona!"*;
- **Correta:** *"Em 15 trades (dados DEMO), o resultado é compatível com sorte; preciso de muitas mais decisões, de dados reais e de out-of-sample antes de tirar qualquer conclusão — e mesmo assim sem garantias."*

O primeiro tom é o dos vendedores de "métodos secretos". O segundo é o de quem **quer descobrir a verdade**, mesmo que seja "isto não tem vantagem".`,
      exercise: { kind: "link", href: "/backtest", label: "Abrir o Backtesting Lab", prompt: "Cria um backtest com uma das estratégias educativas e toma 10 decisões (incluindo algumas de 'Esperar'). Lê o relatório com a amostra em mente." },
      takeaways: ["Backtesting aplica regras escritas a dados do passado: gera hipóteses, não provas.", "O laboratório usa dados DEMO e só revela as velas até ao ponto atual.", "Uma amostra pequena é compatível com sorte; resultados passados não garantem os futuros."],
      quiz: [
        tf("Um backtest positivo prova que a estratégia vai funcionar no futuro.", false, "Gera uma hipótese; não prova nada sobre o futuro."),
        mc("O que acontece no laboratório quando escolhes 'Esperar'?", ["O trade é fechado", "O gráfico avança 5 barras", "Perdes pontos", "A sessão termina"], 1, "Esperar avança o feed para a próxima decisão."),
        mc("Qual destas é uma boa utilização do backtesting?", ["Provar que o método nunca perde", "Treinar a aplicação consistente das regras e gerar hipóteses", "Prever o preço de amanhã", "Replicar sinais de terceiros"], 1, "É uma ferramenta de aprendizagem e de teste de hipóteses."),
        tf("As estratégias do laboratório têm uma vantagem demonstrada.", false, "São regras educativas originais, sem vantagem demonstrada."),
      ],
    },
    {
      slug: "escrever-regras-testaveis",
      title: "Escrever regras testáveis",
      summary: "Uma regra só é testável se for objetiva: duas pessoas aplicam-na e chegam à mesma decisão.",
      minutes: 7,
      content: `Antes de testar, tens de **escrever**. Uma regra vaga não se testa — **interpreta-se**, e a interpretação muda com o humor.

## O teste da objetividade
Dá a regra a duas pessoas e a mesma série de velas. Se **decidirem diferente**, a regra não é objetiva.

## Exemplos
| Vaga | Objetiva |
|---|---|
| "Entro numa boa zona" | "Entro quando o preço toca a zona marcada antes e fecha a vela de 5 min acima do seu meio" |
| "Stop onde faz sentido" | "Stop 5 pontos abaixo do swing low que sustenta a ideia" |
| "Alvo razoável" | "Alvo no próximo swing high ou a 2R, o que ficar mais perto" |
| "Se o mercado estiver forte" | "Se o preço estiver acima da média de 50 períodos e a estrutura for HH/HL" |

## Estrutura de uma regra de estratégia
1. **Contexto:** quando se aplica (e quando não);
2. **Condições de entrada:** o que tem de estar presente;
3. **Gatilho:** o evento exato que dispara a entrada;
4. **Stop:** onde e porquê;
5. **Alvo(s) e gestão;**
6. **Risco por trade;**
7. **Quando não operar.**

## As estratégias do laboratório como modelo
Cada uma tem **cinco regras de verificação** que ticas **antes** de decidir (por exemplo, "O stop fica atrás do ponto que invalida o recuo, não num número arbitrário") e uma lista de **situações a evitar**. O laboratório regista **quantas regras cumpriste** por decisão — para medir **aderência**, independentemente do resultado.

## "Livre (as minhas regras)"
Podes escrever as tuas próprias regras e usar o laboratório para verificar se as cumpres de forma consistente. Se não consegues descrevê-las **em duas frases**, ainda não são regras.

## Evita
- **Regras com "depende"** sem explicar de quê;
- **Excesso de parâmetros** (quanto mais, mais fácil é sobreajustar — ver lição de vieses);
- **Mudar** as regras durante o teste.`,
      example: `Regra vaga: *"Compro nos recuos em tendência de alta."* → depende do olhar de cada um.

Versão objetiva (para o laboratório):
1. **Contexto:** estrutura HH/HL no timeframe de 15 min;
2. **Condição:** recuo de 50–61,8% do último impulso, a tocar uma zona de procura marcada;
3. **Gatilho:** vela de 5 min que fecha acima da máxima da vela anterior dentro da zona;
4. **Stop:** 5 pontos abaixo do mínimo do recuo;
5. **Alvo:** 2R;
6. **Risco:** 1% por trade;
7. **Não opero:** nos 15 minutos a seguir a dados de impacto alto.

Duas pessoas aplicariam esta regra e chegariam (quase sempre) à mesma decisão.`,
      takeaways: ["Uma regra é testável se duas pessoas chegam à mesma decisão com a mesma informação.", "Estrutura: contexto, condições, gatilho, stop, alvo, risco e quando não operar.", "O laboratório mede quantas regras cumpriste, para separar aderência de resultado."],
      quiz: [
        mc("Qual destas regras é objetiva?", ["Entro quando o mercado parecer forte", "Entro quando a vela de 5 min fecha acima da máxima anterior dentro da zona marcada", "Entro por feeling", "Entro quando me sentir confiante"], 1, "É verificável nas velas e dá a mesma decisão a quem a aplicar."),
        tf("Mudar as regras a meio do teste não afeta a validade dos resultados.", false, "Quebra a coerência do teste e introduz viés."),
        mc("O que mede a 'aderência às regras' no laboratório?", ["Quanto dinheiro ganhaste", "Quantas das regras de verificação cumpriste em cada decisão", "O número de trades", "A velocidade"], 1, "Separa a qualidade da execução do resultado."),
        tf("Se não consegues descrever a regra em duas frases, ainda não está pronta para teste.", true, "A complexidade excessiva costuma esconder ambiguidade."),
      ],
    },
    {
      slug: "amostra-e-significado-estatistico",
      title: "Amostra e significado estatístico",
      summary: "Quantos trades são precisos antes de acreditar em números — e a incerteza de cada estimativa.",
      minutes: 8,
      content: `Um win rate calculado a partir de poucos trades é **uma estimativa com muita incerteza**.

## Margem de erro do win rate
Para um win rate real de cerca de 50%, a margem de erro aproximada a 95% é:

\`± 1,96 × √(0,25 ÷ n)\`

- **n = 10:** ±31 pontos percentuais — praticamente **nada se conclui**;
- **n = 30:** ±17,9 pp;
- **n = 100:** ±9,8 pp;
- **n = 400:** ±4,9 pp.

Isto aplica-se ao win rate. O **R médio** também oscila: com trades que variam entre −1R e +3R, o desvio-padrão ronda facilmente 1R+; o erro padrão da média cai com a **raiz** de n.

## O que isto significa
- Um win rate de **60% em 30 trades** é compatível com um win rate real de **42%–78%** — inclui valores **abaixo do equilíbrio**;
- Para distinguir uma vantagem **pequena** do acaso são necessárias **centenas** de trades;
- **Um bom mês** não demonstra vantagem; **um mau mês** não demonstra o contrário.

## O que a plataforma faz
- Avisa quando a amostra é pequena (**menos de 30 trades** → "estas estatísticas são ruído");
- Os cortes por setup/sessão/emoção só mostram "melhor" e "pior" com **pelo menos 3 trades** por grupo (um mínimo técnico, não uma garantia).

## Regras práticas
1. **Define o tamanho da amostra antes** de começar (por exemplo, 100 decisões);
2. **Não pares** o teste quando os resultados "parecem bons" (viés de paragem);
3. **Mostra sempre** o n junto das percentagens;
4. **Trata sequências de perdas** como normais, não como falhas do método;
5. **Procura robustez:** a conclusão mantém-se noutras séries e períodos?

## Humildade
Estatística não dá certezas: dá **intervalos**. Quem diz "tenho 80% de win rate" com 20 trades não **mediu** nada — **contou** (e contou pouco).`,
      example: `Dois traders (win rate real **desconhecido**, ambos medem 60%):

- **Trader A:** 30 trades → margem ≈ ±17,9 pp → intervalo **42%–78%**;
- **Trader B:** 400 trades → margem ≈ ±4,9 pp (usando 50% como referência; com 60%, ≈ ±4,8 pp) → intervalo **≈ 55%–65%**.

O trader A **não sabe** se tem vantagem (os extremos incluem 42%, abaixo do equilíbrio de alguns R:R); o trader B **tem mais informação**, embora ainda sem garantias para o futuro.`,
      takeaways: ["A margem de erro do win rate cai com a raiz de n: ±31 pp (n=10), ±17,9 (n=30), ±9,8 (n=100), ±4,9 (n=400).", "Define o tamanho da amostra antes de começar e não pares quando 'parece bom'.", "Estatística dá intervalos, não certezas; mostra sempre o n."],
      quiz: [
        num("Para n = 100 e win rate de 50%, qual é a margem de erro aproximada a 95% em pontos percentuais?", 9.8, 0.1, "pp", "1,96 × √(0,25 ÷ 100) = 1,96 × 0,05 = 9,8."),
        tf("Um win rate de 60% em 30 trades prova que o método tem vantagem.", false, "O intervalo plausível vai de cerca de 42% a 78%; inclui valores sem vantagem."),
        mc("Quando devo decidir o tamanho da amostra?", ["Quando os resultados parecerem bons", "Antes de começar o teste", "Depois de uma perda", "Nunca"], 1, "Parar quando 'parece bom' introduz viés de paragem."),
        mc("O que acontece à margem de erro quando n quadruplica?", ["Duplica", "Reduz-se para metade", "Mantém-se", "Aumenta 4×"], 1, "Cai com a raiz de n: √4 = 2."),
      ],
    },
    {
      slug: "vieses-do-backtest",
      title: "Vieses do backtest: overfitting e companhia",
      summary: "Overfitting, look-ahead, seleção, sobrevivência e o problema dos testes múltiplos.",
      minutes: 9,
      content: `Um backtest pode parecer **espetacular** e ser **inútil**. Os culpados habituais:

## 1. Overfitting (sobreajuste)
Ajustas parâmetros até a estratégia se adaptar **perfeitamente** ao passado — incluindo o seu ruído. O resultado é fantástico **nesses dados** e fraco em dados novos.

Sinais: muitos parâmetros; regras muito específicas ("só às terças depois das 10:15"); desempenho que **desaba** fora da amostra.

## 2. Testes múltiplos (data snooping)
Se testas **20 variantes** com um nível de significância de 5%, a probabilidade de **pelo menos uma** parecer significativa **por acaso** é cerca de **64%** (1 − 0,95²⁰). Quem escolhe a melhor e a apresenta ignorou 19 tentativas.

## 3. Look-ahead bias
Usar informação do **futuro**: marcar o nível depois de ver a reação, calcular um indicador com a vela que ainda não fechou, ou definir o stop sabendo o mínimo seguinte. O laboratório da plataforma **impede** isto: só envia as velas até ao ponto atual.

## 4. Survivorship / seleção
Testar apenas **instrumentos ou períodos** que "deram bem", ou **ignorar** setups que falharam. O backtest tem de incluir **todos** os casos que as regras permitem.

## 5. Custos irrealistas
Ignorar **spread**, **comissões** e **slippage** — o que pesa mais em estratégias de **muitos trades** e **stops curtos**.

## 6. Viés de paragem
Parar o teste quando os resultados estão bons.

## Defesas
1. **Poucas regras** e parâmetros fixos **antes** do teste;
2. **Divisão dos dados:** treino (*in-sample*) e teste (*out-of-sample*) **sem retoques** entre eles;
3. **Teste em várias séries e períodos** (walk-forward);
4. **Custos realistas**;
5. **Regista tudo**, incluindo as variantes que descartaste;
6. **Desconfia** de resultados bons demais: costumam ser **erro ou overfitting**.

## Nota sobre os dados DEMO
Num backtest em dados sintéticos, **nenhum** resultado diz algo sobre o mercado real. O valor é o **treino do método**.`,
      example: `Trader testa **60 combinações** de parâmetros (5 níveis de stop × 4 alvos × 3 filtros) numa série de 300 barras e escolhe a melhor: R médio **+0,9** em 40 trades.

Na série seguinte (out-of-sample), a mesma combinação dá **−0,1R**. Foi **overfitting + testes múltiplos**: entre 60 combinações, **alguma** ia dar bem no passado por acaso.

Alternativa: **fixar as regras antes** (1 stop, 1 alvo, 1 filtro, com razão lógica), testar numa série, e **confirmar numa segunda** sem mexer.`,
      takeaways: ["Overfitting adapta a estratégia ao ruído do passado e desaba fora da amostra.", "Testes múltiplos: 20 variantes a 5% dão ~64% de hipóteses de um falso positivo.", "Defesas: poucas regras, out-of-sample, custos realistas e registo de todas as variantes."],
      quiz: [
        mc("O que é overfitting?", ["Usar poucas regras", "Ajustar a estratégia ao ruído do passado até ela parecer perfeita", "Operar com stop largo", "Usar dados reais"], 1, "O resultado brilhante nos dados de treino não se repete em dados novos."),
        num("Qual é a probabilidade (em %) de pelo menos 1 em 20 testes independentes (nível 5%) parecer significativa por acaso? (1 − 0,95²⁰, 1 casa decimal)", 64.2, 0.2, "%", "1 − 0,95²⁰ ≈ 0,642, ou seja, 64,2%."),
        tf("Testar 60 variantes e mostrar apenas a melhor é um procedimento válido.", false, "Ignora as outras tentativas; a melhor pode ser pura sorte."),
        mc("Qual destas práticas ajuda a evitar overfitting?", ["Mais parâmetros", "Confirmar numa série out-of-sample sem retoques", "Parar quando está bom", "Ignorar custos"], 1, "Testar fora da amostra mostra se a vantagem aparente se mantém."),
      ],
    },
    {
      slug: "custos-execucao-e-realismo",
      title: "Custos, execução e realismo do teste",
      summary: "Como o laboratório resolve stop, alvo, gaps e saídas por tempo — e porque isto pesa nos resultados.",
      minutes: 7,
      content: `Um backtest só é útil se a **execução simulada** se aproximar do que aconteceria — ou, pelo menos, **não for otimista de mais**.

## Regras de execução do laboratório
- **Entrada:** ao preço de fecho da última vela visível, aplicando **spread** (compras ao ask, vendas ao bid);
- **Stop e alvo** definidos na decisão: o stop em pontos e o alvo como **múltiplo do stop** (por exemplo 2R) ou nenhum;
- **Gap:** se a abertura da vela salta **através** do stop (ou do alvo), a saída é no **preço de abertura** (pior que o stop ou melhor que o alvo);
- **Mesma vela:** se a vela atinge **stop e alvo**, assume-se o **pior caso**: o stop vence;
- **Tempo limite:** se nenhum nível for atingido, o trade fecha **a mercado após 200 barras**;
- **Custos:** spread e comissões ilustrativos, por contrato.

## Tamanho da posição
O laboratório calcula o tamanho a partir do **risco por trade** (0,1% a 5%) e do stop, **arredondado para baixo**. Se o tamanho dá **zero**, a decisão é recusada com explicação — como numa conta real com stop demasiado grande.

## Onde os backtests costumam ser otimistas
1. **Fills perfeitos** em stops (sem slippage);
2. **Ordem de eventos** dentro de uma vela ("o alvo veio antes do stop");
3. **Custos ignorados**;
4. **Liquidez infinita** (sem impacto);
5. **Dados limpos** (sem gaps, sem falhas).

## O que isto implica
Mesmo com regras de pior caso, **o mercado real pode ser pior**. Trata o resultado de um backtest como **limite superior otimista** do que obterias — e tolera margem de segurança.

## Boas práticas
- Usa **custos pessimistas** (um pouco acima dos esperados);
- **Testa a sensibilidade:** se a estratégia só funciona com custos zero, não serve;
- **Compara** com forward test em demo antes de qualquer decisão com capital.`,
      example: `Estratégia de scalping teórica: 200 trades, ganho bruto médio de **$24 por trade** (+0,24R com risco de $100), sem custos → **$4.800** no total.

Custos ilustrativos de ida e volta em 5 MYM: 5 × $1,50 = **$7,50 por trade** → ganho líquido **$16,50 por trade** (+0,165R) e **$3.300** no total. Os custos consomem **31,25%** do ganho bruto ($7,50 ÷ $24).

Se houver ainda **1 ponto** de slippage por trade em 5 MYM (1 × $0,50 × 5 = **$2,50**), o ganho líquido cai para **$14** ($2.800 no total) e os custos passam a **41,7%** do bruto. Com **3 pontos** de slippage ($7,50), sobram **$9 por trade**. Estratégias de margem fina **desaparecem** com custos realistas.`,
      takeaways: ["O laboratório resolve gaps no preço de abertura e, na mesma vela, o stop vence.", "Trata os resultados como limite superior otimista: fills reais podem ser piores.", "Testa a sensibilidade aos custos: se só funciona sem custos, não serve."],
      quiz: [
        mc("Se a vela atinge stop e alvo, o que assume o laboratório?", ["O alvo foi primeiro", "O stop vence (pior caso)", "O trade é anulado", "Usa o meio"], 1, "O pior caso evita resultados inflacionados."),
        tf("Num gap através do stop, a saída ocorre exatamente no stop.", false, "Ocorre no preço de abertura, pior do que o stop."),
        num("Ganho bruto $24 por trade e custos $7,50. Que fração do ganho bruto é consumida pelos custos, em %?", 31.25, 0.1, "%", "7,50 ÷ 24 = 0,3125, ou seja, 31,25%."),
        mc("Como tratar o resultado de um backtest?", ["Como previsão", "Como limite superior otimista do que se obteria", "Como garantia", "Como irrelevante"], 1, "A execução simulada tende a ser mais favorável do que a real."),
      ],
    },
    {
      slug: "ler-o-relatorio-do-laboratorio",
      title: "Ler o relatório do laboratório",
      summary: "Aderência às regras, taxa de espera, razões de entrada e o que cada secção diz (e não diz).",
      minutes: 7,
      content: `O relatório do laboratório está desenhado para **comparar processo e resultado**, não só para mostrar um saldo.

## Secções principais
1. **Resumo:** número de decisões, de trades, compras, vendas e **esperas**;
2. **Estatísticas:** win rate, R médio, expectancy, profit factor, drawdown máximo, sequências;
3. **Taxa de espera:** percentagem de decisões em que escolheste **esperar** — uma taxa de espera muito baixa pode indicar **excesso de atividade**;
4. **Duração média:** barras que os trades demoram a fechar;
5. **Por razão de entrada:** setup válido, FOMO, vingança, tédio, medo de perder, outra — com R médio por razão;
6. **Aderência às regras:** comparação entre decisões com **todas as regras cumpridas** e decisões com **regras em falta**;
7. **Notas honestas:** avisos sobre amostra pequena e limitações.

## Aderência às regras
Compara o R médio e o win rate de trades com **100% das regras** vs trades com regras em falta. O objetivo: perceber se **cumprir** as regras faz diferença **nos teus dados**. Com amostras pequenas, é **indicativo**, não conclusivo.

## Como ler sem te enganares
- **Primeiro** o n: com menos de 30 trades, tudo é ruído;
- **Depois** a aderência: um R médio bom com aderência baixa é **sorte** ou **erro nas regras**;
- **Compara** as razões: entradas emocionais pioram o R?
- **Compara** as esperas: ficaste fora quando devias?
- **Evita** concluir sobre a estratégia: **concluis** sobre **ti a aplicar a estratégia**.

## Perguntas finais
1. Segui as regras que escrevi?
2. Onde as quebrei e porquê?
3. A amostra tem tamanho para concluir?
4. O que repetia? O que mudava — **uma** coisa?
5. Isto precisa de **mais dados** ou de **melhor execução**?`,
      example: `Relatório fictício (25 decisões, 15 trades):

- **Esperas:** 10 (40% das decisões);
- **Aderência total:** 9 trades, R médio **+0,22**; **parcial:** 6 trades, R médio **−0,30**;
- **Razões:** setup válido 11 (R médio +0,15); FOMO 3 (R médio −0,55); tédio 1;
- **Nota:** "Amostra de 15 trades: demasiado pequena para concluir se existe vantagem."

Leitura honesta: **15 trades não provam nada**, mas o padrão **"quando quebro as regras, perco"** é consistente com o que a psicologia sugere. Próximo passo: **mais 60 decisões**, com o objetivo de **100% de aderência**.`,
      takeaways: ["O relatório compara processo (aderência, razões, esperas) com resultado (R, drawdown).", "Lê primeiro o n; depois a aderência; só depois o R médio.", "Concluis sobre ti a aplicar a estratégia, não sobre a estratégia em abstrato."],
      quiz: [
        mc("Qual é a primeira coisa a verificar ao ler o relatório?", ["O saldo final", "O número de trades (n)", "A cor do gráfico", "O XP"], 1, "Sem amostra suficiente, as restantes métricas são ruído."),
        tf("Um R médio positivo com aderência às regras baixa pode ser sorte ou erro nas regras.", true, "O resultado positivo não valida processo fraco."),
        num("25 decisões com 10 esperas. Qual é a taxa de espera?", 40, 0.01, "%", "10 ÷ 25 = 0,4, ou seja, 40%."),
        mc("O que compara a aderência às regras?", ["Compras e vendas", "Trades com todas as regras cumpridas vs com regras em falta", "Manhã e tarde", "Win rate e payoff"], 1, "Mostra se cumprir as regras faz diferença nos teus dados."),
      ],
    },
    {
      slug: "do-backtest-ao-forward-test",
      title: "Do backtest ao forward test",
      summary: "Um percurso prudente: teste in-sample, out-of-sample, demo e só depois (por decisão tua) tamanho mínimo.",
      minutes: 7,
      content: `Um backtest isolado não chega. O percurso prudente tem **etapas** com critérios de passagem **escritos antes**.

## As etapas
1. **Hipótese e regras escritas** (módulo 16 e lição 2);
2. **Backtest in-sample** (amostra grande, custos realistas, aderência alta);
3. **Out-of-sample:** outra série/período, **sem retoques** nas regras;
4. **Forward test em demo** (conta demo da corretora ou do Simulador): execução em tempo real, sem dinheiro;
5. **Tamanho mínimo** (MYM) com limites estritos — **só se decidires** e sempre assumindo que podes perder esse capital;
6. **Revisão contínua** com o journal.

## Critérios de passagem (exemplos)
- **Amostra:** pelo menos 100 trades por etapa;
- **Aderência:** ≥ 90% das decisões com regras completas;
- **Processo:** Process Score médio ≥ 75 e entradas emocionais < 10%;
- **Drawdown:** dentro do limite tolerável definido antes;
- **Robustez:** conclusão semelhante nas duas séries.

Se **falhar**, voltas atrás — não baixas o critério.

## Quando parar uma estratégia
- Drawdown **além** do limite planeado;
- Resultados **muito** piores do que o intervalo plausível do backtest;
- **Mudança** estrutural (instrumento, volatilidade, horário);
- **Aderência** que não consegues manter.

Parar **não é falhar**: é gestão de risco.

## Documentação
Guarda: **regras**, **datas**, **amostras**, **custos assumidos**, **resultados** (incluindo as variantes descartadas) e **decisões**. É o teu **registo científico**.

## Honestidade final
Nada neste percurso **garante** lucro. Os futuros usam alavancagem e podem causar perdas **superiores** ao esperado. O objetivo é **decidir com informação**, não com esperança.`,
      example: `Percurso fictício de 6 meses:

| Etapa | Duração | Amostra | Resultado |
|---|---|---|---|
| Backtest in-sample (DEMO) | 3 semanas | 120 decisões | Aderência 88% · R médio +0,10 |
| Out-of-sample (DEMO, outra série) | 3 semanas | 100 decisões | Aderência 92% · R médio +0,02 |
| Forward test (demo da corretora) | 8 semanas | 80 trades | Process Score 74 · R médio −0,05 |

Critério era **R médio ≥ 0 e Process Score ≥ 75**: o forward test **não passou**. Decisão: **mais um bloco em demo** a melhorar a execução; **sem** passar a tamanho real. O processo funcionou **porque** impediu um salto prematuro.`,
      exercise: { kind: "reflection", prompt: "Define os critérios de passagem (amostra, aderência, processo, drawdown) que a tua estratégia tem de cumprir em cada etapa antes de avançares.", placeholder: "Etapa 1: … Etapa 2: …" },
      takeaways: ["Percurso prudente: backtest, out-of-sample, forward test em demo e, só se decidires, tamanho mínimo.", "Escreve os critérios de passagem antes e, se falhares, volta atrás sem baixar a fasquia.", "Documenta tudo: regras, amostras, custos, variantes descartadas e decisões."],
      quiz: [
        mc("Qual destas é a ordem prudente?", ["Tamanho real e depois backtest", "Backtest, out-of-sample, forward test em demo e depois (se decidires) tamanho mínimo", "Demo e depois nada", "Backtest e tamanho máximo"], 1, "Cada etapa reduz a incerteza antes de arriscar capital."),
        tf("Se uma etapa falha, deves baixar o critério de passagem para continuar.", false, "Baixar a fasquia contradiz o propósito do critério."),
        tf("Parar uma estratégia que ultrapassa o drawdown planeado é uma forma de gestão de risco.", true, "O critério existe para proteger o capital e a decisão."),
        mc("Para que serve documentar variantes descartadas?", ["Para nada", "Para evitar enviesamento e testes múltiplos escondidos", "Para aumentar o XP", "Para copiar outro trader"], 1, "Mostra quantas tentativas foram feitas e evita enganar-te."),
      ],
    },
  ],
  quiz: {
    title: "Quiz do módulo — Backtesting",
    passScore: 70,
    questions: [
      tf("Um backtest positivo prova que a estratégia funcionará no futuro.", false, "Gera uma hipótese; não prova nada sobre o futuro."),
      mc("O que acontece quando se escolhe 'Esperar' no laboratório?", ["O trade fecha", "O gráfico avança 5 barras", "Perdes pontos", "A sessão acaba"], 1, "O feed avança para a próxima decisão."),
      num("Win rate real ≈ 50% e n = 100. Margem de erro a 95%, em pontos percentuais?", 9.8, 0.1, "pp", "1,96 × √(0,25 ÷ 100) = 9,8."),
      num("n = 400 e win rate ≈ 50%. Margem de erro a 95%, em pontos percentuais?", 4.9, 0.1, "pp", "1,96 × √(0,25 ÷ 400) = 1,96 × 0,025 = 4,9."),
      mc("O que é overfitting?", ["Ajustar a estratégia ao ruído do passado", "Usar stop largo", "Ter poucas regras", "Usar dados reais"], 0, "O resultado brilhante nos dados de treino não se repete em dados novos."),
      num("Probabilidade de pelo menos 1 em 20 testes (nível 5%) parecer significativa por acaso, em % (1 casa)?", 64.2, 0.2, "%", "1 − 0,95²⁰ ≈ 64,2%."),
      mc("Se a vela atinge stop e alvo, o laboratório assume…", ["O alvo primeiro", "O stop vence (pior caso)", "Trade anulado", "O meio"], 1, "Evita resultados inflacionados."),
      tf("Num gap através do stop, a saída é no preço de abertura, pior que o stop.", true, "O primeiro preço negociado é a abertura."),
      mc("Qual é a primeira coisa a verificar num relatório?", ["O saldo", "O n (número de trades)", "As cores", "O XP"], 1, "Sem amostra suficiente, o resto é ruído."),
      tf("Se uma etapa do percurso falha, deves baixar o critério para continuar.", false, "Isso derrota o propósito dos critérios definidos antes."),
    ],
  },
};
