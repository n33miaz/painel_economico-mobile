import { create } from "zustand";
import api, { isCurrencyData, isIndexData } from "../services/api";
import { CurrencyData, IndexData } from "../services/api";

type Indicator = CurrencyData | IndexData;

interface IndicatorState {
  indicators: Indicator[];
  loading: boolean;
  error: string | null;
  fetchIndicators: () => Promise<void>;
}

const processData = (data: any[]): Indicator[] => {
  return data.map((item: any) => ({
    ...item,
    id: isCurrencyData(item) ? `currency_${item.code}` : `index_${item.name}`,
  }));
};

export const useIndicatorStore = create<IndicatorState>((set, get) => ({
  indicators: [],
  loading: false,
  error: null,
  fetchIndicators: async () => {
    if (get().indicators.length > 0 || get().loading) {
      return;
    }

    set({ loading: true, error: null });
    try {
      const response = await api.get("/indicators/all");
      const dataArray = Object.values(response.data);
      const processed = processData(dataArray);

      set({ indicators: processed, loading: false });
    } catch (e: any) {
      set({ error: e.message || "Ocorreu um erro", loading: false });
    }
  },
}));
