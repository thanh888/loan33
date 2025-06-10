import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const COIN_TO_VND = 1; // 1 xu = 1 VND
const BALANCE = 1000; // Số dư mẫu, bạn có thể thay bằng state hoặc props

export default function WithdrawScreen() {
  const [amount, setAmount] = useState("");

  const handleWithdraw = () => {
    const num = parseInt(amount);
    if (!num || num <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập số tiền hợp lệ");
      return;
    }
    if (num > BALANCE) {
      Alert.alert("Lỗi", "Số dư không đủ");
      return;
    }
    Alert.alert("Thành công", `Bạn đã rút ${num} VNĐ thành công!`);
    setAmount("");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.walletTitle}>Ví của tôi</Text>
      <Text style={styles.balanceDesc}>Số dư (1000 xu = 1000 VNĐ)</Text>
      <Text style={styles.balance}>{BALANCE} VNĐ</Text>
      <Text style={styles.inputLabel}>Nhập số tiền</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập số tiền"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <TouchableOpacity style={styles.btn} onPress={handleWithdraw}>
        <Text style={styles.btnText}>RÚT TIỀN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "black" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
  },
  backBtn: { padding: 8, marginRight: 4 },
  backIcon: { width: 28, height: 28, tintColor: "#222" },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    marginLeft: 8,
  },
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
  btnText: {
    color: "#222",
    fontWeight: "bold",
    fontSize: 20,
    letterSpacing: 2,
  },
});
