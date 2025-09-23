// Basketball Rank Match App - Type Definitions
// 기존 타입은 호환성을 위해 유지하고, 새로운 Firebase 타입은 별도 import

// Firebase 데이터 타입 (새로운 정규화된 구조)
export * from './data';

// 기존 클라이언트 타입들 (호환성 유지)
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

// 3-Stage Match Flow Types
export type MatchStatus = 'waiting' | 'in_progress' | 'finished' | 'completed' | 'disputed';

export interface GameRoom {
  id: string;
  inviteCode: string;
  hostId: string;
  guestId?: string;
  place: string;
  date: Date;
  status: 'waiting_for_guest' | 'ready' | 'cancelled';
  createdAt: Date;
  expiresAt: Date;
}

export interface LiveMatch {
  id: string;
  roomId: string;
  player1Id: string;
  player2Id: string;
  place: string;
  date: Date;
  status: MatchStatus;
  startTime?: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MatchResult {
  matchId: string;
  player1Score: number;
  player2Score: number;
  winnerId: string;
  confirmedBy: string[];
  needsConfirmation: boolean;
  createdAt: Date;
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