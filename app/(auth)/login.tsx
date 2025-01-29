import { useState, useEffect } from "react";
import React from 'react'
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import NetInfo from "@react-native-community/netinfo"; // Importation correcte de NetInfo
import Toast from 'react-native-toast-message'; // Importer Toast
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(true); // Etat de la connexion réseau

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const { width, height } = Dimensions.get("window");

  // Gérer l'état de la connexion Internet
  useEffect(() => {
    const checkNetworkConnection = async () => {
      const netInfo = await NetInfo.fetch();
      setIsConnected(netInfo.isConnected);
    };

    checkNetworkConnection(); // Vérifier la connexion lors du premier rendu

    // Écouter les changements de connexion
    const unsubscribe = NetInfo.addEventListener(state => {
      return setIsConnected(state.isConnected);
    });

    return () => unsubscribe(); // Nettoyage
  }, []);

  const navigateToSignup = () => {
    router.push("/singup");
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: "Veuillez entrer votre email et mot de passe.",
      });
      return;
    }

    if (!isValidEmail(email)) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: "Veuillez entrer une adresse email valide.",
      });
      return;
    }

    if (!isConnected) {
      Toast.show({
        type: 'error',
        text1: 'Erreur de Connexion',
        text2: "Vérifiez votre connexion Internet.",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://quickapi.quick-vip.net/index.php?route=login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP! Code: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);

      if (data.message === "successful") {
        Toast.show({
          type: 'success',
          text1: 'Succès',
          text2: "Connexion réussie !",
          position: 'bottom'
        });
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        console.log(data.user);
        if(data.user.role === 'driver'){
             router.replace("/driver");
        }else{
           router.replace("/customer");
        }
       
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: "Connexion échouée.",
          position: 'bottom'
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: "Une erreur est survenue. Veuillez réessayer.",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require("@/assets/images/lgw.png")}
          style={{
            width: width * 0.3,
            height: height * 0.2,
            aspectRatio: 1,
            marginBottom: 10,
          }}
          resizeMode="contain"
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* ✅ Bouton de connexion */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Se connecter</Text>
        )}
      </TouchableOpacity>

      {/* ✅ Lien vers l'inscription */}
      <View style={styles.signupcontainer}>
        <Text style={{ fontSize: 16 }}>Pas de compte ?</Text>
        <TouchableOpacity onPress={navigateToSignup}>
          <Text style={styles.signup}> Inscription</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Toast message container */}
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  imageContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: "white",
  },
  button: {
    width: "100%",
    padding: 15,
    backgroundColor: "#0059a5",
    borderRadius: 5,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  signupcontainer: {
    flexDirection: "row",
    marginTop: 15,
  },
  signup: {
    color: "#0059a5",
    fontSize: 16,
    fontWeight: "bold",
  },
});
