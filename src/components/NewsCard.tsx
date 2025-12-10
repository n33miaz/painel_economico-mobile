import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";

import { colors } from "../theme/colors";
import { NewsArticle } from "../services/api";

interface NewsCardProps {
  article: NewsArticle;
}

const NewsCard = React.memo(({ article }: NewsCardProps) => {
  const handlePress = useCallback(async () => {
    const supported = await Linking.canOpenURL(article.url);
    if (supported) {
      await Linking.openURL(article.url);
    }
  }, [article.url]);

  const formattedDate = useMemo(() => {
    if (!article.publishedAt) return "";
    return new Date(article.publishedAt).toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [article.publishedAt]);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Ler notícia: ${article.title}`}
      accessibilityHint="Abre a notícia completa no navegador"
    >
      <Image
        source={{
          uri:
            article.urlToImage ||
            "https://via.placeholder.com/150?text=Sem+Imagem",
        }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.source}>{article.source.name}</Text>
        <Text style={styles.title} numberOfLines={3}>
          {article.title}
        </Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
    </TouchableOpacity>
  );
});

export default NewsCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 180,
    backgroundColor: "#e1e4e8",
  },
  content: {
    padding: 16,
  },
  source: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: "Roboto_700Bold",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 18,
    fontFamily: "Roboto_700Bold",
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: "Roboto_400Regular",
  },
});
