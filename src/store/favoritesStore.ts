import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface FavoritesState {
  favorites: string[];
  toggleFavorite: (code: string) => void;
}

export const useFavoritesStore = create(
  persist<FavoritesState>(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (code: string) => {
        const currentFavorites = get().favorites;
        const isFavorite = currentFavorites.includes(code);

        const newFavorites = isFavorite
          ? currentFavorites.filter((fav) => fav !== code)
          : [...currentFavorites, code];

        set({ favorites: newFavorites });
      },
    }),
    {
      name: "@favorites",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
