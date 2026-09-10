import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/types";
import { useNavigation } from "@react-navigation/native";
import { signOutOfGoogle } from "@/services/googleSignIn";

// The one key the session token lives under. The login screen used to
// write "token" while the rest of the app read "authToken", so the daily
// active ping never had anything to send.
export const TOKEN_KEY = "authToken";
export const USER_KEY = "user";

/** The shape /auth/login, /auth/google and /auth/verify-otp all answer with. */
export interface LoginPayload {
  token: string;
  user: any;
}

export function useUser() {
  const navigation = useNavigation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load user + token on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = await AsyncStorage.getItem(USER_KEY);
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error("Error loading user from storage", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // ✅ Save token + user after login
  const setUserFromLogin = async (data: LoginPayload) => {
    try {
      const { token, user } = data;
      await AsyncStorage.setItem(TOKEN_KEY, token);

      const formattedUser: User = {
        id: user?._id || user?.id || "",
        email: user?.email || "",
        name: user?.name || "",
        isPremium: true, // default true after login
        panNumbers: [],
        alerts: [],
      };

      setUser(formattedUser);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(formattedUser));
    } catch (error) {
      console.error("Error setting user from login", error);
    }
  };

  // ✅ Logout clears everything
  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, "token"]);
      await signOutOfGoogle();
      setUser(null);
      console.log("Logging out...");

      // Reset navigation to auth stack
      navigation.reset({
        index: 0,
        routes: [{ name: "(auth)" }], // 👈 make sure "(auth)" matches your stack name
      });
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  // ✅ Update subscription info
  const updateSubscription = async (
    isPremium: boolean,
    subscriptionEnd?: string
  ) => {
    if (!user) return;
    const updatedUser = { ...user, isPremium, subscriptionEnd };
    setUser(updatedUser);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  };

  return { user, loading, setUserFromLogin, logout, updateSubscription };
}
