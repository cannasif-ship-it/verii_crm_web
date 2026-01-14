import { type ReactElement, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { CustomerStats } from './CustomerStats';
import { CustomerTable } from './CustomerTable';
import { CustomerForm } from './CustomerForm';
import { useCreateCustomer } from '../hooks/useCreateCustomer';
import { useUpdateCustomer } from '../hooks/useUpdateCustomer';
import type { CustomerDto } from '../types/customer-types';
import type { CustomerFormSchema } from '../types/customer-types';

export function CustomerManagementPage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerDto | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20);
  const [sortBy, setSortBy] = useState('Id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters] = useState<Record<string, unknown>>({});

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  useEffect(() => {
    setPageTitle(t('customerManagement.menu', 'Müşteri Yönetimi'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  const handleAddClick = (): void => {
    setEditingCustomer(null);
    setFormOpen(true);
  };

  const handleEdit = (customer: CustomerDto): void => {
    setEditingCustomer(customer);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CustomerFormSchema): Promise<void> => {
    if (editingCustomer) {
      await updateCustomer.mutateAsync({
        id: editingCustomer.id,
        data: {
          customerCode: data.customerCode || undefined,
          name: data.name,
          taxNumber: data.taxNumber || undefined,
          taxOffice: data.taxOffice || undefined,
          tcknNumber: data.tcknNumber || undefined,
          address: data.address || undefined,
          phone: data.phone || undefined,
          phone2: data.phone2 || undefined,
          email: data.email || undefined,
          website: data.website || undefined,
          notes: data.notes || undefined,
          countryId: data.countryId,
          cityId: data.cityId,
          districtId: data.districtId,
          customerTypeId: data.customerTypeId,
          salesRepCode: data.salesRepCode || undefined,
          groupCode: data.groupCode || undefined,
          creditLimit: data.creditLimit ?? undefined,
          branchCode: data.branchCode,
          businessUnitCode: data.businessUnitCode,
          isCompleted: data.isCompleted,
        },
      });
    } else {
      await createCustomer.mutateAsync({
        customerCode: data.customerCode || undefined,
        name: data.name,
        taxNumber: data.taxNumber || undefined,
        taxOffice: data.taxOffice || undefined,
        address: data.address || undefined,
        phone: data.phone || undefined,
        phone2: data.phone2 || undefined,
        email: data.email || undefined,
        website: data.website || undefined,
        notes: data.notes || undefined,
        countryId: data.countryId,
        cityId: data.cityId,
        districtId: data.districtId,
        customerTypeId: data.customerTypeId,
        salesRepCode: data.salesRepCode || undefined,
        groupCode: data.groupCode || undefined,
        creditLimit: data.creditLimit ?? undefined,
        branchCode: data.branchCode,
        businessUnitCode: data.businessUnitCode,
        isCompleted: data.isCompleted,
      });
    }
    setFormOpen(false);
    setEditingCustomer(null);
  };

  const handleSortChange = (newSortBy: string, newSortDirection: 'asc' | 'desc'): void => {
    setSortBy(newSortBy);
    setSortDirection(newSortDirection);
    setPageNumber(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {t('customerManagement.menu', 'Müşteri Yönetimi')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('customerManagement.description', 'Müşterileri yönetin ve düzenleyin')}
          </p>
        </div>
        <Button onClick={handleAddClick}>
          {t('customerManagement.addButton', 'Yeni Müşteri Ekle')}
        </Button>
      </div>

      <CustomerStats />

      <div className="space-y-4">
        <CustomerTable
          onEdit={handleEdit}
          pageNumber={pageNumber}
          pageSize={pageSize}
          sortBy={sortBy}
          sortDirection={sortDirection}
          filters={filters}
          onPageChange={setPageNumber}
          onSortChange={handleSortChange}
        />
      </div>

      <CustomerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        customer={editingCustomer}
        isLoading={createCustomer.isPending || updateCustomer.isPending}
      />
    </div>
  );
}
