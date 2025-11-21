
import { GoogleGenAI } from "@google/genai";
import { PlayerState, GameState, InvestmentType } from "../types";

// Ensure API key is available
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateMarketEvent = async (year: number): Promise<string> => {
  if (!apiKey) return "Regulatory body announces review of spectrum fees.";

  const model = 'gemini-2.5-flash';
  const prompt = `
    You are the Game Master for a Telecom Industry Strategy Game set in Indonesia.
    The year is ${year}.
    Generate a SHORT, realistic random market event (max 1 sentence) that affects the industry.
    Examples: "Fiber cut in Java affects latency.", "Government auctions new 700MHz spectrum.", "Competitor launches aggressive price war in Kalimantan."
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Market remains stable with slight competitive pressure.";
  }
};

export const generateAnnualReportAnalysis = async (
  player: PlayerState,
  competitors: PlayerState[],
  year: number,
  investmentsMade: { region: string, type: InvestmentType }[]
): Promise<string> => {
  if (!apiKey) return "Board of Directors notes steady progress. Financials look acceptable.";

  const model = 'gemini-2.5-flash';
  
  const investmentSummary = investmentsMade.map(i => `${i.type} in ${i.region}`).join(', ');
  
  // Find the best performer by profit
  const allPlayers = [player, ...competitors];
  const winner = allPlayers.reduce((prev, current) => (prev.financials.profit > current.financials.profit) ? prev : current);
  
  const prompt = `
    You are a sarcastic but insightful Financial Analyst for the Indonesian Telco industry.
    Analyze the performance of ${player.name} for the year ${year}.
    
    Player Stats (${player.name}):
    - Revenue: ${player.financials.revenue.toFixed(0)}B IDR
    - Profit: ${player.financials.profit.toFixed(0)}B IDR
    - Subs: ${player.financials.subscribers.toFixed(1)}M
    - Investments: ${investmentSummary || "None"}

    Competitor Market Context:
    ${competitors.map(c => `- ${c.name}: Revenue ${c.financials.revenue.toFixed(0)}B, Profit ${c.financials.profit.toFixed(0)}B`).join('\n')}

    The top performer this year was ${winner.name}.

    Provide a 2-3 sentence commentary. Compare the player to the competition. 
    If the player lost to a competitor, mock them slightly. If they won, praise their strategy.
    Mention specific Indonesian contexts (Java, Sumatra, data wars) if applicable.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Financial analysis unavailable due to server connectivity issues.";
  }
};
