import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
} from "react-native";

import api, { IndexData, isIndexData } from "../services/api";
import IndicatorCard from "../components/IndicatorCard";

const DESIRED_INDEXES = ["IBOVESPA", "CDI", "SELIC"];

export default function IndexesScreen() {
  const [indexes, setIndexes] = useState<IndexData[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      const response = await api.get("/all");
      const data = response.data;

      const filteredData: IndexData[] = Object.values(data)
        .filter(isIndexData)
        .filter((item) => DESIRED_INDEXES.includes(item.name));

      setIndexes(filteredData);
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
        data={indexes}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <IndicatorCard
            name={item.name}
            value={Number(item.points) || Number(item.variation)}
            variation={Number(item.variation)}
            onPress={() => alert("A implementar")}
          />
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
    paddingTop: 16,
    backgroundColor: "#f5f5f5",
  },
});
