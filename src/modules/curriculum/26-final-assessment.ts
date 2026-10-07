import { chart, mc, num, sizing, tf } from "../dsl";
import type { ModuleDef } from "../types";

/**
 * Module 26 — Final Assessment (Level 10). The assessment itself lives at /assessment: an UNKNOWN DEMO chart, 12 steps,
 * 100 points of PROCESS (trend 8 · structure 8 · S/R 8 · supply/demand 7 · Fibonacci 7 · confluence 10 · liquidity 7 · entry 8 ·
 * stop 10 · target 8 · size 10 · reason 9). The market outcome is shown afterwards as information and never changes the grade.
 */
export const finalAssessment: ModuleDef = {
  slug: "final-assessment",
  number: 26,
  level: 10,
  title: "Final Assessment",
  summary: "Um gráfico desconhecido, 12 passos e uma avaliação do processo de decisão — não do resultado.",
  difficulty: "PROFESSIONAL",
  icon: "Trophy",
  lessons: [
    {
      slug: "a-filosofia-da-avaliacao",
      title: "A filosofia: processo antes de resultado",
      summary: "O que a avaliação final mede, o que ignora de propósito e as três perguntas que devias saber responder.",
      minutes: 6,
      content: `A avaliação final não tem uma "resposta certa de mercado". Recebes um **gráfico histórico desconhecido (DEMO)**, percorres um processo de decisão e o sistema devolve uma análise educativa **do teu processo**.

> **O objetivo não é prever o mercado. O objetivo é construir um processo de decisão repetível.**

## O que é avaliado
- **Coerência:** a tua tendência, estrutura, níveis e direção contam a mesma história?
- **Aplicação das regras:** o stop está na invalidação? o R:R é aceitável? o tamanho respeita o risco?
- **Honestidade:** os fatores de confluência que marcaste existem mesmo no teu plano?
- **Explicação:** consegues dizer **porquê** e **o que invalidaria** a tese?

## O que **não** é avaliado
- ✘ Se o preço, depois, foi para o teu alvo ou para o teu stop;
- ✘ Quanto terias ganho ou perdido;
- ✘ Qualquer "adivinha" do futuro.

O que aconteceu depois é mostrado **a seguir** à submissão, como informação (e como lembrete de que um bom processo pode perder e um mau pode ganhar).

## As três perguntas centrais
- **Antes:** *"Porque estou a considerar este trade?"*
- **Durante:** *"O que invalidaria a minha tese?"*
- **Depois:** *"O meu processo foi correto, independentemente do resultado?"*

## Não operar também é uma resposta
Podes concluir que a decisão certa é **esperar**. O plano continua a ser avaliado e a decisão tem de ser **coerente** com a tua própria confluência e com o R:R.

## Aviso
A nota é uma ferramenta de feedback **automática e baseada em regras transparentes**: verifica presença e coerência, não interpreta o texto de forma semântica. Os dados são sintéticos e a aprovação é **educativa** — não é certificação profissional nem garantia de resultados.`,
      example: `Dois alunos recebem o mesmo gráfico.

- **Aluno A:** identifica a tendência e a estrutura, marca níveis e zona de procura reais, aplica Fibonacci no swing certo, define stop abaixo do swing de invalidação, calcula 3 contratos pelo risco de 1% e escreve "se fechar abaixo de 38.905, a ideia fica errada". O preço, depois, atinge o stop.
- **Aluno B:** "comprei porque estava a subir", sem stop técnico, com o dobro do tamanho. O preço, depois, atinge o alvo.

Nota de processo: **A ≈ 100, B muito baixa**. O sistema mostra a continuação do preço nos dois casos — e **nenhum resultado altera a nota**.`,
      takeaways: ["A avaliação final mede o processo (coerência, regras, honestidade e explicação), não o resultado.", "Decidir esperar é uma resposta válida, desde que coerente com o teu próprio plano.", "As três perguntas: porquê, o que invalida a tese e se o processo foi correto."],
      quiz: [
        tf("Se o preço atingir o teu alvo depois da decisão, a nota de processo sobe.", false, "A nota usa apenas a informação visível; a continuação só é mostrada depois, como informação."),
        mc("Qual destas NÃO é uma das três perguntas centrais?", ["Porque estou a considerar este trade?", "O que invalidaria a minha tese?", "Quanto vou ganhar neste trade?", "O meu processo foi correto, independentemente do resultado?"], 2, "As três perguntas são sobre razão, invalidação e processo; nenhuma é sobre prever lucro."),
        tf("Concluir que o melhor é esperar pode ser uma resposta válida na avaliação.", true, "Desde que a decisão seja coerente com a confluência e o R:R do teu plano."),
        mc("Que tipo de aprovação dá esta avaliação?", ["Uma certificação profissional", "Uma aprovação educativa baseada no processo", "Uma garantia de lucro", "Um sinal de compra"], 1, "É educativa: não certifica nem garante resultados."),
      ],
    },
    {
      slug: "os-12-passos-na-pratica",
      title: "Os 12 passos na prática",
      summary: "Como se percorre cada passo, quantos pontos vale e os erros mais comuns.",
      minutes: 9,
      content: `A avaliação percorre **12 passos**, do contexto ao tamanho da posição, e soma **100 pontos de processo**.

| # | Passo | Pontos | O que se verifica |
|---|---|---|---|
| 1 | Tendência | 8 | Coerência com a leitura calculada (variação líquida e estrutura) |
| 2 | Estrutura | 8 | HH/HL, LH/LL ou lateral, face aos últimos swings |
| 3 | Suporte/Resistência | 8 | Níveis marcados coincidem com reações reais |
| 4 | Oferta/Procura | 7 | Zonas sobrepõem-se a partidas fortes de swings |
| 5 | Fibonacci | 7 | Extremos ancorados em swings e movimento relevante |
| 6 | Confluência | 10 | Fatores marcados vs verificados no teu plano |
| 7 | Liquidez | 7 | Equal highs/lows reais (ou reconhecer que não há) |
| 8 | Entrada | 8 | Direção vs tendência, localização e alcance |
| 9 | Stop | 10 | Lado certo, distância razoável e para lá do swing de invalidação |
| 10 | Take profit | 8 | R:R ≥ 1,5 e obstáculos no caminho |
| 11 | Tamanho | 10 | Contratos = orçamento ÷ risco por contrato, para baixo |
| 12 | Razão | 9 | Tese, invalidação, razão de entrada e decisão coerente |

## Como pensar cada bloco
1. **Contexto (1–2):** olha para o gráfico todo; se estiver ambíguo, aceita mais do que uma leitura, mas **mantém a coerência**;
2. **Mapa (3–5, 7):** marca poucas coisas, **ancoradas em swings reais**; marcar à toa custa pontos;
3. **Decisão (6, 8–10):** a confluência verifica-se contra o teu plano. Se marcas "Fibonacci", a entrada tem de estar na zona 38,2–78,6%;
4. **Risco (11):** orçamento = 1% de $10.000 = $100; risco por contrato = pontos do stop × $0,50. Contratos = orçamento ÷ risco por contrato, **arredondado para baixo**. Se der 0, a resposta é 0;
5. **Explicação (12):** escreve a tese e **o que a invalida**; escolhe uma razão de entrada honesta; decide **tomar** ou **esperar**.

## Erros comuns
- Stop **dentro** da estrutura (um reteste simples tira-te);
- **Marcar fatores** que o teu plano não suporta;
- **Arredondar** o tamanho para cima;
- Texto vazio ou sem invalidação;
- Escolher "tomar" com R:R abaixo de 1,5 e pouca confluência.`,
      example: `Plano **fictício** num gráfico DEMO (compra em MYM):

- **Contexto:** tendência de alta, estrutura HH/HL; último swing low em 38.925;
- **Mapa:** nível 38.950 (3 reações), zona de procura 38.935–38.975, pool de liquidez em 38.935 e Fibonacci do impulso 38.800 → 39.100 (zona 38,2–78,6% entre ≈38.864 e ≈38.985);
- **Entrada:** 38.960 · **Stop:** 38.905 (para lá do swing, 55 pontos) · **Alvo:** 39.100 (R:R ≈ 2,5);
- **Tamanho:** 55 × $0,50 = **$27,50** por contrato; $100 ÷ $27,50 = 3,6 → **3 contratos** (risco $82,50 = 0,83%);
- **Razão:** "recuo ao nível e à zona de procura, com Fibonacci e liquidez varrida"; **invalida:** "fecho abaixo de 38.905".

Um plano assim é **coerente em todos os passos**. Pode perder — e, mesmo assim, é um bom processo.`,
      exercise: { kind: "link", href: "/assessment", label: "Abrir a avaliação final", prompt: "Quando estiveres pronto, inicia a avaliação final. Podes repetir com um gráfico novo e o progresso fica guardado." },
      takeaways: ["A nota soma 100 pontos em 12 passos: o maior peso está em confluência, stop e tamanho (10 cada).", "As marcações têm de estar ancoradas em swings reais; a confluência verifica-se contra o teu próprio plano.", "Tamanho = orçamento ÷ risco por contrato, para baixo; se não couber nenhum contrato, a resposta é 0."],
      quiz: [
        sizing("Conta $10.000, risco 1%, MYM, stop de 40 pontos. Quantos contratos?", 5, "contratos", "Risco por MYM = 40 × $0,50 = $20; $100 ÷ $20 = 5."),
        sizing("Conta $10.000, risco 1%, MYM, stop de 55 pontos. Quantos contratos?", 3, "contratos", "Risco por MYM = 55 × $0,50 = $27,50; $100 ÷ $27,50 = 3,63 → 3."),
        mc("Qual é o peso do tamanho da posição na nota?", ["5 pontos", "7 pontos", "10 pontos", "20 pontos"], 2, "Stop, confluência e tamanho valem 10 pontos cada."),
        tf("Marcar fatores de confluência que o teu plano não suporta custa pontos.", false, "Custa: a avaliação verifica cada fator marcado contra o teu plano."),
        mc("Onde deve ficar o stop de uma compra para ser considerado bem colocado?", ["Dentro da estrutura, perto da entrada", "Para lá do swing de invalidação, com folga", "No preço de entrada", "Sempre a 10 pontos"], 1, "Dentro da estrutura, um reteste simples pode retirar-te."),
      ],
    },
    {
      slug: "depois-da-avaliacao",
      title: "Depois da avaliação: o que fazer com o relatório",
      summary: "Ler a nota com humildade, corrigir um ponto de cada vez e continuar o ciclo de melhoria.",
      minutes: 6,
      content: `O relatório mostra a **nota de processo**, os pontos de **cada passo** com a explicação, a verificação dos **fatores de confluência**, o **plano** (R:R, tamanho calculado vs o teu), o gráfico com a **leitura de referência** e, só no fim, **o que aconteceu a seguir**.

## Como ler
1. **Começa pelos passos fracos:** a nota resume-se a onde perdeste pontos;
2. **Compara** a tua leitura com a de referência — mas lembra-te de que é **calculada por regras simples**; num gráfico ambíguo, outra leitura pode ser defensável;
3. **Vê a coerência** entre passos: a direção, a confluência e a razão contam a mesma história?
4. **Só depois** olha para o resultado e **separa** o que decidiste do que o mercado fez.

## O que fazer a seguir
- **Corrige um ponto** de cada vez (por exemplo, "stop sempre para lá do swing");
- **Regista** a tentativa no journal com a tua avaliação de processo (1–5) e uma lição;
- **Repete** com um gráfico novo — cada tentativa gera um gráfico diferente;
- **Usa** o Replay e o Backtesting para treinar o passo mais fraco;
- **Atualiza** o teu playbook se descobriste uma regra em falta.

## Sobre a aprovação
Concluir com processo **≥ 70/100** desbloqueia a conquista da avaliação final e o respetivo XP **uma única vez** — repetir não dá XP extra. Não existe "aprovação" que garanta lucro: o objetivo é **processo repetível**.

## E agora?
O fim do curso é o início da prática: **demo**, journal, revisão semanal e, se algum dia decidires, tamanho mínimo com limites estritos e **sem promessas de ninguém**. A plataforma é educativa; os futuros usam alavancagem e podem causar perdas superiores ao capital investido.`,
      example: `Relatório fictício (nota **74/100**, "bom"):

- Pontos perdidos: **Stop (6/10)** — o stop ficou dentro da estrutura; **Fibonacci (4/7)** — extremos sem swing real; **Razão (6/9)** — invalidação curta;
- Confluência: marcaste 5 fatores, 4 verificados; "Liquidez" sem suporte;
- Resultado a seguir: o preço atingiu o alvo (+2R) — **informação**, sem efeito na nota.

Ação: nas próximas 20 decisões de Replay, **stop sempre para lá do swing de invalidação** e **Fibonacci só entre swings reais**. Depois, uma nova tentativa da avaliação — para medir a mudança, não para "ganhar".`,
      takeaways: ["Lê o relatório pelos passos fracos, depois pela coerência entre passos e só no fim pelo resultado.", "Corrige um ponto de cada vez, regista no journal e repete com um gráfico novo.", "O XP da avaliação é pago uma só vez; o objetivo é um processo repetível, sem promessas."],
      quiz: [
        mc("Por onde começar a ler o relatório?", ["Pelo resultado do preço a seguir", "Pelos passos onde perdeste pontos", "Pelo XP", "Pela cor do gráfico"], 1, "A nota resume-se aos pontos perdidos."),
        tf("Repetir a avaliação várias vezes dá XP extra de cada vez.", false, "O XP da conclusão é pago uma única vez."),
        tf("A leitura de referência é a única interpretação possível de um gráfico ambíguo.", false, "É calculada por regras simples; outra leitura pode ser defensável."),
        mc("O que fazer depois de identificar um ponto fraco?", ["Mudar tudo no método", "Corrigir um ponto de cada vez e treinar no Replay", "Parar de estudar", "Aumentar o risco"], 1, "Mudanças pequenas e medidas permitem aprender."),
      ],
    },
  ],
  quiz: {
    title: "Quiz do módulo — Final Assessment",
    passScore: 70,
    questions: [
      tf("A avaliação final mede se o trade teria ganho ou perdido.", false, "Mede o processo; o resultado é só informação."),
      mc("Quantos passos tem a avaliação final?", ["8", "10", "12", "26"], 2, "Da tendência à razão do trade: 12 passos."),
      sizing("Conta $10.000, risco 1%, MYM, stop de 25 pontos. Quantos contratos?", 8, "contratos", "Risco por MYM = 25 × $0,50 = $12,50; $100 ÷ $12,50 = 8."),
      num("Entrada 39.000, stop 38.960, alvo 39.080. Qual é o R:R?", 2, 0.01, ":1", "Alvo 80 ÷ stop 40 = 2,0.", "CALCULATE_RR"),
      mc("Qual é o risco por trade usado na avaliação final?", ["0,25%", "1%", "5%", "10%"], 1, "A conta é de $10.000 com risco de 1% ($100)."),
      tf("Decidir esperar pode ser coerente se a confluência e o R:R não cumprem o limiar do teu plano.", true, "Esperar é uma decisão válida quando é coerente com o teu processo."),
      chart("VALID_SETUP", "conf-weak-long", "Observa o gráfico apresentado: este plano de compra cumpre um processo mínimo (confluência e R:R)?", ["Sim: tendência, estrutura e R:R estão alinhados", "Não: a compra vai contra a estrutura e o R:R é inferior a 1", "Sim, porque o preço acabou por subir", "Não é possível avaliar sem ver o futuro"], 1, "A estrutura é LH/LL e o R:R planeado é 0,6:1; que o preço tenha subido depois não valida o processo."),
      chart("VALID_SETUP", "conf-strong-long", "Observa o gráfico apresentado: que fator da confluência está em falta neste plano de compra?", ["Estrutura", "Oferta/procura", "Liquidez", "Price action"], 1, "A zona de procura fresca está longe do ponto de decisão; os restantes fatores estão presentes."),
      mc("Qual destas frases descreve melhor a nota da avaliação final?", ["Previsão do lucro", "Feedback automático sobre a qualidade do processo, baseado em regras transparentes", "Certificação profissional", "Sinal de compra ou venda"], 1, "É uma ferramenta educativa de feedback."),
      tf("Repetir a avaliação com um gráfico novo é possível e dá XP extra de cada vez.", false, "Podes repetir, mas o XP da conclusão é pago uma única vez."),
    ],
  },
};
