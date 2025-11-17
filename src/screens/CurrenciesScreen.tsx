import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Modal,
  Button,
} from "react-native";

import useApiData from "../hooks/useApiData";
import { CurrencyData, isCurrencyData } from "../services/api";
import IndicatorCard from "../components/IndicatorCard";

export default function CurrenciesScreen() {
  const {
    data: currencies,
    loading,
    error,
    fetchData: refreshCurrencies,
  } = useApiData<CurrencyData>(
    "https://economia.awesomeapi.com.br/json/all",
    "@currencies",
    isCurrencyData
  );

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyData | null>(
    null
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshCurrencies();
    setRefreshing(false);
  }, [refreshCurrencies]);

  function handleOpenModal(item: CurrencyData) {
    setSelectedCurrency(item);
    setModalVisible(true);
  }

  if (loading && !currencies) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  if (error && !currencies) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Erro ao carregar os dados.</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Tentar Novamente" onPress={refreshCurrencies} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={currencies || []}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <IndicatorCard
            name={item.name}
            value={Number(item.buy)}
            variation={Number(item.variation)}
            onPress={() => handleOpenModal(item)}
          />
        )}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text>Nenhuma moeda encontrada.</Text>
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
            <Text style={styles.modalTitle}>{selectedCurrency?.name}</Text>
            <Text style={styles.modalText}>
              Compra: R$ {Number(selectedCurrency?.buy).toFixed(2)}
            </Text>
            <Text style={styles.modalText}>
              Venda: R${" "}
              {selectedCurrency?.sell
                ? Number(selectedCurrency.sell).toFixed(2)
                : "N/A"}
            </Text>
            <Text style={styles.modalText}>
              Variação: {Number(selectedCurrency?.variation).toFixed(2)}%
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "gray",
  },
  errorText: {
    fontSize: 16,
    color: "red",
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
