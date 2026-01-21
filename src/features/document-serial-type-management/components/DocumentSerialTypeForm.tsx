import { type ReactElement, useEffect } from 'react';
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
import { documentSerialTypeFormSchema, type DocumentSerialTypeFormSchema } from '../types/document-serial-type-types';
import type { DocumentSerialTypeDto } from '../types/document-serial-type-types';
import { PricingRuleType } from '@/features/pricing-rule/types/pricing-rule-types';
import { useCustomerTypeOptions } from '../hooks/useCustomerTypeOptions';
import { useSalesRepOptions } from '../hooks/useSalesRepOptions';

interface DocumentSerialTypeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DocumentSerialTypeFormSchema) => void | Promise<void>;
  documentSerialType?: DocumentSerialTypeDto | null;
  isLoading?: boolean;
}

export function DocumentSerialTypeForm({
  open,
  onOpenChange,
  onSubmit,
  documentSerialType,
  isLoading = false,
}: DocumentSerialTypeFormProps): ReactElement {
  const { t } = useTranslation();
  const { data: customerTypeOptions = [] } = useCustomerTypeOptions();
  const { data: salesRepOptions = [] } = useSalesRepOptions();

  const form = useForm<DocumentSerialTypeFormSchema>({
    resolver: zodResolver(documentSerialTypeFormSchema),
    defaultValues: {
      ruleType: PricingRuleType.Demand,
      customerTypeId: null,
      salesRepId: null,
      serialPrefix: '',
      serialLength: 1,
      serialStart: 0,
      serialCurrent: 0,
      serialIncrement: 1,
    },
  });

  useEffect(() => {
    if (documentSerialType) {
      form.reset({
        ruleType: documentSerialType.ruleType,
        customerTypeId: documentSerialType.customerTypeId ?? null,
        salesRepId: documentSerialType.salesRepId ?? null,
        serialPrefix: documentSerialType.serialPrefix ?? '',
        serialLength: documentSerialType.serialLength ?? 1,
        serialStart: documentSerialType.serialStart ?? 0,
        serialCurrent: documentSerialType.serialCurrent ?? 0,
        serialIncrement: documentSerialType.serialIncrement ?? 1,
      });
    } else {
      form.reset({
        ruleType: PricingRuleType.Demand,
        customerTypeId: null,
        salesRepId: null,
        serialPrefix: '',
        serialLength: 1,
        serialStart: 0,
        serialCurrent: 0,
        serialIncrement: 1,
      });
    }
  }, [documentSerialType, form]);

  const handleSubmit = async (data: DocumentSerialTypeFormSchema): Promise<void> => {
    await onSubmit(data);
    if (!isLoading) {
      form.reset();
      onOpenChange(false);
    }
  };

  const inputClass = "h-11 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm focus-visible:border-pink-500 focus-visible:ring-4 focus-visible:ring-pink-500/20 transition-all duration-300";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 shadow-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl ring-1 ring-zinc-200 dark:ring-zinc-800">
        <DialogHeader className="p-6 pb-2 space-y-1">
          <DialogTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-foreground">
            {documentSerialType
              ? t('documentSerialType.form.editTitle', 'Dosya Tipi Düzenle')
              : t('documentSerialType.form.addTitle', 'Yeni Dosya Tipi Ekle')}
          </DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-muted-foreground text-base">
            {documentSerialType
              ? t('documentSerialType.form.editDescription', 'Dosya tipi bilgilerini düzenleyin')
              : t('documentSerialType.form.addDescription', 'Yeni dosya tipi bilgilerini girin')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-6 pt-2">
            <FormField
              control={form.control}
              name="ruleType"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {t('documentSerialType.form.ruleType', 'Kural Tipi')} *
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className={inputClass}>
                        <SelectValue placeholder={t('documentSerialType.form.selectRuleType', 'Kural tipi seçin')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={PricingRuleType.Demand.toString()}>
                        {t('pricingRule.ruleType.demand', 'Talep')}
                      </SelectItem>
                      <SelectItem value={PricingRuleType.Quotation.toString()}>
                        {t('pricingRule.ruleType.quotation', 'Teklif')}
                      </SelectItem>
                      <SelectItem value={PricingRuleType.Order.toString()}>
                        {t('pricingRule.ruleType.order', 'Sipariş')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerTypeId"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {t('documentSerialType.form.customerType', 'Müşteri Tipi')}
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value && value !== '0' ? parseInt(value) : null)}
                    value={field.value && field.value !== null ? field.value.toString() : '0'}
                  >
                    <FormControl>
                      <SelectTrigger className={inputClass}>
                        <SelectValue placeholder={t('documentSerialType.form.selectCustomerType', 'Müşteri tipi seçin (opsiyonel)')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">
                        {t('documentSerialType.form.noCustomerTypeSelected', 'Müşteri tipi seçilmedi')}
                      </SelectItem>
                      {customerTypeOptions.map((customerType) => (
                        <SelectItem key={customerType.id} value={customerType.id.toString()}>
                          {customerType.name}
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
              name="salesRepId"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {t('documentSerialType.form.salesRep', 'Satış Temsilcisi')}
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value && value !== '0' ? parseInt(value) : null)}
                    value={field.value && field.value !== null ? field.value.toString() : '0'}
                  >
                    <FormControl>
                      <SelectTrigger className={inputClass}>
                        <SelectValue placeholder={t('documentSerialType.form.selectSalesRep', 'Satış temsilcisi seçin (opsiyonel)')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">
                        {t('documentSerialType.form.noSalesRepSelected', 'Satış temsilcisi seçilmedi')}
                      </SelectItem>
                      {salesRepOptions.map((salesRep) => (
                        <SelectItem key={salesRep.id} value={salesRep.id.toString()}>
                          {salesRep.fullName}
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
              name="serialPrefix"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {t('documentSerialType.form.serialPrefix', 'Seri Öneki')} *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value}
                      className={inputClass}
                      placeholder={t('documentSerialType.form.serialPrefixPlaceholder', 'Seri önekini girin')}
                      maxLength={50}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serialLength"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {t('documentSerialType.form.serialLength', 'Seri Uzunluğu')} *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 1)}
                      placeholder={t('documentSerialType.form.serialLengthPlaceholder', 'Seri uzunluğunu girin')}
                      className={inputClass}
                      min={1}
                      max={100}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serialStart"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {t('documentSerialType.form.serialStart', 'Seri Başlangıç')} *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                      placeholder={t('documentSerialType.form.serialStartPlaceholder', 'Seri başlangıç değerini girin')}
                      className={inputClass}
                      min={0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serialCurrent"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {t('documentSerialType.form.serialCurrent', 'Seri Mevcut')} *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                      placeholder={t('documentSerialType.form.serialCurrentPlaceholder', 'Mevcut seri değerini girin')}
                      className={inputClass}
                      min={0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serialIncrement"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {t('documentSerialType.form.serialIncrement', 'Seri Artış')} *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 1)}
                      placeholder={t('documentSerialType.form.serialIncrementPlaceholder', 'Seri artış değerini girin')}
                      className={inputClass}
                      min={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="h-11 px-6 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              >
                {t('common.cancel', 'İptal')}
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="h-11 px-8 bg-gradient-to-r from-pink-600 to-orange-600 text-white font-semibold shadow-lg shadow-pink-500/20 hover:scale-[1.02] transition-transform"
              >
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
