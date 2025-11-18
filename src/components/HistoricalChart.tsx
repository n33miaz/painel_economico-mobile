import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

import { colors } from "../theme/colors";
import { getHistoricalData } from "../services/api";

interface HistoricalChartProps {
  id: string;
}

const screenWidth = Dimensions.get("window").width;

export default function HistoricalChart({
  id,
}: HistoricalChartProps) {
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: { data: number[] }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const historicalData = await getHistoricalData(id);

        if (historicalData.length === 0) {
          throw new Error("Dados históricos não disponíveis.");
        }

        const reversedData = [...historicalData].reverse();
        const labels = reversedData.map((point) => {
          const date = new Date(Number(point.timestamp) * 1000);
          return `${date.getDate()}/${date.getMonth() + 1}`;
        });

        setChartData({
          labels: labels,
          datasets: [
            {
              data: reversedData.map((point) => parseFloat(point.high)),
            },
          ],
        });
      } catch (e: any) {
        setError(e.message || "Não foi possível carregar o gráfico.");
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error || !chartData) {
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
        data={chartData}
        width={screenWidth * 0.8}
        height={180}
        yAxisLabel="R$ "
        yAxisInterval={1}
        chartConfig={{
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
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
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
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "Roboto_700Bold",
  },
  centered: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: colors.danger,
  },
});
