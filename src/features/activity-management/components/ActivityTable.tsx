import { type ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useActivities } from '../hooks/useActivities';
import { useDeleteActivity } from '../hooks/useDeleteActivity';
import { useUpdateActivity } from '../hooks/useUpdateActivity';
import { ActivityStatusBadge } from './ActivityStatusBadge';
import { ActivityPriorityBadge } from './ActivityPriorityBadge';
import type { ActivityDto } from '../types/activity-types';
import type { PagedFilter } from '@/types/api';
import { useCustomerOptions } from '@/features/customer-management/hooks/useCustomerOptions';
import { useUserOptions } from '@/features/user-discount-limit-management/hooks/useUserOptions';
import { 
  Edit2, 
  Trash2, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  PlayCircle, 
  XCircle, 
  Calendar, 
  User, 
  Building2, 
  Briefcase,
  List
} from 'lucide-react';

interface ActivityTableProps {
  onEdit: (activity: ActivityDto) => void;
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: PagedFilter[] | Record<string, unknown>;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
}

export function ActivityTable({
  onEdit,
  pageNumber,
  pageSize,
  sortBy = 'Id',
  sortDirection = 'desc',
  filters = {},
  onPageChange,
  onSortChange,
}: ActivityTableProps): ReactElement {
  const { t, i18n } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityDto | null>(null);
  const { data: customerOptions = [] } = useCustomerOptions();
  const { data: userOptions = [] } = useUserOptions();

  const { data, isLoading, isFetching } = useActivities({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    filters: filters as PagedFilter[] | undefined,
  });

  const deleteActivity = useDeleteActivity();
  const updateActivity = useUpdateActivity();

  const handleDeleteClick = (activity: ActivityDto): void => {
    setSelectedActivity(activity);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (selectedActivity) {
      await deleteActivity.mutateAsync(selectedActivity.id);
      setDeleteDialogOpen(false);
      setSelectedActivity(null);
    }
  };

  const handleMarkAsCompleted = async (activity: ActivityDto): Promise<void> => {
    await updateActivity.mutateAsync({
      id: activity.id,
      data: {
        ...activity,
        status: 'Completed',
        isCompleted: true,
      },
    });
  };

  const handleMarkAsInProgress = async (activity: ActivityDto): Promise<void> => {
    await updateActivity.mutateAsync({
      id: activity.id,
      data: {
        ...activity,
        status: 'In Progress',
        isCompleted: false,
      },
    });
  };

  const handleCancel = async (activity: ActivityDto): Promise<void> => {
    await updateActivity.mutateAsync({
      id: activity.id,
      data: {
        ...activity,
        status: 'Canceled',
        isCompleted: false,
      },
    });
  };

  const handleSort = (column: string): void => {
    const newDirection =
      sortBy === column && sortDirection === 'asc' ? 'desc' : 'asc';
    onSortChange(column, newDirection);
  };

  const SortIcon = ({ column }: { column: string }): ReactElement => {
    if (sortBy !== column) {
      return <ArrowUpDown size={14} className="ml-2 inline-block text-slate-400 opacity-50" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={14} className="ml-2 inline-block text-pink-600 dark:text-pink-400" />
    ) : (
      <ArrowDown size={14} className="ml-2 inline-block text-pink-600 dark:text-pink-400" />
    );
  };

  const getCustomerName = (customerId?: number): string => {
    if (!customerId) return '-';
    const customer = customerOptions.find((c) => c.id === customerId);
    return customer?.name || '-';
  };

  const getContactName = (contact?: { id: number; firstName?: string; lastName?: string; fullName?: string }): string => {
    if (!contact) return '-';
    return contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || '-';
  };

  const getUserName = (userId?: number): string => {
    if (!userId) return '-';
    const user = userOptions.find((u) => u.id === userId);
    return user?.fullName || user?.username || '-';
  };

  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
           <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-current text-pink-500" />
           <span className="text-sm font-medium text-muted-foreground animate-pulse">
             {t('activityManagement.loading', 'Yükleniyor...')}
           </span>
        </div>
      </div>
    );
  }

  const activities = data?.data || (data as any)?.items || [];

  if (!data || activities.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[500px]">
        <div className="text-muted-foreground bg-slate-50 dark:bg-white/5 px-8 py-6 rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-sm font-medium">
          {t('activityManagement.noData', 'Veri bulunamadı')}
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil((data.totalCount || 0) / pageSize);

  // --- TASARIM STİLLERİ ---
  const headStyle = `
    cursor-pointer select-none 
    text-slate-500 dark:text-slate-400 
    font-bold text-xs uppercase tracking-wider 
    py-5 px-5 
    hover:text-pink-600 dark:hover:text-pink-400 
    transition-colors 
    border-r border-slate-200 dark:border-white/[0.03] last:border-r-0
    bg-slate-50/90 dark:bg-[#130822]/90
    whitespace-nowrap
  `;

  const cellStyle = `
    text-slate-600 dark:text-slate-400 
    px-5 py-4
    border-r border-slate-100 dark:border-white/[0.03] last:border-r-0
    text-sm align-top
  `;

  return (
    <>
      <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white/40 dark:bg-[#1a1025]/40 backdrop-blur-sm min-h-[65vh] flex flex-col shadow-sm">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <Table>
            <TableHeader className="sticky top-0 z-20 shadow-sm">
              <TableRow className="border-b border-slate-200 dark:border-white/10 hover:bg-transparent">
                
                <TableHead onClick={() => handleSort('Id')} className={headStyle}>
                  <div className="flex items-center">
                    {t('activityManagement.id', 'ID')}
                    <SortIcon column="Id" />
                  </div>
                </TableHead>

                <TableHead onClick={() => handleSort('Subject')} className={headStyle}>
                  <div className="flex items-center">
                    {t('activityManagement.subject', 'Konu')}
                    <SortIcon column="Subject" />
                  </div>
                </TableHead>

                <TableHead className={headStyle}>
                  {t('activityManagement.activityType', 'Tip')}
                </TableHead>

                <TableHead className={headStyle}>
                  {t('activityManagement.status', 'Durum')}
                </TableHead>

                <TableHead className={headStyle}>
                  {t('activityManagement.priority', 'Öncelik')}
                </TableHead>

                <TableHead className={headStyle}>
                  {t('activityManagement.potentialCustomer', 'Müşteri')}
                </TableHead>

                <TableHead className={headStyle}>
                  {t('activityManagement.contact', 'Kişi')}
                </TableHead>

                <TableHead className={headStyle}>
                  {t('activityManagement.assignedUser', 'Sorumlu')}
                </TableHead>

                <TableHead onClick={() => handleSort('ActivityDate')} className={headStyle}>
                  <div className="flex items-center">
                    {t('activityManagement.activityDate', 'Tarih')}
                    <SortIcon column="ActivityDate" />
                  </div>
                </TableHead>

                <TableHead className={`${headStyle} text-right`}>
                  {t('activityManagement.actions', 'İşlemler')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity: ActivityDto, index: number) => (
                <TableRow 
                  key={activity.id || `activity-${index}`}
                  className={`
                    border-b border-slate-100 dark:border-white/5 transition-colors duration-200 group
                    ${activity.isCompleted 
                        ? 'bg-slate-50/50 dark:bg-white/5 opacity-70 grayscale-[30%]' 
                        : 'hover:bg-pink-50/40 dark:hover:bg-pink-500/5'
                    }
                  `}
                >
                  <TableCell className={`${cellStyle} font-medium text-slate-700 dark:text-slate-300`}>
                    {activity.id}
                  </TableCell>
                  
                  <TableCell className={`${cellStyle} font-semibold text-slate-900 dark:text-white min-w-[200px]`}>
                    {activity.subject}
                  </TableCell>
                  
                  <TableCell className={`${cellStyle} whitespace-nowrap`}>
                    <div className="flex items-center gap-2">
                        <List size={14} className="text-pink-500" />
                        {activity.activityType}
                    </div>
                  </TableCell>
                  
                  <TableCell className={`${cellStyle} whitespace-nowrap`}>
                    <ActivityStatusBadge status={activity.status} />
                  </TableCell>
                  
                  <TableCell className={`${cellStyle} whitespace-nowrap`}>
                    <ActivityPriorityBadge priority={activity.priority} />
                  </TableCell>
                  
                  <TableCell className={`${cellStyle} min-w-[150px]`}>
                    {activity.potentialCustomerId ? (
                        <div className="flex items-start gap-2">
                            <Building2 size={14} className="text-slate-400 mt-0.5 shrink-0" />
                            <span>{getCustomerName(activity.potentialCustomerId)}</span>
                        </div>
                    ) : '-'}
                  </TableCell>
                  
                  <TableCell className={`${cellStyle} min-w-[150px]`}>
                      {activity.contact ? (
                        <div className="flex items-start gap-2">
                            <Briefcase size={14} className="text-slate-400 mt-0.5 shrink-0" />
                            <span>{getContactName(activity.contact)}</span>
                        </div>
                    ) : '-'}
                  </TableCell>
                  
                  <TableCell className={`${cellStyle} whitespace-nowrap`}>
                      {activity.assignedUserId ? (
                        <div className="flex items-center gap-2">
                            <User size={14} className="text-indigo-500/50" />
                            <span>{getUserName(activity.assignedUserId)}</span>
                        </div>
                    ) : '-'}
                  </TableCell>
                  
                  <TableCell className={`${cellStyle} whitespace-nowrap`}>
                      {activity.activityDate ? (
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-pink-500/50" />
                            {new Date(activity.activityDate).toLocaleDateString(i18n.language)}
                        </div>
                    ) : '-'}
                  </TableCell>
                  
                  <TableCell className={`${cellStyle} text-right`}>
                    <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {!activity.isCompleted && activity.status !== 'Canceled' && (
                        <>
                          {activity.status !== 'Completed' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title={t('activityManagement.markAsCompleted', 'Tamamla')}
                              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-500/10"
                              onClick={() => handleMarkAsCompleted(activity)}
                              disabled={updateActivity.isPending}
                            >
                              <CheckCircle2 size={16} />
                            </Button>
                          )}
                          {activity.status !== 'In Progress' && activity.status !== 'Completed' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title={t('activityManagement.markAsInProgress', 'Devam Et')}
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                              onClick={() => handleMarkAsInProgress(activity)}
                              disabled={updateActivity.isPending}
                            >
                              <PlayCircle size={16} />
                            </Button>
                          )}
                          {activity.status !== 'Canceled' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title={t('activityManagement.cancelActivity', 'İptal Et')}
                              className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-500/10"
                              onClick={() => handleCancel(activity)}
                              disabled={updateActivity.isPending}
                            >
                              <XCircle size={16} />
                            </Button>
                          )}
                          <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-1 self-center" />
                        </>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        title={t('activityManagement.editButton', 'Düzenle')}
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                        onClick={() => onEdit(activity)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title={t('activityManagement.delete', 'Sil')}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                        onClick={() => handleDeleteClick(activity)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4 px-2">
        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          {t('activityManagement.table.showing', '{{from}}-{{to}} / {{total}} kayıt', {
            from: (pageNumber - 1) * pageSize + 1,
            to: Math.min(pageNumber * pageSize, data.totalCount || 0),
            total: data.totalCount || 0,
          })}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageNumber - 1)}
            disabled={pageNumber <= 1}
            className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 h-8 px-4"
          >
            {t('activityManagement.previous', 'Önceki')}
          </Button>
          <div className="flex items-center px-4 text-sm font-bold text-slate-700 dark:text-white bg-white/50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 h-8">
            {pageNumber} / {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageNumber + 1)}
            disabled={pageNumber >= totalPages}
            className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 h-8 px-4"
          >
            {t('activityManagement.next', 'Sonraki')}
          </Button>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#130822] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white sm:rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">
              {t('activityManagement.deleteTitle', 'Aktiviteyi Sil')}
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              {t('activityManagement.confirmDelete', 'Bu aktiviteyi silmek istediğinizden emin misiniz?')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteActivity.isPending}
              className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
            >
              {t('activityManagement.cancel', 'İptal')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteActivity.isPending}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-900/50 dark:hover:bg-red-900/70 border border-transparent dark:border-red-500/20 text-white"
            >
              {deleteActivity.isPending
                ? t('activityManagement.loading', 'Yükleniyor...')
                : t('activityManagement.delete', 'Sil')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}