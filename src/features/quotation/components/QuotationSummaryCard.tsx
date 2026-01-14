import { type ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuotationCalculations } from '../hooks/useQuotationCalculations';
import { useCurrencyOptions } from '@/services/hooks/useCurrencyOptions';
import { formatCurrency } from '../utils/format-currency';
import type { QuotationLineFormState } from '../types/quotation-types';

interface QuotationSummaryCardProps {
  lines: QuotationLineFormState[];
  currency: number;
}

export function QuotationSummaryCard({
  lines,
  currency,
}: QuotationSummaryCardProps): ReactElement {
  const { t } = useTranslation();
  const { calculateTotals } = useQuotationCalculations();
  const { currencyOptions } = useCurrencyOptions();

  const totals = calculateTotals(lines);

  const currencyCode = useMemo(() => {
    const found = currencyOptions.find((opt) => opt.dovizTipi === currency);
    return found?.code || 'TRY';
  }, [currency, currencyOptions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('quotation.summary.title', 'Özet')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span>{t('quotation.summary.subtotal', 'Ara Toplam')}:</span>
          <span className="font-semibold">{formatCurrency(totals.subtotal, currencyCode)}</span>
        </div>
        <div className="flex justify-between">
          <span>{t('quotation.summary.totalVat', 'Toplam KDV')}:</span>
          <span className="font-semibold">{formatCurrency(totals.totalVat, currencyCode)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold pt-2 border-t">
          <span>{t('quotation.summary.grandTotal', 'Genel Toplam')}:</span>
          <span>{formatCurrency(totals.grandTotal, currencyCode)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
