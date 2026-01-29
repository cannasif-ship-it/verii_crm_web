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
import { productPricingFormSchema, type ProductPricingFormSchema, calculateFinalPrice, calculateProfitMargin, formatPrice } from '../types/product-pricing-types';
import { useExchangeRate } from '@/services/hooks/useExchangeRate';
import { ProductSelectDialog } from '@/components/shared/ProductSelectDialog';
import { CurrencySelectDialog } from '@/components/shared/CurrencySelectDialog';
import { X, Package, Trash2, ChevronDown } from 'lucide-react';
import type { ProductPricingGetDto } from '../types/product-pricing-types';
import { cn } from '@/lib/utils';

interface ProductPricingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductPricingFormSchema) => void | Promise<void>;
  onDelete?: (id: number) => void | Promise<void>;
  productPricing?: ProductPricingGetDto | null;
  isLoading?: boolean;
}

const INPUT_STYLE = `
  h-11 rounded-xl
  bg-white/50 dark:bg-[#0c0516]/50 
  border border-slate-200 dark:border-white/5 
  text-slate-900 dark:text-white text-sm
  placeholder:text-slate-400 dark:placeholder:text-slate-600 
  
  focus-visible:ring-0 focus-visible:ring-offset-0 
  
  focus:bg-white 
  focus:border-pink-500 
  focus:shadow-[0_0_0_3px_rgba(236,72,153,0.15)] 

  dark:focus:bg-[#0c0516] 
  dark:focus:border-pink-500/60 
  dark:focus:shadow-[0_0_0_3px_rgba(236,72,153,0.1)]

  transition-all duration-200
`;

const LABEL_STYLE = "text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold ml-1 mb-1.5 block";

