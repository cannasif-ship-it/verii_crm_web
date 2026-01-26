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
import { useExchangeRate } from '@/services/hooks/useExchangeRate';
import type { KurDto } from '@/services/erp-types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// İkonlar
import { 
  Search, 
  X, 
  Box, 
  Hash, 
  Coins, 
  Percent, 
  DollarSign,
  ArrowRight
} from 'lucide-react';

interface PricingRuleLineFormProps {
  line: PricingRuleLineFormState;
  onSave: (line: PricingRuleLineFormState) => void;
  onCancel: () => void;
}

// --- TASARIM SABİTLERİ ---
const INPUT_STYLE = `
  h-11 rounded-lg
  bg-slate-50 dark:bg-[#0c0516] 
  border border-slate-200 dark:border-white/10 
  text-slate-900 dark:text-white text-sm
  placeholder:text-slate-400 dark:placeholder:text-slate-600 
  
  focus-visible:ring-0 focus-visible:ring-offset-0 
  
  /* LIGHT MODE FOCUS */
  focus:bg-white 
  focus:border-pink-500 
  focus:shadow-[0_0_0_3px_rgba(236,72,153,0.15)] 

  /* DARK MODE FOCUS */
  dark:focus:bg-[#0c0516] 
  dark:focus:border-pink-500/60 
  dark:focus:shadow-[0_0_0_3px_rgba(236,72,153,0.1)]

  transition-all duration-200
`;

const READONLY_INPUT_STYLE = `
  h-11 rounded-lg
  bg-slate-100 dark:bg-white/5 
  border border-slate-200 dark:border-white/5 
  text-slate-500 dark:text-slate-400 text-sm
  cursor-not-allowed
`;

const LABEL_STYLE = "text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold ml-1 mb-1.5 block flex items-center gap-1.5";

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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-6 border border-slate-200 dark:border-white/10 rounded-2xl bg-white/50 dark:bg-white/5 shadow-sm backdrop-blur-sm animate-in fade-in zoom-in-95 duration-300">
        
        {/* 1. Ürün ve Miktar Bilgileri */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Stok Kodu (Tam Genişlik - Mobilde) */}
          <FormField
            control={form.control}
            name="stokCode"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2 lg:col-span-1">
                <FormLabel className={LABEL_STYLE}>
                  <Box size={12} className="text-pink-500" />
                  {t('pricingRule.lines.stokCode', 'Stok Kodu')} *
                </FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      {...field}
                      readOnly
                      placeholder={t('pricingRule.lines.stokCodePlaceholder', 'Ürün kodu')}
                      className={`${INPUT_STYLE} flex-1`}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setProductDialogOpen(true)}
                    title={t('pricingRule.lines.selectProduct', 'Ürün Seç')}
                    className="h-11 w-11 shrink-0 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"
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
                      className="h-11 w-11 shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <FormMessage className="text-red-500 text-[10px] mt-1" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={LABEL_STYLE}>
                  <Hash size={12} className="text-pink-500" />
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
                    className={INPUT_STYLE}
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-[10px] mt-1" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={LABEL_STYLE}>
                  <Hash size={12} className="text-pink-500" />
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
                    className={INPUT_STYLE}
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-[10px] mt-1" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currencyCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={LABEL_STYLE}>
                  <Coins size={12} className="text-pink-500" />
                  {t('pricingRule.lines.currencyCode', 'Döviz Tipi')} *
                </FormLabel>
                <Select
                  value={field.value !== undefined && field.value !== null ? String(field.value) : ''}
                  onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                  disabled={isLoadingRates}
                >
                  <FormControl>
                    <SelectTrigger className={INPUT_STYLE}>
                      <SelectValue placeholder={isLoadingRates ? t('pricingRule.loading', 'Yükleniyor...') : t('pricingRule.lines.selectCurrency', 'Seçiniz')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white dark:bg-[#1a1025] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white shadow-xl">
                    {exchangeRates.map((currency: KurDto) => (
                      <SelectItem key={currency.dovizTipi} value={String(currency.dovizTipi)}>
                        {currency.dovizIsmi ? `${currency.dovizIsmi} (${currency.dovizTipi})` : `Döviz (${currency.dovizTipi})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-500 text-[10px] mt-1" />
              </FormItem>
            )}
          />
        </div>

        <div className="border-t border-slate-200 dark:border-white/5 my-4" />

        {/* 2. Fiyat ve İndirimler */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
            
            <FormField
                control={form.control}
                name="fixedUnitPrice"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className={LABEL_STYLE}>
                    <DollarSign size={12} className="text-pink-500" />
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
                        className={INPUT_STYLE}
                    />
                    </FormControl>
                    <FormMessage className="text-red-500 text-[10px] mt-1" />
                </FormItem>
                )}
            />

            {/* İndirim 1 */}
            <div className="contents md:block lg:contents">
                <FormField
                    control={form.control}
                    name="discountRate1"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className={LABEL_STYLE}>
                        <Percent size={12} className="text-blue-500" />
                        {t('pricingRule.lines.discount1Rate', 'İndirim 1 (%)')}
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
                            className={INPUT_STYLE}
                        />
                        </FormControl>
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="discountAmount1"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className={LABEL_STYLE}>
                        <ArrowRight size={12} className="text-slate-400" />
                        {t('pricingRule.lines.discount1Amount', 'Tutar 1')}
                        </FormLabel>
                        <FormControl>
                        <Input
                            type="number"
                            {...field}
                            value={field.value ?? ''}
                            className={READONLY_INPUT_STYLE}
                            readOnly
                        />
                        </FormControl>
                    </FormItem>
                    )}
                />
            </div>

            {/* İndirim 2 ve 3 (Mobilde Alt Alta) */}
            <FormField
                control={form.control}
                name="discountRate2"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className={LABEL_STYLE}>
                    <Percent size={12} className="text-indigo-500" />
                    {t('pricingRule.lines.discount2Rate', 'İndirim 2 (%)')}
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
                        className={INPUT_STYLE}
                    />
                    </FormControl>
                </FormItem>
                )}
            />
            
            <FormField
                control={form.control}
                name="discountRate3"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className={LABEL_STYLE}>
                    <Percent size={12} className="text-purple-500" />
                    {t('pricingRule.lines.discount3Rate', 'İndirim 3 (%)')}
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
                        className={INPUT_STYLE}
                    />
                    </FormControl>
                </FormItem>
                )}
            />
        </div>

        {/* 3. Aksiyon Butonları */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-200 dark:border-white/5">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="w-full sm:w-auto bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
          >
            {t('pricingRule.form.cancel', 'İptal')}
          </Button>
          <Button 
            type="submit"
            disabled={!form.watch('stokCode') || form.watch('stokCode').trim() === ''}
            className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-orange-600 text-white font-bold border-0 hover:shadow-lg hover:shadow-pink-500/20 transition-all active:scale-95"
          >
            {t('pricingRule.form.save', 'Kaydet')}
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