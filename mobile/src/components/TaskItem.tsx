import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { DailyTask } from "../types";

interface TaskItemProps {
  task: DailyTask;
  onToggle: (taskId: string) => void;
  onPressAction: (task: DailyTask) => void;
}

export default function TaskItem({ task, onToggle, onPressAction }: TaskItemProps) {
  return (
    <View style={[styles.card, task.completed && styles.cardCompleted]}>
      <TouchableOpacity
        onPress={() => onToggle(task.id)}
        style={[styles.checkbox, task.completed && styles.checkboxCompleted]}
        activeOpacity={0.7}
      >
        {task.completed && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onPressAction(task)}
        style={styles.content}
        activeOpacity={0.7}
      >
        <View style={styles.tagRow}>
          <Text style={styles.categoryTag}>{task.category}</Text>
          <Text style={styles.durationTag}>~{task.estimatedMinutes} min</Text>
          <Text style={styles.levelTag}>Lvl {task.levelTarget}</Text>
        </View>
        <Text style={[styles.title, task.completed && styles.titleCompleted]}>
          {task.title}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 10,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardCompleted: {
    backgroundColor: "#f8fafc",
    borderColor: "#cbd5e1",
    opacity: 0.8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  checkmark: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  categoryTag: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0284c7",
    textTransform: "uppercase",
  },
  durationTag: {
    fontSize: 10,
    color: "#64748b",
  },
  levelTag: {
    fontSize: 10,
    fontWeight: "700",
    backgroundColor: "#e0f2fe",
    color: "#0369a1",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 18,
  },
  titleCompleted: {
    textDecorationLine: "line-through",
    color: "#94a3b8",
  },
});
