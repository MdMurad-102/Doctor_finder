// components/BottomNav.tsx
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "@/constants/theme";

export default function BottomNav() {
  return (
    <View style={styles.navBar}>
      <TouchableOpacity style={styles.navBtn} onPress={() => router.push("/(main)/Home/(tabs)/home")}>
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navBtn} onPress={() => router.push("/(main)/Department/department")}>
        <Text style={styles.navText}>Department</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navBtn} onPress={() => router.push("/(main)/Hospital/hospitals")}>
        <Text style={styles.navText}>Hospital</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: theme.colors.tabBarBg,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderColor: theme.colors.tabBarBorder,

    // Fixed at bottom
    position: "absolute",
    bottom: 0,
    width: "100%",
    zIndex: 100,
  },
  navBtn: {
    flex: 1,
    alignItems: "center",
  },
  navText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.tabBarActive,
  },
});

