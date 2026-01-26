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
import { Edit2, Trash2, ArrowUpDown, ArrowUp, ArrowDown, MapPin } from 'lucide-react';

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
  const { t, i18n } = useTranslation();
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
    if (selectedShippingAddress && selectedShippingAddress.id) {
      try {
        await deleteShippingAddress.mutateAsync(selectedShippingAddress.id);
        setDeleteDialogOpen(false);
        setSelectedShippingAddress(null);
      } catch (error) {
        console.error('Silme işlemi başarısız:', error);
      }
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
            {t('shippingAddressManagement.loading', 'Yükleniyor...')}
          </div>
        </div>
      </div>
    );
  }

  const shippingAddresses = data?.data || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  if (shippingAddresses.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground bg-slate-50 dark:bg-white/5 px-6 py-4 rounded-xl border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center gap-2">
          <MapPin size={40} className="opacity-20" />
          <span>{t('shippingAddressManagement.noData', 'Veri bulunamadı')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-white/5">
            <TableRow className="border-b border-slate-200 dark:border-white/10 hover:bg-transparent">
              <TableHead
                className={headStyle}
                onClick={() => handleSort('CustomerName')}
              >
                <div className="flex items-center">
                  {t('shippingAddressManagement.table.customerName', 'Müşteri')}
                  <SortIcon column="CustomerName" />
                </div>
              </TableHead>
              <TableHead
                className={headStyle}
                onClick={() => handleSort('Address')}
              >
                <div className="flex items-center">
                  {t('shippingAddressManagement.table.address', 'Adres')}
                  <SortIcon column="Address" />
                </div>
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400 py-4">
                {t('shippingAddressManagement.table.postalCode', 'Posta Kodu')}
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400 py-4">
                {t('shippingAddressManagement.table.contactPerson', 'Yetkili Kişi')}
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400 py-4">
                {t('shippingAddressManagement.table.phone', 'Telefon')}
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400 py-4">
                {t('shippingAddressManagement.table.location', 'Konum')}
              </TableHead>
              <TableHead
                className={headStyle}
                onClick={() => handleSort('CreatedDate')}
              >
                <div className="flex items-center">
                  {t('shippingAddressManagement.table.createdDate', 'Oluşturulma Tarihi')}
                  <SortIcon column="CreatedDate" />
                </div>
              </TableHead>
              <TableHead className="text-right text-slate-500 dark:text-slate-400 py-4">
                {t('shippingAddressManagement.table.actions', 'İşlemler')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shippingAddresses.map((shippingAddress: ShippingAddressDto, index: number) => (
              <TableRow 
                key={shippingAddress.id || `shipping-address-${index}`}
                className="border-b border-slate-100 dark:border-white/5 transition-colors duration-200 hover:bg-pink-50/40 dark:hover:bg-pink-500/5 group"
              >
                <TableCell className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                  {shippingAddress.id}
                </TableCell>
                <TableCell className="font-medium text-slate-900 dark:text-white">
                  {shippingAddress.customerName || '-'}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400 max-w-xs truncate">
                  {shippingAddress.address}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {shippingAddress.postalCode || '-'}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {shippingAddress.contactPerson || '-'}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {shippingAddress.phone || '-'}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {[
                    shippingAddress.countryName,
                    shippingAddress.cityName,
                    shippingAddress.districtName,
                  ]
                    .filter(Boolean)
                    .join(', ') || '-'}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                  {shippingAddress.createdDate
                    ? new Date(shippingAddress.createdDate).toLocaleDateString(i18n.language)
                    : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                      onClick={() => onEdit(shippingAddress)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                      onClick={() => handleDeleteClick(shippingAddress)}
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
          {t('shippingAddressManagement.table.showing', '{{from}}-{{to}} / {{total}} gösteriliyor', {
            from: (pageNumber - 1) * pageSize + 1,
            to: Math.min(pageNumber * pageSize, totalCount),
            total: totalCount,
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
            {t('shippingAddressManagement.previous', 'Önceki')}
          </Button>
          <div className="flex items-center px-4 text-sm font-medium text-slate-700 dark:text-slate-200">
            {t('shippingAddressManagement.table.page', 'Sayfa {{current}} / {{total}}', {
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
            {t('shippingAddressManagement.next', 'Sonraki')}
          </Button>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#130822] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">
              {t('shippingAddressManagement.confirmDelete', 'Sevk Adresini Sil')}
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              {t(
                'shippingAddressManagement.confirmDeleteMessage',
                'Bu sevk adresini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
            >
              {t('shippingAddressManagement.cancel', 'İptal')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteShippingAddress.isPending}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-900/50 dark:hover:bg-red-900/70 border border-transparent dark:border-red-500/20 text-white"
            >
              {deleteShippingAddress.isPending
                ? t('shippingAddressManagement.deleting', 'Siliniyor...')
                : t('shippingAddressManagement.delete', 'Sil')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}