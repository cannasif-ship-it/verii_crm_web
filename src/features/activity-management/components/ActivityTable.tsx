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
      return (
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
          className="ml-1 inline-block text-muted-foreground"
        >
          <path d="M8 9l4-4 4 4" />
          <path d="M16 15l-4 4-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
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
        className="ml-1 inline-block"
      >
        <path d="M8 9l4-4 4 4" />
      </svg>
    ) : (
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
        className="ml-1 inline-block"
      >
        <path d="M16 15l-4 4-4-4" />
      </svg>
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
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">
          {t('activityManagement.loading', 'Yükleniyor...')}
        </div>
      </div>
    );
  }

  const activities = data?.data || (data as any)?.items || [];

  if (!data || activities.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">
          {t('activityManagement.noData', 'Veri bulunamadı')}
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil((data.totalCount || 0) / pageSize);

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('Id')}
              >
                <div className="flex items-center">
                  {t('activityManagement.id', 'ID')}
                  <SortIcon column="Id" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('Subject')}
              >
                <div className="flex items-center">
                  {t('activityManagement.subject', 'Konu')}
                  <SortIcon column="Subject" />
                </div>
              </TableHead>
              <TableHead>
                {t('activityManagement.activityType', 'Aktivite Tipi')}
              </TableHead>
              <TableHead>
                {t('activityManagement.status', 'Durum')}
              </TableHead>
              <TableHead>
                {t('activityManagement.priority', 'Öncelik')}
              </TableHead>
              <TableHead>
                {t('activityManagement.potentialCustomer', 'Müşteri')}
              </TableHead>
              <TableHead>
                {t('activityManagement.contact', 'Kişi')}
              </TableHead>
              <TableHead>
                {t('activityManagement.assignedUser', 'Sorumlu')}
              </TableHead>
              <TableHead>
                {t('activityManagement.isCompleted', 'Tamamlandı')}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('ActivityDate')}
              >
                <div className="flex items-center">
                  {t('activityManagement.activityDate', 'Aktivite Tarihi')}
                  <SortIcon column="ActivityDate" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('CreatedDate')}
              >
                <div className="flex items-center">
                  {t('activityManagement.createdDate', 'Oluşturulma Tarihi')}
                  <SortIcon column="CreatedDate" />
                </div>
              </TableHead>
              <TableHead className="text-right">
                {t('activityManagement.actions', 'İşlemler')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity: ActivityDto, index: number) => (
              <TableRow 
                key={activity.id || `activity-${index}`}
                className={activity.isCompleted ? 'bg-muted/50' : activity.priority === 'High' ? 'bg-red-50' : ''}
              >
                <TableCell>{activity.id}</TableCell>
                <TableCell className="font-medium">{activity.subject}</TableCell>
                <TableCell>{activity.activityType}</TableCell>
                <TableCell>
                  <ActivityStatusBadge status={activity.status} />
                </TableCell>
                <TableCell>
                  <ActivityPriorityBadge priority={activity.priority} />
                </TableCell>
                <TableCell>{getCustomerName(activity.potentialCustomerId)}</TableCell>
                <TableCell>{getContactName(activity.contact)}</TableCell>
                <TableCell>{getUserName(activity.assignedUserId)}</TableCell>
                <TableCell>
                  {activity.isCompleted ? (
                    <span className="text-green-600 font-semibold">✓</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {activity.activityDate
                    ? new Date(activity.activityDate).toLocaleDateString(i18n.language)
                    : '-'}
                </TableCell>
                <TableCell>
                  {new Date(activity.createdDate).toLocaleDateString(i18n.language)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {!activity.isCompleted && activity.status !== 'Canceled' && (
                      <>
                        {activity.status !== 'Completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsCompleted(activity)}
                            disabled={updateActivity.isPending}
                          >
                            {t('activityManagement.markAsCompleted', 'Tamamla')}
                          </Button>
                        )}
                        {activity.status !== 'In Progress' && activity.status !== 'Completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsInProgress(activity)}
                            disabled={updateActivity.isPending}
                          >
                            {t('activityManagement.markAsInProgress', 'Devam Et')}
                          </Button>
                        )}
                        {activity.status !== 'Canceled' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancel(activity)}
                            disabled={updateActivity.isPending}
                          >
                            {t('activityManagement.cancelActivity', 'İptal')}
                          </Button>
                        )}
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(activity)}
                    >
                      {t('activityManagement.editButton', 'Düzenle')}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(activity)}
                    >
                      {t('activityManagement.delete', 'Sil')}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
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
          >
            {t('activityManagement.previous', 'Önceki')}
          </Button>
          <div className="flex items-center px-4 text-sm">
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
          >
            {t('activityManagement.next', 'Sonraki')}
          </Button>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('activityManagement.deleteTitle', 'Aktiviteyi Sil')}
            </DialogTitle>
            <DialogDescription>
              {t('activityManagement.confirmDelete', 'Bu aktiviteyi silmek istediğinizden emin misiniz?')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteActivity.isPending}
            >
              {t('activityManagement.cancel', 'İptal')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteActivity.isPending}
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
