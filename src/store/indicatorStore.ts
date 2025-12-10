import { create } from "zustand";
import api, { Indicator, isCurrencyData, isIndexData } from "../services/api";

interface IndicatorState {
  indicators: Indicator[];
  loading: boolean;
  error: string | null;
  fetchIndicators: () => Promise<void>;
  getCurrencies: () => Indicator[];
  getIndexes: () => Indicator[];
  getGlobalCurrencies: (targetCodes: string[]) => Indicator[];
}

export const useIndicatorStore = create<IndicatorState>((set, get) => ({
  indicators: [],
  loading: false,
  error: null,

  fetchIndicators: async () => {
    if (get().indicators.length > 0 && !get().error) {
      // TODO: lógica de expiração de tempo aqui
    }

    set({ loading: true, error: null });
    try {
      const response = await api.get<Indicator[]>("/indicators/all");
      set({ indicators: response.data, loading: false });
    } catch (e: any) {
      console.error("Erro ao buscar indicadores:", e);
      set({
        error: "Não foi possível conectar ao servidor.",
        loading: false,
      });
    }
  },

  getCurrencies: () => {
    return get()
      .indicators.filter(isCurrencyData)
      .filter((item) => !item.name.includes("Turismo"));
  },
  getIndexes: () => {
    return get().indicators.filter(isIndexData);
  },

  getGlobalCurrencies: (targetCodes: string[]) => {
    return get()
      .indicators.filter(isCurrencyData)
      .filter((item) => targetCodes.includes(item.code));
  },
}));
