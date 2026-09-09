import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
} from "react-native";
import { useMobileAuth } from "../services/authContext";

export default function AuthScreen() {
  const { loginWithApple, loginWithGoogle, loginWithEmail, signupWithGuardianConsent } = useMobileAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("2009-04-15"); // Sample minor DOB for review testing
  const [guardianEmail, setGuardianEmail] = useState("");

  const isUnder18 = dob > "2008-01-01";

  const handleEmailSubmit = () => {
    if (isSignUp) {
      signupWithGuardianConsent(name || "Student", email || "test@example.com", dob, guardianEmail);
    } else {
      loginWithEmail(email || "alex.rivera@example.com");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.brandHeader}>
          <Text style={styles.brandLogo}>✨ Edworld Co</Text>
          <Text style={styles.tagline}>Personalized Career & Skills Growth</Text>
        </View>

        <View style={styles.authCard}>
          <Text style={styles.authTitle}>{isSignUp ? "Create Your Account" : "Welcome Back"}</Text>

          {/* Apple Sign In Button (Required by App Store Guideline 4.8) */}
          <TouchableOpacity style={styles.appleButton} onPress={loginWithApple} activeOpacity={0.8}>
            <Text style={styles.appleButtonText}> Sign in with Apple</Text>
          </TouchableOpacity>

          {/* Google Sign In Button */}
          <TouchableOpacity style={styles.googleButton} onPress={loginWithGoogle} activeOpacity={0.8}>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with email</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email Inputs */}
          {isSignUp && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Maya Chen"
                value={name}
                onChangeText={setName}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.textInput}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {isSignUp && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date of Birth (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="2009-04-15"
                  value={dob}
                  onChangeText={setDob}
                />
              </View>

              {isUnder18 && (
                <View style={styles.guardianBox}>
                  <Text style={styles.guardianTitle}>🔒 Guardian Consent Required (Under-18)</Text>
                  <Text style={styles.guardianDesc}>
                    For students in Class 9-12 (under 18), Edworld locks public profile visibility and notifies your parent/guardian.
                  </Text>
                  <TextInput
                    style={[styles.textInput, styles.guardianInput]}
                    placeholder="parent.guardian@example.com"
                    keyboardType="email-address"
                    value={guardianEmail}
                    onChangeText={setGuardianEmail}
                  />
                </View>
              )}
            </>
          )}

          <TouchableOpacity style={styles.submitBtn} onPress={handleEmailSubmit} activeOpacity={0.8}>
            <Text style={styles.submitBtnText}>
              {isSignUp ? "Complete Registration" : "Sign In with Email"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setIsSignUp(!isSignUp)}
            activeOpacity={0.7}
          >
            <Text style={styles.toggleText}>
              {isSignUp ? "Already have an account? Sign In" : "New to Edworld? Create Account"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0f172a" },
  scrollContent: { padding: 20, justifyContent: "center", minHeight: "100%" },
  brandHeader: { alignItems: "center", marginBottom: 24 },
  brandLogo: { fontSize: 28, fontWeight: "900", color: "#ffffff" },
  tagline: { fontSize: 12, color: "#94a3b8", marginTop: 4 },
  authCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  authTitle: { fontSize: 18, fontWeight: "900", color: "#0f172a", textAlign: "center", marginBottom: 16 },
  appleButton: {
    backgroundColor: "#000000",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  appleButtonText: { color: "#ffffff", fontSize: 13, fontWeight: "800" },
  googleButton: {
    backgroundColor: "#f8fafc",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 16,
  },
  googleButtonText: { color: "#0f172a", fontSize: 13, fontWeight: "700" },
  dividerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e2e8f0" },
  dividerText: { fontSize: 10, color: "#94a3b8", marginHorizontal: 8, textTransform: "uppercase" },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 11, fontWeight: "700", color: "#475569", marginBottom: 4 },
  textInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: "#0f172a",
  },
  guardianBox: {
    backgroundColor: "#fef3c7",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fde68a",
    marginBottom: 12,
  },
  guardianTitle: { fontSize: 11, fontWeight: "800", color: "#92400e", marginBottom: 2 },
  guardianDesc: { fontSize: 10, color: "#b45309", lineHeight: 14, marginBottom: 8 },
  guardianInput: { backgroundColor: "#ffffff" },
  submitBtn: {
    backgroundColor: "#0284c7",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
    marginBottom: 12,
  },
  submitBtnText: { color: "#ffffff", fontSize: 13, fontWeight: "800" },
  toggleRow: { alignItems: "center" },
  toggleText: { color: "#0284c7", fontSize: 11, fontWeight: "700" },
});
