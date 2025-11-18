import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
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

export default function Currencies() {
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

  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const handleToggleFavorite = useCallback(
    (code: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      toggleFavorite(code);
    },
    [toggleFavorite]
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
    [favorites, handleToggleFavorite]
  );

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
        initialNumToRender={10}
        windowSize={5}
        maxToRenderPerBatch={10}
        data={currencies || []}
        keyExtractor={(item) => item.id}
        renderItem={renderCurrencyCard}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text>Nenhuma moeda encontrada.</Text>
          </View>
        }
      />

      <DetailsModal
        visible={modalVisible}
        onClose={handleCloseModal}
        title={selectedCurrency?.name || "Detalhes da Moeda"}
      >
        {selectedCurrency && (
          <>
            <Text style={styles.modalText}>
              Compra: R$ {selectedCurrency.buy.toFixed(2)}
            </Text>
            <Text style={styles.modalText}>
              Venda: R${" "}
              {selectedCurrency.sell ? selectedCurrency.sell.toFixed(2) : "N/A"}
            </Text>
            <Text style={styles.modalText}>
              Variação: {selectedCurrency.variation.toFixed(2)}%
            </Text>
            <HistoricalChart currencyCode={selectedCurrency.id} />
          </>
        )}
      </DetailsModal>
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
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: "Roboto_400Regular",
  },
});
