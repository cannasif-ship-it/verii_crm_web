import React, { type ReactElement, useState, useMemo } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { QuotationLineForm } from './QuotationLineForm';
import { ProductSelectDialog, type ProductSelectionResult } from '@/components/shared/ProductSelectDialog';
import { useCurrencyOptions } from '@/services/hooks/useCurrencyOptions';
import { useProductSelection } from '../hooks/useProductSelection';
import { useQuotationCalculations } from '../hooks/useQuotationCalculations';
import { formatCurrency } from '../utils/format-currency';
import { Trash2, Edit, Plus, ShoppingCart } from 'lucide-react';
import type { QuotationLineFormState, QuotationExchangeRateFormState, PricingRuleLineGetDto, UserDiscountLimitDto } from '../types/quotation-types';

interface QuotationLineTableProps {
  lines: QuotationLineFormState[];
  setLines: (lines: QuotationLineFormState[]) => void;
  currency: number;
  exchangeRates?: QuotationExchangeRateFormState[];
  pricingRules?: PricingRuleLineGetDto[];
  userDiscountLimits?: UserDiscountLimitDto[];
}

export function QuotationLineTable({
  lines,
  setLines,
  currency,
  exchangeRates = [],
  pricingRules = [],
  userDiscountLimits = [],
}: QuotationLineTableProps): ReactElement {
  const { t } = useTranslation();
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lineToDelete, setLineToDelete] = useState<string | null>(null);
  const [relatedLinesCount, setRelatedLinesCount] = useState(0);
  const [addLineDialogOpen, setAddLineDialogOpen] = useState(false);
  const [newLine, setNewLine] = useState<QuotationLineFormState | null>(null);
  const [editLineDialogOpen, setEditLineDialogOpen] = useState(false);
  const [lineToEdit, setLineToEdit] = useState<QuotationLineFormState | null>(null);
  const { currencyOptions } = useCurrencyOptions();
  const { calculateLineTotals } = useQuotationCalculations();
  const { handleProductSelect: handleProductSelectHook, handleProductSelectWithRelatedStocks } = useProductSelection({
    currency,
    exchangeRates,
  });

  const currencyCode = useMemo(() => {
    const found = currencyOptions.find((opt) => opt.dovizTipi === currency);
    return found?.code || 'TRY';
  }, [currency, currencyOptions]);

  const handleAddLine = (): void => {
    const line: QuotationLineFormState = {
      id: `temp-${Date.now()}`,
      productId: null,
      productCode: '',
      productName: '',
      quantity: 1,
      unitPrice: 0,
      discountRate1: 0,
      discountAmount1: 0,
      discountRate2: 0,
      discountAmount2: 0,
      discountRate3: 0,
      discountAmount3: 0,
      vatRate: 18,
      vatAmount: 0,
      lineTotal: 0,
      lineGrandTotal: 0,
      description: null,
      isEditing: true,
    };
    setNewLine(line);
    setAddLineDialogOpen(true);
  };

  const handleSaveNewLine = (line: QuotationLineFormState): void => {
    setLines([...lines, { ...line, isEditing: false }]);
    setAddLineDialogOpen(false);
    setNewLine(null);
  };

  const handleSaveMultipleLines = (newLines: QuotationLineFormState[]): void => {
    setLines([...lines, ...newLines.map((line) => ({ ...line, isEditing: false }))]);
    setAddLineDialogOpen(false);
    setNewLine(null);
  };

  const handleCancelNewLine = (): void => {
    setAddLineDialogOpen(false);
    setNewLine(null);
  };

  const handleProductSelect = async (product: ProductSelectionResult): Promise<void> => {
    const hasRelatedStocks = product.relatedStockIds && product.relatedStockIds.length > 0;

    if (hasRelatedStocks && handleProductSelectWithRelatedStocks) {
      const newLines = await handleProductSelectWithRelatedStocks(product, product.relatedStockIds);

      const firstLine = newLines[0];
      if (firstLine) {
        setNewLine({ ...firstLine, relatedLines: newLines.slice(1) });
        setAddLineDialogOpen(true);
      }
    } else {
      const newLine = await handleProductSelectHook(product);
      setNewLine(newLine);
      setAddLineDialogOpen(true);
    }
  };

  const handleEditLine = (id: string): void => {
    const line = lines.find((l) => l.id === id);
    if (!line) {
      return;
    }

    const isRelatedStock = line.relatedStockId !== null;
    if (isRelatedStock) {
      const sameGroupLines = lines.filter((l) => l.relatedStockId === line.relatedStockId);
      const mainLine = sameGroupLines[0];
      const isMainLine = mainLine.id === line.id;
      
      if (!isMainLine) {
        return;
      }
      
      const relatedLines = sameGroupLines.slice(1);
      setLineToEdit({ ...line, relatedLines: relatedLines.length > 0 ? relatedLines : undefined });
    } else {
      setLineToEdit({ ...line, relatedLines: undefined });
    }
    
    setEditLineDialogOpen(true);
  };

  const handleSaveLine = (updatedLine: QuotationLineFormState, relatedLinesToUpdate?: QuotationLineFormState[]): void => {
    const originalLine = lines.find((l) => l.id === updatedLine.id);
    
    if (!originalLine) {
      setEditLineDialogOpen(false);
      setLineToEdit(null);
      return;
    }

    const isQuantityChanged = originalLine.quantity !== updatedLine.quantity;
    const sameGroupLines = updatedLine.relatedStockId 
      ? lines.filter((l) => l.relatedStockId === updatedLine.relatedStockId)
      : [];
    const isMainLine = sameGroupLines.length > 0 && sameGroupLines[0].id === updatedLine.id;

    if (relatedLinesToUpdate && relatedLinesToUpdate.length > 0) {
      const allUpdatedLines = [updatedLine, ...relatedLinesToUpdate].map((line) => ({ ...line, isEditing: false }));
      setLines(
        lines.map((line) => {
          const updated = allUpdatedLines.find((ul) => ul.id === line.id);
          if (updated) {
            return updated;
          }
          if (isQuantityChanged && isMainLine && updatedLine.relatedStockId && line.relatedStockId === updatedLine.relatedStockId) {
            const quantityRatio = updatedLine.quantity / originalLine.quantity;
            const newQuantity = line.quantity * quantityRatio;
            const updatedRelatedLine = { ...line, quantity: newQuantity };
            return calculateLineTotals(updatedRelatedLine);
          }
          return line;
        })
      );
    } else if (isQuantityChanged && isMainLine && updatedLine.relatedStockId) {
      const quantityRatio = updatedLine.quantity / originalLine.quantity;
      
      const updatedLines = lines.map((line) => {
        if (line.id === updatedLine.id) {
          return { ...updatedLine, isEditing: false };
        }
        
        if (line.relatedStockId === updatedLine.relatedStockId && line.id !== updatedLine.id) {
          const newQuantity = line.quantity * quantityRatio;
          const updatedRelatedLine = { ...line, quantity: newQuantity };
          return calculateLineTotals(updatedRelatedLine);
        }
        
        return line;
      });
      
      setLines(updatedLines);
    } else {
      setLines(
        lines.map((line) =>
          line.id === updatedLine.id ? { ...updatedLine, isEditing: false } : line
        )
      );
    }
    
    setEditLineDialogOpen(false);
    setLineToEdit(null);
  };

  const handleCancelEditLine = (): void => {
    setEditLineDialogOpen(false);
    setLineToEdit(null);
  };

  const handleDeleteClick = (id: string): void => {
    const line = lines.find((l) => l.id === id);
    setLineToDelete(id);
    
    if (line?.relatedStockId) {
      const count = lines.filter((l) => l.relatedStockId === line.relatedStockId).length;
      setRelatedLinesCount(count);
    } else {
      setRelatedLinesCount(0);
    }
    
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = (): void => {
    if (lineToDelete) {
      const lineToDeleteObj = lines.find((line) => line.id === lineToDelete);
      
      if (lineToDeleteObj?.relatedStockId) {
        const relatedStockId = lineToDeleteObj.relatedStockId;
        const linesToDelete = lines.filter(
          (line) => line.relatedStockId === relatedStockId
        );
        
        setLines(lines.filter((line) => line.relatedStockId !== relatedStockId));
        setLineToDelete(null);
        setDeleteDialogOpen(false);
        
      } else {
        setLines(lines.filter((line) => line.id !== lineToDelete));
        setLineToDelete(null);
        setDeleteDialogOpen(false);
      }
    }
  };

  const handleDeleteCancel = (): void => {
    setLineToDelete(null);
    setRelatedLinesCount(0);
    setDeleteDialogOpen(false);
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {t('quotation.lines.title', 'Teklif Satırları')}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {lines.length} {t('quotation.lines.itemCount', 'satır')}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                type="button" 
                onClick={handleAddLine} 
                size="default" 
                variant="outline"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {t('quotation.lines.add', 'Satır Ekle')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="p-4 rounded-full bg-muted mb-4">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-muted-foreground mb-2">
                {t('quotation.lines.empty', 'Henüz satır eklenmedi')}
              </p>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                {t('quotation.lines.emptyDescription', 'Teklif satırları eklemek için "Stok Seç" veya "Satır Ekle" butonunu kullanın')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold min-w-[200px]">
                      {t('quotation.lines.stock', 'Stok')}
                    </TableHead>
                    <TableHead className="text-right font-semibold min-w-[120px]">
                      {t('quotation.lines.unitPrice', 'Birim Fiyat')}
                    </TableHead>
                    <TableHead className="text-right font-semibold min-w-[100px]">
                      {t('quotation.lines.quantity', 'Miktar')}
                    </TableHead>
                    <TableHead className="text-right font-semibold min-w-[100px]">
                      {t('quotation.lines.discount1', 'İnd. 1 %')}
                    </TableHead>
                    <TableHead className="text-right font-semibold min-w-[100px]">
                      {t('quotation.lines.discount2', 'İnd. 2 %')}
                    </TableHead>
                    <TableHead className="text-right font-semibold min-w-[100px]">
                      {t('quotation.lines.discount3', 'İnd. 3 %')}
                    </TableHead>
                    <TableHead className="text-right font-semibold min-w-[130px]">
                      {t('quotation.lines.discountAmount', 'İndirim')}
                    </TableHead>
                    <TableHead className="text-right font-semibold min-w-[130px]">
                      {t('quotation.lines.netPrice', 'Net Fiyat')}
                    </TableHead>
                    <TableHead className="text-center font-semibold min-w-[100px]">
                      {t('common.actions', 'İşlemler')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.map((line) => {
                    const totalDiscountAmount = (line.discountAmount1 || 0) + (line.discountAmount2 || 0) + (line.discountAmount3 || 0);
                    const stockDisplay = line.productCode && line.productName 
                      ? `${line.productCode} - ${line.productName}`
                      : line.productCode || line.productName || '-';
                    const hasDiscount = totalDiscountAmount > 0;
                    
                    const isRelatedStock = line.relatedStockId !== null;
                    let mainStock: QuotationLineFormState | null = null;
                    let isMainStock = false;
                    if (isRelatedStock) {
                      const sameGroupLines = lines.filter((l) => l.relatedStockId === line.relatedStockId);
                      if (sameGroupLines.length > 1) {
                        mainStock = sameGroupLines[0];
                        isMainStock = mainStock.id === line.id;
                      }
                    }

                    const hasApprovalWarning = line.approvalStatus === 1;

                    return (
                      <TableRow key={line.id} className={`hover:bg-muted/50 transition-colors ${hasApprovalWarning ? 'bg-red-50/50 dark:bg-red-950/20 border-l-4 border-l-red-500' : ''}`}>
                            <TableCell className="min-w-[200px]">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <div className="font-medium text-sm truncate flex-1" title={stockDisplay}>
                                    {line.productCode || '-'}
                                  </div>
                                  {hasApprovalWarning && (
                                    <Badge variant="outline" className="text-xs text-red-600 border-red-600 bg-red-50 dark:bg-red-950/30">
                                      {t('quotation.lines.approvalRequired', 'Onay Gerekli')}
                                    </Badge>
                                  )}
                                  {isRelatedStock && (
                                    <Badge variant="outline" className={`text-xs ${
                                      isMainStock 
                                        ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800'
                                        : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                    }`}>
                                      {isMainStock 
                                        ? `${t('quotation.lines.mainStock', 'Ana Stok')} (ID: ${line.relatedStockId})`
                                        : `${t('quotation.lines.relatedStock', 'Bağlı Stok')} (ID: ${line.relatedStockId})`}
                                    </Badge>
                                  )}
                                </div>
                                {line.productName && (
                                  <div className="text-xs text-muted-foreground truncate" title={line.productName}>
                                    {line.productName}
                                  </div>
                                )}
                                {isRelatedStock && !isMainStock && mainStock && (
                                  <div className="text-xs text-muted-foreground">
                                    {t('quotation.lines.relatedTo', 'Bağlı')}: {mainStock.productCode || mainStock.productName || '-'}
                                  </div>
                                )}
                                {isRelatedStock && isMainStock && (
                                  <div className="text-xs text-muted-foreground">
                                    {t('quotation.lines.hasRelatedStocks', '{count} bağlı stok', { count: lines.filter((l) => l.relatedStockId === line.relatedStockId && l.id !== line.id).length })}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="font-medium">
                                {formatCurrency(line.unitPrice, currencyCode)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline" className="font-medium">
                                {line.quantity}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {line.discountRate1 > 0 ? (
                                <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                                  {line.discountRate1}%
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {line.discountRate2 > 0 ? (
                                <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                                  {line.discountRate2}%
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {line.discountRate3 > 0 ? (
                                <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                                  {line.discountRate3}%
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {hasDiscount ? (
                                <span className="font-medium text-red-600 dark:text-red-400">
                                  -{formatCurrency(totalDiscountAmount, currencyCode)}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="font-semibold text-green-600 dark:text-green-400 text-base">
                                {formatCurrency(line.lineTotal, currencyCode)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1 justify-center">
                                {isMainStock || !isRelatedStock ? (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditLine(line.id)}
                                    className="h-8 w-8 p-0"
                                    title={t('common.edit', 'Düzenle')}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled
                                    className="h-8 w-8 p-0 opacity-50 cursor-not-allowed"
                                    title={t('quotation.lines.cannotEditRelatedStock', 'Bağlı stok düzenlenemez')}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(line.id)}
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  title={t('common.delete', 'Sil')}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ProductSelectDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        onSelect={handleProductSelect}
      />

      <Dialog open={addLineDialogOpen} onOpenChange={setAddLineDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('quotation.lines.addLine', 'Yeni Satır Ekle')}
            </DialogTitle>
            <DialogDescription>
              {t('quotation.lines.addLineDescription', 'Teklif satırı bilgilerini giriniz')}
            </DialogDescription>
          </DialogHeader>
          {newLine && (
            <QuotationLineForm
              line={newLine}
              onSave={handleSaveNewLine}
              onSaveMultiple={handleSaveMultipleLines}
              onCancel={handleCancelNewLine}
              currency={currency}
              exchangeRates={exchangeRates}
              pricingRules={pricingRules}
              userDiscountLimits={userDiscountLimits}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {relatedLinesCount > 1
                ? t('quotation.lines.delete.confirmTitleMultiple', 'Bağlı Stokları Sil')
                : t('quotation.lines.delete.confirmTitle', 'Satırı Sil')}
            </DialogTitle>
            {relatedLinesCount > 1 ? (
              <div className="space-y-2 mt-2">
                <DialogDescription>
                  {t('quotation.lines.delete.confirmMessageMultiple', 'Bu satır bir bağlı stok satırıdır. Silindiğinde aynı bağlı stok grubuna ait tüm satırlar ({count} adet) silinecektir.', {
                    count: relatedLinesCount,
                  })}
                </DialogDescription>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  {t('quotation.lines.delete.confirmWarning', 'Devam etmek istediğinizden emin misiniz?')}
                </p>
              </div>
            ) : (
              <DialogDescription>
                {t('quotation.lines.delete.confirmMessage', 'Bu satırı silmek istediğinizden emin misiniz?')}
              </DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
            >
              {t('common.cancel', 'İptal')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              {relatedLinesCount > 1
                ? t('common.deleteAll', 'Tümünü Sil')
                : t('common.delete', 'Sil')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editLineDialogOpen} onOpenChange={setEditLineDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('quotation.lines.editLine', 'Satırı Düzenle')}
            </DialogTitle>
            <DialogDescription>
              {t('quotation.lines.editLineDescription', 'Teklif satırı bilgilerini düzenleyiniz')}
            </DialogDescription>
          </DialogHeader>
          {lineToEdit && (
            <QuotationLineForm
              line={lineToEdit}
              onSave={(line) => handleSaveLine(line)}
              onSaveMultiple={(lines) => {
                if (lines.length > 0) {
                  handleSaveLine(lines[0], lines.slice(1));
                }
              }}
              onCancel={handleCancelEditLine}
              currency={currency}
              exchangeRates={exchangeRates}
              pricingRules={pricingRules}
              userDiscountLimits={userDiscountLimits}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
