import { type ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ShippingAddressForm } from './ShippingAddressForm';
import { ShippingAddressTable } from './ShippingAddressTable';
import { useCreateShippingAddress } from '../hooks/useCreateShippingAddress';
import { useUpdateShippingAddress } from '../hooks/useUpdateShippingAddress';
import type { ShippingAddressDto, ShippingAddressFormSchema } from '../types/shipping-address-types';
import type { PagedFilter } from '@/types/api';

export function ShippingAddressManagementPage(): ReactElement {
  const { t } = useTranslation();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<ShippingAddressDto | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>('Id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters] = useState<PagedFilter[] | Record<string, unknown>>({});

  const createShippingAddress = useCreateShippingAddress();
  const updateShippingAddress = useUpdateShippingAddress();

  const handleCreateClick = (): void => {
    setSelectedShippingAddress(null);
    setFormOpen(true);
  };

  const handleEditClick = (shippingAddress: ShippingAddressDto): void => {
    setSelectedShippingAddress(shippingAddress);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: ShippingAddressFormSchema): Promise<void> => {
    if (selectedShippingAddress) {
      await updateShippingAddress.mutateAsync({
        id: selectedShippingAddress.id,
        data: {
          address: data.address,
          postalCode: data.postalCode || undefined,
          contactPerson: data.contactPerson || undefined,
          phone: data.phone || undefined,
          notes: data.notes || undefined,
          customerId: data.customerId,
          countryId: data.countryId || undefined,
          cityId: data.cityId || undefined,
          districtId: data.districtId || undefined,
        },
      });
    } else {
      await createShippingAddress.mutateAsync({
        address: data.address,
        postalCode: data.postalCode || undefined,
        contactPerson: data.contactPerson || undefined,
        phone: data.phone || undefined,
        notes: data.notes || undefined,
        customerId: data.customerId,
        countryId: data.countryId || undefined,
        cityId: data.cityId || undefined,
        districtId: data.districtId || undefined,
      });
    }
    setFormOpen(false);
    setSelectedShippingAddress(null);
  };

  const handleSortChange = (newSortBy: string, newSortDirection: 'asc' | 'desc'): void => {
    setSortBy(newSortBy);
    setSortDirection(newSortDirection);
    setPageNumber(1);
  };

  const handlePageChange = (newPage: number): void => {
    setPageNumber(newPage);
  };

  const isLoading = createShippingAddress.isPending || updateShippingAddress.isPending;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {t('shippingAddressManagement.title', 'Sevk Adresi Yönetimi')}
        </h1>
        <Button onClick={handleCreateClick}>
          {t('shippingAddressManagement.create', 'Yeni Sevk Adresi')}
        </Button>
      </div>

      <ShippingAddressTable
        onEdit={handleEditClick}
        pageNumber={pageNumber}
        pageSize={pageSize}
        sortBy={sortBy}
        sortDirection={sortDirection}
        filters={filters}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
      />

      <ShippingAddressForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        shippingAddress={selectedShippingAddress}
        isLoading={isLoading}
      />
    </div>
  );
}
