import axios from "axios";

const api = axios.create({
  baseURL: "https://economia.awesomeapi.com.br/json",
});

export default api;

export interface CurrencyData {
  name: string;
  buy: number;
  sell: number | null;
  variation: number;
}

export function isCurrencyData(item: any): item is CurrencyData {
  return (
    item &&
    typeof item.name === "string" &&
    typeof item.buy === "string" &&
    typeof item.variation === "string" &&
    item.codein !== "BRLT"
  );
}

export interface IndexData {
  name: string;
  location: string;
  points: number;
  variation: number;
}

export function isIndexData(item: any): item is IndexData {
  return (
    item && typeof item.name === "string" && typeof item.variation === "string"
  );
}
