import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../theme/colors";

import Home from "../screens/Home";
import Currencies from "../screens/Currencies";
import GlobalCurrencies from "../screens/GlobalCurrencies";
import Indexes from "../screens/Indexes";
import News from "../screens/News";
import About from "../screens/About";
import Favorites from '../screens/Favorites';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Moedas") {
            iconName = focused ? "cash" : "cash-outline";
          } else if (route.name === "Índices") {
            iconName = focused ? "stats-chart" : "stats-chart-outline";
          }
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inactive,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Moedas" component={Currencies} />
      <Tab.Screen name="Índices" component={Indexes} />
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
      <Drawer.Screen name="Favoritos" component={Favorites} />
      <Drawer.Screen name="Moedas Globais" component={GlobalCurrencies} />
      <Drawer.Screen name="Notícias" component={News} />
      <Drawer.Screen name="Sobre" component={About} />
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
