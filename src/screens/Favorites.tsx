import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  LayoutAnimation,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import { colors } from "../theme/colors";
import useApiData from "../hooks/useApiData";
import {
  CurrencyData,
  IndexData,
  isCurrencyData,
  isIndexData,
} from "../services/api";
import IndicatorCard from "../components/IndicatorCard";
import HistoricalChart from "../components/HistoricalChart";
import DetailsModal from "../components/DetailsModal";
import { useFavoritesStore } from "../store/favoritesStore";

type CombinedData = CurrencyData | IndexData;

export default function Favorites() {
  const {
    data: allData,
    loading,
    fetchData: refreshAllData,
  } = useApiData<CombinedData>(
    "/indicators/all",
    "@all_indicators",
    (item): item is CombinedData => isCurrencyData(item) || isIndexData(item)
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CombinedData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const handleToggleFavorite = useCallback(
    (id: string) => {
      // Animação suave ao remover um item da lista
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      toggleFavorite(id);
    },
    [toggleFavorite]
  );

  function handleOpenModal(item: CombinedData) {
    setSelectedItem(item);
    setModalVisible(true);
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshAllData();
    setRefreshing(false);
  }, [refreshAllData]);

  const favoriteItems = useMemo(() => {
    if (!allData) return [];
    return allData.filter((item) => favorites.includes(item.id));
  }, [allData, favorites]);

  if (loading && favoriteItems.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderFavoriteCard = useCallback(
    ({ item }: { item: CombinedData }) => {
      const isIndex = isIndexData(item);
      const isCurrency = isCurrencyData(item);

      return (
        <IndicatorCard
          name={item.name}
          id={item.id}
          value={isIndex ? item.points : isCurrency ? item.buy : 0}
          variation={item.variation}
          isFavorite={true}
          onPress={() => handleOpenModal(item)}
          onToggleFavorite={handleToggleFavorite}
          symbol={isIndex && item.name === "IBOVESPA" ? "pts" : "R$"}
        />
      );
    },
    [handleToggleFavorite]
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={favoriteItems}
        keyExtractor={(item) => item.id}
        renderItem={renderFavoriteCard}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <Text style={styles.headerTitle}>Meus Favoritos</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Você ainda não adicionou favoritos.
            </Text>
            <Text style={styles.emptySubText}>
              Clique na estrela ☆ para acompanhar um ativo.
            </Text>
          </View>
        }
      />

      {selectedItem && (
        <DetailsModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title={selectedItem.name}
        >
          {isIndexData(selectedItem) && (
            <Text style={styles.modalText}>
              Pontos: {selectedItem.points.toFixed(2)}
            </Text>
          )}
          {isCurrencyData(selectedItem) && (
            <Text style={styles.modalText}>
              Compra: R$ {selectedItem.buy.toFixed(2)}
            </Text>
          )}

          <Text style={styles.modalText}>
            Variação: {selectedItem.variation.toFixed(2)}%
          </Text>

          {isCurrencyData(selectedItem) && (
            <HistoricalChart currencyCode={selectedItem.code} />
          )}
        </DetailsModal>
      )}
    </SafeAreaView>
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
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: "Roboto_700Bold",
    color: colors.textPrimary,
    marginHorizontal: 16,
    marginVertical: 20,
  },
  emptyContainer: {
    flex: 1,
    marginTop: 100,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 20,
    fontFamily: "Roboto_700Bold",
    color: colors.textPrimary,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: "Roboto_400Regular",
  },
});
