import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  SafeAreaView,
} from "react-native";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../theme/colors";

const LINKEDIN_URL = "https://www.linkedin.com/in/neemiasmanso/";
const GITHUB_URL = "https://github.com/n33miaz";

export default function AboutScreen() {
  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="stats-chart" size={80} color={colors.primary} />
          <Text style={styles.title}>Painel Econômico</Text>
          <Text style={styles.subtitle}>
            Versão {Constants.expoConfig?.version}
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.description}>
            Aplicativo desenvolvido como parte de um projeto de estudos,
            consumindo APIs públicas para exibir cotações e índices econômicos
            em tempo real.
          </Text>
          <Text style={styles.author}>
            Desenvolvido por:{"\n"}
            <Text style={styles.authorName}>Neemias Cormino Manso</Text>
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.linkedinButton]}
            onPress={() => handleLinkPress(LINKEDIN_URL)}
          >
            <Ionicons name="logo-linkedin" size={24} color={colors.textLight} />
            <Text style={styles.buttonText}>LinkedIn</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.githubButton]}
            onPress={() => handleLinkPress(GITHUB_URL)}
          >
            <Ionicons name="logo-github" size={24} color={colors.textLight} />
            <Text style={styles.buttonText}>GitHub</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: "Roboto_700Bold",
    color: colors.textPrimary,
    marginVertical: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: "Roboto_400Regular",
  },
  content: {
    alignItems: "center",
    marginHorizontal: 20,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: colors.textSecondary,
    fontFamily: "Roboto_400Regular",
  },
  author: {
    fontSize: 16,
    textAlign: "center",
    color: colors.textSecondary,
    fontFamily: "Roboto_400Regular",
  },
  authorName: {
    fontFamily: "Roboto_700Bold",
    color: colors.textPrimary,
  },
  footer: {
    width: "100%",
    marginBottom: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  linkedinButton: {
    backgroundColor: "#0A66C2",
  },
  githubButton: {
    backgroundColor: "#181717",
  },
  buttonText: {
    color: colors.textLight,
    fontSize: 18,
    fontFamily: "Roboto_700Bold",
    marginLeft: 10,
  },
});
