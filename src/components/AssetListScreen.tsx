import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Button,
  LayoutAnimation,
  RefreshControl,
} from "react-native";

import { colors } from "../theme/colors";
import { Indicator, isCurrencyData, isIndexData } from "../services/api";
import IndicatorCard from "./IndicatorCard";
import HistoricalChart from "./HistoricalChart";
import DetailsModal from "./DetailsModal";
import { useFavoritesStore } from "../store/favoritesStore";
import { useIndicatorStore } from "../store/indicatorStore";

interface AssetListScreenProps {
  data: Indicator[];
  emptyMessage: string;
  symbol?: string;
}

export default function AssetListScreen({
  data,
  emptyMessage,
  symbol,
}: AssetListScreenProps) {
  const { loading, error, fetchIndicators } = useIndicatorStore();
  const { favorites, toggleFavorite } = useFavoritesStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Indicator | null>(null);

  useEffect(() => {
    fetchIndicators();
  }, [fetchIndicators]);

  const onRefresh = useCallback(async () => {
    await fetchIndicators();
  }, [fetchIndicators]);

  const handleToggleFavorite = useCallback(
    (id: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      toggleFavorite(id);
    },
    [toggleFavorite]
  );

  const handleOpenModal = useCallback((item: Indicator) => {
    setSelectedItem(item);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedItem(null);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Indicator }) => {
      let displaySymbol = symbol;
      if (!displaySymbol) {
        displaySymbol =
          isIndexData(item) && item.name === "IBOVESPA" ? "pts" : "R$";
      }

      const displayValue = item.points !== undefined ? item.points : item.buy;

      return (
        <IndicatorCard
          name={item.name}
          id={item.id}
          value={displayValue}
          variation={item.variation}
          isFavorite={favorites.includes(item.id)}
          onPress={() => handleOpenModal(item)}
          onToggleFavorite={handleToggleFavorite}
          symbol={displaySymbol}
        />
      );
    },
    [favorites, handleToggleFavorite, handleOpenModal, symbol]
  );

  if (loading && data.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Atualizando mercado...</Text>
      </View>
    );
  }

  if (error && data.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Mercado indisponível no momento.</Text>
        <Button title="Reconectar" onPress={onRefresh} color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderItem}
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
              <Text style={styles.emptyText}>{emptyMessage}</Text>
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {selectedItem && (
        <DetailsModal
          visible={modalVisible}
          onClose={handleCloseModal}
          title={selectedItem.name}
          currencyCode={
            isCurrencyData(selectedItem) ? selectedItem.code : undefined
          }
        >
          <>
            {isCurrencyData(selectedItem) ? (
              <>
                <Text style={styles.modalText}>
                  Compra: R$ {selectedItem.buy.toFixed(2)}
                </Text>
                <Text style={styles.modalText}>
                  Venda:{" "}
                  {selectedItem.sell
                    ? `R$ ${selectedItem.sell.toFixed(2)}`
                    : "N/A"}
                </Text>
              </>
            ) : (
              <Text style={styles.modalText}>
                Pontos: {selectedItem.points?.toFixed(2)}
              </Text>
            )}

            <Text style={styles.modalText}>
              Variação: {selectedItem.variation.toFixed(2)}%
            </Text>

            {isCurrencyData(selectedItem) && (
              <HistoricalChart currencyCode={selectedItem.code} />
            )}
          </>
        </DetailsModal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: colors.textSecondary,
  },
  errorText: {
    color: colors.danger,
    marginBottom: 10,
    textAlign: "center",
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  modalText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 10,
    textAlign: "center",
    fontFamily: "Roboto_400Regular",
  },
});
