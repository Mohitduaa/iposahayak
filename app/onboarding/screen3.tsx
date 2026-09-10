import { View, Text, Pressable, Image, useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Screen3() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const finishIntro = async () => {
    await AsyncStorage.setItem("introSeen", "true");
    router.replace("/(auth)/login");
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
      }}
    >
      <Image
         source={require("../../assets/images/second.png")}

        style={{
          width: 250,
          height: 250,
          marginBottom: 30,
          borderRadius: 12,
        }}
      />

      <Text
        style={{
          fontSize: 24,
          fontWeight: "700",
          color: isDark ? "#FFFFFF" : "#333333",
          marginBottom: 10,
          textAlign: "center",
        }}
      >
        Expert Insights & Alerts
      </Text>

      <Text
        style={{
          fontSize: 16,
          color: isDark ? "#BBBBBB" : "#555555",
          textAlign: "center",
          marginBottom: 40,
          lineHeight: 22,
        }}
      >
        Get timely alerts, expert opinions and in-depth analysis for informed investing.
      </Text>

      <Pressable
        onPress={finishIntro}
        style={{
          backgroundColor: "#1E40AF",
          paddingVertical: 14,
          paddingHorizontal: 30,
          borderRadius: 8,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}>
          Get Started
        </Text>
      </Pressable>
    </View>
  );
}
