import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getUserFromToken, isTokenValid } from '@/utils/jwt';

const AUTH_SYNC_CHANNEL = 'auth-sync';

interface User {
  id: number;
  email: string;
  name?: string;
}

interface Branch {
  id: string;
  name: string;
  code?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  branch: Branch | null;
  rememberMe: boolean | null;
  setAuth: (user: User, token: string, branch: Branch | null, rememberMe: boolean) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  init: () => void;
}

let pendingSessionClearTimeout: ReturnType<typeof setTimeout> | null = null;

function clearPendingSessionClear(): void {
  if (pendingSessionClearTimeout) {
    clearTimeout(pendingSessionClearTimeout);
    pendingSessionClearTimeout = null;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      branch: null,
      rememberMe: null,
      setAuth: (user, token, branch, rememberMe) => {
        if (rememberMe) {
          localStorage.setItem('access_token', token);
          sessionStorage.removeItem('access_token');
        } else {
          sessionStorage.setItem('access_token', token);
          localStorage.removeItem('access_token');
          try {
            new BroadcastChannel(AUTH_SYNC_CHANNEL).postMessage({ type: 'auth:token', token });
          } catch {
            //
          }
        }
        set({ user, token, branch, rememberMe });
      },
      logout: () => {
        clearPendingSessionClear();
        localStorage.removeItem('access_token');
        sessionStorage.removeItem('access_token');
        set({ user: null, token: null, branch: null, rememberMe: null });
      },
      isAuthenticated: () => {
        const state = get();
        const storedToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        if (!storedToken || !isTokenValid(storedToken)) {
          return false;
        }
        if (!state.user) {
          const user = getUserFromToken(storedToken);
          if (user) {
            set({ user, token: storedToken });
            return true;
          }
          return false;
        }
        return true;
      },
      init: () => {
        const storedToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        if (storedToken && isTokenValid(storedToken)) {
          clearPendingSessionClear();
          const state = get();
          if (!state.token || !state.user) {
            const user = getUserFromToken(storedToken);
            if (user) {
              set({ user, token: storedToken });
            } else {
              set({ token: storedToken });
            }
          }
          return;
        }
        const state = get();
        if (state.rememberMe === false && (state.user ?? state.branch)) {
          try {
            new BroadcastChannel(AUTH_SYNC_CHANNEL).postMessage({ type: 'auth:requestToken' });
            pendingSessionClearTimeout = setTimeout(() => {
              pendingSessionClearTimeout = null;
              useAuthStore.setState({ user: null, token: null, branch: null, rememberMe: null });
            }, 2000);
          } catch {
            set({ user: null, token: null, branch: null });
          }
          return;
        }
        clearPendingSessionClear();
        set({ user: null, token: null, branch: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, branch: state.branch, rememberMe: state.rememberMe }),
    }
  )
);

try {
  const channel = new BroadcastChannel(AUTH_SYNC_CHANNEL);
  channel.onmessage = (e: MessageEvent<{ type: string; token?: string }>) => {
    if (e.data?.type === 'auth:requestToken') {
      const token = sessionStorage.getItem('access_token');
      if (token) {
        channel.postMessage({ type: 'auth:token', token });
      }
      return;
    }
    if (e.data?.type === 'auth:token' && e.data.token && isTokenValid(e.data.token)) {
      clearPendingSessionClear();
      sessionStorage.setItem('access_token', e.data.token);
      const user = getUserFromToken(e.data.token);
      const state = useAuthStore.getState();
      useAuthStore.setState({
        token: e.data.token,
        user: user ?? state.user,
      });
    }
  };
} catch {
  //
}

