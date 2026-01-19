import { type ReactElement } from 'react';
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
import { useStockList } from '../hooks/useStockList';
import { ChevronUp, ChevronDown, ChevronsUpDown, Package, Eye } from 'lucide-react';
import type { PagedFilter } from '@/types/api';

interface StockTableProps {
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: PagedFilter[] | Record<string, unknown>;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
  onRowClick: (stockId: number) => void;
}

export function StockTable({
  pageNumber,
  pageSize,
  sortBy = 'Id',
  sortDirection = 'desc',
  filters = {},
  onPageChange,
  onSortChange,
  onRowClick,
}: StockTableProps): ReactElement {
  const { t } = useTranslation();

  const { data, isLoading, isFetching } = useStockList({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    filters: filters as PagedFilter[] | undefined,
  });

  const handleSort = (column: string): void => {
    const newDirection = sortBy === column && sortDirection === 'asc' ? 'desc' : 'asc';
    onSortChange(column, newDirection);
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return <ChevronsUpDown className="ml-2 w-3 h-3 opacity-30" />;
    return sortDirection === 'asc' ? 
      <ChevronUp className="ml-2 w-3 h-3 text-pink-600 dark:text-pink-500" /> : 
      <ChevronDown className="ml-2 w-3 h-3 text-pink-600 dark:text-pink-500" />;
  };

  const borderClass = "border-zinc-300 dark:border-zinc-700/80"; 

  if (isLoading || isFetching) {
    return (
      <div className={`flex flex-col items-center justify-center py-24 gap-4 border ${borderClass} rounded-xl bg-white/50 dark:bg-card/50`}>
        <div className="w-10 h-10 border-4 border-muted border-t-pink-500 rounded-full animate-spin" />
        <span className="text-muted-foreground animate-pulse text-sm font-medium">Yükleniyor...</span>
      </div>
    );
  }

  const stocks = data?.data || (data as any)?.items || [];

  if (!data || stocks.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-24 text-muted-foreground border ${borderClass} border-dashed rounded-xl bg-white/50 dark:bg-card/50`}>
        <Package size={40} className="opacity-40 mb-2" />
        <p className="text-sm font-medium">{t('common.noData', 'Veri yok')}</p>
      </div>
    );
  }

  const totalPages = Math.ceil((data.totalCount || 0) / pageSize);

  return (
    <div className="w-full">
      <Table className="border-collapse w-full">
        {/* HEADER: Light mode için belirgin gri (zinc-200), Dark mode için muted */}
        <TableHeader className="bg-zinc-200 dark:bg-muted/20">
          <TableRow className="hover:bg-transparent border-none">
            {[
              { id: 'Id', label: t('stock.list.id', 'ID') },
              { id: 'ErpStockCode', label: t('stock.list.erpStockCode', 'ERP Kodu') },
              { id: 'StockName', label: t('stock.list.stockName', 'Stok Adı') }
            ].map((col) => (
              <TableHead 
                key={col.id}
                className={`cursor-pointer select-none py-4 px-4 text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-foreground/90 hover:text-pink-600 dark:hover:text-pink-500 transition-colors border-b border-r border-zinc-300 dark:border-zinc-700 last:border-r-0`}
                onClick={() => handleSort(col.id)}
              >
                <div className="flex items-center gap-1">
                  {col.label} <SortIcon column={col.id} />
                </div>
              </TableHead>
            ))}
            <TableHead className={`py-4 px-4 text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-foreground/90 border-b border-r border-zinc-300 dark:border-zinc-700`}>
              {t('stock.list.unit', 'Birim')}
            </TableHead>
            <TableHead className={`text-right py-4 px-4 text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-foreground/90 border-b border-zinc-300 dark:border-zinc-700`}>
              {t('stock.list.actions', 'İşlemler')}
            </TableHead>
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {stocks.map((stock: any, index: number) => (
            <TableRow
              key={stock.id || `stock-${index}`}
              // --- GÜNCELLENEN KISIM BURASI ---
              // Light Mode: hover:bg-pink-50 (Çok hafif pembe zemin)
              // Dark Mode: dark:hover:bg-pink-500/10 (Pembe ışıltı)
              className={`group cursor-pointer hover:bg-pink-50 dark:hover:bg-pink-500/10 transition-colors duration-200 bg-white dark:bg-transparent`}
              onClick={() => onRowClick(stock.id)}
            >
              <TableCell className={`font-mono text-xs text-muted-foreground border-b border-r ${borderClass} px-4 py-3`}>
                {stock.id}
              </TableCell>
              
              {/* group-hover:text-pink-600 buraya eklendiği için hover olunca yazı rengi de değişiyor */}
              <TableCell className={`font-semibold text-sm text-foreground/90 border-b border-r ${borderClass} px-4 py-3 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors`}>
                {stock.erpStockCode || '-'}
              </TableCell>
              
              <TableCell className={`text-sm text-foreground/80 border-b border-r ${borderClass} px-4 py-3 max-w-md truncate`}>
                {stock.stockName || '-'}
              </TableCell>
              
              <TableCell className={`border-b border-r ${borderClass} px-4 py-3`}>
                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded bg-zinc-100 dark:bg-muted text-[11px] font-bold text-zinc-700 dark:text-foreground/70 uppercase border border-zinc-200 dark:border-border/50">
                  {stock.unit || '-'}
                </span>
              </TableCell>
              
              <TableCell className={`text-right border-b ${borderClass} px-4 py-3`}>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-8 w-8 p-0 bg-transparent hover:bg-pink-500 hover:text-white hover:border-pink-500 rounded-md transition-all ${borderClass}`}
                  onClick={(e) => { e.stopPropagation(); onRowClick(stock.id); }}
                >
                  <Eye size={14} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className={`flex flex-col md:flex-row items-center justify-between px-6 py-4 bg-zinc-50/50 dark:bg-muted/20 border-t-0 rounded-b-xl gap-4 border-x border-b ${borderClass}`}>
        <div className="text-xs text-muted-foreground font-medium">
            Toplam <span className="font-bold text-foreground">{data.totalCount || 0}</span> kayıt.
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className={`h-8 px-3 rounded-lg text-xs font-medium bg-white dark:bg-background hover:bg-pink-50 hover:border-pink-500 hover:text-pink-600 transition-all ${borderClass}`}
            onClick={() => onPageChange(pageNumber - 1)}
            disabled={pageNumber <= 1}
          >
            {t('common.previous', 'Önceki')}
          </Button>
          
          <div className={`text-xs font-bold bg-white dark:bg-background px-3 py-1.5 rounded-md min-w-[3rem] text-center border ${borderClass}`}>
            {pageNumber} / {totalPages}
          </div>

          <Button
            variant="outline"
            size="sm"
            className={`h-8 px-3 rounded-lg text-xs font-medium bg-white dark:bg-background hover:bg-pink-50 hover:border-pink-500 hover:text-pink-600 transition-all ${borderClass}`}
            onClick={() => onPageChange(pageNumber + 1)}
            disabled={pageNumber >= totalPages}
          >
            {t('common.next', 'Sonraki')}
          </Button>
        </div>
      </div>
    </div>
  );
}