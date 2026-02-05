import { type ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { isTokenValid } from '@/utils/jwt';

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

interface ProtectedRouteProps {
  children: ReactElement;
}

export function ProtectedRoute({ children }: ProtectedRouteProps): ReactElement {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const storedToken = getStoredToken();
  const hasValidToken = !!(storedToken && isTokenValid(storedToken));
  const isAuthenticated = !!(user && (token || hasValidToken));

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
}

