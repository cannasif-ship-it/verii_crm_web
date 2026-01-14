import { z } from 'zod';

export interface CountryDto {
  id: number;
  name: string;
  code: string;
  erpCode?: string;
  createdDate: string;
  updatedDate?: string;
  isDeleted: boolean;
  createdByFullUser?: string;
  updatedByFullUser?: string;
  deletedByFullUser?: string;
}

export interface CreateCountryDto {
  name: string;
  code: string;
  erpCode?: string;
}

export interface UpdateCountryDto {
  name: string;
  code: string;
  erpCode?: string;
}

export interface CountryListFilters {
  name?: string;
  code?: string;
}

export interface CountryFormData {
  name: string;
  code: string;
  erpCode?: string;
}

export const countryFormSchema = z.object({
  name: z
    .string()
    .min(1, 'countryManagement.form.name.required')
    .max(100, 'countryManagement.form.name.maxLength'),
  code: z
    .string()
    .min(2, 'countryManagement.form.code.minLength')
    .max(5, 'countryManagement.form.code.maxLength')
    .transform((val) => val.toUpperCase()),
  erpCode: z
    .string()
    .max(10, 'countryManagement.form.erpCode.maxLength')
    .optional()
    .or(z.literal('')),
});

export type CountryFormSchema = z.infer<typeof countryFormSchema>;
