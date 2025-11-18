import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import Constants from "expo-constants";

import { colors } from "../theme/colors";
import useApiData from "../hooks/useApiData";
import useNewsData from "../hooks/useNewsData";
import { CurrencyData, isCurrencyData } from "../services/api";
import HighlightCard from "../components/HighlightCard";

const HIGHLIGHT_ITEMS = ["USD", "EUR", "CAD"];

export default function Home({ navigation }: any) {
  const {
    data: highlights,
    loading: highlightsLoading,
    error: highlightsError,
  } = useApiData<CurrencyData>(
    "/all",
    "@highlights",
    isCurrencyData,
    5 * 60 * 1000,
    (item) => HIGHLIGHT_ITEMS.includes(item.code)
  );

  const { articles: news, loading: newsLoading } = useNewsData({ pageSize: 3 });

  const isContentLoading = highlightsLoading || newsLoading;

  const getIconForCode = (code: string) => {
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Resumo do mercado hoje</Text>
      </View>

      {isContentLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          {highlightsError && (
            <Text style={styles.errorText}>
              Não foi possível carregar os destaques.
            </Text>
          )}

          <View style={styles.highlightRow}>
            {highlights?.map((item) => (
              <HighlightCard
                key={item.code}
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

            {news.map((article) => (
              <TouchableOpacity
                key={article.url}
                style={styles.newsItem}
                onPress={() => Linking.openURL(article.url)}
              >
                <Text style={styles.newsSource}>{article.source.name}</Text>
                <Text style={styles.newsTitle} numberOfLines={2}>
                  {article.title}
                </Text>
              </TouchableOpacity>
            ))}
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
    marginTop: 40,
    alignItems: "center",
    justifyContent: "center",
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
    marginTop: 4,
  },
  highlightRow: {
    paddingHorizontal: 16,
    flexDirection: "row",
  },
  errorText: {
    textAlign: "center",
    color: colors.danger,
    marginTop: 40,
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 24,
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
    fontWeight: "bold",
  },
  newsItem: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  newsSource: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  newsTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
});
