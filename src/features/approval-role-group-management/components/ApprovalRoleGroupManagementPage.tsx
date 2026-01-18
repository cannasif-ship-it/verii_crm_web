import { type ReactElement, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { ApprovalRoleGroupTable } from './ApprovalRoleGroupTable';
import { ApprovalRoleGroupForm } from './ApprovalRoleGroupForm';
import { useCreateApprovalRoleGroup } from '../hooks/useCreateApprovalRoleGroup';
import { useUpdateApprovalRoleGroup } from '../hooks/useUpdateApprovalRoleGroup';
import type { ApprovalRoleGroupDto } from '../types/approval-role-group-types';
import type { ApprovalRoleGroupFormSchema } from '../types/approval-role-group-types';

export function ApprovalRoleGroupManagementPage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ApprovalRoleGroupDto | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20);
  const [sortBy, setSortBy] = useState('Id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters] = useState<Record<string, unknown>>({});

  const createGroup = useCreateApprovalRoleGroup();
  const updateGroup = useUpdateApprovalRoleGroup();

  useEffect(() => {
    setPageTitle(t('approvalRoleGroup.menu', 'Onay Rol Grubu Yönetimi'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  const handleAddClick = (): void => {
    setEditingGroup(null);
    setFormOpen(true);
  };

  const handleEdit = (group: ApprovalRoleGroupDto): void => {
    setEditingGroup(group);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: ApprovalRoleGroupFormSchema): Promise<void> => {
    if (editingGroup) {
      await updateGroup.mutateAsync({
        id: editingGroup.id,
        data: { name: data.name },
      });
    } else {
      await createGroup.mutateAsync({ name: data.name });
    }
    setFormOpen(false);
    setEditingGroup(null);
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
            {t('approvalRoleGroup.menu', 'Onay Rol Grubu Yönetimi')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('approvalRoleGroup.description', 'Onay rol gruplarını yönetin ve düzenleyin')}
          </p>
        </div>
        <Button onClick={handleAddClick}>
          {t('approvalRoleGroup.addButton', 'Yeni Onay Rol Grubu Ekle')}
        </Button>
      </div>

      <div className="space-y-4">
        <ApprovalRoleGroupTable
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

      <ApprovalRoleGroupForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        group={editingGroup}
        isLoading={createGroup.isPending || updateGroup.isPending}
      />
    </div>
  );
}
