import { link_gift, SKU } from "@/constants/key-constants";
import api from "@/services/axios.custom";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Accelerometer } from "expo-sensors";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const COIN_REWARD = 300;
// Giảm ngưỡng cảm biến xuống để dễ nhận biết hơn
const SHAKE_THRESHOLD = 1.3; // Giảm xuống từ 1.7
const MIN_SHAKE_DURATION = 1000; // Giảm xuống chỉ còn 1s

export default function GiftScreen() {
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);

    let shakeStartTime: number | null = null;
    let shaking = false;

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const now = Date.now();
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      // Giảm ngưỡng phát hiện lắc để dễ kích hoạt hơn
      if (magnitude > SHAKE_THRESHOLD) {
        if (!shaking) {
          shaking = true;
          shakeStartTime = now;
          startChestAnimation();
          // Thêm phản hồi bằng toast để người dùng biết đã bắt đầu lắc
        } else if (
          shakeStartTime &&
          now - shakeStartTime >= MIN_SHAKE_DURATION
        ) {
          shaking = false;
          shakeStartTime = null;
          stopChestAnimation();
          handleShakeReward(); // 🎁 gọi nhận thưởng
        }
      } else {
        // Cho phép lắc không liên tục, tăng thời gian reset lên 800ms
        if (shaking && shakeStartTime && now - shakeStartTime > 800) {
          shaking = false;
          shakeStartTime = null;
          stopChestAnimation();
        }
      }
    });

    return () => subscription && subscription.remove();
  }, []);

  const handleShakeReward = async () => {
    const stored = await AsyncStorage.getItem("userData");
    const parsedUser = stored ? JSON.parse(stored) : null;

    try {
      const res = await api.put("/user-primary", {
        id: parsedUser.id,
        coin: 300,
        sku: SKU,
      });
      console.log("res", res.data);

      if (!res.data.error) {
        Object.assign(parsedUser, { coin: parsedUser.coin + 300 });
        await AsyncStorage.setItem("userData", JSON.stringify(parsedUser));

        // Hiển thị dialog thay vì mở link ngay
        setShowRewardDialog(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClaimReward = () => {
    setShowRewardDialog(false);
    Linking.openURL(link_gift); // Chỉ mở link khi bấm nút Nhận Ngay
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

      {/* Dialog Thông báo nhận thưởng */}
      <Modal
        visible={showRewardDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎉 Xin chúc mừng! 🎉</Text>
            <Text style={styles.modalMessage}>
              Bạn đã nhận được {COIN_REWARD} xu và ưu đãi vay!
            </Text>
            <TouchableOpacity
              style={styles.claimButton}
              onPress={handleClaimReward}
            >
              <Text style={styles.claimButtonText}>NHẬN NGAY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  // Styles cho Modal Dialog
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#000",
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#444",
    lineHeight: 22,
  },
  claimButton: {
    backgroundColor: "#FFC107",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 5,
  },
  claimButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
});
