// 알림 관련 타입 정의
import { FirebaseBaseDoc, ClientBaseDoc, FirebaseTimestamp } from './firebase';

// 알림 타입
export type NotificationType =
  | 'match_invitation' // 경기 초대
  | 'match_request_confirmed' // 경기 요청 확인
  | 'match_result_needs_confirmation' // 경기 결과 확인 필요
  | 'match_result_confirmed' // 경기 결과 확인됨
  | 'match_disputed' // 경기 결과 이의제기
  | 'friend_request' // 친구 요청
  | 'friend_request_accepted' // 친구 요청 수락
  | 'rank_updated' // 랭크 업데이트
  | 'achievement_unlocked'; // 업적 달성

// Firebase에 저장되는 알림
export interface FirebaseNotification extends FirebaseBaseDoc {
  recipientId: string; // 알림을 받을 사용자
  senderId?: string; // 알림을 보낸 사용자 (시스템 알림의 경우 null)
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  // 관련 데이터 ID들
  relatedMatchId?: string;
  relatedGameRoomId?: string;
  relatedUserId?: string;
  // 알림 액션 데이터
  actionData?: Record<string, any>;
  expiresAt?: FirebaseTimestamp; // 만료 시간 (선택사항)
}

// 클라이언트용 알림
export interface Notification extends ClientBaseDoc {
  recipientId: string;
  senderId?: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedMatchId?: string;
  relatedGameRoomId?: string;
  relatedUserId?: string;
  actionData?: Record<string, any>;
  expiresAt?: Date;
}

// 알림 생성용 타입
export interface CreateNotificationData {
  recipientId: string;
  senderId?: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedMatchId?: string;
  relatedGameRoomId?: string;
  relatedUserId?: string;
  actionData?: Record<string, any>;
  expiresAt?: Date;
}