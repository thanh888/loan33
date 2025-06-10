import { router } from "expo-router";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const user = {
  name: "admin1",
  coin: 300,
};

const features = [
  {
    key: "gift",
    label: "Nhận quà",
    icon: require("../assets/images/ic_gift.png"),
    screen: "gift",
  },
  {
    key: "earn",
    label: "Kiếm tiền",
    icon: require("../assets/images/ic_earning.png"),
    screen: "earn-money",
  },
  {
    key: "profile",
    label: "Thông tin cá nhân",
    icon: require("../assets/images/profile.png"),
    screen: "account",
  },
  {
    key: "loan",
    label: "Nhận khoản vay",
    icon: require("../assets/images/ic_loan.png"),
    screen: "loan",
  },
  {
    key: "withdraw",
    label: "Rút tiền",
    icon: require("../assets/images/ic_wallet.png"),
    screen: "withdraw",
  },
  {
    key: "logout",
    label: "Đăng xuất",
    icon: require("../assets/images/ic_earning.png"),
    screen: "gift",
  },
];
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require("../assets/images/ic_earning.png")}
          style={styles.avatar}
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.name}>{user.name}</Text>
        </View>
        <Text style={styles.coin}>{user.coin}</Text>
        <Image
          source={require("../assets/images/ic_coin.png")}
          style={styles.coinIcon}
        />
      </View>

      {/* Grid */}
      <View style={styles.gridContainer}>
        <FlatList
          data={features}
          numColumns={2}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => router.push(`/${item.screen}`)}
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
