import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

export default function LoanScreen() {
  return (
    <View style={styles.container}>
      {Platform.OS === "web" ? (
        <iframe
          src="https://www.npmjs.com/package/react-native-webview"
          style={{ width: "100%", height: "100%", border: "none" }}
          title="webview"
        />
      ) : (
        <WebView
          source={{ uri: "https://www.npmjs.com/package/react-native-webview" }}
          style={{ flex: 1 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});
