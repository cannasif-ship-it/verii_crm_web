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
import { PricingRuleLineForm } from './PricingRuleLineForm';
import { ProductSelectDialog, type ProductSelectionResult } from '@/components/shared';
import { Trash2, Edit, Package } from 'lucide-react';
import type { PricingRuleLineFormState } from '../types/pricing-rule-types';
import { useExchangeRate } from '@/services/hooks/useExchangeRate';
import type { KurDto } from '@/services/erp-types';

interface PricingRuleLineTableProps {
  lines: PricingRuleLineFormState[];
  setLines: (lines: PricingRuleLineFormState[]) => void;
}

export function PricingRuleLineTable({
  lines,
  setLines,
}: PricingRuleLineTableProps): ReactElement {
  const { t } = useTranslation();
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const { data: exchangeRates = [] } = useExchangeRate();


  const handleProductSelect = (product: ProductSelectionResult): void => {
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
  };

  const handleEditLine = (id: string): void => {
    setEditingLineId(id);
    setLines(lines.map((line) => (line.id === id ? { ...line, isEditing: true } : line)));
  };

  const handleSaveLine = (updatedLine: PricingRuleLineFormState): void => {
    if (!updatedLine.stokCode || updatedLine.stokCode.trim() === '') {
      return;
    }

    setLines(lines.map((line) => (line.id === updatedLine.id ? { ...updatedLine, isEditing: false } : line)));
    setEditingLineId(null);
  };

  const handleDeleteLine = (id: string): void => {
    setLines(lines.filter((line) => line.id !== id));
  };

  const formatCurrency = (amount: number | null | undefined, currencyCode: number | string | undefined): string => {
    if (amount === null || amount === undefined) return '-';
    if (!currencyCode) return '-';
    
    const numericCode = typeof currencyCode === 'string' ? Number(currencyCode) : currencyCode;
    const currencyOption = exchangeRates.find((rate: KurDto) => rate.dovizTipi === numericCode);
    const displayName = currencyOption?.dovizIsmi || `Döviz ${numericCode}`;
    
    try {
      const isoCode = numericCode === 1 ? 'TRY' : numericCode === 2 ? 'USD' : numericCode === 3 ? 'EUR' : 'TRY';
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: isoCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return new Intl.NumberFormat('tr-TR', {
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
              <TableHead>{t('common.actions', 'İşlemler')}</TableHead>
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
                          >
                            <Trash2 className="h-4 w-4" />
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
    </div>
  );
}
