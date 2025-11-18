import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";

import { colors } from "../theme/colors";
import { NewsArticle } from "../services/newsApi";

interface NewsCardProps {
  article: NewsArticle;
}

export default function NewsCard({ article }: NewsCardProps) {
  const handlePress = () => {
    Linking.openURL(article.url);
  };

  const formattedDate = new Date(article.publishedAt).toLocaleDateString(
    "pt-BR",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Image
        source={{
          uri:
            article.urlToImage ||
            "https://via.placeholder.com/150?text=Sem+Imagem",
        }}
        style={styles.image}
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
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 180,
  },
  content: {
    padding: 16,
  },
  source: {
    color: colors.primary,
    fontWeight: "bold",
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: "Roboto_700Bold",
    color: colors.textPrimary,
    lineHeight: 24,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
  },
});
