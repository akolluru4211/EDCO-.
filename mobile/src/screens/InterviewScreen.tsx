import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { useMobileAuth } from "../services/authContext";
import { MOBILE_QUESTIONS } from "../services/mockData";
import { MobileInterviewQuestion } from "../types";

export default function InterviewScreen() {
  const { profile, updateEffectiveLevel } = useMobileAuth();
  const sweInterest = profile.interests.find((i) => i.id === "swe");
  const userLevel = sweInterest ? sweInterest.effectiveLevel : 0;

  // Filter question matching user's effective level
  const [currentQuestion, setCurrentQuestion] = useState<MobileInterviewQuestion>(
    MOBILE_QUESTIONS.find((q) => q.difficultyLevel === userLevel) || MOBILE_QUESTIONS[0]
  );
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [useAudioOnly, setUseAudioOnly] = useState(false);
  const [sessionScore, setSessionScore] = useState<any | null>(null);

  useEffect(() => {
    let timer: any;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const handleStartRecording = () => {
    setSessionScore(null);
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // Simulate Cloud Function scoring pipeline response
    const simulatedOverall = 88;
    const scoreData = {
      overallScore: simulatedOverall,
      contentScore: 90,
      voiceScore: 85,
      wordsPerMinute: 138,
      fillerWordCount: 2,
      paceRating: "ideal",
      feedback: "Great STAR format clarity and structured explanation of non-blocking I/O.",
      nudged: userLevel < 2,
    };
    setSessionScore(scoreData);

    if (scoreData.nudged) {
      updateEffectiveLevel("swe", (userLevel + 1) as any);
      Alert.alert(
        "🎉 Level Up Nudge!",
        `Your score of ${simulatedOverall}% has advanced your Effective Level to Level ${userLevel + 1}!`
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>Adaptive Mock Interview</Text>
          <Text style={styles.headerTitle}>Practice Studio</Text>
        </View>

        {/* Question Card */}
        <View style={styles.questionCard}>
          <View style={styles.levelBadgeRow}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>Level {currentQuestion.difficultyLevel}</Text>
            </View>
            <Text style={styles.categoryText}>{currentQuestion.category}</Text>
          </View>
          <Text style={styles.questionText}>{currentQuestion.text}</Text>
          <Text style={styles.durationNote}>
            Suggested Answer Time: ~{currentQuestion.suggestedDurationSeconds}s
          </Text>
        </View>

        {/* Recording Viewfinder Placeholder / Audio Mode */}
        <View style={styles.viewfinder}>
          {useAudioOnly ? (
            <View style={styles.audioPlaceholder}>
              <Text style={styles.audioIcon}>🎙️</Text>
              <Text style={styles.audioLabel}>Audio Recording Mode Active</Text>
            </View>
          ) : (
            <View style={styles.cameraPlaceholder}>
              <Text style={styles.cameraIcon}>📹</Text>
              <Text style={styles.cameraLabel}>Front Camera View Active</Text>
              <Text style={styles.subNote}>Zero appearance scoring &bull; Content & Pace only</Text>
            </View>
          )}

          {isRecording && (
            <View style={styles.timerOverlay}>
              <View style={styles.recordingDot} />
              <Text style={styles.timerText}>
                {Math.floor(recordingSeconds / 60)}:
                {recordingSeconds % 60 < 10 ? "0" : ""}
                {recordingSeconds % 60}
              </Text>
            </View>
          )}
        </View>

        {/* Audio / Video Toggle */}
        <View style={styles.modeToggleRow}>
          <TouchableOpacity
            style={[styles.modeBtn, !useAudioOnly && styles.modeBtnActive]}
            onPress={() => setUseAudioOnly(false)}
          >
            <Text style={[styles.modeText, !useAudioOnly && styles.modeTextActive]}>Video + Audio</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, useAudioOnly && styles.modeBtnActive]}
            onPress={() => setUseAudioOnly(true)}
          >
            <Text style={[styles.modeText, useAudioOnly && styles.modeTextActive]}>Audio-Only Fallback</Text>
          </TouchableOpacity>
        </View>

        {/* Record Controls */}
        <View style={styles.controlsContainer}>
          {isRecording ? (
            <TouchableOpacity style={styles.stopButton} onPress={handleStopRecording}>
              <Text style={styles.stopButtonText}>■ Stop & Score Answer</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.startButton} onPress={handleStartRecording}>
              <Text style={styles.startButtonText}>● Start Recording Answer</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Scoring Scorecard */}
        {sessionScore && (
          <View style={styles.scorecard}>
            <View style={styles.scorecardHeader}>
              <Text style={styles.scorecardTitle}>Session Scorecard</Text>
              <Text style={styles.overallScoreText}>{sessionScore.overallScore}% Overall</Text>
            </View>

            <View style={styles.scoreBreakdownRow}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreItemVal}>{sessionScore.contentScore}%</Text>
                <Text style={styles.scoreItemLbl}>Content (STAR)</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreItemVal}>{sessionScore.voiceScore}%</Text>
                <Text style={styles.scoreItemLbl}>Voice Delivery</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreItemVal}>{sessionScore.wordsPerMinute} WPM</Text>
                <Text style={styles.scoreItemLbl}>Pace ({sessionScore.paceRating})</Text>
              </View>
            </View>

            <View style={styles.feedbackBox}>
              <Text style={styles.feedbackHeading}>AI Coaching Summary:</Text>
              <Text style={styles.feedbackBody}>{sessionScore.feedback}</Text>
            </View>
          </View>
        )}
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
  questionCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 16,
  },
  levelBadgeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  levelBadge: { backgroundColor: "#e0f2fe", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  levelBadgeText: { fontSize: 10, fontWeight: "800", color: "#0369a1" },
  categoryText: { fontSize: 11, color: "#64748b", fontWeight: "600" },
  questionText: { fontSize: 14, fontWeight: "800", color: "#0f172a", lineHeight: 20, marginBottom: 6 },
  durationNote: { fontSize: 10, color: "#94a3b8" },
  viewfinder: {
    height: 220,
    backgroundColor: "#0f172a",
    borderRadius: 20,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cameraPlaceholder: { alignItems: "center" },
  cameraIcon: { fontSize: 32, marginBottom: 4 },
  cameraLabel: { color: "#ffffff", fontSize: 13, fontWeight: "700" },
  subNote: { color: "#94a3b8", fontSize: 10, marginTop: 4 },
  audioPlaceholder: { alignItems: "center" },
  audioIcon: { fontSize: 32, marginBottom: 4 },
  audioLabel: { color: "#38bdf8", fontSize: 13, fontWeight: "700" },
  timerOverlay: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  recordingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#ef4444", marginRight: 6 },
  timerText: { color: "#ffffff", fontSize: 12, fontWeight: "800" },
  modeToggleRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    alignItems: "center",
  },
  modeBtnActive: { backgroundColor: "#0284c7", borderColor: "#0284c7" },
  modeText: { fontSize: 11, fontWeight: "700", color: "#475569" },
  modeTextActive: { color: "#ffffff" },
  controlsContainer: { marginBottom: 16 },
  startButton: {
    backgroundColor: "#0284c7",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  startButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "800" },
  stopButton: {
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  stopButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "800" },
  scorecard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 12,
  },
  scorecardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  scorecardTitle: { fontSize: 14, fontWeight: "900", color: "#0f172a" },
  overallScoreText: { fontSize: 16, fontWeight: "900", color: "#10b981" },
  scoreBreakdownRow: { flexDirection: "row", justifyContent: "space-between" },
  scoreItem: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 2,
  },
  scoreItemVal: { fontSize: 13, fontWeight: "800", color: "#0f172a" },
  scoreItemLbl: { fontSize: 9, color: "#64748b", marginTop: 2, textAlign: "center" },
  feedbackBox: { backgroundColor: "#f0fdf4", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#bbf7d0" },
  feedbackHeading: { fontSize: 11, fontWeight: "800", color: "#166534", marginBottom: 2 },
  feedbackBody: { fontSize: 11, color: "#15803d", lineHeight: 16 },
});
