import { GoogleGenAI } from "@google/genai";
import { StockData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchVTIPrice = async (): Promise<StockData> => {
  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `
      VTI (Vanguard Total Stock Market ETF) の現在の株価(USD)と、最新のドル円(USD/JPY)為替レートを検索してください。
      
      回答は以下の形式のみで行ってください：
      "PRICE: <株価の数値>"
      "RATE: <為替レートの数値>"
      "SUMMARY: <市場状況の簡潔な日本語サマリー>"
      
      例:
      PRICE: 265.40
      RATE: 150.50
      SUMMARY: 本日のVTIはハイテク株主導で上昇しており、ドル円は米金利上昇を受けて円安傾向です。
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1, 
      },
    });

    const text = response.text || "";
    
    // Extract sources
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => {
        if (chunk.web) {
          return {
            title: chunk.web.title || "Source",
            uri: chunk.web.uri || "#",
          };
        }
        return null;
      })
      .filter((source: any) => source !== null) as { title: string; uri: string }[] || [];

    // Parse Price and Rate using Regex
    const priceMatch = text.match(/PRICE:\s*\$?([\d,]+\.?\d*)/i);
    const rateMatch = text.match(/RATE:\s*¥?([\d,]+\.?\d*)/i);
    const summaryMatch = text.match(/SUMMARY:\s*(.*)/is);

    let parsedPrice: number | null = null;
    let parsedRate: number | null = null;

    if (priceMatch && priceMatch[1]) {
      parsedPrice = parseFloat(priceMatch[1].replace(/,/g, ''));
    }

    if (rateMatch && rateMatch[1]) {
      parsedRate = parseFloat(rateMatch[1].replace(/,/g, ''));
    }

    const summary = summaryMatch ? summaryMatch[1].trim() : text;

    return {
      price: parsedPrice,
      exchangeRate: parsedRate,
      summary: summary,
      sources: sources,
      lastUpdated: new Date(),
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};