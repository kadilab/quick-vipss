import React, { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";



export default function Driver() {
  const [location, setLocation] = useState(null);
  const [watcher, setWatcher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [userId, setUserId] = useState(null);
  const [todayTrip, setTodayTrip] = useState(0);
  const [countTrip, setCountTrip] = useState(0);
  const [sound, setSound] = useState(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  const mapRef = useRef(null);

  // Configurer les notifications pour s'afficher lorsque l'application est au premier plan
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  const scheduleNotification = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission refusée", "Les notifications ne sont pas activées.");
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Nouvelle commande 📦",
          body: "Vous avez une nouvelle commande à accepter !",
          data: { route: "/driver", orderId: "12345" }, // Données personnalisées
        },
        trigger: null, // Envoi immédiat
      });
    } catch (error) {
      console.error("Erreur lors de la programmation de la notification:", error);
    }
  };

  const defaultRegion = {
    latitude: -10.709651,
    longitude: 25.499449,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("@/assets/sounds/repeat.wav") // Chemin vers votre fichier audio
      );
      setSound(sound);
      await sound.playAsync();
      sound.setIsLoopingAsync(true); // Boucle le son tant que le modal est visible
    } catch (error) {
      console.error("Erreur lors de la lecture du son:", error);
    }
  };

  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
  };

  const startLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission refusée", "L'application nécessite l'accès à votre position.");
        return;
      }

      const locationWatcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 10,
        },
        (newLocation) => {
          if (newLocation.coords) {
            setLocation(newLocation.coords);
            mapRef.current?.animateToRegion(
              {
                latitude: newLocation.coords.latitude,
                longitude: newLocation.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              },
              1000
            );
          }
        }
      );

      setWatcher(locationWatcher);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du suivi de localisation:", error);
    }
  };

  const fetchUserData = async () => {

    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const u = JSON.parse(storedUser);
        setUserRole(u.role);
        setUserId(u.id);
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (user) {
        const response = await fetch(
          `https://quickapi.quick-vip.net/index.php?route=get_notif&user_id=${user.id}`
        );
        const data = await response.json();
  
        if (data.notifications?.length > 0) {
          const notif = data.notifications[0];
  
          // Si le client a annulé la commande, fermer le modal
          if (notif.etat === 1) {
            setModalVisible(false);
            setNotification(null);
            return;
          }
  
          setNotification(notif);
          setModalVisible(true);
        } else {
          // Si aucune notification, fermer le modal
          setModalVisible(false);
          setNotification(null);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error);
    }
  };

  const fetchTodayTrip = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (user) {
        const response = await fetch(
          `https://quickapi.quick-vip.net/index.php?route=today_trip&user_id=${user.id}&status=confirmed`
        );
        const data = await response.json();
        setTodayTrip(data.somme || 0);
        setCountTrip(data.total_orders || 0);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des trajets d'aujourd'hui:", error);
    }
  };

  const handleAccept = async () => {
    try {
      const body = {
        id_user: userId,
        id_notif: notification?.id_notif,
        id_order: notification?.order_id
      }
      
      const response = await fetch(
        `https://quickapi.quick-vip.net/index.php?route=accept_ride`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP:, ${response.status}`);
      }

      setModalVisible(false);
      setNotification(null);
      // console.log({ item: JSON.stringify(notification) });
      router.push({
        pathname: "/(detaill)/driverTrip",
        params: { item: JSON.stringify(notification) },
      });
    } catch (error) {
      console.error(`Erreur d'acceptation:, error`);
      Alert.alert("Erreur", "Une erreur est survenue lors de l'acceptation de la commande.");
    }
  };

  const handleDecline = async () => {
    try {
      const response = await fetch(
        `https://quickapi.quick-vip.net/index.php?route=cancel_ride`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_notif: notification.id_notif,
            id_order: notification.order_id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      Alert.alert("Succès", "Commande annulée !");
      setModalVisible(false);
      setNotification(null);
    } catch (error) {
      console.error("Erreur de refus:", error);
      Alert.alert("Erreur", "Une erreur est survenue lors du refus de la commande.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day} ${month} ${year} ${hours}:${minutes}`;
  };

  useEffect(() => {
    fetchUserData();
    startLocationTracking();
    fetchNotifications();
    fetchTodayTrip();

    const interval = setInterval(fetchNotifications, 5000);

    return () => {
      if (watcher) watcher.remove();
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (isModalVisible) {
      playSound();
      scheduleNotification();
    } else {
      stopSound();
    }

    return () => {
      stopSound();
    };
  }, [isModalVisible]);
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const { route, orderId } = response.notification.request.content.data;
  
      if (route === "/driver" && orderId) {
        // Navigue vers la page concernée avec les données de la notification
        router.push({
          pathname: route,
          params: { orderId },
        });
      }
    });
  
    return () => subscription.remove();
  }, []);


  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0059a5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider="google"
        showsUserLocation
        initialRegion={defaultRegion}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Votre position"
          />
        )}
        {notification && (
          <Marker
            coordinate={{
              latitude: notification.lat,
              longitude: notification.lon,
            }}
            title="Client"
            description={notification.service_type}
          />
        )}
        {location && notification && notification.lat && notification.lon && (
          <Polyline
            coordinates={[
              { latitude: location.latitude, longitude: location.longitude },
              { latitude: notification.lat, longitude: notification.lon },
            ]}
            strokeColor="#0059a5"
            strokeWidth={3}
          />
        )}

      </MapView>

      {/* Section inférieure avec design */}
      <View style={styles.bottomContainer}>
        <View style={styles.tripInfo}>
          <View style={styles.infoBox}>
            <MaterialIcons name="attach-money" size={30} color="#28a745" />
            <Text style={styles.infoText}>{todayTrip.toFixed(2)} $</Text>
          </View>
          <View style={styles.infoBox}>
            <MaterialIcons name="directions-car" size={30} color="#007bff" />
            <Text style={styles.infoText}>{countTrip} Rides</Text>
          </View>
        </View>
      </View>

      <Modal visible={isModalVisible} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>

            <Text style={styles.modalTitle}>{formatDate(notification?.created_at)}</Text>
            <Text style={styles.modalPrice}>{notification?.price}$</Text>

            <View style={styles.locationContainer}>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={20} color="#34c759" />
                <Text style={styles.locationText}>
                  {`6GW6+CQ, ${notification?.lat}, ${notification?.lon}, DRC`}
                </Text>
              </View>
              <View style={styles.dashedLine} />
              <View style={styles.locationRow}>
                <Ionicons name="location" size={20} color="#ff3b30" />
                <Text style={styles.locationText}>{`7GJ4+9JR, ${notification?.service_type}, DRC`}</Text>
              </View>
            </View>

            <View  style={{flexDirection:"row",gap:10}}>
              <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                <Text style={styles.buttonText}>Accepter</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
                <Text style={styles.buttonText}>Refuser</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </View>
  );

}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#030663" },
  modalPrice: { fontSize: 20, marginVertical: 10, fontWeight: "bold", color: "#030663" },
  acceptButton: { backgroundColor: "#28a745", padding: 10, borderRadius: 5, marginTop: 10,width:"50%",justifyContent:"center",alignItems:"center"},
  declineButton: { backgroundColor: "#dc3545", padding: 10, borderRadius: 5, marginTop: 10,width:"50%"  },
  buttonText: { color: "#fff", fontWeight: "bold",textAlign:"center" },
  bottomContainer: {
    height: "15%",
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    position:"absolute",
    bottom:0,
    elevation: 5,
  },
  tripInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 0,
  },
  infoText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
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
    marginVertical: 3,
  }
  , dashedLine: {
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#ccc",
    marginVertical: 5,
    alignSelf: "stretch",
  },
});
