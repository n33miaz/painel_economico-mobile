import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
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
import ScreenHeader from "./ScreenHeader";

interface AssetListScreenProps {
  data: Indicator[];
  emptyMessage: string;
  symbol?: string;
  title?: string;
}

export default function AssetListScreen({
  data,
  emptyMessage,
  symbol,
  title = "Mercado",
}: AssetListScreenProps) {
  const { loading, fetchIndicators } = useIndicatorStore();
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

  return (
    <View style={styles.container}>
      <ScreenHeader title={title} subtitle="Cotações em tempo real" />

      {loading && data.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Atualizando mercado...</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
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
        />
      )}

      {selectedItem && (
        <DetailsModal
          visible={modalVisible}
          onClose={handleCloseModal}
          title={selectedItem.name}
          currencyCode={
            isCurrencyData(selectedItem) ? selectedItem.code : undefined
          }
        >
          <View>
            {isCurrencyData(selectedItem) ? (
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Compra</Text>
                  <Text style={styles.infoValue}>
                    R$ {selectedItem.buy.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Venda</Text>
                  <Text style={styles.infoValue}>
                    {selectedItem.sell
                      ? `R$ ${selectedItem.sell.toFixed(2)}`
                      : "N/A"}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.modalText}>
                Pontos: {selectedItem.points?.toFixed(2)}
              </Text>
            )}

            <View style={styles.variationContainer}>
              <Text style={styles.variationLabel}>Variação do Dia</Text>
              <Text
                style={[
                  styles.variationValue,
                  {
                    color:
                      selectedItem.variation >= 0
                        ? colors.success
                        : colors.danger,
                  },
                ]}
              >
                {selectedItem.variation > 0 ? "+" : ""}
                {selectedItem.variation.toFixed(2)}%
              </Text>
            </View>

            {isCurrencyData(selectedItem) && (
              <HistoricalChart currencyCode={selectedItem.code} />
            )}
          </View>
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
  listContent: {
    paddingTop: 10,
    paddingBottom: 20,
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
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  modalText: {
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: "center",
    fontFamily: "Roboto_700Bold",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
  },
  infoItem: {
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontFamily: "Roboto_700Bold",
    color: colors.textPrimary,
  },
  variationContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  variationLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  variationValue: {
    fontSize: 24,
    fontFamily: "Roboto_700Bold",
  },
});
