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

  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">
          {t('common.loading', 'Yükleniyor...')}
        </div>
      </div>
    );
  }

  const productPricingGroupBys = data?.data || (data as any)?.items || [];

  if (!data || productPricingGroupBys.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">
          {t('productPricingGroupByManagement.noData', 'Veri bulunamadı')}
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
                  {t('productPricingGroupByManagement.table.id', 'ID')}
                  <SortIcon column="Id" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('ErpGroupCode')}
              >
                <div className="flex items-center">
                  {t('productPricingGroupByManagement.erpGroupCode', 'ERP Ürün Grubu Kodu')}
                  <SortIcon column="ErpGroupCode" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('Currency')}
              >
                <div className="flex items-center">
                  {t('productPricingGroupByManagement.currency', 'Para Birimi')}
                  <SortIcon column="Currency" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('ListPrice')}
              >
                <div className="flex items-center">
                  {t('productPricingGroupByManagement.listPrice', 'Liste Fiyatı')}
                  <SortIcon column="ListPrice" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('CostPrice')}
              >
                <div className="flex items-center">
                  {t('productPricingGroupByManagement.costPrice', 'Maliyet Fiyatı')}
                  <SortIcon column="CostPrice" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('Discount1')}
              >
                <div className="flex items-center">
                  {t('productPricingGroupByManagement.discount1', 'İskonto 1')}
                  <SortIcon column="Discount1" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('Discount2')}
              >
                <div className="flex items-center">
                  {t('productPricingGroupByManagement.discount2', 'İskonto 2')}
                  <SortIcon column="Discount2" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('Discount3')}
              >
                <div className="flex items-center">
                  {t('productPricingGroupByManagement.discount3', 'İskonto 3')}
                  <SortIcon column="Discount3" />
                </div>
              </TableHead>
              <TableHead>
                {t('productPricingGroupByManagement.finalPrice', 'Son Fiyat')}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('CreatedDate')}
              >
                <div className="flex items-center">
                  {t('productPricingGroupByManagement.createdDate', 'Oluşturulma Tarihi')}
                  <SortIcon column="CreatedDate" />
                </div>
              </TableHead>
              <TableHead className="text-right">
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
                <TableRow key={productPricingGroupBy.id || `product-pricing-group-by-${index}`}>
                  <TableCell>{productPricingGroupBy.id}</TableCell>
                  <TableCell className="font-medium">{productPricingGroupBy.erpGroupCode}</TableCell>
                  <TableCell>{productPricingGroupBy.currency}</TableCell>
                  <TableCell>{formatPrice(productPricingGroupBy.listPrice, productPricingGroupBy.currency)}</TableCell>
                  <TableCell>{formatPrice(productPricingGroupBy.costPrice, productPricingGroupBy.currency)}</TableCell>
                  <TableCell>{formatPercentage(productPricingGroupBy.discount1)}</TableCell>
                  <TableCell>{formatPercentage(productPricingGroupBy.discount2)}</TableCell>
                  <TableCell>{formatPercentage(productPricingGroupBy.discount3)}</TableCell>
                  <TableCell className="font-semibold">
                    {formatPrice(finalPrice, productPricingGroupBy.currency)}
                  </TableCell>
                  <TableCell>
                    {new Date(productPricingGroupBy.createdDate).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(productPricingGroupBy)}
                      >
                        {t('common.edit', 'Düzenle')}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(productPricingGroupBy)}
                      >
                        {t('productPricingGroupByManagement.delete', 'Sil')}
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
          >
            {t('common.previous', 'Önceki')}
          </Button>
          <div className="flex items-center px-4 text-sm">
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
          >
            {t('common.next', 'Sonraki')}
          </Button>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('productPricingGroupByManagement.deleteTitle', 'Fiyatlandırma Grubunu Sil')}
            </DialogTitle>
            <DialogDescription>
              {t('productPricingGroupByManagement.confirmDelete', 'Bu fiyatlandırma grubunu silmek istediğinizden emin misiniz?')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteProductPricingGroupBy.isPending}
            >
              {t('common.cancel', 'İptal')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteProductPricingGroupBy.isPending}
            >
              {deleteProductPricingGroupBy.isPending
                ? t('common.loading', 'Yükleniyor...')
                : t('productPricingGroupByManagement.delete', 'Sil')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
