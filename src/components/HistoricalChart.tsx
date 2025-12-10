import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

import { colors } from "../theme/colors";
import { useHistoricalChartData } from "../hooks/useHistoricalChartData";

interface HistoricalChartProps {
  currencyCode: string;
}

const screenWidth = Dimensions.get("window").width;

export default function HistoricalChart({
  currencyCode,
}: HistoricalChartProps) {
  const { data, loading, error } = useHistoricalChartData(currencyCode);

  const chartConfig = useMemo(
    () => ({
      backgroundColor: colors.cardBackground,
      backgroundGradientFrom: colors.cardBackground,
      backgroundGradientTo: colors.cardBackground,
      decimalPlaces: 2,
      color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(28, 28, 30, ${opacity})`,
      style: {
        borderRadius: 16,
      },
      propsForDots: {
        r: "4",
        strokeWidth: "2",
        stroke: colors.primary,
      },
    }),
    []
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Variação (Últimos 7 dias)</Text>
      <LineChart
        data={data}
        width={screenWidth * 0.85}
        height={180}
        yAxisLabel="R$ "
        yAxisInterval={1}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withInnerLines={false}
        withOuterLines={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 12,
    fontFamily: "Roboto_700Bold",
  },
  centered: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: colors.danger,
    fontFamily: "Roboto_400Regular",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
