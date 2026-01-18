import { type ReactElement, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { Plus } from 'lucide-react';
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
    <div className="w-full space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 transition-colors">
            {t('customerTypeManagement.menu', 'Müşteri Tipi Yönetimi')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium transition-colors">
            {t('customerTypeManagement.description', 'Müşteri tiplerini yönetin ve düzenleyin')}
          </p>
        </div>
        
        <Button 
          onClick={handleAddClick}
          className="px-6 py-2 bg-gradient-to-r from-pink-600 to-orange-600 rounded-lg text-white text-sm font-bold shadow-lg shadow-pink-500/20 hover:scale-105 transition-transform border-0 hover:text-white"
        >
          <Plus size={18} className="mr-2" />
          {t('customerTypeManagement.addButton', 'Yeni Müşteri Tipi Ekle')}
        </Button>
      </div>

      <CustomerTypeStats />

      <div className="bg-white/70 dark:bg-[#1a1025]/60 backdrop-blur-xl border border-white/60 dark:border-white/5 shadow-sm rounded-2xl p-6 transition-all duration-300">
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