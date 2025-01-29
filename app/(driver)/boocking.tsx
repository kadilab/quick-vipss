import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface Order {
  id: number;
  car_type: string;
  service_type: string;
  hours?: number;
  price: number;
  lat: number;
  lon: number;
  status: string;
  created_at: string;
  driver: any;
  firstname: string;
  lastname: string;
}

export default function BookingScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  const fetchUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserId(user.id);
      } else {
        Alert.alert("Erreur", "Utilisateur non connecté. Veuillez vous reconnecter.");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données utilisateur :", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersUpdate = async () => {
    if (!userId) return;
    try {
      const response = await fetch(
        `https://quickapi.quick-vip.net/index.php?route=get_driver_orders&user_id=${userId}`
      );

      if (!response.ok) {
        throw new Error("Impossible de récupérer les commandes.");
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error: any) {
      console.error("Erreur API :", error.message);
      Alert.alert("Erreur", error.message || "Erreur lors de la récupération des commandes.");
    }
  };

  const detailPage = (item: Order) => {
    const serializedItem = JSON.stringify(item);
    router.push({
      pathname: "/driverTrip",
      params: { item: serializedItem },
    });
  };

  const renderItem = useMemo(
    () =>
      ({ item }: { item: Order }) => (
        <Animated.View style={styles.card}>
          <TouchableOpacity onPress={() => detailPage(item)}>
            <View style={styles.locationContainer}>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={20} color="#34c759" />
                <Text style={styles.locationText}>
                  {`6GW6+CQ, ${item.lat}, ${item.lon}, DRC`}
                </Text>
              </View>
              <View style={styles.dashedLine} />
              <View style={styles.locationRow}>
                <Ionicons name="location" size={20} color="#ff3b30" />
                <Text style={styles.locationText}>{`7GJ4+9JR, ${item.service_type}, DRC`}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoContainer}>
              <View style={styles.infoBlock}>
                <Ionicons name="cash-outline" size={22} color="#007aff" />
                <Text style={styles.infoValue}>${item.price}</Text>
              </View>
              <View style={styles.infoBlock}>
                <Ionicons name="time-outline" size={22} color="#007aff" />
                <Text style={styles.infoValue}>{item.hours || 0} hrs</Text>
              </View>
              <View style={styles.infoBlock}>
                <Ionicons name="calendar-outline" size={22} color="#007aff" />
                <Text style={styles.infoValue}>{item.created_at}</Text>
              </View>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />

          <View style={styles.footer}>
            <View style={styles.userInfo}>
              <Image
                source={require("@/assets/images/avatar-4.jpg")}
                style={styles.avatar}
              />
              <Text style={styles.userName}>{
                `${item.firstname.toUpperCase()} ${item.lastname.toUpperCase()}`
              }</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                disabled={item.status !== "confirmed"} // Désactive le bouton si le statut n'est pas "confirmed"
                style={[
                  styles.actionButton,
                  styles.callButton,
                  item.status !== "confirmed" && { opacity: 0.5 }, // Réduit l'opacité si désactivé
                ]}
              >
                <Ionicons name="call-outline" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                disabled={item.status !== "confirmed"} // Désactive le bouton si le statut n'est pas "confirmed"
                style={[
                  styles.actionButton,
                  styles.chatButton,
                  item.status !== "confirmed" && { opacity: 0.5 }, // Réduit l'opacité si désactivé
                ]}
              >
                <Ionicons name="chatbubbles-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

          </View>

        </Animated.View>
      ),
    [userId]
  );

  useEffect(() => {
    fetchUserData();
    fetchOrdersUpdate();
    const interval = setInterval(fetchOrdersUpdate, 5000);

    return () => clearInterval(interval);
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007aff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
    {orders.length > 0 ? (
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
    ) : (
      <View style={{ backgroundColor: "", height: "100%", width: "100%", justifyContent: "center", alignItems: "center" }}>
        <Image source={require("@/assets/images/empty.png")} style={{width:"30%",height:"20%"}} alt="empty" />
        <Text style={styles.emptyText}>Aucune commande disponible.</Text>
      </View>
    )}
  </View>
  
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f4f6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 15,
  },
  emptyText: {
    textAlign: "center",
    color: "#555",
    marginTop: 20,
    fontSize: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationContainer: {
    marginBottom: 0,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    padding: 10,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  locationText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 7,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  infoBlock: {
    alignItems: "center",
    flex: 1,
  },
  infoValue: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "700",
    color: "#022359",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#022359",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  callButton: {
    backgroundColor: "#34c759",
  },
  chatButton: {
    backgroundColor: "#007aff",
  },
  dashedLine: {
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#ccc",
    marginVertical: 10,
    alignSelf: "stretch",
  },
});
