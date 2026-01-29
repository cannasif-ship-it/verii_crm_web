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
import { VoiceSearchCombobox } from '@/components/shared/VoiceSearchCombobox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUsersForPricingRule } from '../hooks/useUsersForPricingRule';
import { useCreatePricingRuleSalesman } from '../hooks/useCreatePricingRuleSalesman';
import { useDeletePricingRuleSalesman } from '../hooks/useDeletePricingRuleSalesman';
import { usePricingRuleSalesmenByHeaderId } from '../hooks/usePricingRuleSalesmenByHeaderId';
import type { PricingRuleSalesmanFormState, PricingRuleHeaderGetDto } from '../types/pricing-rule-types';
// İkonlar
import { 
  Trash2, 
  Loader2, 
  UserPlus, 
  User, 
  
} from 'lucide-react';

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

  const isExistingRecord = !!header?.id;

  // --- Handlers (Mevcut mantık korundu) ---
  const handleAddSalesman = (salesmanId: number): void => {
    if (salesmen.some((s) => s.salesmanId === salesmanId)) return;

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
    if (!selectedSalesmanId || !header?.id) return;

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
        toast.success(t('pricingRule.salesmen.addSuccess', 'Satışçı Eklendi'), { description: t('pricingRule.salesmen.addSuccessMessage', 'Satışçı fiyat kuralına başarıyla eklendi') });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('pricingRule.salesmen.addError', 'Satışçı eklenirken bir hata oluştu');
      toast.error(t('pricingRule.salesmen.addError', 'Hata'), { description: errorMessage });
    }
  };

  const handleDeleteSalesman = (id: string): void => {
    const salesman = salesmen.find((s) => s.id === id);
    if (!salesman) return;

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
      if (selectedSalesmanToDelete) setSalesmen(salesmen.filter((salesman) => salesman.id !== selectedSalesmanToDelete.id));
      setDeleteConfirmOpen(false);
      setSelectedSalesmanToDelete(null);
      return;
    }

    try {
      await deleteMutation.mutateAsync(selectedSalesmanToDelete.dbId);
      setSalesmen(salesmen.filter((salesman) => salesman.id !== selectedSalesmanToDelete.id));
      setDeleteConfirmOpen(false);
      setSelectedSalesmanToDelete(null);
      toast.success(t('pricingRule.salesmen.deleteSuccess', 'Satışçı Kaldırıldı'), { description: t('pricingRule.salesmen.deleteSuccessMessage', 'Satışçı fiyat kuralından başarıyla kaldırıldı') });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('pricingRule.salesmen.deleteError', 'Satışçı kaldırılırken bir hata oluştu');
      toast.error(t('pricingRule.salesmen.deleteError', 'Hata'), { description: errorMessage });
    }
  };

  const availableUsers = users?.filter((user) => !salesmen.some((s) => s.salesmanId === user.id)) || [];
  const isLoadingUsers = isLoading;
  const isLoadingAction = createMutation.isPending || deleteMutation.isPending;
  const selectedUser = selectedSalesmanId ? users?.find((u) => u.id === selectedSalesmanId) : null;
  const userToDelete = selectedSalesmanToDelete ? users?.find((u) => u.id === salesmen.find((s) => s.id === selectedSalesmanToDelete.id)?.salesmanId) : null;

  // Loading State
  if (isLoadingUsers) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm font-medium">{t('pricingRule.loading', 'Yükleniyor...')}</p>
      </div>
    );
  }

  // --- Ortak Stiller ---
  const headStyle = "cursor-pointer select-none text-slate-500 dark:text-slate-400 font-semibold py-3 text-xs uppercase tracking-wider";

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <div className="bg-purple-50 dark:bg-purple-500/20 p-1.5 rounded-lg text-purple-600 dark:text-purple-400">
            <User size={18} />
          </div>
          {t('pricingRule.salesmen.title', 'Satışçılar')}
        </h3>
        
        {availableUsers.length > 0 && (
          <div className="flex items-center gap-2">
            <VoiceSearchCombobox
                options={availableUsers.map((user) => ({
                    value: user.id.toString(),
                    label: user.fullName || ''
                }))}
                value={null}
                onSelect={(value) => {
                    if (value) handleAddSalesman(parseInt(value));
                }}
                placeholder={t('pricingRule.salesmen.add', 'Satışçı Ekle')}
                searchPlaceholder={t('pricingRule.salesmen.search', 'Satışçı ara...')}
                className="w-[240px] h-9 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-xs"
                disabled={isLoadingAction}
                modal={true}
            />
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white/50 dark:bg-transparent flex-1 relative min-h-[300px]">
        <div className="absolute inset-0 overflow-auto">
            {salesmen.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                    <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-full">
                        <User size={32} className="opacity-50" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{t('pricingRule.salesmen.empty', 'Henüz satışçı eklenmedi')}</p>
                        <p className="text-xs mt-1 text-slate-400">{t('pricingRule.salesmen.emptyDescription', 'Bu kural tüm satışçılar için geçerli olacaktır')}</p>
                    </div>
                </div>
            ) : (
                <Table>
                <TableHeader className="bg-slate-50/80 dark:bg-white/5 sticky top-0 z-10 backdrop-blur-sm">
                    <TableRow className="border-b border-slate-200 dark:border-white/10 hover:bg-transparent">
                    <TableHead className={headStyle}>{t('pricingRule.salesmen.salesman', 'Satışçı Adı')}</TableHead>
                    <TableHead className={`text-right ${headStyle}`}>{t('pricingRule.table.actions', 'İşlemler')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {salesmen.map((salesman) => {
                    const user = users?.find((u) => u.id === salesman.salesmanId);
                    return (
                        <TableRow 
                            key={salesman.id}
                            className="group border-b border-slate-100 dark:border-white/5 transition-colors hover:bg-slate-50/80 dark:hover:bg-white/5"
                        >
                        <TableCell>
                            <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 text-xs">
                                    {user?.fullName?.charAt(0) || <User size={14} />}
                                </div>
                                {user?.fullName || `ID: ${salesman.salesmanId}`}
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                                onClick={() => handleDeleteSalesman(salesman.id)}
                                disabled={isLoadingAction}
                                >
                                {isLoadingAction && selectedSalesmanToDelete?.id === salesman.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 size={14} />
                                )}
                                </Button>
                            </div>
                        </TableCell>
                        </TableRow>
                    );
                    })}
                </TableBody>
                </Table>
            )}
        </div>
      </div>

      {/* Ekleme Onay Dialog */}
      <Dialog open={addConfirmOpen} onOpenChange={setAddConfirmOpen} modal={true}>
        <DialogContent className="sm:max-w-[425px] bg-white/80 dark:bg-[#1a1025]/80 backdrop-blur-xl border-slate-200 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full text-purple-600 dark:text-purple-400">
                    <UserPlus size={20} />
                </div>
                {t('pricingRule.salesmen.addConfirmTitle', 'Satışçı Ekle')}
            </DialogTitle>
            <DialogDescription className="pt-2 text-slate-500 dark:text-slate-400">
              {t('pricingRule.salesmen.addConfirmMessage', '{{name}} satışçısı fiyat kuralına eklenecektir. Onaylıyor musunuz?', {
                name: selectedUser?.fullName || '',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAddConfirmOpen(false);
                setSelectedSalesmanId(null);
              }}
              disabled={isLoadingAction}
              className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10"
            >
              {t('pricingRule.form.cancel', 'İptal')}
            </Button>
            <Button
              type="button"
              onClick={handleAddConfirm}
              disabled={isLoadingAction}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {t('pricingRule.form.confirm', 'Onayla')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Silme Onay Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen} modal={true}>
        <DialogContent className="sm:max-w-[425px] bg-white/80 dark:bg-[#1a1025]/80 backdrop-blur-xl border-slate-200 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full text-red-600 dark:text-red-400">
                    <Trash2 size={20} />
                </div>
                {t('pricingRule.salesmen.deleteConfirmTitle', 'Satışçı Kaldır')}
            </DialogTitle>
            <DialogDescription className="pt-2 text-slate-500 dark:text-slate-400">
              {t('pricingRule.salesmen.deleteConfirmMessage', '{{name}} satışçısı fiyat kuralından kaldırılacaktır. Onaylıyor musunuz?', {
                name: userToDelete?.fullName || '',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setSelectedSalesmanToDelete(null);
              }}
              disabled={isLoadingAction}
              className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10"
            >
              {t('pricingRule.form.cancel', 'İptal')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isLoadingAction}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoadingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('pricingRule.loading', 'Yükleniyor...')}
                </>
              ) : (
                t('pricingRule.form.confirm', 'Onayla')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}