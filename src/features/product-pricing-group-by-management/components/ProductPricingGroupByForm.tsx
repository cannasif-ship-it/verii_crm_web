import { type ReactElement, useEffect, useMemo } from 'react';
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
import { productPricingGroupByFormSchema, type ProductPricingGroupByFormSchema, calculateFinalPrice, formatPrice } from '../types/product-pricing-group-by-types';
import { useExchangeRate } from '@/services/hooks/useExchangeRate';
import type { KurDto } from '@/services/erp-types';
import { useStokGroup } from '@/services/hooks/useStokGroup';
import type { ProductPricingGroupByDto } from '../types/product-pricing-group-by-types';

interface ProductPricingGroupByFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductPricingGroupByFormSchema) => void | Promise<void>;
  productPricingGroupBy?: ProductPricingGroupByDto | null;
  isLoading?: boolean;
}

export function ProductPricingGroupByForm({
  open,
  onOpenChange,
  onSubmit,
  productPricingGroupBy,
  isLoading = false,
}: ProductPricingGroupByFormProps): ReactElement {
  const { t } = useTranslation();
  const { data: exchangeRates = [], isLoading: isLoadingCurrencies } = useExchangeRate();
  const { data: stokGroups = [], isLoading: isLoadingGroups } = useStokGroup();

  const form = useForm<ProductPricingGroupByFormSchema>({
    resolver: zodResolver(productPricingGroupByFormSchema),
    defaultValues: {
      erpGroupCode: '',
      currency: '1',
      listPrice: 0,
      costPrice: 0,
      discount1: undefined,
      discount2: undefined,
      discount3: undefined,
    },
  });

  const watchedValues = form.watch(['listPrice', 'discount1', 'discount2', 'discount3', 'currency']);

  const finalPrice = useMemo(() => {
    return calculateFinalPrice(
      watchedValues[0] || 0,
      watchedValues[1],
      watchedValues[2],
      watchedValues[3]
    );
  }, [watchedValues]);

  useEffect(() => {
    if (productPricingGroupBy) {
      form.reset({
        erpGroupCode: productPricingGroupBy.erpGroupCode,
        currency: productPricingGroupBy.currency,
        listPrice: productPricingGroupBy.listPrice,
        costPrice: productPricingGroupBy.costPrice,
        discount1: productPricingGroupBy.discount1 || undefined,
        discount2: productPricingGroupBy.discount2 || undefined,
        discount3: productPricingGroupBy.discount3 || undefined,
      });
    } else {
      form.reset({
        erpGroupCode: '',
        currency: '1',
        listPrice: 0,
        costPrice: 0,
        discount1: undefined,
        discount2: undefined,
        discount3: undefined,
      });
    }
  }, [productPricingGroupBy, form]);

  const handleSubmit = async (data: ProductPricingGroupByFormSchema): Promise<void> => {
    await onSubmit(data);
    if (!isLoading) {
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {productPricingGroupBy
              ? t('productPricingGroupByManagement.edit', 'Fiyatlandırma Grubu Düzenle')
              : t('productPricingGroupByManagement.create', 'Yeni Fiyatlandırma Grubu')}
          </DialogTitle>
          <DialogDescription>
            {productPricingGroupBy
              ? t('productPricingGroupByManagement.editDescription', 'Fiyatlandırma grubu bilgilerini düzenleyin')
              : t('productPricingGroupByManagement.createDescription', 'Yeni fiyatlandırma grubu bilgilerini girin')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="erpGroupCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('productPricingGroupByManagement.erpGroupCode', 'ERP Ürün Grubu Kodu')} *
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('productPricingGroupByManagement.selectErpGroupCode', 'Grup Seçin')} />
                      </SelectTrigger>
                    </FormControl>
                      <SelectContent>
                        {isLoadingGroups ? (
                          <SelectItem value="__loading__" disabled>Yükleniyor...</SelectItem>
                        ) : (
                          stokGroups.map((group) => {
                            const groupCode = group.grupKodu || `__group_${group.isletmeKodu}_${group.subeKodu}`;
                            const displayText = group.grupKodu && group.grupAdi 
                              ? `${group.grupKodu} - ${group.grupAdi}`
                              : group.grupAdi || group.grupKodu || groupCode;
                            return (
                              <SelectItem key={groupCode} value={groupCode}>
                                {displayText}
                              </SelectItem>
                            );
                          })
                        )}
                      </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('productPricingGroupByManagement.currency', 'Para Birimi')} *
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('productPricingGroupByManagement.selectCurrency', 'Lütfen para birimi seçin')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingCurrencies ? (
                        <SelectItem value="0" disabled>Yükleniyor...</SelectItem>
                      ) : (
                        exchangeRates.map((currency: KurDto) => (
                          <SelectItem key={currency.dovizTipi} value={String(currency.dovizTipi)}>
                            {currency.dovizIsmi || `Döviz ${currency.dovizTipi}`}
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
                      {t('productPricingGroupByManagement.listPrice', 'Liste Fiyatı')} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        value={field.value || ''}
                        placeholder={t('productPricingGroupByManagement.enterListPrice', 'Liste Fiyatı Girin')}
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
                      {t('productPricingGroupByManagement.costPrice', 'Maliyet Fiyatı')} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        value={field.value || ''}
                        placeholder={t('productPricingGroupByManagement.enterCostPrice', 'Maliyet Fiyatı Girin')}
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
                      {t('productPricingGroupByManagement.discount1', 'İskonto 1')}
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
                        placeholder={t('productPricingGroupByManagement.enterDiscount1', 'İskonto 1 Girin (0-100, Opsiyonel)')}
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
                      {t('productPricingGroupByManagement.discount2', 'İskonto 2')}
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
                        placeholder={t('productPricingGroupByManagement.enterDiscount2', 'İskonto 2 Girin (0-100, Opsiyonel)')}
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
                      {t('productPricingGroupByManagement.discount3', 'İskonto 3')}
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
                        placeholder={t('productPricingGroupByManagement.enterDiscount3', 'İskonto 3 Girin (0-100, Opsiyonel)')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {watchedValues[0] > 0 && (
              <div className="rounded-lg border bg-muted p-4">
                <div className="text-sm font-medium mb-2">
                  {t('productPricingGroupByManagement.priceCalculation', 'Fiyat Hesaplama')}
                </div>
                <div className="text-lg font-semibold">
                  {t('productPricingGroupByManagement.finalPriceAfterDiscounts', 'İndirimler Sonrası Son Fiyat')}:{' '}
                  {formatPrice(finalPrice, watchedValues[4] || '1', exchangeRates)}
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
      </DialogContent>
    </Dialog>
  );
}
