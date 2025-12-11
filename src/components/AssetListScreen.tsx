import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  LayoutAnimation,
  RefreshControl,
  ScrollView,
} from "react-native";

import { colors } from "../theme/colors";
import { Indicator, isCurrencyData, isIndexData } from "../services/api";
import IndicatorCard from "./IndicatorCard";
import HighlightCard from "./HighlightCard";
import DetailsModal from "./DetailsModal";
import SearchBar from "./SearchBar";
import PageContainer from "./PageContainer";
import HistoricalChart from "./HistoricalChart";
import { useFavoritesStore } from "../store/favoritesStore";
import { useIndicatorStore } from "../store/indicatorStore";

interface AssetListScreenProps {
  data: Indicator[];
  emptyMessage: string;
  symbol?: string;
  title?: string;
  featuredItems?: Indicator[];
}

export default function AssetListScreen({
  data,
  emptyMessage,
  symbol,
  featuredItems = [],
}: AssetListScreenProps) {
  const { loading, fetchIndicators } = useIndicatorStore();
  const { favorites, toggleFavorite } = useFavoritesStore();

  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Indicator | null>(null);

  useEffect(() => {
    fetchIndicators();
  }, [fetchIndicators]);

  const filteredData = useMemo(() => {
    if (!searchText) return data;
    const lowerSearch = searchText.toLowerCase();
    return data.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerSearch) ||
        item.code.toLowerCase().includes(lowerSearch) ||
        item.id.toLowerCase().includes(lowerSearch)
    );
  }, [data, searchText]);

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

  const renderHeader = useMemo(() => {
    if (searchText) return null;

    return (
      <View>
        {featuredItems.length > 0 && (
          <View style={styles.highlightsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.highlightsScroll}
            >
              {featuredItems.map((item) => (
                <View
                  key={`highlight-${item.id}`}
                  style={styles.highlightWrapper}
                >
                  <HighlightCard
                    title={item.code || item.name}
                    value={item.points || item.buy}
                    variation={item.variation}
                    iconName={
                      item.code === "BTC" || item.id.includes("BTC")
                        ? "logo-bitcoin"
                        : "stats-chart"
                    }
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  }, [searchText, featuredItems]);

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
    <PageContainer>
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Buscar..."
          value={searchText}
          onChangeText={setSearchText}
          onClear={() => setSearchText("")}
        />
      </View>

      {loading && data.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Atualizando mercado...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
              progressViewOffset={10}
            />
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.centeredEmpty}>
                <Text style={styles.emptyText}>
                  {searchText
                    ? `Nenhum resultado para "${searchText}"`
                    : emptyMessage}
                </Text>
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
                Pontos: {(selectedItem.points || 0).toFixed(2)}
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
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: colors.background,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  listContent: {
    padding: 20,
    paddingTop: 8,
  },
  highlightsContainer: {
    marginBottom: 16,
    marginTop: 8,
  },
  highlightsScroll: {
    paddingHorizontal: 16,
  },
  highlightWrapper: {
    width: 150,
    marginRight: 0,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  centeredEmpty: {
    marginTop: 60,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: colors.textSecondary,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
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
