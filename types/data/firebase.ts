// Firebase 기본 타입 정의
// Firebase 설치 전에도 사용할 수 있도록 타입 정의

// Firebase Timestamp 타입 (설치 후 실제 Timestamp로 교체)
export interface FirebaseTimestamp {
  seconds: number;
  nanoseconds: number;
  toDate(): Date;
}

// Firebase DocumentReference 타입 (설치 후 실제 DocumentReference로 교체)
export interface FirebaseDocRef<T = any> {
  id: string;
  path: string;
}

// Firebase Document의 기본 필드
export interface FirebaseBaseDoc {
  id?: string;
  createdAt: FirebaseTimestamp;
  updatedAt: FirebaseTimestamp;
}

// 클라이언트에서 사용하는 Date 타입과 Firebase Timestamp 변환
export interface ClientBaseDoc {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Firebase에 저장할 때 사용하는 타입 (id 제외, 서버 생성)
export type FirebaseCreateInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

// Firebase에서 업데이트할 때 사용하는 타입
export type FirebaseUpdateInput<T> = Partial<Omit<T, 'id' | 'createdAt'>> & {
  updatedAt: FirebaseTimestamp;
};

// 컬렉션 이름 상수
export const COLLECTIONS = {
  USERS: 'users',
  MATCHES: 'matches',
  GAME_ROOMS: 'gameRooms',
  LIVE_MATCHES: 'liveMatches',
  MATCH_RESULTS: 'matchResults',
  PENDING_MATCHES: 'pendingMatches',
  FRIENDSHIPS: 'friendships',
  NOTIFICATIONS: 'notifications'
} as const;

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];