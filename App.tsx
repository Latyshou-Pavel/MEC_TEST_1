import "react-native-gesture-handler";
import "react-native-reanimated";
import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryProvider } from "./src/app/providers/QueryProvider";
import { RealtimeProvider } from "./src/app/providers/RealtimeProvider";
import { AppNavigator } from "./src/app/navigation/AppNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <RealtimeProvider>
          <StatusBar barStyle="dark-content" />
          <AppNavigator />
        </RealtimeProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
