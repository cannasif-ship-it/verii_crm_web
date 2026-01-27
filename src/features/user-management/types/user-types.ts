import { z } from 'zod';

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

export interface CreateUserDto {
  username: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: string;
  isActive?: boolean;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: string;
  isActive?: boolean;
}

export interface UserListFilters {
  username?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}

export interface UserFormData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: string;
  isActive?: boolean;
}

export const userFormSchema = z.object({
  username: z
    .string()
    .min(1, 'userManagement.form.username.required')
    .max(50, 'userManagement.form.username.maxLength'),
  email: z
    .string()
    .email('userManagement.form.email.invalid')
    .min(1, 'userManagement.form.email.required'),
  password: z
    .string()
    .min(8, 'userManagement.form.password.minLength')
    .max(100, 'userManagement.form.password.maxLength')
    .optional()
    .or(z.literal('')),
  firstName: z.string().max(50, 'userManagement.form.firstName.maxLength').optional(),
  lastName: z.string().max(50, 'userManagement.form.lastName.maxLength').optional(),
  phoneNumber: z.string().max(20, 'userManagement.form.phoneNumber.maxLength').optional(),
  role: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const userUpdateFormSchema = userFormSchema.omit({ password: true });

export type UserFormSchema = z.infer<typeof userFormSchema>;
export type UserUpdateFormSchema = z.infer<typeof userUpdateFormSchema>;
