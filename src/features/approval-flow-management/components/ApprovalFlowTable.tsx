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
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useApprovalFlowList } from '../hooks/useApprovalFlowList';
import { useDeleteApprovalFlow } from '../hooks/useDeleteApprovalFlow';
import type { ApprovalFlowDto } from '../types/approval-flow-types';
import type { PagedFilter } from '@/types/api';
import { DocumentTypeEnum } from '../types/approval-flow-types';
import { Edit2, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface ApprovalFlowTableProps {
  onEdit: (approvalFlow: ApprovalFlowDto) => void;
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: PagedFilter[] | Record<string, unknown>;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
}

export function ApprovalFlowTable({
  onEdit,
  pageNumber,
  pageSize,
  sortBy = 'Id',
  sortDirection = 'desc',
  filters = {},
  onPageChange,
  onSortChange,
}: ApprovalFlowTableProps): ReactElement {
  const { t, i18n } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedApprovalFlow, setSelectedApprovalFlow] = useState<ApprovalFlowDto | null>(null);

  const { data, isLoading } = useApprovalFlowList({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    filters: filters as PagedFilter[] | undefined,
  });

  const deleteApprovalFlow = useDeleteApprovalFlow();

  const handleDeleteClick = (approvalFlow: ApprovalFlowDto): void => {
    setSelectedApprovalFlow(approvalFlow);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (selectedApprovalFlow) {
      await deleteApprovalFlow.mutateAsync(selectedApprovalFlow.id);
      setDeleteDialogOpen(false);
      setSelectedApprovalFlow(null);
    }
  };

  const handleSort = (column: string): void => {
    const newDirection =
      sortBy === column && sortDirection === 'asc' ? 'desc' : 'asc';
    onSortChange(column, newDirection);
  };

  const getDocumentTypeLabel = (type: number): string => {
    switch (type) {
      case DocumentTypeEnum.Offer:
        return t('approvalFlow.documentType.offer', 'Teklif');
      case DocumentTypeEnum.Request:
        return t('approvalFlow.documentType.request', 'Talep');
      case DocumentTypeEnum.Order:
        return t('approvalFlow.documentType.order', 'Sipariş');
      default:
        return '-';
    }
  };

  const SortIcon = ({ column }: { column: string }): ReactElement => {
    if (sortBy !== column) {
      return <ArrowUpDown size={14} className="ml-2 inline-block text-slate-400 opacity-50" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={14} className="ml-2 inline-block text-pink-600 dark:text-pink-400" />
    ) : (
      <ArrowDown size={14} className="ml-2 inline-block text-pink-600 dark:text-pink-400" />
    );
  };

  const headStyle = "cursor-pointer select-none text-slate-500 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-4";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-current text-pink-500" />
          <div className="text-sm text-muted-foreground animate-pulse">
            {t('approvalFlow.loading', 'Yükleniyor...')}
          </div>
        </div>
      </div>
    );
  }

  const approvalFlows = data?.data || (data as any)?.items || [];
  
  if (!data || approvalFlows.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground bg-slate-50 dark:bg-white/5 px-6 py-4 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
          {t('approvalFlow.noData', 'Veri yok')}
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil((data.totalCount || 0) / pageSize);

  return (
    <>
      <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-white/5">
            <TableRow className="border-b border-slate-200 dark:border-white/10 hover:bg-transparent">
              <TableHead
                className={headStyle}
                onClick={() => handleSort('Id')}
              >
                <div className="flex items-center">
                  {t('approvalFlow.table.id', 'ID')}
                  <SortIcon column="Id" />
                </div>
              </TableHead>
              <TableHead
                className={headStyle}
                onClick={() => handleSort('DocumentType')}
              >
                <div className="flex items-center">
                  {t('approvalFlow.table.documentType', 'Belge Tipi')}
                  <SortIcon column="DocumentType" />
                </div>
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400 py-4">
                {t('approvalFlow.table.description', 'Açıklama')}
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400 py-4">
                {t('approvalFlow.table.isActive', 'Aktif')}
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400 py-4">
                {t('approvalFlow.table.createdDate', 'Oluşturulma Tarihi')}
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400 py-4">
                {t('approvalFlow.table.createdBy', 'Oluşturan Kullanıcı')}
              </TableHead>
              <TableHead className="text-right text-slate-500 dark:text-slate-400 py-4">
                {t('approvalFlow.table.actions', 'İşlemler')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {approvalFlows.map((approvalFlow: ApprovalFlowDto) => (
              <TableRow 
                key={approvalFlow.id}
                className="border-b border-slate-100 dark:border-white/5 transition-colors duration-200 hover:bg-pink-50/40 dark:hover:bg-pink-500/5 group"
              >
                <TableCell className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                  {approvalFlow.id}
                </TableCell>
                <TableCell className="font-medium text-slate-900 dark:text-white">
                  {getDocumentTypeLabel(approvalFlow.documentType)}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {approvalFlow.description || '-'}
                </TableCell>
                <TableCell>
                  <Badge variant={approvalFlow.isActive ? 'default' : 'secondary'}>
                    {approvalFlow.isActive
                      ? t('approvalFlow.active', 'Aktif')
                      : t('approvalFlow.inactive', 'Pasif')}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                  {new Date(approvalFlow.createdDate).toLocaleDateString(i18n.language)}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {approvalFlow.createdByFullUser || '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                      onClick={() => onEdit(approvalFlow)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                      onClick={() => handleDeleteClick(approvalFlow)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {t('approvalFlow.table.showing', '{{from}}-{{to}} / {{total}} gösteriliyor', {
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
            className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"
          >
            {t('approvalFlow.previous', 'Önceki')}
          </Button>
          <div className="flex items-center px-4 text-sm font-medium text-slate-700 dark:text-slate-200">
            {t('approvalFlow.table.page', 'Sayfa {{current}} / {{total}}', {
              current: pageNumber,
              total: totalPages,
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageNumber + 1)}
            disabled={pageNumber >= totalPages}
            className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"
          >
            {t('approvalFlow.next', 'Sonraki')}
          </Button>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#130822] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">
              {t('approvalFlow.delete.confirmTitle', 'Onay Akışını Sil')}
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              {t('approvalFlow.delete.confirmMessage', 'Bu onay akışını silmek istediğinizden emin misiniz?', {
                id: selectedApprovalFlow?.id || '',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteApprovalFlow.isPending}
              className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
            >
              {t('approvalFlow.delete.cancel', 'İptal')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteApprovalFlow.isPending}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-900/50 dark:hover:bg-red-900/70 border border-transparent dark:border-red-500/20 text-white"
            >
              {deleteApprovalFlow.isPending
                ? t('approvalFlow.loading', 'Yükleniyor...')
                : t('approvalFlow.delete.action', 'Sil')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
