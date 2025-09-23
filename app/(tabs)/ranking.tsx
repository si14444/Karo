import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Text, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { User } from '@/types';

export default function RankingScreen() {
  const { state, getRankings } = useApp();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'all' | 'friends'>('all');

  const allRankings = getRankings();
  const friendsRankings = allRankings.filter(user =>
    state.currentUser?.friends.includes(user.id) || user.id === state.currentUser?.id
  );

  const displayRankings = activeTab === 'all' ? allRankings : friendsRankings;

  // 탭 바 높이만큼 하단 패딩 추가 (좀 더 낮게)
  const tabBarHeight = Platform.OS === 'android' ? 85 + insets.bottom : 80 + insets.bottom;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return { name: 'trophy', color: colors.tint };
      case 2:
        return { name: 'trophy', color: colors.secondary };
      case 3:
        return { name: 'trophy', color: colors.warning };
      default:
        return { name: 'user', color: colors.text };
    }
  };

  const getWinRate = (user: User) => {
    const totalGames = user.winCount + user.loseCount;
    return totalGames > 0 ? ((user.winCount / totalGames) * 100).toFixed(1) : '0.0';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tab Selector */}
      <View style={[styles.tabContainer, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: insets.top + 20 }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'all' && { backgroundColor: colors.tint }
          ]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'all' ? colors.background : colors.text }
          ]}>
            전체 랭킹
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'friends' && { backgroundColor: colors.tint }
          ]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'friends' ? colors.background : colors.text }
          ]}>
            친구 랭킹
          </Text>
        </TouchableOpacity>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.tint }]}>
          {activeTab === 'all' ? '전체 랭킹' : '친구 랭킹'}
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.text }]}>
          총 {displayRankings.length}명
        </Text>
      </View>

      {/* Rankings List */}
      <ScrollView
        style={styles.rankingList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
      >
        {displayRankings.map((user, index) => {
          const rank = index + 1;
          const rankIcon = getRankIcon(rank);
          const isCurrentUser = user.id === state.currentUser?.id;

          return (
            <View
              key={user.id}
              style={[
                styles.rankItem,
                {
                  backgroundColor: isCurrentUser ? colors.surface : 'transparent',
                  borderColor: isCurrentUser ? colors.tint : colors.border,
                  borderWidth: isCurrentUser ? 2 : 1,
                }
              ]}
            >
              <View style={styles.rankLeft}>
                <View style={styles.rankPosition}>
                  {rank <= 3 ? (
                    <FontAwesome name={rankIcon.name as any} size={24} color={rankIcon.color} />
                  ) : (
                    <Text style={[styles.rankNumber, { color: colors.text }]}>
                      {rank}
                    </Text>
                  )}
                </View>

                <View style={styles.userInfo}>
                  <View style={styles.nicknameRow}>
                    <Text style={[
                      styles.nickname,
                      { color: isCurrentUser ? colors.tint : colors.text }
                    ]}>
                      {user.nickname}
                    </Text>
                    {isCurrentUser && (
                      <View style={[styles.youBadge, { backgroundColor: colors.tint }]}>
                        <Text style={[styles.youText, { color: colors.background }]}>
                          나
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.record, { color: colors.tabIconDefault }]}>
                    {user.winCount}승 {user.loseCount}패 ({getWinRate(user)}%)
                  </Text>
                </View>
              </View>

              <View style={styles.rankRight}>
                <Text style={[styles.score, { color: colors.secondary }]}>
                  {user.rankScore}
                </Text>
                <Text style={[styles.scoreLabel, { color: colors.text }]}>
                  점수
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {displayRankings.length === 0 && (
        <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
          <FontAwesome name="users" size={48} color={colors.tabIconDefault} />
          <Text style={[styles.emptyText, { color: colors.text }]}>
            {activeTab === 'all' ? '등록된 사용자가 없습니다' : '친구가 없습니다'}
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>
            {activeTab === 'all' ? '첫 번째 플레이어가 되어보세요!' : '친구를 추가해보세요!'}
          </Text>
        </View>
      )}
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
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  rankingList: {
    flex: 1,
  },
  rankItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  rankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankPosition: {
    width: 40,
    alignItems: 'center',
    marginRight: 16,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  nicknameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nickname: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  youBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  youText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  record: {
    fontSize: 12,
  },
  rankRight: {
    alignItems: 'center',
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  scoreLabel: {
    fontSize: 10,
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
});