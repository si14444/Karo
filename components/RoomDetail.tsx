import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  Dimensions,
  Share,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Text, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { GameRoom, LiveMatch } from '@/types';

const { width } = Dimensions.get('window');

interface RoomDetailProps {
  room: GameRoom;
  isHost: boolean;
  onLeaveRoom: () => void;
  onStartMatch: (match: LiveMatch) => void;
}

export default function RoomDetail({ room, isHost, onLeaveRoom, onStartMatch }: RoomDetailProps) {
  const {
    state,
    startLiveMatch,
    leaveGameRoom,
  } = useApp();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const [currentRoom, setCurrentRoom] = useState<GameRoom>(room);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'waiting' | 'disconnected'>('connected');

  const tabBarHeight = Platform.OS === 'android' ? 85 + insets.bottom : 80 + insets.bottom;

  // Update room state when prop changes
  useEffect(() => {
    setCurrentRoom(room);
  }, [room]);

  // Simulate real-time updates (in real Firebase implementation, this would be a listener)
  useEffect(() => {
    const interval = setInterval(() => {
      // Check if guest joined
      if (!currentRoom.guestId && room.guestId) {
        setCurrentRoom(room);
        if (isHost) {
          Alert.alert('알림', '상대방이 입장했습니다!');
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentRoom, room, isHost]);

  const getUserNickname = (userId: string): string => {
    const user = state.users.find(u => u.id === userId);
    return user?.nickname || state.currentUser?.nickname || 'Unknown';
  };

  const handleLeaveRoom = () => {
    Alert.alert(
      '방 나가기',
      '정말로 방을 나가시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '나가기',
          style: 'destructive',
          onPress: () => {
            if (!state.currentUser) return;
            leaveGameRoom(currentRoom.id, state.currentUser.id);
            onLeaveRoom();
          },
        },
      ]
    );
  };

  const handleStartMatch = () => {
    if (!currentRoom.guestId) {
      Alert.alert('오류', '상대방이 아직 입장하지 않았습니다.');
      return;
    }

    Alert.alert(
      '경기 시작',
      '경기를 시작하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '시작',
          onPress: () => {
            const newMatch = startLiveMatch(currentRoom.id);
            if (newMatch) {
              onStartMatch(newMatch);
            } else {
              Alert.alert('오류', '경기를 시작할 수 없습니다.');
            }
          },
        },
      ]
    );
  };

  const shareInviteCode = async () => {
    try {
      await Share.share({
        message: `KARO 농구 매치에 초대합니다!\n초대 코드: ${currentRoom.inviteCode}\n\n앱에서 코드를 입력하여 참여하세요!`,
        title: 'KARO 초대 코드',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const copyInviteCode = async () => {
    await Clipboard.setStringAsync(currentRoom.inviteCode);
    Alert.alert('복사 완료', '초대 코드가 클립보드에 복사되었습니다.');
  };

  const getRoomStatusText = () => {
    if (currentRoom.status === 'waiting_for_guest') {
      return isHost ? '상대방 대기 중' : '방 입장 완료';
    } else if (currentRoom.status === 'ready') {
      return '게임 준비 완료';
    }
    return '알 수 없음';
  };

  const getRoomStatusColor = () => {
    if (currentRoom.status === 'waiting_for_guest') {
      return colors.warning;
    } else if (currentRoom.status === 'ready') {
      return colors.success;
    }
    return colors.tabIconDefault;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border, paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={handleLeaveRoom} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color={colors.text} />
          <Text style={[styles.backButtonText, { color: colors.text }]}>나가기</Text>
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.tint }]}>게임 룸</Text>

        <View style={styles.headerRight}>
          <View style={[styles.statusIndicator, { backgroundColor: getRoomStatusColor() }]} />
          <Text style={[styles.statusText, { color: colors.text }]}>
            {connectionStatus === 'connected' ? '연결됨' : '연결 중...'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
      >
        {/* Room Info Card */}
        <View style={[styles.roomCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.roomHeader}>
            <Text style={[styles.roomTitle, { color: colors.text }]}>룸 정보</Text>
            <Text style={[styles.roomStatus, { color: getRoomStatusColor() }]}>
              {getRoomStatusText()}
            </Text>
          </View>

          <View style={styles.roomInfoSection}>
            <View style={styles.infoRow}>
              <FontAwesome name="calendar" size={16} color={colors.tint} />
              <Text style={[styles.infoLabel, { color: colors.tabIconDefault }]}>날짜</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {currentRoom.date.toLocaleDateString('ko-KR')}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <FontAwesome name="map-marker" size={16} color={colors.tint} />
              <Text style={[styles.infoLabel, { color: colors.tabIconDefault }]}>장소</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {currentRoom.place}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <FontAwesome name="user" size={16} color={colors.tint} />
              <Text style={[styles.infoLabel, { color: colors.tabIconDefault }]}>호스트</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {getUserNickname(currentRoom.hostId)}
                {isHost && ' (나)'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <FontAwesome name="users" size={16} color={colors.tint} />
              <Text style={[styles.infoLabel, { color: colors.tabIconDefault }]}>게스트</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {currentRoom.guestId ? (
                  <>
                    {getUserNickname(currentRoom.guestId)}
                    {!isHost && ' (나)'}
                  </>
                ) : (
                  '대기 중...'
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Invite Code Card */}
        {isHost && !currentRoom.guestId && (
          <View style={[styles.inviteCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.inviteTitle, { color: colors.text }]}>초대 코드</Text>
            <Text style={[styles.inviteSubtitle, { color: colors.tabIconDefault }]}>
              상대방에게 이 코드를 공유하세요
            </Text>

            <View style={[styles.inviteCodeContainer, { backgroundColor: colors.background }]}>
              <Text style={[styles.inviteCode, { color: colors.tint }]}>{currentRoom.inviteCode}</Text>
            </View>

            <View style={styles.inviteActions}>
              <TouchableOpacity
                style={[styles.inviteButton, { backgroundColor: colors.secondary }]}
                onPress={shareInviteCode}
              >
                <FontAwesome name="share" size={16} color={colors.background} />
                <Text style={[styles.inviteButtonText, { color: colors.background }]}>공유하기</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.inviteButton, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
                onPress={copyInviteCode}
              >
                <FontAwesome name="copy" size={16} color={colors.text} />
                <Text style={[styles.inviteButtonText, { color: colors.text }]}>복사하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Players Card */}
        <View style={[styles.playersCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.playersTitle, { color: colors.text }]}>플레이어</Text>

          <View style={styles.playersContainer}>
            {/* Player 1 */}
            <View style={[styles.playerItem, { backgroundColor: colors.background }]}>
              <View style={styles.playerInfo}>
                <FontAwesome name="user-circle" size={32} color={colors.tint} />
                <Text style={[styles.playerName, { color: colors.text }]}>
                  {getUserNickname(currentRoom.hostId)}
                </Text>
                <Text style={[styles.playerRole, { color: colors.tabIconDefault }]}>호스트</Text>
              </View>
              {isHost && (
                <View style={[styles.playerBadge, { backgroundColor: colors.tint }]}>
                  <Text style={[styles.playerBadgeText, { color: colors.background }]}>나</Text>
                </View>
              )}
            </View>

            <Text style={[styles.vsText, { color: colors.secondary }]}>VS</Text>

            {/* Player 2 */}
            <View style={[styles.playerItem, { backgroundColor: colors.background }]}>
              {currentRoom.guestId ? (
                <>
                  <View style={styles.playerInfo}>
                    <FontAwesome name="user-circle" size={32} color={colors.secondary} />
                    <Text style={[styles.playerName, { color: colors.text }]}>
                      {getUserNickname(currentRoom.guestId)}
                    </Text>
                    <Text style={[styles.playerRole, { color: colors.tabIconDefault }]}>게스트</Text>
                  </View>
                  {!isHost && (
                    <View style={[styles.playerBadge, { backgroundColor: colors.secondary }]}>
                      <Text style={[styles.playerBadgeText, { color: colors.background }]}>나</Text>
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.playerInfo}>
                  <FontAwesome name="user-plus" size={32} color={colors.tabIconDefault} />
                  <Text style={[styles.playerName, { color: colors.tabIconDefault }]}>대기 중...</Text>
                  <Text style={[styles.playerRole, { color: colors.tabIconDefault }]}>게스트</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {isHost && currentRoom.guestId && currentRoom.status === 'ready' && (
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: colors.tint }]}
              onPress={handleStartMatch}
            >
              <FontAwesome name="play" size={20} color={colors.background} />
              <Text style={[styles.startButtonText, { color: colors.background }]}>경기 시작</Text>
            </TouchableOpacity>
          )}

          {!isHost && currentRoom.status === 'ready' && (
            <View style={[styles.waitingContainer, { backgroundColor: colors.surface }]}>
              <FontAwesome name="clock-o" size={24} color={colors.secondary} />
              <Text style={[styles.waitingText, { color: colors.text }]}>
                호스트가 경기를 시작하기를 기다리는 중...
              </Text>
            </View>
          )}

          {!currentRoom.guestId && (
            <View style={[styles.waitingContainer, { backgroundColor: colors.surface }]}>
              <FontAwesome name="user-plus" size={24} color={colors.tint} />
              <Text style={[styles.waitingText, { color: colors.text }]}>
                상대방이 입장하기를 기다리는 중...
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  roomCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
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
  roomInfoSection: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    minWidth: 60,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  inviteCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  inviteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  inviteSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  inviteCodeContainer: {
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    minWidth: 200,
    alignItems: 'center',
  },
  inviteCode: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 6,
  },
  inviteActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  inviteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  inviteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  playersCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  playersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  playersContainer: {
    alignItems: 'center',
    gap: 20,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    width: '100%',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  playerRole: {
    fontSize: 12,
    fontWeight: '500',
  },
  playerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  playerBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  vsText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionContainer: {
    marginTop: 20,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  waitingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 12,
    gap: 12,
  },
  waitingText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});