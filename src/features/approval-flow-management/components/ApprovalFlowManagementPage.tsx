import { type ReactElement, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { ApprovalFlowTable } from './ApprovalFlowTable';
import { ApprovalFlowForm } from './ApprovalFlowForm';
import { useCreateApprovalFlow } from '../hooks/useCreateApprovalFlow';
import { useUpdateApprovalFlow } from '../hooks/useUpdateApprovalFlow';
import type { ApprovalFlowDto } from '../types/approval-flow-types';
import type { ApprovalFlowFormSchema } from '../types/approval-flow-types';

export function ApprovalFlowManagementPage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingApprovalFlow, setEditingApprovalFlow] = useState<ApprovalFlowDto | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20);
  const [sortBy, setSortBy] = useState('Id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters] = useState<Record<string, unknown>>({});

  const createApprovalFlow = useCreateApprovalFlow();
  const updateApprovalFlow = useUpdateApprovalFlow();

  useEffect(() => {
    setPageTitle(t('approvalFlow.menu', 'Onay Akışı Yönetimi'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  const handleAddClick = (): void => {
    setEditingApprovalFlow(null);
    setFormOpen(true);
  };

  const handleEdit = (approvalFlow: ApprovalFlowDto): void => {
    setEditingApprovalFlow(approvalFlow);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: ApprovalFlowFormSchema): Promise<void> => {
    if (editingApprovalFlow) {
      await updateApprovalFlow.mutateAsync({
        id: editingApprovalFlow.id,
        data: {
          documentType: data.documentType,
          description: data.description || undefined,
          isActive: data.isActive,
        },
      });
    } else {
      await createApprovalFlow.mutateAsync({
        documentType: data.documentType,
        description: data.description || undefined,
        isActive: data.isActive,
      });
    }
    setFormOpen(false);
    setEditingApprovalFlow(null);
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
            {t('approvalFlow.menu', 'Onay Akışı Yönetimi')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('approvalFlow.description', 'Onay akışlarını yönetin ve düzenleyin')}
          </p>
        </div>
        <Button onClick={handleAddClick}>
          {t('approvalFlow.addButton', 'Yeni Onay Akışı Ekle')}
        </Button>
      </div>

      <div className="space-y-4">
        <ApprovalFlowTable
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

      <ApprovalFlowForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        approvalFlow={editingApprovalFlow}
        isLoading={createApprovalFlow.isPending || updateApprovalFlow.isPending}
      />
    </div>
  );
}
