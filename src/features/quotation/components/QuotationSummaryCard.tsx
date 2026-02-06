import { type ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuotationCalculations } from '../hooks/useQuotationCalculations';
import { useCurrencyOptions } from '@/services/hooks/useCurrencyOptions';
import { formatCurrency } from '../utils/format-currency';
import type { QuotationLineFormState } from '../types/quotation-types';
import { Calculator, Wallet } from 'lucide-react';

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

  const styles = {
    glassCard: "relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/50 shadow-sm",
    row: "flex items-center justify-between text-sm py-1",
    label: "text-zinc-500 dark:text-zinc-400 font-medium",
    value: "font-semibold text-zinc-900 dark:text-zinc-100 font-mono",
  };

  return (
    <div className={styles.glassCard}>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6 text-zinc-900 dark:text-white">
          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <Calculator className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          </div>
          <h3 className="font-bold text-base">{t('quotation.summary.title', 'Özet')}</h3>
        </div>

        {/* Hesaplamalar */}
        <div className="space-y-3">
          <div className={styles.row}>
            <span className={styles.label}>{t('quotation.summary.subtotal', 'Ara Toplam')}</span>
            <span className={styles.value}>{formatCurrency(totals.subtotal, currencyCode)}</span>
          </div>
          
          <div className={styles.row}>
            <span className={styles.label}>{t('quotation.summary.totalVat', 'Toplam KDV')}</span>
            <span className={styles.value}>{formatCurrency(totals.totalVat, currencyCode)}</span>
          </div>
        </div>

        {/* Genel Toplam */}
        <div className="mt-6">
          <div className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 p-5 shadow-lg shadow-violet-500/30 text-white flex items-center justify-between transition-all hover:scale-[1.02] duration-300">
            <span className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-white/90">
              <Wallet className="h-5 w-5" />
              {t('quotation.summary.grandTotal', 'Genel Toplam')}
            </span>
            <span className="text-3xl font-black font-mono tracking-tight text-white drop-shadow-sm">
              {formatCurrency(totals.grandTotal, currencyCode)}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}