import { z } from 'zod';

export enum DocumentTypeEnum {
  Offer = 1,
  Request = 2,
  Order = 3,
}

export interface ApprovalFlowDto {
  id: number;
  documentType: number;
  documentTypeName?: string;
  description?: string;
  isActive: boolean;
  createdDate: string;
  updatedDate?: string;
  isDeleted: boolean;
  createdByFullUser?: string;
  updatedByFullUser?: string;
  deletedByFullUser?: string;
}

export interface CreateApprovalFlowDto {
  documentType: number;
  description?: string;
  isActive: boolean;
}

export interface UpdateApprovalFlowDto {
  documentType: number;
  description?: string;
  isActive: boolean;
}

export interface ApprovalFlowListFilters {
  documentType?: number;
  isActive?: boolean;
  description?: string;
}

export interface ApprovalFlowFormData {
  documentType: number;
  description?: string;
  isActive: boolean;
}

export const approvalFlowFormSchema = z.object({
  documentType: z
    .number()
    .min(1, 'approvalFlow.form.documentType.required'),
  description: z
    .string()
    .max(200, 'approvalFlow.form.description.maxLength')
    .optional()
    .nullable(),
  isActive: z.boolean().default(true),
});

export type ApprovalFlowFormSchema = z.infer<typeof approvalFlowFormSchema>;
