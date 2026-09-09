import React from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import { useMobileAuth } from "../services/authContext";

export default function ProfileScreen() {
  const { user, profile, isMinor, switchPersona } = useMobileAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>User Account & Goals</Text>
          <Text style={styles.headerTitle}>Profile & Readiness</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
            </View>
            <View style={styles.userMeta}>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.email}>{user.email}</Text>
              <Text style={styles.grade}>{profile.gradeLevel || user.gradeLevel}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Age Band:</Text>
            <Text style={styles.infoVal}>{user.ageBand}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Safety Status:</Text>
            <Text style={[styles.infoVal, isMinor ? styles.valMinor : styles.valAdult]}>
              {isMinor ? "Protected Minor" : "Career Track (18+)"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Public Visibility:</Text>
            <Text style={styles.infoVal}>{isMinor ? "Locked (Private)" : profile.isPublic ? "Public" : "Private"}</Text>
          </View>
        </View>

        {/* Goal Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Primary Objective</Text>
          <Text style={styles.goalText}>{profile.primaryGoal}</Text>
        </View>

        {/* Fast Switch Persona for Testing */}
        <View style={styles.personaSwitchBox}>
          <Text style={styles.personaBoxTitle}>Demo Persona Toggle</Text>
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.personaBtn, !isMinor && styles.personaBtnActive]}
              onPress={() => switchPersona("adult")}
            >
              <Text style={[styles.personaBtnText, !isMinor && styles.personaBtnTextActive]}>
                Adult (18+)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.personaBtn, isMinor && styles.personaBtnActive]}
              onPress={() => switchPersona("minor")}
            >
              <Text style={[styles.personaBtnText, isMinor && styles.personaBtnTextActive]}>
                Class 10 Minor
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContent: { padding: 18, paddingBottom: 32 },
  header: { marginBottom: 14 },
  headerSubtitle: { fontSize: 11, fontWeight: "700", color: "#64748b", textTransform: "uppercase" },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#0f172a" },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 14,
  },
  avatarRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { fontSize: 20, fontWeight: "900", color: "#0284c7" },
  userMeta: { flex: 1 },
  name: { fontSize: 16, fontWeight: "900", color: "#0f172a" },
  email: { fontSize: 11, color: "#64748b" },
  grade: { fontSize: 11, color: "#0284c7", fontWeight: "700", marginTop: 2 },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginBottom: 10 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  infoLabel: { fontSize: 11, color: "#64748b" },
  infoVal: { fontSize: 11, fontWeight: "700", color: "#0f172a" },
  valMinor: { color: "#d97706" },
  valAdult: { color: "#059669" },
  cardHeading: { fontSize: 12, fontWeight: "800", color: "#0f172a", textTransform: "uppercase", marginBottom: 6 },
  goalText: { fontSize: 12, color: "#334155", lineHeight: 18 },
  personaSwitchBox: {
    backgroundColor: "#f1f5f9",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  personaBoxTitle: { fontSize: 11, fontWeight: "800", color: "#475569", textTransform: "uppercase", marginBottom: 10 },
  btnRow: { flexDirection: "row", gap: 8 },
  personaBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  personaBtnActive: { backgroundColor: "#0f172a", borderColor: "#0f172a" },
  personaBtnText: { fontSize: 11, fontWeight: "700", color: "#475569" },
  personaBtnTextActive: { color: "#ffffff" },
});
