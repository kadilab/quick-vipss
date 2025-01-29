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
  Image
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import useLocation from '@/hooks/useLocation';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

export default function userTrip() {
    const { location, errorMsg } = useLocation();
    const mapRef = useRef(null);
    const [rideStatus, setRideStatus] = useState('ACCEPTED');
    const router = useRouter();

    const params = useLocalSearchParams();
    const {
      id,
      car_type,
      service_type,
      hours,
      price,
      lat,
      lon,
      status,
      created_at,
      firstname,
      lastname,
      mobile,
      email,
    } = params;
    const handleCall = (phoneNumber) => {
        if (!phoneNumber) {
          Alert.alert('Erreur', 'Numéro de téléphone non disponible.');
          return;
        }
        Linking.openURL(`tel:${phoneNumber}`).catch(() =>
          Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application téléphonique.')
        );
      };
    
      const openGoogleMaps = () => {
        if (!lat || !lon) {
          Alert.alert('Erreur', 'Coordonnées de destination manquantes.');
          return;
        }
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`;
        Linking.openURL(url).catch(() =>
          Alert.alert('Erreur', 'Impossible d\'ouvrir Google Maps.')
        );
      };
    
      const handleWhatsApp = (phoneNumber) => {
        if (!phoneNumber) {
          Alert.alert('Erreur', 'Numéro de téléphone non disponible.');
          return;
        }
        const whatsappUrl = `https://wa.me/${phoneNumber}`;
        Linking.openURL(whatsappUrl).catch(() =>
          Alert.alert('Erreur', 'Impossible d\'ouvrir WhatsApp.')
        );
      };
      const back = () => {
        router.replace("/customer");
      };
      useEffect(() => {
        if (location && mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude: lat ? parseFloat(lat) : location.latitude,
              longitude: lon ? parseFloat(lon) : location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
            1000
          );
        }
      }, [location, lat, lon]);
    
      const handleStartTrip = () => {
        setRideStatus('IN PROGRESS');
        Alert.alert('Trajet démarré', 'Votre trajet est en cours !');
      };
    
      const handleCancelBooking = () => {
        Alert.alert(
          'Annuler la réservation',
          'Êtes-vous sûr de vouloir annuler cette réservation ?',
          [
            { text: 'Non', style: 'cancel' },
            { text: 'Oui', onPress: () => Alert.alert('Réservation annulée') },
          ]
        );
      };

    return (
        <View style={styles.container}>
          <View style={styles.mapContainer}>
            {location ? (
              <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                  latitude: lat ? parseFloat(lat) : location.latitude,
                  longitude: lon ? parseFloat(lon) : location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                showsUserLocation
              >
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                  title="Vous êtes ici"
                />
                <Marker
                  coordinate={{
                    latitude: lat ? parseFloat(lat) : location.latitude + 0.002,
                    longitude: lon ? parseFloat(lon) : location.longitude + 0.002,
                  }}
                  title="Destination"
                  pinColor="orange"
                  image={require('@/assets/images/green_pin.png')}
                />
              </MapView>
            ) : (
              <Text style={styles.errorText}>{errorMsg || 'Chargement de la carte...'}</Text>
            )}
          </View>
    
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              STATUT : <Text style={styles.statusAccepted}>{rideStatus}</Text>
            </Text>
          </View>
    
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleWhatsApp(mobile)}
            >
              <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleCall(mobile)}
            >
              <Ionicons name="call" size={24} color="#fff" />
            </TouchableOpacity>
           
          </View>
    
          <TouchableOpacity style={styles.sosButton}>
            <Text style={styles.sosText}>SOS</Text>
          </TouchableOpacity>

          <ScrollView style={styles.bookingDetails} showsVerticalScrollIndicator={false}>
    
          </ScrollView>
        </View>
      );
}




const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    mapContainer: { flex: 1, height: '50%' },
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
    quickActions: { position: 'absolute', right: 15, top: '65%' },
    actionButton: {
      backgroundColor: '#0059a5',
      padding: 10,
      borderRadius: 30,
      marginVertical: 5,
      alignItems: 'center',
    },
    sosText:{
     color: '#fff',
     fontWeight: "bold"
    },
    sosButton: {
      position: 'absolute',
      left: 15,
      top: '72%',
      backgroundColor: '#ff4d4d',
      padding: 10,
      borderRadius: 30,
      height: 50,
      width: 50,
      justifyContent: 'center',
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
      flexShrink: 0,
      maxHeight: '20%',
      backgroundColor: '#fff',
      padding: 15,
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
      elevation: 5,
    },
    mainInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    userInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    userInfo1: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    address: {
      backgroundColor: '#0059a5',
      borderRadius: 30,
      width: 30,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
    name: { fontSize: 16, fontWeight: 'bold' },
    name1: { fontSize: 16 },
    profile: { width: 50, height: 50, borderRadius: 30 },
    detailsText: { fontSize: 20, color: '#398203', fontWeight: 'bold' },
    actionButtonLarge: {
      width: 170,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
    },
    startButton: { backgroundColor: '#0059a5' },
    cancelButton: { backgroundColor: '#e31005' },
    actionButtonText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  });
  
