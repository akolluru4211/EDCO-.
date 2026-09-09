import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from "react-native";
import { supabase } from "../lib/supabase";

export default function DashboardScreen({ navigation }: any) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [streakDays, setStreakDays] = useState(3);
  const [totalPoints, setTotalPoints] = useState(240);

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          setProfile(data);
        }
      } catch (err) {
        console.warn("Mobile profile load note:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0f172a" />
      </View>
    );
  }

  const isMinor = profile?.age_band === "13-15" || profile?.age_band === "16-18";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{profile?.name || "Candidate"}</Text>
          </View>
          <View style={[styles.badge, isMinor ? styles.minorBadge : styles.adultBadge]}>
            <Text style={[styles.badgeText, isMinor ? styles.minorBadgeText : styles.adultBadgeText]}>
              {profile?.age_band || "18+"} Track
            </Text>
          </View>
        </View>

        {/* Gamification Streak & Points */}
        <View style={styles.statsCard}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>DAILY STREAK</Text>
            <Text style={styles.statValue}>🔥 {streakDays} Days</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>SKILL POINTS</Text>
            <Text style={styles.statValue}>⚡ {totalPoints} XP</Text>
          </View>
        </View>

        {/* Today's Adaptive Tasks */}
        <Text style={styles.sectionTitle}>TODAY&apos;S ADAPTIVE PRACTICE</Text>

        <TouchableOpacity 
          style={styles.taskCard}
          onPress={() => navigation?.navigate("InterviewStudio")}
        >
          <View style={styles.taskIconContainer}>
            <Text style={styles.taskIcon}>🎙️</Text>
          </View>
          <View style={styles.taskContent}>
            <Text style={styles.taskTitle}>AI Mock Interview Session</Text>
            <Text style={styles.taskSubtitle}>Calibrated to your primary skill level &bull; 5 min</Text>
          </View>
          <Text style={styles.taskPoints}>+40 XP</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.taskCard}
          onPress={() => navigation?.navigate("ResumeViewer")}
        >
          <View style={styles.taskIconContainer}>
            <Text style={styles.taskIcon}>📄</Text>
          </View>
          <View style={styles.taskContent}>
            <Text style={styles.taskTitle}>ATS Resume Keyword Calibration</Text>
            <Text style={styles.taskSubtitle}>Synchronize latest projects &bull; 3 min</Text>
          </View>
          <Text style={styles.taskPoints}>+20 XP</Text>
        </TouchableOpacity>

        {/* Career Gated Modules (18+) */}
        {!isMinor && (
          <>
            <Text style={styles.sectionTitle}>CAREER &amp; NETWORKING</Text>
            <View style={styles.row}>
              <TouchableOpacity 
                style={[styles.actionCard, { marginRight: 8 }]}
                onPress={() => navigation?.navigate("JobBoard")}
              >
                <Text style={styles.actionIcon}>💼</Text>
                <Text style={styles.actionTitle}>Job Board</Text>
                <Text style={styles.actionSubtitle}>Explore verified 1-tap listings</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionCard, { marginLeft: 8 }]}
                onPress={() => navigation?.navigate("Networking")}
              >
                <Text style={styles.actionIcon}>🤝</Text>
                <Text style={styles.actionTitle}>Mentors</Text>
                <Text style={styles.actionSubtitle}>Connect with verified leaders</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8fafc" },
  container: { padding: 20 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  greeting: { fontSize: 13, color: "#64748b", fontWeight: "600", textTransform: "uppercase" },
  userName: { fontSize: 24, fontWeight: "900", color: "#0f172a" },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  minorBadge: { backgroundColor: "#fef3c7" },
  adultBadge: { backgroundColor: "#dcfce7" },
  badgeText: { fontSize: 11, fontWeight: "800" },
  minorBadgeText: { color: "#92400e" },
  adultBadgeText: { color: "#166534" },
  statsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 24,
  },
  statBox: { flex: 1, alignItems: "center" },
  statDivider: { width: 1, backgroundColor: "#e2e8f0" },
  statLabel: { fontSize: 10, fontWeight: "800", color: "#94a3b8", marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: "900", color: "#0f172a" },
  sectionTitle: { fontSize: 11, fontWeight: "800", color: "#94a3b8", letterSpacing: 0.8, marginBottom: 12 },
  taskCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  taskIconContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#f1f5f9", justifyContent: "center", alignItems: "center", marginRight: 12 },
  taskIcon: { fontSize: 20 },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  taskSubtitle: { fontSize: 11, color: "#64748b", marginTop: 2 },
  taskPoints: { fontSize: 12, fontWeight: "800", color: "#16a34a" },
  row: { flexDirection: "row", justifyContent: "space-between" },
  actionCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  actionIcon: { fontSize: 24, marginBottom: 8 },
  actionTitle: { fontSize: 14, fontWeight: "800", color: "#0f172a" },
  actionSubtitle: { fontSize: 11, color: "#64748b", marginTop: 2 },
});
