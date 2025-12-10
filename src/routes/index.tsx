import React, { useState } from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../theme/colors";

import Home from "../screens/Home";
import Currencies from "../screens/Currencies";
import Indexes from "../screens/Indexes";
import News from "../screens/News";
import About from "../screens/About";
import Favorites from "../screens/Favorites";
import Wallet from "../screens/Wallet";

import ScreenHeader from "../components/ScreenHeader";

const Tab = createMaterialTopTabNavigator();
const Drawer = createDrawerNavigator();

function MainTabScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("Dashboard");

  let headerTitle = "Olá, Investidor";
  let headerSubtitle = "Resumo do Mercado";

  switch (activeTab) {
    case "Moedas":
      headerTitle = "Cotações";
      headerSubtitle = "Moedas Globais";
      break;
    case "Dashboard":
      headerTitle = "Olá, Investidor";
      headerSubtitle = "Resumo do Mercado";
      break;
    case "Índices":
      headerTitle = "Indicadores";
      headerSubtitle = "Bolsas e Taxas";
      break;
  }

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title={headerTitle} subtitle={headerSubtitle} />

      <Tab.Navigator
        initialRouteName="Dashboard"
        tabBarPosition="bottom"
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.inactive,
          tabBarPressColor: "transparent",
          tabBarIndicatorStyle: {
            backgroundColor: colors.primary,
            height: 2,
            top: 0,
          },
          tabBarStyle: {
            backgroundColor: "white",
            height: 70 + (Platform.OS === "ios" ? insets.bottom : 0),
            paddingBottom: Platform.OS === "ios" ? insets.bottom : 15,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarLabelStyle: {
            fontFamily: "Roboto_700Bold",
            fontSize: 11,
            textTransform: "capitalize",
            marginTop: 0,
          },
          tabBarItemStyle: {
            marginBottom: -5,
          },
          swipeEnabled: true,
          animationEnabled: true,
        }}
      >
        <Tab.Screen
          name="Moedas"
          component={Currencies}
          listeners={{
            focus: () => setActiveTab("Moedas"),
          }}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "cash" : "cash-outline"}
                size={26}
                color={color}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Dashboard"
          component={Home}
          listeners={{
            focus: () => setActiveTab("Dashboard"),
          }}
          options={{
            tabBarLabel: "Dashboard",
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "grid" : "grid-outline"}
                size={26}
                color={color}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Índices"
          component={Indexes}
          listeners={{
            focus: () => setActiveTab("Índices"),
          }}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "stats-chart" : "stats-chart-outline"}
                size={26}
                color={color}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.drawerContainer, { paddingTop: insets.top }]}>
      <TouchableOpacity
        style={styles.drawerHeader}
        onPress={() => props.navigation.navigate("Sobre")}
        activeOpacity={0.7}
      >
        <Image
          source={require("../../assets/logo.png")}
          style={styles.drawerLogo}
          resizeMode="contain"
        />{" "}
        <View>
          <Text style={styles.appName}>Painel Econômico</Text>
          <Text style={styles.appSlogan}>Soluções Inteligentes</Text>
        </View>
      </TouchableOpacity>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 10 }}
      >
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View
        style={[styles.drawerFooter, { paddingBottom: 20 + insets.bottom }]}
      >
        <TouchableOpacity
          style={styles.aboutButton}
          onPress={() => props.navigation.navigate("Sobre")}
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={colors.textSecondary}
          />
          <Text style={styles.aboutText}>Sobre o App</Text>
        </TouchableOpacity>
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
        drawerType: "front",
        swipeEnabled: true,
        swipeEdgeWidth: 100,
        drawerActiveBackgroundColor: "rgba(0, 173, 239, 0.08)",
        drawerActiveTintColor: colors.primaryDark,
        drawerInactiveTintColor: colors.textSecondary,
        drawerLabelStyle: {
          fontFamily: "Roboto_700Bold",
          marginLeft: 0,
        },
        drawerItemStyle: {
          borderRadius: 8,
          marginHorizontal: 10,
          marginVertical: 4,
        },
        drawerStyle: {
          width: "78%",
          backgroundColor: colors.background,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        },
        overlayColor: "rgba(5, 61, 153, 0.4)",
      }}
    >
      <Drawer.Screen
        name="Início"
        component={MainTabScreen}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Carteira"
        component={Wallet}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="wallet-outline" size={22} color={color} />
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
        name="Favoritos"
        component={Favorites}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="star-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Sobre"
        component={About}
        options={{
          drawerItemStyle: { display: "none" },
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
  drawerContainer: {
    flex: 1,
    backgroundColor: "white",
    overflow: "hidden",
  },
  drawerHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  drawerLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: "white",
  },
  appName: {
    fontSize: 18,
    fontFamily: "Roboto_700Bold",
    color: colors.primaryDark,
  },
  appSlogan: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: "Roboto_400Regular",
  },
  drawerFooter: {
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 15,
    backgroundColor: "#F8F9FA",
  },
  aboutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  aboutText: {
    marginLeft: 12,
    fontSize: 14,
    fontFamily: "Roboto_700Bold",
    color: colors.textSecondary,
  },
});
