import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Clipboard,
  Image,
  Platform,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

const inviteCode = "cvkw6";
const shareMsg = "Tải app và nhập mã giới thiệu cvkw6 để nhận thưởng!";
const STORAGE_KEY = "CHECKIN_DAYS";
const STORAGE_WEEK = "CHECKIN_WEEK";
const STORAGE_LAST_DATE = "CHECKIN_LAST_DATE";
const coinsEachDay = [300, 300, 300, 300, 300, 300, 600];

export default function EarnMoneyScreen() {
  const [checked, setChecked] = useState<boolean[]>(Array(7).fill(false));
  const [lastCheckinDate, setLastCheckinDate] = useState<string | null>(null);

  const todayIdx = (new Date().getDay() + 6) % 7; // Monday = 0

  useEffect(() => {
    (async () => {
      const currentWeek = getWeekNumber(new Date());
      const savedWeek = await AsyncStorage.getItem(STORAGE_WEEK);
      const savedDays = await AsyncStorage.getItem(STORAGE_KEY);
      const savedDate = await AsyncStorage.getItem(STORAGE_LAST_DATE);

      if (savedDate) setLastCheckinDate(savedDate);

      if (parseInt(savedWeek || "-1") === currentWeek && savedDays) {
        setChecked(JSON.parse(savedDays));
      } else {
        await AsyncStorage.setItem(STORAGE_WEEK, currentWeek.toString());
        const resetWeek = Array(7).fill(false);
        setChecked(resetWeek);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(resetWeek));
        await AsyncStorage.removeItem(STORAGE_LAST_DATE);
        setLastCheckinDate(null);
      }
    })();
  }, []);

  const handleCheckin = async () => {
    const todayStr = new Date().toDateString();
    if (lastCheckinDate === todayStr) return;

    const firstUncheck = checked.findIndex((v) => !v);
    if (firstUncheck === -1) return;

    const newChecked = [...checked];
    newChecked[firstUncheck] = true;
    setChecked(newChecked);
    setLastCheckinDate(todayStr);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newChecked));
    await AsyncStorage.setItem(STORAGE_LAST_DATE, todayStr);

    ToastAndroid.show("Điểm danh thành công!", ToastAndroid.SHORT);
  };

  const handleCopy = () => {
    if (Platform.OS === "web") {
      navigator.clipboard.writeText(inviteCode);
      alert("Đã sao chép mã!");
    } else {
      Clipboard.setString(inviteCode);
      Platform.OS === "android"
        ? ToastAndroid.show("Đã sao chép mã!", ToastAndroid.SHORT)
        : Alert.alert("Đã sao chép mã!");
    }
  };

  const handleShare = () => {
    Platform.OS === "android"
      ? ToastAndroid.show("Chức năng chia sẻ chưa hỗ trợ!", ToastAndroid.SHORT)
      : Alert.alert("Chức năng chia sẻ chưa hỗ trợ!");
  };

  const isDisabled =
    lastCheckinDate === new Date().toDateString() ||
    checked.findIndex((v) => !v) === -1;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chia sẻ nhận quà</Text>
      <Text style={styles.desc}>
        Với mỗi người bạn mời đăng ký tài khoản thành công thì bạn được 3000
        coins, bạn của bạn vay thành công thì bạn nhận được 200.000 coins{"\n"}
        Cả bạn và bạn của bạn đều phải nhập mã để nhận quà
      </Text>

      <View style={styles.row}>
        <Text style={styles.label}>
          Mã giới thiệu: <Text style={styles.code}>{inviteCode}</Text>
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
                : idx === todayIdx
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

      <WebView
        source={{ uri: "https://reactnative.dev/docs/imagebackground" }}
        style={styles.webview}
      />
    </View>
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
  },
  dayBox: {
    alignItems: "center",
    backgroundColor: "#bdb76b",
    borderRadius: 10,
    padding: 8,
    width: 48,
  },
  dayChecked: {
    backgroundColor: "#ffe600",
    opacity: 0.7,
  },
  dayToday: {
    borderWidth: 2,
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
    fontSize: 16,
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
});
