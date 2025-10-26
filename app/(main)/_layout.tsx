import React from "react";
import { Slot } from "expo-router";
import { StyleSheet, View } from "react-native";
import RoleBasedBottomNav from "@/components/RoleBasedBottomNav";

export default function MainGroupLayout() {
  return (
    <View style={styles.container}>
      <Slot />
      <RoleBasedBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: "relative" },
});
