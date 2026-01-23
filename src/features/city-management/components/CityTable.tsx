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
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { useCityList } from '../hooks/useCityList';
import { useDeleteCity } from '../hooks/useDeleteCity';
import type { CityDto } from '../types/city-types';
import type { PagedFilter } from '@/types/api';
import { Edit2, Trash2, Map, AlertCircle } from 'lucide-react';

interface CityTableProps {
  onEdit: (city: CityDto) => void;
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: PagedFilter[] | Record<string, unknown>;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
}

export function CityTable({
  onEdit,
  pageNumber,
  pageSize,
  sortBy = 'Id',
  sortDirection = 'desc',
  filters = {},
  onPageChange,
  onSortChange,
}: CityTableProps): ReactElement {
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CityDto | null>(null);

  const { data, isLoading, isFetching } = useCityList({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    filters: filters as PagedFilter[] | undefined,
  });

  const deleteCity = useDeleteCity();

  const handleDeleteClick = (city: CityDto): void => {
    setSelectedCity(city);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (selectedCity) {
      await deleteCity.mutateAsync(selectedCity.id);
      setDeleteDialogOpen(false);
      setSelectedCity(null);
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
          className="ml-1 inline-block text-slate-300 dark:text-slate-600"
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
        className="ml-1 inline-block text-pink-500"
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
        className="ml-1 inline-block text-pink-500"
      >
        <path d="M16 15l-4 4-4-4" />
      </svg>
    );
  };

  const headStyle = "cursor-pointer select-none text-slate-500 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-4";

  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-current text-pink-500" />
          <div className="text-sm text-muted-foreground animate-pulse">
            {t('common.loading', 'Yükleniyor...')}
          </div>
        </div>
      </div>
    );
  }

  const cities = data?.data || (data as any)?.items || [];

  if (!data || cities.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground bg-slate-50 dark:bg-white/5 px-6 py-4 rounded-xl border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center gap-2">
          <Map size={40} className="opacity-20" />
          <span>{t('cityManagement.noData', 'Veri bulunamadı')}</span>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil((data.totalCount || 0) / pageSize);

  return (
    <div className="w-full">
      <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-white/5">
            <TableRow className="border-b border-slate-200 dark:border-white/10 hover:bg-transparent">
              <TableHead
                className={headStyle}
                onClick={() => handleSort('Id')}
              >
                <div className="flex items-center">
                  {t('cityManagement.table.id', 'ID')}
                  <SortIcon column="Id" />
                </div>
              </TableHead>
              <TableHead
                className={headStyle}
                onClick={() => handleSort('Name')}
              >
                <div className="flex items-center">
                  {t('cityManagement.table.name', 'Şehir Adı')}
                  <SortIcon column="Name" />
                </div>
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400 py-4">
                {t('cityManagement.table.erpCode', 'ERP Kodu')}
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400 py-4">
                {t('cityManagement.table.countryName', 'Ülke Adı')}
              </TableHead>
              <TableHead
                className={headStyle}
                onClick={() => handleSort('CreatedDate')}
              >
                <div className="flex items-center">
                  {t('cityManagement.table.createdDate', 'Oluşturulma Tarihi')}
                  <SortIcon column="CreatedDate" />
                </div>
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400 py-4">
                {t('cityManagement.table.createdBy', 'Oluşturan')}
              </TableHead>
              <TableHead className="text-right text-slate-500 dark:text-slate-400 py-4">
                {t('common.actions', 'İşlemler')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cities.map((city: CityDto) => (
              <TableRow 
                key={city.id}
                className="group border-b border-slate-200 dark:border-white/10 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors"
              >
                <TableCell className="font-medium text-slate-700 dark:text-slate-300">
                  #{city.id}
                </TableCell>
                <TableCell className="font-semibold text-slate-900 dark:text-white">
                  {city.name}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  <div className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 dark:bg-white/10 text-xs font-medium">
                    {city.erpCode || '-'}
                  </div>
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {city.countryName || '-'}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {new Date(city.createdDate).toLocaleDateString('tr-TR')}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-pink-500/20 to-orange-500/20 flex items-center justify-center text-[10px] font-bold text-pink-600 dark:text-pink-400">
                      {(city.createdByFullUser || 'System').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm">{city.createdByFullUser || '-'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(city)}
                      className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(city)}
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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

      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          {t('cityManagement.table.showing', '{{from}}-{{to}} / {{total}} gösteriliyor', {
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
            {t('common.previous', 'Önceki')}
          </Button>
          <div className="flex items-center px-4 text-sm font-medium text-slate-700 dark:text-slate-200">
            {t('cityManagement.table.page', 'Sayfa {{current}} / {{total}}', {
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
            {t('common.next', 'Sonraki')}
          </Button>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] border-0 bg-white dark:bg-[#130822] shadow-2xl p-0 overflow-hidden rounded-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-orange-500" />
          
          <div className="p-6 pb-0">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-500" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {t('common.deleteConfirmTitle', 'Silme Onayı')}
                </DialogTitle>
                <DialogDescription className="mt-1 text-zinc-500 dark:text-zinc-400">
                  {t('cityManagement.delete.confirmMessage', '{{name}} şehrini silmek istediğinizden emin misiniz?', {
                    name: selectedCity?.name || '',
                  })}
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-6 bg-zinc-50/50 dark:bg-zinc-900/50 mt-6 border-t border-zinc-100 dark:border-zinc-800">
             <div className="flex justify-end gap-3">
               <DialogClose asChild>
                 <Button variant="outline" className="border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                   {t('common.cancel', 'İptal')}
                 </Button>
               </DialogClose>
               <Button 
                 variant="destructive" 
                 onClick={handleDeleteConfirm}
                 disabled={deleteCity.isPending}
                 className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20"
               >
                 {deleteCity.isPending
                   ? t('common.deleting', 'Siliniyor...')
                   : t('common.delete', 'Sil')}
               </Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
