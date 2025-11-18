import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import Constants from "expo-constants";

import { colors } from "../theme/colors";
import useApiData from "../hooks/useApiData";
import { CurrencyData, isCurrencyData } from "../services/api";
import HighlightCard from "../components/HighlightCard";

const HIGHLIGHT_ITEMS = ["USD", "EUR", "CAD"];

export default function HomeScreen() {
  const {
    data: highlights,
    loading,
    error,
  } = useApiData<CurrencyData>(
    "/all",
    "@highlights",
    isCurrencyData,
    5 * 60 * 1000,
    (item) => HIGHLIGHT_ITEMS.includes(item.code)
  );

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

      {loading && (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 40 }}
        />
      )}

      {error && (
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

      {/* Futuramente, aqui entrará a seção de notícias */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Últimas Notícias</Text>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            (A seção de notícias será implementada em breve)
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Constants.statusBarHeight,
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
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
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
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Roboto_700Bold",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  placeholder: {
    backgroundColor: colors.cardBackground,
    height: 150,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: colors.textSecondary,
  },
});
