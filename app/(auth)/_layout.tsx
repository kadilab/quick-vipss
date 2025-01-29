import { Redirect, Stack } from 'expo-router'

export default function AuthRoutesLayout() {
 
  return (
  <Stack>
    <Stack.Screen
          name="login"
          options={{
            headerShown: false,
          }}
        />
         <Stack.Screen
          name="singup"
          options={{
            headerShown: true,
            headerStyle: {
              backgroundColor: "#0059a5",
            },
          }}
        />
  </Stack>

  );
}