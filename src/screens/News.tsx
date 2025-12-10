import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Button,
} from "react-native";

import { colors } from "../theme/colors";
import NewsCard from "../components/NewsCard";
import useNewsData from "../hooks/useNewsData";
import { NewsArticle } from "../services/api";

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

  if (loading && !articles?.length) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando notícias...</Text>
      </View>
    );
  }

  if (error && !articles?.length) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <View style={styles.buttonContainer}>
          <Button
            title="Tentar Novamente"
            onPress={fetchNews}
            color={colors.primary}
          />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        initialNumToRender={5}
        windowSize={3}
        maxToRenderPerBatch={5}
        data={articles}
        keyExtractor={(item, index) => `${item.url}-${index}`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        renderItem={renderNewsCard}
        ListHeaderComponent={
          <Text style={styles.headerTitle}>Principais Notícias</Text>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>Nenhuma notícia encontrada.</Text>
            </View>
          ) : null
        }
        contentContainerStyle={
          articles?.length === 0 ? styles.listContentEmpty : undefined
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
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: colors.textSecondary,
    fontFamily: "Roboto_400Regular",
  },
  errorText: {
    color: colors.danger,
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
  headerTitle: {
    fontSize: 32,
    fontFamily: "Roboto_700Bold",
    color: colors.textPrimary,
    marginHorizontal: 16,
    marginVertical: 20,
  },
  buttonContainer: {
    marginTop: 10,
  },
});
