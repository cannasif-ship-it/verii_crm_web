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
import { Package, ChevronDown, Layers, Coins } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { productPricingGroupByFormSchema, type ProductPricingGroupByFormSchema, calculateFinalPrice, formatPrice } from '../types/product-pricing-group-by-types';
import { useExchangeRate } from '@/services/hooks/useExchangeRate';
import type { KurDto } from '@/services/erp-types';
import { useStokGroup } from '@/services/hooks/useStokGroup';
import type { ProductPricingGroupByDto } from '../types/product-pricing-group-by-types';
import { StockGroupSelectDialog } from '@/components/shared/StockGroupSelectDialog';
import { CurrencySelectDialog } from '@/components/shared/CurrencySelectDialog';

interface ProductPricingGroupByFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductPricingGroupByFormSchema) => void | Promise<void>;
  productPricingGroupBy?: ProductPricingGroupByDto | null;
  isLoading?: boolean;
}

const INPUT_STYLE = `
  h-11 rounded-lg
  bg-slate-50 dark:bg-[#0c0516] 
  border border-slate-200 dark:border-white/10 
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
  
  const [groupSelectDialogOpen, setGroupSelectDialogOpen] = useState(false);
  const [currencySelectDialogOpen, setCurrencySelectDialogOpen] = useState(false);

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
      <DialogContent className="bg-white dark:bg-[#130822] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white max-w-2xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50 sm:rounded-2xl max-h-[90vh] h-auto flex flex-col gap-0 p-0 overflow-hidden transition-colors duration-300">
        
        <DialogHeader className="border-b border-slate-100 dark:border-white/5 px-6 py-5 bg-white/80 dark:bg-[#130822]/90 backdrop-blur-md shrink-0 flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 border border-pink-500/10 flex items-center justify-center text-pink-500 shrink-0">
               <Package size={20} />
             </div>
             <div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                  {productPricingGroupBy
                    ? t('productPricingGroupByManagement.edit', 'Fiyatlandırma Grubu Düzenle')
                    : t('productPricingGroupByManagement.create', 'Yeni Fiyatlandırma Grubu')}
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                  {productPricingGroupBy
                    ? t('productPricingGroupByManagement.editDescription', 'Fiyatlandırma grubu bilgilerini düzenleyin')
                    : t('productPricingGroupByManagement.createDescription', 'Yeni fiyatlandırma grubu bilgilerini girin')}
                </DialogDescription>
             </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <Form {...form}>
            <form id="product-pricing-group-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="erpGroupCode"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel className={LABEL_STYLE}>
                      {t('productPricingGroupByManagement.erpGroupCode', 'ERP Ürün Grubu Kodu')} *
                    </FormLabel>
                    <FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        className={cn(
                          INPUT_STYLE,
                          "w-full justify-between px-3 font-normal",
                          !field.value && "text-slate-400 dark:text-slate-600"
                        )}
                        onClick={() => setGroupSelectDialogOpen(true)}
                      >
                        {field.value ? (
                          <span className="truncate">
                            {(() => {
                              const group = stokGroups.find(
                                (g) => (g.grupKodu || `__group_${g.isletmeKodu}_${g.subeKodu}`) === field.value
                              );
                              if (!group) return field.value;
                              return group.grupKodu && group.grupAdi 
                                ? `${group.grupKodu} - ${group.grupAdi}`
                                : group.grupAdi || group.grupKodu || field.value;
                            })()}
                          </span>
                        ) : (
                          t('productPricingGroupByManagement.selectErpGroupCode', 'Grup Seçin')
                        )}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                    <StockGroupSelectDialog
                      open={groupSelectDialogOpen}
                      onOpenChange={setGroupSelectDialogOpen}
                      selectedGroupCode={field.value}
                      onSelect={(group) => {
                        const code = group.grupKodu || `__group_${group.isletmeKodu}_${group.subeKodu}`;
                        field.onChange(code);
                      }}
                    />
                    <FormMessage className="text-red-500 text-[10px] mt-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel className={LABEL_STYLE}>
                      {t('productPricingGroupByManagement.currency', 'Para Birimi')} *
                    </FormLabel>
                    <FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        className={cn(
                          INPUT_STYLE,
                          "w-full justify-between px-3 font-normal",
                          !field.value && "text-slate-400 dark:text-slate-600"
                        )}
                        onClick={() => setCurrencySelectDialogOpen(true)}
                      >
                        {field.value ? (
                          <span className="truncate">
                            {(() => {
                              const curr = exchangeRates.find(
                                (c) => String(c.dovizTipi) === field.value
                              );
                              if (!curr) return field.value;
                              return curr.dovizIsmi || `Döviz ${curr.dovizTipi}`;
                            })()}
                          </span>
                        ) : (
                          t('productPricingGroupByManagement.selectCurrency', 'Lütfen para birimi seçin')
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
                          className={INPUT_STYLE}
                          placeholder={t('productPricingGroupByManagement.enterListPrice', 'Liste Fiyatı Girin')}
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
                          className={INPUT_STYLE}
                          placeholder={t('productPricingGroupByManagement.enterCostPrice', 'Maliyet Fiyatı Girin')}
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
                          className={INPUT_STYLE}
                          placeholder={t('productPricingGroupByManagement.enterDiscount1', 'İskonto 1 (Ops.)')}
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
                          className={INPUT_STYLE}
                          placeholder={t('productPricingGroupByManagement.enterDiscount2', 'İskonto 2 (Ops.)')}
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
                          className={INPUT_STYLE}
                          placeholder={t('productPricingGroupByManagement.enterDiscount3', 'İskonto 3 (Ops.)')}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />
              </div>

              {watchedValues[0] > 0 && (
                <div className="rounded-xl border border-pink-100 dark:border-pink-500/10 bg-pink-50/50 dark:bg-pink-500/5 p-4">
                  <div className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider mb-1">
                    {t('productPricingGroupByManagement.priceCalculation', 'Fiyat Hesaplama')}
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {t('productPricingGroupByManagement.finalPriceAfterDiscounts', 'İndirimler Sonrası Son Fiyat')}:{' '}
                    <span className="text-pink-600 dark:text-pink-400">
                      {formatPrice(finalPrice, watchedValues[4] || '1', exchangeRates)}
                    </span>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div>

        <DialogFooter className="border-t border-slate-100 dark:border-white/5 px-6 py-4 bg-white/80 dark:bg-[#130822]/90 backdrop-blur-md shrink-0 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
          >
            {t('productPricingGroupByManagement.cancel', 'İptal')}
          </Button>
          <Button 
            type="submit" 
            form="product-pricing-group-form"
            disabled={isLoading}
            className="bg-gradient-to-r from-pink-600 to-orange-600 text-white font-bold border-0 hover:shadow-lg hover:shadow-pink-500/20 transition-all transform active:scale-95 px-8"
          >
            {isLoading
              ? t('productPricingGroupByManagement.saving', 'Kaydediliyor...')
              : t('productPricingGroupByManagement.save', 'Kaydet')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
