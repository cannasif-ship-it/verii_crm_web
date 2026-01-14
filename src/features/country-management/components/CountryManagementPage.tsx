import { type ReactElement, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { CountryStats } from './CountryStats';
import { CountryTable } from './CountryTable';
import { CountryForm } from './CountryForm';
import { useCreateCountry } from '../hooks/useCreateCountry';
import { useUpdateCountry } from '../hooks/useUpdateCountry';
import type { CountryDto } from '../types/country-types';
import type { CountryFormSchema } from '../types/country-types';

export function CountryManagementPage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<CountryDto | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20);
  const [sortBy, setSortBy] = useState('Id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters] = useState<Record<string, unknown>>({});

  const createCountry = useCreateCountry();
  const updateCountry = useUpdateCountry();

  useEffect(() => {
    setPageTitle(t('countryManagement.menu', 'Ülke Yönetimi'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  const handleAddClick = (): void => {
    setEditingCountry(null);
    setFormOpen(true);
  };

  const handleEdit = (country: CountryDto): void => {
    setEditingCountry(country);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CountryFormSchema): Promise<void> => {
    if (editingCountry) {
      await updateCountry.mutateAsync({
        id: editingCountry.id,
        data: {
          name: data.name,
          code: data.code,
          erpCode: data.erpCode || undefined,
        },
      });
    } else {
      await createCountry.mutateAsync({
        name: data.name,
        code: data.code,
        erpCode: data.erpCode || undefined,
      });
    }
    setFormOpen(false);
    setEditingCountry(null);
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
            {t('countryManagement.menu', 'Ülke Yönetimi')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('countryManagement.description', 'Ülkeleri yönetin ve düzenleyin')}
          </p>
        </div>
        <Button onClick={handleAddClick}>
          {t('countryManagement.addButton', 'Yeni Ülke Ekle')}
        </Button>
      </div>

      <CountryStats />

      <div className="space-y-4">
        <CountryTable
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

      <CountryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        country={editingCountry}
        isLoading={createCountry.isPending || updateCountry.isPending}
      />
    </div>
  );
}
