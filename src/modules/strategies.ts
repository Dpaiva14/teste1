/**
 * Strategies practised in the Backtesting Lab.
 *
 * These are ORIGINAL educational rule-sets used to practise consistency — they are not recommendations, they have
 * no demonstrated edge, and the lab runs on synthetic DEMO data, so no result here says anything about how a rule-set
 * would behave in a real market. The point of the lab is to practise applying written rules the same way every time.
 */
export interface StrategyDef {
  key: string;
  name: string;
  summary: string;
  /** Rules the student ticks BEFORE deciding. Used to measure adherence to the process, independently of the outcome. */
  rules: readonly string[];
  /** Situations in which this approach should be skipped. */
  avoidWhen: readonly string[];
}

export const STRATEGIES: readonly StrategyDef[] = [
  {
    key: "trend-pullback",
    name: "Pullback na tendência",
    summary: "Entrar a favor da tendência após um recuo a uma zona de valor, com confirmação.",
    rules: [
      "A estrutura do timeframe maior está definida (HH/HL ou LH/LL).",
      "O preço recuou para uma zona de valor (nível, 50–61,8% do impulso ou média).",
      "Há um sinal de confirmação na zona (rejeição, candle de reversão ou quebra do mini-recuo).",
      "O stop fica atrás do ponto que invalida o recuo, não num número arbitrário.",
      "O alvo tem pelo menos 2R de espaço livre até ao obstáculo seguinte.",
    ],
    avoidWhen: ["A estrutura está lateral ou confusa.", "O recuo já foi mais profundo do que 78,6% do impulso.", "O alvo ficaria logo abaixo de um nível forte contra a posição."],
  },
  {
    key: "range-breakout",
    name: "Rompimento de range",
    summary: "Esperar um range definido e agir apenas depois de um rompimento com fecho convincente.",
    rules: [
      "Existe um range com pelo menos 2 toques em cada extremo.",
      "O rompimento fechou fora do range (não apenas uma sombra).",
      "O candle de rompimento mostra convicção (corpo grande face ao ATR recente).",
      "O stop fica dentro do range, onde o rompimento deixa de fazer sentido.",
      "Não é o terceiro ou quarto rompimento falhado seguido.",
    ],
    avoidWhen: ["Os extremos do range foram rompidos e rejeitados várias vezes.", "O volume e a volatilidade estão a diminuir.", "O stop teria de ficar demasiado largo para o risco definido."],
  },
  {
    key: "level-rejection",
    name: "Rejeição em nível",
    summary: "Agir contra um nível relevante só quando o preço mostra rejeição clara.",
    rules: [
      "O nível foi marcado antes do preço lá chegar (e tem pelo menos 2 reações anteriores).",
      "O preço chegou ao nível e mostrou rejeição (sombra longa, engolfo ou falha em continuar).",
      "A direção da entrada é coerente com a estrutura do timeframe maior, ou a exceção está explicada.",
      "O stop fica logo além do nível, onde a rejeição deixa de ser válida.",
      "O alvo está no nível ou estrutura oposta com R:R ≥ 2.",
    ],
    avoidWhen: ["O preço chega ao nível com candles grandes e sem pausa (momentum forte).", "O nível foi criado há poucas barras e ainda não foi testado."],
  },
  {
    key: "sweep-reversal",
    name: "Sweep de liquidez + reversão",
    summary: "Depois de uma varredura de máximos/mínimos óbvios, procurar o regresso para dentro da estrutura.",
    rules: [
      "Existem máximos/mínimos iguais ou um extremo óbvio que o preço varreu.",
      "O preço fechou de volta para dentro do nível varrido (o sweep foi rejeitado).",
      "Há uma mudança de comportamento depois do sweep (quebra de mini-estrutura).",
      "O stop fica além do extremo do sweep.",
      "O alvo é a liquidez do lado oposto ou o meio do range, com R:R ≥ 2.",
    ],
    avoidWhen: ["O preço varreu o nível e continuou a fechar além dele (rompimento verdadeiro).", "Não há mudança de estrutura após o sweep."],
  },
  {
    key: "free-form",
    name: "Livre (as minhas regras)",
    summary: "Aplicar as tuas próprias regras escritas. O objetivo é verificar se as cumpres de forma consistente.",
    rules: [
      "Escrevi as minhas regras de entrada antes de começar a sessão.",
      "A entrada cumpre todas as minhas regras escritas.",
      "O stop está num ponto de invalidação, não num valor que 'dói menos'.",
      "O R:R planeado é de pelo menos 1,5.",
      "Se este fosse o décimo trade seguido com esta lógica, eu aceitava o risco.",
    ],
    avoidWhen: ["Não consegues descrever a regra em duas frases.", "A razão para entrar é emocional (FOMO, vingança, tédio)."],
  },
];

export function getStrategy(key: string): StrategyDef | undefined {
  return STRATEGIES.find((s) => s.key === key);
}

export const STRATEGY_KEYS = STRATEGIES.map((s) => s.key) as [string, ...string[]];

export const BACKTEST_NOTICE =
  "Backtesting em dados sintéticos (DEMO) serve para treinar a aplicação consistente de regras, não para provar que uma estratégia funciona. Mesmo com dados reais, uma amostra pequena não prova vantagem e resultados passados não garantem resultados futuros.";
