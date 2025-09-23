import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Modal,
  Dimensions,
  Share,
  Clipboard,
} from 'react-native';
import { Text, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { GameRoom, LiveMatch, MatchStatus } from '@/types';
import RoomDetail from '@/components/RoomDetail';

const { width } = Dimensions.get('window');

export default function MatchScreen() {
  const {
    state,
    createGameRoom,
    joinGameRoom,
    startLiveMatch,
    updateLiveMatch,
    endLiveMatch,
    findRoomByInviteCode
  } = useApp();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  // Main tab state
  const [activeTab, setActiveTab] = useState<'create' | 'join' | 'live'>('create');

  // Room navigation state
  const [currentRoomView, setCurrentRoomView] = useState<GameRoom | null>(null);
  const [isInRoom, setIsInRoom] = useState(false);

  // Create room state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [location, setLocation] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [createdRoom, setCreatedRoom] = useState<GameRoom | null>(null);

  // Join room state
  const [inviteCode, setInviteCode] = useState('');
  const [joinedRoom, setJoinedRoom] = useState<GameRoom | null>(null);

  // Live match state
  const [currentMatch, setCurrentMatch] = useState<LiveMatch | null>(null);
  const [matchTimer, setMatchTimer] = useState(0);

  // Score input state
  const [player1Score, setPlayer1Score] = useState('');
  const [player2Score, setPlayer2Score] = useState('');
  const [showScoreModal, setShowScoreModal] = useState(false);

  const tabBarHeight = Platform.OS === 'android' ? 85 + insets.bottom : 80 + insets.bottom;

  // Generate random invite code
  const generateInviteCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Timer effect for live matches
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentMatch?.status === 'in_progress' && currentMatch.startTime) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const start = new Date(currentMatch.startTime!).getTime();
        setMatchTimer(Math.floor((now - start) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentMatch]);

  // Format timer display
  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Create room handler
  const handleCreateRoom = async () => {
    if (!location.trim()) {
      Alert.alert('오류', '경기 장소를 입력해주세요.');
      return;
    }
    if (!state.currentUser) {
      Alert.alert('오류', '로그인이 필요합니다.');
      return;
    }

    const inviteCode = generateInviteCode();
    const roomData = {
      inviteCode,
      hostId: state.currentUser.id,
      place: location.trim(),
      date: selectedDate,
      status: 'waiting_for_guest' as const,
    };

    const newRoom = createGameRoom(roomData);
    setCreatedRoom(newRoom);
    setCurrentRoomView(newRoom);
    setIsInRoom(true);
    Alert.alert('방 생성 완료', `초대 코드: ${inviteCode}\n방에 입장했습니다!`);
  };

  // Join room handler
  const handleJoinRoom = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('오류', '초대 코드를 입력해주세요.');
      return;
    }
    if (!state.currentUser) {
      Alert.alert('오류', '로그인이 필요합니다.');
      return;
    }

    const room = joinGameRoom(inviteCode.trim(), state.currentUser.id);
    if (!room) {
      Alert.alert('오류', '유효하지 않은 초대 코드입니다.');
      return;
    }

    setJoinedRoom(room);
    setCurrentRoomView(room);
    setIsInRoom(true);
    Alert.alert('입장 완료', '방에 입장했습니다!');
  };

  // Start match handler
  const handleStartMatch = async (room: GameRoom) => {
    if (!room.guestId) {
      Alert.alert('오류', '상대방이 입장하지 않았습니다.');
      return;
    }

    const newMatch = startLiveMatch(room.id);
    if (!newMatch) {
      Alert.alert('오류', '경기를 시작할 수 없습니다.');
      return;
    }

    setCurrentMatch(newMatch);
    setIsInRoom(false);
    setCurrentRoomView(null);
    setActiveTab('live');
    Alert.alert('경기 시작!', '좋은 경기 하세요!');
  };

  // Start match from room detail
  const handleStartMatchFromRoom = (match: LiveMatch) => {
    setCurrentMatch(match);
    setIsInRoom(false);
    setCurrentRoomView(null);
    setActiveTab('live');
  };

  // Leave room handler
  const handleLeaveRoom = () => {
    setIsInRoom(false);
    setCurrentRoomView(null);
    setCreatedRoom(null);
    setJoinedRoom(null);
    setLocation('');
    setInviteCode('');
  };

  // End match handler
  const handleEndMatch = () => {
    if (!currentMatch) return;

    updateLiveMatch(currentMatch.id, {
      status: 'finished',
      endTime: new Date(),
      updatedAt: new Date(),
    });

    setCurrentMatch({
      ...currentMatch,
      status: 'finished',
      endTime: new Date(),
      updatedAt: new Date(),
    });
    setShowScoreModal(true);
  };

  // Submit score handler
  const handleSubmitScore = () => {
    if (!player1Score.trim() || !player2Score.trim()) {
      Alert.alert('오류', '점수를 입력해주세요.');
      return;
    }
    if (!currentMatch) {
      Alert.alert('오류', '경기 정보를 찾을 수 없습니다.');
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

    const winnerId = score1 > score2 ? currentMatch.player1Id : currentMatch.player2Id;
    const result = {
      matchId: currentMatch.id,
      player1Score: score1,
      player2Score: score2,
      winnerId,
      confirmedBy: [state.currentUser?.id || ''],
      needsConfirmation: false, // For demo purposes, auto-confirm
    };

    endLiveMatch(currentMatch.id, result);

    Alert.alert('결과 저장 완료', '경기 결과가 저장되었습니다!', [
      {
        text: '확인',
        onPress: () => {
          setShowScoreModal(false);
          setCurrentMatch(null);
          setPlayer1Score('');
          setPlayer2Score('');
          setCreatedRoom(null);
          setJoinedRoom(null);
          setActiveTab('create');
        },
      },
    ]);
  };

  // Share invite code
  const shareInviteCode = async (code: string) => {
    try {
      await Share.share({
        message: `KARO 농구 매치에 초대합니다!\n초대 코드: ${code}\n\n앱에서 코드를 입력하여 참여하세요!`,
        title: 'KARO 초대 코드',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  // Copy invite code
  const copyInviteCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Alert.alert('복사 완료', '초대 코드가 클립보드에 복사되었습니다.');
  };

  const getUserNickname = (userId: string): string => {
    const user = state.users.find(u => u.id === userId);
    return user?.nickname || state.currentUser?.nickname || 'Unknown';
  };

  // Show room detail if in room
  if (isInRoom && currentRoomView) {
    const isHost = currentRoomView.hostId === state.currentUser?.id;
    return (
      <RoomDetail
        room={currentRoomView}
        isHost={isHost}
        onLeaveRoom={handleLeaveRoom}
        onStartMatch={handleStartMatchFromRoom}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tab Selector */}
      <View style={[styles.tabContainer, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: insets.top + 20 }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'create' && { backgroundColor: colors.tint }]}
          onPress={() => setActiveTab('create')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'create' ? colors.background : colors.text }]}>
            방 만들기
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'join' && { backgroundColor: colors.tint }]}
          onPress={() => setActiveTab('join')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'join' ? colors.background : colors.text }]}>
            방 입장
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'live' && { backgroundColor: colors.secondary }]}
          onPress={() => setActiveTab('live')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'live' ? colors.background : colors.text }]}>
            라이브 경기
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 20, paddingTop: insets.top + 20 }}
      >
        {activeTab === 'create' && (
          <View style={styles.formContainer}>
            <Text style={[styles.sectionTitle, { color: colors.tint }]}>경기 방 만들기</Text>

            {!createdRoom ? (
              <>
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

                {/* Location Input */}
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>경기 장소</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    value={location}
                    onChangeText={setLocation}
                    placeholder="경기 장소를 입력하세요"
                    placeholderTextColor={colors.tabIconDefault}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, { backgroundColor: colors.tint }]}
                  onPress={handleCreateRoom}
                >
                  <FontAwesome name="plus" size={20} color={colors.background} />
                  <Text style={[styles.submitButtonText, { color: colors.background }]}>방 만들기</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={[styles.roomCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.roomHeader}>
                  <Text style={[styles.roomTitle, { color: colors.text }]}>생성된 방</Text>
                  <Text style={[styles.roomStatus, { color: colors.tint }]}>대기 중</Text>
                </View>

                <View style={styles.roomInfo}>
                  <Text style={[styles.roomPlace, { color: colors.text }]}>📍 {createdRoom.place}</Text>
                  <Text style={[styles.roomDate, { color: colors.tabIconDefault }]}>
                    📅 {createdRoom.date.toLocaleDateString('ko-KR')}
                  </Text>
                </View>

                <View style={[styles.inviteCodeContainer, { backgroundColor: colors.background }]}>
                  <Text style={[styles.inviteCodeLabel, { color: colors.tabIconDefault }]}>초대 코드</Text>
                  <Text style={[styles.inviteCode, { color: colors.tint }]}>{createdRoom.inviteCode}</Text>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.secondary }]}
                    onPress={() => shareInviteCode(createdRoom.inviteCode)}
                  >
                    <FontAwesome name="share" size={16} color={colors.background} />
                    <Text style={[styles.actionButtonText, { color: colors.background }]}>공유</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
                    onPress={() => copyInviteCode(createdRoom.inviteCode)}
                  >
                    <FontAwesome name="copy" size={16} color={colors.text} />
                    <Text style={[styles.actionButtonText, { color: colors.text }]}>복사</Text>
                  </TouchableOpacity>
                </View>

                {createdRoom.guestId && (
                  <TouchableOpacity
                    style={[styles.startButton, { backgroundColor: colors.tint }]}
                    onPress={() => handleStartMatch(createdRoom)}
                  >
                    <FontAwesome name="play" size={20} color={colors.background} />
                    <Text style={[styles.startButtonText, { color: colors.background }]}>경기 시작</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        {activeTab === 'join' && (
          <View style={styles.formContainer}>
            <Text style={[styles.sectionTitle, { color: colors.tint }]}>경기 방 입장</Text>

            {!joinedRoom ? (
              <>
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>초대 코드</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text, textAlign: 'center', fontSize: 18, letterSpacing: 2 }]}
                    value={inviteCode}
                    onChangeText={(text) => setInviteCode(text.toUpperCase())}
                    placeholder="6자리 코드 입력"
                    placeholderTextColor={colors.tabIconDefault}
                    maxLength={6}
                    autoCapitalize="characters"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, { backgroundColor: colors.secondary }]}
                  onPress={handleJoinRoom}
                >
                  <FontAwesome name="sign-in" size={20} color={colors.background} />
                  <Text style={[styles.submitButtonText, { color: colors.background }]}>방 입장</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={[styles.roomCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.roomHeader}>
                  <Text style={[styles.roomTitle, { color: colors.text }]}>입장한 방</Text>
                  <Text style={[styles.roomStatus, { color: colors.secondary }]}>준비 완료</Text>
                </View>

                <View style={styles.roomInfo}>
                  <Text style={[styles.roomPlace, { color: colors.text }]}>📍 {joinedRoom.place}</Text>
                  <Text style={[styles.roomDate, { color: colors.tabIconDefault }]}>
                    📅 {joinedRoom.date.toLocaleDateString('ko-KR')}
                  </Text>
                </View>

                <View style={styles.playersInfo}>
                  <Text style={[styles.playersTitle, { color: colors.text }]}>플레이어</Text>
                  <Text style={[styles.playersText, { color: colors.secondary }]}>
                    {getUserNickname(joinedRoom.hostId)} vs {getUserNickname(joinedRoom.guestId || '')}
                  </Text>
                </View>

                <Text style={[styles.waitingText, { color: colors.tabIconDefault }]}>
                  호스트가 경기를 시작하기를 기다리는 중...
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'live' && (
          <View style={styles.formContainer}>
            {!currentMatch ? (
              <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
                <FontAwesome name="play-circle-o" size={48} color={colors.tabIconDefault} />
                <Text style={[styles.emptyText, { color: colors.text }]}>진행 중인 경기가 없습니다</Text>
                <Text style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>
                  방을 만들거나 입장하여 경기를 시작하세요
                </Text>
              </View>
            ) : (
              <View style={[styles.liveMatchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.liveTitle, { color: colors.secondary }]}>🔴 라이브 경기</Text>

                <View style={styles.matchTimer}>
                  <Text style={[styles.timerText, { color: colors.tint }]}>{formatTimer(matchTimer)}</Text>
                  <Text style={[styles.timerLabel, { color: colors.tabIconDefault }]}>경과 시간</Text>
                </View>

                <View style={styles.liveMatchInfo}>
                  <Text style={[styles.livePlace, { color: colors.text }]}>📍 {currentMatch.place}</Text>
                  <Text style={[styles.livePlayers, { color: colors.text }]}>
                    🏀 {getUserNickname(currentMatch.player1Id)} vs {getUserNickname(currentMatch.player2Id)}
                  </Text>
                  <Text style={[styles.liveStatus, { color: colors.secondary }]}>
                    {currentMatch.status === 'in_progress' ? '경기 진행 중' : '경기 종료'}
                  </Text>
                </View>

                {currentMatch.status === 'in_progress' && (
                  <TouchableOpacity
                    style={[styles.endButton, { backgroundColor: colors.error }]}
                    onPress={handleEndMatch}
                  >
                    <FontAwesome name="stop" size={20} color={colors.text} />
                    <Text style={[styles.endButtonText, { color: colors.text }]}>경기 종료</Text>
                  </TouchableOpacity>
                )}
              </View>
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
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
          minimumDate={new Date()}
        />
      )}

      {/* Score Input Modal */}
      <Modal visible={showScoreModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.scoreModalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.scoreModalTitle, { color: colors.secondary }]}>경기 결과 입력</Text>

            <View style={styles.scoreContainer}>
              <View style={styles.scoreInputGroup}>
                <Text style={[styles.playerLabel, { color: colors.text }]}>
                  {getUserNickname(currentMatch?.player1Id || '')}
                </Text>
                <TextInput
                  style={[styles.scoreInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
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
                  {getUserNickname(currentMatch?.player2Id || '')}
                </Text>
                <TextInput
                  style={[styles.scoreInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  value={player2Score}
                  onChangeText={setPlayer2Score}
                  placeholder="점수"
                  placeholderTextColor={colors.tabIconDefault}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.scoreModalButtons}>
              <TouchableOpacity
                style={[styles.scoreModalButton, { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => setShowScoreModal(false)}
              >
                <Text style={[styles.scoreModalButtonText, { color: colors.text }]}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.scoreModalButton, { backgroundColor: colors.tint }]}
                onPress={handleSubmitScore}
              >
                <Text style={[styles.scoreModalButtonText, { color: colors.background }]}>저장</Text>
              </TouchableOpacity>
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
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
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
  roomCard: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    marginTop: 20,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  roomStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  roomInfo: {
    marginBottom: 16,
  },
  roomPlace: {
    fontSize: 16,
    marginBottom: 4,
  },
  roomDate: {
    fontSize: 14,
  },
  inviteCodeContainer: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  inviteCodeLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  inviteCode: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  playersInfo: {
    marginBottom: 16,
  },
  playersTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  playersText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  waitingText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
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
  liveMatchContainer: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
  },
  liveTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  matchTimer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  timerLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  liveMatchInfo: {
    marginBottom: 20,
  },
  livePlace: {
    fontSize: 16,
    marginBottom: 8,
  },
  livePlayers: {
    fontSize: 16,
    marginBottom: 8,
  },
  liveStatus: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  endButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreModalContent: {
    width: width * 0.9,
    borderRadius: 16,
    padding: 20,
  },
  scoreModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
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
  scoreModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  scoreModalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  scoreModalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});