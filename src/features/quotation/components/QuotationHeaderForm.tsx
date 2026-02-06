import { type ReactElement, useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check } from 'lucide-react';
import { VoiceSearchCombobox } from '@/components/shared/VoiceSearchCombobox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CustomerSelectDialog } from '@/components/shared/CustomerSelectDialog';
import { useShippingAddresses } from '../hooks/useShippingAddresses';
import { useQuotationRelatedUsers } from '../hooks/useQuotationRelatedUsers';
import { usePaymentTypes } from '../hooks/usePaymentTypes';
import { useExchangeRate } from '@/services/hooks/useExchangeRate';
import { useErpCustomers } from '@/services/hooks/useErpCustomers';
import { useCustomerOptions } from '@/features/customer-management/hooks/useCustomerOptions';
import { useCustomer } from '@/features/customer-management/hooks/useCustomer';
import { useAvailableDocumentSerialTypes } from '@/features/document-serial-type-management/hooks/useAvailableDocumentSerialTypes';
import { PricingRuleType } from '@/features/pricing-rule/types/pricing-rule-types';
import type { KurDto } from '@/services/erp-types';
import { ExchangeRateDialog } from './ExchangeRateDialog';
import { 
  Search, User, Truck, Briefcase, Globe, 
  Calendar, CreditCard, Hash, FileText, ArrowRightLeft, 
  Layers, SearchX, Coins
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import type { CreateQuotationSchema } from '../schemas/quotation-schema';
import type { QuotationExchangeRateFormState } from '../types/quotation-types';
import { cn } from '@/lib/utils';

interface QuotationHeaderFormProps {
  exchangeRates?: QuotationExchangeRateFormState[];
  onExchangeRatesChange?: (rates: QuotationExchangeRateFormState[]) => void;
  lines?: Array<{ productCode?: string | null; productName?: string | null }>;
  onLinesChange?: (lines: Array<{ productCode?: string | null; productName?: string | null }>) => void;
  initialCurrency?: string | number | null;
  revisionNo?: string | null;
  quotationId?: number | null;
  quotationOfferNo?: string | null;
  readOnly?: boolean;
}

export function QuotationHeaderForm({
  exchangeRates = [],
  onExchangeRatesChange,
  lines = [],
  onLinesChange,
  initialCurrency,
  // revisionNo,
  quotationId,
  quotationOfferNo,
  readOnly = false,
}: QuotationHeaderFormProps = {}): ReactElement {
  const { t } = useTranslation();
  const form = useFormContext<CreateQuotationSchema>();
  const { data: erpRates = [] } = useExchangeRate();
  const user = useAuthStore((state) => state.user);
  
  const [customerSelectDialogOpen, setCustomerSelectDialogOpen] = useState(false);
  const [exchangeRateDialogOpen, setExchangeRateDialogOpen] = useState(false);
  const [currencyChangeDialogOpen, setCurrencyChangeDialogOpen] = useState(false);
  const [pendingCurrency, setPendingCurrency] = useState<string | null>(null);
  const [customerComboboxOpen, setCustomerComboboxOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const isInitialLoadRef = useRef(true);

  const watchedCustomerId = form.watch('quotation.potentialCustomerId');
  const watchedErpCustomerCode = form.watch('quotation.erpCustomerCode');
  const watchedCurrency = form.watch('quotation.currency');
  const watchedRepresentativeId = form.watch('quotation.representativeId');

  const { data: shippingAddresses } = useShippingAddresses(watchedCustomerId || undefined);
  const { data: relatedUsers = [] } = useQuotationRelatedUsers(user?.id);
  const { data: paymentTypes } = usePaymentTypes();
  const { data: customerOptions = [] } = useCustomerOptions();
  const { data: erpCustomers = [] } = useErpCustomers();
  const { data: customer } = useCustomer(watchedCustomerId ?? 0);
  
  const customerTypeId = useMemo(() => {
    if (watchedErpCustomerCode) return 0;
    return customer?.customerTypeId ?? undefined;
  }, [watchedErpCustomerCode, customer?.customerTypeId]);
  
  const { data: availableDocumentSerialTypes = [] } = useAvailableDocumentSerialTypes(
    customerTypeId,
    watchedRepresentativeId ?? undefined,
    PricingRuleType.Quotation
  );

  const customerDisplayValue = useMemo(() => {
    if (watchedCustomerId) {
      const customer = customerOptions.find((c) => c.id === watchedCustomerId);
      if (customer) return customer.name;
      return `CRM: ${watchedCustomerId}`;
    }
    if (watchedErpCustomerCode) {
      const erpCustomer = erpCustomers.find((c) => c.cariKod === watchedErpCustomerCode);
      if (erpCustomer) return erpCustomer.cariIsim || watchedErpCustomerCode;
      return watchedErpCustomerCode;
    }
    return '';
  }, [watchedCustomerId, watchedErpCustomerCode, customerOptions, erpCustomers]);

  useEffect(() => {
    setCustomerSearchQuery(customerDisplayValue);
  }, [customerDisplayValue]);

  const allCustomerOptions = useMemo(() => {
    const crmOptions = customerOptions.map((c) => ({
      value: `crm-${c.id}`,
      label: c.name,
      type: 'crm' as const,
      id: c.id,
      code: c.customerCode,
    }));

    const erpOptions = erpCustomers.map((c) => ({
      value: `erp-${c.cariKod}`,
      label: c.cariIsim || c.cariKod,
      type: 'erp' as const,
      code: c.cariKod,
    }));

    return [...crmOptions, ...erpOptions];
  }, [customerOptions, erpCustomers]);

  const filteredCustomerOptions = useMemo(() => {
    if (!customerSearchQuery) return [];
    const lowerQuery = customerSearchQuery.toLowerCase();
    return allCustomerOptions.filter((option) => 
      option.label.toLowerCase().includes(lowerQuery) || 
      (option.code && option.code.toLowerCase().includes(lowerQuery))
    ).slice(0, 50); // Limit results for performance
  }, [allCustomerOptions, customerSearchQuery]);

  const handleComboboxSelect = (option: typeof allCustomerOptions[0]) => {
    if (option.type === 'crm') {
      form.setValue('quotation.potentialCustomerId', option.id);
      form.setValue('quotation.erpCustomerCode', null);
    } else {
      form.setValue('quotation.erpCustomerCode', option.code);
      form.setValue('quotation.potentialCustomerId', null);
    }
    setCustomerComboboxOpen(false);
  };

  useEffect(() => {
    const currentRepresentativeId = form.watch('quotation.representativeId');
    if (!currentRepresentativeId && user?.id) {
      form.setValue('quotation.representativeId', user.id);
    }
  }, [form, user]);

  useEffect(() => {
    if (initialCurrency !== null && initialCurrency !== undefined) {
      isInitialLoadRef.current = true;
      const timer = setTimeout(() => isInitialLoadRef.current = false, 1000);
      return () => clearTimeout(timer);
    }
  }, [initialCurrency]);

  useEffect(() => {
    if (watchedCurrency && initialCurrency !== null && initialCurrency !== undefined) {
      const watchedCurrencyNum = typeof watchedCurrency === 'string' ? Number(watchedCurrency) : watchedCurrency;
      const initialCurrencyNum = typeof initialCurrency === 'string' ? Number(initialCurrency) : initialCurrency;
      if (watchedCurrencyNum === initialCurrencyNum) {
        isInitialLoadRef.current = true;
        const timer = setTimeout(() => isInitialLoadRef.current = false, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [watchedCurrency, initialCurrency]);

  const selectedCustomer = watchedCustomerId || watchedErpCustomerCode;

  const handleExchangeRatesSave = (rates: QuotationExchangeRateFormState[]): void => {
    if (onExchangeRatesChange) onExchangeRatesChange(rates);
  };

  const handleCurrencyChange = (newCurrency: string): void => {
    const currentCurrency = form.watch('quotation.currency');
    const newCurrencyNum = Number(newCurrency);
    const currentCurrencyNum = typeof currentCurrency === 'string' ? Number(currentCurrency) : currentCurrency;
    
    if (isInitialLoadRef.current) {
      form.setValue('quotation.currency', newCurrency, { shouldValidate: false, shouldDirty: false });
      return;
    }
    
    if (initialCurrency !== null && initialCurrency !== undefined) {
      const initialCurrencyNum = typeof initialCurrency === 'string' ? Number(initialCurrency) : initialCurrency;
      if (initialCurrencyNum === newCurrencyNum) {
        form.setValue('quotation.currency', newCurrency, { shouldValidate: false, shouldDirty: false });
        return;
      }
    }
    
    if (currentCurrencyNum === newCurrencyNum) return;
    
    if (lines && lines.length > 0 && onLinesChange) {
      setPendingCurrency(newCurrency);
      setCurrencyChangeDialogOpen(true);
    } else {
      form.setValue('quotation.currency', newCurrency);
    }
  };

  const handleCurrencyChangeConfirm = (): void => {
    if (pendingCurrency && onLinesChange) {
      form.setValue('quotation.currency', pendingCurrency);
      onLinesChange(lines || []);
      setCurrencyChangeDialogOpen(false);
      setPendingCurrency(null);
    }
  };

  const handleCurrencyChangeCancel = (): void => {
    setCurrencyChangeDialogOpen(false);
    setPendingCurrency(null);
  };

  const styles = {
    glassCard: "relative overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl shadow-sm transition-all duration-300 hover:shadow-md",
    inputBase: "!pl-12 h-11 bg-white dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow transition-all duration-300 ease-out focus-visible:border-pink-500 focus-visible:ring-4 focus-visible:ring-pink-500/20 w-full",
    label: "text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 pl-1 flex items-center gap-1.5",
    iconWrapper: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-pink-600 dark:group-focus-within:text-pink-500 pointer-events-none z-10 flex items-center justify-center",
  };

  const forcePaddingStyle = { paddingLeft: '3rem' };

  return (
    <div className="relative space-y-6 pt-2 pb-8 animate-in fade-in slide-in-from-bottom-3 duration-700">
      <div className="absolute -top-10 -left-10 w-96 h-96 bg-pink-500/10 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute top-20 right-0 w-80 h-80 bg-orange-500/5 blur-[80px] pointer-events-none rounded-full" />
      
      {/* Top Section: Main Info (Full Width) */}
      <div className={cn(styles.glassCard, "flex flex-col")}>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column: Document Details */}
            <div className="flex flex-col gap-6">
              {/* Document Details Header */}
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                  <FileText className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-200">Belge Detayı</h4>
              </div>

              <div className="grid grid-cols-1 gap-6">
                 <div>
                   <FormField
                    control={form.control}
                    name="quotation.documentSerialTypeId"
                    render={({ field }) => (
                      <FormItem className="space-y-0 relative group">
                        <FormLabel className={styles.label}>Seri No</FormLabel>
                        <div className="relative">
                          <div className={styles.iconWrapper}><Hash className="h-4 w-4" /></div>
                          <VoiceSearchCombobox
                            className={styles.inputBase}
                            value={field.value?.toString() || ''}
                            onSelect={(value) => field.onChange(value ? Number(value) : null)}
                            options={availableDocumentSerialTypes
                              .filter((d) => d.serialPrefix?.trim() !== '')
                              .map((d) => ({
                                value: d.id.toString(),
                                label: d.serialPrefix || ''
                              }))}
                            placeholder={t('quotation.select', 'Seç')}
                            searchPlaceholder={t('common.search', 'Ara...')}
                            disabled={readOnly || customerTypeId === undefined || !watchedRepresentativeId}
                          />
                        </div>
                        <FormMessage className="mt-1" />
                      </FormItem>
                    )}
                  />
                 </div>

                 <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="quotation.description"
                    render={({ field }) => (
                      <FormItem className="space-y-0 relative group h-full">
                        <FormLabel className={styles.label}>
                          Notlar
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value || ''}
                            placeholder={t('quotation.header.descriptionPlaceholder', 'Özel koşullar...')}
                            className="min-h-[120px] h-full rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/30 resize-none focus-visible:border-pink-500 focus-visible:ring-4 focus-visible:ring-pink-500/20 transition-all text-sm py-2.5"
                            disabled={readOnly}
                          />
                        </FormControl>
                        <FormMessage className="mt-1" />
                      </FormItem>
                    )}
                  />
                 </div>
              </div>
            </div>

            {/* Right Column: Customer & Sales Info */}
            <div className="flex flex-col gap-6">
              {/* Main Info Header */}
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  <User className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                  {t('quotation.header.mainInfo', 'Müşteri & Satış Bilgileri')}
                </h4>
              </div>

              <div className="space-y-6">
                {/* Customer Account */}
                <div>
                  <FormField
                    control={form.control}
                    name="quotation.potentialCustomerId"
                    render={() => (
                      <FormItem className="space-y-0 relative group">
                        <FormLabel className={styles.label}>
                          {t('quotation.header.customer', 'Müşteri Hesabı')} <span className="text-pink-500">*</span>
                        </FormLabel>
                        <div className="flex gap-2">
                          <div className="relative flex-1 group">
                            <div className={cn(styles.iconWrapper, "pointer-events-none")}>
                              <User className="h-4 w-4" />
                            </div>
                            <FormControl>
                              <Input
                                className={cn(styles.inputBase, "font-semibold text-zinc-900 dark:text-zinc-100 z-10 relative caret-pink-500")}
                                style={forcePaddingStyle}
                                value={customerSearchQuery}
                                onChange={(e) => {
                                  setCustomerSearchQuery(e.target.value);
                                  if (!customerComboboxOpen) setCustomerComboboxOpen(true);
                                }}
                                onFocus={() => setCustomerComboboxOpen(true)}
                                onBlur={() => {
                                  setTimeout(() => {
                                    if (customerSearchQuery !== customerDisplayValue) {
                                      if (!customerSearchQuery.trim()) {
                                        form.setValue('quotation.potentialCustomerId', null);
                                        form.setValue('quotation.erpCustomerCode', null);
                                      } else {
                                        setCustomerSearchQuery(customerDisplayValue);
                                      }
                                    }
                                  }, 200);
                                }}
                                placeholder={t('quotation.header.selectCustomer', 'Müşteri ara veya seç...')}
                                disabled={readOnly}
                                autoComplete="off"
                              />
                            </FormControl>
                            <Popover open={customerComboboxOpen} onOpenChange={setCustomerComboboxOpen}>
                              <PopoverTrigger asChild>
                                <div className="absolute top-full left-0 w-full h-0" />
                              </PopoverTrigger>
                              <PopoverContent 
                                className="p-0 w-[400px] max-h-[350px] overflow-hidden bg-white/90 dark:bg-[#0c0516]/95 backdrop-blur-2xl border border-zinc-200/50 dark:border-white/10 shadow-2xl rounded-2xl ring-1 ring-black/5" 
                                align="start"
                                sideOffset={8}
                                onOpenAutoFocus={(e) => e.preventDefault()}
                              >
                                <Command shouldFilter={false} className="bg-transparent">
                                  <CommandList className="max-h-[350px] overflow-y-auto p-1 custom-scrollbar">
                                    {filteredCustomerOptions.length === 0 && (
                                      <CommandEmpty className="py-10 text-center flex flex-col items-center justify-center gap-3">
                                        <div className="p-3 rounded-full bg-zinc-100 dark:bg-white/5 text-zinc-400 dark:text-zinc-500">
                                          <SearchX className="w-6 h-6" />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
                                            {t('common.noResults', 'Sonuç bulunamadı')}
                                          </span>
                                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                            {t('quotation.header.tryDifferentSearch', 'Farklı bir arama terimi deneyin')}
                                          </span>
                                        </div>
                                      </CommandEmpty>
                                    )}
                                    <CommandGroup>
                                      {filteredCustomerOptions.map((option) => (
                                        <CommandItem
                                          key={option.value}
                                          value={option.value}
                                          onSelect={() => handleComboboxSelect(option)}
                                          className="cursor-pointer mb-1 last:mb-0 rounded-xl px-3 py-2.5 aria-selected:bg-pink-50 dark:aria-selected:bg-pink-500/10 aria-selected:text-pink-700 dark:aria-selected:text-pink-300 transition-colors"
                                        >
                                          <Check
                                            className={cn(
                                              "mr-3 h-4 w-4 shrink-0 transition-opacity",
                                              ((option.type === 'crm' && watchedCustomerId === option.id) || (option.type === 'erp' && watchedErpCustomerCode === option.code))
                                                ? "opacity-100 text-pink-600 dark:text-pink-400"
                                                : "opacity-0"
                                            )}
                                          />
                                          <div className="flex flex-col gap-0.5">
                                            <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{option.label}</span>
                                            {option.code && (
                                              <div className="flex items-center gap-2">
                                                <span className={cn(
                                                  "text-[10px] px-1.5 py-0.5 rounded-md font-medium border",
                                                  option.type === 'erp' 
                                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border-blue-100 dark:border-blue-800/30" 
                                                    : "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 border-purple-100 dark:border-purple-800/30"
                                                )}>
                                                  {option.type === 'erp' ? 'ERP' : 'CRM'}
                                                </span>
                                                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                                                  {option.code}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <Button
                            type="button"
                            onClick={() => setCustomerSelectDialogOpen(true)}
                            disabled={readOnly}
                            className="h-11 px-6 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white shadow-md hover:shadow-lg transition-all border border-zinc-800 active:scale-95"
                          >
                            <Search className="h-4 w-4 mr-2" />
                            {t('quotation.guide', 'Rehber')}
                          </Button>
                        </div>
                        <FormMessage className="mt-1.5" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Representative */}
                <div>
                  <FormField
                    control={form.control}
                    name="quotation.representativeId"
                    render={({ field }) => (
                      <FormItem className="space-y-0 relative group">
                        <FormLabel className={styles.label}>
                          {t('quotation.header.representative', 'Satış Temsilcisi')}
                        </FormLabel>
                        <div className="relative">
                            <div className={styles.iconWrapper}><Briefcase className="h-4 w-4" /></div>
                            <VoiceSearchCombobox
                              className={styles.inputBase}
                              value={field.value?.toString() || ''}
                              onSelect={(value) => field.onChange(value ? Number(value) : null)}
                              options={relatedUsers.map((u) => ({
                               value: u.userId.toString(),
                               label: [u.firstName, u.lastName].filter(Boolean).join(' ')
                              }))}
                              placeholder={t('quotation.select', 'Seçiniz')}
                              searchPlaceholder={t('common.search', 'Ara...')}
                              disabled={readOnly}
                            />
                        </div>
                        <FormMessage className="mt-1.5" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Shipping Address - Conditional */}
                {selectedCustomer && (
                  <div className="animate-in slide-in-from-top-2 fade-in duration-500">
                    <FormField
                      control={form.control}
                      name="quotation.shippingAddressId"
                      render={({ field }) => (
                        <FormItem className="space-y-0 relative group">
                          <FormLabel className={styles.label}>
                              <Truck className="h-3.5 w-3.5 text-orange-500" />
                            {t('quotation.header.shippingAddress', 'Sevk Adresi')}
                          </FormLabel>
                          <div className="relative">
                              <div className={styles.iconWrapper}><Truck className="h-4 w-4" /></div>
                              <VoiceSearchCombobox
                                className={cn(styles.inputBase, "bg-orange-50/30 dark:bg-orange-950/10 border-orange-100 dark:border-orange-900/30")}
                                value={field.value?.toString() || ''}
                                onSelect={(value) => field.onChange(value ? Number(value) : null)}
                                options={shippingAddresses.map((address) => ({
                                  value: address.id.toString(),
                                  label: address.addressText
                                }))}
                                placeholder={t('quotation.header.selectShippingAddress', 'Sevk adresi seçin')}
                                searchPlaceholder={t('common.search', 'Ara...')}
                                disabled={readOnly}
                              />
                          </div>
                          <FormMessage className="mt-1.5" />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Left Column: Type & Dates */}
        <div className={cn(styles.glassCard, "flex flex-col")}>
            <div className="p-5 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-md bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
                  <Globe className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-200">Tip & Tarihler</h4>
              </div>

              <div className="space-y-4 flex-1">
                <FormField
                  control={form.control}
                  name="quotation.offerType"
                  render={({ field }) => (
                    <FormItem className="space-y-0 relative group">
                      <FormLabel className={styles.label}>
                        Teklif Tipi <span className="text-pink-500 ml-0.5">*</span>
                      </FormLabel>
                      <div className="relative">
                         <div className={styles.iconWrapper}><Layers className="h-4 w-4" /></div>
                         <VoiceSearchCombobox
                           className={styles.inputBase}
                           value={field.value || ''}
                           onSelect={(value) => field.onChange(value)}
                           options={[
                             { value: 'Domestic', label: t('quotation.offerType.domestic', 'Yurtiçi') },
                             { value: 'Export', label: t('quotation.offerType.export', 'Yurtdışı') }
                           ]}
                           placeholder={t('quotation.select', 'Seçiniz')}
                           searchPlaceholder={t('common.search', 'Ara...')}
                           disabled={readOnly}
                         />
                      </div>
                      <FormMessage className="mt-1" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quotation.offerDate"
                    render={({ field }) => (
                      <FormItem className="space-y-0 relative group">
                        <FormLabel className={styles.label}>Teklif T.</FormLabel>
                        <div className="relative">
                          <div className={styles.iconWrapper}><Calendar className="h-4 w-4" /></div>
                          <FormControl>
                            <Input 
                              type="date" 
                              className={cn(styles.inputBase, "text-xs")} 
                              style={forcePaddingStyle}
                              {...field}
                              value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                              onChange={(e) => field.onChange(e.target.value)}
                              disabled={readOnly}
                            />
                          </FormControl>
                        </div>
                        <FormMessage className="mt-1" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quotation.deliveryDate"
                    render={({ field }) => (
                      <FormItem className="space-y-0 relative group">
                        <FormLabel className={styles.label}>Teslim T.</FormLabel>
                        <div className="relative">
                          <div className={styles.iconWrapper}><Truck className="h-4 w-4" /></div>
                          <FormControl>
                            <Input 
                              type="date" 
                              className={cn(styles.inputBase, "text-xs")}
                              style={forcePaddingStyle}
                              {...field}
                              value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                              onChange={(e) => field.onChange(e.target.value)}
                              disabled={readOnly}
                            />
                          </FormControl>
                        </div>
                        <FormMessage className="mt-1" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
        </div>

        {/* Right Column: Financial */}
        <div className={cn(styles.glassCard, "flex flex-col")}>
            <div className="p-5 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  Finansal
                </h4>
                {onExchangeRatesChange && (
                   <Button
                     type="button"
                     variant="ghost"
                     size="sm"
                     onClick={() => setExchangeRateDialogOpen(true)}
                     className="h-7 px-2 text-xs font-medium text-pink-600 hover:text-pink-700 hover:bg-pink-50 dark:hover:bg-pink-900/20"
                   >
                     <ArrowRightLeft className="w-3.5 h-3.5 mr-1" />
                     Kurlar
                   </Button>
                 )}
              </div>

              <div className="space-y-4 flex-1">
                <FormField
                  control={form.control}
                  name="quotation.currency"
                  render={({ field }) => (
                    <FormItem className="space-y-0 relative group">
                      <FormLabel className={styles.label}>Para Birimi</FormLabel>
                      <div className="relative">
                        <div className={styles.iconWrapper}><Coins className="h-4 w-4 text-emerald-500" /></div>
                        <VoiceSearchCombobox
                          className={cn(styles.inputBase, "font-bold tracking-wide text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30")}
                          value={field.value ? String(field.value) : ''}
                          onSelect={(value) => value && handleCurrencyChange(value)}
                          options={erpRates.map((currency: KurDto) => ({
                            value: String(currency.dovizTipi),
                            label: currency.dovizIsmi || `Döviz ${currency.dovizTipi}`
                          }))}
                          placeholder={t('quotation.select', 'Seçiniz')}
                          searchPlaceholder={t('common.search', 'Ara...')}
                          disabled={readOnly}
                        />
                      </div>
                      <FormMessage className="mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quotation.paymentTypeId"
                  render={({ field }) => (
                    <FormItem className="space-y-0 relative group">
                      <FormLabel className={styles.label}>Ödeme Planı</FormLabel>
                      <div className="relative">
                         <div className={styles.iconWrapper}><CreditCard className="h-4 w-4" /></div>
                         <VoiceSearchCombobox
                           className={styles.inputBase}
                           value={field.value?.toString() || ''}
                           onSelect={(value) => field.onChange(value ? Number(value) : null)}
                           options={paymentTypes.map((pt) => ({
                             value: pt.id.toString(),
                             label: pt.name
                           }))}
                           placeholder={t('quotation.select', 'Seçiniz')}
                           searchPlaceholder={t('common.search', 'Ara...')}
                           disabled={readOnly}
                         />
                      </div>
                      <FormMessage className="mt-1" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
        </div>

      </div>

      <CustomerSelectDialog
        open={customerSelectDialogOpen}
        onOpenChange={setCustomerSelectDialogOpen}
        onSelect={(result) => {
          if (result.customerId) {
            form.setValue('quotation.potentialCustomerId', result.customerId);
            form.setValue('quotation.erpCustomerCode', null);
          } else if (result.erpCustomerCode) {
            form.setValue('quotation.potentialCustomerId', null);
            form.setValue('quotation.erpCustomerCode', result.erpCustomerCode);
          }
        }}
      />

      {exchangeRates !== undefined && onExchangeRatesChange && (
        <ExchangeRateDialog
          open={exchangeRateDialogOpen}
          onOpenChange={setExchangeRateDialogOpen}
          exchangeRates={exchangeRates}
          onSave={handleExchangeRatesSave}
          lines={lines}
          currentCurrency={watchedCurrency ? (typeof watchedCurrency === 'string' ? Number(watchedCurrency) : watchedCurrency) : undefined}
          quotationId={quotationId}
          quotationOfferNo={quotationOfferNo}
          readOnly={readOnly}
        />
      )}

      <Dialog open={currencyChangeDialogOpen} onOpenChange={setCurrencyChangeDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white/80 dark:bg-[#0c0516]/80 backdrop-blur-xl border-slate-200 dark:border-white/10 p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="px-6 py-5 border-b border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
            <DialogTitle className="flex items-center gap-3 text-slate-900 dark:text-white text-lg">
              <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-2.5 rounded-xl shadow-lg shadow-pink-500/20 text-white">
                <ArrowRightLeft className="h-5 w-5" />
              </div>
              {t('quotation.header.currencyChange.title', 'Kur Değişikliği')}
            </DialogTitle>
            <DialogDescription className="pt-2 text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              {t('quotation.header.currencyChange.message', 'Para birimi değişikliği tüm satırları etkileyecektir. Devam etmek istiyor musunuz?')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 p-6 bg-slate-50/30 dark:bg-black/20">
            <Button 
              variant="outline" 
              onClick={handleCurrencyChangeCancel} 
              className="h-11 px-6 rounded-xl border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-medium transition-all"
            >
              {t('quotation.cancel', 'Vazgeç')}
            </Button>
            <Button 
              onClick={handleCurrencyChangeConfirm} 
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 border-0 font-medium transition-all"
            >
              {t('quotation.confirm', 'Onayla')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}