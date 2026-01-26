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
import { Edit2, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDistrictList } from '../hooks/useDistrictList';
import { useDeleteDistrict } from '../hooks/useDeleteDistrict';
import type { DistrictDto } from '../types/district-types';
import type { PagedFilter } from '@/types/api';

interface DistrictTableProps {
  onEdit: (district: DistrictDto) => void;
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: PagedFilter[] | Record<string, unknown>;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
}

export function DistrictTable({
  onEdit,
  pageNumber,
  pageSize,
  sortBy = 'Id',
  sortDirection = 'desc',
  filters = {},
  onPageChange,
  onSortChange,
}: DistrictTableProps): ReactElement {
  const { t, i18n } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictDto | null>(null);

  const { data, isLoading } = useDistrictList({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    filters: filters as PagedFilter[] | undefined,
  });

  const deleteDistrict = useDeleteDistrict();

  const handleDeleteClick = (district: DistrictDto): void => {
    setSelectedDistrict(district);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (selectedDistrict) {
      await deleteDistrict.mutateAsync(selectedDistrict.id);
      setDeleteDialogOpen(false);
      setSelectedDistrict(null);
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
          {t('districtManagement.loading', 'Yükleniyor...')}
        </div>
      </div>
    );
  }

  const districts = data?.data || [];

  if (!data || districts.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">
          {t('districtManagement.noData', 'Veri yok')}
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
                  {t('districtManagement.table.id', 'ID')}
                  <SortIcon column="Id" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('Name')}
              >
                <div className="flex items-center">
                  {t('districtManagement.table.name', 'İlçe Adı')}
                  <SortIcon column="Name" />
                </div>
              </TableHead>
              <TableHead>
                {t('districtManagement.table.erpCode', 'ERP Kodu')}
              </TableHead>
              <TableHead>
                {t('districtManagement.table.cityName', 'Şehir Adı')}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('CreatedDate')}
              >
                <div className="flex items-center">
                  {t('districtManagement.table.createdDate', 'Oluşturulma Tarihi')}
                  <SortIcon column="CreatedDate" />
                </div>
              </TableHead>
              <TableHead>
                {t('districtManagement.table.createdBy', 'Oluşturan')}
              </TableHead>
              <TableHead className="text-right text-slate-500 dark:text-slate-400 py-4">
                {t('districtManagement.actions', 'İşlemler')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {districts.map((district: DistrictDto) => (
              <TableRow 
                key={district.id}
                className="border-b border-slate-100 dark:border-white/5 transition-colors duration-200 hover:bg-pink-50/40 dark:hover:bg-pink-500/5 group"
              >
                <TableCell className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                  {district.id}
                </TableCell>
                <TableCell className="font-medium text-slate-900 dark:text-white">
                  {district.name}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {district.erpCode || '-'}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {district.cityName || '-'}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                  {new Date(district.createdDate).toLocaleDateString(i18n.language)}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {district.createdByFullUser || '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                      onClick={() => onEdit(district)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                      onClick={() => handleDeleteClick(district)}
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
          {t('districtManagement.table.showing', '{{from}}-{{to}} / {{total}} gösteriliyor', {
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
            {t('districtManagement.previous', 'Önceki')}
          </Button>
          <div className="flex items-center px-4 text-sm font-medium text-slate-700 dark:text-slate-200">
            {t('districtManagement.table.page', 'Sayfa {{current}} / {{total}}', {
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
            {t('districtManagement.next', 'Sonraki')}
          </Button>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#130822] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">
              {t('districtManagement.deleteConfirm.confirmTitle', 'İlçeyi Sil')}
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              {t('districtManagement.deleteConfirm.confirmMessage', '{{name}} ilçesini silmek istediğinizden emin misiniz?', {
                name: selectedDistrict?.name || '',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteDistrict.isPending}
              className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
            >
              {t('districtManagement.cancel', 'İptal')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteDistrict.isPending}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-900/50 dark:hover:bg-red-900/70 border border-transparent dark:border-red-500/20 text-white"
            >
              {deleteDistrict.isPending
                ? t('districtManagement.loading', 'Yükleniyor...')
                : t('districtManagement.delete', 'Sil')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
