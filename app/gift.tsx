import { Accelerometer } from "expo-sensors";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";

export default function GiftScreen() {
  const [shaking, setShaking] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const shakeStart = useRef<number | null>(null);
  const shakeTimeout = useRef<NodeJS.Timeout | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      if (magnitude > 1.7) {
        if (!shaking) {
          setShaking(true);
          shakeStart.current = Date.now();
          startChestAnimation();
        } else if (
          shakeStart.current &&
          Date.now() - shakeStart.current > 3000
        ) {
          setShaking(false);
          showToastMessage();
          shakeStart.current = null;
          stopChestAnimation();
        }
      } else {
        setShaking(false);
        shakeStart.current = null;
        stopChestAnimation();
      }
    });
    setSubscription(sub);
    return () => {
      sub && sub.remove();
      setSubscription(null);
    };
  }, [shaking]);

  const showToastMessage = () => {
    if (Platform.OS === "android") {
      ToastAndroid.show("Bạn đã nhận được 300 xu!", ToastAndroid.LONG);
    } else {
      Alert.alert("Thông báo", "Bạn đã nhận được 300 xu!");
    }
    setShowToast(true);
    if (shakeTimeout.current) clearTimeout(shakeTimeout.current);
    shakeTimeout.current = setTimeout(() => setShowToast(false), 2000);
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
      {/* Header */}

      {/* Chest */}
      <View style={styles.chestContainer}>
        <Animated.Image
          source={require("../assets/images/img-ruong.png")}
          style={[styles.chest, { transform: [{ rotate }] }]}
        />
      </View>
      {/* Instruction */}
      <Text style={styles.instruction}>
        Lắc điện thoại của bạn để nhận phần thưởng và ưu đãi cho vay
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 48,
    paddingHorizontal: 12,
    backgroundColor: "transparent",
  },
  backBtn: { padding: 8, marginRight: 4 },
  backIcon: { width: 28, height: 28, tintColor: "#fff" },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 8,
  },
  chestContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  chest: { width: 260, height: 200, resizeMode: "contain" },
  instruction: {
    fontSize: 22,
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 12,
  },
});
