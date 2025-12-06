import axios from "axios";
import { API_BASE_URL } from "@env";
import { Identifiable } from "../hooks/useApiData";

if (!API_BASE_URL) {
  console.error(
    "A variável de ambiente API_BASE_URL não está definida. Verifique seu arquivo .env"
  );
}

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;

// --- Interfaces ---

export interface CurrencyData extends Identifiable {
  code: string;
  name: string;
  buy: number;
  sell: number | null;
  variation: number;
}

export interface IndexData extends Identifiable {
  name: string;
  location: string;
  points: number;
  variation: number;
}

export interface NewsArticle {
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: {
    name: string;
  };
}

export interface HistoricalDataPoint {
  timestamp: string;
  high: string;
}

// --- Type Guards ---

export function isCurrencyData(item: any): item is CurrencyData {
  return (
    item &&
    typeof item.code === "string" &&
    typeof item.name === "string" &&
    typeof item.buy !== "undefined" &&
    typeof item.variation !== "undefined"
  );
}

export function isIndexData(item: any): item is IndexData {
  return (
    item &&
    typeof item.name === "string" &&
    typeof item.variation !== "undefined"
  );
}

// --- Funções de Serviço ---

export const getHistoricalData = async (
  currencyCode: string,
  days: number = 7
): Promise<HistoricalDataPoint[]> => {
  try {
    const response = await api.get(`/indicators/historical/${currencyCode}`, {
      params: { days },
    });

    if (response.status === 200 && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error(
      `Erro ao buscar dados históricos para ${currencyCode}:`,
      error
    );
    throw error;
  }
};
