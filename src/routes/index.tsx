import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import CurrenciesScreen from "../screens/CurrenciesScreen";
import GlobalCurrenciesScreen from "../screens/GlobalCurrenciesScreen";
import IndexesScreen from "../screens/IndexesScreen";
import NewsScreen from "../screens/NewsScreen";
import AboutScreen from "../screens/AboutScreen";

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Moedas") {
            iconName = focused ? "cash" : "cash-outline";
          } else if (route.name === "Índices") {
            iconName = focused ? "stats-chart" : "stats-chart-outline";
          }
          // https://icons.expo.fyi/
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Moedas" component={CurrenciesScreen} />
      <Tab.Screen name="Índices" component={IndexesScreen} />
    </Tab.Navigator>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator initialRouteName="Início">
      <Drawer.Screen
        name="Início"
        component={TabNavigator}
        options={{ title: "Dashboard Brasil" }}
      />
      <Drawer.Screen name="Moedas Globais" component={GlobalCurrenciesScreen} />
      <Drawer.Screen name="Notícias" component={NewsScreen} />
      <Drawer.Screen name="Sobre" component={AboutScreen} />
    </Drawer.Navigator>
  );
}

export default function Routes() {
  return (
    <NavigationContainer>
      <DrawerNavigator />
    </NavigationContainer>
  );
}
