import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 사용자 인증 타입
export interface AuthUser {
  id: string;
  email?: string;
  nickname: string;
  profileImage?: string;
  provider: 'kakao' | 'guest';
  kakaoId?: string;
  isGuest: boolean;
}

// 인증 상태
interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// 인증 액션
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: AuthUser }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<AuthUser> };

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    default:
      return state;
  }
};

interface AuthContextType {
  state: AuthState;
  loginWithKakao: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = '@karo_auth_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 앱 시작 시 저장된 사용자 정보 로드
  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      // 임시로 저장된 사용자 정보를 무시하고 로그인 화면으로 보내기
      await AsyncStorage.removeItem(STORAGE_KEY);
      dispatch({ type: 'SET_LOADING', payload: false });

      // 원래 코드 (주석 처리)
      // const storedUser = await AsyncStorage.getItem(STORAGE_KEY);
      // if (storedUser) {
      //   const user = JSON.parse(storedUser);
      //   dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      // } else {
      //   dispatch({ type: 'SET_LOADING', payload: false });
      // }
    } catch (error) {
      console.error('저장된 사용자 정보 로드 실패:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveUserToStorage = async (user: AuthUser) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('사용자 정보 저장 실패:', error);
    }
  };

  const removeUserFromStorage = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('사용자 정보 삭제 실패:', error);
    }
  };

  const loginWithKakao = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // TODO: 실제 카카오 로그인 구현
      // const kakaoUser = await getKakaoUserInfo();

      // 임시 사용자 데이터 (실제 구현 시 카카오 API 응답으로 교체)
      const mockKakaoUser: AuthUser = {
        id: `kakao_${Date.now()}`,
        email: 'user@kakao.com',
        nickname: '카카오유저',
        profileImage: '',
        provider: 'kakao',
        kakaoId: '12345678',
        isGuest: false,
      };

      await saveUserToStorage(mockKakaoUser);
      dispatch({ type: 'LOGIN_SUCCESS', payload: mockKakaoUser });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const loginAsGuest = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const guestUser: AuthUser = {
        id: `guest_${Date.now()}`,
        nickname: '게스트',
        provider: 'guest',
        isGuest: true,
      };

      await saveUserToStorage(guestUser);
      dispatch({ type: 'LOGIN_SUCCESS', payload: guestUser });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // 카카오 로그아웃 (카카오 사용자인 경우)
      if (state.user?.provider === 'kakao') {
        // TODO: 카카오 로그아웃 구현
        // await kakaoLogout();
      }

      await removeUserFromStorage();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('로그아웃 실패:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateUser = (userData: Partial<AuthUser>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...userData };
      saveUserToStorage(updatedUser);
      dispatch({ type: 'UPDATE_USER', payload: userData });
    }
  };

  const value: AuthContextType = {
    state,
    loginWithKakao,
    loginAsGuest,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};