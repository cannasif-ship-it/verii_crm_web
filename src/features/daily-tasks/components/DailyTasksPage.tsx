import { type ReactElement, useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useActivities } from '@/features/activity-management/hooks/useActivities';
import { useUpdateActivity } from '@/features/activity-management/hooks/useUpdateActivity';
import { useDeleteActivity } from '@/features/activity-management/hooks/useDeleteActivity';
import { useCreateActivity } from '@/features/activity-management/hooks/useCreateActivity';
import { ActivityStatusBadge } from '@/features/activity-management/components/ActivityStatusBadge';
import { ActivityPriorityBadge } from '@/features/activity-management/components/ActivityPriorityBadge';
import { ActivityForm } from '@/features/activity-management/components/ActivityForm';
import type { ActivityDto } from '@/features/activity-management/types/activity-types';
import type { ActivityFormSchema } from '@/features/activity-management/types/activity-types';
import { Checkbox } from '@/components/ui/checkbox';
import { useUserOptions } from '@/features/user-discount-limit-management/hooks/useUserOptions';
import { useAuthStore } from '@/stores/auth-store';

export function DailyTasksPage(): ReactElement {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('tasks');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assignedUserFilter, setAssignedUserFilter] = useState<number | undefined>(user?.id);
  const [formOpen, setFormOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: userOptions = [] } = useUserOptions();

  useEffect(() => {
    if (user?.id && !assignedUserFilter) {
      setAssignedUserFilter(user.id);
    }
  }, [user, assignedUserFilter]);

  const getWeekDateRange = (): { startDate: string; endDate: string } => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return {
      startDate: monday.toISOString().split('T')[0],
      endDate: sunday.toISOString().split('T')[0],
    };
  };

  const getTodayDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getCalendarDateRange = (): { startDate: string; endDate: string } => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 41);
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  const weekDateRange = getWeekDateRange();
  const todayDate = getTodayDate();
  const calendarDateRange = getCalendarDateRange();

  const filters: Array<{ column: string; operator: string; value: string }> = [
    statusFilter !== 'all' ? { column: 'Status', operator: 'eq', value: statusFilter } : undefined,
    assignedUserFilter ? { column: 'AssignedUserId', operator: 'eq', value: assignedUserFilter.toString() } : undefined,
    activeTab === 'tasks' ? { column: 'ActivityDate', operator: 'gte', value: weekDateRange.startDate } : undefined,
    activeTab === 'tasks' ? { column: 'ActivityDate', operator: 'lte', value: weekDateRange.endDate } : undefined,
    activeTab === 'list' ? { column: 'ActivityDate', operator: 'eq', value: todayDate } : undefined,
    activeTab === 'calendar' ? { column: 'ActivityDate', operator: 'gte', value: calendarDateRange.startDate } : undefined,
    activeTab === 'calendar' ? { column: 'ActivityDate', operator: 'lte', value: calendarDateRange.endDate } : undefined,
  ].filter((f): f is { column: string; operator: string; value: string } => f !== undefined);

  const { data, isLoading, refetch } = useActivities({
    pageNumber: 1,
    pageSize: 1000,
    sortBy: 'ActivityDate',
    sortDirection: 'asc',
    filters: filters.length > 0 ? filters : undefined,
  });

  const updateActivity = useUpdateActivity();
  const deleteActivity = useDeleteActivity();
  const createActivity = useCreateActivity();

  const activities = data?.data || [];

  const filteredActivities = useMemo(() => {
    let filtered = activities;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((activity) => activity.status === statusFilter);
    }

    if (assignedUserFilter) {
      filtered = filtered.filter((activity) => activity.assignedUserId === assignedUserFilter);
    }

    if (activeTab === 'tasks') {
      filtered = filtered.filter((activity) => {
        if (!activity.activityDate) return false;
        const activityDate = new Date(activity.activityDate);
        return activityDate >= new Date(weekDateRange.startDate) && activityDate <= new Date(weekDateRange.endDate);
      });
    }

    if (activeTab === 'list') {
      filtered = filtered.filter((activity) => {
        if (!activity.activityDate) return false;
        const activityDate = new Date(activity.activityDate).toISOString().split('T')[0];
        return activityDate === todayDate;
      });
    }

    if (activeTab === 'calendar') {
      filtered = filtered.filter((activity) => {
        if (!activity.activityDate) return false;
        const activityDate = new Date(activity.activityDate);
        return activityDate >= new Date(calendarDateRange.startDate) && activityDate <= new Date(calendarDateRange.endDate);
      });
    }

    return filtered;
  }, [activities, statusFilter, assignedUserFilter, activeTab, weekDateRange, todayDate, calendarDateRange]);

  const handleToggleComplete = async (activity: ActivityDto): Promise<void> => {
    await updateActivity.mutateAsync({
      id: activity.id,
      data: {
        ...activity,
        status: activity.isCompleted ? 'Scheduled' : 'Completed',
        isCompleted: !activity.isCompleted,
      },
    });
    void refetch();
  };

  const handleDelete = async (id: number): Promise<void> => {
    await deleteActivity.mutateAsync(id);
    void refetch();
  };

  const handleNewTask = (): void => {
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: ActivityFormSchema): Promise<void> => {
    await createActivity.mutateAsync({
      subject: data.subject,
      description: data.description,
      activityType: data.activityType,
      potentialCustomerId: data.potentialCustomerId || undefined,
      erpCustomerCode: data.erpCustomerCode || undefined,
      status: data.status,
      isCompleted: data.isCompleted,
      priority: data.priority || undefined,
      contactId: data.contactId || undefined,
      assignedUserId: data.assignedUserId || user?.id || undefined,
      activityDate: data.activityDate,
    });
    setFormOpen(false);
    void refetch();
  };

  const handleStartTask = async (activity: ActivityDto): Promise<void> => {
    await updateActivity.mutateAsync({
      id: activity.id,
      data: {
        ...activity,
        status: 'In Progress',
        isCompleted: false,
      },
    });
    void refetch();
  };

  const handleCompleteTask = async (activity: ActivityDto): Promise<void> => {
    await updateActivity.mutateAsync({
      id: activity.id,
      data: {
        ...activity,
        status: 'Completed',
        isCompleted: true,
      },
    });
    void refetch();
  };

  const handlePutOnHold = async (activity: ActivityDto): Promise<void> => {
    await updateActivity.mutateAsync({
      id: activity.id,
      data: {
        ...activity,
        status: 'Postponed',
      },
    });
    void refetch();
  };

  const getPriorityColor = (priority?: string): string => {
    switch (priority) {
      case 'High':
        return 'bg-orange-500';
      case 'Medium':
        return 'bg-green-500';
      case 'Low':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryColor = (activityType: string): string => {
    switch (activityType) {
      case 'Call':
        return 'bg-blue-500';
      case 'Meeting':
        return 'bg-purple-500';
      case 'Email':
        return 'bg-yellow-500';
      case 'Task':
        return 'bg-indigo-500';
      case 'Note':
        return 'bg-teal-500';
      case 'Event':
        return 'bg-pink-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getAssignedUserName = (userId?: number): string => {
    if (!userId) return t('dailyTasks.unassigned', 'Atanmamış');
    const foundUser = userOptions.find((u) => u.id === userId);
    return foundUser?.fullName || foundUser?.username || t('dailyTasks.unknownUser', 'Bilinmeyen Kullanıcı');
  };

  const getActivitiesByDate = (): Record<string, ActivityDto[]> => {
    const grouped: Record<string, ActivityDto[]> = {};
    filteredActivities.forEach((activity) => {
      const dateKey = activity.activityDate ? new Date(activity.activityDate).toISOString().split('T')[0] : 'no-date';
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(activity);
    });
    return grouped;
  };

  const getCalendarDays = (): Array<{ date: Date; activities: ActivityDto[] }> => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const days: Array<{ date: Date; activities: ActivityDto[] }> = [];
    const activitiesByDate = getActivitiesByDate();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      days.push({
        date,
        activities: activitiesByDate[dateKey] || [],
      });
    }
    
    return days;
  };

  const handlePreviousMonth = (): void => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = (): void => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  const handleToday = (): void => {
    setCalendarMonth(new Date());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">
          {t('common.loading', 'Yükleniyor...')}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-800/30 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-400"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <h1 className="text-3xl font-bold text-white">
                {t('dailyTasks.fullTitle', 'Günlük Aktiviteler & To-Do')}
              </h1>
            </div>
            <p className="text-muted-foreground mt-2 text-sm">
              {t('dailyTasks.subtitle', 'Görevlerinizi yönetin, aktiviteleri takip edin ve takvim görünümünü kullanın')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleNewTask}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {t('dailyTasks.newTask', 'Yeni Görev')}
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-fit grid-cols-3 bg-muted">
          <TabsTrigger value="tasks" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            {t('dailyTasks.weeklyTasks', 'Haftalık Görevler')}
          </TabsTrigger>
          <TabsTrigger value="list" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            {t('dailyTasks.dailyList', 'Günlük Liste')}
          </TabsTrigger>
          <TabsTrigger value="calendar" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            {t('dailyTasks.calendar', 'Takvim')}
          </TabsTrigger>
        </TabsList>

        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{t('dailyTasks.status', 'Durum:')}</span>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                  className={statusFilter === 'all' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  {t('dailyTasks.all', 'Tümü')}
                </Button>
                <Button
                  variant={statusFilter === 'Scheduled' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('Scheduled')}
                  className={statusFilter === 'Scheduled' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  {t('dailyTasks.pending', 'Bekliyor')}
                </Button>
                <Button
                  variant={statusFilter === 'In Progress' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('In Progress')}
                  className={statusFilter === 'In Progress' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  {t('dailyTasks.inProgress', 'Devam Ediyor')}
                </Button>
                <Button
                  variant={statusFilter === 'Completed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('Completed')}
                  className={statusFilter === 'Completed' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  {t('dailyTasks.completed', 'Tamamlandı')}
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{t('dailyTasks.employee', 'Çalışan:')}</span>
              <Select
                value={assignedUserFilter?.toString() || 'all'}
                onValueChange={(value) => setAssignedUserFilter(value === 'all' ? undefined : parseInt(value))}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={t('dailyTasks.allEmployees', 'Tüm Çalışanlar')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('dailyTasks.allEmployees', 'Tüm Çalışanlar')}</SelectItem>
                  {userOptions.map((userOption) => (
                    <SelectItem key={userOption.id} value={userOption.id.toString()}>
                      {userOption.fullName || userOption.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <TabsContent value="tasks" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredActivities.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                {t('dailyTasks.noTasks', 'Görev bulunamadı')}
              </div>
            ) : (
              filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-card border border-border rounded-lg p-4 shadow-sm flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg text-blue-300 flex-1">
                      {activity.subject}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(activity.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </Button>
                  </div>
                  {activity.description && (
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    {activity.priority && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getPriorityColor(activity.priority)}`}>
                        {t(`activityManagement.priority${activity.priority}`, activity.priority)}
                      </span>
                    )}
                    {activity.activityType && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(activity.activityType)}`}>
                        <span className="mr-1">►</span>
                        {t(`activityManagement.activityType${activity.activityType}`, activity.activityType)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    {getAssignedUserName(activity.assignedUserId)}
                  </div>
                  {activity.activityDate && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {new Date(activity.activityDate).toLocaleDateString('tr-TR')}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <ActivityStatusBadge status={activity.status} />
                  </div>
                  <div className="flex gap-2 mt-auto">
                    {activity.status === 'Scheduled' && (
                      <Button
                        size="sm"
                        onClick={() => handleStartTask(activity)}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-1"
                        >
                          <path d="M5 12l5 5l10 -10" />
                        </svg>
                        {t('dailyTasks.start', 'Başlat')}
                      </Button>
                    )}
                    {activity.status === 'In Progress' && (
                      <Button
                        size="sm"
                        onClick={() => handlePutOnHold(activity)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white flex-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-1"
                        >
                          <rect x="6" y="4" width="4" height="16" />
                          <rect x="14" y="4" width="4" height="16" />
                        </svg>
                        {t('dailyTasks.putOnHold', 'Bekletmeye Al')}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleCompleteTask(activity)}
                      className="bg-green-600 hover:bg-green-700 text-white flex-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {t('dailyTasks.complete', 'Tamamla')}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <div className="space-y-3">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('dailyTasks.noTasks', 'Görev bulunamadı')}
              </div>
            ) : (
              filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-card border rounded-lg p-4 flex items-start gap-4 hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    checked={activity.isCompleted}
                    onCheckedChange={() => handleToggleComplete(activity)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`font-medium ${activity.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                          {activity.subject}
                        </h3>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {activity.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(activity.id)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </Button>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <ActivityPriorityBadge priority={activity.priority} />
                      <ActivityStatusBadge status={activity.status} />
                      {activity.activityType && (
                        <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded">
                          {activity.activityType}
                        </span>
                      )}
                      {activity.activityDate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          {new Date(activity.activityDate).toLocaleDateString('tr-TR')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousMonth}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToday}
                >
                  {t('dailyTasks.today', 'Bugün')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextMonth}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Button>
              </div>
              <h2 className="text-lg font-semibold">
                {calendarMonth.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
              </h2>
            </div>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {getCalendarDays().map((dayData, index) => {
                const isCurrentMonth = dayData.date.getMonth() === calendarMonth.getMonth();
                const isToday = dayData.date.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={index}
                    className={`min-h-[100px] border rounded-lg p-2 cursor-pointer hover:bg-accent transition-colors ${
                      !isCurrentMonth ? 'opacity-50' : ''
                    } ${isToday ? 'bg-blue-500/20 border-blue-500' : 'bg-card border-border'}`}
                    onClick={() => {
                      const dateString = dayData.date.toISOString().split('T')[0];
                      setSelectedDate(dateString);
                      setFormOpen(true);
                    }}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-400' : 'text-foreground'}`}>
                      {dayData.date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayData.activities.slice(0, 3).map((activity) => (
                        <div
                          key={activity.id}
                          className="text-xs p-1 bg-purple-500/20 text-purple-300 rounded truncate cursor-pointer hover:bg-purple-500/30"
                          title={activity.subject}
                        >
                          {activity.subject}
                        </div>
                      ))}
                      {dayData.activities.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayData.activities.length - 3} {t('dailyTasks.more', 'daha fazla')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <ActivityForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setSelectedDate(null);
          }
        }}
        onSubmit={handleFormSubmit}
        activity={null}
        isLoading={createActivity.isPending}
        initialDate={selectedDate}
      />
    </div>
  );
}
