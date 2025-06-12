import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

const features = [
  {
    key: "gift",
    label: "Nhận quà",
    icon: require("../assets/images/ic_gift.png"),
    screen: "gift",
    requiresAuth: false, // Không yêu cầu đăng nhập
  },
  {
    key: "earn",
    label: "Kiếm tiền",
    icon: require("../assets/images/ic_earning.png"),
    screen: "earn-money",
    requiresAuth: true, // Yêu cầu đăng nhập
  },
  {
    key: "profile",
    label: "Thông tin cá nhân",
    icon: require("../assets/images/profile.png"),
    screen: "account",
    requiresAuth: true, // Yêu cầu đăng nhập
  },
  {
    key: "loan",
    label: "Nhận khoản vay",
    icon: require("../assets/images/ic_loan.png"),
    screen: "loan",
    requiresAuth: false, // Không yêu cầu đăng nhập
  },
  {
    key: "withdraw",
    label: "Rút tiền",
    icon: require("../assets/images/ic_wallet.png"),
    screen: "withdraw",
    requiresAuth: true, // Yêu cầu đăng nhập
  },
  {
    key: "logout",
    label: "Đăng xuất",
    icon: require("../assets/images/ic_logout.png"),
    screen: "sign-in",
    requiresAuth: true, // Chỉ hiển thị khi đã đăng nhập
  },
  {
    key: "login",
    label: "Đăng nhập",
    icon: require("../assets/images/ic_logout.png"), // Giả định có icon đăng nhập
    screen: "sign-in",
    requiresAuth: false, // Chỉ hiển thị khi chưa đăng nhập
  },
];

export default function HomeScreen() {
  const [userData, setUserData] = useState(null);

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const checkUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem("userData");
        if (storedData) {
          setUserData(JSON.parse(storedData));
        }
      } catch (error) {
        console.error(error);
      }
    };
    checkUserData();
  }, []);

  // Xử lý điều hướng và đăng xuất
  const handleNavigation = async (item) => {
    if (item.key === "logout") {
      try {
        await AsyncStorage.removeItem("userData");
        setUserData(null);
        ToastAndroid.show("Đăng xuất thành công.", ToastAndroid.SHORT);
        router.push("/sign-in");
      } catch (error) {
        ToastAndroid.show("Lỗi khi đăng xuất.", ToastAndroid.SHORT);
        console.error(error);
      }
      return;
    }

    if (item.requiresAuth && !userData) {
      ToastAndroid.show("Vui lòng đăng nhập.", ToastAndroid.SHORT);
      router.push("/sign-in");
      return;
    }

    router.push(`/${item.screen}`);
  };

  // Lọc danh sách tính năng dựa trên trạng thái đăng nhập
  const filteredFeatures = features.filter((item) =>
    item.key === "logout" ? userData : item.key === "login" ? !userData : true
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require("../assets/images/ic_earning.png")}
          style={styles.avatar}
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.name}>
            {userData
              ? userData.fullname || "Chưa đăng nhập"
              : "Chưa đăng nhập"}
          </Text>
        </View>
        <Text style={styles.coin}>
          {userData ? (userData.coin === 0 ? "0" : userData.coin ?? 0) : 0}
        </Text>
        <Image
          source={require("../assets/images/ic_coin.png")}
          style={styles.coinIcon}
        />
      </View>

      {/* Grid */}
      <View style={styles.gridContainer}>
        <FlatList
          data={filteredFeatures}
          numColumns={2}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => handleNavigation(item)}
            >
              <Image source={item.icon} style={styles.gridIcon} />
              <Text style={styles.gridLabel}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: {
    marginTop: 40,
    marginHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#e1e8ed",
  },
  name: { fontSize: 22, fontWeight: "bold", color: "#222" },
  coin: {
    fontSize: 22,
    fontWeight: "bold",
    marginHorizontal: 8,
    color: "#fbc02d",
  },
  coinIcon: { width: 32, height: 32 },
  gridContainer: {
    flex: 1,
    backgroundColor: "#f9e79f",
    padding: 16,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: 24,
  },
  gridItem: {
    flex: 1,
    margin: 12,
    backgroundColor: "#fff",
    borderRadius: 20,
    alignItems: "center",
    padding: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  gridIcon: { width: 56, height: 56, marginBottom: 10 },
  gridLabel: { color: "#222", fontSize: 17, fontWeight: "600", marginTop: 4 },
});
