import React, { useRef, useEffect, useState } from 'react';
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Linking,
  Image,
  Platform,
  Dimensions
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import useLocation from '@/hooks/useLocation';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import MapViewDirections from 'react-native-maps-directions';
import { SafeAreaView } from 'react-native-safe-area-context';

const GOOGLE_MAPS_APIKEY = 'AIzaSyA6pjnFNnei_6FyQzfFkGO8UYS48Bj3pHY';

export default function DriverTrip() {
  const { location, errorMsg } = useLocation();
  const mapRef = useRef(null);
  const router = useRouter();
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [currentOrigin, setCurrentOrigin] = useState(null);
  const [status, setStatus] = useState("");
  const [startTime, setStartTime] = useState();
  const [endTime, setEndTime] = useState();

  const windowHeight = Dimensions.get('window').height; // Récupération de la hauteur dynamique de l'écran

  const params = useLocalSearchParams();
  const item = params.item ? JSON.parse(params.item) : null;


  useEffect(() => {
    if (item?.status) {
      setStatus(item.status); // Met à jour le statut
      setStartTime(item.start_time); // Met à jour l'heure de début
      setEndTime(item.end_time); // Met à jour l'heure de fin
    }
  }, [item]);

  const back = () => router.back();

  // Vérification de la destination
  const destination = item ? { latitude: parseFloat(item.lat), longitude: parseFloat(item.lon) } : null;

   console.log(item.mobile);

  const startTrip = async () => {
    try {
      const response = await fetch('https://quickapi.quick-vip.net/index.php?route=start_trip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_order: item?.id }),
      });
      const result = await response.json();
      if (response.ok) {
        Alert.alert('Succès', 'Le trajet a commencé avec succès.');
        setStatus("in_progress");
        setStartTime(Date.now());
      } else {
        Alert.alert('Erreur', result.message || 'Une erreur s\'est produite.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de démarrer le trajet.');
    }
  };

  const endTrip = async () => {
    try {
      const response = await fetch('https://quickapi.quick-vip.net/index.php?route=end_trip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_order: item?.id }),
      });
      const result = await response.json();
      if (response.ok) {
        Alert.alert('Succès', 'Le trajet a été terminé avec succès.');
        setStatus("completed");
        setEndTime(Date.now());
      } else {
        Alert.alert('Erreur', result.message || 'Une erreur s\'est produite.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de terminer le trajet.');
    }
  };

  // Mettre à jour l'origine et recalculer l'itinéraire lorsque la position change
  useEffect(() => {
    if (location) {
      const newOrigin = { latitude: location.latitude, longitude: location.longitude };
      setCurrentOrigin(newOrigin);

      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            ...newOrigin,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000
        );
      }
    }
  }, [location]);

  const handleCall = () => {
    const phoneNumber = item.mobile;
    if (!phoneNumber) {
      Alert.alert('Erreur', 'Numéro de téléphone non disponible.');
      return;
    }
    Linking.openURL(`tel:${phoneNumber}`).catch(() =>
      Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application téléphonique.')
    );
  };

  const openGoogleMaps = () => {
    if (!destination?.latitude || !destination.longitude) {
      Alert.alert('Erreur', 'Coordonnées de destination manquantes.');
      return;
    }
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination?.latitude},${destination?.longitude}&travelmode=driving`;
    Linking.openURL(url).catch(() =>
      Alert.alert('Erreur', 'Impossible d\'ouvrir Google Maps.')
    );
  };

  const handleWhatsApp = () => {
    const phoneNumber = item.mobile;
    if (!phoneNumber) {
      Alert.alert('Erreur', 'Numéro de téléphone non disponible.');
      return;
    }
    const whatsappUrl = `https://wa.me/${phoneNumber}`;
    Linking.openURL(whatsappUrl).catch(() =>
      Alert.alert('Erreur', 'Impossible d\'ouvrir WhatsApp.')
    );
  };

  // Gestion des cas où les données sont absentes
  if (!item) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Aucune donnée disponible pour cet itinéraire.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Carte */}
      <View style={styles.mapContainer}>
        {location ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation
          >
            {/* Marqueurs */}
            {currentOrigin && <Marker coordinate={currentOrigin} title="Vous êtes ici" />}
            {destination && (
              <Marker coordinate={destination} title="Destination" description="Destination choisie" />
            )}

          
            {currentOrigin && destination && (
           
              <Polyline
                          coordinates={[
                           { latitude: destination.latitude, longitude: destination.longitude },
                          { latitude: location.latitude, longitude: location.longitude },
                          ]}
                          strokeColor="#015c25"
                          strokeWidth={5}
                        />
            )} 

            {/* Itinéraire */}
            {/* {routeCoordinates.length > 0 && (
              <Polyline coordinates={routeCoordinates} strokeColor="blue" strokeWidth={4} />
            )} */}
          </MapView>
        ) : (
          <Text style={styles.errorText}>{errorMsg || 'Chargement de la carte...'}</Text>
        )}
      </View>

      {/* Statut */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          STATUT : <Text style={styles.statusAccepted}>{status}</Text>
        </Text>
      </View>

      {/* Actions rapides */}
      <View style={styles.quickActions}>
        <ActionButton icon="chatbubble-ellipses" fk={handleWhatsApp} />
        <ActionButton icon="call" fk={handleCall} />
        <ActionButton icon="navigate" fk={openGoogleMaps}  />
      </View>

      {/* Retour */}
      <TouchableOpacity style={styles.return} onPress={back}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Détails */}
      <ScrollView style={styles.bookingDetails} showsVerticalScrollIndicator={false}>
        <View style={styles.actionButtons}>
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center", width: "50%" }}>
            <Image source={require("@/assets/images/avatar-4.jpg")} style={styles.profile} />
            <Text style={styles.name}>{`${item.firstname.toUpperCase()} ${item.lastname.toUpperCase()}`}</Text>
          </View>
          <View style={{ justifyContent: "center", width: "50%" }}>
            <Text style={{ textAlign: "right", fontSize: 20, fontWeight: "bold", color: "#022359" }}>${item.price}</Text>
          </View>
        </View>

        <View style={styles.mainInfo}>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={20} color="#34c759" />
            <Text style={styles.locationText}>{`6GW6+CQ, ${item.lat}, ${item.lon}, DRC`}</Text>
          </View>

          {/* Trait interrompu */}
          <View style={styles.dashedLine} />

          <View style={styles.locationRow}>
            <Ionicons name="location" size={20} color="#ff3b30" />
            <Text style={styles.locationText}>{`7GJ4+9JR, ${item.service_type}, DRC`}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          {status === "completed" ? (
            <View style={{ backgroundColor: "", width: "100%", flexDirection: "row",justifyContent:"center",gap:30 }}>
              <View style={{ backgroundColor: "", width: "50%", flexDirection: "row",alignItems:"center" ,justifyContent:"center"}}>
                <Ionicons name="timer" size={30} color="#bf6102" />
                <Text style={{ textAlign: "auto", fontWeight: "900", fontSize: 20, color: "#020b4a" }}>{new Date(startTime).toLocaleTimeString()}</Text>
              </View>
              <View style={{ backgroundColor: "", width: "50%", flexDirection: "row",alignItems:"center",justifyContent:"center" }}>
                <Ionicons name="timer" size={30} color="#017d1c" />
                <Text style={{ textAlign: "auto", fontWeight: "900", fontSize: 20, color: "#020b4a" }}>{new Date(endTime).toLocaleTimeString()}</Text>
              </View>
            </View>
          ) : status !== "in_progress" ? (
            <>
              <TouchableOpacity style={[styles.actionButtonLarge, styles.cancelButton]}>
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButtonLarge, styles.startButton]} onPress={startTrip}>
                <Text style={styles.actionButtonText}>Start trip</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={[styles.actionButtonLarge1, styles.startButton]} onPress={endTrip}>
              <Text style={styles.actionButtonText}>End trip</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const ActionButton = ({ icon ,fk }:any) => (
  <TouchableOpacity style={styles.actionButton} onPress={fk}>
    <Ionicons name={icon} size={24} color="#fff" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mapContainer: { flex: 1 },
  map: { width: '100%', height: '100%' },
  statusContainer: {
    position: 'absolute',
    top: '6%',
    right: 15,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 10,
    elevation: 3,
  },
  statusText: { fontSize: 14, fontWeight: 'bold' },
  statusAccepted: { color: '#28a745' },
  quickActions: { position: 'absolute', right: 15, top: '50%' },
  actionButton: {
    backgroundColor: '#0059a5',
    padding: 10,
    borderRadius: 30,
    marginVertical: 5,
    alignItems: 'center',
  },
  return: {
    position: 'absolute',
    left: 15,
    top: '6%',
    backgroundColor: '#0059a5',
    height: 50,
    width: 50,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingDetails: {
    maxHeight: '30%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 10,
    elevation: 5,
    paddingBottom: 20,
  },
  profile: { width: 50, height: 50, borderRadius: 30 },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "#022359"
  },
  mainInfo: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    marginVertical: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  locationText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  dashedLine: {
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: 10,
    alignSelf: 'stretch',
  },
  actionButtons: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  actionButtonLarge: {
    width: '50%',
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },actionButtonLarge1: {
    width: '80%',
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  startButton: { backgroundColor: '#34c759' },
  cancelButton: { backgroundColor: '#ff3b30' },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center' },
});
