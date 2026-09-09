import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";

export default function InterviewStudioScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const questions = [
    {
      q: "Explain the difference between synchronous and asynchronous programming with a real-world scenario.",
      points: ["Blocking vs non-blocking I/O", "UI responsiveness", "Network API requests"],
    },
    {
      q: "How does React's Virtual DOM reconciliation improve rendering performance?",
      points: ["Tree diffing", "Batching DOM updates", "Minimized browser reflows"],
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.badge}>AI MOCK STUDIO &bull; VOICE &amp; VIDEO</Text>
          <Text style={styles.title}>Practice Question {currentStep + 1} of {questions.length}</Text>
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{questions[currentStep].q}</Text>
          <View style={styles.keyPointsBox}>
            <Text style={styles.keyPointsTitle}>EVALUATION KEY POINTS:</Text>
            {questions[currentStep].points.map((p, idx) => (
              <Text key={idx} style={styles.pointItem}>&bull; {p}</Text>
            ))}
          </View>
        </View>

        {/* Audio Recording Controls */}
        <View style={styles.recordingSection}>
          <TouchableOpacity
            style={[styles.recordButton, isRecording ? styles.recordActive : styles.recordInactive]}
            onPress={() => setIsRecording(!isRecording)}
          >
            <Text style={styles.recordIcon}>{isRecording ? "⏹️" : "🎙️"}</Text>
            <Text style={styles.recordText}>
              {isRecording ? "Stop & Transcribe" : "Start Voice Practice"}
            </Text>
          </TouchableOpacity>

          {isRecording && (
            <Text style={styles.recordingNotice}>🔴 Listening with real-time speech telemetry...</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8fafc" },
  container: { padding: 20 },
  header: { marginBottom: 20 },
  badge: { fontSize: 10, fontWeight: "800", color: "#3b82f6", letterSpacing: 0.8, marginBottom: 4 },
  title: { fontSize: 20, fontWeight: "900", color: "#0f172a" },
  questionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 24,
  },
  questionText: { fontSize: 16, fontWeight: "700", color: "#0f172a", lineHeight: 24 },
  keyPointsBox: { backgroundColor: "#f8fafc", borderRadius: 12, padding: 14, marginTop: 16 },
  keyPointsTitle: { fontSize: 10, fontWeight: "800", color: "#94a3b8", marginBottom: 6 },
  pointItem: { fontSize: 12, color: "#64748b", lineHeight: 18 },
  recordingSection: { alignItems: "center", marginTop: 20 },
  recordButton: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  recordInactive: { backgroundColor: "#0f172a" },
  recordActive: { backgroundColor: "#ef4444" },
  recordIcon: { fontSize: 20, marginRight: 8 },
  recordText: { fontSize: 14, fontWeight: "800", color: "#ffffff" },
  recordingNotice: { fontSize: 11, fontWeight: "600", color: "#ef4444", marginTop: 12 },
});
