import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  Button,
  LayoutAnimation,
  RefreshControl,
} from "react-native";

import { colors } from "../theme/colors";
import { IndexData, isIndexData } from "../services/api";
import IndicatorCard from "../components/IndicatorCard";
import DetailsModal from "../components/DetailsModal";
import { useFavoritesStore } from "../store/favoritesStore";
import { useIndicatorStore } from "../store/indicatorStore";

const DESIRED_INDEXES = ["IBOVESPA", "CDI", "SELIC"];

export default function Indexes() {
  const { indicators, loading, error, fetchIndicators } = useIndicatorStore();

  const indexes = useMemo(
    () =>
      indicators
        .filter(isIndexData)
        .filter((item) => DESIRED_INDEXES.includes(item.name)), 
    [indicators]
  );

  useEffect(() => {
    fetchIndicators();
  }, [fetchIndicators]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<IndexData | null>(null);

  const { favorites, toggleFavorite } = useFavoritesStore();

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

  const handleOpenModal = useCallback((item: IndexData) => {
    setSelectedIndex(item);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

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
    [favorites, handleToggleFavorite, handleOpenModal]
  );

  if (loading && indexes.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando índices...</Text>
      </View>
    );
  }

  if (error && indexes.length === 0) {
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
    <View style={styles.container}>
      <FlatList
        data={indexes}
        keyExtractor={(item) => item.id}
        renderItem={renderIndexCard}
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
              <Text>Nenhum índice encontrado.</Text>
            </View>
          ) : null
        }
      />

      {selectedIndex && (
        <DetailsModal
          visible={modalVisible}
          onClose={handleCloseModal}
          title={selectedIndex.name}
        >
          <>
            {selectedIndex.points !== undefined && (
              <Text style={styles.modalText}>
                Pontos: {selectedIndex.points.toFixed(2)}
              </Text>
            )}
            <Text style={styles.modalText}>
              Variação: {selectedIndex.variation.toFixed(2)}%
            </Text>
          </>
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
