import { z } from 'zod';
import type { ApiResponse } from '@/types/api';

export const loginRequestSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(1, 'Şifre zorunludur'),
  branchId: z.string().min(1, 'Şube seçimi zorunludur'),
  rememberMe: z.boolean(),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const registerRequestSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır'),
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export interface LoginWithSessionResponseDto {
  token: string;
  userId: number;
  sessionId: string;
  rememberMe: boolean;
}

export type LoginResponse = ApiResponse<LoginWithSessionResponseDto>;

export interface Branch {
  id: string;
  name: string;
  code?: string;
}

export interface UserDto {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  role: string;
  isEmailConfirmed: boolean;
  isActive: boolean;
  lastLoginDate: string | null;
  fullName: string;
  creationTime: string | null;
  lastModificationTime: string | null;
}

export type ActiveUsersResponse = ApiResponse<UserDto[]>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token zorunludur'),
  newPassword: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  confirmPassword: z.string().min(6, 'Şifre tekrarı zorunludur'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
});

export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>;