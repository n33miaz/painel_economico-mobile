import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  Button,
  LayoutAnimation,
} from "react-native";

import { colors } from "../theme/colors";
import useApiData from "../hooks/useApiData";
import { CurrencyData, isCurrencyData } from "../services/api";
import IndicatorCard from "../components/IndicatorCard";
import HistoricalChart from "../components/HistoricalChart";
import DetailsModal from "../components/DetailsModal";
import { useFavoritesStore } from "../store/favoritesStore";

const DESIRED_CURRENCIES = ["USD", "EUR", "JPY", "GBP", "CAD"];

export default function GlobalCurrencies() {
  const {
    data: currencies,
    loading,
    error,
    fetchData: refreshData,
  } = useApiData<CurrencyData>(
    "/indicators/all",
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

  const handleOpenModal = useCallback((item: CurrencyData) => {
    setSelectedCurrency(item);
    setModalVisible(true);
  }, []);

  function handleCloseModal() {
    setModalVisible(false);
  }

  const renderCurrencyCard = useCallback(
    ({ item }: { item: CurrencyData }) => (
      <IndicatorCard
        name={item.name}
        id={item.id}
        value={item.buy}
        variation={item.variation}
        isFavorite={favorites.includes(item.id)}
        onPress={() => handleOpenModal(item)}
        onToggleFavorite={handleToggleFavorite}
      />
    ),
    [favorites, handleToggleFavorite, handleOpenModal]
  );

  if (loading && !currencies) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando moedas globais...</Text>
      </View>
    );
  }

  if (error && !currencies) {
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
        initialNumToRender={5}
        windowSize={3}
        maxToRenderPerBatch={5}
        data={currencies || []}
        keyExtractor={(item) => item.id}
        renderItem={renderCurrencyCard}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.centered}>
              <Text>Nenhuma moeda global encontrada.</Text>
            </View>
          ) : null
        }
      />

      {selectedCurrency && (
        <DetailsModal
          visible={modalVisible}
          onClose={handleCloseModal}
          title={selectedCurrency.name}
        >
          <Text style={styles.modalText}>
            Compra (em BRL): R$ {selectedCurrency.buy.toFixed(2)}
          </Text>
          <Text style={styles.modalText}>
            Venda (em BRL): R${" "}
            {selectedCurrency.sell ? selectedCurrency.sell.toFixed(2) : "N/A"}
          </Text>
          <Text style={styles.modalText}>
            Variação: {selectedCurrency.variation.toFixed(2)}%
          </Text>

          <HistoricalChart currencyCode={selectedCurrency.code} />
        </DetailsModal>
      )}
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
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16,
    color: colors.textSecondary,
  },
});
