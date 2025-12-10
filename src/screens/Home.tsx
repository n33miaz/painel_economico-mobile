import React, { useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Linking,
  RefreshControl,
} from "react-native";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../theme/colors";
import useNewsData from "../hooks/useNewsData";
import { Indicator, isCurrencyData } from "../services/api";
import HighlightCard from "../components/HighlightCard";
import { useIndicatorStore } from "../store/indicatorStore";

const HIGHLIGHT_ITEMS = ["USD", "EUR", "CAD"];

export default function Home({ navigation }: any) {
  const {
    indicators,
    loading: indicatorsLoading,
    error: indicatorsError,
    fetchIndicators,
  } = useIndicatorStore();

  const { articles: news, loading: newsLoading, fetchNews } = useNewsData();

  useEffect(() => {
    fetchIndicators();
    fetchNews();
  }, [fetchIndicators, fetchNews]);

  const highlights: Indicator[] = useMemo(
    () =>
      indicators
        .filter(isCurrencyData)
        .filter((currency) => HIGHLIGHT_ITEMS.includes(currency.code)),
    [indicators]
  );

  const recentNews = useMemo(() => {
    return news ? news.slice(0, 3) : [];
  }, [news]);

  const isContentLoading = indicatorsLoading || newsLoading;

  const onRefresh = useCallback(async () => {
    await Promise.all([fetchIndicators(), fetchNews()]);
  }, [fetchIndicators, fetchNews]);

  const getIconForCode = (code: string): keyof typeof Ionicons.glyphMap => {
    switch (code) {
      case "USD":
        return "logo-usd";
      case "EUR":
        return "logo-euro";
      case "CAD":
        return "cash-outline";
      default:
        return "analytics";
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl
          refreshing={isContentLoading}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Resumo do mercado hoje</Text>
      </View>

      {isContentLoading && highlights.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          {indicatorsError && (
            <Text style={styles.errorText}>
              Não foi possível carregar os destaques.
            </Text>
          )}

          <View style={styles.highlightRow}>
            {highlights.map((item) => (
              <HighlightCard
                key={item.id}
                title={item.name.split("/")[0]}
                value={item.buy}
                variation={item.variation}
                iconName={getIconForCode(item.code)}
              />
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Últimas Notícias</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Notícias")}>
                <Text style={styles.seeAll}>Ver todas</Text>
              </TouchableOpacity>
            </View>

            {recentNews.length > 0
              ? recentNews.map((article, index) => (
                  <TouchableOpacity
                    key={`${article.url}-${index}`}
                    style={styles.newsItem}
                    onPress={() => Linking.openURL(article.url)}
                  >
                    <Text style={styles.newsSource}>{article.source.name}</Text>
                    <Text style={styles.newsTitle} numberOfLines={2}>
                      {article.title}
                    </Text>
                  </TouchableOpacity>
                ))
              : !isContentLoading && (
                  <Text style={styles.errorText}>
                    Nenhuma notícia encontrada.
                  </Text>
                )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Constants.statusBarHeight,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: "Roboto_700Bold",
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: "Roboto_400Regular",
    marginTop: 4,
  },
  highlightRow: {
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "center",
  },
  errorText: {
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: 20,
    paddingHorizontal: 24,
    fontFamily: "Roboto_400Regular",
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Roboto_700Bold",
    color: colors.textPrimary,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary,
    fontFamily: "Roboto_700Bold",
  },
  newsItem: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  newsSource: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: "Roboto_400Regular",
    marginBottom: 4,
  },
  newsTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
    lineHeight: 22,
  },
});
