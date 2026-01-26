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
import { 
  Edit2, 
  Trash2, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Calendar, 
  User, 
  FileText,
  ListTodo
} from 'lucide-react';

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
      return <ArrowUpDown size={14} className="ml-2 inline-block text-slate-400 opacity-50" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={14} className="ml-2 inline-block text-pink-600 dark:text-pink-400" />
    ) : (
      <ArrowDown size={14} className="ml-2 inline-block text-pink-600 dark:text-pink-400" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
           <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-current text-pink-500" />
           <div className="text-sm text-muted-foreground animate-pulse">
             {t('activityType.loading', 'Yükleniyor...')}
           </div>
        </div>
      </div>
    );
  }

  const activityTypes = data?.data || [];
  
  if (!data || activityTypes.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground bg-slate-50 dark:bg-white/5 px-6 py-4 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
          {t('activityType.noData', 'Veri yok')}
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil((data.totalCount || 0) / pageSize);

  const headStyle = "cursor-pointer select-none text-slate-500 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-4";

  return (
    <>
      <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white/50 dark:bg-transparent">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-white/5">
            <TableRow className="border-b border-slate-200 dark:border-white/10 hover:bg-transparent">
              
              <TableHead onClick={() => handleSort('Id')} className={headStyle}>
                <div className="flex items-center">
                  {t('activityType.table.id', 'ID')}
                  <SortIcon column="Id" />
                </div>
              </TableHead>

              <TableHead onClick={() => handleSort('Name')} className={headStyle}>
                <div className="flex items-center">
                  {t('activityType.table.name', 'Aktivite Tipi Adı')}
                  <SortIcon column="Name" />
                </div>
              </TableHead>

              <TableHead className="text-slate-500 dark:text-slate-400">
                {t('activityType.table.description', 'Açıklama')}
              </TableHead>

              <TableHead onClick={() => handleSort('CreatedDate')} className={headStyle}>
                <div className="flex items-center">
                   {t('activityType.table.createdDate', 'Oluşturulma Tarihi')}
                   <SortIcon column="CreatedDate" />
                </div>
              </TableHead>

              <TableHead className="text-slate-500 dark:text-slate-400">
                {t('activityType.table.createdBy', 'Oluşturan Kullanıcı')}
              </TableHead>

              <TableHead className="text-right text-slate-500 dark:text-slate-400">
                {t('activityType.actions', 'İşlemler')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activityTypes.map((activityType: ActivityTypeDto, index: number) => (
              <TableRow 
                key={activityType.id || `activity-${index}`}
                className="border-b border-slate-100 dark:border-white/5 transition-colors duration-200 hover:bg-pink-50/40 dark:hover:bg-pink-500/5 group"
              >
                <TableCell className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                    {activityType.id}
                </TableCell>
                
                <TableCell className="font-medium text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                        <ListTodo size={14} className="text-slate-400" />
                        {activityType.name}
                    </div>
                </TableCell>

                <TableCell className="text-slate-600 dark:text-slate-400 text-xs">
                     {activityType.description ? (
                        <div className="flex items-center gap-2">
                             <FileText size={14} className="text-slate-400" /> 
                             <span className="truncate max-w-[200px]">{activityType.description}</span>
                        </div>
                    ) : '-'}
                </TableCell>

                <TableCell className="text-slate-600 dark:text-slate-400 text-xs">
                     {activityType.createdDate ? (
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-pink-500/50" />
                            {new Date(activityType.createdDate).toLocaleDateString(i18n.language)}
                        </div>
                     ) : '-'}
                </TableCell>

                <TableCell className="text-slate-600 dark:text-slate-400 text-xs">
                     {(activityType.createdByFullUser || activityType.createdByFullName || activityType.createdBy) ? (
                        <div className="flex items-center gap-2">
                             <User size={14} className="text-indigo-500/50" /> 
                             {activityType.createdByFullUser || activityType.createdByFullName || activityType.createdBy}
                        </div>
                    ) : '-'}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                      onClick={() => onEdit(activityType)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                      onClick={() => handleDeleteClick(activityType)}
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

      <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
        <div className="text-sm text-slate-500 dark:text-slate-400">
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
            className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"
          >
            {t('activityType.previous', 'Önceki')}
          </Button>
          <div className="flex items-center px-4 text-sm font-medium text-slate-700 dark:text-slate-200">
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
            className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"
          >
            {t('activityType.next', 'Sonraki')}
          </Button>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#130822] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">
              {t('activityType.deleteConfirm.confirmTitle', 'Aktivite Tipini Sil')}
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              {t('activityType.deleteConfirm.confirmMessage', '{{name}} aktivite tipini silmek istediğinizden emin misiniz?', {
                name: selectedActivityType?.name || '',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteActivityType.isPending}
              className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
            >
              {t('activityType.cancel', 'İptal')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteActivityType.isPending}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-900/50 dark:hover:bg-red-900/70 border border-transparent dark:border-red-500/20 text-white"
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