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
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { useApprovalRoleGroupList } from '../hooks/useApprovalRoleGroupList';
import { useDeleteApprovalRoleGroup } from '../hooks/useDeleteApprovalRoleGroup';
import type { ApprovalRoleGroupDto } from '../types/approval-role-group-types';
import type { PagedFilter } from '@/types/api';
import { Edit2, Trash2, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, AlertCircle, Search } from 'lucide-react';

interface ApprovalRoleGroupTableProps {
  onEdit: (group: ApprovalRoleGroupDto) => void;
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: PagedFilter[] | Record<string, unknown>;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
}

export function ApprovalRoleGroupTable({
  onEdit,
  pageNumber,
  pageSize,
  sortBy = 'Id',
  sortDirection = 'desc',
  filters = {},
  onPageChange,
  onSortChange,
}: ApprovalRoleGroupTableProps): ReactElement {
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ApprovalRoleGroupDto | null>(null);

  const { data, isLoading } = useApprovalRoleGroupList({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    filters: filters as PagedFilter[] | undefined,
  });

  const deleteGroup = useDeleteApprovalRoleGroup();

  const handleDeleteClick = (group: ApprovalRoleGroupDto): void => {
    setSelectedGroup(group);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (selectedGroup) {
      await deleteGroup.mutateAsync(selectedGroup.id);
      setDeleteDialogOpen(false);
      setSelectedGroup(null);
    }
  };

  const handleSort = (column: string): void => {
    const newDirection =
      sortBy === column && sortDirection === 'asc' ? 'desc' : 'asc';
    onSortChange(column, newDirection);
  };

  const SortIcon = ({ column }: { column: string }): ReactElement => {
    if (sortBy !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4 text-pink-600" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4 text-pink-600" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-8 h-8 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
        <div className="text-muted-foreground text-sm font-medium">
          {t('common.loading', 'Yükleniyor...')}
        </div>
      </div>
    );
  }

  const groups = data?.data || (data as any)?.items || [];
  
  if (!data || groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {t('common.noData', 'Veri bulunamadı')}
        </h3>
        <p className="text-muted-foreground text-sm mt-1 text-center max-w-sm">
          {t('common.noDataDescription', 'Arama kriterlerinize uygun kayıt bulunamadı veya henüz hiç kayıt eklenmemiş.')}
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil((data?.totalCount || 0) / pageSize);

  return (
    <>
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <TableHead
                className="cursor-pointer select-none py-4 font-semibold text-zinc-900 dark:text-zinc-100"
                onClick={() => handleSort('Id')}
              >
                <div className="flex items-center">
                  {t('approvalRoleGroup.table.id', 'ID')}
                  <SortIcon column="Id" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none py-4 font-semibold text-zinc-900 dark:text-zinc-100"
                onClick={() => handleSort('Name')}
              >
                <div className="flex items-center">
                  {t('approvalRoleGroup.table.name', 'Grup Adı')}
                  <SortIcon column="Name" />
                </div>
              </TableHead>
              <TableHead className="py-4 font-semibold text-zinc-900 dark:text-zinc-100">
                {t('approvalRoleGroup.table.createdDate', 'Oluşturulma Tarihi')}
              </TableHead>
              <TableHead className="py-4 font-semibold text-zinc-900 dark:text-zinc-100">
                {t('approvalRoleGroup.table.createdBy', 'Oluşturan Kullanıcı')}
              </TableHead>
              <TableHead className="text-right py-4 font-semibold text-zinc-900 dark:text-zinc-100">
                {t('common.actions', 'İşlemler')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((group: ApprovalRoleGroupDto) => (
              <TableRow 
                key={group.id}
                className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800/50 transition-colors"
              >
                <TableCell className="font-medium text-zinc-700 dark:text-zinc-300">
                  #{group.id}
                </TableCell>
                <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                  {group.name}
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400">
                  {new Date(group.createdDate).toLocaleDateString('tr-TR')}
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400">
                  {group.createdByFullUser || group.createdByFullName || group.createdBy || '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(group)}
                      className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(group)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
          <div className="text-sm text-muted-foreground">
            Toplam {data?.totalCount || 0} kayıttan {(pageNumber - 1) * pageSize + 1} - {Math.min(pageNumber * pageSize, data?.totalCount || 0)} arası gösteriliyor
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pageNumber - 1)}
              disabled={pageNumber <= 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                const distance = Math.abs(page - pageNumber);
                return distance === 0 || distance === 1 || page === 1 || page === totalPages;
              })
              .map((page, index, array) => {
                const showEllipsis = index > 0 && page - array[index - 1] > 1;
                return (
                  <div key={page} className="flex items-center">
                    {showEllipsis && <span className="mx-1 text-muted-foreground">...</span>}
                    <Button
                      variant={pageNumber === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(page)}
                      className={`h-8 w-8 p-0 ${
                        pageNumber === page 
                          ? 'bg-pink-600 hover:bg-pink-700 text-white border-pink-600' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {page}
                    </Button>
                  </div>
                );
              })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pageNumber + 1)}
              disabled={pageNumber >= totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] border-0 bg-white dark:bg-[#130822] shadow-2xl p-0 overflow-hidden rounded-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-orange-500" />
          
          <div className="p-6 pb-0">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-500" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {t('common.deleteConfirmTitle', 'Silme Onayı')}
                </DialogTitle>
                <DialogDescription className="mt-1 text-zinc-500 dark:text-zinc-400">
                  Bu işlem geri alınamaz. Devam etmek istiyor musunuz?
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-6 bg-zinc-50/50 dark:bg-zinc-900/50 mt-6 border-t border-zinc-100 dark:border-zinc-800">
             <div className="flex justify-end gap-3">
               <DialogClose asChild>
                 <Button variant="outline" className="border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                   {t('common.cancel', 'İptal')}
                 </Button>
               </DialogClose>
               <Button 
                 variant="destructive" 
                 onClick={handleDeleteConfirm}
                 className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20"
               >
                 {t('common.delete', 'Sil')}
               </Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
