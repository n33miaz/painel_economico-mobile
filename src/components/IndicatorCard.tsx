import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  GestureResponderEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../theme/colors";

interface IndicatorCardProps {
  name: string;
  id: string;
  value: number;
  variation: number;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: (id: string) => void;
  symbol?: string;
}

const IndicatorCard: React.FC<IndicatorCardProps> = React.memo(
  ({
    name,
    id,
    value,
    variation,
    isFavorite,
    onPress,
    onToggleFavorite,
    symbol = "R$",
  }) => {
    const variationStyle = useMemo(() => {
      const isPositive = variation >= 0;
      return {
        color: isPositive ? colors.success : colors.danger,
        icon: (isPositive
          ? "arrow-up"
          : "arrow-down") as keyof typeof Ionicons.glyphMap,
      };
    }, [variation]);

    const displayName = useMemo(() => name.split("/")[0], [name]);

    const handleFavoritePress = (e: GestureResponderEvent) => {
      e.stopPropagation();
      onToggleFavorite(id);
    };

    return (
      <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={styles.content}>
          <Text style={styles.cardTitle}>{displayName}</Text>
          <Text style={styles.cardValue}>
            {symbol} {value.toFixed(2)}
          </Text>
        </View>
        <View style={styles.actions}>
          <View
            style={[
              styles.variationContainer,
              { backgroundColor: variationStyle.color },
            ]}
          >
            <Ionicons
              name={variationStyle.icon}
              size={16}
              color={colors.textLight}
            />
            <Text style={styles.variationText}>{variation.toFixed(2)}%</Text>
          </View>
          <TouchableOpacity
            onPress={handleFavoritePress}
            style={styles.starButton}
          >
            <Ionicons
              name={isFavorite ? "star" : "star-outline"}
              size={28}
              color={isFavorite ? colors.warning : colors.inactive}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }
);

export default IndicatorCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "Roboto_700Bold",
    color: colors.textPrimary,
  },
  cardValue: {
    fontSize: 22,
    color: colors.textSecondary,
    marginTop: 4,
    fontFamily: "Roboto_400Regular",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  variationContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  variationText: {
    color: colors.textLight,
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
    marginLeft: 4,
  },
  starButton: {
    marginLeft: 16,
    padding: 4,
  },
});
