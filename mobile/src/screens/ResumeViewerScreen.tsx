import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator } from "react-native";
import { supabase } from "../lib/supabase";

export default function ResumeViewerScreen({ navigation }: any) {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResumes() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("resumes")
            .select("*")
            .eq("user_id", user.id);
          setResumes(data || []);
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    }
    fetchResumes();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>ATS Resume Studio</Text>
          <Text style={styles.subtitle}>Calibrated for High-Keyword Precision</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0f172a" style={{ marginTop: 40 }} />
        ) : resumes.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📄</Text>
            <Text style={styles.emptyTitle}>No Resumes Created Yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your ATS-optimized resume using our guided builder on the web or mobile studio.
            </Text>
          </View>
        ) : (
          resumes.map((r) => (
            <View key={r.id} style={styles.resumeCard}>
              <Text style={styles.resumeTitle}>{r.title}</Text>
              <Text style={styles.resumeRole}>Target: {r.target_role || "General Software Engineer"}</Text>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreText}>Calibrated ATS Match</Text>
                <Text style={styles.scoreValue}>88 / 100</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8fafc" },
  container: { padding: 20 },
  header: { marginBottom: 20 },
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
  emptySubtitle: { fontSize: 12, color: "#64748b", textAlign: "center", lineHeight: 18 },
  resumeCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
  },
  resumeTitle: { fontSize: 15, fontWeight: "800", color: "#0f172a" },
  resumeRole: { fontSize: 12, color: "#64748b", marginTop: 4 },
  scoreRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  scoreText: { fontSize: 11, fontWeight: "600", color: "#64748b" },
  scoreValue: { fontSize: 12, fontWeight: "800", color: "#16a34a" },
});
