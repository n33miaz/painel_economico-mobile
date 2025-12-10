import { create } from "zustand";
import api, { Indicator } from "../services/api";

interface IndicatorState {
  indicators: Indicator[];
  loading: boolean;
  error: string | null;
  fetchIndicators: () => Promise<void>;
}

export const useIndicatorStore = create<IndicatorState>((set, get) => ({
  indicators: [],
  loading: false,
  error: null,
  fetchIndicators: async () => {
    if (get().indicators.length > 0 && !get().error) {
      return;
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
}));
