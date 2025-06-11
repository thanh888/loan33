import { link_account } from "@/constants/key-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  BackHandler,
  Dimensions,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
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
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Load user data
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          setUserData(JSON.parse(storedUserData));
        }
      } catch (error) {
        ToastAndroid.show("Lỗi khi tải dữ liệu.", ToastAndroid.SHORT);
        console.error(error);
      }
    };
    initialize();

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => {
      backHandler.remove();
    };
  }, []);

  const handleBackPress = useCallback(() => {
    setVisible(false);
    return true;
  }, []);

  const [newUrl, setNewUrl] = useState("");
  const [visible, setVisible] = useState(false);
  const [webViewHeights, setWebViewHeights] = useState<number>(0);

  const setViewWebView = useCallback((newUrl: string) => {
    setNewUrl(newUrl);
    setVisible(true);
    return false;
  }, []);

  if (visible) {
    return (
      <View style={{ flex: 1 }}>
        <WebView
          source={{ uri: newUrl }}
          style={{ flex: 1, width: "100%" }}
          onShouldStartLoadWithRequest={(navState) => {
            Linking.openURL(navState.url);
            return false;
          }}
        />
      </View>
    );
  }

  const handleWebViewHeight = (height: number, name: string) => {
    console.log(height);

    setWebViewHeights(height);
  };

  const handleMessage = (event: any, value: any) => {
    const height = parseInt(event.nativeEvent.data, 10);
    handleWebViewHeight(height, value.name);
  };

  const injectedJavaScript = `
    (function() {
      var body = document.body,
          html = document.documentElement;
      var height = Math.max( body.scrollHeight, body.offsetHeight, 
                             html.clientHeight, html.scrollHeight, html.offsetHeight );
      window.ReactNativeWebView.postMessage(height.toString());
    })();
    true; // note: this is required for the injectedJavaScript to work
  `;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      alwaysBounceVertical={true}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerBox}>
          <Image source={user.avatar} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{userData?.fullname ?? ""}</Text>
            <TouchableOpacity
              onPress={async () => {
                /* Xử lý đăng xuất */
                await AsyncStorage.removeItem("userData");
                setUserData(null);
                ToastAndroid.show(
                  "Signed out successfully.",
                  ToastAndroid.SHORT
                );
                router.push("/home");
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
      </View>
      <View
        style={[
          styles.webviewContainer,
          {
            height:
              webViewHeights > 0
                ? webViewHeights
                : Dimensions.get("window").height * 10,
          },
        ]}
      >
        <WebView
          style={{ flex: 1, backgroundColor: "#f1efff" }}
          domStorageEnabled={true}
          javaScriptEnabled={true}
          nestedScrollEnabled={false}
          setSupportMultipleWindows={false}
          scrollEnabled={false}
          source={{
            uri: link_account,
          }}
          onMessage={(event) => handleMessage(event, value)}
          onShouldStartLoadWithRequest={(navState) => {
            setViewWebView(navState.url);
            return false;
          }}
        />
      </View>
    </ScrollView>
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
  webviewContainer: {
    flex: 1,
    backgroundColor: "#f1efff",
  },
});
