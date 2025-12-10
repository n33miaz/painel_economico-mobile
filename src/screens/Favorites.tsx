import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  LayoutAnimation,
  ActivityIndicator,
  RefreshControl,
  Button,
} from "react-native";

import { colors } from "../theme/colors";
import {
  Indicator,
  isCurrencyData,
  isIndexData,
} from "../services/api";
import IndicatorCard from "../components/IndicatorCard";
import HistoricalChart from "../components/HistoricalChart";
import DetailsModal from "../components/DetailsModal";
import { useFavoritesStore } from "../store/favoritesStore";
import { useIndicatorStore } from "../store/indicatorStore";

export default function Favorites() {
  const { indicators, loading, error, fetchIndicators } = useIndicatorStore();
  const { favorites, toggleFavorite } = useFavoritesStore();

  useEffect(() => {
    fetchIndicators();
  }, [fetchIndicators]);

  const favoriteItems = useMemo(() => {
    return indicators.filter((item) => favorites.includes(item.id));
  }, [indicators, favorites]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Indicator | null>(null);

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

  const handleOpenModal = useCallback((item: Indicator) => {
    setSelectedItem(item);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedItem(null);
  }, []);

  const renderFavoriteCard = useCallback(
    ({ item }: { item: Indicator }) => {
      const isIndex = isIndexData(item);
      const isCurrency = isCurrencyData(item);

      const displayValue = isIndex ? item.points || 0 : item.buy;

      return (
        <IndicatorCard
          name={item.name}
          id={item.id}
          value={displayValue}
          variation={item.variation}
          isFavorite={true}
          onPress={() => handleOpenModal(item)}
          onToggleFavorite={handleToggleFavorite}
          symbol={isIndex && item.name === "IBOVESPA" ? "pts" : "R$"}
        />
      );
    },
    [handleToggleFavorite, handleOpenModal]
  );

  if (loading && favoriteItems.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error && favoriteItems.length === 0) {
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
    <SafeAreaView style={styles.container}>
      <FlatList
        data={favoriteItems}
        keyExtractor={(item) => item.id}
        renderItem={renderFavoriteCard}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <Text style={styles.headerTitle}>Meus Favoritos</Text>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Você ainda não adicionou favoritos.
              </Text>
              <Text style={styles.emptySubText}>
                Clique na estrela ☆ para acompanhar um ativo.
              </Text>
            </View>
          ) : null
        }
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
            {isIndexData(selectedItem) && (
              <Text style={styles.modalText}>
                Pontos: {(selectedItem.points || 0).toFixed(2)}
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
          </>
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
  errorText: {
    color: colors.danger,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
});
