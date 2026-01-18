import { z } from 'zod';

export interface ApprovalRoleDto {
  id: number;
  approvalRoleGroupId: number;
  approvalRoleGroupName?: string;
  name: string;
  createdDate: string;
  updatedDate?: string;
  createdBy?: string;
  createdByFullName?: string;
  createdByFullUser?: string;
}

export interface CreateApprovalRoleDto {
  approvalRoleGroupId: number;
  name: string;
}

export interface UpdateApprovalRoleDto {
  approvalRoleGroupId: number;
  name: string;
}

export interface ApprovalRoleListFilters {
  approvalRoleGroupId?: number;
  name?: string;
}

export interface ApprovalRoleFormData {
  approvalRoleGroupId: number;
  name: string;
}

export const approvalRoleFormSchema = z.object({
  approvalRoleGroupId: z
    .number()
    .min(1, 'approvalRole.form.approvalRoleGroupId.required'),
  name: z
    .string()
    .min(1, 'approvalRole.form.name.required')
    .max(100, 'approvalRole.form.name.maxLength'),
});

export type ApprovalRoleFormSchema = z.infer<typeof approvalRoleFormSchema>;
