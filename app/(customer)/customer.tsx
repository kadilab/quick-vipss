import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useLocation from '@/hooks/useLocation';

export default function HomeScreen() {
  const { location, errorMsg } = useLocation();

  const mapRef = useRef(null);
  const [region, setRegion] = useState(null); // Stockage de la région actuelle
  const [modalVisible, setModalVisible] = useState(false); // Pour afficher ou masquer la modale
  const [bookOption, setBookOption] = useState('now'); // Option de réservation (maintenant ou plus tard)
  const [loading, setLoading] = useState(false); // Pour afficher le loader
  const [savedLocation, setSavedLocation] = useState(null); // Pour récupérer la localisation sauvegardée
  const [isPinVisible, setIsPinVisible] = useState(false); // Pour gérer l'affichage de l'icône pin
  const [user, setUser] = useState({});
  const [tariffs, setTariffs] = useState({});
  const [carType, setCarType] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [hours, setHours] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);



  const fetchUserData = async () => {
    try {
      console.log("Fetching user data...");
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        console.log("User data loaded:", JSON.parse(storedUser));
      } else {
        console.warn("No user data found in AsyncStorage.");
      }
    } catch (error) {
      console.error("Error fetching user data:");
    }
  };
  const fetchTariffs = async () => {
    try {
      const response = await fetch(`https://quickapi.quick-vip.net/index.php?route=get_tarif`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP! Code: ${response.status}`);
      }
      const data = await response.json();
      const tariffsData = {};
      data.tarifs.forEach((tarif) => {
        tariffsData[tarif.model] = tarif;
      });
      setTariffs(tariffsData);
      // console.log(tariffsData);
    } catch (e) {

    }
  };
  // Mettre à jour la région lorsque la localisation est disponible
  useEffect(() => {
    if (location && location.latitude && location.longitude) {
      setRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      fetchUserData();
      fetchTariffs();
    }
  }, [location]); // Ajouter location comme dépendance pour actualiser lorsque la localisation change

  const handleSaveLocation = async () => {
    if (location) {
      // Sauvegarder la localisation manuelle dans AsyncStorage
      await AsyncStorage.setItem('userLocation', JSON.stringify(location));
      setSavedLocation(location);  // Mettre à jour l'état local avec la localisation sauvegardée
      setIsPinVisible(false);  // Masquer le pin après confirmation
      setBookOption('now'); // Réafficher les boutons de réservation
    }
  };

   // Fonction pour confirmer la position sélectionnée
   const handleConfirms = () => {
    if (region) {
      setSavedLocation(region); // Sauvegarder la position actuelle
      Alert.alert('Position confirmée', `Latitude: ${region.latitude}, Longitude: ${region.longitude}`);
      setIsPinVisible(false); // Masquer le pin
    }
  };

  const handleCarTypeChange = (value) => {
    setCarType(value);
    setServiceType('');
    setTotalPrice(0);
    setHours(1);
  };

  const handleServiceChange = (value) => {
    setServiceType(value);
    if (value === 'location') {
      setTotalPrice(tariffs[carType]?.location * hours || 0);
    } else {
      setTotalPrice(tariffs[carType]?.[value] || 0);
    }
  };

  const handleHoursChange = (value) => {
    const numericValue = parseInt(value, 10);
    if (!isNaN(numericValue)) {
      setHours(numericValue);
      if (serviceType === 'location') {
        setTotalPrice(tariffs[carType]?.location * numericValue || 0);
      }
    }
  };
  const handleBookLater = () => {
    // Logique pour réserver plus tard
    alert('Réservation planifiée');
  };

  const handleCancel = () => {
    setIsPinVisible(false); // Masquer le pin
    setBookOption('now'); // Réafficher les boutons de réservation
  };

  const handleConfirm = () => {
    if (location) {
      setSavedLocation(location); 
       // Sauvegarder la position actuelle
      // alert(savedLocation);
      setIsPinVisible(false); // Masquer le pin
      setBookOption('now'); // Réafficher les boutons de réservation
    }
  };
  const handleSubmit = async () => {
    try {
      if (!carType || !serviceType) {
        Alert.alert('Erreur', 'Veuillez sélectionner le type de voiture et le service.');
        return;
      }

      const orderData = {
        user_id: user.id,
        car_type: carType,
        service_type: serviceType,
        hours: serviceType === 'location' ? hours : 1,
        price: totalPrice,
        lat:   location.latitude,
        lon:  location.longitude,
      };
      console.log("Submitting order:", orderData);
      const response = await fetch(`https://quickapi.quick-vip.net/index.php?route=add_order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      Alert.alert('Réservation confirmée', `Prix total: $${totalPrice}`);
      setShowModal(false);
    }catch(error)
    {
      console.error("Error submitting order:");
      Alert.alert("Erreur lors de la soumission de la réservation.");
    }
  };


  return (
    <View style={styles.container}>
      {/* Carte */}
      <View style={styles.mapContainer}>
        {region ? (
          <MapView
            style={styles.map}
            region={region}
            provider='google'
            mapType="standard"
            scrollEnabled={true} // Permet à la carte de bouger
            showsUserLocation
            zoomControlEnabled
            showsMyLocationButton
            showsTraffic
            onRegionChangeComplete={(newRegion) => {
              if (isPinVisible) {
                setRegion(newRegion); // Mettre à jour la région lorsque la carte bouge
              }
            }}
            ref={mapRef}


          // onPress={(e) => location(e.nativeEvent.coordinate)}  // Sélectionner la localisation sur la carte
          >
             <Marker coordinate={region} />
          </MapView>
        ) : (
          <ActivityIndicator size="large" color="#0000ff" />
        )}

        {/* Icone au centre de l'écran */}
        {isPinVisible && (
          <View style={styles.centerIcon}>
            <Image
              source={require('@/assets/images/green_pin.png')}
              style={styles.pinIcon}
            />
          </View>
        )}
      </View>

      {/* Bouton pour ouvrir la modale et choisir la localisation manuelle */}
      {!isPinVisible && (
        <TouchableOpacity
          style={styles.manualLocationButton}
          onPress={() => setIsPinVisible(true)}
        >
          <MaterialIcons name="location-on" size={24} color="white" />
          <Text style={styles.buttonText}>Sélectionner ma position</Text>
        </TouchableOpacity>
      )}

      {/* Options de réservation */}
      {!isPinVisible && (
        <View style={styles.buttonContainer}>

          <TouchableOpacity style={styles.buttonblue} disabled onPress={handleBookLater}>
            <Text style={styles.buttonText}>Book Later</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setShowModal(true)}>
            <Text style={styles.buttonText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Boutons pour annuler ou confirmer la sélection de la position */}
      {isPinVisible && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.buttonred} onPress={handleCancel}>
            <Text style={styles.buttonText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleConfirm}>
            <Text style={styles.buttonText}>Confirmer</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Réservation</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Type de voiture</Text>
              <Picker
                selectedValue={carType}
                onValueChange={handleCarTypeChange}
                style={styles.picker}
              >
                <Picker.Item label="Sélectionnez une voiture" value="" />
                {Object.keys(tariffs).map((car) => (
                  <Picker.Item key={car} label={car} value={car} />
                ))}
              </Picker>
            </View>

            {carType && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Type de service</Text>
                <Picker
                  selectedValue={serviceType}
                  onValueChange={handleServiceChange}
                  style={styles.picker}
                >
                  <Picker.Item label="Sélectionnez un service" value="" />
                  {Object.keys(tariffs[carType]).map((service) => (
                    <Picker.Item key={service} label={service} value={service} />
                  ))}
                </Picker>
              </View>
            )}

            {serviceType === 'location' && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nombre d'heures</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(hours)}
                  onChangeText={handleHoursChange}
                />
              </View>
            )}

            {totalPrice > 0 && (
              <Text style={styles.totalPrice}>Prix Total: ${totalPrice}</Text>
            )}

            <TouchableOpacity
              style={[styles.button1, styles.confirmButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>Confirmer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button1, styles.cancelButton]}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.buttonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
  },
  totalPrice: { fontWeight: 'bold', marginTop: 10, fontSize: 16 },
  formGroup: { marginBottom: 10 },
  label: { fontWeight: 'bold', marginBottom: 5 },
  picker: { height: 50, borderColor: '#ccc', borderWidth: 1 },
  button1: { padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  cancelButton: { backgroundColor: '#dc3545' },
  confirmButton: { backgroundColor: '#28a745' },
  modalContent: { backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 10 },

  mapContainer: {

    width: '100%',
    height: '90%',
    position: 'relative',  // Pour pouvoir superposer l'icône sur la carte
  },
  map: {
    width: '100%',
    height: '100%',
  },
  centerIcon: {
    position: 'absolute',
    top: '50%', // Centrer verticalement
    left: '50%', // Centrer horizontalement
    transform: [{ translateX: -20 }, { translateY: -40 }], // Ajuster pour que l'icône soit centrée correctement
    zIndex: 1,
  },
  pinIcon: {
    width: 40,
    height: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    paddingTop: 15,
    marginBottom: 0,
  },
  button: {
    backgroundColor: '#0059a5',
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  buttonred: {
    backgroundColor: '#c70f02',
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  buttonblue: {
    backgroundColor: '#577e99',
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  }
  ,
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  manualLocationButton: {
    position: 'absolute',
    top: 20,
    left: 100,
    backgroundColor: '#0059a5',
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    // alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  saveButton: {
    backgroundColor: '#0059a5',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },

});
