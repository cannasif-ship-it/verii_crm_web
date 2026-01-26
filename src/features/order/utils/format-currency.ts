import i18n from '@/lib/i18n';

export function formatCurrency(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return new Intl.NumberFormat(i18n.language, {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ' ' + currencyCode;
  }
}
