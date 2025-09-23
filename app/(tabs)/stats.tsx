import React, { useState } from 'react';
import { StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { User, Match } from '@/types';
import TabSelector from '@/components/ui/TabSelector';
import EmptyState from '@/components/ui/EmptyState';
import Card from '@/components/ui/Card';
import StatItem from '@/components/ui/StatItem';
import { useSafeAreaContainer } from '@/hooks/useSafeAreaContainer';
import { useUserData } from '@/hooks/useUserData';

const { width } = Dimensions.get('window');

interface MonthlyStats {
  month: string;
  wins: number;
  losses: number;
  winRate: number;
  totalMatches: number;
}

interface OpponentStats {
  opponent: User;
  wins: number;
  losses: number;
  winRate: number;
  totalMatches: number;
  lastMatch?: Match;
}

export default function StatsScreen() {
  const { state, getUserStats } = useApp();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { contentContainerStyle } = useSafeAreaContainer();
  const { currentUser } = useUserData();
  const [activeTab, setActiveTab] = useState<'overview' | 'monthly' | 'opponents'>('overview');

  const currentUserStats = currentUser ? getUserStats(currentUser.id) : null;

  const tabs = [
    { id: 'overview', label: '전체' },
    { id: 'monthly', label: '월별' },
    { id: 'opponents', label: '상대전적' },
  ];

  // Calculate monthly statistics
  const getMonthlyStats = (): MonthlyStats[] => {
    if (!currentUser) return [];

    const monthlyData: { [key: string]: MonthlyStats } = {};
    const userMatches = state.matches.filter(
      match => match.player1Id === currentUser.id || match.player2Id === currentUser.id
    );

    userMatches.forEach(match => {
      const monthKey = `${match.date.getFullYear()}-${(match.date.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthName = match.date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          wins: 0,
          losses: 0,
          winRate: 0,
          totalMatches: 0,
        };
      }

      monthlyData[monthKey].totalMatches++;
      if (match.winnerId === currentUser.id) {
        monthlyData[monthKey].wins++;
      } else {
        monthlyData[monthKey].losses++;
      }
    });

    // Calculate win rates
    Object.values(monthlyData).forEach(month => {
      month.winRate = month.totalMatches > 0 ? (month.wins / month.totalMatches) * 100 : 0;
    });

    return Object.values(monthlyData).sort((a, b) => b.month.localeCompare(a.month));
  };

  // Calculate opponent statistics
  const getOpponentStats = (): OpponentStats[] => {
    if (!currentUser) return [];

    const opponentData: { [key: string]: OpponentStats } = {};
    const userMatches = state.matches.filter(
      match => match.player1Id === currentUser.id || match.player2Id === currentUser.id
    );

    userMatches.forEach(match => {
      const opponentId = match.player1Id === currentUser.id ? match.player2Id : match.player1Id;
      const opponent = state.users.find(u => u.id === opponentId);

      if (!opponent) return;

      if (!opponentData[opponentId]) {
        opponentData[opponentId] = {
          opponent,
          wins: 0,
          losses: 0,
          winRate: 0,
          totalMatches: 0,
          lastMatch: match,
        };
      }

      opponentData[opponentId].totalMatches++;
      if (match.winnerId === currentUser.id) {
        opponentData[opponentId].wins++;
      } else {
        opponentData[opponentId].losses++;
      }

      // Update last match if this one is more recent
      if (!opponentData[opponentId].lastMatch || match.date > opponentData[opponentId].lastMatch.date) {
        opponentData[opponentId].lastMatch = match;
      }
    });

    // Calculate win rates
    Object.values(opponentData).forEach(opponent => {
      opponent.winRate = opponent.totalMatches > 0 ? (opponent.wins / opponent.totalMatches) * 100 : 0;
    });

    return Object.values(opponentData)
      .sort((a, b) => b.totalMatches - a.totalMatches);
  };

  const monthlyStats = getMonthlyStats();
  const opponentStats = getOpponentStats();

  // Calculate additional overview stats
  const getStreakInfo = () => {
    if (!currentUser) return { current: 0, longest: 0, type: 'none' as 'win' | 'lose' | 'none' };

    const userMatches = state.matches
      .filter(match => match.player1Id === currentUser.id || match.player2Id === currentUser.id)
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let currentStreakType: 'win' | 'lose' | 'none' = 'none';
    let tempStreak = 0;
    let lastResult: 'win' | 'lose' | null = null;

    userMatches.forEach((match, index) => {
      const isWin = match.winnerId === currentUser.id;
      const result = isWin ? 'win' : 'lose';

      if (index === 0) {
        currentStreak = 1;
        currentStreakType = result;
        tempStreak = 1;
        lastResult = result;
      } else if (result === lastResult) {
        if (index < userMatches.length - 1) tempStreak++;
        else currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
        lastResult = result;
      }
    });

    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    return { current: currentStreak, longest: longestStreak, type: currentStreakType };
  };

  const streakInfo = getStreakInfo();

  const renderProgressBar = (percentage: number, color: string) => (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBarBackground, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${percentage}%`, backgroundColor: color }
          ]}
        />
      </View>
      <Text style={[styles.progressText, { color: colors.text }]}>
        {percentage.toFixed(1)}%
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TabSelector
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as 'overview' | 'monthly' | 'opponents')}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={contentContainerStyle}
      >
        {activeTab === 'overview' && (
          <View>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: colors.tint }]}>
                전체 통계
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.text }]}>
                {currentUser?.nickname || 'Player'}님의 경기 분석
              </Text>
            </View>

            {currentUserStats ? (
              <>
                {/* Key Stats Cards */}
                <View style={styles.statsGrid}>
                  <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <FontAwesome name="trophy" size={24} color={colors.tint} />
                    <Text style={[styles.statNumber, { color: colors.tint }]}>
                      {currentUserStats.wins}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.text }]}>승리</Text>
                  </View>

                  <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <FontAwesome name="times-circle" size={24} color={colors.lose} />
                    <Text style={[styles.statNumber, { color: colors.lose }]}>
                      {currentUserStats.losses}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.text }]}>패배</Text>
                  </View>

                  <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <FontAwesome name="percent" size={24} color={colors.secondary} />
                    <Text style={[styles.statNumber, { color: colors.secondary }]}>
                      {currentUserStats.winRate.toFixed(1)}%
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.text }]}>승률</Text>
                  </View>

                  <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <FontAwesome name="star" size={24} color={colors.warning} />
                    <Text style={[styles.statNumber, { color: colors.warning }]}>
                      {currentUserStats.rankScore}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.text }]}>점수</Text>
                  </View>
                </View>

                {/* Win Rate Progress */}
                <View style={[styles.progressCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.cardTitle, { color: colors.tint }]}>승률 분석</Text>
                  {renderProgressBar(currentUserStats.winRate, colors.tint)}
                  <View style={styles.progressDetails}>
                    <Text style={[styles.progressDetailText, { color: colors.text }]}>
                      총 {currentUserStats.totalMatches}경기 중 {currentUserStats.wins}승 {currentUserStats.losses}패
                    </Text>
                  </View>
                </View>

                {/* Streak Information */}
                <View style={[styles.streakCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.cardTitle, { color: colors.secondary }]}>연승/연패 기록</Text>
                  <View style={styles.streakInfo}>
                    <View style={styles.streakItem}>
                      <FontAwesome
                        name={streakInfo.type === 'win' ? 'arrow-up' : 'arrow-down'}
                        size={20}
                        color={streakInfo.type === 'win' ? colors.win : colors.lose}
                      />
                      <Text style={[styles.streakNumber, {
                        color: streakInfo.type === 'win' ? colors.win : colors.lose
                      }]}>
                        {streakInfo.current}
                      </Text>
                      <Text style={[styles.streakLabel, { color: colors.text }]}>
                        현재 {streakInfo.type === 'win' ? '연승' : '연패'}
                      </Text>
                    </View>
                    <View style={styles.streakItem}>
                      <FontAwesome name="fire" size={20} color={colors.warning} />
                      <Text style={[styles.streakNumber, { color: colors.warning }]}>
                        {streakInfo.longest}
                      </Text>
                      <Text style={[styles.streakLabel, { color: colors.text }]}>
                        최고 기록
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            ) : (
              <EmptyState
                icon="bar-chart"
                title="아직 경기 기록이 없습니다"
                subtitle="첫 경기를 시작해보세요!"
              />
            )}
          </View>
        )}

        {activeTab === 'monthly' && (
          <View>
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: colors.tint }]}>
                월별 통계
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.text }]}>
                월별 경기 성과 분석
              </Text>
            </View>

            {monthlyStats.length > 0 ? (
              monthlyStats.map((month, index) => (
                <View key={index} style={[styles.monthCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.monthHeader}>
                    <Text style={[styles.monthTitle, { color: colors.text }]}>
                      {month.month}
                    </Text>
                    <Text style={[styles.monthMatches, { color: colors.secondary }]}>
                      {month.totalMatches}경기
                    </Text>
                  </View>

                  <View style={styles.monthStats}>
                    <View style={styles.monthStatItem}>
                      <Text style={[styles.monthStatNumber, { color: colors.win }]}>
                        {month.wins}
                      </Text>
                      <Text style={[styles.monthStatLabel, { color: colors.text }]}>승</Text>
                    </View>
                    <View style={styles.monthStatItem}>
                      <Text style={[styles.monthStatNumber, { color: colors.lose }]}>
                        {month.losses}
                      </Text>
                      <Text style={[styles.monthStatLabel, { color: colors.text }]}>패</Text>
                    </View>
                    <View style={styles.monthStatItem}>
                      <Text style={[styles.monthStatNumber, { color: colors.secondary }]}>
                        {month.winRate.toFixed(1)}%
                      </Text>
                      <Text style={[styles.monthStatLabel, { color: colors.text }]}>승률</Text>
                    </View>
                  </View>

                  {renderProgressBar(month.winRate, colors.tint)}
                </View>
              ))
            ) : (
              <EmptyState
                icon="calendar"
                title="월별 데이터가 없습니다"
                subtitle="경기를 시작하면 월별 통계를 볼 수 있습니다"
              />
            )}
          </View>
        )}

        {activeTab === 'opponents' && (
          <View>
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: colors.tint }]}>
                상대 전적
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.text }]}>
                상대별 경기 분석
              </Text>
            </View>

            {opponentStats.length > 0 ? (
              opponentStats.map((opponent, index) => (
                <View key={opponent.opponent.id} style={[styles.opponentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.opponentHeader}>
                    <View style={styles.opponentInfo}>
                      <Text style={[styles.opponentName, { color: colors.text }]}>
                        {opponent.opponent.nickname}
                      </Text>
                      <Text style={[styles.opponentRank, { color: colors.secondary }]}>
                        랭킹 점수: {opponent.opponent.rankScore}점
                      </Text>
                    </View>
                    <View style={styles.opponentRecord}>
                      <Text style={[styles.opponentWinRate, {
                        color: opponent.winRate >= 50 ? colors.win : colors.lose
                      }]}>
                        {opponent.winRate.toFixed(1)}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.opponentStats}>
                    <View style={styles.opponentStatItem}>
                      <Text style={[styles.opponentStatNumber, { color: colors.win }]}>
                        {opponent.wins}
                      </Text>
                      <Text style={[styles.opponentStatLabel, { color: colors.text }]}>승</Text>
                    </View>
                    <View style={styles.opponentStatItem}>
                      <Text style={[styles.opponentStatNumber, { color: colors.lose }]}>
                        {opponent.losses}
                      </Text>
                      <Text style={[styles.opponentStatLabel, { color: colors.text }]}>패</Text>
                    </View>
                    <View style={styles.opponentStatItem}>
                      <Text style={[styles.opponentStatNumber, { color: colors.secondary }]}>
                        {opponent.totalMatches}
                      </Text>
                      <Text style={[styles.opponentStatLabel, { color: colors.text }]}>총경기</Text>
                    </View>
                  </View>

                  {opponent.lastMatch && (
                    <View style={styles.lastMatchInfo}>
                      <Text style={[styles.lastMatchLabel, { color: colors.tabIconDefault }]}>
                        최근 경기: {opponent.lastMatch.date.toLocaleDateString('ko-KR')}
                      </Text>
                      <Text style={[styles.lastMatchScore, { color: colors.text }]}>
                        {opponent.lastMatch.score1} : {opponent.lastMatch.score2}
                      </Text>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <EmptyState
                icon="users"
                title="상대 전적이 없습니다"
                subtitle="다른 플레이어와 경기해보세요!"
              />
            )}
          </View>
        )}
      </ScrollView>
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
  header: {
    marginBottom: 24,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: (width - 48) / 2,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 40,
  },
  progressDetails: {
    marginTop: 8,
  },
  progressDetailText: {
    fontSize: 14,
  },
  streakCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  streakInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  streakItem: {
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  monthCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  monthMatches: {
    fontSize: 14,
    fontWeight: '600',
  },
  monthStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  monthStatItem: {
    alignItems: 'center',
  },
  monthStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  monthStatLabel: {
    fontSize: 12,
  },
  opponentCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  opponentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  opponentInfo: {
    flex: 1,
  },
  opponentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  opponentRank: {
    fontSize: 12,
  },
  opponentRecord: {
    alignItems: 'center',
  },
  opponentWinRate: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  opponentStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  opponentStatItem: {
    alignItems: 'center',
  },
  opponentStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  opponentStatLabel: {
    fontSize: 12,
  },
  lastMatchInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  lastMatchLabel: {
    fontSize: 12,
  },
  lastMatchScore: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});