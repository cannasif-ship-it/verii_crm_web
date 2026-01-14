import { type ReactElement, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { ActivityTable } from './ActivityTable';
import { ActivityForm } from './ActivityForm';
import { useCreateActivity } from '../hooks/useCreateActivity';
import { useUpdateActivity } from '../hooks/useUpdateActivity';
import type { ActivityDto } from '../types/activity-types';
import type { ActivityFormSchema } from '../types/activity-types';

export function ActivityManagementPage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityDto | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20);
  const [sortBy, setSortBy] = useState('Id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters] = useState<Record<string, unknown>>({});

  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();

  useEffect(() => {
    setPageTitle(t('activityManagement.title', 'Aktivite Yönetimi'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setFormOpen(true);
      setEditingActivity(null);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleAddClick = (): void => {
    setEditingActivity(null);
    setFormOpen(true);
  };

  const handleEdit = (activity: ActivityDto): void => {
    setEditingActivity(activity);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: ActivityFormSchema): Promise<void> => {
    if (editingActivity) {
      await updateActivity.mutateAsync({
        id: editingActivity.id,
        data: {
          subject: data.subject,
          description: data.description,
          activityType: data.activityType,
          potentialCustomerId: data.potentialCustomerId || undefined,
          erpCustomerCode: data.erpCustomerCode || undefined,
          status: data.status,
          isCompleted: data.isCompleted,
          priority: data.priority || undefined,
          contactId: data.contactId || undefined,
          assignedUserId: data.assignedUserId || undefined,
          activityDate: data.activityDate,
        },
      });
    } else {
      await createActivity.mutateAsync({
        subject: data.subject,
        description: data.description,
        activityType: data.activityType,
        potentialCustomerId: data.potentialCustomerId || undefined,
        erpCustomerCode: data.erpCustomerCode || undefined,
        status: data.status,
        isCompleted: data.isCompleted,
        priority: data.priority || undefined,
        contactId: data.contactId || undefined,
        assignedUserId: data.assignedUserId || undefined,
        activityDate: data.activityDate,
      });
    }
    setFormOpen(false);
    setEditingActivity(null);
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
            {t('activityManagement.title', 'Aktivite Yönetimi')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('activityManagement.description', 'Aktiviteleri yönetin ve düzenleyin')}
          </p>
        </div>
        <Button onClick={handleAddClick}>
          {t('activityManagement.create', 'Yeni Aktivite')}
        </Button>
      </div>

      <div className="space-y-4">
        <ActivityTable
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

      <ActivityForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        activity={editingActivity}
        isLoading={createActivity.isPending || updateActivity.isPending}
      />
    </div>
  );
}
