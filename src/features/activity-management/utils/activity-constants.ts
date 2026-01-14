export const ACTIVITY_TYPES = [
  { value: 'Call', label: 'Call' },
  { value: 'Meeting', label: 'Meeting' },
  { value: 'Email', label: 'Email' },
  { value: 'Task', label: 'Task' },
  { value: 'Note', label: 'Note' },
  { value: 'Event', label: 'Event' },
] as const;

export const ACTIVITY_STATUSES = [
  { value: 'Scheduled', label: 'Scheduled', color: 'blue' },
  { value: 'In Progress', label: 'In Progress', color: 'yellow' },
  { value: 'Completed', label: 'Completed', color: 'green' },
  { value: 'Canceled', label: 'Canceled', color: 'red' },
  { value: 'Postponed', label: 'Postponed', color: 'gray' },
] as const;

export const ACTIVITY_PRIORITIES = [
  { value: 'Low', label: 'Low', color: 'gray' },
  { value: 'Medium', label: 'Medium', color: 'yellow' },
  { value: 'High', label: 'High', color: 'red' },
] as const;
