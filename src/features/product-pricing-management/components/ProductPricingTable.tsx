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
import { useProductPricings } from '../hooks/useProductPricings';
import { useDeleteProductPricing } from '../hooks/useDeleteProductPricing';
import type { ProductPricingGetDto } from '../types/product-pricing-types';
import type { PagedFilter } from '@/types/api';
import { calculateFinalPrice, calculateProfitMargin, formatPrice, formatPercentage } from '../types/product-pricing-types';

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

  const getProfitMarginColor = (percentage: number): string => {
    if (percentage < 0) return 'text-red-600 font-semibold';
    if (percentage < 10) return 'text-orange-600';
    if (percentage < 25) return 'text-yellow-600';
    return 'text-green-600 font-semibold';
  };

  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">
          {t('common.loading', 'Yükleniyor...')}
        </div>
      </div>
    );
  }

  const productPricings = data?.data || (data as any)?.items || [];

  if (!data || productPricings.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">
          {t('productPricingManagement.noData', 'Veri bulunamadı')}
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil((data.totalCount || 0) / pageSize);

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('Id')}
              >
                <div className="flex items-center">
                  {t('productPricingManagement.table.id', 'ID')}
                  <SortIcon column="Id" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('ErpProductCode')}
              >
                <div className="flex items-center">
                  {t('productPricingManagement.erpProductCode', 'ERP Ürün Kodu')}
                  <SortIcon column="ErpProductCode" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('ErpGroupCode')}
              >
                <div className="flex items-center">
                  {t('productPricingManagement.erpGroupCode', 'ERP Ürün Grubu Kodu')}
                  <SortIcon column="ErpGroupCode" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('Currency')}
              >
                <div className="flex items-center">
                  {t('productPricingManagement.currency', 'Para Birimi')}
                  <SortIcon column="Currency" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('ListPrice')}
              >
                <div className="flex items-center">
                  {t('productPricingManagement.listPrice', 'Liste Fiyatı')}
                  <SortIcon column="ListPrice" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('CostPrice')}
              >
                <div className="flex items-center">
                  {t('productPricingManagement.costPrice', 'Maliyet Fiyatı')}
                  <SortIcon column="CostPrice" />
                </div>
              </TableHead>
              <TableHead>
                {t('productPricingManagement.discount1', 'İskonto 1')}
              </TableHead>
              <TableHead>
                {t('productPricingManagement.discount2', 'İskonto 2')}
              </TableHead>
              <TableHead>
                {t('productPricingManagement.discount3', 'İskonto 3')}
              </TableHead>
              <TableHead>
                {t('productPricingManagement.finalPrice', 'Son Fiyat')}
              </TableHead>
              <TableHead>
                {t('productPricingManagement.profitMargin', 'Kar Marjı')}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('CreatedDate')}
              >
                <div className="flex items-center">
                  {t('productPricingManagement.createdDate', 'Oluşturulma Tarihi')}
                  <SortIcon column="CreatedDate" />
                </div>
              </TableHead>
              <TableHead className="text-right">
                {t('productPricingManagement.actions', 'İşlemler')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productPricings.map((productPricing: ProductPricingGetDto, index: number) => {
              const finalPrice = calculateFinalPrice(
                productPricing.listPrice,
                productPricing.discount1,
                productPricing.discount2,
                productPricing.discount3
              );
              const profitMargin = calculateProfitMargin(
                productPricing.listPrice,
                productPricing.costPrice,
                productPricing.discount1,
                productPricing.discount2,
                productPricing.discount3
              );

              return (
                <TableRow key={productPricing.id || `product-pricing-${index}`}>
                  <TableCell>{productPricing.id}</TableCell>
                  <TableCell className="font-medium">{productPricing.erpProductCode}</TableCell>
                  <TableCell>{productPricing.erpGroupCode}</TableCell>
                  <TableCell>{productPricing.currency}</TableCell>
                  <TableCell>{formatPrice(productPricing.listPrice, productPricing.currency)}</TableCell>
                  <TableCell>{formatPrice(productPricing.costPrice, productPricing.currency)}</TableCell>
                  <TableCell>{formatPercentage(productPricing.discount1)}</TableCell>
                  <TableCell>{formatPercentage(productPricing.discount2)}</TableCell>
                  <TableCell>{formatPercentage(productPricing.discount3)}</TableCell>
                  <TableCell className="font-semibold">
                    {formatPrice(finalPrice, productPricing.currency)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className={getProfitMarginColor(profitMargin.percentage)}>
                        {profitMargin.percentage.toFixed(2)}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatPrice(profitMargin.amount, productPricing.currency)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(productPricing.createdDate).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(productPricing)}
                      >
                        {t('common.edit', 'Düzenle')}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(productPricing)}
                      >
                        {t('productPricingManagement.delete', 'Sil')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          {t('productPricingManagement.table.showing', '{{from}}-{{to}} / {{total}} gösteriliyor', {
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
          >
            {t('common.previous', 'Önceki')}
          </Button>
          <div className="flex items-center px-4 text-sm">
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
          >
            {t('common.next', 'Sonraki')}
          </Button>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('productPricingManagement.deleteTitle', 'Fiyatlandırmayı Sil')}
            </DialogTitle>
            <DialogDescription>
              {t('productPricingManagement.confirmDelete', 'Bu fiyatlandırmayı silmek istediğinizden emin misiniz?')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteProductPricing.isPending}
            >
              {t('common.cancel', 'İptal')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteProductPricing.isPending}
            >
              {deleteProductPricing.isPending
                ? t('common.loading', 'Yükleniyor...')
                : t('productPricingManagement.delete', 'Sil')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
