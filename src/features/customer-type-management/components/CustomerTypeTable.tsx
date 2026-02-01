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
import { useCustomerTypeList } from '../hooks/useCustomerTypeList';
import { useDeleteCustomerType } from '../hooks/useDeleteCustomerType';
import type { CustomerTypeDto } from '../types/customer-type-types';
import type { PagedFilter } from '@/types/api';
import { 
  Edit2, 
  Trash2, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  FileText,
  Calendar,
  User,
  Tag
} from 'lucide-react';

interface CustomerTypeTableProps {
  onEdit: (customerType: CustomerTypeDto) => void;
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: PagedFilter[] | Record<string, unknown>;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
}

export function CustomerTypeTable({
  onEdit,
  pageNumber,
  pageSize,
  sortBy = 'Id',
  sortDirection = 'desc',
  filters = {},
  onPageChange,
  onSortChange,
}: CustomerTypeTableProps): ReactElement {
  const { t, i18n } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomerType, setSelectedCustomerType] = useState<CustomerTypeDto | null>(null);

  const { data, isLoading, isFetching } = useCustomerTypeList({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    filters: filters as PagedFilter[] | undefined,
  });

  const deleteCustomerType = useDeleteCustomerType();

  const handleDeleteClick = (customerType: CustomerTypeDto): void => {
    setSelectedCustomerType(customerType);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (selectedCustomerType) {
      await deleteCustomerType.mutateAsync(selectedCustomerType.id);
      setDeleteDialogOpen(false);
      setSelectedCustomerType(null);
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

  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
           <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-current text-pink-500" />
           <span className="text-sm font-medium text-muted-foreground animate-pulse">
             {t('customerTypeManagement.loading', 'Yükleniyor...')}
           </span>
        </div>
      </div>
    );
  }

  const customerTypes = data?.data || [];

  if (!data || customerTypes.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[500px]">
        <div className="text-muted-foreground bg-slate-50 dark:bg-white/5 px-8 py-6 rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-sm font-medium">
          {t('customerTypeManagement.noData', 'Veri bulunamadı')}
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
                    {t('customerTypeManagement.table.id', 'ID')}
                    <SortIcon column="Id" />
                  </div>
                </TableHead>

                <TableHead onClick={() => handleSort('Name')} className={headStyle}>
                  <div className="flex items-center">
                    {t('customerTypeManagement.table.name', 'Müşteri Tipi Adı')}
                    <SortIcon column="Name" />
                  </div>
                </TableHead>

                <TableHead className={headStyle}>
                  {t('customerTypeManagement.table.description', 'Açıklama')}
                </TableHead>

                <TableHead onClick={() => handleSort('CreatedDate')} className={headStyle}>
                  <div className="flex items-center">
                    {t('customerTypeManagement.table.createdDate', 'Oluşturulma')}
                    <SortIcon column="CreatedDate" />
                  </div>
                </TableHead>

                <TableHead className={headStyle}>
                  {t('customerTypeManagement.table.createdBy', 'Oluşturan')}
                </TableHead>

                <TableHead className={`${headStyle} text-right`}>
                  {t('customerTypeManagement.actions', 'İşlemler')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerTypes.map((customerType: CustomerTypeDto, index: number) => (
                <TableRow 
                  key={customerType.id || `customer-type-${index}`}
                  className="border-b border-slate-100 dark:border-white/5 transition-colors duration-200 hover:bg-pink-50/40 dark:hover:bg-pink-500/5 group"
                >
                  <TableCell className={`${cellStyle} font-medium text-slate-700 dark:text-slate-300 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors`}>
                    {customerType.id}
                  </TableCell>
                  
                  <TableCell className={`${cellStyle} font-semibold text-slate-900 dark:text-white min-w-[200px]`}>
                     <div className="flex items-center gap-2">
                        <Tag size={14} className="text-pink-500" />
                        {customerType.name}
                     </div>
                  </TableCell>

                  {/* Açıklama alanı genişleyebilir (min-w) ve wrap olur */}
                  <TableCell className={`${cellStyle} min-w-[300px] leading-relaxed`}>
                     {customerType.description ? (
                       <div className="flex items-start gap-2">
                          <FileText size={14} className="text-slate-400 mt-0.5 shrink-0" />
                          <span>{customerType.description}</span>
                       </div>
                     ) : '-'}
                  </TableCell>

                  <TableCell className={`${cellStyle} whitespace-nowrap`}>
                    <div className="flex items-center gap-2 text-xs">
                       <Calendar size={14} className="text-pink-500/50" />
                       {new Date(customerType.createdDate).toLocaleDateString(i18n.language)}
                    </div>
                  </TableCell>

                  <TableCell className={`${cellStyle} whitespace-nowrap`}>
                     {customerType.createdByFullUser ? (
                        <div className="flex items-center gap-2 text-xs">
                             <User size={14} className="text-indigo-500/50" /> {customerType.createdByFullUser}
                        </div>
                    ) : '-'}
                  </TableCell>

                  <TableCell className={`${cellStyle} text-right`}>
                    <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                        onClick={() => onEdit(customerType)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                        onClick={() => handleDeleteClick(customerType)}
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
          {t('customerTypeManagement.table.showing', '{{from}}-{{to}} / {{total}} kayıt', {
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
            {t('customerTypeManagement.previous', 'Önceki')}
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
            {t('customerTypeManagement.next', 'Sonraki')}
          </Button>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#130822] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white sm:rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">
              {t('customerTypeManagement.delete.confirmTitle', 'Müşteri Tipini Sil')}
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              {t('customerTypeManagement.delete.confirmMessage', '{{name}} müşteri tipini silmek istediğinizden emin misiniz?', {
                name: selectedCustomerType?.name || '',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteCustomerType.isPending}
              className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
            >
              {t('customerTypeManagement.form.cancel', 'İptal')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteCustomerType.isPending}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-900/50 dark:hover:bg-red-900/70 border border-transparent dark:border-red-500/20 text-white"
            >
              {deleteCustomerType.isPending
                ? t('customerTypeManagement.delete.deleting', 'Siliniyor...')
                : t('customerTypeManagement.delete.confirmButton', 'Sil')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}