import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Text, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { state, getUserStats } = useApp();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const userStats = state.currentUser ? getUserStats(state.currentUser.id) : null;
  const recentMatches = state.matches.slice(-3).reverse();

  // 탭 바 높이만큼 하단 패딩 추가 (좀 더 낮게)
  const tabBarHeight = Platform.OS === 'android' ? 85 + insets.bottom : 80 + insets.bottom;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: tabBarHeight + 20, paddingTop: insets.top + 20 }}
    >
      {/* User Rank Card */}
      <View style={[styles.rankCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.rankHeader}>
          <Text style={[styles.greeting, { color: colors.text }]}>
            안녕하세요, {state.currentUser?.nickname || 'Player'}님!
          </Text>
          <FontAwesome name="circle" size={24} color={colors.tint} />
        </View>

        <View style={styles.rankContent}>
          <View style={styles.rankScore}>
            <Text style={[styles.rankLabel, { color: colors.text }]}>현재 랭크 점수</Text>
            <Text style={[styles.rankValue, { color: colors.tint }]}>
              {state.currentUser?.rankScore || 0}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.win }]}>
                {userStats?.wins || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>승</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.lose }]}>
                {userStats?.losses || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>패</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.secondary }]}>
                {userStats ? userStats.winRate.toFixed(1) : 0}%
              </Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>승률</Text>
            </View>
          </View>
        </View>
      </View>


      {/* Recent Matches */}
      <View style={styles.recentContainer}>
        <Text style={[styles.sectionTitle, { color: colors.tint }]}>최근 경기</Text>
        {recentMatches.length > 0 ? (
          recentMatches.map((match) => (
            <View key={match.id} style={[styles.matchCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.matchHeader}>
                <Text style={[styles.matchDate, { color: colors.text }]}>
                  {match.date.toLocaleDateString('ko-KR')}
                </Text>
                <View style={[styles.resultBadge, {
                  backgroundColor: match.winnerId === state.currentUser?.id ? colors.win : colors.lose
                }]}>
                  <Text style={[styles.resultText, { color: colors.background }]}>
                    {match.winnerId === state.currentUser?.id ? '승' : '패'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.matchPlace, { color: colors.text }]}>{match.place}</Text>
              <Text style={[styles.matchScore, { color: colors.secondary }]}>
                {match.score1} : {match.score2}
              </Text>
            </View>
          ))
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <FontAwesome name="calendar-o" size={48} color={colors.tabIconDefault} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              아직 경기 기록이 없습니다
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>
              첫 경기를 등록해보세요!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  rankCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  rankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
  },
  rankContent: {
    alignItems: 'center',
  },
  rankScore: {
    alignItems: 'center',
    marginBottom: 20,
  },
  rankLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  rankValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 6,
    borderWidth: 2,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  recentContainer: {
    marginBottom: 24,
  },
  matchCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  matchPlace: {
    fontSize: 14,
    marginBottom: 4,
  },
  matchScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
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
