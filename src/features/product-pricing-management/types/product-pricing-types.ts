import { z } from 'zod';

export interface ProductPricingGetDto {
  id: number;
  erpProductCode: string;
  erpGroupCode: string;
  currency: string;
  listPrice: number;
  costPrice: number;
  discount1?: number;
  discount2?: number;
  discount3?: number;
  createdDate: string;
  updatedDate?: string;
  deletedDate?: string;
  isDeleted: boolean;
  createdBy?: number;
  updatedBy?: number;
  deletedBy?: number;
  createdByFullUser?: string;
  updatedByFullUser?: string;
  deletedByFullUser?: string;
}

export interface CreateProductPricingDto {
  erpProductCode: string;
  erpGroupCode: string;
  currency: string;
  listPrice: number;
  costPrice: number;
  discount1?: number;
  discount2?: number;
  discount3?: number;
}

export interface UpdateProductPricingDto {
  erpProductCode: string;
  erpGroupCode: string;
  currency: string;
  listPrice: number;
  costPrice: number;
  discount1?: number;
  discount2?: number;
  discount3?: number;
}

export interface ProductPricingListFilters {
  erpProductCode?: string;
  erpGroupCode?: string;
  currency?: string;
  minListPrice?: number;
  maxListPrice?: number;
  minCostPrice?: number;
  maxCostPrice?: number;
  minDiscount?: number;
  maxDiscount?: number;
}

export interface ProductPricingFormData {
  erpProductCode: string;
  erpGroupCode: string;
  currency: string;
  listPrice: number;
  costPrice: number;
  discount1?: number;
  discount2?: number;
  discount3?: number;
}

export const productPricingFormSchema = z.object({
  erpProductCode: z
    .string()
    .min(1, 'productPricingManagement.erpProductCodeRequired')
    .max(50, 'productPricingManagement.erpProductCodeMaxLength'),
  erpGroupCode: z
    .string()
    .min(1, 'productPricingManagement.erpGroupCodeRequired')
    .max(50, 'productPricingManagement.erpGroupCodeMaxLength'),
  currency: z
    .string()
    .min(1, 'productPricingManagement.currencyRequired')
    .max(50, 'productPricingManagement.currencyMaxLength'),
  listPrice: z
    .number()
    .min(0, 'productPricingManagement.listPriceMin'),
  costPrice: z
    .number()
    .min(0, 'productPricingManagement.costPriceMin'),
  discount1: z
    .number()
    .min(0, 'productPricingManagement.discount1Range')
    .max(100, 'productPricingManagement.discount1Range')
    .optional()
    .nullable(),
  discount2: z
    .number()
    .min(0, 'productPricingManagement.discount2Range')
    .max(100, 'productPricingManagement.discount2Range')
    .optional()
    .nullable(),
  discount3: z
    .number()
    .min(0, 'productPricingManagement.discount3Range')
    .max(100, 'productPricingManagement.discount3Range')
    .optional()
    .nullable(),
});

export type ProductPricingFormSchema = z.infer<typeof productPricingFormSchema>;

export const CURRENCIES = [
  { value: 'TRY', label: 'Turkish Lira', symbol: '₺' },
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
  { value: 'JPY', label: 'Japanese Yen', symbol: '¥' },
  { value: 'CHF', label: 'Swiss Franc', symbol: 'CHF' },
  { value: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
  { value: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
] as const;

export const calculateFinalPrice = (
  listPrice: number,
  discount1?: number | null,
  discount2?: number | null,
  discount3?: number | null
): number => {
  let finalPrice = listPrice;
  if (discount1) {
    finalPrice = finalPrice * (1 - discount1 / 100);
  }
  if (discount2) {
    finalPrice = finalPrice * (1 - discount2 / 100);
  }
  if (discount3) {
    finalPrice = finalPrice * (1 - discount3 / 100);
  }
  return Math.max(0, finalPrice);
};

export const calculateProfitMargin = (
  listPrice: number,
  costPrice: number,
  discount1?: number | null,
  discount2?: number | null,
  discount3?: number | null
): { percentage: number; amount: number } => {
  const finalPrice = calculateFinalPrice(listPrice, discount1, discount2, discount3);
  const profitAmount = finalPrice - costPrice;
  const profitPercentage = costPrice > 0 ? (profitAmount / costPrice) * 100 : 0;
  return { percentage: profitPercentage, amount: profitAmount };
};

export const getCurrencySymbol = (currency: string | number, exchangeRates?: Array<{ dovizTipi: number; dovizIsmi: string | null }>): string => {
  if (exchangeRates) {
    const currencyValue = typeof currency === 'string' ? parseInt(currency, 10) : currency;
    const currencyData = exchangeRates.find((c) => c.dovizTipi === currencyValue);
    return currencyData?.dovizIsmi || String(currency);
  }
  const currencyValue = typeof currency === 'string' ? currency : String(currency);
  const currencyData = CURRENCIES.find((c) => c.value === currencyValue);
  return currencyData?.symbol || currencyValue;
};

export const formatPrice = (price: number, currency: string | number, exchangeRates?: Array<{ dovizTipi: number; dovizIsmi: string | null }>): string => {
  const symbol = getCurrencySymbol(currency, exchangeRates);
  
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price) + ` ${symbol}`;
};

export const formatPercentage = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '-';
  return `${value.toFixed(2)}%`;
};
