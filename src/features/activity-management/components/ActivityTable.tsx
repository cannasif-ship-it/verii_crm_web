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
// Lucide İkonları
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
  Briefcase 
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

  // Modern Sort İkonu
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

  // Loading Durumu
  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
           <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-current text-pink-500" />
           <div className="text-sm text-muted-foreground animate-pulse">
             {t('activityManagement.loading', 'Yükleniyor...')}
           </div>
        </div>
      </div>
    );
  }

  const activities = data?.data || (data as any)?.items || [];

  // Empty State
  if (!data || activities.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground bg-slate-50 dark:bg-white/5 px-6 py-4 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
          {t('activityManagement.noData', 'Veri bulunamadı')}
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil((data.totalCount || 0) / pageSize);

  // Ortak Başlık Stili
  const headStyle = "cursor-pointer select-none text-slate-500 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-4";

  return (
    <>
      <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white/50 dark:bg-transparent overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-white/5">
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
              <TableHead className="text-slate-500 dark:text-slate-400">
                {t('activityManagement.activityType', 'Aktivite Tipi')}
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400">
                {t('activityManagement.status', 'Durum')}
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400">
                {t('activityManagement.priority', 'Öncelik')}
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400">
                {t('activityManagement.potentialCustomer', 'Müşteri')}
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400">
                {t('activityManagement.contact', 'Kişi')}
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400">
                {t('activityManagement.assignedUser', 'Sorumlu')}
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400">
                {t('activityManagement.isCompleted', 'Tamamlandı')}
              </TableHead>
              <TableHead onClick={() => handleSort('ActivityDate')} className={headStyle}>
                <div className="flex items-center">
                  {t('activityManagement.activityDate', 'Aktivite Tarihi')}
                  <SortIcon column="ActivityDate" />
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('CreatedDate')} className={headStyle}>
                <div className="flex items-center">
                  {t('activityManagement.createdDate', 'Oluşturulma Tarihi')}
                  <SortIcon column="CreatedDate" />
                </div>
              </TableHead>
              <TableHead className="text-right text-slate-500 dark:text-slate-400">
                {t('activityManagement.actions', 'İşlemler')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity: ActivityDto, index: number) => (
              <TableRow 
                key={activity.id || `activity-${index}`}
                // Tamamlanmış veya Yüksek Öncelikli ise hafif renk, değilse hover efekti
                className={`
                    border-b border-slate-100 dark:border-white/5 transition-colors duration-200 group
                    ${activity.isCompleted 
                        ? 'bg-slate-50/50 dark:bg-white/5 opacity-70' 
                        : activity.priority === 'High' 
                            ? 'bg-red-50/30 dark:bg-red-900/10 hover:bg-red-50/50 dark:hover:bg-red-900/20' 
                            : 'hover:bg-pink-50/40 dark:hover:bg-pink-500/5'
                    }
                `}
              >
                <TableCell className="font-medium text-slate-700 dark:text-slate-300">{activity.id}</TableCell>
                
                <TableCell className="font-medium text-slate-900 dark:text-white">
                    {activity.subject}
                </TableCell>
                
                <TableCell className="text-slate-600 dark:text-slate-400">
                    {activity.activityType}
                </TableCell>
                
                <TableCell>
                  <ActivityStatusBadge status={activity.status} />
                </TableCell>
                
                <TableCell>
                  <ActivityPriorityBadge priority={activity.priority} />
                </TableCell>
                
                <TableCell className="text-slate-600 dark:text-slate-400 text-xs">
                    {activity.potentialCustomerId ? (
                        <div className="flex items-center gap-1.5">
                            <Building2 size={12} className="text-slate-400" />
                            {getCustomerName(activity.potentialCustomerId)}
                        </div>
                    ) : '-'}
                </TableCell>
                
                <TableCell className="text-slate-600 dark:text-slate-400 text-xs">
                     {activity.contact ? (
                        <div className="flex items-center gap-1.5">
                            <Briefcase size={12} className="text-slate-400" />
                            {getContactName(activity.contact)}
                        </div>
                    ) : '-'}
                </TableCell>
                
                <TableCell className="text-slate-600 dark:text-slate-400 text-xs">
                     {activity.assignedUserId ? (
                        <div className="flex items-center gap-1.5">
                            <User size={12} className="text-slate-400" />
                            {getUserName(activity.assignedUserId)}
                        </div>
                    ) : '-'}
                </TableCell>
                
                <TableCell>
                  {activity.isCompleted ? (
                    <span className="text-green-600 dark:text-green-400 font-bold text-lg">✓</span>
                  ) : (
                    <span className="text-slate-300 dark:text-slate-600">-</span>
                  )}
                </TableCell>
                
                <TableCell className="text-slate-600 dark:text-slate-400 text-xs">
                     {activity.activityDate ? (
                        <div className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-pink-500/50" />
                            {new Date(activity.activityDate).toLocaleDateString(i18n.language)}
                        </div>
                    ) : '-'}
                </TableCell>
                
                <TableCell className="text-slate-600 dark:text-slate-400 text-xs">
                    {new Date(activity.createdDate).toLocaleDateString(i18n.language)}
                </TableCell>
                
                <TableCell className="text-right">
                  {/* Aksiyon Butonları */}
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
                      </>
                    )}
                    
                    {/* Ayırıcı */}
                    {!activity.isCompleted && activity.status !== 'Canceled' && <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-1 self-center" />}

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

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {t('activityManagement.table.showing', '{{from}}-{{to}} / {{total}} gösteriliyor', {
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
            className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"
          >
            {t('activityManagement.previous', 'Önceki')}
          </Button>
          <div className="flex items-center px-4 text-sm font-medium text-slate-700 dark:text-slate-200">
            {t('activityManagement.table.page', 'Sayfa {{current}} / {{total}}', {
              current: pageNumber,
              total: totalPages,
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageNumber + 1)}
            disabled={pageNumber >= totalPages}
            className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"
          >
            {t('activityManagement.next', 'Sonraki')}
          </Button>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#130822] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white sm:rounded-2xl">
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