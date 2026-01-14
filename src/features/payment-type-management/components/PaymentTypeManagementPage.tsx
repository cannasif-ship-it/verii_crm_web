import { type ReactElement, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { PaymentTypeTable } from './PaymentTypeTable';
import { PaymentTypeForm } from './PaymentTypeForm';
import { useCreatePaymentType } from '../hooks/useCreatePaymentType';
import { useUpdatePaymentType } from '../hooks/useUpdatePaymentType';
import type { PaymentTypeDto } from '../types/payment-type-types';
import type { PaymentTypeFormSchema } from '../types/payment-type-types';

export function PaymentTypeManagementPage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingPaymentType, setEditingPaymentType] = useState<PaymentTypeDto | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20);
  const [sortBy, setSortBy] = useState('Id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters] = useState<Record<string, unknown>>({});

  const createPaymentType = useCreatePaymentType();
  const updatePaymentType = useUpdatePaymentType();

  useEffect(() => {
    setPageTitle(t('paymentTypeManagement.title', 'Ödeme Tipi Yönetimi'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  const handleAddClick = (): void => {
    setEditingPaymentType(null);
    setFormOpen(true);
  };

  const handleEdit = (paymentType: PaymentTypeDto): void => {
    setEditingPaymentType(paymentType);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: PaymentTypeFormSchema): Promise<void> => {
    if (editingPaymentType) {
      await updatePaymentType.mutateAsync({
        id: editingPaymentType.id,
        data: {
          name: data.name,
          description: data.description || undefined,
        },
      });
    } else {
      await createPaymentType.mutateAsync({
        name: data.name,
        description: data.description || undefined,
      });
    }
    setFormOpen(false);
    setEditingPaymentType(null);
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
            {t('paymentTypeManagement.title', 'Ödeme Tipi Yönetimi')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('paymentTypeManagement.description', 'Ödeme tiplerini yönetin ve düzenleyin')}
          </p>
        </div>
        <Button onClick={handleAddClick}>
          {t('paymentTypeManagement.create', 'Yeni Ödeme Tipi')}
        </Button>
      </div>

      <div className="space-y-4">
        <PaymentTypeTable
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

      <PaymentTypeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        paymentType={editingPaymentType}
        isLoading={createPaymentType.isPending || updatePaymentType.isPending}
      />
    </div>
  );
}
