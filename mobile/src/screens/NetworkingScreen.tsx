import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, ActivityIndicator } from "react-native";
import { supabase } from "../lib/supabase";

export default function NetworkingScreen() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMentors() {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("is_mentor", true)
          .eq("age_band", "18+");
        setMentors(data || []);
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMentors();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>18+ Mentor Directory</Text>
          <Text style={styles.subtitle}>Verified Industry Leaders &amp; Technical Mentors</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0f172a" style={{ marginTop: 40 }} />
        ) : mentors.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🤝</Text>
            <Text style={styles.emptyTitle}>No Mentors Available</Text>
            <Text style={styles.emptySubtitle}>Apply to become a mentor or check back soon.</Text>
          </View>
        ) : (
          <FlatList
            data={mentors}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.mentorCard}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name?.charAt(0) || "M"}</Text>
                </View>
                <View style={styles.mentorInfo}>
                  <Text style={styles.mentorName}>{item.name}</Text>
                  <Text style={styles.mentorHeadline}>{item.headline || "Industry Professional"}</Text>
                </View>
                <TouchableOpacity style={styles.connectBtn}>
                  <Text style={styles.connectBtnText}>Connect</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8fafc" },
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "900", color: "#0f172a" },
  subtitle: { fontSize: 12, color: "#64748b", marginTop: 4 },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginTop: 20,
  },
  emptyIcon: { fontSize: 36, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 6 },
  emptySubtitle: { fontSize: 12, color: "#64748b", textAlign: "center" },
  mentorCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { color: "#ffffff", fontWeight: "900", fontSize: 16 },
  mentorInfo: { flex: 1 },
  mentorName: { fontSize: 14, fontWeight: "800", color: "#0f172a" },
  mentorHeadline: { fontSize: 11, color: "#64748b", marginTop: 2 },
  connectBtn: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  connectBtnText: { color: "#0f172a", fontSize: 11, fontWeight: "700" },
});
