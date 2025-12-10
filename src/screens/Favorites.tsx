import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  LayoutAnimation,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../theme/colors";
import { Indicator, isCurrencyData, isIndexData } from "../services/api";
import IndicatorCard from "../components/IndicatorCard";
import HistoricalChart from "../components/HistoricalChart";
import DetailsModal from "../components/DetailsModal";
import { useFavoritesStore } from "../store/favoritesStore";
import { useIndicatorStore } from "../store/indicatorStore";
import ScreenHeader from "../components/ScreenHeader";
import PageContainer from "../components/PageContainer";

export default function Favorites({ navigation }: any) {
  const { indicators, loading, fetchIndicators } = useIndicatorStore();
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

  return (
    <PageContainer>
      <ScreenHeader
        title="Meus Favoritos"
        subtitle={`${favoriteItems.length} ${
          favoriteItems.length === 1 ? "ativo" : "ativos"
        } acompanhados`}
      />

      {loading && favoriteItems.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={favoriteItems}
          keyExtractor={(item) => item.id}
          renderItem={renderFavoriteCard}
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
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBg}>
                  <Ionicons
                    name="star-outline"
                    size={48}
                    color={colors.inactive}
                  />
                </View>
                <Text style={styles.emptyText}>Sua lista está vazia</Text>
                <Text style={styles.emptySubText}>
                  Adicione moedas e índices para acompanhar suas cotações em
                  tempo real.
                </Text>
                <TouchableOpacity
                  style={styles.ctaButton}
                  onPress={() =>
                    navigation.navigate("Início", { screen: "Dashboard" })
                  }
                >
                  <Text style={styles.ctaButtonText}>Explorar Mercado</Text>
                </TouchableOpacity>
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
          </View>
        </DetailsModal>
      )}
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    marginTop: 60,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#EBF8FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    fontFamily: "Roboto_700Bold",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: "Roboto_400Regular",
  },
});
