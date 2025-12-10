import React from "react";
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
} from "@react-navigation/bottom-tabs";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet, Image } from "react-native";

import { colors } from "../theme/colors";

import Home from "../screens/Home";
import Currencies from "../screens/Currencies";
import Indexes from "../screens/Indexes";
import News from "../screens/News";
import About from "../screens/About";
import Favorites from "../screens/Favorites";

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const tabScreenOptions: BottomTabNavigationOptions = {
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.inactive,
  headerShown: false,
  tabBarStyle: {
    backgroundColor: "white",
    borderTopWidth: 0,
    elevation: 10,
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabelStyle: {
    fontFamily: "Roboto_700Bold",
    fontSize: 10,
  },
};

function TabNavigator() {
  return (
    <Tab.Navigator initialRouteName="Home" screenOptions={tabScreenOptions}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Moedas"
        component={Currencies}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "cash" : "cash-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Índices"
        component={Indexes}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "stats-chart" : "stats-chart-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function CustomDrawerContent(props: DrawerContentComponentProps) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.drawerHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="stats-chart" size={32} color={colors.primaryDark} />
        </View>
        <Text style={styles.appName}>Painel Econômico</Text>
      </View>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 10 }}
      >
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View style={styles.drawerFooter}>
        <Text style={styles.footerText}>v1.0.0</Text>
      </View>
    </View>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Início"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: "rgba(0, 173, 239, 0.1)",
        drawerActiveTintColor: colors.primaryDark,
        drawerInactiveTintColor: colors.textSecondary,
        drawerLabelStyle: {
          fontFamily: "Roboto_700Bold",
          marginLeft: -20,
        },
        drawerStyle: {
          width: "75%",
          backgroundColor: "white",
        },
        drawerType: "front",
      }}
    >
      <Drawer.Screen
        name="Início"
        component={TabNavigator}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="grid-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Favoritos"
        component={Favorites}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="star-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Notícias"
        component={News}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="newspaper-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Sobre"
        component={About}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons
              name="information-circle-outline"
              size={22}
              color={color}
            />
          ),
        }}
      />
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

const styles = StyleSheet.create({
  drawerHeader: {
    height: 160,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  iconContainer: {
    width: 60,
    height: 60,
    backgroundColor: "white",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    elevation: 2,
  },
  appName: {
    fontSize: 18,
    fontFamily: "Roboto_700Bold",
    color: colors.primaryDark,
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    alignItems: "center",
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});
