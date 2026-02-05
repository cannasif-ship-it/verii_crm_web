import type { ActivityDto, ActivityTypeRef, UpdateActivityDto } from '../types/activity-types';

function toActivityTypeString(value: string | ActivityTypeRef): string {
  if (typeof value === 'object' && value !== null && 'id' in value) return String((value as ActivityTypeRef).id);
  return String(value);
}

export function toUpdateActivityDto(activity: ActivityDto, overrides?: Partial<UpdateActivityDto>): UpdateActivityDto {
  return {
    subject: activity.subject,
    description: activity.description,
    activityType: toActivityTypeString(activity.activityType),
    potentialCustomerId: activity.potentialCustomerId,
    erpCustomerCode: activity.erpCustomerCode,
    productCode: activity.productCode,
    productName: activity.productName,
    status: activity.status,
    isCompleted: activity.isCompleted,
    priority: activity.priority,
    contactId: activity.contactId,
    assignedUserId: activity.assignedUserId,
    activityDate: activity.activityDate,
    ...overrides,
  };
}
