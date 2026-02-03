import { type ReactElement, useState, useMemo } from 'react';
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
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
    DropdownMenu, 
    DropdownMenuCheckboxItem, 
    DropdownMenuContent, 
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { 
  Edit2, 
  Trash2, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  EyeOff,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar
} from 'lucide-react';
import { Alert02Icon } from 'hugeicons-react';
import { useDeletePaymentType } from '../hooks/useDeletePaymentType';
import type { PaymentTypeDto } from '../types/payment-type-types';

export interface ColumnDef<T> {
  key: keyof T | 'status';
  label: string;
  type: 'text' | 'date' | 'status' | 'code' | 'id';
  className?: string;
}

interface PaymentTypeTableProps {
  paymentTypes: PaymentTypeDto[];
  isLoading: boolean;
  onEdit: (paymentType: PaymentTypeDto) => void;
}

const getColumnsConfig = (t: any): ColumnDef<PaymentTypeDto>[] => [
    { key: 'id', label: t('paymentTypeManagement.table.id', 'ID'), type: 'id', className: 'w-[80px]' },
    { key: 'name', label: t('paymentTypeManagement.table.name', 'Ad'), type: 'text', className: 'min-w-[200px] font-medium' },
    { key: 'description', label: t('paymentTypeManagement.table.description', 'Açıklama'), type: 'text', className: 'min-w-[250px]' },
    { key: 'createdDate', label: t('paymentTypeManagement.createdDate', 'Oluşturulma Tarihi'), type: 'date', className: 'w-[150px]' },
    { key: 'updatedDate', label: t('paymentTypeManagement.updatedDate', 'Güncellenme Tarihi'), type: 'date', className: 'w-[150px]' },
    { key: 'isDeleted', label: t('paymentTypeManagement.table.status', 'Durum'), type: 'status', className: 'w-[120px]' },
];

