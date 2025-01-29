import React, { useState, useEffect } from "react";
import { Tabs } from "expo-router";
import { View, Text, Switch, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

export default function AuthRoutesLayout() {
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [state, setState] = useState("Free");
  const [userId, setUserId] = useState<string | null>(null);
  const [watcher, setWatcher] = useState(null);

  /** Fetch user data and driver status **/
  const fetchUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const u = JSON.parse(storedUser);
        setUserId(u.id);
        fetch_driver_status(u.id); // Fetch status immediately
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  /** Fetch driver status **/
  const fetch_driver_status = async (id: string) => {
    try {
      const response = await fetch("https://quickapi.quick-vip.net/index.php?route=get_status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: id }),
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const result = await response.json();
      const status = result.status;

      setIsSwitchOn(status === "Busy");
      setState(status);
    } catch (error) {
      console.error("Error fetching driver status:", error);
    }
  };

  /** Start tracking location **/
  const startLocationTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return console.error("Location permission denied.");

    const watcher = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 10 },
      (newLocation) => sendLocationToServer(newLocation.coords)
    );
    setWatcher(watcher);
  };

  /** Send location to server **/
  const sendLocationToServer = async (coords: { latitude: number; longitude: number }) => {
    try {
      await fetch("https://quickapi.quick-vip.net/index.php?route=update_location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, latitude: coords.latitude, longitude: coords.longitude }),
      });
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  /** Toggle driver status **/
  const toggleSwitch = () => {
    const newState = state === "Free" ? "Busy" : "Free";
    setIsSwitchOn((prev) => !prev);
    setState(newState);
    updateStatus(newState);
  };

  /** Update driver status **/
  const updateStatus = async (newStatus: string) => {
    try {
      await fetch("https://quickapi.quick-vip.net/index.php?route=update_status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, status: newStatus }),
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  /** UseEffect: Fetch user data & start polling **/
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const initialize = async () => {
      await fetchUserData();
      startLocationTracking();

      if (userId) {
        intervalId = setInterval(() => {
          fetch_driver_status(userId);
        }, 5000);
      }
    };

    initialize();

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (watcher) watcher.remove();
    };
  }, [userId]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#0059a5",
        tabBarInactiveTintColor: "#888",
        headerShown: true,
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: "#0059a5" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold", fontSize: 18 },
        tabBarStyle: { backgroundColor: "#ffffff", borderTopWidth: 0, elevation: 8 },
      }}
    >
      <Tabs.Screen
        name="driver"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
          headerRight: () => (
            <View style={styles.headerRight}>
              <Text style={styles.switchLabel}>{state}</Text>
              <Switch value={isSwitchOn} onValueChange={toggleSwitch} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="boocking"
        options={{ title: "My Bookings", tabBarIcon: ({ color, size }) => <MaterialIcons name="book" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="param"
        options={{ title: "Settings", tabBarIcon: ({ color, size }) => <MaterialIcons name="settings" size={size} color={color} /> }}
      />
    </Tabs>
  );
}

// Styles
const styles = StyleSheet.create({
  headerRight: { flexDirection: "row", alignItems: "center", marginRight: 15 },
  switchLabel: { color: "#fff", marginRight: 5, fontWeight: "bold" },
});
