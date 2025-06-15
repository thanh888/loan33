import { link_earn, SKU } from "@/constants/key-constants";
import api from "@/services/axios.custom";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Clipboard,
  Dimensions,
  Image,
  Linking,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

const shareMsg = "Tải app và nhận ưu đãi!";
const STORAGE_KEY = "CHECKIN_DAYS";
const STORAGE_WEEK = "CHECKIN_WEEK";
const STORAGE_LAST_DATE = "CHECKIN_LAST_DATE";
const coinsEachDay = [300, 300, 300, 300, 300, 300, 600];

export default function EarnMoneyScreen() {
  const [checked, setChecked] = useState<boolean[]>(Array(7).fill(false));
  const [lastCheckinDate, setLastCheckinDate] = useState<string | null>(null);
  const [userData, setUserData] = useState(null);

  // Load user data and checkin status
  useEffect(() => {
    const initialize = async () => {
      try {
        // Load user data
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          setUserData(JSON.parse(storedUserData));
        }

        // Load checkin data
        const currentWeek = getWeekNumber(new Date());
        const savedWeek = await AsyncStorage.getItem(STORAGE_WEEK);
        const savedDays = await AsyncStorage.getItem(STORAGE_KEY);
        const savedDate = await AsyncStorage.getItem(STORAGE_LAST_DATE);

        if (savedDate) setLastCheckinDate(savedDate);

        if (parseInt(savedWeek || "-1") === currentWeek && savedDays) {
          setChecked(JSON.parse(savedDays));
        } else {
          // Reset for new week
          await AsyncStorage.setItem(STORAGE_WEEK, currentWeek.toString());
          const resetWeek = Array(7).fill(false);
          setChecked(resetWeek);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(resetWeek));
          await AsyncStorage.removeItem(STORAGE_LAST_DATE);
          setLastCheckinDate(null);
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

  const handleCheckin = async () => {
    if (!userData) {
      ToastAndroid.show("Vui lòng đăng nhập để điểm danh.", ToastAndroid.SHORT);
      return;
    }

    const todayStr = new Date().toDateString();
    if (lastCheckinDate === todayStr) {
      ToastAndroid.show("Bạn đã điểm danh hôm nay!", ToastAndroid.SHORT);
      return;
    }

    const firstUncheck = checked.findIndex((v) => !v);
    if (firstUncheck === -1) {
      ToastAndroid.show(
        "Bạn đã hoàn thành điểm danh tuần này!",
        ToastAndroid.SHORT
      );
      return;
    }

    try {
      // Update coins via API
      const coinToAdd = coinsEachDay[firstUncheck];
      ToastAndroid.show(
        `Đang điểm danh ngày ${coinToAdd}...`,
        ToastAndroid.SHORT
      );
      const response = await api.put("/user-primary", {
        id: userData.id,
        coin: coinToAdd,
        sku: SKU,
      });

      if (!response.data.error) {
        Object.assign(userData, { coin: userData.coin + coinToAdd });
        console.log("Updated user data:", userData);

        await AsyncStorage.setItem("userData", JSON.stringify(userData));

        // Update checkin status
        const newChecked = [...checked];
        newChecked[firstUncheck] = true;
        setChecked(newChecked);
        setLastCheckinDate(todayStr);

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newChecked));
        await AsyncStorage.setItem(STORAGE_LAST_DATE, todayStr);

        ToastAndroid.show(
          `Điểm danh thành công! Nhận ${coinToAdd} coins.`,
          ToastAndroid.SHORT
        );
      } else {
        ToastAndroid.show("Lỗi khi cập nhật coins.", ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show("Lỗi kết nối. Vui lòng thử lại.", ToastAndroid.SHORT);
      console.error(error);
    }
  };

  const handleCopy = () => {
    if (Platform.OS === "web") {
      navigator.clipboard.writeText(userData.refcode ?? "");
      alert("Đã sao chép mã!");
    } else {
      Clipboard.setString(userData?.refcode ?? "");
      Platform.OS === "android"
        ? ToastAndroid.show("Đã sao chép mã!", ToastAndroid.SHORT)
        : Alert.alert("Đã sao chép mã!");
    }
  };

  const handleShare = async () => {
    Platform.OS === "android"
      ? await Share.share({
          url: `https://play.google.com/store/apps/details?id=${SKU}`,
          title: "Chia sẻ ứng dụng Loan33",
          message: shareMsg,
        })
      : Alert.alert("Chức năng chia sẻ chưa hỗ trợ!");
  };

  const [newUrl, setNewUrl] = useState("");
  const [visible, setVisible] = useState(false);
  const [webViewHeights, setWebViewHeights] = useState<number>(0);

  const setViewWebView = useCallback((newUrl: string) => {
    setNewUrl(newUrl);
    setVisible(true);
    return false;
  }, []);

  const isDisabled =
    !userData ||
    lastCheckinDate === new Date().toDateString() ||
    checked.findIndex((v) => !v) === -1;

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
        <Text style={styles.title}>Chia sẻ nhận quà</Text>
        <Text style={styles.desc}>
          Với mỗi người bạn mời đăng ký tài khoản thành công thì bạn được 3000
          coins, bạn của bạn vay thành công thì bạn nhận được 200.000 coins
          {"\n"}
          Cả bạn và bạn của bạn đều phải nhập mã để nhận quà
        </Text>

        <View style={styles.row}>
          <Text style={styles.label}>
            Mã giới thiệu:{" "}
            <Text style={styles.code}>{userData?.refcode ?? ""}</Text>
          </Text>
          <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
            <Text style={styles.copyText}>SAO CHÉP</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Chia sẻ ứng dụng</Text>
          <TouchableOpacity style={styles.copyBtn} onPress={handleShare}>
            <Text style={styles.copyText}>CHIA SẺ</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.checkinRow}>
          {coinsEachDay.map((coin, idx) => (
            <View
              key={idx}
              style={[
                styles.dayBox,
                checked[idx]
                  ? styles.dayChecked
                  : idx === checked.findIndex((v) => !v)
                  ? styles.dayToday
                  : null,
              ]}
            >
              <Text style={styles.dayLabel}>Ngày {idx + 1}</Text>
              <Image
                source={require("../assets/images/ic_coin.png")}
                style={styles.coinIcon}
              />
              <Text style={styles.dayCoin}>{coin}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.checkinBtn, isDisabled && styles.btnDisabled]}
          onPress={handleCheckin}
          disabled={isDisabled}
        >
          <Text style={styles.checkinText}>Điểm danh</Text>
        </TouchableOpacity>
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
            uri: link_earn,
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

function getWeekNumber(d: Date) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return weekNo;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222",
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 12,
  },
  desc: {
    color: "#fff",
    fontSize: 14,
    marginVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  label: {
    color: "#fff",
    fontSize: 16,
  },
  code: {
    fontWeight: "bold",
    color: "#ffe600",
    fontSize: 18,
  },
  copyBtn: {
    backgroundColor: "#ffe600",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginLeft: 12,
  },
  copyText: {
    color: "#222",
    fontWeight: "bold",
    fontSize: 14,
  },
  checkinRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 12,
    flexWrap: "wrap",
  },
  dayBox: {
    alignItems: "center",
    backgroundColor: "#bdb76b",
    borderRadius: 10,
    padding: 4,
    width: 48,
    marginBottom: 8,
  },
  dayChecked: {
    backgroundColor: "#ffe600",
    opacity: 0.7,
  },
  dayToday: {
    borderWidth: 1,
    borderColor: "#ffe600",
  },
  dayLabel: {
    color: "#fff",
    fontSize: 12,
    marginBottom: 2,
  },
  coinIcon: {
    width: 24,
    height: 24,
  },
  dayCoin: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  checkinBtn: {
    backgroundColor: "#ffe600",
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  checkinText: {
    color: "#222",
    fontWeight: "bold",
    fontSize: 20,
  },
  webview: {
    marginTop: 16,
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
    width: "100%",
    alignSelf: "center",
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: "#f1efff",
  },
});
