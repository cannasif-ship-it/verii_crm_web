import { type ReactElement, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuotationCalculations } from '../hooks/useQuotationCalculations';
import { useCurrencyOptions } from '@/services/hooks/useCurrencyOptions';
import { ProductSelectDialog, type ProductSelectionResult } from '@/components/shared/ProductSelectDialog';
import { useProductSelection } from '../hooks/useProductSelection';
import { formatCurrency } from '../utils/format-currency';
import type { QuotationLineFormState, QuotationExchangeRateFormState } from '../types/quotation-types';
import { X, Check, Package, Calculator, Percent, DollarSign } from 'lucide-react';

interface QuotationLineFormProps {
  line: QuotationLineFormState;
  onSave: (line: QuotationLineFormState) => void;
  onCancel: () => void;
  currency: number;
  exchangeRates?: QuotationExchangeRateFormState[];
  onSaveMultiple?: (lines: QuotationLineFormState[]) => void;
}

export function QuotationLineForm({
  line,
  onSave,
  onCancel,
  currency,
  exchangeRates = [],
  onSaveMultiple,
}: QuotationLineFormProps): ReactElement {
  const { t } = useTranslation();
  const { calculateLineTotals } = useQuotationCalculations();
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const { currencyOptions } = useCurrencyOptions();
  const { handleProductSelect: handleProductSelectHook, handleProductSelectWithRelatedStocks } = useProductSelection({
    currency,
    exchangeRates,
  });

  const currencyCode = useMemo(() => {
    const found = currencyOptions.find((opt) => opt.dovizTipi === currency);
    return found?.code || 'TRY';
  }, [currency, currencyOptions]);

  const [formData, setFormData] = useState<QuotationLineFormState>(line);
  const [relatedLines, setRelatedLines] = useState<QuotationLineFormState[]>([]);

  useEffect(() => {
    setFormData(line);
    if ((line as QuotationLineFormState & { relatedLines?: QuotationLineFormState[] }).relatedLines) {
      setRelatedLines((line as QuotationLineFormState & { relatedLines?: QuotationLineFormState[] }).relatedLines || []);
    } else {
      setRelatedLines([]);
    }
  }, [line]);

  const handleProductSelect = async (product: ProductSelectionResult): Promise<void> => {
    const hasRelatedStocks = product.relatedStockIds && product.relatedStockIds.length > 0;

    if (hasRelatedStocks && handleProductSelectWithRelatedStocks) {
      const allLines = await handleProductSelectWithRelatedStocks(product, product.relatedStockIds);

      if (allLines.length > 0) {
        const mainLine = {
          ...allLines[0],
          id: formData.id,
        };
        setFormData(mainLine);
        setRelatedLines(allLines.slice(1));
      }
    } else {
      const newLine = await handleProductSelectHook(product);

      const updatedFormData = {
        ...newLine,
        id: formData.id,
      };

      setFormData(updatedFormData);
      setRelatedLines([]);
    }
  };

  const handleFieldChange = (field: keyof QuotationLineFormState, value: unknown): void => {
    const updated = { ...formData, [field]: value };
    const calculated = calculateLineTotals(updated);
    setFormData(calculated);
  };

  const handleSave = (): void => {
    if (onSaveMultiple && relatedLines.length > 0) {
      onSaveMultiple([formData, ...relatedLines]);
    } else {
      onSave(formData);
    }
  };


  const totalDiscount = (formData.discountAmount1 || 0) + (formData.discountAmount2 || 0) + (formData.discountAmount3 || 0);
  const hasDiscount = totalDiscount > 0;

  return (
    <Card className="border-2 border-primary/20 bg-card">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b">
          <h4 className="text-base font-semibold flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            {t('quotation.lines.editLine', 'Satır Düzenle')}
          </h4>
          {(!formData.productCode || !formData.productName) && (
            <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs">
              {t('quotation.lines.selectStockFirst', 'Stok seçilmedi')}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Package className="h-3.5 w-3.5" />
                {t('quotation.lines.stock', 'Stok')} *
              </label>
              <Button
                type="button"
                variant="default"
                onClick={() => setProductDialogOpen(true)}
                className="gap-2"
                size="sm"
              >
                <Package className="h-3.5 w-3.5" />
                {t('quotation.lines.selectStock', 'Stok Seç')}
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <Input
                value={formData.productCode || ''}
                placeholder={t('quotation.lines.productCode', 'Stok Kodu')}
                readOnly
                className="bg-muted/50 font-mono text-sm h-9"
              />
              <Input
                value={formData.productName || ''}
                placeholder={t('quotation.lines.productName', 'Stok Adı')}
                readOnly
                className="bg-muted/50 text-sm h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-3.5 w-3.5" />
                {t('quotation.lines.unitPrice', 'Birim Fiyat')} *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.unitPrice}
                readOnly
                className="bg-muted/50 font-medium"
              />
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('quotation.lines.quantity', 'Miktar')} *
                </label>
                <Input
                  type="number"
                  step="0.001"
                  min="0.01"
                  value={formData.quantity}
                  onChange={(e) => handleFieldChange('quantity', parseFloat(e.target.value) || 0)}
                  className="font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('quotation.lines.vatRate', 'KDV Oranı %')}
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.vatRate}
                onChange={(e) => handleFieldChange('vatRate', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Percent className="h-3.5 w-3.5" />
              {t('quotation.lines.discounts', 'İndirimler')}
            </label>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="space-y-1.5 p-2 border rounded-md bg-muted/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">
                    {t('quotation.lines.discount1', 'İndirim 1 %')}
                  </label>
                  <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                    {formData.discountAmount1 > 0 ? '-' : ''}{formatCurrency(formData.discountAmount1 || 0, currencyCode)}
                  </span>
                </div>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.discountRate1}
                  onChange={(e) => handleFieldChange('discountRate1', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="text-sm h-9"
                />
              </div>
              <div className="space-y-1.5 p-2 border rounded-md bg-muted/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">
                    {t('quotation.lines.discount2', 'İndirim 2 %')}
                  </label>
                  <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                    {formData.discountAmount2 > 0 ? '-' : ''}{formatCurrency(formData.discountAmount2 || 0, currencyCode)}
                  </span>
                </div>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.discountRate2}
                  onChange={(e) => handleFieldChange('discountRate2', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="text-sm h-9"
                />
              </div>
              <div className="space-y-1.5 p-2 border rounded-md bg-muted/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">
                    {t('quotation.lines.discount3', 'İndirim 3 %')}
                  </label>
                  <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                    {formData.discountAmount3 > 0 ? '-' : ''}{formatCurrency(formData.discountAmount3 || 0, currencyCode)}
                  </span>
                </div>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.discountRate3}
                  onChange={(e) => handleFieldChange('discountRate3', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="text-sm h-9"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-3 space-y-2 border">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-semibold">
              {t('quotation.lines.calculations', 'Hesaplamalar')}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                {t('quotation.lines.discountAmount', 'Toplam İndirim')}:
              </span>
              <span className={`font-medium ${hasDiscount ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
                {hasDiscount ? '-' : ''}{formatCurrency(totalDiscount, currencyCode)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                {t('quotation.lines.netPrice', 'Net Fiyat')}:
              </span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {formatCurrency(formData.lineTotal || 0, currencyCode)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t font-semibold">
              <span>
                {t('quotation.lines.lineTotal', 'Satır Toplamı (KDV Dahil)')}:
              </span>
              <span className="text-primary text-base">
                {formatCurrency(formData.lineGrandTotal, currencyCode)}
              </span>
            </div>
          </div>
        </div>

        {relatedLines.length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <h5 className="text-sm font-semibold">
                {t('quotation.lines.relatedStocks', 'Bağlı Stoklar')} ({relatedLines.length})
              </h5>
            </div>
            <div className="space-y-3">
              {relatedLines.map((relatedLine, index) => (
                <div key={relatedLine.id} className="p-3 border rounded-md bg-muted/30">
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2 mb-2">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {t('quotation.lines.productCode', 'Stok Kodu')}
                      </div>
                      <div className="font-mono text-sm font-medium">
                        {relatedLine.productCode || '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {t('quotation.lines.productName', 'Stok Adı')}
                      </div>
                      <div className="text-sm font-medium">
                        {relatedLine.productName || '-'}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">
                        {t('quotation.lines.quantity', 'Miktar')}:
                      </span>
                      <span className="ml-2 font-medium">{relatedLine.quantity}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {t('quotation.lines.unitPrice', 'Birim Fiyat')}:
                      </span>
                      <span className="ml-2 font-medium">
                        {formatCurrency(relatedLine.unitPrice, currencyCode)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {t('quotation.lines.netPrice', 'Net Fiyat')}:
                      </span>
                      <span className="ml-2 font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(relatedLine.lineTotal || 0, currencyCode)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {t('quotation.lines.lineTotal', 'Toplam')}:
                      </span>
                      <span className="ml-2 font-medium text-primary">
                        {formatCurrency(relatedLine.lineGrandTotal, currencyCode)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button type="button" variant="outline" onClick={onCancel} size="sm" className="gap-2">
            <X className="h-4 w-4" />
            {t('common.cancel', 'İptal')}
          </Button>
          <Button 
            type="button" 
            onClick={handleSave} 
            size="sm" 
            className="gap-2"
            disabled={!formData.productCode || !formData.productName}
          >
            <Check className="h-4 w-4" />
            {t('common.save', 'Kaydet')}
          </Button>
        </div>

        <ProductSelectDialog
          open={productDialogOpen}
          onOpenChange={setProductDialogOpen}
          onSelect={handleProductSelect}
        />
      </CardContent>
    </Card>
  );
}
