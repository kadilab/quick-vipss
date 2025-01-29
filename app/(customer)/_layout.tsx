import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import React, { useState } from "react";
import { Tabs } from "expo-router";
import { Platform, View, Text, Switch, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons"; // Import des icônes Material
import { useColorScheme } from "@/hooks/useColorScheme";


export default function UserLayout() {
  const colorScheme = useColorScheme();
  const [isSwitchOn, setIsSwitchOn] = useState(false);

  const toggleSwitch = () => {
    setIsSwitchOn((previousState) => !previousState);
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#0059a5", // Couleur active de l'onglet
        tabBarInactiveTintColor: "#888", // Couleur inactive de l'onglet
        headerShown: true, // Affiche les Headers
        headerTitleAlign: "center", // Centre les titres
        headerStyle: {
          backgroundColor: "#0059a5", // Fond bleu du Header
          elevation: 10
        },
        headerTintColor: "#fff", // Texte blanc
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 18,
        },
        tabBarStyle: {
          backgroundColor: "#ffffff", // Fond blanc de la Tab Bar
          borderTopWidth: 0, // Supprime la ligne supérieure
          elevation: 8, // Ombre sur Android
          shadowColor: "#000", // Ombre sur iOS
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
      }}
    >
      {/* ✅ Onglet Home */}
      <Tabs.Screen
        name="customer"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
          // headerRight: () => (
          //   <View style={styles.headerRight}>
          //     <Text style={styles.switchLabel}>Activer</Text>
          //     <Switch
          //       value={isSwitchOn}
          //       onValueChange={toggleSwitch}
          //       trackColor={{ false: "#767577", true: "#81b0ff" }}
          //       thumbColor={isSwitchOn ? "#f5dd4b" : "#f4f3f4"}
          //     />
          //   </View>
          // ),
        }}
      />

      {/* ✅ Onglet My Bookings */}
      <Tabs.Screen
        name="explore"
        options={{
          title: "My Bookings",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="book" size={size} color={color} />
          ),
          // headerRight: () => (
          //   <View style={styles.headerRight}>
          //     <Text style={styles.switchLabel}>Notifications</Text>
          //     <Switch
          //       value={isSwitchOn}
          //       onValueChange={toggleSwitch}
          //       trackColor={{ false: "#767577", true: "#81b0ff" }}
          //       thumbColor={isSwitchOn ? "#f5dd4b" : "#f4f3f4"}
          //     />
          //   </View>
          // ),
        }}
      />
      {/* ✅ Onglet Profile */}
      <Tabs.Screen
        name="setting"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
          // headerRight: () => (
          //   <View style={styles.headerRight}>
          //     <Text style={styles.switchLabel}>Mode Privé</Text>
          //     <Switch
          //       value={isSwitchOn}
          //       onValueChange={toggleSwitch}
          //       trackColor={{ false: "#767577", true: "#81b0ff" }}
          //       thumbColor={isSwitchOn ? "#f5dd4b" : "#f4f3f4"}
          //     />
          //   </View>
          // ),
        }}
      />
    </Tabs>
  );
}


// ✅ Styles
const styles = StyleSheet.create({
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  switchLabel: {
    color: "#fff",
    marginRight: 5,
    fontWeight: "bold",
  },
});
