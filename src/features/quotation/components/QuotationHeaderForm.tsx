import { type ReactElement, useState, useEffect } from 'react';
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
import { useCurrencyOptions } from '@/services/hooks/useCurrencyOptions';
import { ExchangeRateDialog } from './ExchangeRateDialog';
import { DollarSign } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import type { CreateQuotationSchema } from '../schemas/quotation-schema';
import type { QuotationExchangeRateFormState } from '../types/quotation-types';

interface QuotationHeaderFormProps {
  exchangeRates?: QuotationExchangeRateFormState[];
  onExchangeRatesChange?: (rates: QuotationExchangeRateFormState[]) => void;
  lines?: Array<{ productCode?: string | null; productName?: string | null }>;
  onLinesChange?: (lines: Array<{ productCode?: string | null; productName?: string | null }>) => void;
}

export function QuotationHeaderForm({ 
  exchangeRates = [],
  onExchangeRatesChange,
  lines = [],
  onLinesChange,
}: QuotationHeaderFormProps = {}): ReactElement {
  const { t } = useTranslation();
  const form = useFormContext<CreateQuotationSchema>();
  const { currencyOptions } = useCurrencyOptions();
  const user = useAuthStore((state) => state.user);
  const [customerSelectDialogOpen, setCustomerSelectDialogOpen] = useState(false);
  const [exchangeRateDialogOpen, setExchangeRateDialogOpen] = useState(false);
  const [currencyChangeDialogOpen, setCurrencyChangeDialogOpen] = useState(false);
  const [pendingCurrency, setPendingCurrency] = useState<string | null>(null);
  const watchedCustomerId = form.watch('quotation.potentialCustomerId');
  const watchedErpCustomerCode = form.watch('quotation.erpCustomerCode');
  const watchedCurrency = form.watch('quotation.currency');
  const { data: shippingAddresses } = useShippingAddresses(watchedCustomerId || undefined);
  const { data: users } = useUsers();
  const { data: paymentTypes } = usePaymentTypes();

  useEffect(() => {
    const currentRepresentativeId = form.watch('quotation.representativeId');
    if (!currentRepresentativeId && user?.id) {
      form.setValue('quotation.representativeId', user.id);
    }
  }, [form, user]);

  const selectedCustomer = watchedCustomerId || watchedErpCustomerCode;

  const handleExchangeRatesSave = (rates: QuotationExchangeRateFormState[]): void => {
    if (onExchangeRatesChange) {
      onExchangeRatesChange(rates);
    }
  };

  const handleCurrencyChange = (newCurrency: string): void => {
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

  return (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <FormField
          control={form.control}
          name="quotation.potentialCustomerId"
          render={() => (
            <FormItem>
              <FormLabel>
                {t('quotation.header.customer', 'Müşteri')} *
              </FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    value={
                      watchedCustomerId
                        ? `CRM: ${watchedCustomerId}`
                        : watchedErpCustomerCode
                        ? `ERP: ${watchedErpCustomerCode}`
                        : ''
                    }
                    placeholder={t('quotation.header.selectCustomer', 'Müşteri seçin')}
                    readOnly
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCustomerSelectDialogOpen(true)}
                >
                  {t('common.search', 'Ara')}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedCustomer && (
          <FormField
            control={form.control}
            name="quotation.shippingAddressId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('quotation.header.shippingAddress', 'Sevk Adresi')}
                </FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                  value={field.value?.toString() || ''}
                >
                  <FormControl>
                    <SelectTrigger>
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

        <FormField
          control={form.control}
          name="quotation.representativeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('quotation.header.representative', 'Satış Temsilcisi')}
              </FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                value={field.value?.toString() || ''}
              >
                <FormControl>
                  <SelectTrigger>
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

        <FormField
          control={form.control}
          name="quotation.offerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('quotation.header.offerType', 'Teklif Tipi')} *
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
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

        <FormField
          control={form.control}
          name="quotation.currency"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>
                  {t('quotation.header.currency', 'Para Birimi')} *
                </FormLabel>
                {onExchangeRatesChange && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setExchangeRateDialogOpen(true)}
                    className="gap-2 h-8 text-xs"
                  >
                    <DollarSign className="h-3.5 w-3.5" />
                    {t('quotation.header.showExchangeRates', 'Kurları Göster')}
                  </Button>
                )}
              </div>
              <Select
                onValueChange={(value) => handleCurrencyChange(value)}
                value={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {currencyOptions.map((currency) => (
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

        <FormField
          control={form.control}
          name="quotation.offerDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('quotation.header.offerDate', 'Teklif Tarihi')}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quotation.deliveryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('quotation.header.deliveryDate', 'Teslimat Tarihi')}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quotation.paymentTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('quotation.header.paymentType', 'Ödeme Tipi')}
              </FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                value={field.value?.toString() || ''}
              >
                <FormControl>
                  <SelectTrigger>
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

        <FormField
          control={form.control}
          name="quotation.offerNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('quotation.header.offerNo', 'Teklif No')}
              </FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} placeholder={t('quotation.header.offerNoPlaceholder', 'Teklif numarası')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="quotation.description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t('quotation.header.description', 'Açıklama')}
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                value={field.value || ''}
                placeholder={t('quotation.header.descriptionPlaceholder', 'Açıklama giriniz')}
                rows={3}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('quotation.header.currencyChange.title', 'Para Birimi Değişikliği')}
            </DialogTitle>
            <DialogDescription>
              {t('quotation.header.currencyChange.message', 'Para birimi değiştiğinde mevcut tüm satırlar yeni para birimine göre yeniden hesaplanacaktır. Bu işlemi onaylıyor musunuz?')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCurrencyChangeCancel}>
              {t('common.cancel', 'İptal')}
            </Button>
            <Button onClick={handleCurrencyChangeConfirm}>
              {t('common.yes', 'Evet')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
