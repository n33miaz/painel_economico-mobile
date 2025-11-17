import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";

import api, { CurrencyData } from "../services/api";

export default function CurrenciesScreen() {
  const [currencies, setCurrencies] = useState<CurrencyData[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      const response = await api.get<Record<string, CurrencyData>>("/all");
      const data = response.data;
      const filteredData: CurrencyData[] = Object.values(data).filter(
        (item: any) => item.codein !== "BRLT" // Dólar Turismo
      );

      setCurrencies(filteredData);
    } catch (error) {
      console.error("Erro ao buscar dados da API:", error);
      // estado de erro para mostrar na tela
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={currencies}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text>Compra: R$ {Number(item.buy).toFixed(2)}</Text>
            <Text>Variação: {item.variation}%</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  itemContainer: {
    backgroundColor: "#fff",
    padding: 20,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
