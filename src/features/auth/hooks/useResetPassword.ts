import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '../api/auth-api';

export const useResetPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: { token: string; newPassword: string }) =>
      authApi.resetPassword(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Şifreniz başarıyla sıfırlandı. Giriş sayfasına yönlendiriliyorsunuz...');
        setTimeout(() => {
          navigate('/auth/login', { replace: true });
        }, 2000);
      } else {
        const errorMessage = response.message || response.exceptionMessage || 'Şifre sıfırlama işlemi başarısız oldu';
        toast.error(errorMessage);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Şifre sıfırlama işlemi sırasında bir hata oluştu');
    },
  });
};