export function PaymentTypeTable({
  paymentTypes,
  isLoading,
  onEdit,
}: PaymentTypeTableProps): ReactElement {
  const { t, i18n } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentTypeDto | null>(null);
  const deletePaymentType = useDeletePaymentType();
  
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [sortConfig, setSortConfig] = useState<{ key: keyof PaymentTypeDto | 'status'; direction: 'asc' | 'desc' } | null>(null);

  const tableColumns = useMemo(() => getColumnsConfig(t), [t]);
  
  const [visibleColumns, setVisibleColumns] = useState<Array<keyof PaymentTypeDto | 'status'>>(
    tableColumns.map(col => col.key)
  );

  const processedPaymentTypes = useMemo(() => {
    let result = [...paymentTypes];

    if (sortConfig) {
      result.sort((a, b) => {
        // @ts-ignore
        const aValue = a[sortConfig.key] ? String(a[sortConfig.key]).toLowerCase() : '';
        // @ts-ignore
        const bValue = b[sortConfig.key] ? String(b[sortConfig.key]).toLowerCase() : '';

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [paymentTypes, sortConfig]);

  const totalPages = Math.ceil(processedPaymentTypes.length / pageSize);
  const paginatedPaymentTypes = processedPaymentTypes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDeleteClick = (paymentType: PaymentTypeDto): void => {
    setSelectedPaymentType(paymentType);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (selectedPaymentType) {
      try {
        await deletePaymentType.mutateAsync(selectedPaymentType.id);
        toast.success(t('paymentTypeManagement.delete.success', 'Ödeme tipi başarıyla silindi'));
        setDeleteDialogOpen(false);
        setSelectedPaymentType(null);
      } catch (error) {
        toast.error(t('paymentTypeManagement.delete.error', 'Ödeme tipi silinirken bir hata oluştu'));
      }
    }
  };

  const handleSort = (key: keyof PaymentTypeDto | 'status') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const toggleColumn = (key: keyof PaymentTypeDto | 'status') => {
    setVisibleColumns(prev => 
      prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
    );
  };

  const renderCellContent = (item: PaymentTypeDto, column: ColumnDef<PaymentTypeDto>) => {
    // @ts-ignore
    const value = item[column.key];
    
    if (column.key === 'isDeleted') {
        const isActive = !item.isDeleted;
        
        return (
            <Badge 
                variant="outline" 
                className={`gap-1.5 pl-1.5 pr-2.5 py-0.5 border ${
                    isActive 
                        ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20' 
                        : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20'
                }`}
            >
                {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                {isActive ? t('status.active', 'Aktif') : t('status.inactive', 'Pasif')}
            </Badge>
        );
    }

    if (!value && value !== 0) return '-';

    switch (column.type) {
        case 'id':
            return <span className="font-mono text-xs text-slate-500">{String(value)}</span>;
        case 'date':
             return <div className="flex items-center gap-2 text-xs"><Calendar size={14} className="text-slate-400" />{new Date(String(value)).toLocaleDateString(i18n.language)}</div>;
        default:
            return String(value);
    }
  };

  const SortIcon = ({ column }: { column: keyof PaymentTypeDto | 'status' }): ReactElement => {
    if (sortConfig?.key !== column) {
      return <ArrowUpDown size={14} className="ml-2 inline-block text-slate-400 opacity-50 group-hover:opacity-100 transition-opacity" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp size={14} className="ml-2 inline-block text-pink-600 dark:text-pink-400" />
    ) : (
      <ArrowDown size={14} className="ml-2 inline-block text-pink-600 dark:text-pink-400" />
    );
  };

  const headStyle = "cursor-pointer select-none text-slate-500 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-4 font-bold text-xs uppercase tracking-wider whitespace-nowrap";
  const cellStyle = "text-slate-600 dark:text-slate-400 text-sm py-4 border-b border-slate-100 dark:border-white/5 align-middle";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
           <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-current text-pink-500" />
           <div className="text-sm text-muted-foreground animate-pulse">
             {t('common.loading', 'Yükleniyor...')}
           </div>
        </div>
      </div>
    );
  }

  if (paymentTypes.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[400px]">
        <div className="text-muted-foreground bg-slate-50 dark:bg-white/5 px-8 py-6 rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-sm font-medium">
          {t('paymentTypeManagement.noData', 'Veri bulunamadı')}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      
      <div className="flex justify-end p-2 sm:p-0">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="ml-auto h-9 lg:flex border-dashed border-slate-300 dark:border-white/20 bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 text-xs sm:text-sm"
                    >
                        <EyeOff className="mr-2 h-4 w-4" />
                        {t('common.editColumns', 'Sütunları Düzenle')}
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                    align="end" 
                    className="w-56 max-h-[400px] overflow-y-auto bg-white/95 dark:bg-[#1a1025]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-xl rounded-xl p-2 z-50"
                >
                    <DropdownMenuLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 py-1.5">
                        {t('common.visibleColumns', 'Görünür Sütunlar')}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10 my-1" />
                    
                    {tableColumns.map((col) => (
                        <DropdownMenuCheckboxItem
                            key={col.key}
                            checked={visibleColumns.includes(col.key)}
                            onSelect={(e) => e.preventDefault()} 
                            onCheckedChange={() => toggleColumn(col.key)}
                            className="text-sm text-slate-700 dark:text-slate-200 focus:bg-pink-50 dark:focus:bg-pink-500/10 focus:text-pink-600 dark:focus:text-pink-400 cursor-pointer rounded-lg px-2 py-1.5 pl-8 relative"
                        >
                            {col.label}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white/50 dark:bg-transparent">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-white/5">
            <TableRow className="border-b border-slate-200 dark:border-white/10 hover:bg-transparent">
              {tableColumns
                .filter(col => visibleColumns.includes(col.key))
                .map((column) => (
                  <TableHead
                    key={column.key}
                    className={`${headStyle} ${column.className || ''}`}
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2 group">
                      {column.label}
                      <SortIcon column={column.key} />
                    </div>
                  </TableHead>
              ))}
              <TableHead className={`text-right ${headStyle} w-[100px]`}>
                {t('common.actions', 'İşlemler')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPaymentTypes.map((paymentType: PaymentTypeDto) => (
              <TableRow 
                key={paymentType.id}
                className="border-b border-slate-100 dark:border-white/5 transition-colors duration-200 hover:bg-pink-50/40 dark:hover:bg-pink-500/5 group last:border-0"
              >
                {tableColumns
                    .filter(col => visibleColumns.includes(col.key))
                    .map((column) => (
                    <TableCell key={`${paymentType.id}-${column.key}`} className={cellStyle}>
                        {renderCellContent(paymentType, column)}
                    </TableCell>
                ))}
                <TableCell className="text-right py-3 pr-4">
                  <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                      onClick={() => onEdit(paymentType)}
                      title={t('common.edit', 'Düzenle')}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                      onClick={() => handleDeleteClick(paymentType)}
                      title={t('common.delete', 'Sil')}
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
          {t('paymentTypeManagement.table.showing', '{{from}}-{{to}} / {{total}} gösteriliyor', {
            from: (currentPage - 1) * pageSize + 1,
            to: Math.min(currentPage * pageSize, processedPaymentTypes.length),
            total: processedPaymentTypes.length,
          })}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage <= 1} className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5">{t('common.previous', 'Önceki')}</Button>
          <div className="flex items-center px-4 text-sm font-medium text-slate-700 dark:text-slate-200">{t('paymentTypeManagement.table.page', 'Sayfa {{current}} / {{total}}', { current: currentPage, total: totalPages || 1 })}</div>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage >= totalPages} className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5">{t('common.next', 'Sonraki')}</Button>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#130822] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white w-[90%] sm:w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-0 gap-0">
          <DialogHeader className="flex flex-col items-center gap-4 text-center pb-6 pt-10 px-6">
            <div className="h-20 w-20 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-2 animate-in zoom-in duration-300">
               <Alert02Icon size={36} className="text-red-600 dark:text-red-500" />
            </div>
            <div className="space-y-2">
                <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                {t('paymentTypeManagement.delete.confirmTitle', 'Ödeme Tipini Sil')}
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 max-w-[280px] mx-auto text-sm leading-relaxed">
                {t('paymentTypeManagement.delete.confirmMessage', '{{name}} ödeme tipini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.', {
                    name: selectedPaymentType?.name || '',
                })}
                </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-3 justify-center p-6 bg-slate-50/50 dark:bg-[#1a1025]/50 border-t border-slate-100 dark:border-white/5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="flex-1 h-12 rounded-xl border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-white/5 font-semibold"
            >
              {t('common.cancel', 'Vazgeç')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deletePaymentType.isPending}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] font-bold"
            >
              {deletePaymentType.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('common.delete', 'Evet, Sil')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
