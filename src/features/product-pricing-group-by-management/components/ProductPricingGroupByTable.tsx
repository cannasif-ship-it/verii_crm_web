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
import { useProductPricingGroupBys } from '../hooks/useProductPricingGroupBys';
import { useDeleteProductPricingGroupBy } from '../hooks/useDeleteProductPricingGroupBy';
import type { ProductPricingGroupByDto } from '../types/product-pricing-group-by-types';
import type { PagedFilter } from '@/types/api';
import { calculateFinalPrice, formatPrice, formatPercentage } from '../types/product-pricing-group-by-types';
import { Edit2, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface ProductPricingGroupByTableProps {
  onEdit: (productPricingGroupBy: ProductPricingGroupByDto) => void;
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: PagedFilter[] | Record<string, unknown>;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
}

export function ProductPricingGroupByTable({
  onEdit,
  pageNumber,
  pageSize,
  sortBy = 'Id',
  sortDirection = 'desc',
  filters = {},
  onPageChange,
  onSortChange,
}: ProductPricingGroupByTableProps): ReactElement {
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProductPricingGroupBy, setSelectedProductPricingGroupBy] = useState<ProductPricingGroupByDto | null>(null);

  const { data, isLoading, isFetching } = useProductPricingGroupBys({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    filters: filters as PagedFilter[] | undefined,
  });

  const deleteProductPricingGroupBy = useDeleteProductPricingGroupBy();

  const handleDeleteClick = (productPricingGroupBy: ProductPricingGroupByDto): void => {
    setSelectedProductPricingGroupBy(productPricingGroupBy);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (selectedProductPricingGroupBy) {
      await deleteProductPricingGroupBy.mutateAsync(selectedProductPricingGroupBy.id);
      setDeleteDialogOpen(false);
      setSelectedProductPricingGroupBy(null);
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

  const productPricingGroupBys = data?.data || (data as any)?.items || [];

  if (!data || productPricingGroupBys.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground bg-slate-50 dark:bg-white/5 px-6 py-4 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
          {t('productPricingGroupByManagement.noData', 'Veri bulunamadı')}
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil((data?.totalCount || 0) / pageSize);

  return (
    <>
      <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-white/5">
            <TableRow className="border-b border-slate-200 dark:border-white/10 hover:bg-transparent">
              <TableHead onClick={() => handleSort('Id')} className={headStyle}>
                <div className="flex items-center">
                  {t('productPricingGroupByManagement.table.id', 'ID')}
                  <SortIcon column="Id" />
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('ErpGroupCode')} className={headStyle}>
                <div className="flex items-center">
                  {t('productPricingGroupByManagement.erpGroupCode', 'ERP Ürün Grubu Kodu')}
                  <SortIcon column="ErpGroupCode" />
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('Currency')} className={headStyle}>
                <div className="flex items-center">
                  {t('productPricingGroupByManagement.currency', 'Para Birimi')}
                  <SortIcon column="Currency" />
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('ListPrice')} className={headStyle}>
                <div className="flex items-center">
                  {t('productPricingGroupByManagement.listPrice', 'Liste Fiyatı')}
                  <SortIcon column="ListPrice" />
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('CostPrice')} className={headStyle}>
                <div className="flex items-center">
                  {t('productPricingGroupByManagement.costPrice', 'Maliyet Fiyatı')}
                  <SortIcon column="CostPrice" />
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('Discount1')} className={headStyle}>
                <div className="flex items-center">
                  {t('productPricingGroupByManagement.discount1', 'İskonto 1')}
                  <SortIcon column="Discount1" />
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('Discount2')} className={headStyle}>
                <div className="flex items-center">
                  {t('productPricingGroupByManagement.discount2', 'İskonto 2')}
                  <SortIcon column="Discount2" />
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('Discount3')} className={headStyle}>
                <div className="flex items-center">
                  {t('productPricingGroupByManagement.discount3', 'İskonto 3')}
                  <SortIcon column="Discount3" />
                </div>
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400 py-4">
                {t('productPricingGroupByManagement.finalPrice', 'Son Fiyat')}
              </TableHead>
              <TableHead onClick={() => handleSort('CreatedDate')} className={headStyle}>
                <div className="flex items-center">
                  {t('productPricingGroupByManagement.createdDate', 'Oluşturulma Tarihi')}
                  <SortIcon column="CreatedDate" />
                </div>
              </TableHead>
              <TableHead className="text-right text-slate-500 dark:text-slate-400 py-4">
                {t('productPricingGroupByManagement.actions', 'İşlemler')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productPricingGroupBys.map((productPricingGroupBy: ProductPricingGroupByDto, index: number) => {
              const finalPrice = calculateFinalPrice(
                productPricingGroupBy.listPrice,
                productPricingGroupBy.discount1,
                productPricingGroupBy.discount2,
                productPricingGroupBy.discount3
              );

              return (
                <TableRow 
                  key={productPricingGroupBy.id || `product-pricing-group-by-${index}`}
                  className="border-b border-slate-100 dark:border-white/5 transition-colors duration-200 hover:bg-pink-50/40 dark:hover:bg-pink-500/5 group"
                >
                  <TableCell className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                    {productPricingGroupBy.id}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900 dark:text-white">
                    {productPricingGroupBy.erpGroupCode}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {productPricingGroupBy.currency}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {formatPrice(productPricingGroupBy.listPrice, productPricingGroupBy.currency)}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {formatPrice(productPricingGroupBy.costPrice, productPricingGroupBy.currency)}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {formatPercentage(productPricingGroupBy.discount1)}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {formatPercentage(productPricingGroupBy.discount2)}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {formatPercentage(productPricingGroupBy.discount3)}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900 dark:text-white">
                    {formatPrice(finalPrice, productPricingGroupBy.currency)}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                    {new Date(productPricingGroupBy.createdDate).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                        onClick={() => onEdit(productPricingGroupBy)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                        onClick={() => handleDeleteClick(productPricingGroupBy)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {t('productPricingGroupByManagement.table.showing', '{{from}}-{{to}} / {{total}} gösteriliyor', {
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
            {t('productPricingGroupByManagement.table.page', 'Sayfa {{current}} / {{total}}', {
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
        <DialogContent className="bg-white dark:bg-[#130822] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">
              {t('productPricingGroupByManagement.deleteTitle', 'Fiyatlandırma Grubunu Sil')}
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              {t('productPricingGroupByManagement.confirmDelete', 'Bu fiyatlandırma grubunu silmek istediğinizden emin misiniz?')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteProductPricingGroupBy.isPending}
              className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
            >
              {t('common.cancel', 'İptal')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteProductPricingGroupBy.isPending}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-900/50 dark:hover:bg-red-900/70 border border-transparent dark:border-red-500/20 text-white"
            >
              {deleteProductPricingGroupBy.isPending
                ? t('common.loading', 'Yükleniyor...')
                : t('common.delete', 'Sil')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
