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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PricingRuleLineForm } from './PricingRuleLineForm';
import { ProductSelectDialog, type ProductSelectionResult } from '@/components/shared';
// İkonlar
import { 
  Trash2, 
  Edit2, 
  Package, 
  Loader2, 
  AlertCircle,
  Plus,
  Box,
  Coins
} from 'lucide-react';
import type { PricingRuleLineFormState, PricingRuleHeaderGetDto } from '../types/pricing-rule-types';
import { useExchangeRate } from '@/services/hooks/useExchangeRate';
import type { KurDto } from '@/services/erp-types';
import { useCreatePricingRuleLine } from '../hooks/useCreatePricingRuleLine';
import { useDeletePricingRuleLine } from '../hooks/useDeletePricingRuleLine';

interface PricingRuleLineTableProps {
  lines: PricingRuleLineFormState[];
  setLines: (lines: PricingRuleLineFormState[]) => void;
  header?: PricingRuleHeaderGetDto | null;
}

export function PricingRuleLineTable({
  lines,
  setLines,
  header,
}: PricingRuleLineTableProps): ReactElement {
  const { t, i18n } = useTranslation();
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [addConfirmOpen, setAddConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductSelectionResult | null>(null);
  const [selectedLineToDelete, setSelectedLineToDelete] = useState<{ id: string; dbId?: number } | null>(null);
  const { data: exchangeRates = [] } = useExchangeRate();
  const createMutation = useCreatePricingRuleLine();
  const deleteMutation = useDeletePricingRuleLine();

  const isExistingRecord = !!header?.id;

  // --- Handlers (Mevcut mantık korundu) ---
  const handleProductSelect = (product: ProductSelectionResult): void => {
    if (isExistingRecord) {
      setSelectedProduct(product);
      setAddConfirmOpen(true);
    } else {
      const newLine: PricingRuleLineFormState = {
        id: `temp-${Date.now()}`,
        stokCode: product.code,
        minQuantity: 0,
        maxQuantity: null,
        fixedUnitPrice: null,
        currencyCode: undefined,
        discountRate1: 0,
        discountAmount1: 0,
        discountRate2: 0,
        discountAmount2: 0,
        discountRate3: 0,
        discountAmount3: 0,
        isEditing: true,
      };
      setLines([...lines, newLine]);
      setEditingLineId(newLine.id);
    }
  };

  const handleAddConfirm = (): void => {
    if (!selectedProduct) return;

    const newLine: PricingRuleLineFormState = {
      id: `temp-${Date.now()}`,
      stokCode: selectedProduct.code,
      minQuantity: 0,
      maxQuantity: null,
      fixedUnitPrice: null,
      currencyCode: undefined,
      discountRate1: 0,
      discountAmount1: 0,
      discountRate2: 0,
      discountAmount2: 0,
      discountRate3: 0,
      discountAmount3: 0,
      isEditing: true,
    };
    setLines([...lines, newLine]);
    setEditingLineId(newLine.id);
    setAddConfirmOpen(false);
    setSelectedProduct(null);
  };

  const handleEditLine = (id: string): void => {
    setEditingLineId(id);
    setLines(lines.map((line) => (line.id === id ? { ...line, isEditing: true } : line)));
  };

  const handleSaveLine = async (updatedLine: PricingRuleLineFormState): Promise<void> => {
    if (!updatedLine.stokCode || updatedLine.stokCode.trim() === '') return;

    if (isExistingRecord && header?.id) {
      const isNewLine = updatedLine.id.startsWith('temp-');
      if (isNewLine) {
        try {
          const response = await createMutation.mutateAsync({
            pricingRuleHeaderId: header.id,
            stokCode: updatedLine.stokCode,
            minQuantity: updatedLine.minQuantity ?? 0,
            maxQuantity: updatedLine.maxQuantity ?? null,
            fixedUnitPrice: updatedLine.fixedUnitPrice ?? null,
            currencyCode: typeof updatedLine.currencyCode === 'number' ? String(updatedLine.currencyCode) : (updatedLine.currencyCode ? String(updatedLine.currencyCode) : 'TRY'),
            discountRate1: updatedLine.discountRate1 ?? 0,
            discountAmount1: updatedLine.discountAmount1 ?? 0,
            discountRate2: updatedLine.discountRate2 ?? 0,
            discountAmount2: updatedLine.discountAmount2 ?? 0,
            discountRate3: updatedLine.discountRate3 ?? 0,
            discountAmount3: updatedLine.discountAmount3 ?? 0,
          });

          if (response) {
            const savedLine: PricingRuleLineFormState = {
              id: `existing-${response.id}`,
              stokCode: response.stokCode,
              minQuantity: response.minQuantity,
              maxQuantity: response.maxQuantity,
              fixedUnitPrice: response.fixedUnitPrice,
              currencyCode: typeof response.currencyCode === 'string' ? Number(response.currencyCode) || 1 : response.currencyCode,
              discountRate1: response.discountRate1,
              discountAmount1: response.discountAmount1,
              discountRate2: response.discountRate2,
              discountAmount2: response.discountAmount2,
              discountRate3: response.discountRate3,
              discountAmount3: response.discountAmount3,
              isEditing: false,
            };
            setLines(lines.map((line) => (line.id === updatedLine.id ? savedLine : line)));
            setEditingLineId(null);
            toast.success(t('pricingRule.lines.addSuccess', 'Satır Eklendi'), { description: t('pricingRule.lines.addSuccessMessage', 'Satır fiyat kuralına başarıyla eklendi') });
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : t('pricingRule.lines.addError', 'Satır eklenirken bir hata oluştu');
          toast.error(t('pricingRule.lines.addError', 'Hata'), { description: errorMessage });
        }
      } else {
        setLines(lines.map((line) => (line.id === updatedLine.id ? { ...updatedLine, isEditing: false } : line)));
        setEditingLineId(null);
      }
    } else {
      setLines(lines.map((line) => (line.id === updatedLine.id ? { ...updatedLine, isEditing: false } : line)));
      setEditingLineId(null);
    }
  };

  const handleDeleteLine = (id: string): void => {
    const line = lines.find((l) => l.id === id);
    if (!line) return;

    if (isExistingRecord) {
      const lineIdMatch = id.match(/^existing-(\d+)$/);
      if (lineIdMatch) {
        const dbId = parseInt(lineIdMatch[1], 10);
        setSelectedLineToDelete({ id, dbId });
        setDeleteConfirmOpen(true);
      } else {
        setLines(lines.filter((l) => l.id !== id));
      }
    } else {
      setLines(lines.filter((l) => l.id !== id));
    }
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!selectedLineToDelete?.dbId) {
      if (selectedLineToDelete) setLines(lines.filter((line) => line.id !== selectedLineToDelete.id));
      setDeleteConfirmOpen(false);
      setSelectedLineToDelete(null);
      return;
    }

    try {
      await deleteMutation.mutateAsync(selectedLineToDelete.dbId);
      setLines(lines.filter((line) => line.id !== selectedLineToDelete.id));
      setDeleteConfirmOpen(false);
      setSelectedLineToDelete(null);
      toast.success(t('pricingRule.lines.deleteSuccess', 'Satır Kaldırıldı'), { description: t('pricingRule.lines.deleteSuccessMessage', 'Satır fiyat kuralından başarıyla kaldırıldı') });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('pricingRule.lines.deleteError', 'Satır kaldırılırken bir hata oluştu');
      toast.error(t('pricingRule.lines.deleteError', 'Hata'), { description: errorMessage });
    }
  };

  // --- Helperlar ---
  const formatCurrency = (amount: number | null | undefined, currencyCode: number | string | undefined): string => {
    if (amount === null || amount === undefined) return '-';
    if (!currencyCode) return '-';
    const numericCode = typeof currencyCode === 'string' ? Number(currencyCode) : currencyCode;
    const currencyOption = exchangeRates.find((rate: KurDto) => rate.dovizTipi === numericCode);
    const displayName = currencyOption?.dovizIsmi || `Döviz ${numericCode}`;
    try {
      const isoCode = numericCode === 1 ? 'TRY' : numericCode === 2 ? 'USD' : numericCode === 3 ? 'EUR' : 'TRY';
      return new Intl.NumberFormat(i18n.language, { style: 'currency', currency: isoCode, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    } catch {
      return new Intl.NumberFormat(i18n.language, { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount) + ' ' + displayName;
    }
  };

  const getCurrencyDisplayName = (currencyCode: number | string | undefined): string => {
    if (!currencyCode) return '-';
    const numericCode = typeof currencyCode === 'string' ? Number(currencyCode) : currencyCode;
    const currencyOption = exchangeRates.find((rate: KurDto) => rate.dovizTipi === numericCode);
    return currencyOption ? (currencyOption.dovizIsmi ? `${currencyOption.dovizIsmi}(${currencyOption.dovizTipi})` : `Döviz(${currencyOption.dovizTipi})`) : `Döviz(${numericCode})`;
  };

  const isLoadingAction = createMutation.isPending || deleteMutation.isPending;
  const lineToDelete = selectedLineToDelete ? lines.find((l) => l.id === selectedLineToDelete.id) : null;

  // --- Ortak Stiller ---
  const headStyle = "cursor-pointer select-none text-slate-500 dark:text-slate-400 font-semibold py-3 text-xs uppercase tracking-wider";

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <div className="bg-blue-50 dark:bg-blue-500/20 p-1.5 rounded-lg text-blue-600 dark:text-blue-400">
            <Package size={18} />
          </div>
          {t('pricingRule.lines.title', 'Fiyat Kuralı Satırları')}
        </h3>
        <Button
          type="button"
          onClick={() => setProductDialogOpen(true)}
          size="sm"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95"
          disabled={isLoadingAction}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('pricingRule.lines.selectStock', 'Stok Ekle')}
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white/50 dark:bg-transparent flex-1 relative">
        <div className="absolute inset-0 overflow-auto">
            <Table>
            <TableHeader className="bg-slate-50/80 dark:bg-white/5 sticky top-0 z-10 backdrop-blur-sm">
                <TableRow className="border-b border-slate-200 dark:border-white/10 hover:bg-transparent">
                <TableHead className={headStyle}>{t('pricingRule.lines.stokCode', 'Stok Kodu')}</TableHead>
                <TableHead className={`${headStyle} text-right`}>{t('pricingRule.lines.minQuantity', 'Min Miktar')}</TableHead>
                <TableHead className={`${headStyle} text-right`}>{t('pricingRule.lines.maxQuantity', 'Max Miktar')}</TableHead>
                <TableHead className={`${headStyle} text-right`}>{t('pricingRule.lines.fixedUnitPrice', 'Sabit Fiyat')}</TableHead>
                <TableHead className={headStyle}>{t('pricingRule.lines.currencyCode', 'Para Birimi')}</TableHead>
                <TableHead className={`${headStyle} text-right`}>{t('pricingRule.lines.discount1', 'İnd. 1 %')}</TableHead>
                <TableHead className={`${headStyle} text-right`}>{t('pricingRule.lines.discount2', 'İnd. 2 %')}</TableHead>
                <TableHead className={`${headStyle} text-right`}>{t('pricingRule.lines.discount3', 'İnd. 3 %')}</TableHead>
                <TableHead className={`${headStyle} text-right`}>{t('pricingRule.table.actions', 'İşlemler')}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {lines.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={9} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                            <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-full">
                                <Package size={32} className="opacity-50" />
                            </div>
                            <p className="text-sm font-medium">{t('pricingRule.lines.empty', 'Henüz satır eklenmedi')}</p>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setProductDialogOpen(true)}
                                className="mt-2 border-dashed border-slate-300 dark:border-white/20 hover:border-blue-500 hover:text-blue-500"
                            >
                                <Plus size={14} className="mr-2" />
                                {t('pricingRule.lines.addFirst', 'İlk Satırı Ekle')}
                            </Button>
                        </div>
                    </TableCell>
                </TableRow>
                ) : (
                lines.map((line, index) => (
                    <TableRow 
                        key={line.id} 
                        className={`group border-b border-slate-100 dark:border-white/5 transition-colors ${editingLineId === line.id ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-slate-50/80 dark:hover:bg-white/5'}`}
                    >
                    {editingLineId === line.id ? (
                        <TableCell colSpan={9} className="p-2">
                        <PricingRuleLineForm
                            line={line}
                            onSave={handleSaveLine}
                            onCancel={() => {
                            setEditingLineId(null);
                            if (!line.stokCode || line.stokCode.trim() === '') {
                                setLines(lines.filter((l) => l.id !== line.id));
                            } else {
                                setLines(lines.map((l) => (l.id === line.id ? { ...l, isEditing: false } : l)));
                            }
                            }}
                        />
                        </TableCell>
                    ) : (
                        <>
                        <TableCell>
                            <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                                <Box size={14} className="text-slate-400" />
                                {line.stokCode || <span className="text-red-500 text-xs italic">{t('pricingRule.lines.stokCodeRequired', 'Stok kodu zorunludur')}</span>}
                            </div>
                        </TableCell>
                        <TableCell className="text-right text-slate-600 dark:text-slate-400">{line.minQuantity ?? 0}</TableCell>
                        <TableCell className="text-right text-slate-600 dark:text-slate-400">{line.maxQuantity ?? '-'}</TableCell>
                        <TableCell className="text-right font-medium text-slate-900 dark:text-white">
                            {formatCurrency(line.fixedUnitPrice, line.currencyCode)}
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Coins size={12} />
                                {getCurrencyDisplayName(line.currencyCode)}
                            </div>
                        </TableCell>
                        <TableCell className="text-right text-slate-600 dark:text-slate-400">
                            {line.discountRate1 > 0 ? <span className="text-green-600 dark:text-green-400 font-medium">{line.discountRate1}%</span> : '-'}
                        </TableCell>
                        <TableCell className="text-right text-slate-600 dark:text-slate-400">
                            {line.discountRate2 > 0 ? <span className="text-green-600 dark:text-green-400 font-medium">{line.discountRate2}%</span> : '-'}
                        </TableCell>
                        <TableCell className="text-right text-slate-600 dark:text-slate-400">
                            {line.discountRate3 > 0 ? <span className="text-green-600 dark:text-green-400 font-medium">{line.discountRate3}%</span> : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                                onClick={() => handleEditLine(line.id)}
                            >
                                <Edit2 size={14} />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                                onClick={() => handleDeleteLine(line.id)}
                                disabled={isLoadingAction}
                            >
                                {isLoadingAction && selectedLineToDelete?.id === line.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                <Trash2 size={14} />
                                )}
                            </Button>
                            </div>
                        </TableCell>
                        </>
                    )}
                    </TableRow>
                ))
                )}
            </TableBody>
            </Table>
        </div>
      </div>

      <ProductSelectDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        onSelect={handleProductSelect}
        disableRelatedStocks={true}
      />

      {/* Ekleme Onay Dialog */}
      <Dialog open={addConfirmOpen} onOpenChange={setAddConfirmOpen} modal={true}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#130822] border-slate-100 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400">
                    <AlertCircle size={20} />
                </div>
                {t('pricingRule.lines.addConfirmTitle', 'Satır Ekle')}
            </DialogTitle>
            <DialogDescription className="pt-2 text-slate-500 dark:text-slate-400">
              {t('pricingRule.lines.addConfirmMessage', '{{code}} stok kodu fiyat kuralına eklenecektir. Onaylıyor musunuz?', {
                code: selectedProduct?.code || '',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAddConfirmOpen(false);
                setSelectedProduct(null);
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
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {t('pricingRule.form.confirm', 'Onayla')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Silme Onay Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen} modal={true}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#130822] border-slate-100 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full text-red-600 dark:text-red-400">
                    <Trash2 size={20} />
                </div>
                {t('pricingRule.lines.deleteConfirmTitle', 'Satır Kaldır')}
            </DialogTitle>
            <DialogDescription className="pt-2 text-slate-500 dark:text-slate-400">
              {t('pricingRule.lines.deleteConfirmMessage', '{{code}} stok kodlu satır fiyat kuralından kaldırılacaktır. Onaylıyor musunuz?', {
                code: lineToDelete?.stokCode || '',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setSelectedLineToDelete(null);
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