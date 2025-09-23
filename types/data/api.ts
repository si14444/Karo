// API 및 CRUD 작업 타입 정의
import {
  FirebaseCreateInput,
  FirebaseUpdateInput,
  CollectionName
} from './firebase';
import {
  User,
  FirebaseUser,
  UserProfileUpdate,
  UserStats,
  FirebaseFriendship
} from './user';
import {
  Match,
  FirebaseMatch,
  GameRoom,
  FirebaseGameRoom,
  LiveMatch,
  FirebaseLiveMatch,
  MatchResult,
  FirebaseMatchResult,
  PendingMatch,
  FirebasePendingMatch
} from './match';
import {
  Notification,
  FirebaseNotification,
  CreateNotificationData
} from './notification';

// === API 응답 타입 ===
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// === 사용자 API 타입 ===
export type CreateUserInput = FirebaseCreateInput<FirebaseUser>;
export type UpdateUserInput = UserProfileUpdate;

export interface UserApiOperations {
  create: (data: CreateUserInput) => Promise<ApiResponse<User>>;
  getById: (id: string) => Promise<ApiResponse<User>>;
  getByUid: (uid: string) => Promise<ApiResponse<User>>;
  update: (id: string, data: UpdateUserInput) => Promise<ApiResponse<User>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
  getStats: (id: string) => Promise<ApiResponse<UserStats>>;
  getRankings: (limit?: number) => Promise<ApiResponse<User[]>>;
  searchByNickname: (nickname: string) => Promise<ApiResponse<User[]>>;
}

// === 친구 관계 API 타입 ===
export type CreateFriendshipInput = Omit<FirebaseFriendship, 'id' | 'createdAt' | 'updatedAt'>;

export interface FriendshipApiOperations {
  sendRequest: (addresseeId: string) => Promise<ApiResponse<void>>;
  acceptRequest: (requestId: string) => Promise<ApiResponse<void>>;
  rejectRequest: (requestId: string) => Promise<ApiResponse<void>>;
  removeFriend: (friendId: string) => Promise<ApiResponse<void>>;
  getFriends: (userId: string) => Promise<ApiResponse<User[]>>;
  getPendingRequests: (userId: string) => Promise<ApiResponse<FirebaseFriendship[]>>;
}

// === 게임룸 API 타입 ===
export type CreateGameRoomInput = Omit<FirebaseGameRoom, 'id' | 'createdAt' | 'updatedAt' | 'inviteCode' | 'expiresAt'>;
export type UpdateGameRoomInput = Partial<Pick<FirebaseGameRoom, 'status' | 'guestId'>>;

export interface GameRoomApiOperations {
  create: (data: CreateGameRoomInput) => Promise<ApiResponse<GameRoom>>;
  getById: (id: string) => Promise<ApiResponse<GameRoom>>;
  getByInviteCode: (inviteCode: string) => Promise<ApiResponse<GameRoom>>;
  join: (inviteCode: string, guestId: string) => Promise<ApiResponse<GameRoom>>;
  leave: (roomId: string, userId: string) => Promise<ApiResponse<void>>;
  update: (id: string, data: UpdateGameRoomInput) => Promise<ApiResponse<GameRoom>>;
  getUserRooms: (userId: string) => Promise<ApiResponse<GameRoom[]>>;
  cleanupExpired: () => Promise<ApiResponse<number>>; // 만료된 룸 정리
}

// === 라이브 매치 API 타입 ===
export type CreateLiveMatchInput = Omit<FirebaseLiveMatch, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateLiveMatchInput = Partial<Pick<FirebaseLiveMatch, 'status' | 'currentScore1' | 'currentScore2' | 'endTime'>>;

export interface LiveMatchApiOperations {
  create: (data: CreateLiveMatchInput) => Promise<ApiResponse<LiveMatch>>;
  getById: (id: string) => Promise<ApiResponse<LiveMatch>>;
  update: (id: string, data: UpdateLiveMatchInput) => Promise<ApiResponse<LiveMatch>>;
  getUserActiveMatches: (userId: string) => Promise<ApiResponse<LiveMatch[]>>;
  endMatch: (id: string) => Promise<ApiResponse<void>>;
}

// === 매치 결과 API 타입 ===
export type CreateMatchResultInput = Omit<FirebaseMatchResult, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateMatchResultInput = Partial<Pick<FirebaseMatchResult, 'confirmedBy' | 'isDisputed' | 'finalizedAt'>>;

