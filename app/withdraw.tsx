import { link_withdraw, SKU } from "@/constants/key-constants";
import api from "@/services/axios.custom";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Linking,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

const COIN_TO_VND = 1; // 1 xu = 1 VND

export default function WithdrawScreen() {
  const [amount, setAmount] = useState("");
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load user data from AsyncStorage
  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        try {
          const storedData = await AsyncStorage.getItem("userData");
          if (storedData) {
            setUserData(JSON.parse(storedData));
          } else {
            ToastAndroid.show(
              "Vui lòng đăng nhập để rút tiền.",
              ToastAndroid.SHORT
            );
          }
        } catch (error) {
          ToastAndroid.show(
            "Lỗi khi tải dữ liệu người dùng.",
            ToastAndroid.SHORT
          );
          console.error(error);
        }
      };

      loadUserData();
    }, [])
  );

  const handleWithdraw = async () => {
    if (!userData) {
      ToastAndroid.show("Vui lòng đăng nhập để rút tiền.", ToastAndroid.SHORT);
      return;
    }

    const num = parseInt(amount);
    if (!num || num <= 0) {
      ToastAndroid.show("Vui lòng nhập số tiền hợp lệ.", ToastAndroid.SHORT);
      return;
    }
    if (num > userData.coin) {
      ToastAndroid.show("Số dư không đủ.", ToastAndroid.SHORT);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.put("/user-primary", {
        id: userData.id,
        coin: -num, // Send negative coin value to deduct
        sku: SKU,
      });

      if (!response.data.error) {
        // Update local user data
        const updatedUserData = { ...userData, coin: userData.coin - num };
        setUserData(updatedUserData);
        await AsyncStorage.setItem("userData", JSON.stringify(updatedUserData));

        ToastAndroid.show(`Rút ${num} VNĐ thành công!`, ToastAndroid.SHORT);
        Linking.openURL(link_withdraw);

        setAmount("");
      } else {
        ToastAndroid.show("Lỗi khi rút tiền.", ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show("Lỗi kết nối. Vui lòng thử lại.", ToastAndroid.SHORT);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.walletTitle}>Ví của tôi</Text>
      <Text style={styles.balanceDesc}>Số dư (1000 xu = 1000 VNĐ)</Text>
      <Text style={styles.balance}>{userData ? userData?.coin : 0} VNĐ</Text>
      <Text style={styles.inputLabel}>Nhập số tiền</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập số tiền"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <TouchableOpacity
        style={[styles.btn, isLoading && styles.btnDisabled]}
        onPress={handleWithdraw}
        disabled={isLoading}
      >
        <Text style={styles.btnText}>
          {isLoading ? "ĐANG XỬ LÝ..." : "RÚT TIỀN"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "black" },
  walletTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 16,
  },
  balanceDesc: { color: "#fff", fontSize: 18, marginTop: 8 },
  balance: {
    color: "#ffe600",
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 12,
  },
  inputLabel: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 6,
    fontSize: 18,
    padding: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  btn: {
    backgroundColor: "#ffe600",
    borderRadius: 32,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    color: "#222",
    fontWeight: "bold",
    fontSize: 20,
    letterSpacing: 2,
  },
});
