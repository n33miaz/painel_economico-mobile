import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  Modal,
  Button,
  LayoutAnimation,
} from "react-native";

import { colors } from "../theme/colors";
import useApiData from "../hooks/useApiData";
import { CurrencyData, isCurrencyData } from "../services/api";
import IndicatorCard from "../components/IndicatorCard";
import HistoricalChart from "../components/HistoricalChart";
import { useFavoritesStore } from "../store/favoritesStore";

const DESIRED_CURRENCIES = ["USD", "EUR", "JPY", "GBP", "CAD"];

const currencySymbols: { [key: string]: string } = {
  USD: "$",
  EUR: "€",
  JPY: "¥",
  GBP: "£",
  CAD: "$",
};

export default function GlobalCurrencies() {
  const {
    data: currencies,
    loading,
    error,
    fetchData: refreshData,
  } = useApiData<CurrencyData>(
    "/all",
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

  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const handleToggleFavorite = useCallback(
    (id: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      toggleFavorite(id);
    },
    [toggleFavorite]
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
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando moedas globais...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Ocorreu um erro ao carregar os dados.
        </Text>
        <Button
          title="Tentar Novamente"
          onPress={refreshData}
          color={colors.primary}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        initialNumToRender={10}
        windowSize={5}
        maxToRenderPerBatch={10}
        data={currencies || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <IndicatorCard
            name={item.name}
            id={item.id}
            value={item.buy}
            variation={item.variation}
            isFavorite={favorites.includes(item.id)}
            onPress={() => handleOpenModal(item)}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text>Nenhuma moeda global encontrada.</Text>
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
              Compra (em BRL): R$ {selectedCurrency?.buy.toFixed(2)}
            </Text>
            <Text style={styles.modalText}>
              Venda (em BRL): R${" "}
              {selectedCurrency?.sell
                ? selectedCurrency.sell.toFixed(2)
                : "N/A"}
            </Text>
            <Text style={styles.modalText}>
              Variação: {selectedCurrency?.variation.toFixed(2)}%
            </Text>
            {selectedCurrency && (
              <HistoricalChart id={selectedCurrency.id} />
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
    paddingTop: 8,
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 18,
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