export interface MatchResultApiOperations {
  create: (data: CreateMatchResultInput) => Promise<ApiResponse<MatchResult>>;
  getById: (id: string) => Promise<ApiResponse<MatchResult>>;
  confirm: (id: string, userId: string) => Promise<ApiResponse<MatchResult>>;
  dispute: (id: string, userId: string, reason: string) => Promise<ApiResponse<MatchResult>>;
  finalize: (id: string) => Promise<ApiResponse<Match>>; // 최종 매치로 변환
  getPendingConfirmations: (userId: string) => Promise<ApiResponse<MatchResult[]>>;
}

// === 매치 API 타입 ===
export type CreateMatchInput = Omit<FirebaseMatch, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateMatchInput = Partial<Pick<FirebaseMatch, 'isConfirmed' | 'confirmedBy'>>;

export interface MatchApiOperations {
  create: (data: CreateMatchInput) => Promise<ApiResponse<Match>>;
  getById: (id: string) => Promise<ApiResponse<Match>>;
  update: (id: string, data: UpdateMatchInput) => Promise<ApiResponse<Match>>;
  getUserMatches: (userId: string, page?: number, limit?: number) => Promise<PaginatedResponse<Match>>;
  getRecentMatches: (limit?: number) => Promise<ApiResponse<Match[]>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
}

// === 예약 매치 API 타입 ===
export type CreatePendingMatchInput = Omit<FirebasePendingMatch, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePendingMatchInput = Partial<Pick<FirebasePendingMatch, 'status' | 'confirmedBy'>>;

export interface PendingMatchApiOperations {
  create: (data: CreatePendingMatchInput) => Promise<ApiResponse<PendingMatch>>;
  getById: (id: string) => Promise<ApiResponse<PendingMatch>>;
  update: (id: string, data: UpdatePendingMatchInput) => Promise<ApiResponse<PendingMatch>>;
  confirm: (id: string, userId: string) => Promise<ApiResponse<PendingMatch>>;
  cancel: (id: string, userId: string) => Promise<ApiResponse<void>>;
  getUserPendingMatches: (userId: string) => Promise<ApiResponse<PendingMatch[]>>;
  convertToGameRoom: (id: string) => Promise<ApiResponse<GameRoom>>;
}

// === 알림 API 타입 ===
export type CreateNotificationInput = CreateNotificationData;

export interface NotificationApiOperations {
  create: (data: CreateNotificationInput) => Promise<ApiResponse<Notification>>;
  getById: (id: string) => Promise<ApiResponse<Notification>>;
  getUserNotifications: (userId: string, unreadOnly?: boolean) => Promise<ApiResponse<Notification[]>>;
  markAsRead: (id: string) => Promise<ApiResponse<void>>;
  markAllAsRead: (userId: string) => Promise<ApiResponse<void>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
  getUnreadCount: (userId: string) => Promise<ApiResponse<number>>;
}

// === 통합 API 타입 ===
export interface ApiOperations {
  users: UserApiOperations;
  friendships: FriendshipApiOperations;
  gameRooms: GameRoomApiOperations;
  liveMatches: LiveMatchApiOperations;
  matchResults: MatchResultApiOperations;
  matches: MatchApiOperations;
  pendingMatches: PendingMatchApiOperations;
  notifications: NotificationApiOperations;
}

// === 실시간 구독 타입 ===
export interface RealtimeSubscription {
  unsubscribe: () => void;
}

export interface RealtimeCallbacks<T> {
  onData: (data: T[]) => void;
  onError: (error: Error) => void;
}

export interface RealtimeOperations {
  subscribeToUserNotifications: (
    userId: string,
    callbacks: RealtimeCallbacks<Notification>
  ) => RealtimeSubscription;
  subscribeToGameRoom: (
    roomId: string,
    callbacks: RealtimeCallbacks<GameRoom>
  ) => RealtimeSubscription;
  subscribeToLiveMatch: (
    matchId: string,
    callbacks: RealtimeCallbacks<LiveMatch>
  ) => RealtimeSubscription;
  subscribeToUserMatches: (
    userId: string,
    callbacks: RealtimeCallbacks<Match>
  ) => RealtimeSubscription;
}