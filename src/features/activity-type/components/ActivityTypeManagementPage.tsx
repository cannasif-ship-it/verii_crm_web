import { type ReactElement, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActivityTypeStats } from './ActivityTypeStats';
import { ActivityTypeTable } from './ActivityTypeTable';
import { ActivityTypeForm } from './ActivityTypeForm';
import { useCreateActivityType } from '../hooks/useCreateActivityType';
import { useUpdateActivityType } from '../hooks/useUpdateActivityType';
import type { ActivityTypeDto } from '../types/activity-type-types';
import type { ActivityTypeFormSchema } from '../types/activity-type-types';

export function ActivityTypeManagementPage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingActivityType, setEditingActivityType] = useState<ActivityTypeDto | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20);
  const [sortBy, setSortBy] = useState('Id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters] = useState<Record<string, unknown>>({});

  const createActivityType = useCreateActivityType();
  const updateActivityType = useUpdateActivityType();

  useEffect(() => {
    setPageTitle(t('activityType.menu', 'Aktivite Tipi Yönetimi'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  const handleAddClick = (): void => {
    setEditingActivityType(null);
    setFormOpen(true);
  };

  const handleEdit = (activityType: ActivityTypeDto): void => {
    setEditingActivityType(activityType);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: ActivityTypeFormSchema): Promise<void> => {
    if (editingActivityType) {
      await updateActivityType.mutateAsync({
        id: editingActivityType.id,
        data: { name: data.name, description: data.description || undefined },
      });
    } else {
      await createActivityType.mutateAsync({ 
        name: data.name, 
        description: data.description || undefined 
      });
    }
    setFormOpen(false);
    setEditingActivityType(null);
  };

  const handleSortChange = (newSortBy: string, newSortDirection: 'asc' | 'desc'): void => {
    setSortBy(newSortBy);
    setSortDirection(newSortDirection);
    setPageNumber(1);
  };

  return (
    <div className="w-full space-y-8 relative">
      
      {/* Başlık ve Aksiyon Butonu */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 transition-colors">
            {t('activityType.menu', 'Aktivite Tipi Yönetimi')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium transition-colors">
            {t('activityType.description', 'Aktivite tiplerini yönetin ve düzenleyin')}
          </p>
        </div>
        
        <Button 
          onClick={handleAddClick}
          className="px-6 py-2 bg-gradient-to-r from-pink-600 to-orange-600 rounded-lg text-white text-sm font-bold shadow-lg shadow-pink-500/20 hover:scale-105 transition-transform border-0 hover:text-white"
        >
          <Plus size={18} className="mr-2" />
          {t('activityType.addButton', 'Yeni Aktivite Tipi Ekle')}
        </Button>
      </div>

      {/* İstatistikler */}
      <ActivityTypeStats />

      {/* Tablo Alanı: Glassmorphism / Buzlu Cam Efekti */}
      <div className="bg-white/70 dark:bg-[#1a1025]/60 backdrop-blur-xl border border-white/60 dark:border-white/5 shadow-sm rounded-2xl p-6 transition-all duration-300">
        <ActivityTypeTable
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

      {/* Form Dialog */}
      <ActivityTypeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        activityType={editingActivityType}
        isLoading={createActivityType.isPending || updateActivityType.isPending}
      />
    </div>
  );
}