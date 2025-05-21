import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set) => ({
      // Initial State
      currentUser: null,
      error: null,
      loading: false,

      // Actions
      setLoading: (isLoading) => set({ loading: isLoading }),
      setCurrentUser: (user) => set({ currentUser: user, error: null }),
      setError: (errorMessage) => set({ error: errorMessage }),
      clearState: () => set({ currentUser: null, error: null, loading: false }),
    }),
    {
      name: 'user-store',
    }
  )
);

export default useUserStore;
