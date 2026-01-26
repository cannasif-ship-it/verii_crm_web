import { type ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useOrderCalculations } from '../hooks/useOrderCalculations';
import { useCurrencyOptions } from '@/services/hooks/useCurrencyOptions';
import { formatCurrency } from '../utils/format-currency';
import type { OrderLineFormState } from '../types/order-types';
import { Calculator, Wallet } from 'lucide-react';

interface OrderSummaryCardProps {
  lines: OrderLineFormState[];
  currency: number;
}

export function OrderSummaryCard({
  lines,
  currency,
}: OrderSummaryCardProps): ReactElement {
  const { t } = useTranslation();
  const { calculateTotals } = useOrderCalculations();
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
    footer: "mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800",
  };

  return (
    <div className={styles.glassCard}>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6 text-zinc-900 dark:text-white">
          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <Calculator className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          </div>
          <h3 className="font-bold text-base">{t('order.summary.title', 'Özet')}</h3>
        </div>

        {/* Hesaplamalar */}
        <div className="space-y-3">
          <div className={styles.row}>
            <span className={styles.label}>{t('order.summary.subtotal', 'Ara Toplam')}</span>
            <span className={styles.value}>{formatCurrency(totals.subtotal, currencyCode)}</span>
          </div>
          
          <div className={styles.row}>
            <span className={styles.label}>{t('order.summary.totalVat', 'Toplam KDV')}</span>
            <span className={styles.value}>{formatCurrency(totals.totalVat, currencyCode)}</span>
          </div>
        </div>

        {/* Genel Toplam */}
        <div className={styles.footer}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              {t('order.summary.grandTotal', 'Genel Toplam')}
            </span>
            
            {/* Vurgulu Alan: Sade ama renkli text */}
            <span className="text-3xl font-black font-mono tracking-tight bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
              {formatCurrency(totals.grandTotal, currencyCode)}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}