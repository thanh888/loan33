import { SKU } from "@/constants/key-constants";
import api from "@/services/axios.custom";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

const SignUpScreen = () => {
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referral, setReferral] = useState("");
  const router = useRouter();

  const sku = SKU;

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      const response = await api.post("/sign-up-primary", {
        username,
        email,
        fullname,
        password,
        refcode: referral,
        sku,
      });

      if (!response.data.error) {
        ToastAndroid.show("Đăng ký thành công!", ToastAndroid.SHORT);
        router.replace("/sign-in"); // Chuyển về màn hình Sign In sau khi đăng ký thành công
      } else {
        ToastAndroid.show("Đăng ký thất bại", ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show("Đăng ký thất bại", ToastAndroid.SHORT);
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký</Text>
      <Text style={styles.subtitle}>Đăng ký để kiếm tiền!</Text>
      <TextInput
        style={styles.input}
        placeholder="Tên tài khoản"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Họ và tên"
        value={fullname}
        onChangeText={setFullname}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Nhập lại mật khẩu"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Mã giới thiệu (nếu có)"
        value={referral}
        onChangeText={setReferral}
      />
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Đăng ký</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/sign-in")}>
        <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#D3D3D3",
    padding: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#FFF",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#666",
    marginBottom: 20,
    color: "#FFF",
  },
  button: {
    backgroundColor: "#FFC107",
    padding: 10,
    borderRadius: 20,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  link: {
    color: "#FFF",
    fontSize: 14,
  },
});

export default SignUpScreen;
