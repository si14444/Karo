# Firebase Firestore 데이터베이스 스키마

Firebase 연동을 위한 정규화된 데이터베이스 구조입니다.

## 컬렉션 구조

### 1. `users` - 사용자 정보

```typescript
{
  id: string (auto-generated)
  uid: string (Firebase Auth UID) - indexed
  email: string - indexed
  nickname: string - indexed
  profileImage?: string
  rankScore: number
  winCount: number
  loseCount: number
  createdAt: Timestamp
}
```

**인덱스:**

- `uid` (단일)
- `email` (단일)
- `nickname` (단일)
- `rankScore` (내림차순)
- `rankScore` (복합)

---

### 2. `gameRooms` - 게임룸 (1단계: 경기 생성)

```typescript
{
  id: string (auto-generated)
  inviteCode: string (6자리) - indexed
  hostId: string (users 컬렉션 참조)
  guestId?: string (users 컬렉션 참조)
  place: string
  gameDate: Timestamp
  status: 'waiting_for_guest' | 'ready' | 'in_progress' | 'cancelled' | 'expired'
  expiresAt: Timestamp
  maxParticipants: number (기본 2)
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**인덱스:**

- `inviteCode` (단일, 유니크)
- `hostId, status` (복합)
- `guestId, status` (복합)
- `expiresAt` (단일, TTL 인덱스)
- `status, gameDate` (복합)

---

### 4. `liveMatches` - 실시간 경기 (2단계: 경기 진행)

```typescript
{
  id: string (auto-generated)
  gameRoomId: string (gameRooms 컬렉션 참조)
  player1Id: string (users 컬렉션 참조)
  player2Id: string (users 컬렉션 참조)
  place: string
  gameDate: Timestamp
  status: 'waiting' | 'in_progress' | 'finished' | 'completed' | 'disputed' | 'cancelled'
  startTime?: Timestamp
  endTime?: Timestamp
  currentScore1?: number
  currentScore2?: number
  gameEvents?: GameEvent[]
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**인덱스:**

- `gameRoomId` (단일)
- `player1Id, status` (복합)
- `player2Id, status` (복합)
- `status, gameDate` (복합)

---

### 5. `matchResults` - 경기 결과 (3단계: 결과 확인)

```typescript
{
  id: string (auto-generated)
  liveMatchId: string (liveMatches 컬렉션 참조)
  gameRoomId: string (gameRooms 컬렉션 참조)
  player1Id: string (users 컬렉션 참조)
  player2Id: string (users 컬렉션 참조)
  player1Score: number
  player2Score: number
  winnerId: string (users 컬렉션 참조)
  reportedBy: string (users 컬렉션 참조)
  confirmedBy: string[] (users 컬렉션 참조 배열)
  needsConfirmation: boolean
  isDisputed: boolean
  finalizedAt?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**인덱스:**

- `liveMatchId` (단일)
- `player1Id, needsConfirmation` (복합)
- `player2Id, needsConfirmation` (복합)
- `finalizedAt` (단일)

---

### 6. `matches` - 확정된 경기 기록

```typescript
{
  id: string (auto-generated)
  gameDate: Timestamp
  place: string
  player1Id: string (users 컬렉션 참조)
  player2Id: string (users 컬렉션 참조)
  score1: number
  score2: number
  winnerId: string (users 컬렉션 참조)
  isConfirmed: boolean
  confirmedBy: string[] (users 컬렉션 참조 배열)
  gameRoomId?: string (원본 gameRoom 참조)
  liveMatchId?: string (원본 liveMatch 참조)
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**인덱스:**

- `player1Id, gameDate` (복합)
- `player2Id, gameDate` (복합)
- `winnerId, gameDate` (복합)
- `gameDate` (내림차순)
- `isConfirmed, gameDate` (복합)

---

### 7. `pendingMatches` - 예약된 경기

```typescript
{
  id: string (auto-generated)
  scheduledDate: Timestamp
  scheduledTime: string ("14:30" 형태)
  place: string
  player1Id: string (users 컬렉션 참조)
  player2Id: string (users 컬렉션 참조)
  status: 'pending' | 'confirmed' | 'cancelled'
  confirmedBy: string[] (users 컬렉션 참조 배열)
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**인덱스:**

- `player1Id, status` (복합)
- `player2Id, status` (복합)
- `scheduledDate, status` (복합)

---

### 8. `notifications` - 알림

```typescript
{
  id: string (auto-generated)
  recipientId: string (users 컬렉션 참조)
  senderId?: string (users 컬렉션 참조)
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  relatedMatchId?: string
  relatedGameRoomId?: string
  relatedUserId?: string
  actionData?: Record<string, any>
  expiresAt?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**인덱스:**

- `recipientId, isRead, createdAt` (복합)
- `recipientId, type, isRead` (복합)
- `expiresAt` (TTL 인덱스)

## 데이터 흐름

### 경기 생성 플로우

1. **게임룸 생성** → `gameRooms` 컬렉션
2. **초대코드 공유** → 상대방이 참여
3. **라이브 매치 시작** → `liveMatches` 컬렉션
4. **경기 결과 입력** → `matchResults` 컬렉션
5. **결과 확인** → `matches` 컬렉션에 최종 저장

### 친구 관계 플로우

1. **친구 요청** → `friendships` 컬렉션에 'pending' 상태로 생성
2. **요청 수락/거절** → status 업데이트
3. **친구 목록 조회** → 양방향 쿼리로 친구 목록 구성

### 알림 플로우

1. **이벤트 발생** → `notifications` 컬렉션에 생성
2. **실시간 구독** → 사용자별 알림 실시간 수신
3. **읽음 처리** → isRead 플래그 업데이트

## 보안 규칙 가이드라인

```javascript
// Firestore Security Rules 예시
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자는 자신의 문서만 읽기/쓰기 가능
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
    }

    // 친구 관계는 관련 사용자만 접근 가능
    match /friendships/{friendshipId} {
      allow read, write: if request.auth != null &&
        (request.auth.uid == resource.data.requesterId ||
         request.auth.uid == resource.data.addresseeId);
    }

    // 게임룸은 호스트와 게스트만 접근 가능
    match /gameRooms/{roomId} {
      allow read, write: if request.auth != null &&
        (request.auth.uid == resource.data.hostId ||
         request.auth.uid == resource.data.guestId);
    }
  }
}
```

## 쿼리 패턴 예시

### 사용자 랭킹 조회

```typescript
const rankingsQuery = query(
  collection(db, "users"),
  where("isActive", "==", true),
  orderBy("rankScore", "desc"),
  limit(50)
);
```

### 사용자 매치 히스토리

```typescript
const userMatchesQuery = query(
  collection(db, "matches"),
  where("player1Id", "==", userId),
  orderBy("gameDate", "desc"),
  limit(20)
);
```

### 미확인 알림 조회

```typescript
const unreadNotificationsQuery = query(
  collection(db, "notifications"),
  where("recipientId", "==", userId),
  where("isRead", "==", false),
  orderBy("createdAt", "desc")
);
```