export function ProductPricingForm({
  open,
  onOpenChange,
  onSubmit,
  onDelete,
  productPricing,
  isLoading = false,
}: ProductPricingFormProps): ReactElement {
  const { t } = useTranslation();
  const { data: exchangeRates = [] } = useExchangeRate();
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [currencySelectDialogOpen, setCurrencySelectDialogOpen] = useState(false);

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
      <DialogContent className="bg-white/95 dark:bg-[#1a1025]/95 backdrop-blur-xl border border-white/60 dark:border-white/5 text-slate-900 dark:text-white max-w-4xl shadow-2xl sm:rounded-2xl max-h-[90vh] h-auto flex flex-col gap-0 p-0 overflow-hidden transition-all duration-300">
        
        <DialogHeader className="border-b border-slate-200/50 dark:border-white/5 px-6 py-5 shrink-0 flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 border border-pink-500/10 flex items-center justify-center text-pink-600 dark:text-pink-400 shrink-0">
               <Package size={20} />
             </div>
             <div>
                <DialogTitle className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-orange-600">
                  {productPricing
                    ? t('productPricingManagement.edit', 'Fiyatlandırma Düzenle')
                    : t('productPricingManagement.create', 'Yeni Fiyatlandırma')}
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                  {productPricing
                    ? t('productPricingManagement.editDescription', 'Fiyatlandırma bilgilerini düzenleyin')
                    : t('productPricingManagement.createDescription', 'Yeni fiyatlandırma bilgilerini girin')}
                </DialogDescription>
             </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <Form {...form}>
            <form id="product-pricing-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="erpProductCode"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
                        {t('productPricingManagement.erpProductCode', 'Stok Kodu')} *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            className={cn(INPUT_STYLE, "w-full justify-between px-3 font-normal")}
                            onClick={() => setProductDialogOpen(true)}
                          >
                            {field.value ? (
                              <span className="truncate">{field.value}</span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-600">{t('productPricingManagement.selectStokCode', 'Stok seçin')}</span>
                            )}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                          {field.value && (
                            <div 
                              className="absolute right-8 top-1/2 -translate-y-1/2 p-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                field.onChange('');
                                form.setValue('erpGroupCode', '');
                              }}
                            >
                              <X className="h-3 w-3 text-slate-400" />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="erpGroupCode"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
                        {t('productPricingManagement.erpGroupCode', 'Grup Kodu')} *
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          readOnly
                          placeholder={t('productPricingManagement.erpGroupCodePlaceholder', 'Stok seçildiğinde otomatik doldurulur')}
                          maxLength={50}
                          className={INPUT_STYLE}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel className={LABEL_STYLE}>
                      {t('productPricingManagement.currency', 'Para Birimi')} *
                    </FormLabel>
                    <FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        className={cn(INPUT_STYLE, "w-full justify-between px-3 font-normal")}
                        onClick={() => setCurrencySelectDialogOpen(true)}
                      >
                        {field.value ? (
                          <span className="truncate">
                            {(() => {
                              const curr = exchangeRates.find((c) => String(c.dovizTipi) === field.value);
                              if (!curr) return field.value;
                              return curr.dovizIsmi || `Döviz ${curr.dovizTipi}`;
                            })()}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600">{t('productPricingManagement.selectCurrency', 'Lütfen para birimi seçin')}</span>
                        )}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                    <CurrencySelectDialog
                      open={currencySelectDialogOpen}
                      onOpenChange={setCurrencySelectDialogOpen}
                      selectedCurrencyCode={field.value}
                      onSelect={(currency) => {
                        field.onChange(String(currency.dovizTipi));
                      }}
                    />
                    <FormMessage className="text-red-500 text-[10px] mt-1" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="listPrice"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
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
                          className={INPUT_STYLE}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="costPrice"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
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
                          className={INPUT_STYLE}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="discount1"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
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
                          placeholder={t('productPricingManagement.enterDiscount1', 'İskonto 1 (Ops.)')}
                          className={INPUT_STYLE}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discount2"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
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
                          placeholder={t('productPricingManagement.enterDiscount2', 'İskonto 2 (Ops.)')}
                          className={INPUT_STYLE}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discount3"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
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
                          placeholder={t('productPricingManagement.enterDiscount3', 'İskonto 3 (Ops.)')}
                          className={INPUT_STYLE}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />
              </div>

              {(watchedValues[0] > 0 || watchedValues[1] > 0) && (
                <div className="rounded-2xl border border-pink-100 dark:border-pink-500/10 bg-gradient-to-br from-pink-50/50 to-orange-50/50 dark:from-pink-900/10 dark:to-orange-900/10 p-5 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" />
                    <div className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider">
                      {t('productPricingManagement.priceCalculation', 'Fiyat Hesaplama')}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-white/50 dark:border-white/5 shadow-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">{t('productPricingManagement.listPrice', 'Liste Fiyatı')}:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {formatPrice(watchedValues[0] || 0, calculations.currency, exchangeRates)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-white/50 dark:border-white/5 shadow-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">{t('productPricingManagement.costPrice', 'Maliyet Fiyatı')}:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {formatPrice(watchedValues[1] || 0, calculations.currency, exchangeRates)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-white/50 dark:border-white/5 shadow-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">{t('productPricingManagement.profitAmount', 'Kar Tutarı')}:</span>
                      <span className={`font-bold ${getProfitMarginColor(calculations.profitMargin.percentage)}`}>
                        {formatPrice(calculations.profitMargin.amount, calculations.currency, exchangeRates)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-white/50 dark:border-white/5 shadow-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">{t('productPricingManagement.profitPercentage', 'Kar Yüzdesi')}:</span>
                      <span className={`font-bold ${getProfitMarginColor(calculations.profitMargin.percentage)}`}>
                        {calculations.profitMargin.percentage.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-pink-200/50 dark:border-pink-500/10">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{t('productPricingManagement.finalPriceAfterDiscounts', 'İndirimler Sonrası Son Fiyat')}:</span>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-orange-600">
                      {formatPrice(calculations.finalPrice, calculations.currency, exchangeRates)}
                    </span>
                  </div>
                </div>
              )}
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
        </div>

        <DialogFooter className="border-t border-slate-200/50 dark:border-white/5 px-6 py-4 bg-slate-50/50 dark:bg-white/5 backdrop-blur-md shrink-0 gap-3 justify-between sm:justify-between">
          <div className="flex gap-2">
            {productPricing && onDelete && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => onDelete(productPricing.id)}
                disabled={isLoading}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl"
              >
                <Trash2 size={18} className="mr-2" />
                {t('productPricingManagement.delete', 'Sil')}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="bg-white/50 dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-xl"
            >
              {t('productPricingManagement.cancel', 'İptal')}
            </Button>
            <Button 
              type="submit" 
              form="product-pricing-form"
              disabled={isLoading}
              className="bg-gradient-to-r from-pink-600 to-orange-600 text-white font-bold border-0 hover:shadow-lg hover:shadow-pink-500/20 transition-all transform active:scale-95 px-8 rounded-xl"
            >
              {isLoading
                ? t('productPricingManagement.saving', 'Kaydediliyor...')
                : t('productPricingManagement.save', 'Kaydet')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
