import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { SyncedAccountStats } from "../types";

interface SyncedAccountsCardProps {
  stats: SyncedAccountStats;
}

export default function SyncedAccountsCard({ stats }: SyncedAccountsCardProps) {
  const handleOpenWebSync = () => {
    Linking.openURL("https://edworld.co/profile");
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Synced Account Snapshot</Text>
        <TouchableOpacity onPress={handleOpenWebSync} activeOpacity={0.7}>
          <Text style={styles.manageLink}>Manage on Web ↗</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        {/* GitHub */}
        <View style={styles.statItem}>
          <View style={styles.badgeRow}>
            <View style={[styles.statusDot, stats.githubConnected ? styles.dotGreen : styles.dotGray]} />
            <Text style={styles.platformName}>GitHub</Text>
          </View>
          <Text style={styles.statNumber}>{stats.githubReposCount || 0} repos</Text>
          <Text style={styles.statSub}>{stats.githubStarsCount || 0} stars</Text>
        </View>

        {/* LeetCode */}
        <View style={styles.statItem}>
          <View style={styles.badgeRow}>
            <View style={[styles.statusDot, stats.leetcodeConnected ? styles.dotGreen : styles.dotGray]} />
            <Text style={styles.platformName}>LeetCode</Text>
          </View>
          <Text style={styles.statNumber}>{stats.leetcodeProblemsSolved || 0}</Text>
          <Text style={styles.statSub}>solved</Text>
        </View>

        {/* LinkedIn */}
        <View style={styles.statItem}>
          <View style={styles.badgeRow}>
            <View style={[styles.statusDot, stats.linkedinConnected ? styles.dotGreen : styles.dotGray]} />
            <Text style={styles.platformName}>LinkedIn</Text>
          </View>
          <Text style={styles.statNumber}>{stats.linkedinConnected ? "Verified" : "Pending"}</Text>
          <Text style={styles.statSub}>Profile Link</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  manageLink: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0284c7",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 12,
    marginHorizontal: 3,
    alignItems: "center",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotGreen: {
    backgroundColor: "#10b981",
  },
  dotGray: {
    backgroundColor: "#94a3b8",
  },
  platformName: {
    fontSize: 10,
    fontWeight: "700",
    color: "#475569",
  },
  statNumber: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },
  statSub: {
    fontSize: 9,
    color: "#64748b",
  },
});
