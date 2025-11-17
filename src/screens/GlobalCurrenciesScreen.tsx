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

import api, { CurrencyData, isCurrencyData } from "../services/api";
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
  const [currencies, setCurrencies] = useState<CurrencyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyData | null>(
    null
  );

  async function fetchData() {
    const STORAGE_KEY = "@global_currencies";
    const CACHE_DURATION = 10 * 60 * 1000; // 10 min

    try {
      const cachedDataJSON = await AsyncStorage.getItem(STORAGE_KEY);
      if (cachedDataJSON) {
        const { timestamp, data } = JSON.parse(cachedDataJSON);

        if (Date.now() - timestamp < CACHE_DURATION) {
          setCurrencies(data);
          setLoading(false);
        }
      }

      const response = await api.get("/all");
      const data = response.data;
      const filteredData: CurrencyData[] =
        Object.values(data).filter(isCurrencyData);

      setCurrencies(filteredData);
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

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  function handleOpenModal(item: CurrencyData) {
    setSelectedCurrency(item);
    setModalVisible(true);
  }

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
          <IndicatorCard
            name={item.name.split("/")[0]}
            value={Number(item.buy)}
            variation={Number(item.variation)}
            symbol={currencySymbols[(item as any).code] || "$"}
            onPress={() => handleOpenModal(item)}
          />
        )}
        onRefresh={onRefresh}
        refreshing={refreshing}
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
