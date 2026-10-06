import type { Metadata } from "next";
import { Disclaimer } from "@/components/brand/disclaimer";
import { BRAND } from "@/modules/brand";

export const metadata: Metadata = { title: "Aviso legal" };

export default function DisclaimerPage() {
  return (
    <article className="prose-academy mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Aviso legal e de risco</h1>
      <Disclaimer withFutures />
      <h2>O que esta plataforma é</h2>
      <p>{BRAND.name} é uma plataforma <strong>exclusivamente educativa</strong>. Ensina conceitos, análise técnica, gestão de risco e disciplina através de aulas, exercícios, simulação e estatísticas pessoais.</p>
      <h2>O que esta plataforma NÃO é</h2>
      <ul>
        <li>Não fornece sinais de compra ou venda, nem recomendações de investimento;</li>
        <li>Não promete rentabilidade, taxas de acerto ou resultados;</li>
        <li>Não gere dinheiro de ninguém, nem executa ordens em mercados reais;</li>
        <li>O tutor de IA e o analisador de gráficos oferecem interpretações educativas e probabilísticas — nunca instruções para operar;</li>
        <li>Não é copy trading, nem vende “estratégias secretas”.</li>
      </ul>
      <h2>Dados de mercado</h2>
      <p>Salvo indicação em contrário, os gráficos e preços mostrados são <strong>dados sintéticos DEMO</strong> gerados para fins pedagógicos. Não correspondem a preços reais do Dow Jones nem de qualquer contrato. As margens e custos do simulador são ilustrativos.</p>
      <h2>Riscos</h2>
      <p>Trading de CFDs e futuros envolve risco significativo de perda de capital. A alavancagem pode amplificar significativamente ganhos e perdas, incluindo perdas superiores ao capital depositado. Resultados passados — reais ou simulados — não garantem resultados futuros. Resultados simulados têm limitações: não refletem emoções reais, liquidez, slippage ou rejeições de ordens.</p>
      <h2>Aconselhamento</h2>
      <p>Antes de negociar com dinheiro real, consulta um profissional qualificado e informa-te junto do regulador do teu país. Confirma sempre as especificações dos contratos e a regulamentação aplicável nas fontes oficiais (ver <a href="/sources">Learning Sources</a>).</p>
    </article>
  );
}
