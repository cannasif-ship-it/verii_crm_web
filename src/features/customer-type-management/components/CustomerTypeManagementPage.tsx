import { type ReactElement, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { CustomerTypeStats } from './CustomerTypeStats';
import { CustomerTypeTable } from './CustomerTypeTable';
import { CustomerTypeForm } from './CustomerTypeForm';
import { useCreateCustomerType } from '../hooks/useCreateCustomerType';
import { useUpdateCustomerType } from '../hooks/useUpdateCustomerType';
import type { CustomerTypeDto } from '../types/customer-type-types';
import type { CustomerTypeFormSchema } from '../types/customer-type-types';

export function CustomerTypeManagementPage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomerType, setEditingCustomerType] = useState<CustomerTypeDto | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20);
  const [sortBy, setSortBy] = useState('Id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters] = useState<Record<string, unknown>>({});

  const createCustomerType = useCreateCustomerType();
  const updateCustomerType = useUpdateCustomerType();

  useEffect(() => {
    setPageTitle(t('customerTypeManagement.menu', 'Müşteri Tipi Yönetimi'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  const handleAddClick = (): void => {
    setEditingCustomerType(null);
    setFormOpen(true);
  };

  const handleEdit = (customerType: CustomerTypeDto): void => {
    setEditingCustomerType(customerType);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CustomerTypeFormSchema): Promise<void> => {
    if (editingCustomerType) {
      await updateCustomerType.mutateAsync({
        id: editingCustomerType.id,
        data: {
          name: data.name,
          description: data.description || undefined,
        },
      });
    } else {
      await createCustomerType.mutateAsync({
        name: data.name,
        description: data.description || undefined,
      });
    }
    setFormOpen(false);
    setEditingCustomerType(null);
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
            {t('customerTypeManagement.menu', 'Müşteri Tipi Yönetimi')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('customerTypeManagement.description', 'Müşteri tiplerini yönetin ve düzenleyin')}
          </p>
        </div>
        <Button onClick={handleAddClick}>
          {t('customerTypeManagement.addButton', 'Yeni Müşteri Tipi Ekle')}
        </Button>
      </div>

      <CustomerTypeStats />

      <div className="space-y-4">
        <CustomerTypeTable
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

      <CustomerTypeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        customerType={editingCustomerType}
        isLoading={createCustomerType.isPending || updateCustomerType.isPending}
      />
    </div>
  );
}
