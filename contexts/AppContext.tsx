import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User, Match, UserStats, PendingMatch, GameRoom, LiveMatch, MatchResult } from '@/types';

// Mock data for development
const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    nickname: 'KAROPlayer',
    profileImage: '',
    rankScore: 1250,
    winCount: 15,
    loseCount: 8,
    friends: ['user-2', 'user-3'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'user-2',
    nickname: 'BasketKing',
    profileImage: '',
    rankScore: 1350,
    winCount: 22,
    loseCount: 5,
    friends: ['user-1', 'user-3'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'user-3',
    nickname: 'SlamDunk',
    profileImage: '',
    rankScore: 1180,
    winCount: 18,
    loseCount: 12,
    friends: ['user-1', 'user-2'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'user-4',
    nickname: 'CourtMaster',
    profileImage: '',
    rankScore: 1420,
    winCount: 28,
    loseCount: 3,
    friends: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'user-5',
    nickname: 'Hoops',
    profileImage: '',
    rankScore: 1100,
    winCount: 12,
    loseCount: 15,
    friends: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'user-6',
    nickname: 'FastBreak',
    profileImage: '',
    rankScore: 1300,
    winCount: 20,
    loseCount: 8,
    friends: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const MOCK_MATCHES: Match[] = [
  {
    id: 'match-1',
    date: new Date('2024-01-15'),
    place: '강남 농구장',
    player1Id: 'user-1',
    player2Id: 'user-2',
    score1: 21,
    score2: 18,
    winnerId: 'user-1',
    isConfirmed: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'match-2',
    date: new Date('2024-01-10'),
    place: '잠실 체육관',
    player1Id: 'user-1',
    player2Id: 'user-3',
    score1: 15,
    score2: 21,
    winnerId: 'user-3',
    isConfirmed: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'match-3',
    date: new Date('2024-01-12'),
    place: '올림픽공원 농구장',
    player1Id: 'user-2',
    player2Id: 'user-4',
    score1: 19,
    score2: 21,
    winnerId: 'user-4',
    isConfirmed: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

interface AppState {
  currentUser: User | null;
  matches: Match[];
  pendingMatches: PendingMatch[];
  users: User[];
  gameRooms: GameRoom[];
  liveMatches: LiveMatch[];
  matchResults: MatchResult[];
  isLoading: boolean;
}

type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'ADD_MATCH'; payload: Match }
  | { type: 'ADD_PENDING_MATCH'; payload: PendingMatch }
  | { type: 'UPDATE_MATCH'; payload: { id: string; updates: Partial<Match> } }
  | { type: 'REMOVE_PENDING_MATCH'; payload: string }
  | { type: 'CREATE_GAME_ROOM'; payload: GameRoom }
  | { type: 'JOIN_GAME_ROOM'; payload: { roomId: string; guestId: string } }
  | { type: 'UPDATE_GAME_ROOM'; payload: { id: string; updates: Partial<GameRoom> } }
  | { type: 'LEAVE_GAME_ROOM'; payload: { roomId: string; userId: string } }
  | { type: 'START_LIVE_MATCH'; payload: LiveMatch }
  | { type: 'UPDATE_LIVE_MATCH'; payload: { id: string; updates: Partial<LiveMatch> } }
  | { type: 'END_LIVE_MATCH'; payload: { matchId: string; result: MatchResult } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_INITIAL_DATA' };

const initialState: AppState = {
  currentUser: null,
  matches: [],
  pendingMatches: [],
  users: [],
  gameRooms: [],
  liveMatches: [],
  matchResults: [],
  isLoading: false,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'ADD_MATCH':
      return { ...state, matches: [...state.matches, action.payload] };
    case 'ADD_PENDING_MATCH':
      return { ...state, pendingMatches: [...state.pendingMatches, action.payload] };
    case 'UPDATE_MATCH':
      return {
        ...state,
        matches: state.matches.map(match =>
          match.id === action.payload.id
            ? { ...match, ...action.payload.updates }
            : match
        ),
      };
    case 'REMOVE_PENDING_MATCH':
      return {
        ...state,
        pendingMatches: state.pendingMatches.filter(match => match.id !== action.payload),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'CREATE_GAME_ROOM':
      return { ...state, gameRooms: [...state.gameRooms, action.payload] };
    case 'JOIN_GAME_ROOM':
      return {
        ...state,
        gameRooms: state.gameRooms.map(room =>
          room.id === action.payload.roomId
            ? { ...room, guestId: action.payload.guestId, status: 'ready' as const }
            : room
        ),
      };
    case 'UPDATE_GAME_ROOM':
      return {
        ...state,
        gameRooms: state.gameRooms.map(room =>
          room.id === action.payload.id
            ? { ...room, ...action.payload.updates }
            : room
        ),
      };
    case 'LEAVE_GAME_ROOM':
      return {
        ...state,
        gameRooms: state.gameRooms.map(room => {
          if (room.id === action.payload.roomId) {
            // If host leaves, cancel the room
            if (room.hostId === action.payload.userId) {
              return { ...room, status: 'cancelled' as const };
            }
            // If guest leaves, remove guest and set status to waiting
            if (room.guestId === action.payload.userId) {
              return {
                ...room,
                guestId: undefined,
                status: 'waiting_for_guest' as const
              };
            }
          }
          return room;
        }),
      };
    case 'START_LIVE_MATCH':
      return { ...state, liveMatches: [...state.liveMatches, action.payload] };
    case 'UPDATE_LIVE_MATCH':
      return {
        ...state,
        liveMatches: state.liveMatches.map(match =>
          match.id === action.payload.id
            ? { ...match, ...action.payload.updates }
            : match
        ),
      };
    case 'END_LIVE_MATCH':
      return {
        ...state,
        liveMatches: state.liveMatches.filter(match => match.id !== action.payload.matchId),
        matchResults: [...state.matchResults, action.payload.result],
      };
    case 'LOAD_INITIAL_DATA':
      return {
        ...state,
        currentUser: MOCK_USERS[0],
        matches: MOCK_MATCHES,
        users: MOCK_USERS,
        pendingMatches: [],
        gameRooms: [],
        liveMatches: [],
        matchResults: [],
      };
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  getUserStats: (userId: string) => UserStats;
  getRankings: () => User[];
  addMatch: (match: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>) => void;
  addPendingMatch: (match: Omit<PendingMatch, 'id' | 'createdAt'>) => void;
  convertPendingToMatch: (pendingMatchId: string, score1: number, score2: number) => void;
  // New 3-stage match flow functions
  createGameRoom: (roomData: Omit<GameRoom, 'id' | 'createdAt' | 'expiresAt'>) => GameRoom;
  joinGameRoom: (inviteCode: string, guestId: string) => GameRoom | null;
  startLiveMatch: (roomId: string) => LiveMatch | null;
  updateLiveMatch: (matchId: string, updates: Partial<LiveMatch>) => void;
  endLiveMatch: (matchId: string, result: Omit<MatchResult, 'createdAt'>) => void;
  findRoomByInviteCode: (inviteCode: string) => GameRoom | null;
  leaveGameRoom: (roomId: string, userId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  React.useEffect(() => {
    // Load initial data
    dispatch({ type: 'LOAD_INITIAL_DATA' });
  }, []);

  const getUserStats = (userId: string): UserStats => {
    const userMatches = state.matches.filter(
      match => match.player1Id === userId || match.player2Id === userId
    );

    const wins = userMatches.filter(match => match.winnerId === userId).length;
    const losses = userMatches.length - wins;
    const winRate = userMatches.length > 0 ? (wins / userMatches.length) * 100 : 0;

    const user = state.users.find(u => u.id === userId) || state.currentUser;

    return {
      totalMatches: userMatches.length,
      wins,
      losses,
      winRate,
      rankScore: user?.rankScore || 0,
      recentMatches: userMatches.slice(-5),
    };
  };

  const getRankings = (): User[] => {
    return [...state.users].sort((a, b) => b.rankScore - a.rankScore);
  };

  const addMatch = (matchData: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMatch: Match = {
      ...matchData,
      id: `match-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch({ type: 'ADD_MATCH', payload: newMatch });
  };

  const addPendingMatch = (matchData: Omit<PendingMatch, 'id' | 'createdAt'>) => {
    const newPendingMatch: PendingMatch = {
      ...matchData,
      id: `pending-${Date.now()}`,
      createdAt: new Date(),
    };
    dispatch({ type: 'ADD_PENDING_MATCH', payload: newPendingMatch });
  };

  const convertPendingToMatch = (pendingMatchId: string, score1: number, score2: number) => {
    const pendingMatch = state.pendingMatches.find(match => match.id === pendingMatchId);
    if (!pendingMatch) return;

    const winnerId = score1 > score2 ? pendingMatch.player1Id : pendingMatch.player2Id;

    const newMatch: Match = {
      id: `match-${Date.now()}`,
      date: pendingMatch.date,
      place: pendingMatch.place,
      player1Id: pendingMatch.player1Id,
      player2Id: pendingMatch.player2Id,
      score1,
      score2,
      winnerId,
      isConfirmed: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dispatch({ type: 'ADD_MATCH', payload: newMatch });
    dispatch({ type: 'REMOVE_PENDING_MATCH', payload: pendingMatchId });
  };

  // 3-stage match flow functions
  const createGameRoom = (roomData: Omit<GameRoom, 'id' | 'createdAt' | 'expiresAt'>): GameRoom => {
    const roomId = `room_${Date.now()}`;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24시간 후 만료

    const newRoom: GameRoom = {
      ...roomData,
      id: roomId,
      createdAt: new Date(),
      expiresAt,
    };

    dispatch({ type: 'CREATE_GAME_ROOM', payload: newRoom });
    return newRoom;
  };

  const joinGameRoom = (inviteCode: string, guestId: string): GameRoom | null => {
    const room = state.gameRooms.find(r => r.inviteCode === inviteCode.toUpperCase());
    if (!room || room.status !== 'waiting_for_guest') return null;

    dispatch({ type: 'JOIN_GAME_ROOM', payload: { roomId: room.id, guestId } });
    return { ...room, guestId, status: 'ready' };
  };

  const startLiveMatch = (roomId: string): LiveMatch | null => {
    const room = state.gameRooms.find(r => r.id === roomId);
    if (!room || !room.guestId || room.status !== 'ready') return null;

    const matchId = `match_${Date.now()}`;
    const newMatch: LiveMatch = {
      id: matchId,
      roomId: room.id,
      player1Id: room.hostId,
      player2Id: room.guestId,
      place: room.place,
      date: room.date,
      status: 'in_progress',
      startTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dispatch({ type: 'START_LIVE_MATCH', payload: newMatch });
    return newMatch;
  };

  const updateLiveMatch = (matchId: string, updates: Partial<LiveMatch>) => {
    dispatch({ type: 'UPDATE_LIVE_MATCH', payload: { id: matchId, updates } });
  };

  const endLiveMatch = (matchId: string, result: Omit<MatchResult, 'createdAt'>) => {
    const fullResult: MatchResult = {
      ...result,
      createdAt: new Date(),
    };

    dispatch({ type: 'END_LIVE_MATCH', payload: { matchId, result: fullResult } });

    // Convert to final match
    const liveMatch = state.liveMatches.find(m => m.id === matchId);
    if (liveMatch) {
      const finalMatch: Match = {
        id: `final_${Date.now()}`,
        date: liveMatch.date,
        place: liveMatch.place,
        player1Id: liveMatch.player1Id,
        player2Id: liveMatch.player2Id,
        score1: result.player1Score,
        score2: result.player2Score,
        winnerId: result.winnerId,
        isConfirmed: !result.needsConfirmation,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      dispatch({ type: 'ADD_MATCH', payload: finalMatch });
    }
  };

  const findRoomByInviteCode = (inviteCode: string): GameRoom | null => {
    return state.gameRooms.find(room => room.inviteCode === inviteCode.toUpperCase()) || null;
  };

  const leaveGameRoom = (roomId: string, userId: string) => {
    dispatch({ type: 'LEAVE_GAME_ROOM', payload: { roomId, userId } });
  };

  const value: AppContextType = {
    state,
    dispatch,
    getUserStats,
    getRankings,
    addMatch,
    addPendingMatch,
    convertPendingToMatch,
    createGameRoom,
    joinGameRoom,
    startLiveMatch,
    updateLiveMatch,
    endLiveMatch,
    findRoomByInviteCode,
    leaveGameRoom,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};