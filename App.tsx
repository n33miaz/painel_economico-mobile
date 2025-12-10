import "react-native-gesture-handler";
import React, { useCallback, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Roboto_400Regular,
  Roboto_700Bold,
} from "@expo-google-fonts/roboto";
import { View, Platform, UIManager, StyleSheet } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import * as SplashScreen from "expo-splash-screen";

import Routes from "./src/routes";
import { colors } from "./src/theme/colors";

SplashScreen.preventAutoHideAsync();

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
    async function configureSystemBars() {
      if (Platform.OS === "android") {
        await NavigationBar.setBackgroundColorAsync("white");
        await NavigationBar.setButtonStyleAsync("dark");
      }
    }
    configureSystemBars();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <StatusBar style="light" backgroundColor={colors.primaryDark} />
      <Routes />
    </View>
  );
}
