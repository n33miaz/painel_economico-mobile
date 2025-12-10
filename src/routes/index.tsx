import React from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerContentComponentProps,
  DrawerItem,
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../theme/colors";

import Home from "../screens/Home";
import Currencies from "../screens/Currencies";
import Indexes from "../screens/Indexes";
import News from "../screens/News";
import About from "../screens/About";
import Favorites from "../screens/Favorites";

const Tab = createMaterialTopTabNavigator();
const Drawer = createDrawerNavigator();

function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      tabBarPosition="bottom"
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inactive,
        tabBarIndicatorStyle: {
          backgroundColor: colors.primary,
          height: 3,
          top: 0,
        },
        tabBarStyle: {
          backgroundColor: "white",
          height: 60 + (Platform.OS === "ios" ? insets.bottom : 0),
          paddingBottom: Platform.OS === "ios" ? insets.bottom : 10,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontFamily: "Roboto_700Bold",
          fontSize: 10,
          textTransform: "capitalize",
        },
        tabBarItemStyle: {
          padding: 0,
          justifyContent: "center",
        },
        swipeEnabled: true,
        animationEnabled: true,
      }}
    >
      <Tab.Screen
        name="Moedas"
        component={Currencies}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "cash" : "cash-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={Home}
        options={{
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Índices"
        component={Indexes}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "stats-chart" : "stats-chart-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.drawerContainer, { paddingTop: insets.top }]}>
      <View style={styles.drawerHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="infinite" size={32} color={colors.primaryDark} />
        </View>
        <View>
          <Text style={styles.appName}>Painel Econômico</Text>
          <Text style={styles.appSlogan}>Soluções Inteligentes</Text>
        </View>
      </View>

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
        drawerActiveBackgroundColor: "rgba(0, 173, 239, 0.1)",
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
          width: "70%",
          backgroundColor: colors.background,
          borderTopRightRadius: 24,
          borderBottomRightRadius: 24,
        },
        drawerType: "slide",
        overlayColor: "rgba(5, 61, 153, 0.2)",
      }}
    >
      <Drawer.Screen
        name="Início"
        component={TabNavigator}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="home-outline" size={22} color={color} />
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
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
  },
  drawerHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: colors.background,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  appName: {
    fontSize: 16,
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
