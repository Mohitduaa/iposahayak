import { useState, useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { Platform } from "react-native";
import { makeRedirectUri } from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession(); // Yeh top pe zaroor hona chahiye

export function useGoogleAuth() {
  const [userInfo, setUserInfo] = useState(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    // expoClientId: "625794587531-r54gs8th0cambhgc8ilstojfcrcuvr0d.apps.googleusercontent.com",
    iosClientId: "<YOUR_IOS_CLIENT_ID>",
    androidClientId: "625794587531-r54gs8th0cambhgc8ilstojfcrcuvr0d.apps.googleusercontent.com",
    webClientId: "625794587531-j4siklqk0l1ohadunckbfgrcfotpuvrr.apps.googleusercontent.com",
    redirectUri: makeRedirectUri({
      scheme: "yourapp", // apne app ka scheme
      useProxy: Platform.OS !== "web", // web ke liye false
    }),
  });

  useEffect(() => {
    if (!response) return;

    if (response.type === "success" && response.authentication?.accessToken) {
      console.log("✅ Access Token:", response.authentication.accessToken);
      fetchUserInfo(response.authentication.accessToken);

      // Web me refresh survive karane ke liye token save karo
      if (Platform.OS === "web") {
        localStorage.setItem("google_token", response.authentication.accessToken);
      }
    } else if (response.type !== "success") {
      console.log("❌ Google login failed or cancelled:", response);
    }
  }, [response]);

  // Web pe token restore
  useEffect(() => {
    if (Platform.OS === "web") {
      const savedToken = localStorage.getItem("google_token");
      if (savedToken) {
        fetchUserInfo(savedToken);
      }
    }
  }, []);

  const fetchUserInfo = async (token) => {
    try {
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = await res.json();
      console.log(Platform.OS === "web" ? "🌐 Google User Data:" : "📱 Google User Data:", user);
      setUserInfo(user);
    } catch (error) {
      console.error("❌ Failed to fetch user info", error);
    }
  };

  return { userInfo, promptAsync, request };
}
