import { type ReactElement, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { CityStats } from './CityStats';
import { CityTable } from './CityTable';
import { CityForm } from './CityForm';
import { useCreateCity } from '../hooks/useCreateCity';
import { useUpdateCity } from '../hooks/useUpdateCity';
import type { CityDto } from '../types/city-types';
import type { CityFormSchema } from '../types/city-types';

export function CityManagementPage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<CityDto | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20);
  const [sortBy, setSortBy] = useState('Id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters] = useState<Record<string, unknown>>({});

  const createCity = useCreateCity();
  const updateCity = useUpdateCity();

  useEffect(() => {
    setPageTitle(t('cityManagement.menu', 'Şehir Yönetimi'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  const handleAddClick = (): void => {
    setEditingCity(null);
    setFormOpen(true);
  };

  const handleEdit = (city: CityDto): void => {
    setEditingCity(city);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CityFormSchema): Promise<void> => {
    if (editingCity) {
      await updateCity.mutateAsync({
        id: editingCity.id,
        data: {
          name: data.name,
          erpCode: data.erpCode || undefined,
          countryId: data.countryId,
        },
      });
    } else {
      await createCity.mutateAsync({
        name: data.name,
        erpCode: data.erpCode || undefined,
        countryId: data.countryId,
      });
    }
    setFormOpen(false);
    setEditingCity(null);
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
            {t('cityManagement.menu', 'Şehir Yönetimi')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('cityManagement.description', 'Şehirleri yönetin ve düzenleyin')}
          </p>
        </div>
        <Button onClick={handleAddClick}>
          {t('cityManagement.addButton', 'Yeni Şehir Ekle')}
        </Button>
      </div>

      <CityStats />

      <div className="space-y-4">
        <CityTable
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

      <CityForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        city={editingCity}
        isLoading={createCity.isPending || updateCity.isPending}
      />
    </div>
  );
}
