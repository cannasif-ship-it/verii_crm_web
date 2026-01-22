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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useShippingAddresses, useUsers, usePaymentTypes } from '../api/quotation-api';
import { useExchangeRate } from '@/services/hooks/useExchangeRate';
import { useErpCustomers } from '@/services/hooks/useErpCustomers';
import { useCustomerOptions } from '@/features/customer-management/hooks/useCustomerOptions';
import { useCustomer } from '@/features/customer-management/hooks/useCustomer';
import { useAvailableDocumentSerialTypes } from '@/features/document-serial-type-management/hooks/useAvailableDocumentSerialTypes';
import { PricingRuleType } from '@/features/pricing-rule/types/pricing-rule-types';
import type { KurDto } from '@/services/erp-types';
import { ExchangeRateDialog } from './ExchangeRateDialog';
import { 
  DollarSign, Search, User, Truck, Briefcase, Globe, 
  Calendar, CreditCard, Hash, FileText, ArrowRightLeft, 
  Layers, Quote
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
}

export function QuotationHeaderForm({ 
  exchangeRates = [],
  onExchangeRatesChange,
  lines = [],
  onLinesChange,
  initialCurrency,
  revisionNo,
}: QuotationHeaderFormProps = {}): ReactElement {
  const { t } = useTranslation();
  const form = useFormContext<CreateQuotationSchema>();
  const { data: erpRates = [] } = useExchangeRate();
  const user = useAuthStore((state) => state.user);
  
  // State Management
  const [customerSelectDialogOpen, setCustomerSelectDialogOpen] = useState(false);
  const [exchangeRateDialogOpen, setExchangeRateDialogOpen] = useState(false);
  const [currencyChangeDialogOpen, setCurrencyChangeDialogOpen] = useState(false);
  const [pendingCurrency, setPendingCurrency] = useState<string | null>(null);
  const isInitialLoadRef = useRef(true);

  // Watchers
  const watchedCustomerId = form.watch('quotation.potentialCustomerId');
  const watchedErpCustomerCode = form.watch('quotation.erpCustomerCode');
  const watchedCurrency = form.watch('quotation.currency');
  const watchedRepresentativeId = form.watch('quotation.representativeId');

  // Queries
  const { data: shippingAddresses } = useShippingAddresses(watchedCustomerId || undefined);
  const { data: users } = useUsers();
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
      if (customer) return `CRM: ${watchedCustomerId} / ${customer.name}`;
      return `CRM: ${watchedCustomerId}`;
    }
    if (watchedErpCustomerCode) {
      const erpCustomer = erpCustomers.find((c) => c.cariKod === watchedErpCustomerCode);
      if (erpCustomer) return `ERP: ${watchedErpCustomerCode} / ${erpCustomer.cariIsim || watchedErpCustomerCode}`;
      return `ERP: ${watchedErpCustomerCode}`;
    }
    return '';
  }, [watchedCustomerId, watchedErpCustomerCode, customerOptions, erpCustomers]);

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

  // --- 🎨 TASARIM SİSTEMİ (The Recipe) ---
  const styles = {
    // Cam etkisi ve kart yapısı
    glassCard: "relative overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl shadow-sm transition-all duration-300 hover:shadow-md",
    
    // Özel Input Stili (Signature Ring)
    // ÖNEMLİ: "pl-10" class'ı input textinin soldan 2.5rem içeriden başlamasını sağlar. İkon buraya oturur.
    inputBase: "pl-10 h-11 bg-white dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow transition-all duration-300 ease-out focus-visible:border-pink-500 focus-visible:ring-4 focus-visible:ring-pink-500/20 w-full",
    
    // Etiketler
    label: "text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 pl-1 flex items-center gap-1.5",
    
    // İkonlar (Grup focus olduğunda pembeleşir)
    // pointer-events-none: İkonun üzerine tıklansa bile tıklamanın input'a geçmesini sağlar.
    iconWrapper: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-pink-600 dark:group-focus-within:text-pink-500 pointer-events-none z-10 flex items-center justify-center",
  };

  return (
    <div className="relative space-y-6 pt-2 pb-8 animate-in fade-in slide-in-from-bottom-3 duration-700">
      
      {/* Background Decorative Glows */}
      <div className="absolute -top-10 -left-10 w-96 h-96 bg-pink-500/10 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute top-20 right-0 w-80 h-80 bg-orange-500/5 blur-[80px] pointer-events-none rounded-full" />

      {/* HEADER */}
      <div className="relative z-10 flex items-center gap-3 mb-6 px-1">
        <div className="p-2.5 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg shadow-pink-500/30 text-white">
           <Quote className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            {t('quotation.header.title', 'Teklif Detayları')}
            {revisionNo && (
              <span className="px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-[10px] font-bold border border-pink-200 dark:border-pink-800">
                REV-{revisionNo}
              </span>
            )}
          </h2>
          <p className="text-xs text-zinc-500 font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse shadow-[0_0_6px_rgba(236,72,153,0.8)]" />
            {t('quotation.header.subtitle', 'Müşteri ve finansal bilgileri buradan yönetebilirsiniz.')}
          </p>
        </div>
      </div>

      {/* 1. MÜŞTERİ KARTI (Hero Section) */}
      <div className={styles.glassCard}>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
            
            {/* Müşteri Seçimi */}
            <div className="lg:col-span-8">
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
                        <div className={styles.iconWrapper}>
                          <User className="h-4 w-4" />
                        </div>
                        <FormControl>
                          <Input
                            className={cn(styles.inputBase, "font-semibold text-zinc-800 dark:text-zinc-100")}
                            value={customerDisplayValue}
                            placeholder={t('quotation.header.selectCustomer', 'Müşteri seçiniz...')}
                            readOnly
                            onClick={() => setCustomerSelectDialogOpen(true)}
                          />
                        </FormControl>
                      </div>
                      <Button
                        type="button"
                        onClick={() => setCustomerSelectDialogOpen(true)}
                        className="h-11 px-6 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white shadow-md hover:shadow-lg transition-all border border-zinc-800 active:scale-95"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        {t('common.select', 'Seç')}
                      </Button>
                    </div>
                    <FormMessage className="mt-1.5" />
                  </FormItem>
                )}
              />
            </div>

            {/* Temsilci Seçimi */}
            <div className="lg:col-span-4">
              <FormField
                control={form.control}
                name="quotation.representativeId"
                render={({ field }) => (
                  <FormItem className="space-y-0 relative group">
                    <FormLabel className={styles.label}>
                      {t('quotation.header.representative', 'Satış Temsilcisi')}
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                      value={field.value?.toString() || ''}
                    >
                      <FormControl>
                        <div className="relative">
                           <div className={styles.iconWrapper}><Briefcase className="h-4 w-4" /></div>
                           <SelectTrigger className={styles.inputBase}>
                             <SelectValue placeholder={t('common.select', 'Seçiniz')} />
                           </SelectTrigger>
                        </div>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>{user.fullName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="mt-1.5" />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Sevk Adresi (Varsa görünür) */}
            {selectedCustomer && (
              <div className="lg:col-span-12 animate-in slide-in-from-top-2 fade-in duration-500">
                <FormField
                  control={form.control}
                  name="quotation.shippingAddressId"
                  render={({ field }) => (
                    <FormItem className="space-y-0 relative group">
                      <FormLabel className={styles.label}>
                         <Truck className="h-3.5 w-3.5 text-orange-500" />
                        {t('quotation.header.shippingAddress', 'Sevk Adresi')}
                      </FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                        value={field.value?.toString() || ''}
                      >
                        <FormControl>
                          <div className="relative">
                             <div className={styles.iconWrapper}><Truck className="h-4 w-4" /></div>
                             <SelectTrigger className={cn(styles.inputBase, "bg-orange-50/30 dark:bg-orange-950/10 border-orange-100 dark:border-orange-900/30")}>
                               <SelectValue placeholder={t('quotation.header.selectShippingAddress', 'Sevk adresi seçin')} />
                             </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent>
                          {shippingAddresses.map((address) => (
                            <SelectItem key={address.id} value={address.id.toString()}>
                              {address.addressText}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="mt-1.5" />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. DETAYLAR GRID'İ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SOL: FİNANSAL BİLGİLER */}
        <div className={styles.glassCard}>
          <div className="p-5 h-full flex flex-col">
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
              {/* Para Birimi */}
              <FormField
                control={form.control}
                name="quotation.currency"
                render={({ field }) => (
                  <FormItem className="space-y-0 relative group">
                    <FormLabel className={styles.label}>Para Birimi</FormLabel>
                    <Select
                      onValueChange={(value) => handleCurrencyChange(value)}
                      value={field.value ? String(field.value) : ''}
                    >
                      <FormControl>
                        <div className="relative">
                          <div className={styles.iconWrapper}><DollarSign className="h-4 w-4 text-emerald-600" /></div>
                          <SelectTrigger className={cn(styles.inputBase, "font-bold tracking-wide text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30")}>
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </div>
                      </FormControl>
                      <SelectContent>
                        {erpRates.map((currency: KurDto) => (
                          <SelectItem key={currency.dovizTipi} value={String(currency.dovizTipi)}>
                            {currency.dovizIsmi || `Döviz ${currency.dovizTipi}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="mt-1" />
                  </FormItem>
                )}
              />

              {/* Ödeme Tipi */}
              <FormField
                control={form.control}
                name="quotation.paymentTypeId"
                render={({ field }) => (
                  <FormItem className="space-y-0 relative group">
                    <FormLabel className={styles.label}>Ödeme Planı</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                      value={field.value?.toString() || ''}
                    >
                      <FormControl>
                        <div className="relative">
                           <div className={styles.iconWrapper}><CreditCard className="h-4 w-4" /></div>
                           <SelectTrigger className={styles.inputBase}>
                             <SelectValue placeholder={t('common.select', 'Seçiniz')} />
                           </SelectTrigger>
                        </div>
                      </FormControl>
                      <SelectContent>
                        {paymentTypes.map((pt) => (
                          <SelectItem key={pt.id} value={pt.id.toString()}>{pt.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="mt-1" />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* ORTA: LOJİSTİK & TİP */}
        <div className={styles.glassCard}>
          <div className="p-5 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600">
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
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                         <div className="relative">
                            <div className={styles.iconWrapper}><Layers className="h-4 w-4" /></div>
                            <SelectTrigger className={styles.inputBase}>
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                         </div>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Domestic">{t('quotation.offerType.domestic', 'Yurtiçi')}</SelectItem>
                        <SelectItem value="Export">{t('quotation.offerType.export', 'Yurtdışı')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="mt-1" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
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
                            className={cn(styles.inputBase, "pl-10 text-xs")} 
                            {...field}
                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(e.target.value)}
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
                            className={cn(styles.inputBase, "pl-10 text-xs")}
                            {...field}
                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(e.target.value)}
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

        {/* SAĞ: BELGE & NOTLAR */}
        <div className={styles.glassCard}>
           <div className="p-5 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                  <FileText className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-200">Belge Detayı</h4>
              </div>

              <div className="space-y-4 flex-1">
                 <FormField
                  control={form.control}
                  name="quotation.documentSerialTypeId"
                  render={({ field }) => (
                    <FormItem className="space-y-0 relative group">
                      <FormLabel className={styles.label}>Seri No</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                        value={field.value?.toString() || ''}
                        disabled={customerTypeId === undefined || !watchedRepresentativeId}
                      >
                        <FormControl>
                          <div className="relative">
                            <div className={styles.iconWrapper}><Hash className="h-4 w-4" /></div>
                            <SelectTrigger className={styles.inputBase}>
                              <SelectValue placeholder={t('common.select', 'Seç')} />
                            </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent>
                          {availableDocumentSerialTypes.length === 0 ? (
                            <div className="p-3 text-center text-xs text-muted-foreground">Uygun seri yok</div>
                          ) : (
                            availableDocumentSerialTypes
                              .filter((d) => d.serialPrefix?.trim() !== '')
                              .map((d) => (
                                <SelectItem key={d.id} value={d.id.toString()}>{d.serialPrefix}</SelectItem>
                              ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage className="mt-1" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="quotation.description"
                  render={({ field }) => (
                    <FormItem className="space-y-0 relative group">
                      <FormLabel className={styles.label}>
                        Notlar
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ''}
                          placeholder={t('quotation.header.descriptionPlaceholder', 'Özel koşullar...')}
                          className="min-h-[80px] rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/30 resize-none focus-visible:border-pink-500 focus-visible:ring-4 focus-visible:ring-pink-500/20 transition-all text-sm"
                        />
                      </FormControl>
                      <FormMessage className="mt-1" />
                    </FormItem>
                  )}
                />
              </div>
           </div>
        </div>
      </div>

      {/* DİALOGLAR */}
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
        />
      )}

      <Dialog open={currencyChangeDialogOpen} onOpenChange={setCurrencyChangeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-pink-600">
              <ArrowRightLeft className="h-5 w-5" />
              {t('quotation.header.currencyChange.title', 'Kur Değişikliği')}
            </DialogTitle>
            <DialogDescription className="pt-2">
              {t('quotation.header.currencyChange.message', 'Para birimi değişikliği tüm satırları etkileyecektir. Devam etmek istiyor musunuz?')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={handleCurrencyChangeCancel} className="rounded-xl">
              {t('common.cancel', 'Vazgeç')}
            </Button>
            <Button onClick={handleCurrencyChangeConfirm} className="rounded-xl bg-pink-600 hover:bg-pink-700 text-white">
              {t('common.yes', 'Onayla')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}