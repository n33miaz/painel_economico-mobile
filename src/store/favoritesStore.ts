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
        const currentFavorites = get().favorites;
        const exists = currentFavorites.includes(id);

        let newFavorites;

        if (exists) {
          newFavorites = currentFavorites.filter((favId) => favId !== id);
        } else {
          newFavorites = Array.from(new Set([...currentFavorites, id]));
        }

        set({ favorites: newFavorites });
      },
    }),
    {
      name: "@favorites",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
