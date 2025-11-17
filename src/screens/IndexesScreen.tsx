import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  Modal,
  Button,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import api, { IndexData, isIndexData } from "../services/api";
import IndicatorCard from "../components/IndicatorCard";

const DESIRED_INDEXES = ["IBOVESPA", "CDI", "SELIC"];

export default function IndexesScreen() {
  const [indexes, setIndexes] = useState<IndexData[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<IndexData | null>(null);

  async function fetchData() {
    const STORAGE_KEY = "@indexes";
    const CACHE_DURATION = 10 * 60 * 1000; // 10 min

    try {
      const cachedDataJSON = await AsyncStorage.getItem(STORAGE_KEY);
      if (cachedDataJSON) {
        const { timestamp, data } = JSON.parse(cachedDataJSON);

        if (Date.now() - timestamp < CACHE_DURATION) {
          setIndexes(data);
          setLoading(false);
        }
      }

      const response = await api.get("/all");
      const data = response.data;
      const filteredData: IndexData[] = Object.values(data).filter(isIndexData);

      setIndexes(filteredData);
      const dataToCache = {
        timestamp: Date.now(),
        data: filteredData,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToCache));
    } catch (error) {
      console.error("Erro ao buscar dados da API:", error);
    } finally {
      if (loading) setLoading(false);
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

  function handleOpenModal(item: IndexData) {
    setSelectedIndex(item);
    setModalVisible(true);
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
            onPress={() => handleOpenModal(item)}
          />
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{selectedIndex?.name}</Text>
            {selectedIndex?.points && (
              <Text style={styles.modalText}>
                Pontos: {Number(selectedIndex?.points).toFixed(2)}
              </Text>
            )}
            <Text style={styles.modalText}>
              Variação: {Number(selectedIndex?.variation).toFixed(2)}%
            </Text>
            <Button title="Fechar" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16,
  },
});
