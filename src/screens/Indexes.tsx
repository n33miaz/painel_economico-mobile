import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  Button,
  LayoutAnimation,
} from "react-native";

import { colors } from "../theme/colors";
import useApiData from "../hooks/useApiData";
import { IndexData, isIndexData } from "../services/api";
import IndicatorCard from "../components/IndicatorCard";
import DetailsModal from "../components/DetailsModal";
import { useFavoritesStore } from "../store/favoritesStore";

const DESIRED_INDEXES = ["IBOVESPA", "CDI", "SELIC"];

export default function Indexes() {
  const {
    data: indexes,
    loading,
    error,
    fetchData: refreshData,
  } = useApiData<IndexData>(
    "/indicators/all",
    "@indexes",
    isIndexData,
    10 * 60 * 1000,
    (item) => DESIRED_INDEXES.includes(item.name)
  );

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<IndexData | null>(null);

  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const handleToggleFavorite = useCallback(
    (id: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      toggleFavorite(id);
    },
    [toggleFavorite]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  function handleOpenModal(item: IndexData) {
    setSelectedIndex(item);
    setModalVisible(true);
  }

  function handleCloseModal() {
    setModalVisible(false);
  }

  const renderIndexCard = useCallback(
    ({ item }: { item: IndexData }) => (
      <IndicatorCard
        name={item.name}
        id={item.id}
        value={item.points || 0}
        variation={item.variation}
        symbol={item.name === "IBOVESPA" ? "pts" : "%"}
        isFavorite={favorites.includes(item.id)}
        onPress={() => handleOpenModal(item)}
        onToggleFavorite={handleToggleFavorite}
      />
    ),
    [favorites, handleToggleFavorite]
  );

  if (loading && !indexes) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando índices...</Text>
      </View>
    );
  }

  if (error && !indexes) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Ocorreu um erro ao carregar os dados.
        </Text>
        <Button
          title="Tentar Novamente"
          onPress={refreshData}
          color={colors.primary}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={indexes || []}
        keyExtractor={(item) => item.id}
        renderItem={renderIndexCard}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text>Nenhum índice encontrado.</Text>
          </View>
        }
      />

      {selectedIndex && (
        <DetailsModal
          visible={modalVisible}
          onClose={handleCloseModal}
          title={selectedIndex.name}
        >
          {selectedIndex.points !== undefined && (
            <Text style={styles.modalText}>
              Pontos: {selectedIndex.points.toFixed(2)}
            </Text>
          )}
          <Text style={styles.modalText}>
            Variação: {selectedIndex.variation.toFixed(2)}%
          </Text>
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
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorText: {
    color: colors.danger,
    fontSize: 16,
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
