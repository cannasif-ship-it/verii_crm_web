import { z } from 'zod';

export interface DistrictDto {
  id: number;
  name: string;
  erpCode?: string;
  cityId: number;
  cityName?: string;
  createdDate: string;
  updatedDate?: string;
  isDeleted: boolean;
  createdByFullUser?: string;
  updatedByFullUser?: string;
  deletedByFullUser?: string;
}

export interface CreateDistrictDto {
  name: string;
  erpCode?: string;
  cityId: number;
}

export interface UpdateDistrictDto {
  name: string;
  erpCode?: string;
  cityId: number;
}

export interface DistrictListFilters {
  name?: string;
  erpCode?: string;
  cityId?: number;
}

export interface DistrictFormData {
  name: string;
  erpCode?: string;
  cityId: number;
}

export const districtFormSchema = z.object({
  name: z
    .string()
    .min(1, 'districtManagement.form.name.required')
    .max(100, 'districtManagement.form.name.maxLength'),
  erpCode: z
    .string()
    .max(10, 'districtManagement.form.erpCode.maxLength')
    .optional()
    .or(z.literal('')),
  cityId: z
    .number()
    .min(1, 'districtManagement.form.city.required'),
});

export type DistrictFormSchema = z.infer<typeof districtFormSchema>;
