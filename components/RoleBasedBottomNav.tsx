import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useRole } from "@/context/RoleContext";
import BottomNav from "@/app/ButtonNav/components";
import DoctorBottomNav from "@/app/DoctorBottomNav/doctorComponents";

export default function RoleBasedBottomNav() {
  const { role } = useRole();
  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      {role === "doctor" ? <DoctorBottomNav /> : <BottomNav />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    // Let inner navs position themselves
    ...Platform.select({
      web: { zIndex: 100 },
      default: { zIndex: 100 },
    }),
  },
});
