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
import { Trash2, Edit, Package, Loader2 } from 'lucide-react';
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
    if (!selectedProduct) {
      return;
    }

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
    if (!updatedLine.stokCode || updatedLine.stokCode.trim() === '') {
      return;
    }

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
            toast.success(
              t('pricingRule.lines.addSuccess', 'Satır Eklendi'),
              {
                description: t('pricingRule.lines.addSuccessMessage', 'Satır fiyat kuralına başarıyla eklendi'),
              }
            );
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : t('pricingRule.lines.addError', 'Satır eklenirken bir hata oluştu');
          toast.error(
            t('pricingRule.lines.addError', 'Hata'),
            {
              description: errorMessage,
            }
          );
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
    if (!line) {
      return;
    }

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
      if (selectedLineToDelete) {
        setLines(lines.filter((line) => line.id !== selectedLineToDelete.id));
      }
      setDeleteConfirmOpen(false);
      setSelectedLineToDelete(null);
      return;
    }

    try {
      await deleteMutation.mutateAsync(selectedLineToDelete.dbId);
      setLines(lines.filter((line) => line.id !== selectedLineToDelete.id));
      setDeleteConfirmOpen(false);
      setSelectedLineToDelete(null);
      toast.success(
        t('pricingRule.lines.deleteSuccess', 'Satır Kaldırıldı'),
        {
          description: t('pricingRule.lines.deleteSuccessMessage', 'Satır fiyat kuralından başarıyla kaldırıldı'),
        }
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('pricingRule.lines.deleteError', 'Satır kaldırılırken bir hata oluştu');
      toast.error(
        t('pricingRule.lines.deleteError', 'Hata'),
        {
          description: errorMessage,
        }
      );
    }
  };

  const formatCurrency = (amount: number | null | undefined, currencyCode: number | string | undefined): string => {
    if (amount === null || amount === undefined) return '-';
    if (!currencyCode) return '-';
    
    const numericCode = typeof currencyCode === 'string' ? Number(currencyCode) : currencyCode;
    const currencyOption = exchangeRates.find((rate: KurDto) => rate.dovizTipi === numericCode);
    const displayName = currencyOption?.dovizIsmi || `Döviz ${numericCode}`;
    
    try {
      const isoCode = numericCode === 1 ? 'TRY' : numericCode === 2 ? 'USD' : numericCode === 3 ? 'EUR' : 'TRY';
      return new Intl.NumberFormat(i18n.language, {
        style: 'currency',
        currency: isoCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return new Intl.NumberFormat(i18n.language, {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount) + ' ' + displayName;
    }
  };

  const getCurrencyDisplayName = (currencyCode: number | string | undefined): string => {
    if (!currencyCode) return '-';
    const numericCode = typeof currencyCode === 'string' ? Number(currencyCode) : currencyCode;
    const currencyOption = exchangeRates.find((rate: KurDto) => rate.dovizTipi === numericCode);
    if (currencyOption) {
      return currencyOption.dovizIsmi ? `${currencyOption.dovizIsmi}(${currencyOption.dovizTipi})` : `Döviz(${currencyOption.dovizTipi})`;
    }
    return `Döviz(${numericCode})`;
  };

  const isLoadingAction = createMutation.isPending || deleteMutation.isPending;
  const lineToDelete = selectedLineToDelete ? lines.find((l) => l.id === selectedLineToDelete.id) : null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {t('pricingRule.lines.title', 'Fiyat Kuralı Satırları')}
        </h3>
        <Button
          type="button"
          onClick={() => setProductDialogOpen(true)}
          size="sm"
          variant="default"
          disabled={isLoadingAction}
        >
          <Package className="h-4 w-4 mr-2" />
          {t('pricingRule.lines.selectStock', 'Stok Seç')}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('pricingRule.lines.stokCode', 'Stok Kodu')}</TableHead>
              <TableHead className="text-right">
                {t('pricingRule.lines.minQuantity', 'Min Miktar')}
              </TableHead>
              <TableHead className="text-right">
                {t('pricingRule.lines.maxQuantity', 'Max Miktar')}
              </TableHead>
              <TableHead className="text-right">
                {t('pricingRule.lines.fixedUnitPrice', 'Sabit Fiyat')}
              </TableHead>
              <TableHead>{t('pricingRule.lines.currencyCode', 'Para Birimi')}</TableHead>
              <TableHead className="text-right">
                {t('pricingRule.lines.discount1', 'İndirim 1 %')}
              </TableHead>
              <TableHead className="text-right">
                {t('pricingRule.lines.discount2', 'İndirim 2 %')}
              </TableHead>
              <TableHead className="text-right">
                {t('pricingRule.lines.discount3', 'İndirim 3 %')}
              </TableHead>
              <TableHead>{t('pricingRule.table.actions', 'İşlemler')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  {t('pricingRule.lines.empty', 'Henüz satır eklenmedi')}
                </TableCell>
              </TableRow>
            ) : (
              lines.map((line) => (
                <TableRow key={line.id}>
                  {editingLineId === line.id ? (
                    <TableCell colSpan={9}>
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
                        {line.stokCode || (
                          <span className="text-muted-foreground italic">
                            {t('pricingRule.lines.stokCodeRequired', 'Stok kodu zorunludur')}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{line.minQuantity ?? 0}</TableCell>
                      <TableCell className="text-right">
                        {line.maxQuantity ?? '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(line.fixedUnitPrice, line.currencyCode)}
                      </TableCell>
                      <TableCell>
                        {getCurrencyDisplayName(line.currencyCode)}
                      </TableCell>
                      <TableCell className="text-right">
                        {line.discountRate1 > 0 ? `${line.discountRate1}%` : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {line.discountRate2 > 0 ? `${line.discountRate2}%` : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {line.discountRate3 > 0 ? `${line.discountRate3}%` : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditLine(line.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLine(line.id)}
                            disabled={isLoadingAction}
                          >
                            {isLoadingAction && selectedLineToDelete?.id === line.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
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

      <ProductSelectDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        onSelect={handleProductSelect}
        disableRelatedStocks={true}
      />

      <Dialog open={addConfirmOpen} onOpenChange={setAddConfirmOpen} modal={true}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {t('pricingRule.lines.addConfirmTitle', 'Satır Ekle')}
            </DialogTitle>
            <DialogDescription>
              {t('pricingRule.lines.addConfirmMessage', '{{code}} stok kodu fiyat kuralına eklenecektir. Onaylıyor musunuz?', {
                code: selectedProduct?.code || '',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAddConfirmOpen(false);
                setSelectedProduct(null);
              }}
              disabled={isLoadingAction}
            >
              {t('pricingRule.form.cancel', 'İptal')}
            </Button>
            <Button
              type="button"
              onClick={handleAddConfirm}
              disabled={isLoadingAction}
            >
              {t('pricingRule.form.confirm', 'Onayla')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen} modal={true}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {t('pricingRule.lines.deleteConfirmTitle', 'Satır Kaldır')}
            </DialogTitle>
            <DialogDescription>
              {t('pricingRule.lines.deleteConfirmMessage', '{{code}} stok kodlu satır fiyat kuralından kaldırılacaktır. Onaylıyor musunuz?', {
                code: lineToDelete?.stokCode || '',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setSelectedLineToDelete(null);
              }}
              disabled={isLoadingAction}
            >
              {t('pricingRule.form.cancel', 'İptal')}
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
