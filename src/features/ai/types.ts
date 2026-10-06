import type { ChartFacts } from "./logic/chart-facts";
import type { Candle } from "@/lib/market-data/types";

export interface TutorMessageDTO {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
}

export interface TutorConversationDTO {
  id: string;
  title: string;
  updatedAt: string;
}

export interface TutorReplyDTO {
  conversationId: string;
  user: TutorMessageDTO;
  assistant: TutorMessageDTO;
  /** "signal": refused before any model call; "output": the model's text was withheld by the output screen */
  blocked: "signal" | "output" | null;
}

export interface ScenarioAnalysisDTO {
  scenario: { id: string; title: string; description: string; symbol: string; timeframe: string };
  candles: Candle[];
  facts: ChartFacts;
  reading: string[];
  /** AI-written narrative, grounded on `facts`; null when the AI is not configured or was not requested */
  narrative: string | null;
  narrativeBlocked: boolean;
  aiConfigured: boolean;
}

export interface ImageAnalysisDTO {
  narrative: string;
  blocked: boolean;
}
