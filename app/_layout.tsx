import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AudioProvider } from "../context/AudioContext";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <AudioProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: "#0F0F0F",
            },
            animation: "slide_from_right",
          }}
        />
      </AudioProvider>
    </>
  );
  
  return <Stack />;
}
