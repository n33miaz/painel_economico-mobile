import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  LayoutAnimation,
  ActivityIndicator,
  Modal,
  Button,
  RefreshControl,
} from "react-native";

import { colors } from "../theme/colors";
import { useFavoritesStore } from "../store/favoritesStore";
import useApiData from "../hooks/useApiData";
import {
  CurrencyData,
  IndexData,
  isCurrencyData,
  isIndexData,
} from "../services/api";
import IndicatorCard from "../components/IndicatorCard";
import HistoricalChart from "../components/HistoricalChart";

type CombinedData = CurrencyData | IndexData;

export default function Favorites() {
  const {
    data: allData,
    loading,
    fetchData: refreshAllData,
  } = useApiData<CombinedData>(
    "/all",
    "@all_data_for_favorites",
    (item): item is CombinedData => isCurrencyData(item) || isIndexData(item)
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CombinedData | null>(null);

  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const [refreshing, setRefreshing] = useState(false);

  const handleToggleFavorite = useCallback(
    (id: string) => {
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

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        initialNumToRender={10}
        windowSize={5}
        maxToRenderPerBatch={10}
        data={favoriteItems}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
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
        }}
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{selectedItem?.name}</Text>
            {selectedItem && isIndexData(selectedItem) && (
              <Text style={styles.modalText}>
                Pontos: {selectedItem.points.toFixed(2)}
              </Text>
            )}
            {selectedItem && isCurrencyData(selectedItem) && (
              <Text style={styles.modalText}>
                Compra: R$ {selectedItem.buy.toFixed(2)}
              </Text>
            )}
            {selectedItem && (
              <Text style={styles.modalText}>
                Variação: {selectedItem.variation.toFixed(2)}%
              </Text>
            )}
            {selectedItem && isCurrencyData(selectedItem) && (
              <HistoricalChart id={selectedItem.id} />
            )}
            <View style={styles.buttonSeparator} />
            <Button
              title="Fechar"
              onPress={() => setModalVisible(false)}
              color={colors.primary}
            />
          </View>
        </View>
      </Modal>
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.transparent,
  },
  modalView: {
    width: "90%",
    margin: 20,
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16,
    color: colors.textSecondary,
  },
  buttonSeparator: {
    borderBottomColor: "#e0e0e0",
    borderBottomWidth: StyleSheet.hairlineWidth,
    width: "100%",
    marginVertical: 15,
  },
});
