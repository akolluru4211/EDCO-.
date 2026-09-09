import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import DashboardScreen from "./src/screens/DashboardScreen";
import ResumeViewerScreen from "./src/screens/ResumeViewerScreen";
import InterviewStudioScreen from "./src/screens/InterviewStudioScreen";
import JobBoardScreen from "./src/screens/JobBoardScreen";
import NetworkingScreen from "./src/screens/NetworkingScreen";

export default function App() {
  const [currentTab, setCurrentTab] = useState<"dashboard" | "resumes" | "interviews" | "jobs" | "mentors">("dashboard");

  const renderScreen = () => {
    switch (currentTab) {
      case "dashboard":
        return <DashboardScreen navigation={{ navigate: (tab: any) => setCurrentTab(tab) }} />;
      case "resumes":
        return <ResumeViewerScreen />;
      case "interviews":
        return <InterviewStudioScreen />;
      case "jobs":
        return <JobBoardScreen />;
      case "mentors":
        return <NetworkingScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.mainContent}>
        {renderScreen()}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab("dashboard")}
        >
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={[styles.navText, currentTab === "dashboard" && styles.navActiveText]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab("interviews")}
        >
          <Text style={styles.navIcon}>🎙️</Text>
          <Text style={[styles.navText, currentTab === "interviews" && styles.navActiveText]}>Interview</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab("resumes")}
        >
          <Text style={styles.navIcon}>📄</Text>
          <Text style={[styles.navText, currentTab === "resumes" && styles.navActiveText]}>Resumes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab("jobs")}
        >
          <Text style={styles.navIcon}>💼</Text>
          <Text style={[styles.navText, currentTab === "jobs" && styles.navActiveText]}>Jobs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab("mentors")}
        >
          <Text style={styles.navIcon}>🤝</Text>
          <Text style={[styles.navText, currentTab === "mentors" && styles.navActiveText]}>Mentors</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  mainContent: { flex: 1 },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    justifyContent: "space-around",
  },
  navItem: { alignItems: "center" },
  navIcon: { fontSize: 18, marginBottom: 2 },
  navText: { fontSize: 10, fontWeight: "700", color: "#94a3b8" },
  navActiveText: { color: "#0f172a" },
});
