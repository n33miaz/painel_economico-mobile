import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import api from "../services/api";
import { isCurrencyData } from "../services/api";

interface UseApiDataResult<T> {
  data: T[] | null;
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
}

export interface Identifiable {
  id: string;
}

const parseNumeric = (value: any): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const sanitizedValue = value.replace(",", ".");
    return parseFloat(sanitizedValue) || 0;
  }
  return 0;
};

function useApiData<T extends Identifiable>(
  apiEndpoint: string,
  storageKey: string,
  typeGuard: (item: any) => item is T,
  cacheDuration: number = 10 * 60 * 1000,
  filterFn?: (item: T) => boolean
): UseApiDataResult<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDataInternal = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const cachedDataJSON = await AsyncStorage.getItem(storageKey);
      if (cachedDataJSON) {
        const { timestamp, data: cachedData } = JSON.parse(cachedDataJSON);
        if (Date.now() - timestamp < cacheDuration) {
          setData(cachedData);
          setLoading(false);
          return;
        }
      }

      const response = await api.get(apiEndpoint);
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiData = response.data;
      const dataArray = Object.values(apiData);

      const processedData = dataArray
        .filter(typeGuard)
        .map((item: any) => ({
          ...item,
          id: isCurrencyData(item)
            ? `currency_${item.code}`
            : `index_${item.name}`,
          buy: parseNumeric(item.buy),
          sell: item.sell ? parseNumeric(item.sell) : null,
          variation: parseNumeric(item.variation),
          points: item.points ? parseNumeric(item.points) : undefined,
        }))
        .filter(filterFn || (() => true));

      setData(processedData as T[]);
      const dataToCache = { timestamp: Date.now(), data: processedData };
      await AsyncStorage.setItem(storageKey, JSON.stringify(dataToCache));
    } catch (e: any) {
      console.error(`Erro em ${storageKey}:`, e);
      setError(e.message || "Ocorreu um erro.");
      const cachedDataJSON = await AsyncStorage.getItem(storageKey);
      if (cachedDataJSON) {
        const { data: cachedData } = JSON.parse(cachedDataJSON);
        setData(cachedData);
      }
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, storageKey, typeGuard, cacheDuration, filterFn]);

  useEffect(() => {
    fetchDataInternal();
  }, [fetchDataInternal]);

  return { data, loading, error, fetchData: fetchDataInternal };
}

export default useApiData;
