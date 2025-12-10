import axios from "axios";
import Constants from "expo-constants";

const getBaseUrl = () => {
  if (process.env.API_BASE_URL) {
    return process.env.API_BASE_URL;
  }

  const debuggerHost =
    Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;

  if (debuggerHost) {
    const ip = debuggerHost.split(":")[0];
    return `http://${ip}:8080/api`;
  }

  return "http://localhost:8080/api";
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      console.error(
        "Erro: A conexão demorou muito. Verifique se o PC e o Celular estão na mesma rede."
      );
    } else if (error.message === "Network Error") {
      console.error(
        "Erro de Rede: O celular não consegue alcançar o backend. Verifique o Firewall do Windows."
      );
    }
    return Promise.reject(error);
  }
);

export default api;

// --- Interfaces ---
export interface Indicator {
  id: string;
  type: "currency" | "index" | "unknown";
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

export function isCurrencyData(item: Indicator): boolean {
  return item.type === "currency";
}

export function isIndexData(item: Indicator): boolean {
  return item.type === "index";
}

export const getHistoricalData = async (
  currencyCode: string,
  days: number = 7
): Promise<HistoricalDataPoint[]> => {
  try {
    const response = await api.get<HistoricalDataPoint[]>(
      `/indicators/historical/${currencyCode}`,
      { params: { days } }
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
