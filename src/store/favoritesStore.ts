import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface FavoritesState {
  favorites: string[];
}

interface FavoritesActions {
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

type FavoritesStore = FavoritesState & FavoritesActions;

export const useFavoritesStore = create(
  persist<FavoritesStore>(
    (set, get) => ({
      favorites: [],

      isFavorite: (id: string) => {
        return get().favorites.includes(id);
      },

      toggleFavorite: (id: string) => {
        const isCurrentlyFavorite = get().isFavorite(id);

        const currentFavorites = get().favorites;
        const newFavorites = isCurrentlyFavorite
          ? currentFavorites.filter((favId) => favId !== id)
          : [...currentFavorites, id];

        set({ favorites: newFavorites });
      },
    }),
    {
      name: "@favorites",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
