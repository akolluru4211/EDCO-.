import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { SkillLevel } from "../types";

interface GrowthRingSvgProps {
  selfLevel: SkillLevel;
  effectiveLevel: SkillLevel;
  size?: number;
  strokeWidth?: number;
}

export default function GrowthRingSvg({
  selfLevel,
  effectiveLevel,
  size = 72,
  strokeWidth = 6,
}: GrowthRingSvgProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  // Level progression percentage: (effectiveLevel + 1) / 3
  const progressRatio = Math.min(1, (effectiveLevel + 1) / 3);
  const strokeDashoffset = circumference - progressRatio * circumference;

  const isNudgedUp = effectiveLevel > selfLevel;
  const ringColor = isNudgedUp ? "#10b981" : effectiveLevel === 2 ? "#8b5cf6" : "#0284c7";

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background Track Ring */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active Level Growth Ring */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </G>
      </Svg>

      {/* Center Level Number */}
      <View style={styles.centerTextContainer}>
        <Text style={styles.levelPrefix}>LVL</Text>
        <Text style={[styles.levelText, { color: ringColor }]}>{effectiveLevel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerTextContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  levelPrefix: {
    fontSize: 8,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.5,
  },
  levelText: {
    fontSize: 16,
    fontWeight: "900",
    marginTop: -2,
  },
});
