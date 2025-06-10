import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import WebView from "react-native-webview";

const user = {
  name: "admin1",
  avatar: require("../assets/images/ic_user.png"),
};

const menu = [
  {
    label: "Chia sẻ và nhận phần thưởng",
    onPress: () => router.push("/earn-money"),
  },
  {
    label: "Đăng ký vay",
    onPress: () => router.push("/loan"), // Thêm điều hướng khi có màn hình
  },
  {
    label: "Nhận phần thưởng",
    onPress: () => router.push("/gift"),
  },
  {
    label: "Kiếm tiền",
    onPress: () => router.push("/earn-money"), // Thêm điều hướng khi có màn hình
  },
];

export default function AccountScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBox}>
        <Image source={user.avatar} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{user.name}</Text>
          <TouchableOpacity
            onPress={() => {
              /* Xử lý đăng xuất */
            }}
          >
            <Text style={styles.logout}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Menu */}
      <View style={styles.menuBox}>
        {menu.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={item.onPress}
            style={styles.menuItem}
          >
            <Text style={styles.menuText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <WebView
        source={{ uri: "https://reactnative.dev/docs/imagebackground" }}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa", padding: 0 },
  headerBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    margin: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginRight: 16,
    backgroundColor: "#e1e8ed",
  },
  name: { fontSize: 26, fontWeight: "bold", color: "#222" },
  logout: { color: "#e53935", fontWeight: "bold", marginTop: 8, fontSize: 18 },
  menuBox: {
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  menuItem: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuText: { fontSize: 20, fontWeight: "600", color: "#222" },
  webview: {
    marginTop: 20,
    height: 300,
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 16,
  },
});
