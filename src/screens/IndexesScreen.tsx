import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  Modal,
  Button,
} from "react-native";

import useApiData from "../hooks/useApiData";
import { IndexData, isIndexData } from "../services/api";
import IndicatorCard from "../components/IndicatorCard";

const DESIRED_INDEXES = ["IBOVESPA", "CDI", "SELIC"];

export default function IndexesScreen() {
  const {
    data: indexes,
    loading,
    error,
    fetchData: refreshData,
  } = useApiData<IndexData>(
    "https://economia.awesomeapi.com.br/json/all",
    "@indexes",
    isIndexData,
    10 * 60 * 1000, // 10 min de cache
    (item) => DESIRED_INDEXES.includes(item.name)
  );

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<IndexData | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  function handleOpenModal(item: IndexData) {
    setSelectedIndex(item);
    setModalVisible(true);
  }

  if (loading && !indexes) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando dados...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Ocorreu um erro ao carregar os dados.
        </Text>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Tentar Novamente" onPress={refreshData} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={indexes || []}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <IndicatorCard
            name={item.name}
            value={Number(item.points) || Number(item.variation)}
            variation={Number(item.variation)}
            onPress={() => handleOpenModal(item)}
          />
        )}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text>Nenhum índice encontrado.</Text>
          </View>
        }
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
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
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
