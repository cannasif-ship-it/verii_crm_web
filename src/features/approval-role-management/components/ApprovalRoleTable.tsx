import { type ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useApprovalRoleList } from '../hooks/useApprovalRoleList';
import { useDeleteApprovalRole } from '../hooks/useDeleteApprovalRole';
import type { ApprovalRoleDto } from '../types/approval-role-types';
import type { PagedFilter } from '@/types/api';

interface ApprovalRoleTableProps {
  onEdit: (role: ApprovalRoleDto) => void;
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: PagedFilter[] | Record<string, unknown>;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
}

export function ApprovalRoleTable({
  onEdit,
  pageNumber,
  pageSize,
  sortBy = 'Id',
  sortDirection = 'desc',
  filters = {},
  onPageChange,
  onSortChange,
}: ApprovalRoleTableProps): ReactElement {
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<ApprovalRoleDto | null>(null);

  const { data, isLoading } = useApprovalRoleList({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    filters: filters as PagedFilter[] | undefined,
  });

  const deleteRole = useDeleteApprovalRole();

  const handleDeleteClick = (role: ApprovalRoleDto): void => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (selectedRole) {
      await deleteRole.mutateAsync(selectedRole.id);
      setDeleteDialogOpen(false);
      setSelectedRole(null);
    }
  };

  const handleSort = (column: string): void => {
    const newDirection =
      sortBy === column && sortDirection === 'asc' ? 'desc' : 'asc';
    onSortChange(column, newDirection);
  };

  const SortIcon = ({ column }: { column: string }): ReactElement => {
    if (sortBy !== column) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-1 inline-block text-muted-foreground"
        >
          <path d="M8 9l4-4 4 4" />
          <path d="M16 15l-4 4-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="ml-1 inline-block"
      >
        <path d="M8 9l4-4 4 4" />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="ml-1 inline-block"
      >
        <path d="M16 15l-4 4-4-4" />
      </svg>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">
          {t('common.loading', 'Yükleniyor...')}
        </div>
      </div>
    );
  }

  const roles = data?.data || (data as any)?.items || [];
  
  if (!data || roles.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">
          {t('common.noData', 'Veri yok')}
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil((data.totalCount || 0) / pageSize);

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('Id')}
              >
                <div className="flex items-center">
                  {t('approvalRole.table.id', 'ID')}
                  <SortIcon column="Id" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('ApprovalRoleGroupName')}
              >
                <div className="flex items-center">
                  {t('approvalRole.table.approvalRoleGroupName', 'Rol Grubu')}
                  <SortIcon column="ApprovalRoleGroupName" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('Name')}
              >
                <div className="flex items-center">
                  {t('approvalRole.table.name', 'Rol Adı')}
                  <SortIcon column="Name" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('MaxAmount')}
              >
                <div className="flex items-center">
                  {t('approvalRole.table.maxAmount', 'Maksimum Tutar')}
                  <SortIcon column="MaxAmount" />
                </div>
              </TableHead>
              <TableHead>
                {t('approvalRole.table.createdDate', 'Oluşturulma Tarihi')}
              </TableHead>
              <TableHead>
                {t('approvalRole.table.createdBy', 'Oluşturan Kullanıcı')}
              </TableHead>
              <TableHead className="text-right">
                {t('common.actions', 'İşlemler')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role: ApprovalRoleDto) => (
              <TableRow key={role.id}>
                <TableCell>{role.id}</TableCell>
                <TableCell>{role.approvalRoleGroupName || '-'}</TableCell>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  }).format(role.maxAmount)}
                </TableCell>
                <TableCell>
                  {new Date(role.createdDate).toLocaleDateString('tr-TR')}
                </TableCell>
                <TableCell>
                  {role.createdByFullUser || role.createdByFullName || role.createdBy || '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(role)}
                    >
                      {t('common.edit', 'Düzenle')}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(role)}
                    >
                      {t('common.delete', 'Sil')}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          {t('approvalRole.table.showing', '{{from}}-{{to}} / {{total}} gösteriliyor', {
            from: (pageNumber - 1) * pageSize + 1,
            to: Math.min(pageNumber * pageSize, data.totalCount || 0),
            total: data.totalCount || 0,
          })}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageNumber - 1)}
            disabled={pageNumber <= 1}
          >
            {t('common.previous', 'Önceki')}
          </Button>
          <div className="flex items-center px-4 text-sm">
            {t('approvalRole.table.page', 'Sayfa {{current}} / {{total}}', {
              current: pageNumber,
              total: totalPages,
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageNumber + 1)}
            disabled={pageNumber >= totalPages}
          >
            {t('common.next', 'Sonraki')}
          </Button>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('approvalRole.delete.confirmTitle', 'Onay Rolünü Sil')}
            </DialogTitle>
            <DialogDescription>
              {t('approvalRole.delete.confirmMessage', '{{name}} onay rolünü silmek istediğinizden emin misiniz?', {
                name: selectedRole?.name || '',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteRole.isPending}
            >
              {t('common.cancel', 'İptal')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteRole.isPending}
            >
              {deleteRole.isPending
                ? t('common.loading', 'Yükleniyor...')
                : t('common.delete', 'Sil')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
