import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";

import { colors } from "../theme/colors";
import NewsCard from "../components/NewsCard";
import useNewsData from "../hooks/useNewsData";
import { NewsArticle } from "../services/api";
import ScreenHeader from "../components/ScreenHeader";
import PageContainer from "../components/PageContainer";

export default function News() {
  const { articles, loading, error, fetchNews } = useNewsData();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNews();
    setRefreshing(false);
  }, [fetchNews]);

  const renderNewsCard = useCallback(
    ({ item }: { item: NewsArticle }) => <NewsCard article={item} />,
    []
  );

  return (
    <PageContainer>
      <ScreenHeader title="Notícias" subtitle="Fique por dentro do mercado" />

      {loading && !articles?.length ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando notícias...</Text>
        </View>
      ) : error && !articles?.length ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchNews}>
            <Text style={styles.retryText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item, index) =>
            item.url ? `${item.url}-${index}` : `news-${index}`
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          renderItem={renderNewsCard}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>
                {error
                  ? "Não foi possível carregar as notícias."
                  : "Nenhuma notícia encontrada."}
              </Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchNews}>
                <Text style={styles.retryText}>Atualizar</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontFamily: "Roboto_400Regular",
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
    fontFamily: "Roboto_400Regular",
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontFamily: "Roboto_400Regular",
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: "#FFF",
    fontFamily: "Roboto_700Bold",
  },
});
