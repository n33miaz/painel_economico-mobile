import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Transaction {
  id: string;
  currencyCode: string;
  amount: number;
  priceAtPurchase: number;
  date: string;
}

interface WalletState {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  removeTransaction: (id: string) => void;
}

export const useWalletStore = create(
  persist<WalletState>(
    (set, get) => ({
      transactions: [],
      addTransaction: (transaction) => {
        const newTransaction = {
          ...transaction,
          id: Math.random().toString(36).substr(2, 9),
        };
        set({ transactions: [...get().transactions, newTransaction] });
      },
      removeTransaction: (id) => {
        set({
          transactions: get().transactions.filter((t) => t.id !== id),
        });
      },
    }),
    {
      name: "@wallet_transactions",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
