export interface EventEducation {
  title: string;
  what: string;
  why: string;
  watch: string;
}

/** Educational blurbs for each kind of macro event (no forecasts, no trade ideas). */
export const EVENT_EDUCATION: Record<string, EventEducation> = {
  CPI: { title: "CPI — inflação ao consumidor", what: "Mede a variação dos preços que os consumidores pagam.", why: "Molda as expectativas sobre as taxas de juro da Fed; taxas mais altas tendem a pesar nas avaliações das ações.", watch: "Desvio face ao esperado (surpresa), componente 'core', e a reação nos minutos seguintes — costuma haver um primeiro movimento e uma correção." },
  PPI: { title: "PPI — preços no produtor", what: "Inflação na cadeia de produção.", why: "Pode antecipar pressões de preços no consumo.", watch: "Surpresas face ao esperado; impacto normalmente menor que o CPI." },
  NFP: { title: "NFP — emprego não agrícola", what: "Criação mensal de emprego nos EUA, no relatório Employment Situation.", why: "Um mercado de trabalho forte/fraco influencia as expectativas de política monetária e o crescimento.", watch: "Número principal, revisões, taxa de desemprego e salários. Spreads costumam alargar à publicação (08:30 ET)." },
  FOMC: { title: "FOMC — decisão da Fed", what: "Decisão de taxas, comunicado, projeções e conferência de imprensa.", why: "A política monetária é um dos grandes motores do mercado de ações.", watch: "Decisão (14:00 ET), tom do comunicado e conferência (14:30 ET): a volatilidade pode vir em duas ondas." },
  GDP: { title: "GDP — Produto Interno Bruto", what: "Valor da produção da economia, em várias estimativas.", why: "Avalia o ritmo de crescimento.", watch: "Estimativa avançada costuma ser a que mais mexe; revisões depois." },
  RETAIL_SALES: { title: "Retail sales — vendas a retalho", what: "Consumo dos consumidores.", why: "O consumo é grande parte da economia dos EUA.", watch: "Número principal vs. 'ex-autos'." },
  PMI: { title: "PMI/ISM — gestores de compras", what: "Inquérito à atividade industrial/serviços.", why: "Indicador antecedente do ciclo económico.", watch: "Acima/abaixo de 50 e componentes (preços pagos, emprego)." },
  JOBLESS_CLAIMS: { title: "Jobless claims — pedidos de subsídio", what: "Pedidos semanais de subsídio de desemprego.", why: "Leitura frequente do mercado de trabalho.", watch: "Tendência de várias semanas, não um número isolado." },
  FED_SPEECH: { title: "Discursos da Fed", what: "Intervenções de membros da Fed, incluindo o presidente.", why: "O tom pode alterar expectativas sobre as taxas.", watch: "Mudanças de linguagem; o impacto depende de quem fala e do contexto." },
  OTHER: { title: "Outros eventos", what: "Evento económico ou de mercado de menor impacto.", why: "Contribui para o contexto.", watch: "Confirma a relevância na fonte oficial." },
};

export const NEWS_RISKS = [
  { title: "Spread widening", text: "Os spreads (sobretudo em CFDs) alargam à publicação: entrar e sair custa mais." },
  { title: "Slippage", text: "Ordens a mercado e stops podem ser executadas bem longe do preço pretendido." },
  { title: "Volatility spike", text: "Candles de centenas de pontos em segundos; um stop 'normal' pode ser varrido." },
  { title: "Liquidity changes", text: "O livro de ordens esvazia momentaneamente; há saltos de preço (gaps) intra-candle." },
] as const;
