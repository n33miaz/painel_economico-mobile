import axios from "axios";
import { API_BASE_URL } from "@env";

const DEV_URL = "http://10.201.3.1:8080/api"; 

const api = axios.create({
  baseURL: API_BASE_URL || DEV_URL,
});

export default api;

// --- Interfaces ---

export interface Indicator {
  id: string;
  type: "currency" | "index";
  code: string;
  name: string;
  buy: number;
  sell: number | null;
  variation: number;
  location?: string;
  points?: number;
}

export interface NewsArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface HistoricalDataPoint {
  timestamp: string;
  high: number;
}

export interface ConversionResponse {
  currency: string;
  amountBrl: number;
  result: number;
}

// --- Type Guards ---

export function isCurrencyData(item: Indicator): boolean {
  return item.type === "currency";
}

export function isIndexData(item: Indicator): boolean {
  return item.type === "index";
}

// --- Serviços ---

export const getHistoricalData = async (
  currencyCode: string,
  days: number = 7
): Promise<HistoricalDataPoint[]> => {
  try {
    const response = await api.get<HistoricalDataPoint[]>(
      `/indicators/historical/${currencyCode}`,
      {
        params: { days },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Erro histórico ${currencyCode}:`, error);
    return [];
  }
};

export const convertCurrency = async (
  code: string,
  amount: number
): Promise<ConversionResponse | null> => {
  try {
    const response = await api.get<ConversionResponse>("/indicators/convert", {
      params: { code, amount },
    });
    return response.data;
  } catch (error) {
    console.error("Erro na conversão:", error);
    return null;
  }
};
