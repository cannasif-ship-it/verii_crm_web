import { type ReactElement, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { pricingRuleLineSchema } from '../schemas/pricing-rule-schema';
import type { PricingRuleLineFormState } from '../types/pricing-rule-types';
import { ProductSelectDialog, type ProductSelectionResult } from '@/components/shared';
import { Search, X } from 'lucide-react';
import { useExchangeRate } from '@/services/hooks/useExchangeRate';
import type { KurDto } from '@/services/erp-types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PricingRuleLineFormProps {
  line: PricingRuleLineFormState;
  onSave: (line: PricingRuleLineFormState) => void;
  onCancel: () => void;
}

export function PricingRuleLineForm({
  line,
  onSave,
  onCancel,
}: PricingRuleLineFormProps): ReactElement {
  const { t } = useTranslation();
  const { data: exchangeRates = [], isLoading: isLoadingRates } = useExchangeRate();
  const [productDialogOpen, setProductDialogOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(pricingRuleLineSchema),
    defaultValues: {
      ...line,
      minQuantity: line.minQuantity ?? 0,
      currencyCode: line.currencyCode ? (typeof line.currencyCode === 'string' ? Number(line.currencyCode) : line.currencyCode) : undefined,
      discountRate1: line.discountRate1 ?? 0,
      discountAmount1: line.discountAmount1 ?? 0,
      discountRate2: line.discountRate2 ?? 0,
      discountAmount2: line.discountAmount2 ?? 0,
      discountRate3: line.discountRate3 ?? 0,
      discountAmount3: line.discountAmount3 ?? 0,
    },
  });

  const watchedFixedUnitPrice = form.watch('fixedUnitPrice');
  const watchedMinQuantity = form.watch('minQuantity');
  const watchedDiscountRate1 = form.watch('discountRate1');
  const watchedDiscountRate2 = form.watch('discountRate2');
  const watchedDiscountRate3 = form.watch('discountRate3');

  useEffect(() => {
    const baseAmount = (watchedFixedUnitPrice ?? 0) * (watchedMinQuantity ?? 0);
    
    if (baseAmount > 0) {
      let currentAmount = baseAmount;
      
      const discountAmount1 = currentAmount * ((watchedDiscountRate1 ?? 0) / 100);
      currentAmount = currentAmount - discountAmount1;
      
      const discountAmount2 = currentAmount * ((watchedDiscountRate2 ?? 0) / 100);
      currentAmount = currentAmount - discountAmount2;
      
      const discountAmount3 = currentAmount * ((watchedDiscountRate3 ?? 0) / 100);
      
      form.setValue('discountAmount1', discountAmount1, { shouldValidate: false });
      form.setValue('discountAmount2', discountAmount2, { shouldValidate: false });
      form.setValue('discountAmount3', discountAmount3, { shouldValidate: false });
    } else {
      form.setValue('discountAmount1', 0, { shouldValidate: false });
      form.setValue('discountAmount2', 0, { shouldValidate: false });
      form.setValue('discountAmount3', 0, { shouldValidate: false });
    }
  }, [watchedFixedUnitPrice, watchedMinQuantity, watchedDiscountRate1, watchedDiscountRate2, watchedDiscountRate3, form]);

  const handleSubmit = (data: unknown): void => {
    const formData = data as PricingRuleLineFormState;

    const savedData: PricingRuleLineFormState = {
      ...formData,
      id: line.id,
      minQuantity: formData.minQuantity ?? 0,
      currencyCode: typeof formData.currencyCode === 'number' ? formData.currencyCode : (formData.currencyCode ? Number(formData.currencyCode) : undefined),
      discountRate1: formData.discountRate1 ?? 0,
      discountAmount1: formData.discountAmount1 ?? 0,
      discountRate2: formData.discountRate2 ?? 0,
      discountAmount2: formData.discountAmount2 ?? 0,
      discountRate3: formData.discountRate3 ?? 0,
      discountAmount3: formData.discountAmount3 ?? 0,
    };

    onSave(savedData);
  };

  const handleProductSelect = (product: ProductSelectionResult): void => {
    form.setValue('stokCode', product.code);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 p-4 md:p-6 border rounded-lg bg-card shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <FormField
            control={form.control}
            name="stokCode"
            render={({ field }) => (
              <FormItem className="sm:col-span-2 lg:col-span-1">
                <FormLabel className="text-sm font-medium">
                  {t('pricingRule.lines.stokCode', 'Stok Kodu')} *
                </FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      {...field}
                      readOnly
                      placeholder={t('pricingRule.lines.stokCodePlaceholder', 'Ürün kodu')}
                      className="flex-1"
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setProductDialogOpen(true)}
                    title={t('pricingRule.lines.selectProduct', 'Ürün Seç')}
                    className="shrink-0"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                  {field.value && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        form.setValue('stokCode', '');
                        form.setValue('fixedUnitPrice', undefined);
                      }}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <FormMessage>
                  {form.formState.errors.stokCode && t(form.formState.errors.stokCode.message || 'pricingRule.lines.stokCodeRequired', 'Stok kodu zorunludur')}
                </FormMessage>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {t('pricingRule.lines.minQuantity', 'Min Miktar')} *
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {t('pricingRule.lines.maxQuantity', 'Max Miktar')} *
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fixedUnitPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {t('pricingRule.lines.fixedUnitPrice', 'Liste Fiyatı')} *
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currencyCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {t('pricingRule.lines.currencyCode', 'Döviz Tipi')} *
                </FormLabel>
                <Select
                  value={field.value !== undefined && field.value !== null ? String(field.value) : ''}
                  onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                  disabled={isLoadingRates}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={isLoadingRates ? t('common.loading', 'Yükleniyor...') : t('pricingRule.lines.selectCurrency', 'Seçiniz')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {exchangeRates.map((currency: KurDto) => (
                      <SelectItem key={currency.dovizTipi} value={String(currency.dovizTipi)}>
                        {currency.dovizIsmi ? `${currency.dovizIsmi}(${currency.dovizTipi})` : `Döviz(${currency.dovizTipi})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discountRate1"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {t('pricingRule.lines.discount1Rate', 'İndirim Oranı 1')} (%)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discountAmount1"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {t('pricingRule.lines.discount1Amount', 'İndirim Tutarı 1')}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                    className="w-full"
                    readOnly
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discountRate2"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {t('pricingRule.lines.discount2Rate', 'İndirim Oranı 2')} (%)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discountAmount2"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {t('pricingRule.lines.discount2Amount', 'İndirim Tutarı 2')}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                    className="w-full"
                    readOnly
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discountRate3"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {t('pricingRule.lines.discount3Rate', 'İndirim Oranı 3')} (%)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discountAmount3"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {t('pricingRule.lines.discount3Amount', 'İndirim Tutarı 3')}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                    className="w-full"
                    readOnly
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            {t('common.cancel', 'İptal')}
          </Button>
          <Button 
            type="submit"
            disabled={!form.watch('stokCode') || form.watch('stokCode').trim() === ''}
            className="w-full sm:w-auto"
          >
            {t('common.save', 'Kaydet')}
          </Button>
        </div>
      </form>

      <ProductSelectDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        onSelect={handleProductSelect}
        disableRelatedStocks={true}
      />
    </Form>
  );
}
