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
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useProductPricings } from '../hooks/useProductPricings';
import { useDeleteProductPricing } from '../hooks/useDeleteProductPricing';
import type { ProductPricingGetDto } from '../types/product-pricing-types';
import type { PagedFilter } from '@/types/api';
import { calculateFinalPrice, formatPrice, formatPercentage } from '../types/product-pricing-types';
import { Edit2, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Package, Layers, Tag, Percent, AlertCircle } from 'lucide-react';

interface ProductPricingTableProps {
  onEdit: (productPricing: ProductPricingGetDto) => void;
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: PagedFilter[] | Record<string, unknown>;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
}

export function ProductPricingTable({
  onEdit,
  pageNumber,
  pageSize,
  sortBy = 'Id',
  sortDirection = 'desc',
  filters = {},
  onPageChange,
  onSortChange,
}: ProductPricingTableProps): ReactElement {
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProductPricing, setSelectedProductPricing] = useState<ProductPricingGetDto | null>(null);

  const { data, isLoading, isFetching } = useProductPricings({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    filters: filters as PagedFilter[] | undefined,
  });

  const deleteProductPricing = useDeleteProductPricing();

  const handleDeleteClick = (productPricing: ProductPricingGetDto): void => {
    setSelectedProductPricing(productPricing);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (selectedProductPricing) {
      await deleteProductPricing.mutateAsync(selectedProductPricing.id);
      setDeleteDialogOpen(false);
      setSelectedProductPricing(null);
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

  const productPricings = data?.data || (data as any)?.items || [];
  const totalPages = Math.ceil((data?.totalCount || 0) / pageSize);

  return (
    <>
      <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-white/5">
            <TableRow className="border-b border-slate-200 dark:border-white/10 hover:bg-transparent">
              <TableHead onClick={() => handleSort('ErpProductCode')} className={headStyle}>
                <div className="flex items-center gap-2">
                  {t('productPricingManagement.productInfo', 'ÜRÜN BİLGİSİ')}
                  <SortIcon column="ErpProductCode" />
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('ErpGroupCode')} className={headStyle}>
                <div className="flex items-center gap-2">
                  {t('productPricingManagement.category', 'KATEGORİ')}
                  <SortIcon column="ErpGroupCode" />
                </div>
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400 py-4">
                <div className="flex items-center gap-2">
                  {t('productPricingManagement.stockStatus', 'STOK DURUMU')}
                </div>
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400 py-4">
                <div className="flex items-center gap-2">
                  {t('productPricingManagement.priceAndDiscount', 'FİYAT & İSKONTO')}
                </div>
              </TableHead>
              <TableHead className="text-right text-slate-500 dark:text-slate-400 py-4">
                {t('productPricingManagement.actions', 'İŞLEMLER')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || isFetching ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 py-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-current text-pink-500" />
                    <div className="text-sm text-muted-foreground animate-pulse">
                      {t('common.loading', 'Yükleniyor...')}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (!data || productPricings.length === 0) ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="text-muted-foreground">
                    {t('productPricingManagement.noData', 'Veri bulunamadı')}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              productPricings.map((productPricing: ProductPricingGetDto, index: number) => {
              const finalPrice = calculateFinalPrice(
                productPricing.listPrice,
                productPricing.discount1,
                productPricing.discount2,
                productPricing.discount3
              );

              // Mock stock status since it's not in DTO yet
              const stockStatus = "Stok Takibi Yok"; 

              return (
                <TableRow 
                  key={productPricing.id || `product-pricing-${index}`}
                  className="border-b border-slate-100 dark:border-white/5 transition-colors duration-200 hover:bg-pink-50/40 dark:hover:bg-pink-500/5 group"
                >
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                        {productPricing.erpProductCode}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        ID: {productPricing.id}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-4">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-500/20">
                      {productPricing.erpGroupCode}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="py-4">
                    <Badge variant="outline" className="text-slate-500 border-slate-200 dark:border-white/10 dark:text-slate-400">
                      {stockStatus}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 line-through">
                        {formatPrice(productPricing.listPrice, productPricing.currency)}
                      </div>
                      
                      {(productPricing.discount1 || productPricing.discount2 || productPricing.discount3) && (
                        <div className="flex items-center gap-1 flex-wrap">
                          {productPricing.discount1 && (
                            <Badge variant="secondary" className="h-5 px-1.5 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border-orange-100 dark:border-orange-500/20 text-[10px]">
                              <Percent size={10} className="mr-0.5" />
                              {productPricing.discount1}
                            </Badge>
                          )}
                          {productPricing.discount2 && (
                            <Badge variant="secondary" className="h-5 px-1.5 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border-orange-100 dark:border-orange-500/20 text-[10px]">
                              <Percent size={10} className="mr-0.5" />
                              {productPricing.discount2}
                            </Badge>
                          )}
                          {productPricing.discount3 && (
                            <Badge variant="secondary" className="h-5 px-1.5 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border-orange-100 dark:border-orange-500/20 text-[10px]">
                              <Percent size={10} className="mr-0.5" />
                              {productPricing.discount3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="font-bold text-pink-600 dark:text-pink-400 text-lg">
                        {formatPrice(finalPrice, productPricing.currency)}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-right py-4">
                    <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                        onClick={() => onEdit(productPricing)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                        onClick={() => handleDeleteClick(productPricing)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            }))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {t('productPricingManagement.table.showing', '{{from}}-{{to}} / {{total}} gösteriliyor', {
            from: (pageNumber - 1) * pageSize + 1,
            to: Math.min(pageNumber * pageSize, data?.totalCount || 0),
            total: data?.totalCount || 0,
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
            {t('productPricingManagement.table.page', 'Sayfa {{current}} / {{total}}', {
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
              {t('productPricingManagement.deleteTitle', 'Fiyatlandırmayı Sil')}
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              {t('productPricingManagement.confirmDelete', 'Bu fiyatlandırmayı silmek istediğinizden emin misiniz?')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteProductPricing.isPending}
              className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
            >
              {t('common.cancel', 'İptal')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteProductPricing.isPending}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-900/50 dark:hover:bg-red-900/70 border border-transparent dark:border-red-500/20 text-white"
            >
              {deleteProductPricing.isPending
                ? t('common.loading', 'Yükleniyor...')
                : t('common.delete', 'Sil')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
