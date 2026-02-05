import type { CreateActivityDto } from '../types/activity-types';
import type { ActivityFormSchema } from '../types/activity-types';

function toActivityTypeId(value: string): number | undefined {
  const num = Number(value);
  return Number.isInteger(num) && !Number.isNaN(num) ? num : undefined;
}

export function buildCreateActivityPayload(
  data: ActivityFormSchema,
  options: { assignedUserIdFallback?: number } = {}
): CreateActivityDto {
  const activityTypeId = toActivityTypeId(data.activityType);
  return {
    subject: data.subject,
    description: data.description,
    activityType: data.activityType,
    ...(activityTypeId !== undefined && { activityTypeId }),
    activityDate: data.activityDate,
    status: data.status,
    isCompleted: data.isCompleted,
    potentialCustomerId: data.potentialCustomerId || undefined,
    erpCustomerCode: data.erpCustomerCode || undefined,
    priority: data.priority || undefined,
    contactId: data.contactId || undefined,
    assignedUserId: data.assignedUserId ?? options.assignedUserIdFallback,
  };
}
