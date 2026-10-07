import { mc, num, tf } from "../dsl";
import type { ModuleDef } from "../types";

/**
 * Module 23 — Trading Journal (Level 9). Mirrors /journal: entry fields, emotion + mistake tags, process rating (1–5),
 * "followed plan", and the statistics panel (win rate, payoff, expectancy, profit factor, avg R, drawdown, streaks, by setup/session/emotion,
 * process-vs-outcome grid, behaviour card). The worked 10-trade sample (R: +2, −1, +1,5, −1, −1, +2, −1, +1, −1, +2,5 with $100 risk)
 * was computed by code: win rate 50% · avg win $180 · avg loss −$100 · payoff 1,8 · expectancy +$40 · avg R +0,4 · profit factor 1,8 ·
 * max drawdown $200 (1,95% on $10.000 start; 2,0R) · max consecutive losses 2. Illustrative figures, not evidence of any edge.
 */
export const tradingJournal: ModuleDef = {
  slug: "trading-journal",
  number: 23,
  level: 9,
  title: "Trading Journal",
  summary: "O que registar, como calcular as métricas, separar processo de resultado e transformar o journal numa revisão semanal e mensal útil.",
  difficulty: "ADVANCED",
  icon: "NotebookPen",
  lessons: [
    {
      slug: "porque-manter-um-journal",
      title: "Porque manter um journal",
      summary: "O journal transforma memória enviesada em dados que podes analisar.",
      minutes: 6,
      content: `A memória é **péssima** a registar trades: lembramos as vitórias dramáticas, esquecemos os erros pequenos e reescrevemos as razões. O **journal** substitui a memória por **dados**.

## O que o journal faz
- **Mede** o que realmente aconteceu (não o que achas que aconteceu);
- Revela **padrões** de comportamento: horas, setups, estados emocionais, erros repetidos;
- Cria uma **amostra** para decidir com estatística, não com intuição;
- Dá **responsabilidade** a ti próprio: escrever uma razão torna-a verificável.

## O que o journal não faz
- ✘ **Não prevê** o futuro nem demonstra vantagem estatística em poucas entradas;
- ✘ **Não é um diário de desabafos**: precisa de campos estruturados que se possam contar;
- ✘ **Não substitui** o plano diário nem a checklist: complementa-os.

## Regras para funcionar
1. **Regista todos os trades**, incluindo os que preferias esquecer;
2. **Regista logo a seguir** (ou no fim do dia), enquanto os detalhes estão frescos;
3. **Sê honesto**: ninguém lê isto, só tu;
4. **Preenche campos estruturados** (setup, estado emocional, erros) e **uma lição** em texto;
5. **Revê** semanalmente: um journal que nunca se revê é só trabalho extra.

## O journal e o Simulador
Podes **pré-preencher** uma entrada a partir de um trade do Simulador (instrumento, direção, preços, contratos, resultado, razão de entrada); só tens de acrescentar a parte **humana**: estado emocional, erros, lição e avaliação de processo.

## Gamificação
O XP do journal premeia **entradas completas** (com lição e avaliação de processo), não o volume de entradas: preencher por preencher não acelera nada.

## Privacidade
As entradas pertencem a ti: são acessíveis apenas na tua conta e a plataforma valida a autorização em cada pedido.`,
      example: `Duas descrições do mesmo trade:

- **De memória (3 dias depois):** *"Foi um bom setup, só a vela de notícias é que estragou."*;
- **No journal (10 min depois):** *"Setup: pullback. Entrei antes da confirmação (FOMO). Afastei o stop 12 pontos. Perdi −1,3R em vez de −1R. Erro: mexi no stop."*

A segunda é **mais curta** e **mais útil**: mostra um erro concreto e mensurável. Em 20 entradas, essa tag "mexi no stop" aparecerá 7 vezes — e então já sabes **o que mudar**.`,
      exercise: { kind: "link", href: "/journal/new", label: "Nova entrada de journal", prompt: "Regista um trade (real, fictício ou do Simulador). Preenche os campos de estado emocional, erros, lição e avaliação de processo." },
      takeaways: ["O journal substitui a memória por dados contáveis: padrões, erros repetidos, amostra.", "Regista tudo, logo após o trade, com campos estruturados e uma lição.", "Só serve se for revisto regularmente; o XP premeia entradas completas, não o volume."],
      quiz: [
        mc("Qual é o principal valor do journal?", ["Prever o próximo trade", "Substituir memória enviesada por dados analisáveis", "Dar sinais", "Impressionar outros"], 1, "Mede o que aconteceu e revela padrões."),
        tf("Só vale a pena registar os trades que correram bem.", false, "Os perdedores e os erros são os que mais ensinam."),
        mc("Porque se usam campos estruturados e não apenas texto livre?", ["Porque são mais bonitos", "Porque podem ser contados e comparados", "Porque o texto é proibido", "Porque o XP é maior"], 1, "Só dados estruturados permitem estatísticas por setup, sessão e emoção."),
        tf("Preencher muitas entradas rapidamente aumenta o XP do journal.", false, "O XP premeia entradas completas, com lição e avaliação de processo."),
      ],
    },
    {
      slug: "o-que-registar",
      title: "O que registar em cada trade",
      summary: "Os campos que importam, do contexto à emoção, e porque cada um existe.",
      minutes: 7,
      content: `Um bom registo tem **factos** (o que aconteceu) e **contexto humano** (como decidiste).

## Factos
- **Data e hora** e **sessão** (Ásia, Londres, Nova Iorque, sobreposição, fora de horas);
- **Instrumento** (YM, MYM, US30) e **direção** (compra ou venda);
- **Timeframe** de execução;
- **Setup** (nome do teu método, por exemplo "Pullback na tendência");
- **Preços:** entrada, stop, alvo e saída;
- **Contratos** e **risco em dólares**;
- **Resultado** (P&L líquido) e **R-multiple** (resultado ÷ risco inicial).

## Contexto humano
- **Estado emocional:** calmo, confiante, ansioso, FOMO, frustrado, entediado, eufórico ou cansado;
- **Erros** (tags): mexi no stop, tamanho excessivo, saí cedo demais, sem plano, persegui o preço, revenge trading, sem stop, overtrading, outro;
- **Seguiste o plano?** (sim/não);
- **Avaliação de processo (1 a 5):** *"Se ignorares o resultado, o processo foi bom?"*;
- **Lição** em uma frase;
- **Capturas de ecrã** antes e depois (ajudam a rever a leitura).

## Porque a avaliação de processo
É o campo que separa **resultado** de **decisão**. Uma entrada com processo 5 que perdeu é **normal**; uma com processo 1 que ganhou é **um aviso**.

## Qualidade dos dados
- **Preços consistentes:** o stop e o alvo definidos **antes** da entrada, não ajustados depois;
- **R-multiple** calculado com o **risco inicial**, não com o stop final;
- **Erros nomeados** com as mesmas tags, para poderem ser contados;
- **Uma lição, não um ensaio.**

## Evita
- Preencher de memória dias depois;
- Mudar o setup depois do resultado ("afinal era outro setup");
- Deixar campos vazios que depois enviesam as estatísticas.`,
      example: `Entrada fictícia:

- **Data:** 07/10 · **Sessão:** Nova Iorque · **MYM** · **Compra** · **5 min**;
- **Setup:** Pullback na tendência;
- **Entrada** 39.001 · **Stop** 38.961 · **Alvo** 39.081 · **Saída** 38.961 (stop);
- **Contratos:** 5 · **Risco:** 5 × 40 × $0,50 = **$100** · **Resultado:** **−$105** (−$100 de mercado e $5 de comissões ilustrativas: 5 × $1) · **R = −1,05**;
- **Estado emocional:** calmo · **Erros:** nenhum · **Seguiu o plano:** sim · **Processo:** 5/5;
- **Lição:** *"Setup válido que falhou: acontece. Manter o risco."*

**Perdeu dinheiro, processo perfeito.** Estatisticamente, é o tipo de trade que **deves** repetir.`,
      takeaways: ["Registar factos (preços, risco, resultado, R) e contexto humano (emoção, erros, plano, processo).", "A avaliação de processo (1–5) separa decisão de resultado.", "Usa tags consistentes e preenche logo após o trade; evita mudar o setup depois do resultado."],
      quiz: [
        mc("O que é o R-multiple?", ["O resultado dividido pelo risco inicial", "O resultado em pontos", "A comissão", "A margem"], 0, "R = resultado ÷ risco inicial; padroniza trades de tamanhos diferentes."),
        tf("A avaliação de processo (1 a 5) mede se o trade ganhou dinheiro.", false, "Mede a qualidade da decisão, independentemente do resultado."),
        num("Risco inicial $100 e resultado líquido −$105. Qual é o R-multiple?", -1.05, 0.01, "R", "−105 ÷ 100 = −1,05R."),
        tf("Podes alterar o setup de uma entrada depois de saberes o resultado, para ficar coerente.", false, "Altera a evidência; mantém o setup tal como o decidiste."),
      ],
    },
    {
      slug: "metricas-do-journal",
      title: "As métricas do journal",
      summary: "Win rate, payoff, expectancy, profit factor, R médio, drawdown e sequências — o que cada uma diz.",
      minutes: 9,
      content: `O painel de estatísticas do journal calcula métricas que descrevem **o teu desempenho** — e só têm significado com **amostras razoáveis**.

## Definições
- **Win rate:** % de trades com resultado positivo;
- **Ganho médio / perda média:** média dos ganhadores e dos perdedores;
- **Payoff (ratio):** ganho médio ÷ |perda média|;
- **Expectancy ($):** resultado médio por trade; **Expectancy (R):** média dos R-multiples;
- **Profit factor:** soma dos ganhos ÷ soma das perdas (em valor absoluto);
- **Drawdown máximo:** pior queda desde um pico (em $, % e R);
- **Sequência máxima de perdas:** maior número de perdas seguidas.

## Como se relacionam
\`expectancy = win rate × ganho médio − (1 − win rate) × |perda média|\`

Um win rate **baixo** com payoff **alto** pode ter expectancy positiva; um win rate alto com payoff baixo pode ter negativa.

## Cuidados
1. **Amostra mínima:** com 10 trades, as métricas variam muito; com 100+, estabilizam mais;
2. **Profit factor sem perdas** não existe (indefinido) — não é "infinito bom";
3. **Drawdown** depende da **ordem** dos trades, não só do total;
4. **Custos:** usa resultados **líquidos** (com comissões);
5. **Correlação com o plano:** não compares trades de métodos diferentes na mesma métrica.

## Nada disto é previsão
São **descrições do passado**. Uma expectancy positiva num journal pequeno **não prova** vantagem; uma negativa **não condena** um método — pede mais dados e análise de processo.`,
      example: `10 trades (risco $100 cada; R: +2, −1, +1,5, −1, −1, +2, −1, +1, −1, +2,5):

- **Ganhadores:** 5 (+$200, +$150, +$200, +$100, +$250) = **+$900** → ganho médio **$180**;
- **Perdedores:** 5 (5 × −$100) = **−$500** → perda média **−$100**;
- **Win rate:** **50%** · **Payoff:** 180 ÷ 100 = **1,8**;
- **Expectancy:** (900 − 500) ÷ 10 = **+$40** por trade → **+0,4R**;
- **Profit factor:** 900 ÷ 500 = **1,8**;
- **Drawdown máximo:** **$200** (2,0R) — de um pico de +$250 até +$50; com conta de $10.000: **1,95%**;
- **Máx. perdas seguidas:** **2**.

Parece bom, mas são **10 trades**: o resultado é compatível com sorte. A conclusão correta é **"continuar a recolher dados"**.`,
      takeaways: ["As métricas descrevem o passado: win rate, payoff, expectancy, profit factor, drawdown, sequências.", "Expectancy = win rate × ganho médio − (1 − win rate) × |perda média|.", "Amostras pequenas dão métricas instáveis: continua a recolher dados antes de concluir."],
      quiz: [
        num("5 ganhadores com total de $900 e 5 perdedores com total de −$500. Profit factor?", 1.8, 0.01, "", "900 ÷ 500 = 1,8."),
        num("Ganho médio $180 e perda média −$100. Payoff?", 1.8, 0.01, "", "180 ÷ 100 = 1,8."),
        num("Win rate 50%, ganho médio $180, perda média $100. Expectancy por trade, em dólares?", 40, 0.01, "$", "0,5 × 180 − 0,5 × 100 = 90 − 50 = $40."),
        tf("Uma expectancy positiva em 10 trades prova que o método tem vantagem.", false, "Dez trades são compatíveis com sorte; é preciso uma amostra maior."),
      ],
    },
    {
      slug: "processo-versus-resultado-no-journal",
      title: "Processo versus resultado: a grelha 2×2",
      summary: "Bom processo e resultado bom ou mau; mau processo e resultado bom ou mau — e a decisão que cada quadrante pede.",
      minutes: 7,
      content: `O journal calcula uma **grelha 2×2** com a avaliação de processo e o resultado:

| | **Resultado positivo** | **Resultado negativo** |
|---|---|---|
| **Processo bom (4–5)** | ✔ Mérito (repete) | ✔ Variância normal (repete) |
| **Processo fraco (1–2)** | ⚠ Sorte (corrige) | ✘ Erro merecido (corrige) |

## O que cada quadrante diz
1. **Bom processo + ganho:** o ideal; **repete**;
2. **Bom processo + perda:** **variância**; **não mudes nada** por causa deste resultado;
3. **Mau processo + ganho:** **perigoso**: o resultado reforça um mau hábito;
4. **Mau processo + perda:** o castigo óbvio; **corrige** o hábito.

## Armadilhas
- **Resultados a enganar:** o quadrante 3 faz parecer que o plano "não precisa" de ser seguido;
- **Culpar o mercado:** muitas perdas do quadrante 4 são descritas como "azar";
- **Auto-engano:** inflacionar a avaliação de processo depois de uma perda (ou deflacioná-la depois de um ganho) estraga a grelha.

## Como avaliar o processo
Antes de pontuar, pergunta: *"Se este trade fosse um dos próximos 100, repetiria exatamente esta decisão?"*
- **5:** plano cumprido, risco certo, sem erros;
- **3:** plano parcialmente cumprido ou dúvida na execução;
- **1:** decisão emocional, sem stop, sem plano.

## Meta
Maximizar o número de trades de **processo bom**; os resultados seguem — com variância. Um journal em que **80%** dos trades têm processo 4–5 é mais valioso do que um com 70% de win rate e processo inconsistente.`,
      example: `20 entradas fictícias:

| | Resultado positivo | Resultado negativo |
|---|---|---|
| **Processo bom** | 7 | 5 |
| **Processo fraco** | 3 | 5 |

Leitura: **12 de 20 (60%)** com processo bom; das 8 com processo fraco, **3 ganharam por sorte**. O plano de ação não é "ganhar mais": é **transformar 5 trades de processo fraco e perda** em processo bom (ou em não-trade).

Outro dado: nos trades de **processo bom**, 7 de 12 ganharam (**58%**); nos de **processo fraco**, 3 de 8 (**38%**) — diferença sugestiva, mas amostra pequena.`,
      takeaways: ["A grelha 2×2 cruza qualidade do processo com resultado: variância, sorte, mérito e erro.", "Mau processo + ganho é o quadrante mais perigoso: reforça maus hábitos.", "Pergunta sempre: se este fosse um dos próximos 100 trades, repetiria exatamente esta decisão?"],
      quiz: [
        mc("Como se classifica um trade com processo fraco que ganhou dinheiro?", ["Mérito", "Sorte a corrigir", "Variância normal", "Erro merecido"], 1, "O resultado positivo não repara o mau processo."),
        mc("O que fazer após um trade de bom processo e perda?", ["Mudar o setup", "Manter o plano; é variância normal", "Dobrar o risco", "Apagar a entrada"], 1, "O resultado de um trade isolado diz pouco sobre a decisão."),
        num("De 20 trades, 12 tiveram processo bom. Que percentagem?", 60, 0.01, "%", "12 ÷ 20 = 0,6, ou seja, 60%."),
        tf("Inflacionar a avaliação de processo depois de uma perda mantém a grelha honesta.", false, "Distorce os dados e esconde onde há erros."),
      ],
    },
    {
      slug: "analisar-por-setup-sessao-e-emocao",
      title: "Analisar por setup, sessão e estado emocional",
      summary: "Agrupar trades para descobrir padrões — sem cair na armadilha de procurar conclusões em amostras minúsculas.",
      minutes: 8,
      content: `Depois de ter **dezenas** de entradas, podes agrupá-las. O painel mostra três cortes: **por setup**, **por sessão** e **por estado emocional**.

## Por setup
Qual dos teus setups tem melhor **R médio** e **win rate**? Qual tem pior? Útil para **decidir onde concentrar estudo** — não para largar um setup por um mau mês.

## Por sessão
Londres, Nova Iorque, sobreposição, fora de horas. Mostra **quando** operas melhor/pior (ver módulo 12 sobre sessões, conversão ao teu fuso).

## Por estado emocional
Calmo vs ansioso vs FOMO vs cansado. Muitas vezes é **o corte mais revelador**: a diferença não está no setup, mas em **quem** o executa.

## Mínimo de amostra
A plataforma só indica "melhor" e "pior" grupos com **pelo menos 3 trades** por grupo. É um **mínimo técnico**, não uma garantia: grupos de 3 ou 5 trades continuam a ser ruído.

## Armadilhas
- **Data dredging:** testar 15 cortes e destacar o que "dá bonito" acaba por encontrar padrões **por acaso**;
- **Confundir correlação com causa:** operar mal "às sextas" pode ser cansaço, não a sexta-feira;
- **Muitas categorias:** grupos pequenos demais;
- **Misturar métodos** diferentes no mesmo setup.

## Como usar bem
1. **Formula uma pergunta antes** ("operar cansado piora o meu processo?");
2. **Verifica o tamanho** de cada grupo;
3. **Formula uma regra experimental** ("sem operar depois das 17:00 durante um mês");
4. **Volta a medir** depois de uma amostra nova.

## Honestidade
Estes cortes dão **hipóteses**, não **provas**. A prova de uma regra vem de uma amostra **nova** (fora da que gerou a hipótese).`,
      example: `Journal fictício (40 trades):

| Estado | Trades | R médio |
|---|---|---|
| Calmo | 22 | +0,28 |
| Ansioso | 8 | −0,12 |
| FOMO | 6 | −0,55 |
| Cansado | 4 | −0,30 |

Hipótese: **"FOMO e cansaço degradam o meu R"**. Regra experimental: **sem entrar quando assinalo FOMO ou cansaço** durante 30 trades. Se o R médio global melhorar **e** a regra se mantiver, ganhas confiança; se não, abandonas a hipótese.

Note-se: **4 e 6 trades** são pequenos — por isso é uma **hipótese a testar**, não um facto.`,
      takeaways: ["Agrupa por setup, sessão e estado emocional para formular hipóteses, não provas.", "Grupos pequenos (3–5 trades) são ruído; evita procurar muitos cortes até algo 'dar bonito'.", "Testa cada hipótese com uma regra experimental e uma amostra nova."],
      quiz: [
        mc("Qual é o risco de testar 15 cortes e destacar o que 'dá bonito'?", ["Nenhum", "Encontrar padrões por acaso (data dredging)", "Gastar demasiado XP", "Perder dados"], 1, "Com muitos testes, algum parecerá significativo por pura sorte."),
        tf("Um grupo com 4 trades chega para concluir que um setup funciona.", false, "Quatro trades são ruído; é necessária uma amostra maior."),
        mc("Qual é o corte mais revelador, segundo a lição?", ["Dia do mês", "Estado emocional", "Cor do gráfico", "Número do trade"], 1, "Mostra o efeito de quem executa e não só do setup."),
        tf("A prova de uma regra experimental vem de uma amostra nova.", true, "Testar na mesma amostra que gerou a hipótese é circular."),
      ],
    },
    {
      slug: "erros-licoes-e-revisao",
      title: "Erros, lições e revisão semanal e mensal",
      summary: "Transformar tags de erros em regras e fechar o ciclo: registar → medir → rever → mudar uma coisa.",
      minutes: 7,
      content: `Os **erros** que registas são ouro: dizem-te **onde** estás a perder mais do que o mercado.

## As tags de erro
- **Mexi no stop** · **Tamanho excessivo** · **Saí cedo demais** · **Sem plano** · **Persegui o preço** · **Revenge trading** · **Sem stop** · **Overtrading** · **Outro**.

O painel conta-as e mostra as **mais frequentes**. Ataca a **mais comum** primeiro: um erro de cada vez.

## Do erro à regra
| Erro frequente | Regra de substituição |
|---|---|
| Mexi no stop | Stop real na plataforma; proibido afastá-lo |
| Tamanho excessivo | Calculadora de posição obrigatória |
| Saí cedo demais | Alvo e gestão escritos antes; parcial só se planeada |
| Persegui o preço | Sem setup, sem trade; esperar o próximo |
| Revenge trading | Pausa de 15–30 min e limite de perdas seguidas |
| Overtrading | Máximo de trades por dia no plano |

## Revisão semanal (20–30 min)
1. **Números:** trades, R total, win rate, drawdown;
2. **Comportamento:** % de entradas emocionais, % de planos seguidos;
3. **Erros:** os 2 mais frequentes;
4. **Melhor e pior decisão da semana;**
5. **Uma mudança** para a próxima semana.

## Revisão mensal
- Compara **processo** (avaliação média, % com plano seguido) com **resultado** (R, expectancy);
- Revê **setups** e **sessões** com amostras maiores;
- Decide: **manter**, **ajustar uma regra** ou **parar para estudar**;
- **Escreve** o objetivo do mês seguinte em termos de **processo**, não de lucro.

## Anti-padrões
- Rever **apenas quando perdes**;
- **Mudar** cinco coisas de uma vez (não sabes qual funcionou);
- **Culpar** o mercado em vez de procurar o padrão.

## O ciclo
**Plano → execução → registo → medição → revisão → uma mudança → novo plano.** A melhoria é um **processo**, não um evento.`,
      example: `Revisão semanal fictícia (15 trades):

- **Erros:** "Mexi no stop" 4× · "Persegui o preço" 3× · "Sem plano" 1×;
- **Plano seguido:** 11/15 = **73%**;
- **Processo médio:** 3,6/5;
- **Melhor decisão:** não operar após duas perdas na quarta-feira;
- **Uma mudança:** **stop real** em todas as entradas; revê na semana seguinte se "Mexi no stop" baixa para 0–1.

Depois de duas semanas: "Mexi no stop" desce para 1 e o **R médio sobe** de −0,05 para +0,08. A amostra é pequena — **mas o processo está a melhorar**, e é esse o objetivo.`,
      exercise: { kind: "link", href: "/journal", label: "Abrir o Journal", prompt: "Vê as tags de erros mais frequentes nas tuas entradas e escreve uma regra de substituição para a primeira." },
      takeaways: ["Ataca o erro mais frequente primeiro e transforma-o numa regra concreta.", "Faz revisão semanal (números, comportamento, erros) e mensal (processo vs resultado).", "Muda uma coisa de cada vez e volta a medir: melhoria é um ciclo, não um evento."],
      quiz: [
        mc("Qual é a regra de substituição adequada para 'Mexi no stop'?", ["Stop real na plataforma, sem afastar", "Parar de usar stop", "Aumentar o tamanho", "Fechar sempre manualmente"], 0, "Uma ordem real remove a decisão emocional."),
        num("Seguiste o plano em 11 de 15 trades. Que percentagem?", 73.3, 0.1, "%", "11 ÷ 15 = 0,7333, ou seja, 73,3%."),
        tf("É boa prática alterar cinco regras ao mesmo tempo para acelerar a melhoria.", false, "Não saberás qual das mudanças teve efeito."),
        mc("O que deve ter o objetivo mensal segundo a lição?", ["Um valor de lucro", "Um objetivo de processo", "Um número de trades", "Um instrumento novo"], 1, "O processo é o que controlas; o lucro é variável."),
      ],
    },
  ],
  quiz: {
    title: "Quiz do módulo — Trading Journal",
    passScore: 70,
    questions: [
      mc("Porque se regista o journal logo a seguir ao trade?", ["Porque é uma regra legal", "Porque os detalhes estão frescos e a memória distorce", "Porque o XP duplica", "Porque o mercado fecha"], 1, "A memória reescreve razões e esquece erros pequenos."),
      num("Risco inicial $100 e resultado líquido +$250. Qual é o R-multiple?", 2.5, 0.01, "R", "250 ÷ 100 = 2,5R."),
      num("Win rate 40%, ganho médio $200, perda média $100. Expectancy por trade, em dólares?", 20, 0.01, "$", "0,4 × 200 − 0,6 × 100 = 80 − 60 = $20."),
      num("Soma dos ganhos $1.200 e das perdas −$800. Profit factor?", 1.5, 0.01, "", "1.200 ÷ 800 = 1,5."),
      mc("Que quadrante da grelha é o mais perigoso?", ["Processo bom e ganho", "Processo bom e perda", "Processo fraco e ganho", "Processo fraco e perda"], 2, "O ganho reforça um mau hábito."),
      tf("Uma expectancy positiva em 10 trades prova que o método tem vantagem.", false, "É compatível com sorte; precisa de mais amostra."),
      tf("Podes alterar o setup de uma entrada depois de saberes o resultado.", false, "Altera a evidência; regista o setup como o decidiste."),
      mc("Qual é a primeira prioridade da revisão de erros?", ["O erro mais raro", "O erro mais frequente", "O erro mais embaraçoso", "Nenhum"], 1, "Resolver o mais frequente tem maior retorno."),
      mc("Para que servem os cortes por setup, sessão e emoção?", ["Provar que o método funciona", "Formular hipóteses a testar", "Prever o próximo trade", "Calcular o XP"], 1, "São hipóteses, não provas."),
      tf("A revisão semanal deve ser feita apenas quando se perde.", false, "Rever só nas perdas enviesa a análise; revê sempre."),
    ],
  },
};
