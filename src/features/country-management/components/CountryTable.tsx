import { type ReactElement, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
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
import { 
    DropdownMenu, 
    DropdownMenuCheckboxItem, 
    DropdownMenuContent, 
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useDeleteCountry } from '../hooks/useDeleteCountry';
import type { CountryDto } from '../types/country-types';
import { toast } from 'sonner';
import { 
  Edit2, 
  Trash2, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Calendar,
  EyeOff,
  ChevronDown,
  Loader2,
  User
} from 'lucide-react';
import { Alert02Icon } from 'hugeicons-react';

export interface ColumnDef<T> {
  key: keyof T | 'actions';
  label: string;
  type: 'text' | 'date' | 'user' | 'id';
  className?: string;
}

interface CountryTableProps {
  countries: CountryDto[];
  isLoading: boolean;
  onEdit: (country: CountryDto) => void;
}

const getColumnsConfig = (t: TFunction): ColumnDef<CountryDto>[] => [
    { key: 'id', label: t('countryManagement.table.id', 'ID'), type: 'id', className: 'w-[100px]' },
    { key: 'name', label: t('countryManagement.table.name', 'Ülke Adı'), type: 'text', className: 'min-w-[200px] font-medium' },
    { key: 'code', label: t('countryManagement.table.code', 'Ülke Kodu'), type: 'text', className: 'w-[140px]' },
    { key: 'erpCode', label: t('countryManagement.table.erpCode', 'ERP Kodu'), type: 'text', className: 'w-[140px]' },
    { key: 'createdDate', label: t('countryManagement.table.createdDate', 'Oluşturulma Tarihi'), type: 'date', className: 'w-[160px]' },
    { key: 'createdByFullUser', label: t('countryManagement.table.createdBy', 'Oluşturan'), type: 'user', className: 'w-[160px]' },
];

export function CountryTable({
  countries,
  isLoading,
  onEdit,
}: CountryTableProps): ReactElement {
  const { t, i18n } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryDto | null>(null);
  const deleteCountry = useDeleteCountry();
  
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [sortConfig, setSortConfig] = useState<{ key: keyof CountryDto; direction: 'asc' | 'desc' } | null>(null);

  const tableColumns = useMemo(() => getColumnsConfig(t), [t]);
  
  const [visibleColumns, setVisibleColumns] = useState<Array<keyof CountryDto | 'actions'>>(
    tableColumns.map(col => col.key)
  );

  const processedCountries = useMemo(() => {
    const result = [...countries];

    if (sortConfig) {
      result.sort((a, b) => {
        const aRaw = a[sortConfig.key];
        const bRaw = b[sortConfig.key];
        const aValue = aRaw != null ? String(aRaw).toLowerCase() : '';
        const bValue = bRaw != null ? String(bRaw).toLowerCase() : '';

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [countries, sortConfig]);

  const totalPages = Math.ceil(processedCountries.length / pageSize);
  const paginatedCountries = processedCountries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleDeleteClick = (country: CountryDto): void => {
    setSelectedCountry(country);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (selectedCountry) {
      try {
        await deleteCountry.mutateAsync(selectedCountry.id);
        setDeleteDialogOpen(false);
        setSelectedCountry(null);
        toast.success(t('countryManagement.messages.deleteSuccess', 'Ülke başarıyla silindi'));
      } catch (error) {
        console.error(error);
        toast.error(t('countryManagement.messages.deleteError', 'Ülke silinirken bir hata oluştu'));
      }
    }
  };

  const handleSort = (key: keyof CountryDto) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const toggleColumn = (key: keyof CountryDto | 'actions') => {
    setVisibleColumns(prev => 
      prev.includes(key) 
        ? prev.filter(c => c !== key)
        : [...prev, key]
    );
  };

  const renderCellContent = (item: CountryDto, column: ColumnDef<CountryDto>) => {
    if (column.key === 'actions') return '-';
    const value = item[column.key];

    if (!value && value !== 0) return '-';

    switch (column.type) {
        case 'id':
            return <span className="font-mono text-xs bg-slate-100 dark:bg-white/10 px-2 py-1 rounded text-slate-700 dark:text-slate-300">#{String(value)}</span>;
        case 'user':
            return (
                <div className="flex items-center gap-1.5">
                    <User size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate max-w-[150px]" title={String(value)}>
                        {String(value)}
                    </span>
                </div>
            );
        case 'date':
            return <div className="flex items-center gap-2 text-xs"><Calendar size={14} className="text-slate-400" />{new Date(String(value)).toLocaleDateString(i18n.language)}</div>;
        default:
            return String(value);
    }
  };

  const SortIcon = ({ column }: { column: keyof CountryDto }): ReactElement => {
    if (sortConfig?.key !== column) {
      return <ArrowUpDown size={14} className="ml-2 inline-block text-slate-400 opacity-50 group-hover:opacity-100 transition-opacity" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp size={14} className="ml-2 inline-block text-pink-600 dark:text-pink-400" />
    ) : (
      <ArrowDown size={14} className="ml-2 inline-block text-pink-600 dark:text-pink-400" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
           <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-current text-pink-500" />
           <div className="text-sm text-muted-foreground animate-pulse">
             {t('countryManagement.loading', 'Yükleniyor...')}
           </div>
        </div>
      </div>
    );
  }

  if (countries.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[400px]">
        <div className="text-muted-foreground bg-slate-50 dark:bg-white/5 px-8 py-6 rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-sm font-medium">
          {t('countryManagement.table.noData', 'Kayıt Bulunamadı')}
        </div>
      </div>
    );
  }

  const headStyle = "cursor-pointer select-none text-slate-500 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-4 font-bold text-xs uppercase tracking-wider whitespace-nowrap";
  const cellStyle = "text-slate-600 dark:text-slate-400 text-sm py-4 border-b border-slate-100 dark:border-white/5 align-middle";

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
            {tableColumns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.key}
                checked={visibleColumns.includes(column.key)}
                onCheckedChange={() => toggleColumn(column.key)}
                onSelect={(e) => e.preventDefault()}
                className="text-sm text-slate-700 dark:text-slate-200 focus:bg-pink-50 dark:focus:bg-pink-500/10 focus:text-pink-600 dark:focus:text-pink-400 cursor-pointer rounded-lg px-2 py-1.5 pl-8 relative"
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white/50 dark:bg-transparent">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-white/5">
            <TableRow className="border-b border-slate-200 dark:border-white/10 hover:bg-transparent">
              {tableColumns.filter(col => visibleColumns.includes(col.key)).map((column) => (
                <TableHead 
                  key={column.key}
                  onClick={() => handleSort(column.key as keyof CountryDto)}
                  className={headStyle}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    <SortIcon column={column.key as keyof CountryDto} />
                  </div>
                </TableHead>
              ))}
              <TableHead className={`${headStyle} text-right w-[100px]`}>
                {t('common.actions', 'İşlemler')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCountries.map((country, index) => (
              <TableRow 
                key={country.id || `country-${index}`}
                className="border-b border-slate-100 dark:border-white/5 transition-colors duration-200 hover:bg-pink-50/40 dark:hover:bg-pink-500/5 group last:border-0"
              >
                {tableColumns.filter(col => visibleColumns.includes(col.key)).map((column) => (
                  <TableCell key={`${country.id}-${column.key}`} className={`${cellStyle} ${column.className || ''}`}>
                    {renderCellContent(country, column)}
                  </TableCell>
                ))}
                <TableCell className={`${cellStyle} text-right`}>
                  <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(country)}
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(country)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
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
          {t('common.table.showing', '{{from}}-{{to}} / {{total}} gösteriliyor', {
            from: (currentPage - 1) * pageSize + 1,
            to: Math.min(currentPage * pageSize, processedCountries.length),
            total: processedCountries.length,
          })}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"
          >
            {t('common.previous', 'Önceki')}
          </Button>
          <div className="flex items-center px-4 text-sm font-medium text-slate-700 dark:text-slate-200">
            {t('common.table.page', 'Sayfa {{current}} / {{total}}', { current: currentPage, total: totalPages || 1 })}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"
          >
            {t('common.next', 'Sonraki')}
          </Button>
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
                        {t('countryManagement.deleteTitle', 'Ülkeyi Sil')}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400 max-w-[280px] mx-auto text-sm leading-relaxed">
                        {t('countryManagement.deleteConfirmation', '{{name}} isimli ülkeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.', { name: selectedCountry?.name })}
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
                    disabled={deleteCountry.isPending}
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] font-bold"
                >
                    {deleteCountry.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {t('common.delete', 'Evet, Sil')}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
