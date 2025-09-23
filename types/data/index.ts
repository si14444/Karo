// Firebase 데이터 타입 통합 export
// Firebase 연동을 위한 정규화된 데이터 타입 시스템

// Firebase 기본 타입
export * from './firebase';

// 사용자 관련 타입
export * from './user';

// 경기 관련 타입
export * from './match';

// 알림 관련 타입
export * from './notification';

// API 및 CRUD 타입
export * from './api';

// === 타입 변환 유틸리티 ===
import { FirebaseTimestamp } from './firebase';

// Firebase Timestamp를 Date로 변환
export const timestampToDate = (timestamp: FirebaseTimestamp): Date => {
  return timestamp.toDate();
};

// Date를 Firebase Timestamp로 변환 (Firebase 설치 후 구현)
export const dateToTimestamp = (date: Date): FirebaseTimestamp => {
  // Firebase 설치 후 Timestamp.fromDate(date)로 교체
  return {
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: (date.getTime() % 1000) * 1000000,
    toDate: () => date
  };
};

// Firebase 문서를 클라이언트 타입으로 변환하는 헬퍼
export const convertFirebaseDoc = <TFirebase, TClient>(
  firebaseDoc: TFirebase & { createdAt: FirebaseTimestamp; updatedAt: FirebaseTimestamp },
  convertTimestamps = true
): TClient => {
  if (!convertTimestamps) {
    return firebaseDoc as unknown as TClient;
  }

  const converted = { ...firebaseDoc } as any;

  // Timestamp 필드들을 Date로 변환
  Object.keys(converted).forEach(key => {
    const value = converted[key];
    if (value && typeof value === 'object' && 'toDate' in value) {
      converted[key] = value.toDate();
    }
  });

  return converted as TClient;
};

// 클라이언트 타입을 Firebase 타입으로 변환하는 헬퍼
export const convertClientDoc = <TClient, TFirebase>(
  clientDoc: TClient & { createdAt: Date; updatedAt: Date },
  excludeId = true
): Omit<TFirebase, 'id'> => {
  const converted = { ...clientDoc } as any;

  // Date 필드들을 Timestamp로 변환
  Object.keys(converted).forEach(key => {
    const value = converted[key];
    if (value instanceof Date) {
      converted[key] = dateToTimestamp(value);
    }
  });

  // ID 제거 (Firebase에서 자동 생성)
  if (excludeId && 'id' in converted) {
    delete converted.id;
  }

  return converted;
};