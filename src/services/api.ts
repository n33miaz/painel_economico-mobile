import axios from "axios";
import { Identifiable } from "../hooks/useApiData";

const api = axios.create({
  baseURL: "https://economia.awesomeapi.com.br/json",
});

export default api;

export interface CurrencyData extends Identifiable {
  code: string;
  name: string;
  buy: number;
  sell: number | null;
  variation: number;
}

export function isCurrencyData(item: any): item is CurrencyData {
  return (
    item &&
    typeof item.code === "string" &&
    typeof item.name === "string" &&
    typeof item.buy !== "undefined" &&
    typeof item.variation !== "undefined"
  );
}

export interface IndexData extends Identifiable {
  name: string;
  location: string;
  points: number;
  variation: number;
}

export function isIndexData(item: any): item is IndexData {
  return (
    item &&
    typeof item.name === "string" &&
    typeof item.variation !== "undefined"
  );
}

export interface HistoricalDataPoint {
  timestamp: string;
  high: string;
}

export const getHistoricalData = async (
  currencyCode: string,
  days: number = 7
): Promise<HistoricalDataPoint[]> => {
  try {
    const response = await api.get(`/daily/${currencyCode}-BRL/${days}`);
    if (response.status === 200 && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Erro ao buscar dados históricos:", error);
    throw error;
  }
};
