import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { authApi } from '../api/auth-api';
import { useAuthStore } from '@/stores/auth-store';
import { getUserFromToken } from '@/utils/jwt';
import type { LoginRequest, Branch } from '../types/auth';

export const useLogin = (branches?: Branch[]) => {
  const { t } = useTranslation();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response, variables) => {
      console.log('Login response:', response);
      if (response.success && response.data) {
        const user = getUserFromToken(response.data);
        console.log('Parsed user:', user);
        if (user) {
          const selectedBranch = branches?.find((b) => b.id === variables.branchId) || null;
          setAuth(user, response.data, selectedBranch);
          setTimeout(() => {
            window.location.href = '/';
          }, 100);
        } else {
          toast.error(t('auth.login.loginError'));
        }
      } else {
        const errorMessage = response.message || response.exceptionMessage || t('auth.login.loginError');
        toast.error(errorMessage);
      }
    },
    onError: (error: Error) => {
      console.error('Login error:', error);
      const errorMessage = error.message || t('auth.login.loginError');
      toast.error(errorMessage);
    },
  });
};

