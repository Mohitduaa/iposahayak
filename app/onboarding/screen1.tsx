import { View, Text, TouchableOpacity, Image, useColorScheme } from "react-native";
import { useRouter } from "expo-router";

export default function Screen1() {
  const router = useRouter();
  const scheme = useColorScheme(); // Detect dark or light mode

  // Theme colors
  const isDark = scheme === "dark";
  const backgroundColor = isDark ? "#1E293B" : "#FFFFFF";
  const textColor = isDark ? "#FFFFFF" : "#333333";
  const subTextColor = isDark ? "#BBBBBB" : "#555555";
  const buttonColor = isDark ? "#1E40AF" : "#1E40AF";

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: backgroundColor,
      }}
    >
      <Image
  source={require("../../assets/images/first.png")}
  style={{ width: 260, height: 260, marginBottom: 30, borderRadius: 15, }}
/>


      <Text style={{ fontSize: 26, fontWeight: "bold", color: textColor, marginBottom: 12 }}>
        Welcome to IPO Sahayak
      </Text>

      <Text
        style={{
          fontSize: 16,
          color: subTextColor,
          textAlign: "center",
          marginBottom: 40,
          lineHeight: 22,
        }}
      >
        Get real-time IPO updates, subscription data and premium insights.
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/onboarding/screen2")}
        style={{
          backgroundColor: buttonColor,
          paddingVertical: 14,
          paddingHorizontal: 40,
          borderRadius: 10,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 3,
          elevation: 3,
        }}
      >
        <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}
