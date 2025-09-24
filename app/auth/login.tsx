import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { loginWithKakao, loginAsGuest, state } = useAuth();

  const handleKakaoLogin = async () => {
    try {
      await loginWithKakao();
      Alert.alert("로그인 성공", "카카오 계정으로 로그인되었습니다.", [
        {
          text: "확인",
          onPress: () => router.replace("/(tabs)"),
        },
      ]);
    } catch (error) {
      Alert.alert("로그인 실패", "로그인 중 오류가 발생했습니다.");
      console.error("카카오 로그인 에러:", error);
    }
  };

  const handleGuestLogin = () => {
    Alert.alert(
      "게스트 로그인",
      "게스트로 로그인하시겠습니까? 일부 기능이 제한될 수 있습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "게스트 로그인",
          onPress: async () => {
            try {
              await loginAsGuest();
              router.replace("/(tabs)");
            } catch (error) {
              Alert.alert(
                "로그인 실패",
                "게스트 로그인 중 오류가 발생했습니다."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <LinearGradient
      colors={[colors.tint, colors.background]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.content}>
        {/* 로고 및 타이틀 */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={{ width: 130, height: 130 }}
          />
          <Text style={[styles.appTitle, { color: colors.background }]}>
            KARO
          </Text>
          <Text style={[styles.appSubtitle, { color: colors.background }]}>
            농구 랭킹 매치
          </Text>
        </View>

        {/* 로그인 버튼들 */}
        <View style={styles.loginContainer}>
          {/* 카카오 로그인 버튼 */}
          <TouchableOpacity
            style={[styles.kakaoButton, { opacity: state.isLoading ? 0.6 : 1 }]}
            onPress={handleKakaoLogin}
            disabled={state.isLoading}
          >
            <View style={styles.buttonContent}>
              {state.isLoading ? (
                <ActivityIndicator color="#000000" size="small" />
              ) : (
                <>
                  <View style={styles.kakaoIcon}>
                    <Text style={styles.kakaoIconText}>K</Text>
                  </View>
                  <Text style={styles.kakaoButtonText}>카카오로 로그인</Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          {/* 게스트 로그인 버튼 */}
          <TouchableOpacity
            style={[styles.guestButton, { borderColor: colors.background }]}
            onPress={handleGuestLogin}
            disabled={state.isLoading}
          >
            <FontAwesome name="user" size={20} color={colors.background} />
            <Text
              style={[styles.guestButtonText, { color: colors.background }]}
            >
              게스트로 둘러보기
            </Text>
          </TouchableOpacity>
        </View>

        {/* 하단 정보 */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.background }]}>
            카카오 계정으로 간편하게 로그인하고
          </Text>
          <Text style={[styles.footerText, { color: colors.background }]}>
            친구들과 농구 실력을 겨뤄보세요!
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 80,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 8,
    letterSpacing: 2,
  },
  appSubtitle: {
    fontSize: 16,
    opacity: 0.9,
  },
  loginContainer: {
    width: "100%",
    maxWidth: 300,
    gap: 16,
  },
  kakaoButton: {
    backgroundColor: "#FEE500",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  kakaoIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  kakaoIconText: {
    color: "#FEE500",
    fontSize: 14,
    fontWeight: "bold",
  },
  kakaoButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
  guestButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    marginTop: 60,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.8,
    lineHeight: 20,
  },
});
