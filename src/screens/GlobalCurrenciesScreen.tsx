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
import { CurrencyData, isCurrencyData } from "../services/api";
import IndicatorCard from "../components/IndicatorCard";

const DESIRED_CURRENCIES = ["USD", "EUR", "JPY", "GBP", "CAD"];

const currencySymbols: { [key: string]: string } = {
  USD: "$",
  EUR: "€",
  JPY: "¥",
  GBP: "£",
  CAD: "$",
};

export default function GlobalCurrenciesScreen() {
  const {
    data: currencies,
    loading,
    error,
    fetchData: refreshData,
  } = useApiData<CurrencyData>(
    "https://economia.awesomeapi.com.br/json/all",
    "@global_currencies",
    isCurrencyData,
    10 * 60 * 1000,
    (item) => DESIRED_CURRENCIES.includes(item.code)
  );

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyData | null>(
    null
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  }, [refreshData]);

  function handleOpenModal(item: CurrencyData) {
    setSelectedCurrency(item);
    setModalVisible(true);
  }

  if (loading && !isRefreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando moedas globais...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Ocorreu um erro ao carregar os dados.
        </Text>
        <Button title="Tentar Novamente" onPress={refreshData} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={currencies || []}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <IndicatorCard
            name={item.name.split("/")[0]}
            value={Number(item.buy)}
            variation={Number(item.variation)}
            symbol={currencySymbols[item.code] || "$"}
            onPress={() => handleOpenModal(item)}
          />
        )}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
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
              Compra (em BRL): R$ {Number(selectedCurrency?.buy).toFixed(2)}
            </Text>
            <Text style={styles.modalText}>
              Venda (em BRL): R${" "}
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
    paddingTop: 16,
    backgroundColor: "#f5f5f5",
  },
  errorText: {
    fontSize: 18,
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
    shadowOffset: { width: 0, height: 2 },
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
