import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { Text, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { User, PendingMatch } from '@/types';

const { width } = Dimensions.get('window');

export default function MatchScreen() {
  const { state, addPendingMatch, convertPendingToMatch } = useApp();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  // Tab state
  const [activeTab, setActiveTab] = useState<'register' | 'result'>('register');

  // Registration form state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [location, setLocation] = useState('');
  const [selectedOpponent, setSelectedOpponent] = useState<User | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showOpponentModal, setShowOpponentModal] = useState(false);
  const [opponentSearchText, setOpponentSearchText] = useState('');

  // Result form state
  const [selectedPendingMatch, setSelectedPendingMatch] = useState<PendingMatch | null>(null);
  const [player1Score, setPlayer1Score] = useState('');
  const [player2Score, setPlayer2Score] = useState('');
  const [showPendingMatchModal, setShowPendingMatchModal] = useState(false);

  // Tab bar height for padding
  const tabBarHeight = Platform.OS === 'android' ? 85 + insets.bottom : 80 + insets.bottom;

  // Available opponents (exclude current user) with search filter
  const availableOpponents = state.users.filter(user =>
    user.id !== state.currentUser?.id &&
    user.nickname.toLowerCase().includes(opponentSearchText.toLowerCase())
  );

  // Helper functions
  const formatTime = (hours: number, minutes: number): string => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const resetRegistrationForm = () => {
    setSelectedDate(new Date());
    setLocation('');
    setSelectedOpponent(null);
    setOpponentSearchText('');
  };

  const resetResultForm = () => {
    setSelectedPendingMatch(null);
    setPlayer1Score('');
    setPlayer2Score('');
  };

  // Event handlers
  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const getCurrentTime = (): string => {
    const now = new Date();
    return formatTime(now.getHours(), now.getMinutes());
  };

  const handleRegistration = () => {
    if (!location.trim()) {
      Alert.alert('오류', '경기 장소를 입력해주세요.');
      return;
    }
    if (!selectedOpponent) {
      Alert.alert('오류', '상대방을 선택해주세요.');
      return;
    }
    if (!state.currentUser) {
      Alert.alert('오류', '로그인이 필요합니다.');
      return;
    }

    const pendingMatchData = {
      date: selectedDate,
      time: getCurrentTime(),
      place: location.trim(),
      player1Id: state.currentUser.id,
      player2Id: selectedOpponent.id,
    };

    addPendingMatch(pendingMatchData);
    resetRegistrationForm();
    Alert.alert('성공', '경기가 등록되었습니다!');
  };

  const handleResultSubmission = () => {
    if (!selectedPendingMatch) {
      Alert.alert('오류', '경기를 선택해주세요.');
      return;
    }
    if (!player1Score.trim() || !player2Score.trim()) {
      Alert.alert('오류', '점수를 입력해주세요.');
      return;
    }

    const score1 = parseInt(player1Score.trim());
    const score2 = parseInt(player2Score.trim());

    if (isNaN(score1) || isNaN(score2) || score1 < 0 || score2 < 0) {
      Alert.alert('오류', '올바른 점수를 입력해주세요.');
      return;
    }

    if (score1 === score2) {
      Alert.alert('오류', '농구 경기는 동점이 될 수 없습니다.');
      return;
    }

    convertPendingToMatch(selectedPendingMatch.id, score1, score2);
    resetResultForm();
    Alert.alert('성공', '경기 결과가 등록되었습니다!');
  };

  const getUserNickname = (userId: string): string => {
    const user = state.users.find(u => u.id === userId);
    return user?.nickname || 'Unknown';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tab Selector */}
      <View style={[styles.tabContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'register' && { backgroundColor: colors.tint }
          ]}
          onPress={() => setActiveTab('register')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'register' ? colors.background : colors.text }
          ]}>
            경기 등록
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'result' && { backgroundColor: colors.tint }
          ]}
          onPress={() => setActiveTab('result')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'result' ? colors.background : colors.text }
          ]}>
            결과 입력
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
      >
        {activeTab === 'register' ? (
          // Match Registration Form
          <View style={styles.formContainer}>
            <Text style={[styles.sectionTitle, { color: colors.tint }]}>새 경기 등록</Text>

            {/* Date Selection */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>경기 날짜</Text>
              <TouchableOpacity
                style={[styles.inputButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setShowDatePicker(true)}
              >
                <FontAwesome name="calendar" size={20} color={colors.tint} />
                <Text style={[styles.inputButtonText, { color: colors.text }]}>
                  {selectedDate.toLocaleDateString('ko-KR')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Time Info */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>경기 시간</Text>
              <View
                style={[styles.inputButton, { backgroundColor: colors.surface, borderColor: colors.border, opacity: 0.7 }]}
              >
                <FontAwesome name="clock-o" size={20} color={colors.tint} />
                <Text style={[styles.inputButtonText, { color: colors.tabIconDefault }]}>
                  등록 시 자동 저장
                </Text>
              </View>
            </View>

            {/* Location Input */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>경기 장소</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }
                ]}
                value={location}
                onChangeText={setLocation}
                placeholder="경기 장소를 입력하세요"
                placeholderTextColor={colors.tabIconDefault}
              />
            </View>

            {/* Opponent Selection */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>상대방</Text>
              <TouchableOpacity
                style={[styles.inputButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setShowOpponentModal(true)}
              >
                <FontAwesome name="user" size={20} color={colors.tint} />
                <Text style={[styles.inputButtonText, { color: colors.text }]}>
                  {selectedOpponent?.nickname || '상대방 선택'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.tint }]}
              onPress={handleRegistration}
            >
              <FontAwesome name="plus" size={20} color={colors.background} />
              <Text style={[styles.submitButtonText, { color: colors.background }]}>
                경기 등록
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Match Result Form
          <View style={styles.formContainer}>
            <Text style={[styles.sectionTitle, { color: colors.secondary }]}>경기 결과 입력</Text>

            {state.pendingMatches.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
                <FontAwesome name="calendar-times-o" size={48} color={colors.tabIconDefault} />
                <Text style={[styles.emptyText, { color: colors.text }]}>
                  등록된 경기가 없습니다
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>
                  먼저 경기를 등록해주세요
                </Text>
              </View>
            ) : (
              <>
                {/* Match Selection */}
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>경기 선택</Text>
                  <TouchableOpacity
                    style={[styles.inputButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => setShowPendingMatchModal(true)}
                  >
                    <FontAwesome name="list" size={20} color={colors.secondary} />
                    <Text style={[styles.inputButtonText, { color: colors.text }]}>
                      {selectedPendingMatch
                        ? `${selectedPendingMatch.place} (${selectedPendingMatch.date.toLocaleDateString('ko-KR')})`
                        : '경기 선택'
                      }
                    </Text>
                  </TouchableOpacity>
                </View>

                {selectedPendingMatch && (
                  <>
                    {/* Match Info */}
                    <View style={[styles.matchInfo, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <Text style={[styles.matchInfoTitle, { color: colors.secondary }]}>경기 정보</Text>
                      <Text style={[styles.matchInfoText, { color: colors.text }]}>
                        📅 {selectedPendingMatch.date.toLocaleDateString('ko-KR')} {selectedPendingMatch.time}
                      </Text>
                      <Text style={[styles.matchInfoText, { color: colors.text }]}>
                        📍 {selectedPendingMatch.place}
                      </Text>
                      <Text style={[styles.matchInfoText, { color: colors.text }]}>
                        🏀 {getUserNickname(selectedPendingMatch.player1Id)} vs {getUserNickname(selectedPendingMatch.player2Id)}
                      </Text>
                    </View>

                    {/* Score Inputs */}
                    <View style={styles.scoreContainer}>
                      <View style={styles.scoreInputGroup}>
                        <Text style={[styles.playerLabel, { color: colors.text }]}>
                          {getUserNickname(selectedPendingMatch.player1Id)}
                        </Text>
                        <TextInput
                          style={[
                            styles.scoreInput,
                            { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }
                          ]}
                          value={player1Score}
                          onChangeText={setPlayer1Score}
                          placeholder="점수"
                          placeholderTextColor={colors.tabIconDefault}
                          keyboardType="numeric"
                        />
                      </View>

                      <Text style={[styles.vsText, { color: colors.secondary }]}>VS</Text>

                      <View style={styles.scoreInputGroup}>
                        <Text style={[styles.playerLabel, { color: colors.text }]}>
                          {getUserNickname(selectedPendingMatch.player2Id)}
                        </Text>
                        <TextInput
                          style={[
                            styles.scoreInput,
                            { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }
                          ]}
                          value={player2Score}
                          onChangeText={setPlayer2Score}
                          placeholder="점수"
                          placeholderTextColor={colors.tabIconDefault}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                      style={[styles.submitButton, { backgroundColor: colors.secondary }]}
                      onPress={handleResultSubmission}
                    >
                      <FontAwesome name="check" size={20} color={colors.background} />
                      <Text style={[styles.submitButtonText, { color: colors.background }]}>
                        결과 저장
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}


      {/* Opponent Selection Modal */}
      <Modal
        visible={showOpponentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOpponentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.tint }]}>상대방 선택</Text>
              <TouchableOpacity onPress={() => {
                setShowOpponentModal(false);
                setOpponentSearchText('');
              }}>
                <FontAwesome name="times" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <FontAwesome name="search" size={16} color={colors.tabIconDefault} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                value={opponentSearchText}
                onChangeText={setOpponentSearchText}
                placeholder="상대방 검색..."
                placeholderTextColor={colors.tabIconDefault}
              />
            </View>

            <FlatList
              data={availableOpponents}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.opponentItem, { borderColor: colors.border }]}
                  onPress={() => {
                    setSelectedOpponent(item);
                    setShowOpponentModal(false);
                    setOpponentSearchText('');
                  }}
                >
                  <Text style={[styles.opponentName, { color: colors.text }]}>
                    {item.nickname}
                  </Text>
                  <Text style={[styles.opponentRank, { color: colors.secondary }]}>
                    {item.rankScore}점
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Pending Match Selection Modal */}
      <Modal
        visible={showPendingMatchModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPendingMatchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.secondary }]}>경기 선택</Text>
              <TouchableOpacity onPress={() => setShowPendingMatchModal(false)}>
                <FontAwesome name="times" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={state.pendingMatches}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.pendingMatchItem, { borderColor: colors.border }]}
                  onPress={() => {
                    setSelectedPendingMatch(item);
                    setShowPendingMatchModal(false);
                  }}
                >
                  <Text style={[styles.pendingMatchPlace, { color: colors.text }]}>
                    {item.place}
                  </Text>
                  <Text style={[styles.pendingMatchDate, { color: colors.tabIconDefault }]}>
                    {item.date.toLocaleDateString('ko-KR')} {item.time}
                  </Text>
                  <Text style={[styles.pendingMatchPlayers, { color: colors.secondary }]}>
                    {getUserNickname(item.player1Id)} vs {getUserNickname(item.player2Id)}
                  </Text>
                </TouchableOpacity>
              )}
            />
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
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  inputButtonText: {
    fontSize: 16,
    marginLeft: 12,
  },
  textInput: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyState: {
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  matchInfo: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  matchInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  matchInfoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  scoreInputGroup: {
    flex: 1,
    alignItems: 'center',
  },
  playerLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  scoreInput: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  vsText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  opponentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  opponentName: {
    fontSize: 16,
    fontWeight: '600',
  },
  opponentRank: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  pendingMatchItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  pendingMatchPlace: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  pendingMatchDate: {
    fontSize: 14,
    marginBottom: 4,
  },
  pendingMatchPlayers: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    paddingLeft: 40,
    paddingRight: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
});