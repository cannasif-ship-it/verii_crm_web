import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authApi } from '../api/auth-api';

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.requestPasswordReset(email),
    onSuccess: (response) => {
      if (response.success) {
        const message = response.message || 'Şifre sıfırlama linki e-posta adresinize gönderildi. Lütfen e-postanızı kontrol edin.';
        toast.success(message);
      } else {
        const errorMessage = response.message || response.exceptionMessage || 'Şifre sıfırlama isteği gönderilemedi';
        toast.error(errorMessage);
      }
    },
    onError: (error: Error) => {
      console.error('Forgot password error:', error);
      const errorMessage = error.message || 'Şifre sıfırlama isteği gönderilirken bir hata oluştu';
      toast.error(errorMessage);
    },
  });
};
