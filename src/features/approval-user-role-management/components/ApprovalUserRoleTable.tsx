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
import { useApprovalUserRoleList } from '../hooks/useApprovalUserRoleList';
import { useDeleteApprovalUserRole } from '../hooks/useDeleteApprovalUserRole';
import type { ApprovalUserRoleDto } from '../types/approval-user-role-types';
import type { PagedFilter } from '@/types/api';

interface ApprovalUserRoleTableProps {
  onEdit: (userRole: ApprovalUserRoleDto) => void;
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: PagedFilter[] | Record<string, unknown>;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
}

export function ApprovalUserRoleTable({
  onEdit,
  pageNumber,
  pageSize,
  sortBy = 'Id',
  sortDirection = 'desc',
  filters = {},
  onPageChange,
  onSortChange,
}: ApprovalUserRoleTableProps): ReactElement {
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUserRole, setSelectedUserRole] = useState<ApprovalUserRoleDto | null>(null);

  const { data, isLoading } = useApprovalUserRoleList({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    filters: filters as PagedFilter[] | undefined,
  });

  const deleteUserRole = useDeleteApprovalUserRole();

  const handleDeleteClick = (userRole: ApprovalUserRoleDto): void => {
    setSelectedUserRole(userRole);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (selectedUserRole) {
      await deleteUserRole.mutateAsync(selectedUserRole.id);
      setDeleteDialogOpen(false);
      setSelectedUserRole(null);
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

  const userRoles = data?.data || (data as any)?.items || [];
  
  if (!data || userRoles.length === 0) {
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
                  {t('approvalUserRole.table.id', 'ID')}
                  <SortIcon column="Id" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('UserFullName')}
              >
                <div className="flex items-center">
                  {t('approvalUserRole.table.userFullName', 'Kullanıcı')}
                  <SortIcon column="UserFullName" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('ApprovalRoleName')}
              >
                <div className="flex items-center">
                  {t('approvalUserRole.table.approvalRoleName', 'Onay Rolü')}
                  <SortIcon column="ApprovalRoleName" />
                </div>
              </TableHead>
              <TableHead>
                {t('approvalUserRole.table.createdDate', 'Oluşturulma Tarihi')}
              </TableHead>
              <TableHead>
                {t('approvalUserRole.table.createdBy', 'Oluşturan Kullanıcı')}
              </TableHead>
              <TableHead className="text-right">
                {t('common.actions', 'İşlemler')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userRoles.map((userRole: ApprovalUserRoleDto) => (
              <TableRow key={userRole.id}>
                <TableCell>{userRole.id}</TableCell>
                <TableCell className="font-medium">{userRole.userFullName || '-'}</TableCell>
                <TableCell>{userRole.approvalRoleName || '-'}</TableCell>
                <TableCell>
                  {new Date(userRole.createdDate).toLocaleDateString('tr-TR')}
                </TableCell>
                <TableCell>
                  {userRole.createdByFullUser || userRole.createdByFullName || userRole.createdBy || '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(userRole)}
                    >
                      {t('common.edit', 'Düzenle')}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(userRole)}
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
          {t('approvalUserRole.table.showing', '{{from}}-{{to}} / {{total}} gösteriliyor', {
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
            {t('approvalUserRole.table.page', 'Sayfa {{current}} / {{total}}', {
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
              {t('approvalUserRole.delete.confirmTitle', 'Onay Kullanıcı Rolünü Sil')}
            </DialogTitle>
            <DialogDescription>
              {t('approvalUserRole.delete.confirmMessage', 'Bu onay kullanıcı rolünü silmek istediğinizden emin misiniz?', {
                user: selectedUserRole?.userFullName || '',
                role: selectedUserRole?.approvalRoleName || '',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteUserRole.isPending}
            >
              {t('common.cancel', 'İptal')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteUserRole.isPending}
            >
              {deleteUserRole.isPending
                ? t('common.loading', 'Yükleniyor...')
                : t('common.delete', 'Sil')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
