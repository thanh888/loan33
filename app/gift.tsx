import { link_gift, SKU } from "@/constants/key-constants";
import api from "@/services/axios.custom";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Accelerometer } from "expo-sensors";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Linking,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";

const COIN_REWARD = 300;

export default function GiftScreen() {
  const [shaking, setShaking] = useState(false);
  const [userData, setUserData] = useState(null);
  const shakeStart = useRef<number | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Load user data and setup accelerometer
  useEffect(() => {
    const initialize = async () => {
      try {
        const storedData = await AsyncStorage.getItem("userData");
        if (storedData) {
          setUserData(JSON.parse(storedData));
        }
      } catch (error) {
        ToastAndroid.show("Lỗi khi tải dữ liệu.", ToastAndroid.SHORT);
        console.error(error);
      }
    };
    initialize();

    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      // Lắc đủ mạnh
      if (magnitude > 1.7) {
        if (!shaking) {
          setShaking(true);
          shakeStart.current = Date.now();
          startChestAnimation();
        } else if (
          shakeStart.current &&
          Date.now() - shakeStart.current > 5000
        ) {
          handleReward();
          shakeStart.current = null; // reset để không gọi lại nhiều lần
        }
      }

      // ❌ Không reset shakeStart khi lắc yếu, giữ lại để tính tổng thời gian
    });

    setSubscription(sub);

    return () => {
      sub && sub.remove();
      setSubscription(null);
    };
  }, [shaking]);

  const handleReward = async () => {
    if (!userData) {
      ToastAndroid.show(
        "Vui lòng đăng nhập để nhận thưởng.",
        ToastAndroid.SHORT
      );
      setShaking(false);
      shakeStart.current = null;
      stopChestAnimation();
      router.push("/sign-in");
      return;
    }

    try {
      const response = await api.put("/user-primary", {
        id: userData.id,
        coin: COIN_REWARD,
        sku: SKU,
      });

      if (!response.data.error) {
        const updatedUserData = {
          ...userData,
          coin: userData.coin + COIN_REWARD,
        };
        setUserData(updatedUserData);
        await AsyncStorage.setItem("userData", JSON.stringify(updatedUserData));

        ToastAndroid.show(
          `Bạn đã nhận được ${COIN_REWARD} xu!`,
          ToastAndroid.LONG
        );
      } else {
        ToastAndroid.show("Lỗi khi nhận thưởng.", ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show("Lỗi kết nối. Vui lòng thử lại.", ToastAndroid.SHORT);
      console.error(error);
    } finally {
      setShaking(false);
      shakeStart.current = null;
      stopChestAnimation();
      Linking.openURL(link_gift);
    }
  };

  const startChestAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopChestAnimation = () => {
    rotateAnim.stopAnimation();
    rotateAnim.setValue(0);
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-10deg", "0deg", "10deg"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.chestContainer}>
        <Animated.Image
          source={require("../assets/images/ic_treasure.png")}
          style={[styles.chest, { transform: [{ rotate }] }]}
        />
      </View>
      <Text style={styles.instruction}>
        Lắc điện thoại của bạn để nhận quà và ưu đãi
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  chestContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  chest: { width: 260, height: 200, resizeMode: "contain" },
  instruction: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
    paddingHorizontal: 12,
  },
});
