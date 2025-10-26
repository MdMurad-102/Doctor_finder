import { Redirect } from "expo-router";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Slot } from "expo-router";
import { StyleSheet, View } from "react-native";
import { RoleProvider } from "@/context/RoleContext";
import { theme } from "@/constants/theme";
 
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <RoleProvider>
        <SafeAreaView style={styles.safe}>
          <View style={styles.container}>
            <Redirect href="/screen/first" />
            <Slot />
          </View>
        </SafeAreaView>
      </RoleProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, position: "relative", backgroundColor: theme.colors.background },
});