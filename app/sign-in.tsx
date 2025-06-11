import { SKU } from "@/constants/key-constants";
import api from "@/services/axios.custom";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import Toast from "toastify-react-native"; // Import toastify-react-native

const SignInScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignIn = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter username and password.");
      return;
    }

    try {
      const response = await api.post("/sign-in-primary", {
        username,
        password,
        sku: SKU,
      });

      if (!response.data.error) {
        const { password, ...userDataWithoutPassword } = response.data.data;
        await AsyncStorage.setItem(
          "userData",
          JSON.stringify(userDataWithoutPassword)
        );
        ToastAndroid.show("Đăng nhập thành công!", ToastAndroid.SHORT);
        router.push("/home");
      } else {
        ToastAndroid.show("Đăng nhập thất bại", ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show("Đăng nhập thất bại", ToastAndroid.SHORT);
      console.error(error);
    }
  };

  return (
    <View style={viewStyles.container}>
      <Toast />
      <Text style={textStyles.title}>Đăng nhập</Text>
      <Text style={textStyles.subtitle}>Đăng nhập để kiếm tiền!</Text>
      <TextInput
        style={viewStyles.input}
        placeholder="Tên đăng nhập"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={viewStyles.input}
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={viewStyles.button} onPress={handleSignIn}>
        <Text style={textStyles.buttonText}>Đăng nhập</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/sign-up")}>
        <Text style={textStyles.link}>Chưa có tài khoản? Đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
};

const viewStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#D3D3D3",
    padding: 20,
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
});

const textStyles = StyleSheet.create({
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

export default SignInScreen;
