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
import { useShippingAddresses } from '../hooks/useShippingAddresses';
import { useDeleteShippingAddress } from '../hooks/useDeleteShippingAddress';
import type { ShippingAddressDto } from '../types/shipping-address-types';
import type { PagedFilter } from '@/types/api';

interface ShippingAddressTableProps {
  onEdit: (shippingAddress: ShippingAddressDto) => void;
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: PagedFilter[] | Record<string, unknown>;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
}

export function ShippingAddressTable({
  onEdit,
  pageNumber,
  pageSize,
  sortBy = 'Id',
  sortDirection = 'desc',
  filters = {},
  onPageChange,
  onSortChange,
}: ShippingAddressTableProps): ReactElement {
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<ShippingAddressDto | null>(null);

  const { data, isLoading, isFetching } = useShippingAddresses({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    filters: filters as PagedFilter[] | undefined,
  });

  const deleteShippingAddress = useDeleteShippingAddress();

  const handleDeleteClick = (shippingAddress: ShippingAddressDto): void => {
    setSelectedShippingAddress(shippingAddress);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (selectedShippingAddress) {
      await deleteShippingAddress.mutateAsync(selectedShippingAddress.id);
      setDeleteDialogOpen(false);
      setSelectedShippingAddress(null);
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

  const shippingAddresses = data?.data || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  if (shippingAddresses.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">
          {t('shippingAddressManagement.noData', 'Veri bulunamadı')}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('CustomerName')}
              >
                <div className="flex items-center">
                  {t('shippingAddressManagement.customerName', 'Müşteri')}
                  <SortIcon column="CustomerName" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('Address')}
              >
                <div className="flex items-center">
                  {t('shippingAddressManagement.address', 'Adres')}
                  <SortIcon column="Address" />
                </div>
              </TableHead>
              <TableHead>
                {t('shippingAddressManagement.postalCode', 'Posta Kodu')}
              </TableHead>
              <TableHead>
                {t('shippingAddressManagement.contactPerson', 'Yetkili Kişi')}
              </TableHead>
              <TableHead>
                {t('shippingAddressManagement.phone', 'Telefon')}
              </TableHead>
              <TableHead>
                {t('shippingAddressManagement.location', 'Konum')}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('CreatedDate')}
              >
                <div className="flex items-center">
                  {t('shippingAddressManagement.createdDate', 'Oluşturulma Tarihi')}
                  <SortIcon column="CreatedDate" />
                </div>
              </TableHead>
              <TableHead className="text-right">
                {t('shippingAddressManagement.actions', 'İşlemler')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shippingAddresses.map((shippingAddress, index) => (
              <TableRow key={shippingAddress.id || `shipping-address-${index}`}>
                <TableCell>{shippingAddress.customerName || '-'}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {shippingAddress.address}
                </TableCell>
                <TableCell>{shippingAddress.postalCode || '-'}</TableCell>
                <TableCell>{shippingAddress.contactPerson || '-'}</TableCell>
                <TableCell>{shippingAddress.phone || '-'}</TableCell>
                <TableCell>
                  {[
                    shippingAddress.countryName,
                    shippingAddress.cityName,
                    shippingAddress.districtName,
                  ]
                    .filter(Boolean)
                    .join(', ') || '-'}
                </TableCell>
                <TableCell>
                  {shippingAddress.createdDate
                    ? new Date(shippingAddress.createdDate).toLocaleDateString('tr-TR')
                    : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(shippingAddress)}
                    >
                      {t('common.edit', 'Düzenle')}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(shippingAddress)}
                    >
                      {t('common.delete', 'Sil')}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {t('common.paginationInfo', {
            current: (pageNumber - 1) * pageSize + 1,
            total: Math.min(pageNumber * pageSize, totalCount),
            totalCount: totalCount,
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
              {t('shippingAddressManagement.confirmDelete', 'Sevk Adresini Sil')}
            </DialogTitle>
            <DialogDescription>
              {t(
                'shippingAddressManagement.confirmDeleteMessage',
                'Bu sevk adresini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              {t('common.cancel', 'İptal')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteShippingAddress.isPending}
            >
              {deleteShippingAddress.isPending
                ? t('common.deleting', 'Siliniyor...')
                : t('common.delete', 'Sil')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
