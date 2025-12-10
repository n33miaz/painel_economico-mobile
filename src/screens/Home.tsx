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
  StatusBar,
} from "react-native";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../theme/colors";
import useNewsData from "../hooks/useNewsData";
import { Indicator, isCurrencyData } from "../services/api";
import HighlightCard from "../components/HighlightCard";
import { useIndicatorStore } from "../store/indicatorStore";

const HIGHLIGHT_ITEMS = ["USD", "EUR", "BTC"];

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

  const highlights: Indicator[] = useMemo(() => {
    const filtered = indicators
      .filter(isCurrencyData)
      .filter((currency) => HIGHLIGHT_ITEMS.includes(currency.code));

    const uniqueMap = new Map();
    filtered.forEach((item) => {
      if (!uniqueMap.has(item.code)) {
        uniqueMap.set(item.code, item);
      }
    });

    return Array.from(uniqueMap.values());
  }, [indicators]);

  const recentNews = useMemo(() => {
    return news ? news.slice(0, 4) : [];
  }, [news]);

  const isContentLoading = indicatorsLoading || newsLoading;

  const onRefresh = useCallback(async () => {
    await Promise.all([fetchIndicators(), fetchNews()]);
  }, [fetchIndicators, fetchNews]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryDark}
      />

      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.openDrawer()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="menu" size={28} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.textContainer}>
            <Text style={styles.greetingText}>{getGreeting()}, Investidor</Text>
            <Text style={styles.welcomeText}>Confira o mercado hoje</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isContentLoading}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Seção de Destaques */}
        <View style={styles.highlightsSection}>
          {isContentLoading && highlights.length === 0 ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={{ marginTop: 20 }}
            />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.highlightsScroll}
            >
              {highlights.map((item, index) => (
                <View
                  key={`${item.id}-${index}`}
                  style={styles.highlightWrapper}
                >
                  <HighlightCard
                    title={item.code}
                    value={item.buy}
                    variation={item.variation}
                    iconName={
                      item.code === "BTC" ? "logo-bitcoin" : "cash-outline"
                    }
                  />
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Giro de Notícias</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Notícias")}>
              <Text style={styles.seeAll}>Ver tudo</Text>
            </TouchableOpacity>
          </View>

          {recentNews.length > 0
            ? recentNews.map((article, index) => (
                <TouchableOpacity
                  key={`${article.url}-${index}`}
                  style={styles.newsItem}
                  onPress={() => Linking.openURL(article.url)}
                  activeOpacity={0.7}
                >
                  <View style={styles.newsContent}>
                    <Text style={styles.newsSource}>{article.source.name}</Text>
                    <Text style={styles.newsTitle} numberOfLines={2}>
                      {article.title}
                    </Text>
                    <Text style={styles.newsDate}>Toque para ler mais</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.inactive}
                  />
                </TouchableOpacity>
              ))
            : !isContentLoading && (
                <Text style={styles.emptyText}>
                  Nenhuma notícia no momento.
                </Text>
              )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    backgroundColor: colors.primaryDark,
    paddingTop: Constants.statusBarHeight + 10,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuButton: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  greetingText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontFamily: "Roboto_400Regular",
  },
  welcomeText: {
    color: "#FFF",
    fontSize: 20,
    fontFamily: "Roboto_700Bold",
    marginTop: 2,
  },
  scrollContainer: {
    flex: 1,
    marginTop: -20,
    zIndex: 2,
  },
  highlightsSection: {
    marginBottom: 24,
  },
  highlightsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  highlightWrapper: {
    width: 160,
    marginRight: 0,
  },
  section: {
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  newsContent: {
    flex: 1,
    marginRight: 12,
  },
  newsSource: {
    color: colors.primary,
    fontSize: 10,
    fontFamily: "Roboto_700Bold",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  newsTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: "Roboto_700Bold",
    lineHeight: 20,
    marginBottom: 6,
  },
  newsDate: {
    color: colors.textSecondary,
    fontSize: 10,
  },
  emptyText: {
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: 20,
  },
});
