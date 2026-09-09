import React from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useMobileAuth } from "../services/authContext";

export default function ResumeScreen() {
  const { user } = useMobileAuth();

  const handleExportPdf = () => {
    Alert.alert("Export PDF", "Your ATS-optimized vector PDF is ready to download or print.");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>ATS Resume Studio</Text>
          <Text style={styles.headerTitle}>Resume Preview</Text>
        </View>

        {/* Action Header */}
        <View style={styles.actionRow}>
          <View style={styles.templatePill}>
            <Text style={styles.templatePillText}>Template: Classic ATS</Text>
          </View>
          <TouchableOpacity style={styles.exportBtn} onPress={handleExportPdf}>
            <Text style={styles.exportBtnText}>Export PDF 📄</Text>
          </TouchableOpacity>
        </View>

        {/* ATS Resume Sheet */}
        <View style={styles.resumeSheet}>
          <Text style={styles.applicantName}>{user.name}</Text>
          <Text style={styles.contactRow}>{user.email} &bull; San Francisco, CA &bull; github.com/alexrivera</Text>

          {/* Section: Summary */}
          <View style={styles.resumeSection}>
            <Text style={styles.sectionHeading}>Professional Summary</Text>
            <Text style={styles.bodyText}>
              Results-driven Full-Stack Software Engineer with expertise in TypeScript, React, Next.js, Node.js, and distributed PostgreSQL databases. Demonstrated ability to deliver high-throughput REST APIs and scalable web applications.
            </Text>
          </View>

          {/* Section: Skills Matrix */}
          <View style={styles.resumeSection}>
            <Text style={styles.sectionHeading}>Technical Skills Matrix</Text>
            <Text style={styles.skillsLine}>
              <Text style={styles.bold}>Languages & Frameworks:</Text> TypeScript, JavaScript, Python, React, Next.js, Node.js, Tailwind CSS
            </Text>
            <Text style={styles.skillsLine}>
              <Text style={styles.bold}>Cloud & Databases:</Text> PostgreSQL, Redis, Firebase, Docker, REST APIs, Git
            </Text>
          </View>

          {/* Section: Experience */}
          <View style={styles.resumeSection}>
            <Text style={styles.sectionHeading}>Experience</Text>
            <View style={styles.expHeader}>
              <Text style={styles.expTitle}>Software Engineering Fellow</Text>
              <Text style={styles.expDate}>2023 – Present</Text>
            </View>
            <Text style={styles.expCompany}>Tech Accelerator &bull; San Francisco, CA</Text>
            <Text style={styles.bulletPoint}>
              &bull; Architected high-throughput microservices reducing response latency by 34%.
            </Text>
            <Text style={styles.bulletPoint}>
              &bull; Developed responsive Next.js web applications with 99.8% uptime SLA.
            </Text>
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
  actionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  templatePill: { backgroundColor: "#e2e8f0", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  templatePillText: { fontSize: 11, fontWeight: "700", color: "#334155" },
  exportBtn: { backgroundColor: "#0284c7", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  exportBtnText: { color: "#ffffff", fontSize: 11, fontWeight: "800" },
  resumeSheet: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  applicantName: { fontSize: 18, fontWeight: "900", color: "#0f172a", textAlign: "center" },
  contactRow: { fontSize: 10, color: "#64748b", textAlign: "center", marginTop: 2, marginBottom: 14 },
  resumeSection: { marginBottom: 14 },
  sectionHeading: {
    fontSize: 12,
    fontWeight: "900",
    color: "#0f172a",
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 2,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  bodyText: { fontSize: 11, color: "#334155", lineHeight: 16 },
  skillsLine: { fontSize: 10, color: "#334155", lineHeight: 15, marginBottom: 3 },
  bold: { fontWeight: "800", color: "#0f172a" },
  expHeader: { flexDirection: "row", justifyContent: "space-between" },
  expTitle: { fontSize: 11, fontWeight: "800", color: "#0f172a" },
  expDate: { fontSize: 10, color: "#64748b" },
  expCompany: { fontSize: 10, color: "#64748b", fontStyle: "italic", marginBottom: 4 },
  bulletPoint: { fontSize: 10, color: "#334155", lineHeight: 14, marginLeft: 4, marginBottom: 2 },
});
