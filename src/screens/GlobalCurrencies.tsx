import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  Button,
  LayoutAnimation,
  RefreshControl,
} from "react-native";

import { colors } from "../theme/colors";
import { CurrencyData, isCurrencyData } from "../services/api";
import IndicatorCard from "../components/IndicatorCard";
import HistoricalChart from "../components/HistoricalChart";
import DetailsModal from "../components/DetailsModal";
import { useFavoritesStore } from "../store/favoritesStore";
import { useIndicatorStore } from "../store/indicatorStore";

const DESIRED_CURRENCIES = ["USD", "EUR", "JPY", "GBP", "CAD"];

export default function GlobalCurrencies() {
  const { indicators, loading, error, fetchIndicators } = useIndicatorStore();

  const currencies = useMemo(
    () =>
      indicators
        .filter(isCurrencyData)
        .filter((item) => DESIRED_CURRENCIES.includes(item.code)),
    [indicators]
  );

  useEffect(() => {
    fetchIndicators();
  }, [fetchIndicators]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyData | null>(
    null
  );

  const { favorites, toggleFavorite } = useFavoritesStore();

  const handleToggleFavorite = useCallback(
    (id: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      toggleFavorite(id);
    },
    [toggleFavorite]
  );

  const onRefresh = useCallback(async () => {
    await fetchIndicators();
  }, [fetchIndicators]);

  const handleOpenModal = useCallback((item: CurrencyData) => {
    setSelectedCurrency(item);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

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

  if (loading && currencies.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando moedas globais...</Text>
      </View>
    );
  }

  if (error && currencies.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Ocorreu um erro ao carregar os dados.
        </Text>
        <Button
          title="Tentar Novamente"
          onPress={onRefresh}
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
        data={currencies}
        keyExtractor={(item) => item.id}
        renderItem={renderCurrencyCard}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
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
          <>
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
          </>
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
