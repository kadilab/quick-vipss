// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ScrollView,
//   ActivityIndicator,
//   Image,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { BASE_URL } from "@env";
// import { MaterialIcons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import * as ImagePicker from "expo-image-picker";

// const  Profile = () => {
//   const [user, setUser] = useState({
//     firstname: "",
//     lastname: "",
//     email: "",
//     mobile: "",
//     avatar: "", // Nouvelle propriété pour la photo de profil
//   });
//   const [loading, setLoading] = useState(true);
//   const [isEditing, setIsEditing] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [password, setPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const router = useRouter();

//   /**
//    * ✅ Charger les informations utilisateur
//    */
//   const fetchUserData = async () => {
//     try {
//       const storedUser = await AsyncStorage.getItem("user");
//       console.log(storedUser);
//       if (storedUser) {
//         setUser(JSON.parse(storedUser));
//       }

//     } catch (error) {
//       console.error("Erreur lors du chargement des données utilisateur :", error);
//       Alert.alert("Erreur", "Impossible de charger les informations utilisateur.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /**
//    * ✅ Sauvegarder les informations utilisateur
//    */
 

//   /**
//    * ✅ Changer le Mot de Passe


//   /**
//    * ✅ Télécharger une Photo de Profil
//    */
//   const pickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 1,
//     });

//     if (!result.canceled) {
//       setUser({ ...user, avatar: result.assets[0].uri });
//     }
//   };

//   /**
//    * ✅ Déconnexion
//    */
//   const handleLogout = async () => {
//     try {
//       await AsyncStorage.removeItem("user");
//       Alert.alert("Déconnexion réussie", "Vous avez été déconnecté.");
//       router.replace("/login");
//     } catch (error) {
//       Alert.alert("Erreur", "Impossible de se déconnecter.");
//     }
//   };

//   useEffect(() => {
//     fetchUserData();
//   }, []);

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#0059a5" />
//         <Text>Chargement du profil...</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* ✅ Photo de Profil */}
//       <View style={styles.profileHeader}>
//         <TouchableOpacity onPress={pickImage}>
//           <Image
//             source={
//               user.avatar
//                 ? { uri: user.avatar }
//                 : require("@/assets/images/default-avatar.png")
//             }
//             style={styles.avatar}
//           />
//         </TouchableOpacity>
//         <Text style={styles.username}>
//           {user.firstname} {user.lastname}
//         </Text>
//         <Text style={styles.email}>{user.email}</Text>
//       </View>

//       {/* ✅ Formulaire de Profil */}
//       <View style={styles.form}>
//         <Text style={styles.label}>Prénom</Text>
//         <TextInput
//           style={styles.input}
//           value={user.firstname}
//           editable={isEditing}
//           onChangeText={(text) => setUser({ ...user, firstname: text })}
//         />

//         <Text style={styles.label}>Nom</Text>
//         <TextInput
//           style={styles.input}
//           value={user.lastname}
//           editable={isEditing}
//           onChangeText={(text) => setUser({ ...user, lastname: text })}
//         />

//         <Text style={styles.label}>Mobile</Text>
//         <TextInput
//           style={styles.input}
//           value={user.mobile}
//           editable={isEditing}
//           onChangeText={(text) => setUser({ ...user, mobile: text })}
//         />

//         {/* ✅ Changer le Mot de Passe */}
//         <Text style={styles.label}>Ancien Mot de Passe</Text>
//         <TextInput
//           style={styles.input}
//           secureTextEntry
//           value={password}
//           onChangeText={setPassword}
//         />
//         <Text style={styles.label}>Nouveau Mot de Passe</Text>
//         <TextInput
//           style={styles.input}
//           secureTextEntry
//           value={newPassword}
//           onChangeText={setNewPassword}
//         />
//         <TouchableOpacity style={[styles.button, styles.saveButton]} >
//           <Text style={styles.buttonText}>Changer le Mot de Passe</Text>
//         </TouchableOpacity>
//       </View>

//       {/* ✅ Boutons */}
//       <View style={styles.buttonContainer}>
//         <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
//           <Text style={styles.buttonText}>Déconnexion</Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// }

// // ✅ Styles (Identiques à avant, avec ajout de .avatar et .logoutButton)
// const styles = StyleSheet.create({
//   avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
//   logoutButton: { backgroundColor: "#dc3545" },
//   container: {
//     flexGrow: 1,
//     backgroundColor: "#f9fafc",
//     padding: 20,
//     alignItems: "center",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   profileHeader: {
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   username: {
//     fontSize: 22,
//     fontWeight: "bold",
//     marginVertical: 5,
//     color: "#333",
//   },
//   email: {
//     fontSize: 14,
//     color: "#666",
//   },
//   form: {
//     width: "100%",
//     marginTop: 10,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: "bold",
//     marginBottom: 5,
//     color: "#555",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 5,
//     padding: 10,
//     marginBottom: 15,
//     backgroundColor: "#fff",
//   },
//   buttonContainer: {
//     marginTop: 20,
//     width: "100%",
//   },
//   button: {
//     padding: 15,
//     borderRadius: 5,
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   editButton: {
//     backgroundColor: "#0059a5",
//   },
//   saveButton: {
//     backgroundColor: "#28a745",
//   },
//   cancelButton: {
//     backgroundColor: "#dc3545",
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
// });

// export default Profile;


import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from "react-native";

const ProfileScreen = () => {
  const [name, setName] = useState("John Wick");
  const [gender, setGender] = useState("Male");
  const [birthYear, setBirthYear] = useState("1985");
  const [weightUnit, setWeightUnit] = useState("Kg");
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Profile</Text>
      </View>
      <View style={styles.profileContainer}>
        <Image source={require("@/assets/images/default-avatar.png")} style={styles.profileImage} />
      </View>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />
        
        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity onPress={() => setGender("Male")} style={[styles.genderButton, gender === "Male" && styles.activeGender]}>
            <Text style={styles.genderText}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setGender("Female")} style={[styles.genderButton, gender === "Female" && styles.activeGender]}>
            <Text style={styles.genderText}>Female</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.label}>Birth Year</Text>
        <TextInput style={styles.input} value={birthYear} onChangeText={setBirthYear} keyboardType="numeric" />
        
        <Text style={styles.label}>Weight Unit</Text>
        <TextInput style={styles.input} value={weightUnit} onChangeText={setWeightUnit} />
      </View>
      
      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center" },
  header: { backgroundColor: "#007AFF", width: "100%", padding: 20, alignItems: "center" },
  headerText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  profileContainer: { marginTop: -50, alignItems: "center" },
  profileImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: "#fff" },
  formContainer: { width: "80%", marginTop: 20 },
  label: { fontSize: 16, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 },
  genderContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  genderButton: { flex: 1, alignItems: "center", padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginHorizontal: 5 },
  activeGender: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  genderText: { color: "#000" },
  saveButton: { backgroundColor: "#007AFF", padding: 15, borderRadius: 8, marginTop: 20, width: "80%", alignItems: "center" },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" }
});

export default ProfileScreen;

