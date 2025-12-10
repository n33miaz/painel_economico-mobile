import React, { useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  GestureResponderEvent,
  Animated,
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
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const variationStyle = useMemo(() => {
      const isPositive = variation >= 0;
      return {
        color: isPositive ? colors.success : colors.danger,
        icon: (isPositive
          ? "caret-up"
          : "caret-down") as keyof typeof Ionicons.glyphMap,
        bg: isPositive ? "rgba(0, 200, 83, 0.1)" : "rgba(255, 59, 48, 0.1)",
      };
    }, [variation]);

    const displayName = useMemo(() => {
      return name.split("/")[0].replace("Comercial", "").trim();
    }, [name]);

    const handleFavoritePress = (e: GestureResponderEvent) => {
      e.stopPropagation();
      onToggleFavorite(id);
    };

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.card}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <View style={styles.headerRow}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="cash-outline"
                size={20}
                color={colors.primaryDark}
              />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={styles.cardSubtitle}>{symbol} - BRL</Text>
            </View>
            <TouchableOpacity
              onPress={handleFavoritePress}
              style={styles.favoriteButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={isFavorite ? "star" : "star-outline"}
                size={22}
                color={isFavorite ? colors.secondary : colors.inactive}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.footerRow}>
            <Text style={styles.cardValue}>
              {symbol} {value.toFixed(2)}
            </Text>

            <View
              style={[styles.badge, { backgroundColor: variationStyle.bg }]}
            >
              <Ionicons
                name={variationStyle.icon}
                size={12}
                color={variationStyle.color}
              />
              <Text
                style={[styles.variationText, { color: variationStyle.color }]}
              >
                {Math.abs(variation).toFixed(2)}%
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

export default IndicatorCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EBF8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: "Roboto_400Regular",
  },
  favoriteButton: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardValue: {
    fontSize: 20,
    fontFamily: "Roboto_700Bold",
    color: colors.primaryDark,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  variationText: {
    fontSize: 12,
    fontFamily: "Roboto_700Bold",
    marginLeft: 4,
  },
});
