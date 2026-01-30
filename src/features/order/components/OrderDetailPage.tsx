import { type ReactElement, useState, useEffect, useMemo, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useOrder } from '../hooks/useOrder';
import { useStartApprovalFlow } from '../hooks/useStartApprovalFlow';
import { useOrderExchangeRates } from '../hooks/useOrderExchangeRates';
import { useOrderLines } from '../hooks/useOrderLines';
import { useUpdateOrderBulk } from '../hooks/useUpdateOrderBulk';
import { usePriceRuleOfOrder } from '../hooks/usePriceRuleOfOrder';
import { useUserDiscountLimitsBySalesperson } from '../hooks/useUserDiscountLimitsBySalesperson';
import { useCustomerOptions } from '@/features/customer-management/hooks/useCustomerOptions';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { Send, Save, Calculator, Layers, X, Loader2 } from 'lucide-react';
import { createOrderSchema, type CreateOrderSchema } from '../schemas/order-schema';
import type { OrderLineFormState, OrderExchangeRateFormState, OrderBulkCreateDto, CreateOrderDto, PricingRuleLineGetDto, UserDiscountLimitDto } from '../types/order-types';
import { OrderHeaderForm } from './OrderHeaderForm';
import { OrderLineTable } from './OrderLineTable';
import { OrderSummaryCard } from './OrderSummaryCard';
import { useOrderCalculations } from '../hooks/useOrderCalculations';
import { useExchangeRate } from '@/services/hooks/useExchangeRate';
import { useCurrencyOptions } from '@/services/hooks/useCurrencyOptions';
import { findExchangeRateByDovizTipi } from '../utils/price-conversion';
import { PricingRuleType } from '@/features/pricing-rule/types/pricing-rule-types';

