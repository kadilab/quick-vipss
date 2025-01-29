import { Redirect, Stack } from 'expo-router'

export default function AuthRoutesLayout() {
 
  return (
  <Stack>
         <Stack.Screen
          name="userTrip"
          options={{
            headerShown: true,
            headerStyle: {
              backgroundColor: "#0059a5",
            },
            headerTitle: "Curent Trip",
          }}
        />
         <Stack.Screen
          name="driverTrip"
          
          options={{
            headerShown: false,
            headerStyle: {
              backgroundColor: "#0059a5",
            },
          }}
        />
  </Stack>

  );
}