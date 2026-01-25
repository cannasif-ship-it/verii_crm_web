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
import { useActivityTypeList } from '../hooks/useActivityTypeList';
import { useDeleteActivityType } from '../hooks/useDeleteActivityType';
import type { ActivityTypeDto } from '../types/activity-type-types';
import type { PagedFilter } from '@/types/api';

interface ActivityTypeTableProps {
  onEdit: (activityType: ActivityTypeDto) => void;
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: PagedFilter[] | Record<string, unknown>;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
}

export function ActivityTypeTable({
  onEdit,
  pageNumber,
  pageSize,
  sortBy = 'Id',
  sortDirection = 'desc',
  filters = {},
  onPageChange,
  onSortChange,
}: ActivityTypeTableProps): ReactElement {
  const { t, i18n } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedActivityType, setSelectedActivityType] = useState<ActivityTypeDto | null>(null);

  const { data, isLoading } = useActivityTypeList({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    filters: filters as PagedFilter[] | undefined,
  });

  const deleteActivityType = useDeleteActivityType();

  const handleDeleteClick = (activityType: ActivityTypeDto): void => {
    setSelectedActivityType(activityType);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (selectedActivityType) {
      await deleteActivityType.mutateAsync(selectedActivityType.id);
      setDeleteDialogOpen(false);
      setSelectedActivityType(null);
    }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">
          {t('activityType.loading', 'Yükleniyor...')}
        </div>
      </div>
    );
  }

  const activityTypes = data?.data || (data as any)?.items || [];
  
  if (!data || activityTypes.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">
          {t('activityType.noData', 'Veri yok')}
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil((data.totalCount || 0) / pageSize);

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('Id')}
              >
                <div className="flex items-center">
                  {t('activityType.table.id', 'ID')}
                  <SortIcon column="Id" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('Name')}
              >
                <div className="flex items-center">
                  {t('activityType.table.name', 'Aktivite Tipi Adı')}
                  <SortIcon column="Name" />
                </div>
              </TableHead>
              <TableHead>
                {t('activityType.table.description', 'Açıklama')}
              </TableHead>
              <TableHead>
                {t('activityType.table.createdDate', 'Oluşturulma Tarihi')}
              </TableHead>
              <TableHead>
                {t('activityType.table.createdBy', 'Oluşturan Kullanıcı')}
              </TableHead>
              <TableHead className="text-right">
                {t('activityType.actions', 'İşlemler')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activityTypes.map((activityType: ActivityTypeDto) => (
              <TableRow key={activityType.id}>
                <TableCell>{activityType.id}</TableCell>
                <TableCell className="font-medium">{activityType.name}</TableCell>
                <TableCell>{activityType.description || '-'}</TableCell>
                <TableCell>
                  {activityType.createdDate ? new Date(activityType.createdDate).toLocaleDateString(i18n.language) : '-'}
                </TableCell>
                <TableCell>
                  {activityType.createdByFullUser || activityType.createdByFullName || activityType.createdBy || '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(activityType)}
                    >
                      {t('activityType.edit', 'Düzenle')}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(activityType)}
                    >
                      {t('activityType.deleteButton', 'Sil')}
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
          {t('activityType.table.showing', '{{from}}-{{to}} / {{total}} gösteriliyor', {
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
            {t('activityType.previous', 'Önceki')}
          </Button>
          <div className="flex items-center px-4 text-sm">
            {t('activityType.table.page', 'Sayfa {{current}} / {{total}}', {
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
            {t('activityType.next', 'Sonraki')}
          </Button>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('activityType.deleteConfirm.confirmTitle', 'Aktivite Tipini Sil')}
            </DialogTitle>
            <DialogDescription>
              {t('activityType.deleteConfirm.confirmMessage', '{{name}} aktivite tipini silmek istediğinizden emin misiniz?', {
                name: selectedActivityType?.name || '',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteActivityType.isPending}
            >
              {t('activityType.cancel', 'İptal')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteActivityType.isPending}
            >
              {deleteActivityType.isPending
                ? t('activityType.loading', 'Yükleniyor...')
                : t('activityType.deleteButton', 'Sil')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
