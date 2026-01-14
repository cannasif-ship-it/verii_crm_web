import { z } from 'zod';

export interface ActivityDto {
  id: number;
  subject: string;
  description?: string;
  activityType: string;
  potentialCustomerId?: number;
  potentialCustomer?: {
    id: number;
    name: string;
    customerCode?: string;
  };
  erpCustomerCode?: string;
  productCode?: string;
  productName?: string;
  status: string;
  isCompleted: boolean;
  priority?: string;
  contactId?: number;
  contact?: {
    id: number;
    firstName?: string;
    lastName?: string;
    fullName?: string;
  };
  assignedUserId?: number;
  assignedUser?: {
    id: number;
    fullName?: string;
    userName?: string;
  };
  activityDate: string;
  createdDate: string;
  updatedDate?: string;
  deletedDate?: string;
  isDeleted: boolean;
  createdBy?: number;
  updatedBy?: number;
  deletedBy?: number;
  createdByFullUser?: string;
  updatedByFullUser?: string;
  deletedByFullUser?: string;
}

export interface CreateActivityDto {
  subject: string;
  description?: string;
  activityType: string;
  potentialCustomerId?: number;
  erpCustomerCode?: string;
  productCode?: string;
  productName?: string;
  status: string;
  isCompleted: boolean;
  priority?: string;
  contactId?: number;
  assignedUserId?: number;
  activityDate: string;
}

export interface UpdateActivityDto {
  subject: string;
  description?: string;
  activityType: string;
  potentialCustomerId?: number;
  erpCustomerCode?: string;
  productCode?: string;
  productName?: string;
  status: string;
  isCompleted: boolean;
  priority?: string;
  contactId?: number;
  assignedUserId?: number;
  activityDate: string;
}

export interface ActivityListFilters {
  activityType?: string;
  status?: string;
  priority?: string;
  potentialCustomerId?: number;
  contactId?: number;
  assignedUserId?: number;
  isCompleted?: boolean;
  createdDateFrom?: string;
  createdDateTo?: string;
}

export interface ActivityFormData {
  subject: string;
  description?: string;
  activityType: string;
  potentialCustomerId?: number;
  erpCustomerCode?: string;
  productCode?: string;
  productName?: string;
  status: string;
  isCompleted: boolean;
  priority?: string;
  contactId?: number;
  assignedUserId?: number;
  activityDate: string;
}

export const activityFormSchema = z.object({
  subject: z
    .string()
    .min(1, 'activityManagement.subjectRequired')
    .max(100, 'activityManagement.subjectMaxLength'),
  description: z
    .string()
    .max(500, 'activityManagement.descriptionMaxLength')
    .optional(),
  activityType: z
    .string()
    .min(1, 'activityManagement.activityTypeRequired')
    .max(50, 'activityManagement.activityTypeMaxLength'),
  potentialCustomerId: z
    .number()
    .optional()
    .nullable(),
  erpCustomerCode: z
    .string()
    .optional()
    .nullable(),
  productCode: z
    .string()
    .optional()
    .nullable(),
  productName: z
    .string()
    .optional()
    .nullable(),
  status: z
    .string()
    .min(1, 'activityManagement.statusRequired')
    .max(50, 'activityManagement.statusMaxLength'),
  isCompleted: z.boolean(),
  priority: z
    .string()
    .max(50, 'activityManagement.priorityMaxLength')
    .optional()
    .nullable(),
  contactId: z
    .number()
    .optional()
    .nullable(),
  assignedUserId: z
    .number()
    .optional()
    .nullable(),
  activityDate: z
    .string()
    .min(1, 'activityManagement.activityDateRequired'),
});

export type ActivityFormSchema = z.infer<typeof activityFormSchema>;
