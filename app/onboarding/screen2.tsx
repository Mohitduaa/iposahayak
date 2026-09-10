// app/onboarding/screen2.tsx
import React from "react";
import { View, Text, Image, TouchableOpacity, useColorScheme, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Screen2() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
    },
    image: {
      width: 250,
      height: 250,
      marginBottom: 30,
      borderRadius: 12,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: isDark ? "#FFFFFF" : "#333333",
      marginBottom: 10,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 16,
      color: isDark ? "#CCCCCC" : "#555555",
      textAlign: "center",
      marginBottom: 40,
      paddingHorizontal: 10,
    },
    button: {
      backgroundColor: "#1E40AF",
      paddingVertical: 14,
      paddingHorizontal: 40,
      borderRadius: 10,
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 5,
    },
    buttonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
  });

  return (
    <View style={styles.container}>
      <Image
          source={require("../../assets/images/first.png")}
        style={styles.image}
      />
      <Text style={styles.title}>Track Live Subscriptions</Text>
      <Text style={styles.subtitle}>
        Stay ahead by tracking real-time IPO subscription data and grey market premium trends.
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => router.push("/onboarding/screen3")}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}
