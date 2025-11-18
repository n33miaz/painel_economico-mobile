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

import { colors } from "../theme/colors";
import useApiData from "../hooks/useApiData";
import { CurrencyData, isCurrencyData } from "../services/api";
import IndicatorCard from "../components/IndicatorCard";
import HistoricalChart from "../components/HistoricalChart";

export default function CurrenciesScreen() {
  const {
    data: currencies,
    loading,
    error,
    fetchData: refreshCurrencies,
  } = useApiData<CurrencyData>("/all", "@currencies", isCurrencyData);

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
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  if (error && !currencies) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Erro ao carregar os dados.</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Tentar Novamente"
          onPress={refreshCurrencies}
          color={colors.primary}
        />
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
            name={item.name}
            value={item.buy}
            variation={item.variation}
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
              Compra: R$ {selectedCurrency?.buy.toFixed(2)}
            </Text>
            <Text style={styles.modalText}>
              Venda: R${" "}
              {selectedCurrency?.sell
                ? selectedCurrency.sell.toFixed(2)
                : "N/A"}
            </Text>
            <Text style={styles.modalText}>
              Variação: {selectedCurrency?.variation.toFixed(2)}%
            </Text>
            {selectedCurrency && (
              <HistoricalChart currencyCode={selectedCurrency.code} />
            )}
            <View style={styles.buttonSeparator} />
            <Button
              title="Fechar"
              onPress={() => setModalVisible(false)}
              color={colors.primary}
            />
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
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: "center",
    marginBottom: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.transparent,
  },
  modalView: {
    width: "90%",
    margin: 20,
    backgroundColor: colors.cardBackground,
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
    color: colors.textPrimary,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16,
    color: colors.textSecondary,
  },
  buttonSeparator: {
    borderBottomColor: "#e0e0e0",
    borderBottomWidth: StyleSheet.hairlineWidth,
    width: "100%",
    marginVertical: 15,
  },
});
