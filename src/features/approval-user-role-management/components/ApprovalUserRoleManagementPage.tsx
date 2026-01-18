import { type ReactElement, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { ApprovalUserRoleTable } from './ApprovalUserRoleTable';
import { ApprovalUserRoleForm } from './ApprovalUserRoleForm';
import { useCreateApprovalUserRole } from '../hooks/useCreateApprovalUserRole';
import { useUpdateApprovalUserRole } from '../hooks/useUpdateApprovalUserRole';
import type { ApprovalUserRoleDto } from '../types/approval-user-role-types';
import type { ApprovalUserRoleFormSchema } from '../types/approval-user-role-types';

export function ApprovalUserRoleManagementPage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingUserRole, setEditingUserRole] = useState<ApprovalUserRoleDto | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20);
  const [sortBy, setSortBy] = useState('Id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters] = useState<Record<string, unknown>>({});

  const createUserRole = useCreateApprovalUserRole();
  const updateUserRole = useUpdateApprovalUserRole();

  useEffect(() => {
    setPageTitle(t('approvalUserRole.menu', 'Onay Kullanıcı Rolü Yönetimi'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  const handleAddClick = (): void => {
    setEditingUserRole(null);
    setFormOpen(true);
  };

  const handleEdit = (userRole: ApprovalUserRoleDto): void => {
    setEditingUserRole(userRole);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: ApprovalUserRoleFormSchema): Promise<void> => {
    if (editingUserRole) {
      await updateUserRole.mutateAsync({
        id: editingUserRole.id,
        data: { userId: data.userId, approvalRoleId: data.approvalRoleId },
      });
    } else {
      await createUserRole.mutateAsync({ userId: data.userId, approvalRoleId: data.approvalRoleId });
    }
    setFormOpen(false);
    setEditingUserRole(null);
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
            {t('approvalUserRole.menu', 'Onay Kullanıcı Rolü Yönetimi')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('approvalUserRole.description', 'Onay kullanıcı rollerini yönetin ve düzenleyin')}
          </p>
        </div>
        <Button onClick={handleAddClick}>
          {t('approvalUserRole.addButton', 'Yeni Onay Kullanıcı Rolü Ekle')}
        </Button>
      </div>

      <div className="space-y-4">
        <ApprovalUserRoleTable
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

      <ApprovalUserRoleForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        userRole={editingUserRole}
        isLoading={createUserRole.isPending || updateUserRole.isPending}
      />
    </div>
  );
}
