import { useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';

export const useUserData = () => {
  const { state } = useApp();

  const getUserNickname = useCallback((userId: string): string => {
    const user = state.users.find(u => u.id === userId);
    return user?.nickname || state.currentUser?.nickname || 'Unknown';
  }, [state.users, state.currentUser]);

  const getCurrentUserRank = useCallback((): number => {
    if (!state.currentUser) return 0;
    return state.users
      .sort((a, b) => b.rankScore - a.rankScore)
      .findIndex(user => user.id === state.currentUser?.id) + 1;
  }, [state.users, state.currentUser]);

  const getUserById = useCallback((userId: string) => {
    return state.users.find(u => u.id === userId);
  }, [state.users]);

  return {
    getUserNickname,
    getCurrentUserRank,
    getUserById,
    currentUser: state.currentUser,
    allUsers: state.users,
  };
};