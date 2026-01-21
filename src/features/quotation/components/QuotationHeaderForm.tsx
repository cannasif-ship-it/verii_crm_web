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
import { DollarSign, Search, User, Truck, Briefcase, Globe, Calendar, CreditCard, Hash, FileText } from 'lucide-react';
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
  const [customerSelectDialogOpen, setCustomerSelectDialogOpen] = useState(false);
  const [exchangeRateDialogOpen, setExchangeRateDialogOpen] = useState(false);
  const [currencyChangeDialogOpen, setCurrencyChangeDialogOpen] = useState(false);
  const [pendingCurrency, setPendingCurrency] = useState<string | null>(null);
  const isInitialLoadRef = useRef(true);
  const watchedCustomerId = form.watch('quotation.potentialCustomerId');
  const watchedErpCustomerCode = form.watch('quotation.erpCustomerCode');
  const watchedCurrency = form.watch('quotation.currency');
  const watchedRepresentativeId = form.watch('quotation.representativeId');
  const { data: shippingAddresses } = useShippingAddresses(watchedCustomerId || undefined);
  const { data: users } = useUsers();
  const { data: paymentTypes } = usePaymentTypes();
  const { data: customerOptions = [] } = useCustomerOptions();
  const { data: erpCustomers = [] } = useErpCustomers();
  const { data: customer } = useCustomer(watchedCustomerId ?? 0);
  
  const customerTypeId = useMemo(() => {
    if (watchedErpCustomerCode) {
      return 0;
    }
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
      if (customer) {
        return `CRM: ${watchedCustomerId} / ${customer.name}`;
      }
      return `CRM: ${watchedCustomerId}`;
    }
    if (watchedErpCustomerCode) {
      const erpCustomer = erpCustomers.find((c) => c.cariKod === watchedErpCustomerCode);
      if (erpCustomer) {
        return `ERP: ${watchedErpCustomerCode} / ${erpCustomer.cariIsim || watchedErpCustomerCode}`;
      }
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
      const timer = setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [initialCurrency]);

  useEffect(() => {
    if (watchedCurrency && initialCurrency !== null && initialCurrency !== undefined) {
      const watchedCurrencyNum = typeof watchedCurrency === 'string' ? Number(watchedCurrency) : watchedCurrency;
      const initialCurrencyNum = typeof initialCurrency === 'string' ? Number(initialCurrency) : initialCurrency;
      if (watchedCurrencyNum === initialCurrencyNum) {
        isInitialLoadRef.current = true;
        const timer = setTimeout(() => {
          isInitialLoadRef.current = false;
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [watchedCurrency, initialCurrency]);

  const selectedCustomer = watchedCustomerId || watchedErpCustomerCode;

  const handleExchangeRatesSave = (rates: QuotationExchangeRateFormState[]): void => {
    if (onExchangeRatesChange) {
      onExchangeRatesChange(rates);
    }
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
    
    if (currentCurrencyNum === newCurrencyNum) {
      return;
    }
    
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

  const inputClass = "h-11 rounded-xl bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-white/10 focus-visible:ring-pink-500/20 focus-visible:border-pink-500 transition-all duration-300";
  const labelClass = "text-zinc-700 dark:text-zinc-300 font-medium flex items-center gap-2 text-sm mb-1.5";

  return (
    <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* MÜŞTERİ SEÇİMİ */}
        <FormField
          control={form.control}
          name="quotation.potentialCustomerId"
          render={() => (
            <FormItem className="lg:col-span-2">
              <FormLabel className={labelClass}>
                <User className="h-4 w-4 text-pink-600" />
                {t('quotation.header.customer', 'Müşteri')} <span className="text-red-500">*</span>
              </FormLabel>
              <div className="flex gap-3">
                <FormControl>
                  <Input
                    className={cn(inputClass, "font-medium text-zinc-900 dark:text-white")}
                    value={customerDisplayValue}
                    placeholder={t('quotation.header.selectCustomer', 'Lütfen bir müşteri seçiniz...')}
                    readOnly
                  />
                </FormControl>
                <Button
                  type="button"
                  onClick={() => setCustomerSelectDialogOpen(true)}
                  className="h-11 px-6 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {t('common.search', 'Ara')}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* SEVK ADRESİ (Conditional) */}
        {selectedCustomer && (
          <FormField
            control={form.control}
            name="quotation.shippingAddressId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>
                  <Truck className="h-4 w-4 text-orange-500" />
                  {t('quotation.header.shippingAddress', 'Sevk Adresi')}
                </FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                  value={field.value?.toString() || ''}
                >
                  <FormControl>
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder={t('quotation.header.selectShippingAddress', 'Sevk adresi seçin')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {shippingAddresses.map((address) => (
                      <SelectItem key={address.id} value={address.id.toString()}>
                        {address.addressText}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* SATIŞ TEMSİLCİSİ */}
        <FormField
          control={form.control}
          name="quotation.representativeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>
                <Briefcase className="h-4 w-4 text-blue-500" />
                {t('quotation.header.representative', 'Satış Temsilcisi')}
              </FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                value={field.value?.toString() || ''}
              >
                <FormControl>
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder={t('quotation.header.selectRepresentative', 'Temsilci seçin')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* TEKLİF TİPİ */}
        <FormField
          control={form.control}
          name="quotation.offerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>
                <Globe className="h-4 w-4 text-purple-500" />
                {t('quotation.header.offerType', 'Teklif Tipi')} <span className="text-red-500">*</span>
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ''}
              >
                <FormControl>
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder={t('quotation.header.selectOfferType', 'Teklif tipi seçin')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Domestic">
                    {t('quotation.offerType.domestic', 'Yurtiçi')}
                  </SelectItem>
                  <SelectItem value="Export">
                    {t('quotation.offerType.export', 'Yurtdışı')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* PARA BİRİMİ */}
        <FormField
          control={form.control}
          name="quotation.currency"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className={labelClass}>
                  <DollarSign className="h-4 w-4 text-green-600" />
                  {t('quotation.header.currency', 'Para Birimi')} <span className="text-red-500">*</span>
                </FormLabel>
                {onExchangeRatesChange && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setExchangeRateDialogOpen(true)}
                    className="h-6 px-2 text-xs text-pink-600 hover:text-pink-700 hover:bg-pink-50 dark:hover:bg-pink-900/20"
                  >
                    {t('quotation.header.showExchangeRates', 'Kurları Düzenle')}
                  </Button>
                )}
              </div>
              <Select
                onValueChange={(value) => handleCurrencyChange(value)}
                value={field.value ? String(field.value) : ''}
              >
                <FormControl>
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {erpRates.map((currency: KurDto) => (
                    <SelectItem key={currency.dovizTipi} value={String(currency.dovizTipi)}>
                      {currency.dovizIsmi || `Döviz ${currency.dovizTipi}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* TEKLİF TARİHİ */}
        <FormField
          control={form.control}
          name="quotation.offerDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>
                <Calendar className="h-4 w-4 text-indigo-500" />
                {t('quotation.header.offerDate', 'Teklif Tarihi')}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  value={field.value || ''}
                  className={inputClass}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* TESLİMAT TARİHİ */}
        <FormField
          control={form.control}
          name="quotation.deliveryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>
                <Truck className="h-4 w-4 text-teal-500" />
                {t('quotation.header.deliveryDate', 'Teslimat Tarihi')}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  value={field.value || ''}
                  className={inputClass}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ÖDEME TİPİ */}
        <FormField
          control={form.control}
          name="quotation.paymentTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>
                <CreditCard className="h-4 w-4 text-rose-500" />
                {t('quotation.header.paymentType', 'Ödeme Tipi')}
              </FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                value={field.value?.toString() || ''}
              >
                <FormControl>
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder={t('quotation.header.selectPaymentType', 'Ödeme tipi seçin')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {paymentTypes.map((paymentType) => (
                    <SelectItem key={paymentType.id} value={paymentType.id.toString()}>
                      {paymentType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* TEKLİF NO */}
        <FormField
          control={form.control}
          name="quotation.offerNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>
                <Hash className="h-4 w-4 text-zinc-500" />
                {t('quotation.header.offerNo', 'Teklif Tipi')}
              </FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value || null)}
                value={field.value || ''}
                disabled={customerTypeId === undefined || !watchedRepresentativeId}
              >
                <FormControl>
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder={t('common.select', 'Seçiniz')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableDocumentSerialTypes.length === 0 ? (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      {t('quotation.header.noDocumentSerialType', 'Uygun dosya tipi bulunamadı')}
                    </div>
                  ) : (
                    availableDocumentSerialTypes
                      .filter((docType) => docType.serialPrefix && docType.serialPrefix.trim() !== '')
                      .map((docType) => (
                        <SelectItem key={docType.id} value={docType.id.toString()}>
                          {docType.serialPrefix}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* REVİZYON NO */}
        {revisionNo && (
          <FormItem>
            <FormLabel className={labelClass}>
              <Hash className="h-4 w-4 text-zinc-500" />
              {t('quotation.header.revisionNo', 'Revizyon No')}
            </FormLabel>
            <FormControl>
              <Input
                value={revisionNo}
                readOnly
                disabled
                className={cn(inputClass, "bg-zinc-100 dark:bg-zinc-800/50 cursor-not-allowed")}
              />
            </FormControl>
          </FormItem>
        )}
      </div>

      {/* AÇIKLAMA (TAM GENİŞLİK) */}
      <FormField
        control={form.control}
        name="quotation.description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className={labelClass}>
              <FileText className="h-4 w-4 text-zinc-500" />
              {t('quotation.header.description', 'Teklif Notu / Açıklama')}
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                value={field.value || ''}
                placeholder={t('quotation.header.descriptionPlaceholder', 'Teklif ile ilgili eklemek istediğiniz notları buraya yazabilirsiniz...')}
                rows={3}
                className={cn(inputClass, "h-auto min-h-[100px] resize-none py-3")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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
            <DialogTitle className="text-xl">
              {t('quotation.header.currencyChange.title', 'Para Birimi Değişikliği')}
            </DialogTitle>
            <DialogDescription className="pt-2">
              {t('quotation.header.currencyChange.message', 'Para birimi değiştiğinde mevcut tüm satırlar yeni para birimine göre yeniden hesaplanacaktır. Bu işlemi onaylıyor musunuz?')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={handleCurrencyChangeCancel} className="rounded-lg">
              {t('common.cancel', 'İptal')}
            </Button>
            <Button onClick={handleCurrencyChangeConfirm} className="rounded-lg bg-pink-600 hover:bg-pink-700">
              {t('common.yes', 'Evet, Değiştir')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}