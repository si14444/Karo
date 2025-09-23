import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  TextInput,
  Switch,
  Linking,
} from "react-native";
import { Text, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/contexts/AppContext";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useUserData } from "@/hooks/useUserData";
import { useSafeAreaContainer } from "@/hooks/useSafeAreaContainer";

export default function ProfileScreen() {
  const { state, getUserStats } = useApp();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();
  const { currentUser } = useUserData();
  const { contentContainerStyle } = useSafeAreaContainer();

  // State for modals and settings
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [nickname, setNickname] = useState(currentUser?.nickname || "");
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(colorScheme === "dark");

  // Tab bar height for padding
  const tabBarHeight =
    Platform.OS === "android" ? 85 + insets.bottom : 80 + insets.bottom;

  const currentUserStats = currentUser ? getUserStats(currentUser.id) : null;
  const currentRank =
    state.users
      .sort((a, b) => b.rankScore - a.rankScore)
      .findIndex((user) => user.id === currentUser?.id) + 1;

  const handleEditProfile = () => {
    if (!nickname.trim()) {
      Alert.alert("오류", "닉네임을 입력해주세요.");
      return;
    }
    // Here you would update the user profile
    Alert.alert("성공", "프로필이 업데이트되었습니다.");
    setShowEditProfile(false);
  };

  const handleContactSupport = () => {
    Alert.alert("고객 지원", "문의사항이 있으시나요?", [
      { text: "취소", style: "cancel" },
      {
        text: "이메일 보내기",
        onPress: () =>
          Linking.openURL("mailto:support@karo.app?subject=KARO 앱 문의"),
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: () => {
          // Here you would handle logout logic
          Alert.alert("알림", "로그아웃되었습니다.");
        },
      },
    ]);
  };

  const settingsOptions = [
    {
      id: "edit-profile",
      title: "프로필 수정",
      icon: "edit",
      onPress: () => setShowEditProfile(true),
      color: colors.tint,
    },
    {
      id: "notifications",
      title: "알림 설정",
      icon: "bell",
      onPress: () => setNotifications(!notifications),
      color: colors.secondary,
      hasSwitch: true,
      switchValue: notifications,
    },
    {
      id: "dark-mode",
      title: "다크 모드",
      icon: "moon-o",
      onPress: () => setDarkMode(!darkMode),
      color: colors.warning,
      hasSwitch: true,
      switchValue: darkMode,
    },
    {
      id: "support",
      title: "고객 지원",
      icon: "question-circle",
      onPress: handleContactSupport,
      color: colors.secondary,
    },
    {
      id: "about",
      title: "앱 정보",
      icon: "info-circle",
      onPress: () => setShowAbout(true),
      color: colors.tint,
    },
    {
      id: "logout",
      title: "로그아웃",
      icon: "sign-out",
      onPress: handleLogout,
      color: colors.lose,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={contentContainerStyle}
      >
        {/* Profile Header */}
        <View
          style={[
            styles.profileHeader,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View
            style={[styles.avatarContainer, { backgroundColor: colors.tint }]}
          >
            <FontAwesome name="user" size={40} color={colors.background} />
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {currentUser?.nickname || "Player"}
            </Text>
            <Text style={[styles.profileRank, { color: colors.secondary }]}>
              #{currentRank} 랭킹 • {currentUser?.rankScore || 0}점
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.editButton, { borderColor: colors.tint }]}
            onPress={() => setShowEditProfile(true)}
          >
            <FontAwesome name="edit" size={16} color={colors.tint} />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        {currentUserStats && (
          <View
            style={[
              styles.quickStats,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.statsTitle, { color: colors.tint }]}>
              나의 성과
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.win }]}>
                  {currentUserStats.wins}
                </Text>
                <Text style={[styles.statLabel, { color: colors.text }]}>
                  승
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.lose }]}>
                  {currentUserStats.losses}
                </Text>
                <Text style={[styles.statLabel, { color: colors.text }]}>
                  패
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.secondary }]}>
                  {currentUserStats.winRate.toFixed(1)}%
                </Text>
                <Text style={[styles.statLabel, { color: colors.text }]}>
                  승률
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.warning }]}>
                  {currentUserStats.totalMatches}
                </Text>
                <Text style={[styles.statLabel, { color: colors.text }]}>
                  경기
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Settings Menu */}
        <View style={styles.settingsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.tint }]}>
            설정
          </Text>

          {settingsOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.settingItem,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={option.onPress}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIcon,
                    { backgroundColor: `${option.color}15` },
                  ]}
                >
                  <FontAwesome
                    name={option.icon as any}
                    size={20}
                    color={option.color}
                  />
                </View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  {option.title}
                </Text>
              </View>

              <View style={styles.settingRight}>
                {option.hasSwitch ? (
                  <Switch
                    value={option.switchValue}
                    onValueChange={option.onPress}
                    trackColor={{ false: colors.border, true: option.color }}
                    thumbColor={colors.background}
                  />
                ) : (
                  <FontAwesome
                    name="chevron-right"
                    size={16}
                    color={colors.tabIconDefault}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: colors.tabIconDefault }]}>
            KARO v1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfile}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditProfile(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.tint }]}>
                프로필 수정
              </Text>
              <TouchableOpacity onPress={() => setShowEditProfile(false)}>
                <FontAwesome name="times" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.editForm}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                닉네임
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={nickname}
                onChangeText={setNickname}
                placeholder="닉네임을 입력하세요"
                placeholderTextColor={colors.tabIconDefault}
                maxLength={20}
              />

              <View style={styles.editActions}>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: colors.border }]}
                  onPress={() => setShowEditProfile(false)}
                >
                  <Text
                    style={[styles.cancelButtonText, { color: colors.text }]}
                  >
                    취소
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: colors.tint }]}
                  onPress={handleEditProfile}
                >
                  <Text
                    style={[
                      styles.saveButtonText,
                      { color: colors.background },
                    ]}
                  >
                    저장
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal
        visible={showAbout}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAbout(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.tint }]}>
                앱 정보
              </Text>
              <TouchableOpacity onPress={() => setShowAbout(false)}>
                <FontAwesome name="times" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.aboutContent}>
              <View style={styles.appLogoContainer}>
                <View
                  style={[styles.appLogo, { backgroundColor: colors.tint }]}
                >
                  <Text
                    style={[styles.appLogoText, { color: colors.background }]}
                  >
                    KARO
                  </Text>
                </View>
              </View>

              <Text style={[styles.appName, { color: colors.text }]}>KARO</Text>
              <Text style={[styles.appVersion, { color: colors.secondary }]}>
                버전 1.0.0
              </Text>

              <Text style={[styles.appDescription, { color: colors.text }]}>
                농구 경기 기록과 랭킹을 관리하는 앱입니다. 친구들과 함께 경기를
                즐기고 실력을 향상시켜보세요!
              </Text>

              <View style={styles.aboutLinks}>
                <TouchableOpacity
                  style={[styles.linkButton, { borderColor: colors.border }]}
                  onPress={() => Linking.openURL("https://github.com/karo-app")}
                >
                  <FontAwesome name="github" size={20} color={colors.text} />
                  <Text style={[styles.linkText, { color: colors.text }]}>
                    GitHub
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.linkButton, { borderColor: colors.border }]}
                  onPress={() => Linking.openURL("https://karo.app/privacy")}
                >
                  <FontAwesome name="shield" size={20} color={colors.text} />
                  <Text style={[styles.linkText, { color: colors.text }]}>
                    개인정보처리방침
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  profileRank: {
    fontSize: 14,
    fontWeight: "600",
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  quickStats: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  settingsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  settingRight: {
    alignItems: "center",
  },
  versionContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  editForm: {
    paddingBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  textInput: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 20,
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginLeft: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  aboutContent: {
    alignItems: "center",
    paddingBottom: 20,
  },
  appLogoContainer: {
    marginBottom: 20,
  },
  appLogo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  appLogoText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 16,
    marginBottom: 20,
  },
  appDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 30,
  },
  aboutLinks: {
    width: "100%",
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
