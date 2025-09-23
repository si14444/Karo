// 사용자 관련 타입 정의
import { FirebaseBaseDoc, ClientBaseDoc, FirebaseTimestamp } from './firebase';

// Firebase에 저장되는 사용자 데이터
export interface FirebaseUser extends FirebaseBaseDoc {
  uid: string; // Firebase Auth UID
  email: string;
  nickname: string;
  profileImage?: string;
  rankScore: number;
  winCount: number;
  loseCount: number;
  isActive: boolean;
  lastLoginAt: FirebaseTimestamp;
  // 친구는 별도 컬렉션으로 관리
}

// 클라이언트에서 사용하는 사용자 타입
export interface User extends ClientBaseDoc {
  uid: string;
  email: string;
  nickname: string;
  profileImage?: string;
  rankScore: number;
  winCount: number;
  loseCount: number;
  isActive: boolean;
  lastLoginAt: Date;
  friends: string[]; // 클라이언트에서 조합된 친구 목록
}

// 사용자 프로필 업데이트용 타입
export interface UserProfileUpdate {
  nickname?: string;
  profileImage?: string;
}

// 사용자 통계 타입
export interface UserStats {
  userId: string;
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  rankScore: number;
  currentStreak: number; // 연승/연패
  longestWinStreak: number;
  recentMatches: string[]; // 최근 경기 ID 목록
}

// 랭킹 표시용 타입
export interface RankingUser extends User {
  rank: number;
  previousRank?: number;
  rankChange?: 'up' | 'down' | 'same';
  stats: UserStats;
}

// 친구 관계 관리 (별도 컬렉션)
export interface FirebaseFriendship extends FirebaseBaseDoc {
  requesterId: string; // 친구 요청한 사용자
  addresseeId: string; // 친구 요청받은 사용자
  status: 'pending' | 'accepted' | 'blocked';
  acceptedAt?: FirebaseTimestamp;
}