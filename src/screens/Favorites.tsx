import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  UIManager,
  Platform,
  LayoutAnimation,
  ActivityIndicator,
} from "react-native";

import { useFavoritesStore } from "../store/favoritesStore";
import useApiData from "../hooks/useApiData";
import {
  CurrencyData,
  IndexData,
  isCurrencyData,
  isIndexData,
} from "../services/api";
import IndicatorCard from "../components/IndicatorCard";
import { colors } from "../theme/colors";

type CombinedData = CurrencyData | IndexData;

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Favorites() {
  const { data: allData, loading } = useApiData<CombinedData>(
    "/all",
    "@all_data_for_favorites",
    (item): item is CombinedData => isCurrencyData(item) || isIndexData(item)
  );

  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const handleToggleFavorite = (code: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    toggleFavorite(code);
  };

  const favoriteItems = React.useMemo(() => {
    if (!allData) return [];
    return allData.filter((item) =>
      favorites.includes(isCurrencyData(item) ? item.code : item.name)
    );
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
        data={favoriteItems}
        keyExtractor={(item) => (isCurrencyData(item) ? item.code : item.name)}
        renderItem={({ item }) => {
          const isIndex = isIndexData(item);
          const isCurrency = isCurrencyData(item);

          return (
            <IndicatorCard
              name={item.name}
              code={isCurrency ? item.code : item.name}
              value={isIndex ? item.points : isCurrency ? item.buy : 0}
              variation={item.variation}
              isFavorite={true}
              onPress={() => {
                alert("Funcionalide de Modal em breve.") // TODO
              }}
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
});
