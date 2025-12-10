import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Roboto_400Regular,
  Roboto_700Bold,
} from "@expo-google-fonts/roboto";
import { View, Platform, UIManager, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as NavigationBar from "expo-navigation-bar";

import Routes from "./src/routes";
import { colors } from "./src/theme/colors";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold,
  });

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync("white");
      NavigationBar.setButtonStyleAsync("dark");
    }
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <View style={styles.iconWrapper}>
          <Ionicons name="stats-chart" size={60} color={colors.primaryDark} />
        </View>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" backgroundColor={colors.primaryDark} />
      <Routes />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.primaryDark,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapper: {
    width: 120,
    height: 120,
    backgroundColor: "white",
    borderRadius: 24, 
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});
