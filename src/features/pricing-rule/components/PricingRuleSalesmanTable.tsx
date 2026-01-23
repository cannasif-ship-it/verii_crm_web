import { type ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash2, Loader2 } from 'lucide-react';
import { useUsersForPricingRule } from '../hooks/useUsersForPricingRule';
import { useCreatePricingRuleSalesman } from '../hooks/useCreatePricingRuleSalesman';
import { useDeletePricingRuleSalesman } from '../hooks/useDeletePricingRuleSalesman';
import { usePricingRuleSalesmenByHeaderId } from '../hooks/usePricingRuleSalesmenByHeaderId';
import type { PricingRuleSalesmanFormState, PricingRuleHeaderGetDto } from '../types/pricing-rule-types';

interface PricingRuleSalesmanTableProps {
  salesmen: PricingRuleSalesmanFormState[];
  setSalesmen: (salesmen: PricingRuleSalesmanFormState[]) => void;
  header?: PricingRuleHeaderGetDto | null;
}

export function PricingRuleSalesmanTable({
  salesmen,
  setSalesmen,
  header,
}: PricingRuleSalesmanTableProps): ReactElement {
  const { t } = useTranslation();
  const { data: users, isLoading } = useUsersForPricingRule();
  const createMutation = useCreatePricingRuleSalesman();
  const deleteMutation = useDeletePricingRuleSalesman();
  const { data: existingSalesmen } = usePricingRuleSalesmenByHeaderId(header?.id || 0);

  const [addConfirmOpen, setAddConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedSalesmanId, setSelectedSalesmanId] = useState<number | null>(null);
  const [selectedSalesmanToDelete, setSelectedSalesmanToDelete] = useState<{ id: string; dbId?: number } | null>(null);
  const [selectKey, setSelectKey] = useState(0);

  const isExistingRecord = !!header?.id;

  const handleAddSalesman = (salesmanId: number): void => {
    if (salesmen.some((s) => s.salesmanId === salesmanId)) {
      return;
    }

    if (isExistingRecord) {
      setSelectedSalesmanId(salesmanId);
      setAddConfirmOpen(true);
    } else {
      const newSalesman: PricingRuleSalesmanFormState = {
        id: `temp-${Date.now()}`,
        salesmanId,
      };
      setSalesmen([...salesmen, newSalesman]);
    }
  };

  const handleAddConfirm = async (): Promise<void> => {
    if (!selectedSalesmanId || !header?.id) {
      return;
    }

    try {
      const response = await createMutation.mutateAsync({
        pricingRuleHeaderId: header.id,
        salesmanId: selectedSalesmanId,
      });

      if (response) {
        const newSalesman: PricingRuleSalesmanFormState = {
          id: `existing-${response.id}`,
          salesmanId: response.salesmanId,
        };
        setSalesmen([...salesmen, newSalesman]);
        setAddConfirmOpen(false);
        setSelectedSalesmanId(null);
        toast.success(
          t('pricingRule.salesmen.addSuccess', 'Satışçı Eklendi'),
          {
            description: t('pricingRule.salesmen.addSuccessMessage', 'Satışçı fiyat kuralına başarıyla eklendi'),
          }
        );
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('pricingRule.salesmen.addError', 'Satışçı eklenirken bir hata oluştu');
      toast.error(
        t('pricingRule.salesmen.addError', 'Hata'),
        {
          description: errorMessage,
        }
      );
    }
  };

  const handleDeleteSalesman = (id: string): void => {
    const salesman = salesmen.find((s) => s.id === id);
    if (!salesman) {
      return;
    }

    if (isExistingRecord) {
      const existingSalesman = existingSalesmen?.find((s) => s.salesmanId === salesman.salesmanId);
      if (existingSalesman) {
        setSelectedSalesmanToDelete({ id, dbId: existingSalesman.id });
        setDeleteConfirmOpen(true);
      } else {
        setSalesmen(salesmen.filter((salesman) => salesman.id !== id));
      }
    } else {
      setSalesmen(salesmen.filter((salesman) => salesman.id !== id));
    }
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!selectedSalesmanToDelete?.dbId) {
      if (selectedSalesmanToDelete) {
        setSalesmen(salesmen.filter((salesman) => salesman.id !== selectedSalesmanToDelete.id));
      }
      setDeleteConfirmOpen(false);
      setSelectedSalesmanToDelete(null);
      return;
    }

    try {
      await deleteMutation.mutateAsync(selectedSalesmanToDelete.dbId);
      setSalesmen(salesmen.filter((salesman) => salesman.id !== selectedSalesmanToDelete.id));
      setDeleteConfirmOpen(false);
      setSelectedSalesmanToDelete(null);
      toast.success(
        t('pricingRule.salesmen.deleteSuccess', 'Satışçı Kaldırıldı'),
        {
          description: t('pricingRule.salesmen.deleteSuccessMessage', 'Satışçı fiyat kuralından başarıyla kaldırıldı'),
        }
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('pricingRule.salesmen.deleteError', 'Satışçı kaldırılırken bir hata oluştu');
      toast.error(
        t('pricingRule.salesmen.deleteError', 'Hata'),
        {
          description: errorMessage,
        }
      );
    }
  };

  const availableUsers = users?.filter(
    (user) => !salesmen.some((s) => s.salesmanId === user.id)
  ) || [];

  const isLoadingUsers = isLoading;
  const isLoadingAction = createMutation.isPending || deleteMutation.isPending;

  if (isLoadingUsers) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">
          {t('common.loading', 'Yükleniyor...')}
        </div>
      </div>
    );
  }

  const selectedUser = selectedSalesmanId ? users?.find((u) => u.id === selectedSalesmanId) : null;
  const userToDelete = selectedSalesmanToDelete ? users?.find((u) => u.id === salesmen.find((s) => s.id === selectedSalesmanToDelete.id)?.salesmanId) : null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {t('pricingRule.salesmen.title', 'Satışçılar')}
        </h3>
        {availableUsers.length > 0 && (
          <Select
            key={selectKey}
            onValueChange={(value) => {
              handleAddSalesman(parseInt(value));
              setSelectKey((prev) => prev + 1);
            }}
            disabled={isLoadingAction}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder={t('pricingRule.salesmen.add', 'Satışçı Ekle')} />
            </SelectTrigger>
            <SelectContent>
              {availableUsers.map((user) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {salesmen.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>{t('pricingRule.salesmen.empty', 'Henüz satışçı eklenmedi')}</p>
          <p className="text-sm mt-2">
            {t('pricingRule.salesmen.emptyDescription', 'Tüm satışçılar için geçerli olacaktır')}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t('pricingRule.salesmen.salesman', 'Satışçı')}
                </TableHead>
                <TableHead>{t('common.actions', 'İşlemler')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesmen.map((salesman) => {
                const user = users?.find((u) => u.id === salesman.salesmanId);
                return (
                  <TableRow key={salesman.id}>
                    <TableCell>
                      {user?.fullName || `ID: ${salesman.salesmanId}`}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSalesman(salesman.id)}
                        disabled={isLoadingAction}
                      >
                        {isLoadingAction && selectedSalesmanToDelete?.id === salesman.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={addConfirmOpen} onOpenChange={setAddConfirmOpen} modal={true}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {t('pricingRule.salesmen.addConfirmTitle', 'Satışçı Ekle')}
            </DialogTitle>
            <DialogDescription>
              {t('pricingRule.salesmen.addConfirmMessage', '{{name}} satışçısı fiyat kuralına eklenecektir. Onaylıyor musunuz?', {
                name: selectedUser?.fullName || '',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAddConfirmOpen(false);
                setSelectedSalesmanId(null);
              }}
              disabled={isLoadingAction}
            >
              {t('common.cancel', 'İptal')}
            </Button>
            <Button
              type="button"
              onClick={handleAddConfirm}
              disabled={isLoadingAction}
            >
              {isLoadingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.loading', 'Yükleniyor...')}
                </>
              ) : (
                t('common.confirm', 'Onayla')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen} modal={true}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {t('pricingRule.salesmen.deleteConfirmTitle', 'Satışçı Kaldır')}
            </DialogTitle>
            <DialogDescription>
              {t('pricingRule.salesmen.deleteConfirmMessage', '{{name}} satışçısı fiyat kuralından kaldırılacaktır. Onaylıyor musunuz?', {
                name: userToDelete?.fullName || '',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setSelectedSalesmanToDelete(null);
              }}
              disabled={isLoadingAction}
            >
              {t('common.cancel', 'İptal')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isLoadingAction}
            >
              {isLoadingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.loading', 'Yükleniyor...')}
                </>
              ) : (
                t('common.confirm', 'Onayla')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
