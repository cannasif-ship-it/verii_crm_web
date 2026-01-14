import { type ReactElement, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { productPricingFormSchema, type ProductPricingFormSchema, calculateFinalPrice, calculateProfitMargin, formatPrice } from '../types/product-pricing-types';
import { useCurrencyOptions } from '@/services/hooks/useCurrencyOptions';
import { ProductSelectDialog } from '@/components/shared/ProductSelectDialog';
import { Search, X } from 'lucide-react';
import type { ProductPricingGetDto } from '../types/product-pricing-types';

interface ProductPricingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductPricingFormSchema) => void | Promise<void>;
  productPricing?: ProductPricingGetDto | null;
  isLoading?: boolean;
}

export function ProductPricingForm({
  open,
  onOpenChange,
  onSubmit,
  productPricing,
  isLoading = false,
}: ProductPricingFormProps): ReactElement {
  const { t } = useTranslation();
  const { currencyOptions, isLoading: isLoadingCurrencies } = useCurrencyOptions();
  const [productDialogOpen, setProductDialogOpen] = useState(false);

  const form = useForm<ProductPricingFormSchema>({
    resolver: zodResolver(productPricingFormSchema),
    defaultValues: {
      erpProductCode: '',
      erpGroupCode: '',
      currency: '1',
      listPrice: 0,
      costPrice: 0,
      discount1: undefined,
      discount2: undefined,
      discount3: undefined,
    },
  });

  const watchedValues = form.watch(['listPrice', 'costPrice', 'discount1', 'discount2', 'discount3', 'currency']);

  const calculations = useMemo(() => {
    const listPrice = watchedValues[0] || 0;
    const costPrice = watchedValues[1] || 0;
    const discount1 = watchedValues[2];
    const discount2 = watchedValues[3];
    const discount3 = watchedValues[4];
    const currency = watchedValues[5] || '1';

    const finalPrice = calculateFinalPrice(listPrice, discount1, discount2, discount3);
    const profitMargin = calculateProfitMargin(listPrice, costPrice, discount1, discount2, discount3);

    return { finalPrice, profitMargin, currency };
  }, [watchedValues]);

  useEffect(() => {
    if (productPricing) {
      form.reset({
        erpProductCode: productPricing.erpProductCode,
        erpGroupCode: productPricing.erpGroupCode,
        currency: productPricing.currency,
        listPrice: productPricing.listPrice,
        costPrice: productPricing.costPrice,
        discount1: productPricing.discount1 || undefined,
        discount2: productPricing.discount2 || undefined,
        discount3: productPricing.discount3 || undefined,
      });
    } else {
      form.reset({
        erpProductCode: '',
        erpGroupCode: '',
        currency: '1',
        listPrice: 0,
        costPrice: 0,
        discount1: undefined,
        discount2: undefined,
        discount3: undefined,
      });
    }
  }, [productPricing, form]);

  const handleSubmit = async (data: ProductPricingFormSchema): Promise<void> => {
    await onSubmit(data);
    if (!isLoading) {
      form.reset();
      onOpenChange(false);
    }
  };

  const getProfitMarginColor = (percentage: number): string => {
    if (percentage < 0) return 'text-red-600';
    if (percentage < 10) return 'text-orange-600';
    if (percentage < 25) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {productPricing
              ? t('productPricingManagement.edit', 'Fiyatlandırma Düzenle')
              : t('productPricingManagement.create', 'Yeni Fiyatlandırma')}
          </DialogTitle>
          <DialogDescription>
            {productPricing
              ? t('productPricingManagement.editDescription', 'Fiyatlandırma bilgilerini düzenleyin')
              : t('productPricingManagement.createDescription', 'Yeni fiyatlandırma bilgilerini girin')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="erpProductCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('productPricingManagement.erpProductCode', 'Stok Kodu')} *
                    </FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          {...field}
                          readOnly
                          placeholder={t('productPricingManagement.selectStokCode', 'Stok seçin')}
                          maxLength={50}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setProductDialogOpen(true)}
                        title={t('productPricingManagement.selectStok', 'Stok Seç')}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                      {field.value && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            field.onChange('');
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="erpGroupCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('productPricingManagement.erpGroupCode', 'Grup Kodu')} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly
                        placeholder={t('productPricingManagement.erpGroupCodePlaceholder', 'Stok seçildiğinde otomatik doldurulur')}
                        maxLength={50}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('productPricingManagement.currency', 'Para Birimi')} *
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('productPricingManagement.selectCurrency', 'Lütfen para birimi seçin')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingCurrencies ? (
                        <SelectItem value="0" disabled>Yükleniyor...</SelectItem>
                      ) : (
                        currencyOptions.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value.toString()}>
                            {currency.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="listPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('productPricingManagement.listPrice', 'Liste Fiyatı')} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        value={field.value || ''}
                        placeholder={t('productPricingManagement.enterListPrice', 'Liste Fiyatı Girin')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('productPricingManagement.costPrice', 'Maliyet Fiyatı')} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        value={field.value || ''}
                        placeholder={t('productPricingManagement.enterCostPrice', 'Maliyet Fiyatı Girin')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="discount1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('productPricingManagement.discount1', 'İskonto 1')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        value={field.value || ''}
                        placeholder={t('productPricingManagement.enterDiscount1', 'İskonto 1 Girin (0-100, Opsiyonel)')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('productPricingManagement.discount2', 'İskonto 2')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        value={field.value || ''}
                        placeholder={t('productPricingManagement.enterDiscount2', 'İskonto 2 Girin (0-100, Opsiyonel)')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('productPricingManagement.discount3', 'İskonto 3')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        value={field.value || ''}
                        placeholder={t('productPricingManagement.enterDiscount3', 'İskonto 3 Girin (0-100, Opsiyonel)')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {(watchedValues[0] > 0 || watchedValues[1] > 0) && (
              <div className="rounded-lg border bg-muted p-4 space-y-2">
                <div className="text-sm font-medium mb-2">
                  {t('productPricingManagement.priceCalculation', 'Fiyat Hesaplama')}
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>{t('productPricingManagement.listPrice', 'Liste Fiyatı')}:</span>
                    <span className="font-medium">
                      {formatPrice(watchedValues[0] || 0, calculations.currency, currencyOptions)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('productPricingManagement.finalPriceAfterDiscounts', 'İndirimler Sonrası Son Fiyat')}:</span>
                    <span className="font-medium">
                      {formatPrice(calculations.finalPrice, calculations.currency, currencyOptions)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('productPricingManagement.costPrice', 'Maliyet Fiyatı')}:</span>
                    <span className="font-medium">
                      {formatPrice(watchedValues[1] || 0, calculations.currency, currencyOptions)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>{t('productPricingManagement.profitAmount', 'Kar Tutarı')}:</span>
                    <span className={`font-semibold ${getProfitMarginColor(calculations.profitMargin.percentage)}`}>
                      {formatPrice(calculations.profitMargin.amount, calculations.currency, currencyOptions)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('productPricingManagement.profitPercentage', 'Kar Yüzdesi')}:</span>
                    <span className={`font-semibold ${getProfitMarginColor(calculations.profitMargin.percentage)}`}>
                      {calculations.profitMargin.percentage.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {t('common.cancel', 'İptal')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? t('common.saving', 'Kaydediliyor...')
                  : t('common.save', 'Kaydet')}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        <ProductSelectDialog
          open={productDialogOpen}
          onOpenChange={setProductDialogOpen}
          onSelect={(product) => {
            form.setValue('erpProductCode', product.code);
            if (product.groupCode) {
              form.setValue('erpGroupCode', product.groupCode);
            }
            setProductDialogOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
