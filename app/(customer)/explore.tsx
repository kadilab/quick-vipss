import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "@env";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";


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
  driver : any;
}

export default function Myboocking() {
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
      console.error("Failed to load user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const detailPage = (item: Order) => {
    router.push("/userTrip"); 
  }

  const fetchOrdersUpdate = async () => {
    try {
      if (!userId) return;

      const response = await fetch(
        `https://quickapi.quick-vip.net/index.php?route=get_user_orders&user_id=${userId}`
      );

      if (!response.ok) {
        throw new Error("Impossible de récupérer les commandes.");
      }

      const data = await response.json();
      console.log(data);
      setOrders(data.orders || []);
    } catch (error: any) {
      console.error("Erreur API:", error.message);
      Alert.alert("Erreur", error.message || "Erreur lors de la récupération des commandes.");
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchOrdersUpdate();
    const interval = setInterval(fetchOrdersUpdate, 5000);

    return () => clearInterval(interval);
  }, [userId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "#28a745";
      case "pending":
        return "#ffc107";
      case "cancelled":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };
  const renderItem = ({ item }: { item: Order }) => {
    const shouldHideButtons = !item.driver || item.status.toLowerCase() !== "confirmed";
  
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="directions-car" size={30} color="#0059a5" />
          <View style={styles.cardHeaderContent}>
            <Text style={styles.cardTitle}>{item.car_type}</Text>
            <Text style={[styles.cardStatus, { color: getStatusColor(item.status) }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.cardPrice}>${item.price}</Text>
        </View>
  
        <View style={styles.cardDetails}>
          <Text style={styles.detailText}>
            <MaterialIcons name="place" size={16} /> Lat: {item.lat}, Lon: {item.lon}
          </Text>
          <Text style={styles.detailText}>
            <MaterialIcons name="timer" size={16} /> Hours: {item.hours || "N/A"}
          </Text>
          <Text style={styles.detailText}>
            <MaterialIcons name="book" size={16} /> Service: {item.service_type.toUpperCase() || "N/A"}
          </Text>
          <Text style={styles.detailText}>
            <MaterialIcons name="event" size={16} /> Date: {item.created_at}
          </Text>
        </View>
  
        {/* Afficher les boutons uniquement si les conditions sont remplies */}
        {!shouldHideButtons && (
          <View style={styles.btncontainer}>
            {/* Bouton Annuler */}
            <TouchableOpacity
              style={styles.buttondel}
              onPress={() => Alert.alert("Annulation", `Commande ${item.id} annulée.`)}
            >
              <Text style={styles.buttonText}>
                <MaterialIcons name="event" size={16} /> Annuler
              </Text>
            </TouchableOpacity>
  
            {/* Bouton Détails */}
            <TouchableOpacity
              style={styles.button}
              onPress={() => detailPage(item)}
            >
              <Text style={styles.buttonText}>Détails</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };
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
        <View style={styles.empty}>
          <Image source={require("@/assets/images/empty.png")} style={styles.avatar} />
          <Text style={styles.emptyTitle}>Liste vide !</Text>
          <Text style={styles.emptyText}>Aucune commande disponible.</Text>
        </View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafc", padding: 20 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  avatar: { width: 200, height: 200 },
  emptyTitle: { fontSize: 20, fontWeight: "bold", marginTop: 10 },
  emptyText: { color: "#929293", textAlign: "center", marginTop: 5 },
  listContainer: { paddingBottom: 20 },
  card: { backgroundColor: "white", borderRadius: 10, padding: 15, marginVertical: 7, elevation: 3 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  cardHeaderContent: { flex: 1, marginLeft: 10 },
  cardTitle: { fontSize: 18, fontWeight: "bold" },
  cardStatus: { fontSize: 14, fontWeight: "600" },
  cardPrice: { fontSize: 16, fontWeight: "bold", color: "#28a745" },
  cardDetails: { marginTop: 5 },
  detailText: { fontSize: 14, color: "#666", marginVertical: 2 },
  button: { backgroundColor: "#0059a5", borderRadius: 8, padding: 8, alignItems: "center", marginTop: 10 },
  buttondel: { backgroundColor: "red", borderRadius: 8, padding: 8, alignItems: "center", marginTop: 10,justifyContent:"center",alignContent:"center" },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 14 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  btncontainer:{
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-between"
  }
});
