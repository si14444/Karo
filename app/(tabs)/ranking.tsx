import React, { useState } from 'react';
import { StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { User } from '@/types';
import TabSelector from '@/components/ui/TabSelector';
import EmptyState from '@/components/ui/EmptyState';
import { useSafeAreaContainer } from '@/hooks/useSafeAreaContainer';
import { useUserData } from '@/hooks/useUserData';

export default function RankingScreen() {
  const { state, getRankings } = useApp();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { contentContainerStyle } = useSafeAreaContainer();
  const { currentUser } = useUserData();
  const [activeTab, setActiveTab] = useState<'all' | 'friends'>('all');

  const allRankings = getRankings();
  const friendsRankings = allRankings.filter(user =>
    currentUser?.friends.includes(user.id) || user.id === currentUser?.id
  );

  const displayRankings = activeTab === 'all' ? allRankings : friendsRankings;

  const tabs = [
    { id: 'all', label: '전체 랭킹' },
    { id: 'friends', label: '친구 랭킹' },
  ];

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
      <TabSelector
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as 'all' | 'friends')}
      />

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
        contentContainerStyle={contentContainerStyle}
      >
        {displayRankings.map((user, index) => {
          const rank = index + 1;
          const rankIcon = getRankIcon(rank);
          const isCurrentUser = user.id === currentUser?.id;

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
        <EmptyState
          icon="users"
          title={activeTab === 'all' ? '등록된 사용자가 없습니다' : '친구가 없습니다'}
          subtitle={activeTab === 'all' ? '첫 번째 플레이어가 되어보세요!' : '친구를 추가해보세요!'}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
});