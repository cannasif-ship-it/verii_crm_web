import { type ReactElement, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { TitleStats } from './TitleStats';
import { TitleTable } from './TitleTable';
import { TitleForm } from './TitleForm';
import { useCreateTitle } from '../hooks/useCreateTitle';
import { useUpdateTitle } from '../hooks/useUpdateTitle';
import type { TitleDto } from '../types/title-types';
import type { TitleFormSchema } from '../types/title-types';

export function TitleManagementPage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState<TitleDto | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20);
  const [sortBy, setSortBy] = useState('Id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters] = useState<Record<string, unknown>>({});

  const createTitle = useCreateTitle();
  const updateTitle = useUpdateTitle();

  useEffect(() => {
    setPageTitle(t('titleManagement.menu', 'Ünvan Yönetimi'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  const handleAddClick = (): void => {
    setEditingTitle(null);
    setFormOpen(true);
  };

  const handleEdit = (title: TitleDto): void => {
    setEditingTitle(title);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: TitleFormSchema): Promise<void> => {
    if (editingTitle) {
      await updateTitle.mutateAsync({
        id: editingTitle.id,
        data: { titleName: data.titleName, code: data.code || undefined },
      });
    } else {
      await createTitle.mutateAsync({ titleName: data.titleName, code: data.code || undefined });
    }
    setFormOpen(false);
    setEditingTitle(null);
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
            {t('titleManagement.menu', 'Ünvan Yönetimi')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('titleManagement.description', 'Ünvanları yönetin ve düzenleyin')}
          </p>
        </div>
        <Button onClick={handleAddClick}>
          {t('titleManagement.addButton', 'Yeni Ünvan Ekle')}
        </Button>
      </div>

      <TitleStats />

      <div className="space-y-4">
        <TitleTable
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

      <TitleForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        title={editingTitle}
        isLoading={createTitle.isPending || updateTitle.isPending}
      />
    </div>
  );
}
