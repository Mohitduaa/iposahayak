import React from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";

interface LoaderProps {
  background?: string;
  size?: "small" | "large";
  color?: string;
}

const Loader: React.FC<LoaderProps> = ({
  background = "#FFFFFF50",
  size = "large",
  color = "#007BFF", // 👈 Default base color
}) => {
  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default Loader;
