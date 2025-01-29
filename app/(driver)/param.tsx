import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Settings() {
  const router = useRouter();
  const [isNotificationsEnabled, setIsNotificationsEnabled] = React.useState(false);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null); // État du rôle utilisateur

  const toggleNotifications = () => setIsNotificationsEnabled((prev) => !prev);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user"); // Supprime le token utilisateur
      router.replace("/login"); // Redirige vers la page de connexion
    } catch (error) {
      Alert.alert("Erreur", "Impossible de se déconnecter.");
    }
  };

  /** Récupération des informations utilisateur **/
  const fetchUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const u = JSON.parse(storedUser);
        setUser(JSON.parse(storedUser));
        setUserRole(u.role); // Stocke le rôle utilisateur
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleComplain = () => {
    Alert.alert("Complain", "Redirection vers la section de plaintes.");
  };

  const handleSos = () => {
    Alert.alert("SOS", "Envoi d'une alerte SOS...");
  };

  const handleConvertToRider = () => {
    Alert.alert("Convert to Rider", "Vous êtes maintenant un Rider !");
    router.replace("/customer");
  };

  return (
    <View style={styles.container}>
      {/* ✅ Profil */}
      <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/profile")}>
        <MaterialIcons name="person" size={24} color="#0059a5" />
        <Text style={styles.menuText}>Profile</Text>
      </TouchableOpacity>

      {/* ✅ Convert to Rider */}
      {userRole === "driver" && (
        <TouchableOpacity style={styles.menuItem} onPress={handleConvertToRider}>
          <MaterialIcons name="directions-bike" size={24} color="#28a745" />
          <Text style={styles.menuText}>Convert to customer</Text>
        </TouchableOpacity>
      )}

      {/* ✅ SOS */}
      <TouchableOpacity disabled style={styles.menuItem} onPress={handleSos}>
        <MaterialIcons name="error-outline" size={24} color="#dc3545" />
        <Text style={styles.menuText}>SOS</Text>
      </TouchableOpacity>

      {/* ✅ Notifications */}
      <View style={styles.menuItem}>
        <MaterialIcons name="notifications-active" size={24} color="#ffc107" />
        <Text style={styles.menuText}>Push Notifications</Text>
        <Switch
          disabled
          value={isNotificationsEnabled}
          onValueChange={toggleNotifications}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isNotificationsEnabled ? "#f5dd4b" : "#f4f3f4"}
        />
      </View>

      {/* ✅ Complain */}
      <TouchableOpacity disabled  style={styles.menuItem} onPress={handleComplain}>
        <MaterialIcons name="feedback" size={24} color="#6c757d" />
        <Text style={styles.menuText}>Complain</Text>
      </TouchableOpacity>

      {/* ✅ Logout */}
      <TouchableOpacity style={[styles.menuItem, styles.logout]} onPress={handleLogout}>
        <MaterialIcons name="logout" size={24} color="#dc3545" />
        <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafc",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    marginLeft: 15,
    color: "#333",
  },
  logout: {
    marginTop: 20,
    backgroundColor: "#f8d7da",
    borderColor: "#f5c6cb",
  },
  logoutText: {
    color: "#dc3545",
    fontWeight: "bold",
  },
});
