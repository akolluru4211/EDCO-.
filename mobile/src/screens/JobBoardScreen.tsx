import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, ActivityIndicator } from "react-native";
import { supabase } from "../lib/supabase";

export default function JobBoardScreen() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const { data } = await supabase
          .from("jobs")
          .select("*")
          .eq("is_active", true)
          .eq("moderation_status", "approved");
        setJobs(data || []);
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>18+ Career Job Board</Text>
          <Text style={styles.subtitle}>Verified High-Growth Engineering &amp; AI Roles</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0f172a" style={{ marginTop: 40 }} />
        ) : jobs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>💼</Text>
            <Text style={styles.emptyTitle}>No Open Positions Right Now</Text>
            <Text style={styles.emptySubtitle}>Check back soon for freshly verified industry openings.</Text>
          </View>
        ) : (
          <FlatList
            data={jobs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.jobCard}>
                <Text style={styles.jobTitle}>{item.title}</Text>
                <Text style={styles.companyName}>{item.company} &bull; {item.location}</Text>
                <Text style={styles.salary}>{item.salary_range || "Competitive Pay"}</Text>
                <TouchableOpacity style={styles.applyBtn}>
                  <Text style={styles.applyBtnText}>1-Tap Apply</Text>
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
  jobCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
  },
  jobTitle: { fontSize: 15, fontWeight: "800", color: "#0f172a" },
  companyName: { fontSize: 12, color: "#64748b", marginTop: 4 },
  salary: { fontSize: 12, fontWeight: "700", color: "#16a34a", marginTop: 8 },
  applyBtn: {
    backgroundColor: "#0f172a",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  applyBtnText: { color: "#ffffff", fontSize: 12, fontWeight: "800" },
});
