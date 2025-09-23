import React from 'react';
import { StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import Card from '@/components/ui/Card';
import StatItem from '@/components/ui/StatItem';
import EmptyState from '@/components/ui/EmptyState';
import { useSafeAreaContainer } from '@/hooks/useSafeAreaContainer';
import { useUserData } from '@/hooks/useUserData';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { state, getUserStats } = useApp();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { contentContainerStyle } = useSafeAreaContainer();
  const { currentUser } = useUserData();

  const userStats = currentUser ? getUserStats(currentUser.id) : null;
  const recentMatches = state.matches.slice(-3).reverse();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={contentContainerStyle}
    >
      {/* User Rank Card */}
      <Card variant="large">
        <View style={styles.rankHeader}>
          <Text style={[styles.greeting, { color: colors.text }]}>
            안녕하세요, {currentUser?.nickname || 'Player'}님!
          </Text>
          <FontAwesome name="circle" size={24} color={colors.tint} />
        </View>

        <View style={styles.rankContent}>
          <View style={styles.rankScore}>
            <Text style={[styles.rankLabel, { color: colors.text }]}>현재 랭크 점수</Text>
            <Text style={[styles.rankValue, { color: colors.tint }]}>
              {currentUser?.rankScore || 0}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <StatItem
              label="승"
              value={userStats?.wins || 0}
              color={colors.win}
              size="medium"
            />
            <StatItem
              label="패"
              value={userStats?.losses || 0}
              color={colors.lose}
              size="medium"
            />
            <StatItem
              label="승률"
              value={`${userStats ? userStats.winRate.toFixed(1) : 0}%`}
              color={colors.secondary}
              size="medium"
            />
          </View>
        </View>
      </Card>


      {/* Recent Matches */}
      <View style={styles.recentContainer}>
        <Text style={[styles.sectionTitle, { color: colors.tint }]}>최근 경기</Text>
        {recentMatches.length > 0 ? (
          recentMatches.map((match) => (
            <Card key={match.id} variant="surface">
              <View style={styles.matchHeader}>
                <Text style={[styles.matchDate, { color: colors.text }]}>
                  {match.date.toLocaleDateString('ko-KR')}
                </Text>
                <View style={[styles.resultBadge, {
                  backgroundColor: match.winnerId === currentUser?.id ? colors.win : colors.lose
                }]}>
                  <Text style={[styles.resultText, { color: colors.background }]}>
                    {match.winnerId === currentUser?.id ? '승' : '패'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.matchPlace, { color: colors.text }]}>{match.place}</Text>
              <Text style={[styles.matchScore, { color: colors.secondary }]}>
                {match.score1} : {match.score2}
              </Text>
            </Card>
          ))
        ) : (
          <EmptyState
            icon="calendar-o"
            title="아직 경기 기록이 없습니다"
            subtitle="첫 경기를 등록해보세요!"
          />
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
});
