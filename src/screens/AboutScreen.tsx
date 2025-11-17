import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Linking,
  Platform,
} from "react-native";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";

const LINKEDIN_URL = "https://www.linkedin.com/in/neemiasmanso/";

export default function AboutScreen() {
  const handlePress = () => {
    Linking.openURL(LINKEDIN_URL);
  };

  return (
    <View style={styles.container}>
      <Ionicons name="information-circle-outline" size={80} color="#3498db" />
      <Text style={styles.title}>Painel Econômico BR</Text>
      <Text style={styles.subtitle}>
        Versão {Constants.expoConfig?.version}
      </Text>
      <Text style={styles.description}>
        Aplicativo desenvolvido por Neemias Cormino Manso.
      </Text>
      <Button title="Ver meu LinkedIn" onPress={handlePress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingTop: Constants.statusBarHeight + 20,
  },
  title: {
    fontSize: 28,
    fontFamily: "Roboto_700Bold",
    marginVertical: 15,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "gray",
    fontFamily: "Roboto_400Regular",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginHorizontal: 20,
    marginBottom: 30,
    fontFamily: "Roboto_400Regular",
  },
});
