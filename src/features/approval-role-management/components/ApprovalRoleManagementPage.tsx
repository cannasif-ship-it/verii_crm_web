import { type ReactElement, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { ApprovalRoleTable } from './ApprovalRoleTable';
import { ApprovalRoleForm } from './ApprovalRoleForm';
import { useCreateApprovalRole } from '../hooks/useCreateApprovalRole';
import { useUpdateApprovalRole } from '../hooks/useUpdateApprovalRole';
import type { ApprovalRoleDto } from '../types/approval-role-types';
import type { ApprovalRoleFormSchema } from '../types/approval-role-types';

export function ApprovalRoleManagementPage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<ApprovalRoleDto | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20);
  const [sortBy, setSortBy] = useState('Id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters] = useState<Record<string, unknown>>({});

  const createRole = useCreateApprovalRole();
  const updateRole = useUpdateApprovalRole();

  useEffect(() => {
    setPageTitle(t('approvalRole.menu', 'Onay Rolü Yönetimi'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  const handleAddClick = (): void => {
    setEditingRole(null);
    setFormOpen(true);
  };

  const handleEdit = (role: ApprovalRoleDto): void => {
    setEditingRole(role);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: ApprovalRoleFormSchema): Promise<void> => {
    if (editingRole) {
      await updateRole.mutateAsync({
        id: editingRole.id,
        data: { 
          approvalRoleGroupId: data.approvalRoleGroupId, 
          name: data.name,
          maxAmount: data.maxAmount,
        },
      });
    } else {
      await createRole.mutateAsync({ 
        approvalRoleGroupId: data.approvalRoleGroupId, 
        name: data.name,
        maxAmount: data.maxAmount,
      });
    }
    setFormOpen(false);
    setEditingRole(null);
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
            {t('approvalRole.menu', 'Onay Rolü Yönetimi')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('approvalRole.description', 'Onay rollerini yönetin ve düzenleyin')}
          </p>
        </div>
        <Button onClick={handleAddClick}>
          {t('approvalRole.addButton', 'Yeni Onay Rolü Ekle')}
        </Button>
      </div>

      <div className="space-y-4">
        <ApprovalRoleTable
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

      <ApprovalRoleForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        role={editingRole}
        isLoading={createRole.isPending || updateRole.isPending}
      />
    </div>
  );
}
