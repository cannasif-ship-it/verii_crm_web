import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useStockList } from '../hooks/useStockList';
import { PackageOpen, ArrowRight, ArrowLeft, Box, Tag, Ruler } from 'lucide-react';
import type { PagedFilter } from '@/types/api';
import { cn } from '@/lib/utils';
import type { StockGetDto } from '../types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

interface StockCardListProps {
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: PagedFilter[] | Record<string, unknown>;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
  onRowClick: (stockId: number) => void;
}

export function StockCardList({
  pageNumber,
  pageSize,
  sortBy = 'Id',
  sortDirection = 'desc',
  filters = {},
  onPageChange,
  onRowClick,
}: StockCardListProps): ReactElement {
  const { t } = useTranslation();

  const { data, isLoading, isFetching } = useStockList({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    filters: filters as PagedFilter[] | undefined,
  });

  if (isLoading || isFetching) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="overflow-hidden border-zinc-200 dark:border-white/10 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="pt-4 border-t border-zinc-100 dark:border-white/5">
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const stocks = data?.data || [];

  if (!data || stocks.length === 0) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center py-20 text-muted-foreground",
        "border-2 border-dashed border-zinc-200 dark:border-white/10 rounded-2xl",
        "bg-zinc-50/50 dark:bg-white/5"
      )}>
        <div className="p-4 bg-white dark:bg-zinc-800 rounded-full shadow-sm mb-3">
          <PackageOpen size={48} className="text-zinc-300 dark:text-zinc-600" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{t('stock.list.noData', 'Kayıt Bulunamadı')}</h3>
        <p className="text-sm max-w-xs text-center mt-1">Arama kriterlerinize uygun stok kaydı mevcut değil.</p>
      </div>
    );
  }

  const totalPages = Math.ceil((data.totalCount || 0) / pageSize);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stocks.map((stock: StockGetDto) => (
          <Card 
            key={stock.id}
            className={cn(
              "group cursor-pointer overflow-hidden transition-all duration-300",
              "hover:shadow-lg hover:border-pink-200 dark:hover:border-pink-900/30",
              "bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md"
            )}
            onClick={() => onRowClick(stock.id)}
          >
            <CardHeader className="p-5 pb-3">
              <div className="flex justify-between items-start gap-4">
                <div className="p-2.5 rounded-xl bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400">
                  <Box className="w-6 h-6" />
                </div>
                <Badge variant="secondary" className="bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-white/10 font-mono text-xs">
                  #{stock.id}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-2 space-y-3">
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors line-clamp-1" title={stock.stockName || ''}>
                  {stock.stockName || '-'}
                </h3>
                <div className="flex items-center gap-1.5 mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  <Tag className="w-3.5 h-3.5" />
                  <span className="font-mono text-xs">{stock.erpStockCode || '-'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-white/5 p-2 rounded-lg border border-zinc-100 dark:border-white/5">
                <Ruler className="w-3.5 h-3.5" />
                <span>{t('stock.list.unit', 'Birim')}:</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{stock.unit || '-'}</span>
              </div>
            </CardContent>
            <CardFooter className="p-4 bg-zinc-50/50 dark:bg-white/5 border-t border-zinc-100 dark:border-white/5">
               <Button 
                variant="ghost" 
                className="w-full justify-between text-xs hover:bg-white dark:hover:bg-zinc-800 hover:text-pink-600"
                onClick={(e) => { e.stopPropagation(); onRowClick(stock.id); }}
              >
                 {t('stock.list.viewDetail', 'Detay Görüntüle')}
                 <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-70" />
               </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 bg-white/50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl gap-4">
        <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            {t('stock.list.total', 'Toplam')} <span className="font-bold text-zinc-900 dark:text-white mx-1">{data.totalCount || 0}</span> {t('stock.list.recordsListed', 'kayıt listeleniyor.')}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 rounded-lg text-xs border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white"
            onClick={() => onPageChange(pageNumber - 1)}
            disabled={pageNumber <= 1}
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            {t('stock.list.previous', 'Önceki')}
          </Button>
          
          <div className="text-xs font-semibold bg-zinc-100 dark:bg-white/10 px-3 py-1.5 rounded-md min-w-[3rem] text-center text-zinc-700 dark:text-zinc-200">
            {pageNumber} / {totalPages}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 rounded-lg text-xs border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white"
            onClick={() => onPageChange(pageNumber + 1)}
            disabled={pageNumber >= totalPages}
          >
            {t('stock.list.next', 'Sonraki')}
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
