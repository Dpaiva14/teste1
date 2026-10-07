import { chart, mc, num, rr, tf } from "../dsl";
import type { ModuleDef } from "../types";

/**
 * Module 10 — Liquidity (Level 4).
 * Rule of the module: separate what is OBSERVABLE on a chart from THEORY about who does what.
 * No "smart money" mysticism, no claim of institutional behaviour, no guarantees.
 */
export const liquidity: ModuleDef = {
  slug: "liquidity",
  number: 10,
  level: 4,
  title: "Liquidity",
  summary: "Máximos e mínimos iguais, PDH/PDL e níveis de sessão, clusters de stops, varrimento de liquidez, falso rompimento e rompimento/reteste — separando o observável das teorias.",
  difficulty: "FOUNDATION",
  icon: "Droplets",
  lessons: [
    {
      slug: "o-que-e-liquidez-no-grafico",
      title: "O que é liquidez (e as duas formas de falar dela)",
      summary: "Liquidez de mercado versus 'zonas de liquidez' no gráfico — e o que é observável.",
      minutes: 6,
      content: `A palavra **liquidez** tem dois usos que convém separar.

## 1. Liquidez de mercado
É a **facilidade de comprar e vender** sem mexer muito no preço: muitos participantes, spreads pequenos, ordens executadas perto do preço desejado. Os futuros do Dow são muito líquidos em horário de maior atividade; fora dele a liquidez diminui.

## 2. "Zonas de liquidez" no gráfico
Uma expressão popular para **regiões onde se supõe existirem muitas ordens à espera**: stops de quem está posicionado, ordens de entrada em rompimentos, alvos. Exemplos: máximos e mínimos iguais, PDH/PDL, extremos de sessão, números redondos.

## O que é observável vs o que é teoria
- **Observável:** o preço **reagiu** repetidamente naquele ponto; o preço **ultrapassou** o ponto e **voltou**; houve uma **expansão rápida** depois de lá chegar;
- **Teoria:** "foram stops de varejo a serem caçados", "foi um grande participante a acumular". Estas **histórias** podem fazer sentido, mas **não se observam** num gráfico de preço e **não têm garantia**.

## Porque é útil
Pensar em liquidez ajuda a perguntar: "**onde é que muita gente pode ter ordens?**" — e logo "**o que acontece ao preço quando lá chega?**". É uma lente para **planear cenários**, não um mapa do que "vai" acontecer.

> Neste módulo, cada conceito é apresentado como: **o que vês**, **a hipótese que o explica** e **como proteger o risco se a hipótese falhar**.`,
      example: `Num mercado em que o preço rejeitou **três vezes** a zona de 38.600 (máximos quase iguais), é natural que muitas pessoas tenham stops **acima** (de vendedores) ou ordens de compra de rompimento. Isso é uma **hipótese**.

O que **observas**: o preço chega, reage (ou fura e volta). O que **fazes**: planeias os dois cenários — se **romper e aguentar**, ...; se **furar e voltar**, ... — e defines a invalidação de cada um.`,
      takeaways: ["Liquidez de mercado = facilidade de negociar; 'zonas de liquidez' = regiões onde se supõem muitas ordens.", "O que se observa: reações, varrimentos e expansões; histórias sobre quem faz o quê são teorias.", "Usa o conceito para planear cenários e proteger o risco, não para prever."],
      quiz: [
        mc("Qual é o significado de liquidez de mercado?", ["Dinheiro do trader", "Facilidade de comprar e vender sem mexer muito no preço", "O volume do dia anterior", "O spread do broker"], 1, "Liquidez é a facilidade de negociar perto do preço desejado."),
        tf("É possível observar num gráfico de preço quem está a 'caçar stops'.", false, "O gráfico mostra o que o preço fez; quem o fez e porquê é interpretação."),
        mc("Qual é um uso razoável do conceito de zonas de liquidez?", ["Prever com certeza o próximo movimento", "Perguntar onde pode haver muitas ordens e planear cenários para quando o preço lá chegar", "Eliminar o stop", "Dobrar a posição"], 1, "É uma lente para planear cenários e risco."),
      ],
    },
    {
      slug: "maximos-e-minimos-iguais",
      title: "Máximos e mínimos iguais (equal highs / equal lows)",
      summary: "Quando o preço rejeita o mesmo nível várias vezes — o que se vê e o que se supõe.",
      minutes: 6,
      content: `Dois ou mais swings, **no mesmo nível (ou quase)**, formam **máximos iguais** (*equal highs*) ou **mínimos iguais** (*equal lows*).

## O que se observa
- O preço **rejeitou** esse nível mais de uma vez;
- Os swings **não coincidem ao ponto** — há uma pequena tolerância (usa uma regra: por exemplo, dentro de **0,2–0,3 × ATR**);
- Entre os toques, houve **afastamento** claro (não é só ruído).

## A hipótese comum
Muitos participantes colocam **stops** logo acima de máximos iguais (quem vende) ou logo abaixo de mínimos iguais (quem compra), e **ordens de rompimento** do lado oposto. Isso concentraria ordens, tornando o nível um **ímã** de atenção.

É uma **hipótese razoável**, mas não é garantia: muitos máximos iguais **rompem e continuam**; outros **são varridos e invertem**; outros aguentam como resistência.

## Duas leituras possíveis
1. **Como resistência/suporte** (o nível rejeita outra vez);
2. **Como alvo de rompimento ou de varrimento** (o preço vai lá e age).

Em ambos os casos, a pergunta é a mesma: **o que faz o preço quando chega?**

## Como usar
- Marca-os como **zonas** (como em S/R);
- Planeia os **dois** cenários;
- Define a invalidação e o tamanho **antes**;
- Não os trates como "paredes": um máximo igual é um nível entre vários.`,
      example: `No gráfico de lado, o preço rejeita **38.600**, **38.605** e **38.595** — três máximos iguais com uma tolerância de ±5 pontos (0,1 × ATR de 50). Zona de interesse: **38.585–38.625**.

Cenário A: rompe e fecha acima de 38.625 → ideia de continuação, invalidação de volta abaixo de 38.585.
Cenário B: fura 38.625 e volta para dentro → **varrimento**/falso rompimento, ideia de reversão com stop acima do pavio.`,
      visual: { kind: "scenario", scenarioId: "levels-range-01", annotations: "none", caption: "Três máximos quase iguais perto de 38.600 e três mínimos perto de 38.300." },
      takeaways: ["Equal highs/lows = rejeições repetidas no mesmo nível, com tolerância definida por regra.", "A hipótese é a concentração de stops e ordens de rompimento; é razoável mas não garantida.", "Planeia os dois cenários: respeita como nível ou é rompido/varrido."],
      quiz: [
        chart("IDENTIFY_SUPPORT_RESISTANCE", "levels-range-01", "Os três máximos quase iguais perto de 38.600 neste gráfico são um exemplo de…", ["Máximos iguais (zona onde se supõem ordens acumuladas)", "Um gap", "Um rompimento", "Um indicador"], 0, "Rejeições repetidas na mesma zona formam máximos iguais."),
        tf("Máximos iguais garantem que o preço vai varrer o nível e inverter.", false, "Podem ser rompidos e continuar, varridos e invertidos, ou respeitados como resistência."),
        num("ATR = 50 pontos. Qual é a tolerância de 0,3 × ATR para considerar máximos 'iguais', em pontos?", 15, 0, "pontos", "0,3 × 50 = 15 pontos."),
        mc("O que fazer antes de agir num nível de máximos iguais?", ["Entrar à cega", "Planear os cenários de rompimento e de varrimento e definir invalidação e tamanho", "Mover o stop", "Aumentar o risco"], 1, "Dois cenários, duas invalidações, risco definido antes."),
      ],
    },
    {
      slug: "pdh-pdl-e-niveis-de-sessao",
      title: "PDH, PDL e extremos de sessão como referências",
      summary: "Os níveis objetivos que todos veem — e o que costuma acontecer quando o preço lá chega.",
      minutes: 6,
      content: `Alguns níveis são especialmente relevantes **porque são objetivos**: qualquer pessoa os encontra no gráfico.

- **PDH / PDL** — máximo e mínimo do dia anterior;
- **PWH / PWL** — da semana anterior;
- **Máximo/mínimo de sessão** — por exemplo, o extremo da sessão asiática ou o da abertura de Nova Iorque;
- **Máximo/mínimo de um range recente**.

## Porque se observam
Por serem óbvios, atraem **stops**, **alvos** e **ordens de rompimento** — logo, é natural que haja **mais atividade** quando o preço lá chega. É uma hipótese comportamental, não uma lei.

## Possíveis comportamentos ao chegar a um destes níveis
1. **Rejeição** — o preço toca e recua;
2. **Rompimento e continuação** — fecha para lá e mantém;
3. **Varrimento** — fura e volta rapidamente para dentro;
4. **Lateralização** — fica a oscilar à volta do nível.

Não se sabe qual **antes**. Por isso se planeia com **cenários** e com **invalidação**.

## Boas práticas
- **Marca-os antes** da sessão (no Daily Trading Plan);
- **Define o teu "dia"** (fuso horário e hora de corte) — o PDH muda consoante a convenção;
- Dá mais peso a níveis que **coincidem** com outros fatores;
- Sê particularmente cauteloso em **aberturas** e **notícias**, quando a volatilidade pode furar tudo sem lógica técnica.`,
      example: `PDH = **39.180**, PDL = **38.920**. De manhã, o preço sobe até **39.190** (10 pontos acima do PDH) e fecha o candle em 39.150.

Isto **pode** ser: um varrimento (se continuar a descer), uma pausa antes de romper (se retestar e subir) ou ruído. O plano condicional: **se** fechar abaixo de 39.150 e quebrar o último HL, ideia de reversão com stop acima de 39.195; **se** fechar acima de 39.190 e o reteste aguentar, continuação.`,
      exercise: { kind: "link", href: "/tools/daily-plan", label: "Abrir o Daily Trading Plan", prompt: "Marca PDH, PDL, PWH, PWL e extremos de sessão antes da próxima sessão." },
      takeaways: ["PDH/PDL e extremos de sessão são níveis objetivos que atraem atenção.", "Ao chegar lá, o preço pode rejeitar, romper, varrer ou lateralizar.", "Marca-os antes da sessão, define a tua convenção de dia e planeia cenários."],
      quiz: [
        mc("Qual é uma razão para estes níveis atraírem atividade?", ["Garantia do broker", "São objetivos e muitos participantes os observam", "Têm sempre mais volume", "São definidos pelo CME"], 1, "Por serem óbvios, concentram ordens e atenção."),
        tf("Ao chegar ao PDH o preço inverte sempre.", false, "Pode rejeitar, romper, varrer ou lateralizar."),
        mc("Qual é uma boa prática com estes níveis?", ["Marcá-los a meio da sessão", "Marcá-los antes da sessão, com uma convenção de dia consistente", "Ignorá-los", "Mudá-los depois"], 1, "O planeamento antecipado evita decisões impulsivas."),
      ],
    },
    {
      slug: "varrimento-de-liquidez",
      title: "Varrimento de liquidez (liquidity sweep)",
      summary: "O preço fura um nível óbvio e volta — como o reconhecer sem o inventar depois.",
      minutes: 8,
      content: `Um **varrimento** (*sweep*) acontece quando o preço **ultrapassa** um nível óbvio (máximos iguais, PDH, extremo de sessão) e **volta rapidamente para dentro**, sem aceitação do lado de fora.

## O que se observa
1. Existe um **nível óbvio** (máximos/mínimos iguais, PDH/PDL...);
2. O preço **fura** o nível — normalmente com um pavio ou um candle curto;
3. O preço **volta** para dentro: o candle fecha de novo do lado de dentro, ou o seguinte reverte;
4. Muitas vezes, segue-se um **movimento forte** no sentido contrário.

## A hipótese
Quem tinha stops do lado de fora foi **executado**; essas ordens deram combustível ao movimento até esgotar; sem mais compradores/vendedores do lado de fora, o preço regressou. É uma **narrativa possível**, não uma prova.

## Como distinguir de um rompimento
| | Varrimento | Rompimento |
| --- | --- | --- |
| Fecho | volta para dentro | fecha fora e mantém |
| Retorno | rápido | só no reteste (se houver) |
| Seguimento | no sentido contrário | no mesmo sentido |

Só se **vê o desfecho depois**. Em tempo real, ambos começam por furar o nível.

## Como planear (condicional)
- Espera o **fecho de volta para dentro** (ou uma mudança de estrutura no timeframe inferior);
- **Stop** acima do pavio do varrimento (numa ideia de venda);
- **Alvo** na liquidez do lado oposto ou no meio do range;
- **Tamanho** pelo risco, que é o **pavio** + folga.

## Cuidado: o viés retrospetivo
No gráfico passado, tudo parece um varrimento perfeito — porque só vês os casos que **reverteram**. Os que **continuaram** parecem "rompimentos". Mede o teu método **em tempo real** (replay e backtests) antes de lhe dares crédito.`,
      example: `Máximos iguais em **39.100** (39.100 e 39.098). Um candle fura até **39.140** e fecha em **39.060**, de volta abaixo do nível. Os candles seguintes descem.

Plano educativo (**venda**): entrada em 39.060 após o fecho de volta para dentro; stop em **39.150** (pavio 39.140 + 10) → **90 pontos**; alvo em **38.880** → **180 pontos** → **R:R = 2:1**. Se o preço fechar acima de 39.150, a ideia **acabou** e o stop limita a perda.

Com MYM ($0,50/ponto) e risco de $90: 90 × $0,50 = $45 por contrato → **2 contratos**.`,
      visual: {
        kind: "candles",
        candles: [
          [39000, 39060, 38990, 39050],
          [39050, 39100, 39040, 39060],
          [39060, 39070, 39010, 39020],
          [39020, 39050, 39000, 39040],
          [39040, 39098, 39030, 39060],
          [39060, 39070, 39015, 39025],
          [39025, 39040, 39000, 39035],
          [39035, 39140, 39030, 39060],
          [39060, 39065, 38985, 38995],
          [38995, 39005, 38930, 38940],
          [38940, 38960, 38900, 38910],
        ],
        overlays: [
          { type: "hline", id: "eq", price: 39100, label: "Máximos iguais (~39.100)", tone: "warning", dashed: true },
          { type: "marker", id: "sweep", index: 7, price: 39140, label: "Varrimento", placement: "above", tone: "danger" },
        ],
        caption: "O preço fura os máximos iguais e fecha de volta para dentro; o movimento seguinte é descendente.",
        height: 320,
      },
      takeaways: ["Varrimento: fura um nível óbvio e volta para dentro sem aceitação fora; o desfecho só se vê depois.", "Planeia de forma condicional: espera o fecho de volta para dentro, stop para lá do pavio, alvo na liquidez oposta.", "Cuidado com o viés retrospetivo: testa em tempo real (replay/backtest)."],
      quiz: [
        mc("O que distingue um varrimento de um rompimento?", ["O volume", "No varrimento, o preço volta rapidamente para dentro sem aceitação fora", "A hora do dia", "A cor do candle"], 1, "A aceitação do lado de fora é o que torna um rompimento credível."),
        rr("Entrada 39.060 (venda), stop 39.150, alvo 38.880. Qual é o R:R?", 2, 0.01, "Alvo 180 ÷ stop 90 = 2,0."),
        num("Stop de 90 pontos, MYM ($0,50/ponto), risco máximo $90. Quantos contratos?", 2, 0, "contratos", "Risco por MYM = 90 × $0,50 = $45; $90 ÷ $45 = 2.", "POSITION_SIZE"),
        tf("Depois de ver varrimentos no gráfico passado, podes concluir que funcionam sempre.", false, "Vês sobretudo os casos que reverteram; sem teste em tempo real o viés retrospetivo engana."),
      ],
    },
    {
      slug: "falso-rompimento-vs-rompimento-reteste",
      title: "Falso rompimento vs rompimento com reteste",
      summary: "Um mapa de decisão para o momento em que o preço fura um nível — e onde fica o risco em cada caso.",
      minutes: 7,
      content: `Quando o preço fura um nível óbvio, há duas famílias de resposta — e **ambas** têm de estar no teu plano.

## Cenário 1 — Rompimento e reteste
O preço **fecha** para lá do nível, **mantém-se** e, ao regressar, o nível **segura** como suporte/resistência invertido.

- **Ideia:** continuação na direção do rompimento;
- **Gatilho:** reação no reteste (rejeição, mudança de estrutura no timeframe inferior);
- **Invalidação:** fecho de volta para dentro, para lá do nível;
- **Risco:** mais curto no reteste, mas pode perder-se o movimento se não houver reteste.

## Cenário 2 — Falso rompimento (varrimento)
O preço **fura** o nível, **não se mantém** e **volta para dentro**.

- **Ideia:** reversão ou regresso ao range;
- **Gatilho:** fecho de volta para dentro, estrutura a mudar no timeframe inferior;
- **Invalidação:** novo máximo/mínimo para lá do pavio do varrimento;
- **Risco:** o pavio define o stop — pode ser largo.

## Mapa de decisão
1. **Candle fecha fora do nível?**
   - Não → possível varrimento/rejeição: espera o desfecho;
   - Sim → passa para 2.
2. **Segue-se aceitação (fechos fora) ou regresso (fecho dentro)?**
   - Aceitação → espera o **reteste** e vê se segura;
   - Regresso → o rompimento falhou: avalia a ideia contrária.
3. **Em qualquer caso:** stop, tamanho e alvo **antes** de agir.

## O que NÃO fazer
- Entrar **no meio do movimento** sem plano;
- Mover o stop por "teimosia";
- Mudar de cenário a cada candle: decide **antes** o que o fará mudar de ideia.`,
      example: `Resistência em **39.050**; o preço fecha em **39.140** (rompimento). Há duas respostas possíveis, e **nenhuma** é prevista:

- **A:** sobe até 39.180, recua ao nível (39.045), segura e retoma → ideia de continuação; stop abaixo de 39.030 (**110 pontos** da entrada em 39.140).
- **B:** o candle seguinte fecha em 39.040, **abaixo** do nível → rompimento falhado, a ideia de compra acabou (stop acima do nível se alguém tivesse entrado) e passa a existir a possibilidade contrária.

O plano com os dois cenários **antes** reduz o risco de reação emocional.`,
      takeaways: ["Rompimento + reteste que segura e falso rompimento são as duas respostas a considerar.", "O mapa de decisão assenta no fecho e no que acontece a seguir; stop e tamanho antes da ação.", "Decide antes o que te faria mudar de ideia."],
      quiz: [
        mc("Num rompimento com reteste, qual é a invalidação típica?", ["O preço subir mais", "Fecho de volta para dentro, para lá do nível", "Passar uma hora", "O volume cair"], 1, "Se o nível rompido não segura, o rompimento falhou."),
        mc("Num falso rompimento, onde costuma ficar o stop de uma ideia contrária?", ["No meio do range", "Para lá do pavio do varrimento", "A 5 pontos", "Não há stop"], 1, "O pavio é o ponto onde a ideia deixa de fazer sentido."),
        tf("É possível saber de antemão se um rompimento é verdadeiro ou falso.", false, "Só se vê o desfecho depois; por isso se planeia com cenários."),
        chart("CHART_ANALYSIS", "levels-flip-01", "Neste gráfico, que desfecho teve o rompimento da resistência perto de 38.305?", ["Rompimento falso: voltou para dentro", "Rompimento seguido de reteste que segurou como suporte", "Nenhum rompimento", "Gap"], 1, "A zona foi rompida e depois segurou o reteste como suporte."),
      ],
    },
    {
      slug: "sem-misticismo-smart-money",
      title: "Sem misticismo: observação, hipótese e conclusão",
      summary: "Como falar de liquidez com rigor: o que se vê, o que se supõe e o que ficou por provar.",
      minutes: 6,
      content: `Há muito conteúdo online que fala de "*smart money*", "*stop hunts*" ou "*manipulação*" como se fossem **factos observáveis** e **garantias de comportamento**. Esta academia não ensina isso.

## Três camadas — mantê-las separadas
1. **Observação (o que se vê):** o preço tocou 39.100 três vezes; furou até 39.140 e fechou 39.060; desceu 180 pontos nos 8 candles seguintes;
2. **Hipótese (o que se supõe):** havia stops acima de 39.100 que foram executados; depois houve falta de compradores;
3. **Conclusão (o que se afirma):** "este tipo de sinal funciona X% das vezes" — **só com dados**.

A maioria dos conteúdos salta direto da observação para a conclusão, ignorando a hipótese e **nunca testa**.

## Porque tanto cuidado
- Não é possível saber **quem** compra ou vende a partir de um gráfico de preço;
- "Smart money" e "retail" são **etiquetas** conforme a história convém;
- Uma narrativa pode **explicar tudo depois** e **prever nada antes**;
- Resultados passados selecionados não provam vantagem.

## O que fazer
- Mantém a linguagem de **hipótese**: "pode", "uma possível explicação";
- Testa: **replay**, **backtests** com regras fixas, **journal** com todos os casos;
- Mede **amostra**, **expectancy** e **drawdown** — a validade vem dos números, não da narrativa;
- Aceita que o método pode **não funcionar** e que os custos (spread, slippage, comissões) o podem esmagar.

> Se um conteúdo promete que "os grandes jogadores fazem X" ou que "este padrão acerta em 90% dos casos", **desconfia**: sem dados verificáveis é marketing.`,
      example: `Duas frases sobre o mesmo gráfico:

- ❌ "Os bancos varreram os stops e agora vão levar o preço até 38.800."
- ✔ "O preço furou os máximos iguais em 39.100 e fechou de volta abaixo. Uma possível explicação é a execução de stops. Um plano condicional: venda abaixo de 39.060, stop acima de 39.150, alvo em 38.880. Vou registar o resultado no journal para medir esta ideia em N casos."

A segunda frase deixa claro o que **viu**, o que **supõe** e o que **vai testar**.`,
      takeaways: ["Mantém separadas observação, hipótese e conclusão; a conclusão exige dados.", "'Smart money' e 'stop hunt' são narrativas, não factos observáveis.", "Testa com replay, backtests e journal; a validade vem de amostra, expectancy e drawdown."],
      quiz: [
        mc("Qual é o passo que falta em muitos conteúdos sobre 'smart money'?", ["A observação", "O teste com dados que valide a conclusão", "O gráfico", "O stop"], 1, "Saltam da observação para a conclusão sem testar a hipótese."),
        tf("Um gráfico de preço permite saber qual participante comprou ou vendeu.", false, "O gráfico mostra preço e (opcionalmente) volume; não identifica participantes."),
        mc("Qual é a frase mais rigorosa?", ["Os bancos vão levar o preço a 38.800", "O preço furou o nível e fechou abaixo; uma possível explicação é a execução de stops; vou testar o plano em N casos", "Isto nunca falha", "Todos sabem o que vai acontecer"], 1, "Separa o que viu, o que supõe e o que vai testar."),
        mc("Qual é uma forma de testar uma ideia de varrimento?", ["Acreditar nos melhores exemplos", "Registar todos os casos no journal e testar em replay e backtests com regras fixas", "Esperar um sinal", "Perguntar a amigos"], 1, "A validade vem de dados completos, não de exemplos escolhidos."),
      ],
    },
  ],
  quiz: {
    title: "Quiz do módulo — Liquidity",
    passScore: 70,
    questions: [
      mc("O que são 'máximos iguais'?", ["Dois ou mais swings highs no mesmo nível, com pequena tolerância", "O máximo do dia", "Um gap", "Um indicador"], 0, "Rejeições repetidas na mesma zona, dentro de uma tolerância definida."),
      chart("IDENTIFY_SUPPORT_RESISTANCE", "levels-range-01", "Neste gráfico, os mínimos quase iguais perto de 38.300 são um exemplo de…", ["Mínimos iguais (zona onde se supõem ordens acumuladas)", "Um gap", "Um rompimento", "Um indicador"], 0, "Rejeições repetidas na mesma zona de baixo."),
      mc("O que caracteriza um varrimento?", ["O preço fecha fora e mantém", "O preço fura um nível óbvio e volta rapidamente para dentro", "Um gap de fim de semana", "Um candle sem pavios"], 1, "Furar sem aceitação e regressar."),
      mc("Qual é a invalidação típica de uma ideia de venda após um varrimento de máximos?", ["Abaixo do mínimo do dia", "Acima do extremo do pavio do varrimento", "Ao fim de 10 minutos", "Nenhuma"], 1, "Se o preço ultrapassa o pavio, o varrimento deixou de ser uma hipótese válida."),
      rr("Entrada 39.060 (venda), stop 39.140, alvo 38.900. Qual é o R:R?", 2, 0.01, "Alvo 160 ÷ stop 80 = 2,0."),
      tf("Os varrimentos ocorrem sempre e invertem sempre o preço.", false, "Não há garantia; podem ser rompimentos verdadeiros que continuam."),
      mc("Qual é a ordem correta das três camadas?", ["Conclusão, hipótese, observação", "Observação, hipótese, conclusão (com dados)", "Hipótese, conclusão, observação", "Só observação"], 1, "Primeiro o que se vê, depois a hipótese, e só com dados a conclusão."),
      mc("Num rompimento com reteste, o nível rompido…", ["Desaparece", "Pode funcionar como suporte/resistência invertido", "Passa a ser o stop", "É sempre falso"], 1, "É a inversão de papéis; pode também falhar."),
      num("Stop 80 pontos, MYM ($0,50/ponto), risco $100. Quantos contratos?", 2, 0, "contratos", "Risco por MYM = 80 × $0,50 = $40; $100 ÷ $40 = 2,5 → 2.", "POSITION_SIZE"),
      mc("Que cuidado se deve ter com a expressão 'smart money'?", ["Usar como facto", "Tratá-la como narrativa não observável, sem garantia", "Aumentar o tamanho", "Ignorar o risco"], 1, "É uma etiqueta, não um facto observável nem uma garantia."),
    ],
  },
};
