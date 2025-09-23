// 경기 관련 타입 정의
import { FirebaseBaseDoc, ClientBaseDoc, FirebaseTimestamp } from './firebase';

// 경기 상태 타입
export type MatchStatus = 'waiting' | 'in_progress' | 'finished' | 'completed' | 'disputed' | 'cancelled';
export type GameRoomStatus = 'waiting_for_guest' | 'ready' | 'in_progress' | 'cancelled' | 'expired';

// Firebase에 저장되는 완료된 경기 데이터
export interface FirebaseMatch extends FirebaseBaseDoc {
  gameDate: FirebaseTimestamp; // 실제 경기 날짜
  place: string;
  player1Id: string;
  player2Id: string;
  score1: number;
  score2: number;
  winnerId: string;
  isConfirmed: boolean;
  confirmedBy: string[]; // 확인한 사용자 ID 목록
  gameRoomId?: string; // 원본 게임룸 ID (있는 경우)
  liveMatchId?: string; // 원본 라이브 매치 ID (있는 경우)
}

// 클라이언트에서 사용하는 경기 타입
export interface Match extends ClientBaseDoc {
  gameDate: Date;
  place: string;
  player1Id: string;
  player2Id: string;
  score1: number;
  score2: number;
  winnerId: string;
  isConfirmed: boolean;
  confirmedBy: string[];
  gameRoomId?: string;
  liveMatchId?: string;
}

// Firebase에 저장되는 게임룸 (1단계: 경기 생성)
export interface FirebaseGameRoom extends FirebaseBaseDoc {
  inviteCode: string; // 6자리 초대 코드
  hostId: string;
  guestId?: string;
  place: string;
  gameDate: FirebaseTimestamp; // 예정된 경기 날짜
  status: GameRoomStatus;
  expiresAt: FirebaseTimestamp; // 24시간 후 만료
  maxParticipants: number; // 기본 2명
}

// 클라이언트에서 사용하는 게임룸 타입
export interface GameRoom extends ClientBaseDoc {
  inviteCode: string;
  hostId: string;
  guestId?: string;
  place: string;
  gameDate: Date;
  status: GameRoomStatus;
  expiresAt: Date;
  maxParticipants: number;
}

// Firebase에 저장되는 라이브 매치 (2단계: 실시간 경기)
export interface FirebaseLiveMatch extends FirebaseBaseDoc {
  gameRoomId: string; // 원본 게임룸 ID
  player1Id: string;
  player2Id: string;
  place: string;
  gameDate: FirebaseTimestamp;
  status: MatchStatus;
  startTime?: FirebaseTimestamp;
  endTime?: FirebaseTimestamp;
  // 실시간 점수 (선택사항)
  currentScore1?: number;
  currentScore2?: number;
  // 경기 진행 상황
  gameEvents?: GameEvent[];
}

// 클라이언트에서 사용하는 라이브 매치 타입
export interface LiveMatch extends ClientBaseDoc {
  gameRoomId: string;
  player1Id: string;
  player2Id: string;
  place: string;
  gameDate: Date;
  status: MatchStatus;
  startTime?: Date;
  endTime?: Date;
  currentScore1?: number;
  currentScore2?: number;
  gameEvents?: GameEvent[];
}

// Firebase에 저장되는 경기 결과 (3단계: 결과 확인)
export interface FirebaseMatchResult extends FirebaseBaseDoc {
  liveMatchId: string; // 원본 라이브 매치 ID
  gameRoomId: string; // 원본 게임룸 ID
  player1Id: string;
  player2Id: string;
  player1Score: number;
  player2Score: number;
  winnerId: string;
  reportedBy: string; // 결과를 보고한 사용자
  confirmedBy: string[]; // 확인한 사용자들
  needsConfirmation: boolean; // 상대방 확인 필요 여부
  isDisputed: boolean; // 이의제기 여부
  finalizedAt?: FirebaseTimestamp; // 최종 확정 시간
}

// 클라이언트에서 사용하는 경기 결과 타입
export interface MatchResult extends ClientBaseDoc {
  liveMatchId: string;
  gameRoomId: string;
  player1Id: string;
  player2Id: string;
  player1Score: number;
  player2Score: number;
  winnerId: string;
  reportedBy: string;
  confirmedBy: string[];
  needsConfirmation: boolean;
  isDisputed: boolean;
  finalizedAt?: Date;
}

// 경기 이벤트 (선택사항 - 향후 확장)
export interface GameEvent {
  id: string;
  type: 'score' | 'timeout' | 'foul' | 'substitution';
  playerId: string;
  timestamp: FirebaseTimestamp;
  description: string;
  score?: {
    player1: number;
    player2: number;
  };
}

// 예약 경기 (구 PendingMatch)
export interface FirebasePendingMatch extends FirebaseBaseDoc {
  scheduledDate: FirebaseTimestamp;
  scheduledTime: string; // "14:30" 형태
  place: string;
  player1Id: string;
  player2Id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  confirmedBy: string[]; // 확인한 사용자들
}

// 클라이언트용 예약 경기
export interface PendingMatch extends ClientBaseDoc {
  scheduledDate: Date;
  scheduledTime: string;
  place: string;
  player1Id: string;
  player2Id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  confirmedBy: string[];
}