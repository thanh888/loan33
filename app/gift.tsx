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
  Vibration,
  View,
} from "react-native";

const COIN_REWARD = 300;
const SHAKE_THRESHOLD = 1.7;
const MIN_SHAKE_DURATION = 3000; // lắc ít nhất 3s
const MIN_TIME_BETWEEN_REWARDS = 10000; // cách nhau 10s

export default function GiftScreen() {
  const [shaking, setShaking] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [loadingReward, setLoadingReward] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const shakeStartTime = useRef<number | null>(null);
  const lastRewardTime = useRef<number>(0);

  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem("userData");
      if (stored) setUserData(JSON.parse(stored));
    };
    loadUser();

    Accelerometer.setUpdateInterval(100);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();

      if (magnitude > SHAKE_THRESHOLD) {
        if (!shaking) {
          setShaking(true);
          shakeStartTime.current = now;
          startChestAnimation();
        } else if (
          shakeStartTime.current &&
          now - shakeStartTime.current >= MIN_SHAKE_DURATION
        ) {
          setShaking(false);
          shakeStartTime.current = null;
          stopChestAnimation();
          handleShakeReward();
        }
      } else {
        setShaking(false);
        shakeStartTime.current = null;
        stopChestAnimation();
      }
    });

    return () => subscription && subscription.remove();
  }, []);

  const handleShakeReward = async () => {
    if (!userData) {
      ToastAndroid.show(
        "Vui lòng đăng nhập để nhận thưởng.",
        ToastAndroid.SHORT
      );
      router.push("/sign-in");
      return;
    }
    setLoadingReward(true);
    Vibration.vibrate(300);
    try {
      const res = await api.put("/user-primary", {
        id: userData.id,
        coin: COIN_REWARD,
        sku: SKU,
      });
      if (!res.data.error) {
        const updated = { ...userData, coin: userData.coin + COIN_REWARD };
        setUserData(updated);
        await AsyncStorage.setItem("userData", JSON.stringify(updated));
        ToastAndroid.show(
          `Bạn nhận được ${COIN_REWARD} xu 🎉`,
          ToastAndroid.SHORT
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReward(false);
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
        Lắc điện thoại để mở rương nhận quà 🎁
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
