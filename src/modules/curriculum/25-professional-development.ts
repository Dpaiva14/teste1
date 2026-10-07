import { mc, num, tf } from "../dsl";
import type { ModuleDef } from "../types";

/**
 * Module 25 — Professional Development (Level 10). Strategy development, advanced execution and continuous improvement.
 * Nothing here is a recommendation of a broker, firm or product; no performance promises. Contract facts: YM $5/pt, MYM $0,50/pt, quarterly
 * Mar/Jun/Sep/Dec cycle (CME, confirmed by official excerpt 2026-10-06). Order-type descriptions are generic; rules vary by broker and venue.
 */
export const professionalDevelopment: ModuleDef = {
  slug: "professional-development",
  number: 25,
  level: 10,
  title: "Professional Development",
  summary: "Desenvolver uma metodologia própria, documentá-la num playbook, executar com cuidado, proteger-te de esquemas e melhorar de forma contínua.",
  difficulty: "PROFESSIONAL",
  icon: "GraduationCap",
  lessons: [
    {
      slug: "construir-a-tua-metodologia",
      title: "Construir a tua metodologia: da ideia à regra",
      summary: "Um percurso para desenvolver uma estratégia própria sem copiar 'segredos' nem cair em overfitting.",
      minutes: 8,
      content: `Uma metodologia **tua** é um conjunto de decisões **escritas** que consegues aplicar com consistência. Não precisa de ser original; precisa de ser **clara, testada e compatível com o teu risco e a tua vida**.

## Etapas
1. **Observação:** o que vês repetir-se nos gráficos? (por exemplo, recuos a zonas depois de rompimentos);
2. **Hipótese:** *"Se X, então Y é mais provável que Z"* — uma frase, com **razão lógica**, não só estatística;
3. **Regras objetivas:** contexto, gatilho, stop, alvo, risco, quando não operar (módulos 16 e 24);
4. **Teste:** backtest, out-of-sample e forward test em demo (módulo 24);
5. **Revisão:** aderência, estatísticas, drawdown e processo;
6. **Decisão:** manter, ajustar **uma** coisa ou abandonar.

## Princípios
- **Simplicidade:** menos regras e parâmetros → mais robustez;
- **Lógica antes de estatística:** deves saber **porque** a ideia poderia funcionar (quem está do outro lado do trade? que comportamento estás a explorar?);
- **Compatibilidade pessoal:** horário, tolerância ao drawdown, tempo disponível, capital;
- **Um mercado, um método** no início: especializa-te antes de diversificar;
- **Mudanças pequenas e datadas:** uma de cada vez, com motivo.

## Fontes de ideias (e cuidados)
- **Material educativo** (livros, documentação da exchange, cursos): ótimo para **aprender conceitos**, mas **não** para "copiar sinais";
- **Observação própria:** o journal e o replay mostram padrões que **só tu** vês;
- **Cuidado com "estratégias secretas"** ou promessas de **win rate** altíssimo: são alarmes, não ideias.

## O que esta plataforma oferece
O **Confluence Trading Framework** (módulo 15) é um **método educativo original**, **não é** o curso oficial de nenhuma entidade externa. Podes usá-lo como **ponto de partida** — e adaptá-lo, testá-lo e documentá-lo.

## Armadilhas
- **Colecionar indicadores** (paralisia por excesso de informação);
- **Mudar de método** ao primeiro mau período (módulo 19);
- **Otimizar** parâmetros até o passado ficar perfeito (overfitting — módulo 24).`,
      example: `Percurso fictício de desenvolvimento:

- **Observação:** em 40 pullbacks do replay, muitos recuaram a zonas de procura marcadas antes;
- **Hipótese:** *"Em tendência de alta com HH/HL, um recuo de 50–61,8% a uma zona de procura marcada tem melhor relação R:R do que comprar rompimentos"*. Razão lógica: compradores a defender um preço que já foi defendido;
- **Regras:** 7 linhas (contexto, zona, gatilho, stop, alvo 2R, risco 1%, "não opero" em eventos de impacto alto);
- **Teste:** 120 decisões in-sample + 100 out-of-sample + 80 trades em demo;
- **Revisão:** aderência 90%, drawdown dentro do limite, processo 78;
- **Decisão:** manter, com **uma** alteração: não operar nos 15 minutos antes de dados de alto impacto.

Nada aqui **garante** resultados futuros: o percurso apenas **reduz a incerteza** antes de arriscar capital.`,
      takeaways: ["Metodologia própria: observação, hipótese com razão lógica, regras objetivas, teste, revisão e decisão.", "Simplicidade, compatibilidade pessoal e mudanças pequenas e datadas aumentam a robustez.", "Material externo ensina conceitos; sinais e 'estratégias secretas' são alarmes."],
      quiz: [
        mc("Qual é uma boa hipótese de estratégia?", ["Vai subir amanhã", "Se X, então Y é mais provável que Z, com razão lógica e regras testáveis", "O mercado sempre respeita Fibonacci", "Um indicador secreto"], 1, "Uma hipótese tem lógica e é testável; não é opinião."),
        tf("Quanto mais parâmetros uma estratégia tiver, mais robusta é.", false, "Mais parâmetros facilitam o sobreajuste; simplicidade aumenta a robustez."),
        tf("O Confluence Trading Framework da plataforma é o curso oficial de uma entidade externa.", false, "É um método educativo original, com aviso explícito."),
        mc("Qual é a ordem sensata?", ["Teste, hipótese, regras", "Observação, hipótese, regras, teste, revisão", "Regras, execução real, hipótese", "Execução real, depois teste"], 1, "Cada etapa fundamenta a seguinte."),
      ],
    },
    {
      slug: "playbook-e-documentacao",
      title: "O playbook: documentar o teu método",
      summary: "Uma página por setup, um plano de trade padronizado e um registo de alterações.",
      minutes: 7,
      content: `O **playbook** é o documento onde a tua metodologia **vive**. Sem ele, o método está na tua cabeça — onde muda ao sabor do humor.

## O que inclui
1. **Princípios** (filosofia, risco por trade, limites diários);
2. **Mercados e horários** em que operas;
3. **Setups** (uma página cada): contexto, condições, entrada, stop, alvo, invalidação, risco, exemplo vencedor, exemplo perdedor e **quando NÃO usar** (a estrutura dos setups do módulo 16);
4. **Plano diário** (modelo) e **checklist pré-trade**;
5. **Regras de gestão** (stop, breakeven, parciais, saídas por tempo/condição);
6. **Regras comportamentais** (disjuntores, pausas, o que fazer depois de perdas);
7. **Revisão** (semanal e mensal) e métricas de acompanhamento;
8. **Registo de alterações** (changelog).

## Plano de trade padronizado
Um modelo de uma página preenchido **antes** de cada trade:
- **Setup** e contexto;
- **Entrada, stop, alvo** e **R:R**;
- **Tamanho** e risco em dólares;
- **O que invalida**;
- **Condições de saída** (tempo/condição);
- **Razão** da entrada (e a razão **não** é emocional).

## Changelog
Cada alteração ao playbook tem **data**, **motivo** e **dados** que a suportam:
- *2026-10-07 — Passo a exigir R:R ≥ 2 no setup 1. Motivo: nos últimos 60 trades, R:R < 2 teve R médio −0,18.*

Isto evita que o método **mude sem rasto** — e permite perceber **o que** mudou quando os resultados mudam.

## Versões
Marca versões ("v1.0", "v1.1") e testa **cada versão** em amostra nova. Misturar dados de versões diferentes **mistura experiências**.

## Boas práticas
- **Curto e acionável:** se ninguém o consegue usar durante a sessão, está longo demais;
- **Revisto** de forma regular;
- **Verdadeiro:** inclui o que **realmente fazes**, não o que gostarias de fazer.`,
      example: `Página de setup (excerto, **educativo/fictício**):

**Setup 1 — Pullback na tendência (v1.1)**
- **Contexto:** HH/HL no 15 min; viés do plano diário alinhado;
- **Condições:** recuo de 50–61,8% do último impulso a uma zona marcada antes;
- **Entrada:** fecho da vela de 5 min acima da máxima da anterior dentro da zona;
- **Stop:** 5 pontos abaixo do mínimo do recuo;
- **Alvo:** 2R ou o próximo swing high;
- **Risco:** 1%;
- **Quando NÃO usar:** estrutura lateral, 15 min antes de dados de alto impacto, depois de 2 perdas no dia;
- **Changelog:** v1.1 (07/10) — acrescentei "depois de 2 perdas no dia"; motivo: 70% das minhas perdas grandes ocorreram na terceira tentativa.

Com este nível de detalhe, uma sessão de **revisão** consegue dizer se o setup foi **cumprido**.`,
      exercise: { kind: "reflection", prompt: "Escreve a primeira página do teu playbook: o teu setup principal com contexto, condições, entrada, stop, alvo, risco e 'quando NÃO usar'.", placeholder: "Setup 1 — …" },
      takeaways: ["O playbook documenta princípios, setups, plano diário, checklist, gestão, regras comportamentais e revisão.", "Cada alteração tem data, motivo e dados no changelog; cada versão testa-se em amostra nova.", "Curto, acionável e verdadeiro: inclui o que realmente fazes."],
      quiz: [
        mc("Qual é o objetivo do changelog do playbook?", ["Decorar", "Registar o que mudou, quando e porquê, com dados", "Impressionar", "Substituir o journal"], 1, "Permite perceber o que mudou quando os resultados mudam."),
        tf("Podes misturar dados de versões diferentes do método para aumentar a amostra.", false, "Mistura experiências; cada versão precisa da sua própria amostra."),
        mc("Qual destas secções pertence a uma página de setup?", ["Quando NÃO usar", "Saldo da conta", "Número de série da plataforma", "Cor preferida"], 0, "Saber quando não usar um setup é parte essencial do método."),
        tf("O playbook deve incluir o que realmente fazes, não o que gostarias de fazer.", true, "Só um documento verdadeiro serve de base para melhorar."),
      ],
    },
    {
      slug: "execucao-avancada",
      title: "Execução avançada: ordens, liquidez e contratos",
      summary: "Tipos de ordem, qualidade da execução, momentos de baixa liquidez e a escolha do contrato.",
      minutes: 8,
      content: `Boa análise com má execução dá mau resultado. A **execução** inclui o tipo de ordem, o momento e o contrato escolhidos.

## Tipos de ordem (conceitos gerais)
As definições exatas e os comportamentos **variam por corretora e plataforma** — confirma sempre na documentação da tua.
- **A mercado:** executa de imediato ao melhor preço disponível; **garante execução**, **não garante preço** (slippage);
- **Limite:** executa só ao preço indicado ou melhor; **garante preço**, **não garante execução**;
- **Stop (a mercado):** fica pendente e, ao ser tocado o nível, torna-se uma ordem a mercado — usado para **stop loss** e **entradas de rompimento**;
- **Stop-limite:** ao tocar o nível, torna-se uma ordem limite; pode **não executar** em movimentos rápidos;
- **OCO / bracket:** ordens ligadas (por exemplo, stop e alvo): quando uma executa, a outra cancela.

## Qualidade da execução
- **Slippage:** diferença entre o preço esperado e o executado; pior em volatilidade e baixa liquidez;
- **Spread:** custo implícito; alarga em horas de pouca liquidez e em notícias;
- **Fills parciais:** em tamanhos grandes ou mercados finos, a ordem pode ser executada em partes;
- **Latência e falhas técnicas:** ter um plano B (como fechar a posição se a plataforma falhar).

## Momento da execução
- **Evita** os segundos antes e depois de dados de **alto impacto**, salvo se o plano o prevê;
- **Cuidado** com aberturas e fechos de sessão, quando o spread e a volatilidade mudam;
- **Fora do horário principal**, a liquidez é menor — confirma horários e margem **com a corretora**.

## Escolha e rolagem do contrato
- **YM** ($5 por ponto) e **MYM** ($0,50 por ponto) seguem o ciclo **trimestral** de vencimentos (março, junho, setembro e dezembro) — confirmado por excerto do CME em 2026-10-06;
- Os traders migram para o **próximo contrato** (rolagem) perto do vencimento: regras e datas precisas devem ser **confirmadas no CME e na corretora**;
- **Contrato errado** = preços e valores diferentes: verifica o **mês** antes de enviar a ordem.

## Checklist de execução
1. Contrato e mês corretos;
2. Tamanho correto (calculadora);
3. Stop e alvo enviados **com** a entrada (ou imediatamente a seguir);
4. Evento de alto impacto próximo? Plano aplicado;
5. Plano B para falhas técnicas.`,
      example: `Entrada de rompimento em MYM, com stop a 30 pontos e **5 contratos**:

- **Ordem de stop** em 39.050: o preço salta para 39.056 e executa a **39.056** (**6 pontos** de slippage): custo extra = 6 × $0,50 × 5 = **$15**;
- **Alternativa:** ordem **limite** em 39.050: **não executa** porque o preço nunca volta — **oportunidade perdida**, mas sem slippage.

Nenhuma é "a certa": a escolha depende do **método** e do **custo de não entrar** vs **custo de entrar pior**. O importante é decidi-la **antes** e **medi-la** no journal (slippage médio por tipo de ordem).`,
      takeaways: ["Ordem a mercado garante execução, não preço; ordem limite garante preço, não execução.", "A qualidade da execução depende de slippage, spread, liquidez e plano B para falhas técnicas.", "Confirma o mês do contrato (ciclo trimestral Mar/Jun/Sep/Dec) e as regras de rolagem no CME e na corretora."],
      quiz: [
        mc("O que garante uma ordem a mercado?", ["O preço", "A execução (não o preço)", "Nada", "O alvo"], 1, "Executa de imediato, com possível slippage."),
        mc("O que garante uma ordem limite?", ["O preço (ou melhor), mas não a execução", "A execução a qualquer preço", "O lucro", "O stop"], 0, "Pode não executar se o preço não for atingido."),
        num("MYM, 5 contratos, slippage de 6 pontos. Custo extra, em dólares?", 15, 0, "$", "6 × $0,50 × 5 = $15."),
        tf("Os meses dos contratos YM e MYM seguem o ciclo trimestral (março, junho, setembro, dezembro).", true, "Confirmado por excerto do CME em 2026-10-06."),
      ],
    },
    {
      slug: "esquemas-conflitos-e-etica",
      title: "Esquemas, conflitos de interesse e ética",
      summary: "Como reconhecer promessas enganosas e porque a honestidade é uma vantagem competitiva.",
      minutes: 7,
      content: `O mundo do trading é cheio de **marketing agressivo**. Reconhecer padrões de esquema protege o teu capital e a tua saúde.

## Sinais de alarme
- **Promessas** de ganhos certos, de operações sem perdas ou de "retornos mensais fixos";
- **Win rates** altíssimos sem metodologia verificável;
- **"Estratégia secreta"** que só se revela depois de pagar;
- **Pressão de tempo** ("só hoje", "últimas vagas");
- **Cópia de sinais** ou "copy trading" vendidos como garantia;
- **Contas "geridas"** com retorno prometido;
- **Pedidos** para depositares num broker **específico** ou não regulado;
- **Prints** de resultados sem **dados verificáveis**.

## Princípios de defesa
1. **Duvida** de qualquer promessa de resultado;
2. **Verifica** a regulação da entidade (regulador do teu país) e a **política de reembolso**;
3. **Nunca** partilhes passwords ou chaves de API;
4. **Não assumes** dívidas para operar;
5. **Procura** informação em **fontes primárias**: exchange (CME), reguladores e documentação da tua corretora (ver a página "Fontes de Aprendizagem");
6. **Pergunta**: *"Qual é o incentivo de quem me diz isto?"*

## Conflitos de interesse
- **Afiliados** e comissões em recomendações de corretoras ou ferramentas;
- **Educadores** que ganham quando perdes (margens de CFD, vendas de cursos);
- **Influenciadores** que mostram só os dias bons.

## A tua ética
- **Honestidade** nos teus registos (journal, estatísticas);
- **Respeito pelos outros:** não vendas o que não sabes provar;
- **Responsabilidade:** tu decides e assumes o risco; não culpas terceiros por perdas;
- **Humildade:** o mercado corrige a arrogância.

## Nota legal
Esta plataforma é **educativa**. Não presta aconselhamento financeiro, não emite **sinais** e não promete **resultados**. Futuros usam **alavancagem** e podem causar perdas **superiores** ao capital investido; confirma o enquadramento fiscal e legal **do teu país**.`,
      example: `Anúncio fictício: *"Aprende o método secreto de acerto quase perfeito e fatura milhares por semana, vagas limitadas — só hoje!"*

Verificação:
- **Promessa de resultado** (milhares por semana) → alarme;
- **Taxa de acerto** quase perfeita sem dados → alarme;
- **Método secreto** → alarme;
- **Pressão de tempo** → alarme.

**Quatro sinais em duas linhas.** A resposta correta é **não pagar** e, se te sentires tentado, **falar com alguém** antes. A educação séria **mostra** os números, as limitações e os riscos.`,
      takeaways: ["Sinais de alarme: ganhos prometidos, taxas de acerto altíssimas, métodos secretos, pressão de tempo, contas geridas.", "Verifica regulação, incentivos e fontes primárias; nunca partilhes passwords ou chaves.", "A plataforma é educativa: sem sinais, sem aconselhamento e sem promessas."],
      quiz: [
        tf("Um anúncio que promete retornos mensais fixos é um sinal de alarme.", true, "Os resultados em trading são incertos; promessas fixas são típicas de esquemas."),
        mc("Qual é a melhor fonte para confirmar especificações de um contrato?", ["Um influenciador", "A documentação oficial da exchange (por exemplo, CME)", "Um grupo de chat", "Um vídeo qualquer"], 1, "Fontes primárias são a referência."),
        mc("O que fazer perante pressão de tempo ('só hoje')?", ["Pagar de imediato", "Respirar, verificar e decidir sem pressa", "Partilhar a password", "Pedir um empréstimo"], 1, "A pressão serve para impedir a verificação."),
        tf("Podes partilhar chaves de API com quem gere a tua conta para ele operar por ti, se prometer bons resultados.", false, "Nunca partilhes credenciais; promessas de resultados são um sinal de alarme."),
      ],
    },
    {
      slug: "melhoria-continua",
      title: "Melhoria contínua e prática deliberada",
      summary: "Um sistema de revisão e aprendizagem que dura anos: métricas, hábitos e limites.",
      minutes: 7,
      content: `Quem melhora é quem **mede, revê e ajusta** durante anos — não quem procura o próximo truque.

## Prática deliberada
- **Objetivo específico** ("hoje treino reteste de nível"), não "treinar trading";
- **Feedback imediato** (Process Score, journal, aderência);
- **Esforço no limite** da tua competência (dificuldade crescente);
- **Repetição** com correção.

## Métricas de acompanhamento (processo primeiro)
1. **Aderência ao plano** (% de trades com plano seguido);
2. **Process Score médio** (Replay/Simulador) e **avaliação de processo** (journal);
3. **% de entradas emocionais**;
4. **Disciplina de limites** (dias em que respeitaste perda máxima e máximo de trades);
5. **R médio** e **drawdown** (como contexto, não como objetivo);
6. **Horas de estudo e de prática** (qualidade, não só quantidade).

## Rotina
- **Diária:** plano antes, journal depois;
- **Semanal:** estatísticas e uma mudança;
- **Mensal:** revisão de processo vs resultado e decisão sobre o playbook;
- **Trimestral:** pergunta grande — *"Continuo a querer isto? O que aprendi? O que falta?"*

## Aprender com outros (com cuidado)
- **Mentores e comunidades** podem acelerar, mas **cada um tem incentivos**;
- **Sê cético** com resultados exibidos; **exige** processo e dados;
- **Procura** pessoas que falem de **risco** e de **erros**, não só de lucros.

## Saúde e equilíbrio
Sono, exercício, relações e **pausas** fazem parte do sistema. Se o trading te prejudica, **pára** e procura ajuda (módulo 19).

## Aceitar a incerteza
Não tens de **prever** o mercado. Tens de **decidir com informação**, **gerir o risco** e **aprender**. Esse é o ciclo que se repete — **sem garantias**, mas com **melhoria real do processo**.`,
      example: `Painel mensal fictício:

| Métrica | Mês 1 | Mês 2 | Mês 3 |
|---|---|---|---|
| Plano seguido | 62% | 74% | 85% |
| Process Score médio | 66 | 72 | 79 |
| Entradas emocionais | 28% | 19% | 9% |
| Dias com limites respeitados | 14/20 | 17/20 | 19/20 |
| R médio | −0,08 | +0,02 | +0,05 |

O **processo** melhorou **em todos os indicadores**. O R médio ainda é pequeno e variável: **três meses são uma amostra curta**. O trader decide **continuar em demo** mais um trimestre, com a meta de **processo ≥ 80** e **entradas emocionais < 10%**.`,
      exercise: { kind: "reflection", prompt: "Escolhe 3 métricas de processo para acompanhar nos próximos 30 dias e define a meta de cada uma. Quando vais rever?", placeholder: "Métrica 1: … meta … revisão em …" },
      takeaways: ["Prática deliberada: objetivo específico, feedback imediato, dificuldade crescente e repetição.", "Acompanha primeiro métricas de processo (aderência, Process Score, entradas emocionais, limites).", "Rotina diária, semanal, mensal e trimestral; saúde e equilíbrio fazem parte do sistema."],
      quiz: [
        mc("Qual destas é uma métrica de processo?", ["Saldo da conta", "% de trades com plano seguido", "Número de seguidores", "Lucro do mês"], 1, "Mede o comportamento controlável."),
        tf("Três meses de melhoria de processo provam que o método dará lucro.", false, "Mostram melhoria de execução; os resultados continuam incertos."),
        mc("O que caracteriza a prática deliberada?", ["Repetição sem objetivo", "Objetivo específico, feedback imediato e dificuldade crescente", "Operar o máximo possível", "Copiar traders"], 1, "Foca-se em melhorar uma competência de cada vez."),
        tf("Equilíbrio, sono e pausas fazem parte do sistema de um trader.", true, "A qualidade das decisões depende do estado físico e mental."),
      ],
    },
    {
      slug: "preparar-a-avaliacao-final",
      title: "Preparar a avaliação final",
      summary: "O que a avaliação final mede, como pensar cada um dos 12 passos e como se pontua o processo.",
      minutes: 8,
      content: `A **avaliação final** junta tudo: recebes um **gráfico histórico desconhecido (DEMO)** e percorres, em ordem, **12 passos** de decisão. No fim, o sistema devolve uma análise educativa do **processo** — **não** do resultado.

## Os 12 passos
1. **Tendência** — identifica o contexto;
2. **Estrutura** — HH/HL, LH/LL, lateral ou mudança;
3. **Suporte/Resistência** — níveis e zonas relevantes;
4. **Oferta e procura** — zonas de desequilíbrio;
5. **Fibonacci** — aplicação ao movimento dominante;
6. **Confluência** — fatores presentes e ausentes;
7. **Liquidez** — onde estão os stops óbvios;
8. **Entrada** — direção e preço;
9. **Stop loss** — invalidação;
10. **Take profit** — alvo e R:R;
11. **Tamanho da posição** — contratos pelo risco;
12. **Razão do trade** — porquê, e o que invalida.

## Como é avaliada
Cada passo tem **critérios objetivos** (por exemplo, o stop está do lado certo? o R:R é ≥ 1,5? o tamanho respeita o risco definido? a razão inclui uma invalidação?). O resultado **não entra** na pontuação: dois alunos com o mesmo processo e resultados diferentes têm **a mesma nota**.

## Depois da submissão
O sistema mostra:
- a **leitura educativa** do gráfico (factos calculados: estrutura, níveis, ATR…);
- a **avaliação de cada passo**, com comentários;
- **"o que aconteceu a seguir"** — apresentado como **informação**, não como nota.

## Como te preparares
1. **Revê** os módulos 4–11 (leitura) e 16–17 (setups e risco);
2. **Pratica** no Replay: marca, decide e avalia;
3. **Usa** a calculadora de posição;
4. **Escreve** sempre a razão e a invalidação;
5. **Aceita** que "não operar" pode ser uma conclusão — se o processo o justificar, escreve-o;
6. **Respira**: não é um exame de memória, é uma demonstração de processo.

## As três perguntas centrais
- **Antes:** *"Porque estou a considerar este trade?"*
- **Durante:** *"O que invalidaria a minha tese?"*
- **Depois:** *"O meu processo foi correto, independentemente do resultado?"*`,
      example: `Resposta de processo fraco (fictícia): *"Comprei porque estava a subir. Stop em 38.900, alvo 40.000."* → sem estrutura, sem níveis, sem invalidação, R:R irrealista.

Resposta de processo forte (fictícia): *"Tendência de alta em HH/HL; recuo de 50–61,8% a zona de procura coincidente com S/R flip e equal lows varridos (liquidez). Entrada 39.001, stop 38.961 (abaixo do swing low), alvo 39.081 (R:R 2,0). Risco 1% = $100 → 5 MYM. Invalida: fecho abaixo de 38.961 ou quebra do último HL."*

A segunda **explica**, **delimita o risco** e **admite o que a invalidaria**: o que a avaliação procura, mesmo que o trade acabasse em perda.`,
      exercise: { kind: "link", href: "/assessment", label: "Abrir a avaliação final", prompt: "Quando tiveres concluído os níveis anteriores, a avaliação final desbloqueia-se aqui. Lê as instruções com calma." },
      takeaways: ["A avaliação final percorre 12 passos num gráfico DEMO desconhecido e avalia o processo, não o resultado.", "O que aconteceu depois é informativo; não conta para a nota.", "Escreve sempre a razão, o risco e a invalidação — e aceita 'não operar' se o processo o justificar."],
      quiz: [
        mc("O que avalia a avaliação final?", ["Se o trade ganhou", "A qualidade do processo de decisão", "A velocidade", "O número de desenhos"], 1, "O resultado não entra na nota."),
        tf("Dois alunos com o mesmo processo e resultados diferentes têm notas diferentes.", false, "A nota depende do processo; o resultado é apenas informativo."),
        mc("Qual das três perguntas centrais é 'durante o trade'?", ["Porque estou a considerar este trade?", "O que invalidaria a minha tese?", "O meu processo foi correto?", "Quanto vou ganhar?"], 1, "Saber o que invalida a tese é a pergunta de gestão durante o trade."),
        num("A avaliação final tem quantos passos de decisão?", 12, 0, "passos", "Vão da tendência à razão do trade: 12 passos."),
      ],
    },
  ],
  quiz: {
    title: "Quiz do módulo — Professional Development",
    passScore: 70,
    questions: [
      mc("Qual é a ordem sensata para desenvolver uma estratégia?", ["Teste e depois hipótese", "Observação, hipótese, regras, teste, revisão", "Execução real primeiro", "Copiar sinais"], 1, "Cada etapa fundamenta a seguinte."),
      tf("Mais parâmetros tornam uma estratégia mais robusta.", false, "Aumentam o risco de sobreajuste."),
      mc("Para que serve o changelog do playbook?", ["Para impressionar", "Para registar o que mudou, quando e porquê", "Para substituir o journal", "Para nada"], 1, "Permite entender o efeito das alterações."),
      mc("O que garante uma ordem limite?", ["Execução", "O preço (ou melhor), mas não a execução", "O lucro", "Nada"], 1, "Pode não ser executada."),
      num("MYM, 5 contratos, slippage de 6 pontos. Custo extra em dólares?", 15, 0, "$", "6 × $0,50 × 5 = $15."),
      tf("YM e MYM seguem um ciclo trimestral de vencimentos (março, junho, setembro e dezembro).", true, "Confirmado por excerto oficial do CME em 2026-10-06."),
      tf("Uma promessa de retornos mensais fixos é um sinal de alarme.", true, "Os resultados são incertos; promessas fixas são típicas de esquemas."),
      mc("Qual destas é uma métrica de processo?", ["Lucro do mês", "% de trades com plano seguido", "Seguidores", "Saldo"], 1, "Mede o comportamento controlável."),
      mc("Quantos passos tem a avaliação final?", ["6", "8", "12", "20"], 2, "Da tendência à razão do trade."),
      tf("O que aconteceu depois da decisão conta para a nota da avaliação final.", false, "É apresentado como informação; a nota mede o processo."),
    ],
  },
};
