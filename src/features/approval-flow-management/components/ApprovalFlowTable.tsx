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
  const { t } = useTranslation();
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

  const approvalFlows = data?.data || (data as any)?.items || [];
  
  if (!data || approvalFlows.length === 0) {
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
                  {t('approvalFlow.table.id', 'ID')}
                  <SortIcon column="Id" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('DocumentType')}
              >
                <div className="flex items-center">
                  {t('approvalFlow.table.documentType', 'Belge Tipi')}
                  <SortIcon column="DocumentType" />
                </div>
              </TableHead>
              <TableHead>
                {t('approvalFlow.table.description', 'Açıklama')}
              </TableHead>
              <TableHead>
                {t('approvalFlow.table.isActive', 'Aktif')}
              </TableHead>
              <TableHead>
                {t('approvalFlow.table.createdDate', 'Oluşturulma Tarihi')}
              </TableHead>
              <TableHead>
                {t('approvalFlow.table.createdBy', 'Oluşturan Kullanıcı')}
              </TableHead>
              <TableHead className="text-right">
                {t('common.actions', 'İşlemler')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {approvalFlows.map((approvalFlow: ApprovalFlowDto) => (
              <TableRow key={approvalFlow.id}>
                <TableCell>{approvalFlow.id}</TableCell>
                <TableCell className="font-medium">
                  {getDocumentTypeLabel(approvalFlow.documentType)}
                </TableCell>
                <TableCell>
                  {approvalFlow.description || '-'}
                </TableCell>
                <TableCell>
                  <Badge variant={approvalFlow.isActive ? 'default' : 'secondary'}>
                    {approvalFlow.isActive
                      ? t('common.active', 'Aktif')
                      : t('common.inactive', 'Pasif')}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(approvalFlow.createdDate).toLocaleDateString('tr-TR')}
                </TableCell>
                <TableCell>
                  {approvalFlow.createdByFullUser || '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(approvalFlow)}
                    >
                      {t('common.edit', 'Düzenle')}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(approvalFlow)}
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
          >
            {t('common.previous', 'Önceki')}
          </Button>
          <div className="flex items-center px-4 text-sm">
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
          >
            {t('common.next', 'Sonraki')}
          </Button>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('approvalFlow.delete.confirmTitle', 'Onay Akışını Sil')}
            </DialogTitle>
            <DialogDescription>
              {t('approvalFlow.delete.confirmMessage', 'Bu onay akışını silmek istediğinizden emin misiniz?', {
                id: selectedApprovalFlow?.id || '',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteApprovalFlow.isPending}
            >
              {t('common.cancel', 'İptal')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteApprovalFlow.isPending}
            >
              {deleteApprovalFlow.isPending
                ? t('common.loading', 'Yükleniyor...')
                : t('common.delete', 'Sil')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
