import { z } from 'zod';

export interface ContactDto {
  id: number;
  fullName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  notes?: string;
  customerId: number;
  customerName?: string;
  titleId: number;
  titleName?: string;
  createdDate: string;
  updatedDate?: string;
  isDeleted: boolean;
  createdByFullUser?: string;
  updatedByFullUser?: string;
  deletedByFullUser?: string;
}

export interface CreateContactDto {
  fullName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  notes?: string;
  customerId: number;
  titleId: number;
}

export interface UpdateContactDto {
  fullName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  notes?: string;
  customerId: number;
  titleId: number;
}

export interface ContactListFilters {
  fullName?: string;
  email?: string;
  phone?: string;
  customerId?: number;
  titleId?: number;
}

export interface ContactFormData {
  fullName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  notes?: string;
  customerId: number;
  titleId: number;
}

export const contactFormSchema = z.object({
  fullName: z
    .string()
    .min(1, 'contactManagement.form.fullName.required')
    .max(100, 'contactManagement.form.fullName.maxLength'),
  email: z
    .string()
    .email('contactManagement.form.email.invalid')
    .max(100, 'contactManagement.form.email.maxLength')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .max(20, 'contactManagement.form.phone.maxLength')
    .optional()
    .or(z.literal('')),
  mobile: z
    .string()
    .max(20, 'contactManagement.form.mobile.maxLength')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(250, 'contactManagement.form.notes.maxLength')
    .optional()
    .or(z.literal('')),
  customerId: z
    .number()
    .min(1, 'contactManagement.form.customer.required'),
  titleId: z
    .number()
    .min(1, 'contactManagement.form.title.required'),
});

export type ContactFormSchema = z.infer<typeof contactFormSchema>;
