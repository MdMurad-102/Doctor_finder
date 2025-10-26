import { db } from "@/firebaseConfig";
import { useLocalSearchParams } from "expo-router";
import { get, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { theme } from "@/constants/theme";

export default function DoctorDetails() {
  const { uid } = useLocalSearchParams(); // uid from navigation params
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const calculateAge = (dob: string) => {
    if (!dob) return "-";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    if (!uid) return;
    const fetchDoctor = async () => {
      try {
        const snapshot = await get(ref(db, "doctors/" + uid));
        if (snapshot.exists()) {
          setDoctor(snapshot.val());
        }
      } catch (error) {
        console.error("Error fetching doctor details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [uid]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading doctor details...</Text>
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFoundText}>Doctor not found</Text>
      </View>
    );
  }

  const infoFields = [
    { label: "Phone", value: doctor.phone, emoji: "📞" },
    { label: "Email", value: doctor.email, emoji: "📧" },
    { label: "Degree", value: doctor.degree, emoji: "🎓" },
    { label: "Department", value: doctor.department, emoji: "🏥" },
    { label: "Hospital", value: doctor.hospital, emoji: "🏩" },
    { label: "Chamber/Place", value: doctor.place, emoji: "📍" },
    { label: "Appointment Time", value: doctor.appointmentTime, emoji: "⏰" },
    { label: "Status", value: doctor.status, emoji: "👨‍⚕️" },
    { label: "Age", value: calculateAge(doctor.dob), emoji: "🎂" },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Doctor Avatar */}
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: doctor.photoURL || "https://cdn-icons-png.flaticon.com/512/1077/1077114.png" }}
          style={styles.avatar}
        />
        <Text style={styles.title}>{doctor.name}</Text>
        <Text style={styles.subtitle}>{doctor.degree} | {doctor.department}</Text>
        <Text style={styles.subtitle}>{doctor.hospital}</Text>
      </View>

      {/* Doctor Info */}
      <View style={styles.infoContainer}>
        {infoFields.map((field, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardLabel}>{field.emoji} {field.label}</Text>
            <Text style={styles.cardValue}>{field.value}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.xs,
    color: theme.colors.primary,
    fontSize: 16,
  },
  notFoundText: {
    color: theme.colors.danger,
    fontSize: 16,
  },
  avatarContainer: {
    alignItems: "center",
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
    ...theme.shadow,
    borderBottomLeftRadius: theme.radius.md,
    borderBottomRightRadius: theme.radius.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: 2,
  },
  infoContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadow,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardLabel: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: 4,
    fontWeight: "600",
  },
  cardValue: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
});
