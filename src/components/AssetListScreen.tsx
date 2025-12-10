import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  LayoutAnimation,
  RefreshControl,
  StatusBar,
} from "react-native";
import Constants from "expo-constants";

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
  title?: string;
}

export default function AssetListScreen({
  data,
  emptyMessage,
  symbol,
  title = "Mercado",
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

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryDark}
      />

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle}>Cotações em tempo real</Text>
      </View>

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
  headerContainer: {
    backgroundColor: colors.primaryDark,
    paddingTop: Constants.statusBarHeight + 20,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 1,
    marginBottom: -10,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Roboto_700Bold",
    color: "#FFF",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Roboto_400Regular",
    marginTop: 4,
  },
  listContent: {
    paddingTop: 20,
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
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 10,
    textAlign: "center",
    fontFamily: "Roboto_400Regular",
  },
});