export function OrderDetailPage(): ReactElement {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setPageTitle } = useUIStore();
  const orderId = id ? parseInt(id, 10) : 0;

  const { data: order, isLoading } = useOrder(orderId);
  const { data: exchangeRatesData = [], isLoading: isLoadingExchangeRates } = useOrderExchangeRates(orderId);
  const { data: linesData = [], isLoading: isLoadingLines } = useOrderLines(orderId);
  const updateMutation = useUpdateOrderBulk();
  const startApprovalFlow = useStartApprovalFlow();
  const { data: customerOptions = [] } = useCustomerOptions();

  // Local State
  const [lines, setLines] = useState<OrderLineFormState[]>([]);
  const [exchangeRates, setExchangeRates] = useState<OrderExchangeRateFormState[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRuleLineGetDto[]>([]);
  const [temporarySallerData, setTemporarySallerData] = useState<UserDiscountLimitDto[]>([]);
  
  const linesInitializedRef = useRef(false);
  const exchangeRatesInitializedRef = useRef(false);
  const formInitializedRef = useRef(false);

  const form = useForm<CreateOrderSchema>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      order: {
        offerType: 'Domestic',
        currency: '',
        offerDate: new Date().toISOString().split('T')[0],
        representativeId: null,
      },
    },
  });

  // Başlık Ayarı
  useEffect(() => {
    if (order) {
      setPageTitle(
        t('order.detail.title', 'Sipariş Detayı: {{offerNo}}', {
          offerNo: order.offerNo || `#${order.id}`,
        })
      );
    } else {
      setPageTitle(t('order.detail.title', 'Sipariş Detayı'));
    }
    return () => {
      setPageTitle(null);
    };
  }, [order, t, setPageTitle]);

  useEffect(() => {
    if (order && !formInitializedRef.current) {
      form.reset({
        order: {
          offerType: (order.offerType === 'Domestic' || order.offerType === 'Export' ? order.offerType : 'Domestic'),
          currency: order.currency || '',
          offerDate: order.offerDate ? order.offerDate.split('T')[0] : new Date().toISOString().split('T')[0],
          potentialCustomerId: order.potentialCustomerId || null,
          erpCustomerCode: order.erpCustomerCode || null,
          deliveryDate: order.deliveryDate ? order.deliveryDate.split('T')[0] : null,
          shippingAddressId: order.shippingAddressId || null,
          representativeId: order.representativeId || null,
          status: order.status || null,
          description: order.description || null,
          paymentTypeId: order.paymentTypeId || null,
          documentSerialTypeId: order.documentSerialTypeId || null,
          offerNo: order.offerNo || null,
          revisionNo: order.revisionNo || null,
          revisionId: order.revisionId || null,
        },
      });
      formInitializedRef.current = true;
    }
  }, [order, form]);

  useEffect(() => {
    linesInitializedRef.current = false;
  }, [orderId]);

  useEffect(() => {
    if (linesData && linesData.length > 0 && !linesInitializedRef.current) {
      const formattedLines: OrderLineFormState[] = linesData.map((line, index) => ({
        id: line.id && line.id > 0 ? `line-${line.id}-${index}` : `line-temp-${index}`,
        isEditing: false,
        productCode: line.productCode || '',
        productName: line.productName,
        groupCode: line.groupCode || null,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        discountRate1: line.discountRate1,
        discountAmount1: line.discountAmount1,
        discountRate2: line.discountRate2,
        discountAmount2: line.discountAmount2,
        discountRate3: line.discountRate3,
        discountAmount3: line.discountAmount3,
        vatRate: line.vatRate,
        vatAmount: line.vatAmount,
        lineTotal: line.lineTotal,
        lineGrandTotal: line.lineGrandTotal,
        description: line.description || null,
        pricingRuleHeaderId: line.pricingRuleHeaderId || null,
        relatedStockId: line.relatedStockId || null,
        relatedProductKey: line.relatedProductKey || null,
        isMainRelatedProduct: line.isMainRelatedProduct || false,
        approvalStatus: line.approvalStatus,
      }));
      setLines(formattedLines);
      linesInitializedRef.current = true;
    }
  }, [linesData]);

  const { calculateLineTotals } = useOrderCalculations();
  const { data: erpRates = [] } = useExchangeRate();
  const { currencyOptions: currencyOptionsForExchangeRates } = useCurrencyOptions();

  useEffect(() => {
    if (exchangeRatesData && exchangeRatesData.length > 0 && !exchangeRatesInitializedRef.current && currencyOptionsForExchangeRates.length > 0) {
      const formattedExchangeRates: OrderExchangeRateFormState[] = exchangeRatesData.map((rate) => {
        const currencyOption = currencyOptionsForExchangeRates.find(
          (opt) => opt.dovizIsmi?.toUpperCase() === rate.currency.toUpperCase() || 
                   opt.code?.toUpperCase() === rate.currency.toUpperCase()
        );
        
        return {
          id: `rate-${rate.id}`,
          currency: rate.currency,
          exchangeRate: rate.exchangeRate,
          exchangeRateDate: rate.exchangeRateDate ? rate.exchangeRateDate.split('T')[0] : new Date().toISOString().split('T')[0],
          isOfficial: rate.isOfficial,
          dovizTipi: currencyOption?.dovizTipi,
        };
      });
      setExchangeRates(formattedExchangeRates);
      exchangeRatesInitializedRef.current = true;
    }
  }, [exchangeRatesData, currencyOptionsForExchangeRates]);

  const watchedCurrency = Number(form.watch('order.currency') ?? '2');
  const watchedCustomerId = form.watch('order.potentialCustomerId');
  const watchedErpCustomerCode = form.watch('order.erpCustomerCode');
  const watchedRepresentativeId = form.watch('order.representativeId');
  const watchedOfferDate = form.watch('order.offerDate');

  const customerCode = useMemo(() => {
    if (watchedErpCustomerCode) {
      return watchedErpCustomerCode;
    }
    if (watchedCustomerId) {
      const customer = customerOptions.find((c) => c.id === watchedCustomerId);
      return customer?.customerCode || null;
    }
    return null;
  }, [watchedErpCustomerCode, watchedCustomerId, customerOptions]);

  const { data: pricingRulesData } = usePriceRuleOfOrder(
    customerCode,
    watchedRepresentativeId || undefined,
    watchedOfferDate || undefined
  );

  useEffect(() => {
    if (pricingRulesData) {
      setPricingRules(pricingRulesData);
    }
  }, [pricingRulesData]);

  const { data: userDiscountLimitsData } = useUserDiscountLimitsBySalesperson(watchedRepresentativeId);

  useEffect(() => {
    if (watchedRepresentativeId && userDiscountLimitsData) {
      setTemporarySallerData(userDiscountLimitsData);
    } else {
      setTemporarySallerData([]);
    }
  }, [watchedRepresentativeId, userDiscountLimitsData]);

  // Submit İşlemi
  const onSubmit = async (data: CreateOrderSchema): Promise<void> => {
    if (lines.length === 0) {
      toast.error(t('order.update.error', 'Sipariş Güncellenemedi'), {
        description: t('order.lines.required', 'En az 1 satır eklenmelidir'),
      });
      return;
    }

    try {
      const linesToSend = lines.map((line) => {
        const { id, isEditing, ...lineData } = line;
        const { relatedLines, ...cleanLineData } = lineData as OrderLineFormState & { relatedLines?: unknown[] };
        return {
          ...cleanLineData,
          orderId: orderId,
          productId: 0,
          description: cleanLineData.description || null,
          pricingRuleHeaderId: cleanLineData.pricingRuleHeaderId && cleanLineData.pricingRuleHeaderId > 0 ? cleanLineData.pricingRuleHeaderId : null,
          relatedStockId: cleanLineData.relatedStockId && cleanLineData.relatedStockId > 0 ? cleanLineData.relatedStockId : null,
        };
      });

      const exchangeRatesToSend = exchangeRates.length > 0
        ? exchangeRates.map(({ id, dovizTipi, ...rate }) => {
            const currencyValue = rate.currency || (dovizTipi ? String(dovizTipi) : '');
            return {
              ...rate,
              currency: currencyValue,
              orderId: orderId,
              isOfficial: rate.isOfficial ?? true,
            };
          })
        : undefined;

      const currencyValue = typeof data.order.currency === 'string' 
        ? data.order.currency 
        : String(data.order.currency);
      
      if (!currencyValue || currencyValue === '0') {
        throw new Error(t('order.update.invalidCurrency', 'Geçerli bir para birimi seçilmelidir'));
      }

      const orderData: CreateOrderDto = {
        offerType: data.order.offerType,
        currency: currencyValue,
        potentialCustomerId: (data.order.potentialCustomerId && data.order.potentialCustomerId > 0) ? data.order.potentialCustomerId : null,
        erpCustomerCode: data.order.erpCustomerCode || null,
        deliveryDate: data.order.deliveryDate || null,
        shippingAddressId: (data.order.shippingAddressId && data.order.shippingAddressId > 0) ? data.order.shippingAddressId : null,
        representativeId: (data.order.representativeId && data.order.representativeId > 0) ? data.order.representativeId : null,
        status: (data.order.status && data.order.status > 0) ? data.order.status : null,
        description: data.order.description || null,
        paymentTypeId: (data.order.paymentTypeId && data.order.paymentTypeId > 0) ? data.order.paymentTypeId : null,
        documentSerialTypeId: (data.order.documentSerialTypeId && data.order.documentSerialTypeId > 0) ? data.order.documentSerialTypeId : null,
        offerDate: data.order.offerDate || null,
        offerNo: data.order.offerNo || null,
        revisionNo: data.order.revisionNo || null,
        revisionId: (data.order.revisionId && data.order.revisionId > 0) ? data.order.revisionId : null,
      };

      const payload: OrderBulkCreateDto = {
        order: orderData,
        lines: linesToSend,
        exchangeRates: exchangeRatesToSend,
      };

      const result = await updateMutation.mutateAsync({ id: orderId, data: payload });

      if (result.success && result.data) {
        toast.success(t('order.update.success', 'Sipariş Başarıyla Güncellendi'), {
          description: t('order.update.successMessage', 'Sipariş başarıyla güncellendi.'),
        });
      } else {
        throw new Error(result.message || t('order.update.errorMessage', 'Sipariş güncellenirken bir hata oluştu.'));
      }
    } catch (error: unknown) {
      let errorMessage = t('order.update.errorMessage', 'Sipariş güncellenirken bir hata oluştu.');
      if (error instanceof Error) {
          try {
             const parsedError = JSON.parse(error.message);
             if (parsedError?.errors) errorMessage = JSON.stringify(parsedError.errors);
             else if (parsedError?.message) errorMessage = parsedError.message;
             else errorMessage = error.message;
          } catch {
             errorMessage = error.message;
          }
      }
      toast.error(t('order.update.error', 'Sipariş Güncellenemedi'), {
        description: errorMessage,
        duration: 10000,
      });
    }
  };

  const handleCurrencyChange = async (newCurrency: string): Promise<void> => {
    if (lines.length === 0) return;

    const oldCurrency = watchedCurrency;
    const newCurrencyNum = Number(newCurrency);

    if (oldCurrency === newCurrencyNum) return;

    const updatedLines = await Promise.all(
      lines.map(async (line) => {
        const oldRate = findExchangeRateByDovizTipi(oldCurrency, exchangeRates, erpRates);
        const newRate = findExchangeRateByDovizTipi(newCurrencyNum, exchangeRates, erpRates);

        if (oldRate && oldRate > 0 && newRate && newRate > 0) {
          const conversionRatio = oldRate / newRate;
          const newUnitPrice = line.unitPrice * conversionRatio;
          const updatedLine = { ...line, unitPrice: newUnitPrice };
          return calculateLineTotals(updatedLine);
        }
        return line;
      })
    );
    setLines(updatedLines);
  };

  const handleFormSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error(t('order.update.error', 'Form Hatalı'), {
        description: t('order.update.validationError', 'Lütfen zorunlu alanları kontrol ediniz.'),
      });
      return;
    }
    const formData = form.getValues();
    await onSubmit(formData);
  };

  const handleStartApprovalFlow = (): void => {
    if (!order) return;
    startApprovalFlow.mutate({
      entityId: order.id,
      documentType: PricingRuleType.Order,
      totalAmount: order.grandTotal,
    });
  };

  if (isLoading || isLoadingExchangeRates || isLoadingLines) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 border border-zinc-300 dark:border-zinc-700/80 rounded-xl bg-white/50 dark:bg-card/50">
        <div className="w-10 h-10 border-4 border-muted border-t-pink-500 rounded-full animate-spin" />
        <span className="text-muted-foreground animate-pulse text-sm font-medium">
          {t('order.loading', 'Yükleniyor...')}
        </span>
      </div>
    );
  }

  // Not Found Durumu
  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-lg font-medium text-muted-foreground mb-4">
          {t('order.detail.notFound', 'Sipariş bulunamadı')}
        </p>
        <Button variant="outline" onClick={() => navigate('/orders')}>
          {t('order.backToOrders', 'Siparişlere Dön')}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 relative pb-10">
      <FormProvider {...form}>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                  {t('order.detail.title', 'Sipariş Detayı: {{offerNo}}', { offerNo: order.offerNo || `#${order.id}` })}
              </h2>
              <p className="text-muted-foreground text-sm">
                  {t('order.detail.subtitle', 'Sipariş detaylarını görüntüleyin ve düzenleyin.')}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="space-y-1">
                <div className="flex items-center gap-2 pb-2 mb-4 border-b border-zinc-200 dark:border-white/5">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600">
                        <Layers className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        {t('order.header.title', 'Sipariş Bilgileri')}
                    </h3>
                </div>
                <OrderHeaderForm 
                    exchangeRates={exchangeRates}
                    onExchangeRatesChange={setExchangeRates}
                    lines={lines}
                    onLinesChange={async () => {
                        const newCurrency = form.getValues('order.currency');
                        if (newCurrency) {
                            await handleCurrencyChange(newCurrency);
                        }
                    }}
                    initialCurrency={order?.currency}
                    revisionNo={order?.revisionNo}
                    orderId={orderId}
                    orderOfferNo={order?.offerNo}
                />
            </div>

            <div className="space-y-1 pt-2">
              <OrderLineTable
                lines={lines}
                setLines={setLines}
                currency={watchedCurrency}
                exchangeRates={exchangeRates}
                pricingRules={pricingRules}
                userDiscountLimits={temporarySallerData}
                customerId={watchedCustomerId}
                erpCustomerCode={watchedErpCustomerCode}
                representativeId={watchedRepresentativeId}
                orderId={orderId}
              />
            </div>

            {/* 4. SECTION: SUMMARY */}
            <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-white/5">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-600">
                        <Calculator className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        {t('order.summary.title', 'Sipariş Özeti')}
                    </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="hidden md:block"></div>
                    <div className="bg-zinc-50/80 dark:bg-zinc-900/50 rounded-xl p-6 border border-zinc-200 dark:border-white/10 shadow-sm">
                         <OrderSummaryCard lines={lines} currency={watchedCurrency} />
                    </div>
                </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-200 dark:border-white/10">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/orders')}
                className="group"
              >
                <X className="mr-2 h-4 w-4" />
                {t('order.cancel', 'İptal')}
              </Button>
              {order?.status === 0 && (
                <Button 
                  type="button"
                  variant="secondary"
                  onClick={handleStartApprovalFlow}
                  disabled={startApprovalFlow.isPending || !order}
                  className="h-10"
                >
                  {startApprovalFlow.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('order.approval.sending', 'Gönderiliyor...')}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {t('order.approval.sendForApproval', 'Onaya Gönder')}
                    </>
                  )}
                </Button>
              )}
              <Button type="submit" disabled={updateMutation.isPending} className="group bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white min-w-[140px]">
          <Save className="mr-2 h-4 w-4" />
          {updateMutation.isPending
            ? t('order.saving', 'Kaydediliyor...')
            : t('order.save', 'Kaydet')}
        </Button>
            </div>

          </div>
        </form>
      </FormProvider>
    </div>
  );
}