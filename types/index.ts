// Basketball Rank Match App - Type Definitions

export interface User {
  id: string;
  nickname: string;
  profileImage?: string;
  rankScore: number;
  winCount: number;
  loseCount: number;
  friends: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Match {
  id: string;
  date: Date;
  place: string;
  player1Id: string;
  player2Id: string;
  score1: number;
  score2: number;
  winnerId: string;
  isConfirmed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PendingMatch {
  id: string;
  date: Date;
  time: string;
  place: string;
  player1Id: string;
  player2Id: string;
  createdAt: Date;
}

export interface MatchResult {
  matchId: string;
  player1Score: number;
  player2Score: number;
  winnerId: string;
}

export interface UserStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  rankScore: number;
  recentMatches: Match[];
}

export interface RankingItem extends User {
  rank: number;
  previousRank?: number;
  rankChange?: 'up' | 'down' | 'same';
}

export type TabScreens = 'home' | 'match' | 'ranking' | 'stats' | 'profile';