import { type ReactElement, useState, useEffect, useMemo, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useDemand } from '../hooks/useDemand';
import { useStartApprovalFlow } from '../hooks/useStartApprovalFlow';
import { useDemandExchangeRates } from '../hooks/useDemandExchangeRates';
import { useDemandLines } from '../hooks/useDemandLines';
import { useUpdateDemandBulk } from '../hooks/useUpdateDemandBulk';
import { usePriceRuleOfDemand } from '../hooks/usePriceRuleOfDemand';
import { useUserDiscountLimitsBySalesperson } from '../hooks/useUserDiscountLimitsBySalesperson';
import { useCustomerOptions } from '@/features/customer-management/hooks/useCustomerOptions';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { Send, Save, Calculator, Layers, X, Loader2 } from 'lucide-react';
import { createDemandSchema, type CreateDemandSchema } from '../schemas/demand-schema';
import type { DemandLineFormState, DemandExchangeRateFormState, DemandBulkCreateDto, CreateDemandDto, PricingRuleLineGetDto, UserDiscountLimitDto } from '../types/demand-types';
import { DemandHeaderForm } from './DemandHeaderForm';
import { DemandLineTable } from './DemandLineTable';
import { DemandSummaryCard } from './DemandSummaryCard';
import { useDemandCalculations } from '../hooks/useDemandCalculations';
import { useExchangeRate } from '@/services/hooks/useExchangeRate';
import { useCurrencyOptions } from '@/services/hooks/useCurrencyOptions';
import { findExchangeRateByDovizTipi } from '../utils/price-conversion';
import { PricingRuleType } from '@/features/pricing-rule/types/pricing-rule-types';

export function DemandDetailPage(): ReactElement {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setPageTitle } = useUIStore();
  const demandId = id ? parseInt(id, 10) : 0;

  const { data: demand, isLoading } = useDemand(demandId);
  const { data: exchangeRatesData = [], isLoading: isLoadingExchangeRates } = useDemandExchangeRates(demandId);
  const { data: linesData = [], isLoading: isLoadingLines } = useDemandLines(demandId);
  const updateMutation = useUpdateDemandBulk();
  const startApprovalFlow = useStartApprovalFlow();
  const { data: customerOptions = [] } = useCustomerOptions();

  // Local State
  const [lines, setLines] = useState<DemandLineFormState[]>([]);
  const [exchangeRates, setExchangeRates] = useState<DemandExchangeRateFormState[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRuleLineGetDto[]>([]);
  const [temporarySallerData, setTemporarySallerData] = useState<UserDiscountLimitDto[]>([]);
  
  const linesInitializedRef = useRef(false);
  const exchangeRatesInitializedRef = useRef(false);
  const formInitializedRef = useRef(false);

  const form = useForm<CreateDemandSchema>({
    resolver: zodResolver(createDemandSchema),
    defaultValues: {
      demand: {
        offerType: 'Domestic',
        currency: '',
        offerDate: new Date().toISOString().split('T')[0],
        representativeId: null,
      },
    },
  });

  // Başlık Ayarı
  useEffect(() => {
    if (demand) {
      setPageTitle(
        t('demand.detail.title', 'Teklif Detayı: {{offerNo}}', {
          offerNo: demand.offerNo || `#${demand.id}`,
        })
      );
    } else {
      setPageTitle(t('demand.detail.title', 'Teklif Detayı'));
    }
    return () => {
      setPageTitle(null);
    };
  }, [demand, t, setPageTitle]);

  useEffect(() => {
    if (demand && !formInitializedRef.current) {
      form.reset({
        demand: {
          offerType: (demand.offerType === 'Domestic' || demand.offerType === 'Export' ? demand.offerType : 'Domestic'),
          currency: demand.currency || '',
          offerDate: demand.offerDate ? demand.offerDate.split('T')[0] : new Date().toISOString().split('T')[0],
          potentialCustomerId: demand.potentialCustomerId || null,
          erpCustomerCode: demand.erpCustomerCode || null,
          deliveryDate: demand.deliveryDate ? demand.deliveryDate.split('T')[0] : null,
          shippingAddressId: demand.shippingAddressId || null,
          representativeId: demand.representativeId || null,
          status: demand.status || null,
          description: demand.description || null,
          paymentTypeId: demand.paymentTypeId || null,
          documentSerialTypeId: demand.documentSerialTypeId || null,
          offerNo: demand.offerNo || null,
          revisionNo: demand.revisionNo || null,
          revisionId: demand.revisionId || null,
        },
      });
      formInitializedRef.current = true;
    }
  }, [demand, form]);

  useEffect(() => {
    if (linesData && linesData.length > 0 && !linesInitializedRef.current) {
      const formattedLines: DemandLineFormState[] = linesData.map((line, index) => ({
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

  const { calculateLineTotals } = useDemandCalculations();
  const { data: erpRates = [] } = useExchangeRate();
  const { currencyOptions: currencyOptionsForExchangeRates } = useCurrencyOptions();

  useEffect(() => {
    if (exchangeRatesData && exchangeRatesData.length > 0 && !exchangeRatesInitializedRef.current && currencyOptionsForExchangeRates.length > 0) {
      const formattedExchangeRates: DemandExchangeRateFormState[] = exchangeRatesData.map((rate) => {
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

  const watchedCurrency = Number(form.watch('demand.currency') ?? '2');
  const watchedCustomerId = form.watch('demand.potentialCustomerId');
  const watchedErpCustomerCode = form.watch('demand.erpCustomerCode');
  const watchedRepresentativeId = form.watch('demand.representativeId');
  const watchedOfferDate = form.watch('demand.offerDate');

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

  const { data: pricingRulesData } = usePriceRuleOfDemand(
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
  const onSubmit = async (data: CreateDemandSchema): Promise<void> => {
    if (lines.length === 0) {
      toast.error(t('demand.update.error', 'Teklif Güncellenemedi'), {
        description: t('demand.lines.required', 'En az 1 satır eklenmelidir'),
      });
      return;
    }

    try {
      const linesToSend = lines.map((line) => {
        const { id, isEditing, ...lineData } = line;
        const { relatedLines, ...cleanLineData } = lineData as DemandLineFormState & { relatedLines?: unknown[] };
        return {
          ...cleanLineData,
          demandId: demandId,
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
              demandId: demandId,
              isOfficial: rate.isOfficial ?? true,
            };
          })
        : undefined;

      const currencyValue = typeof data.demand.currency === 'string' 
        ? data.demand.currency 
        : String(data.demand.currency);
      
      if (!currencyValue || currencyValue === '0') {
        throw new Error(t('demand.update.invalidCurrency', 'Geçerli bir para birimi seçilmelidir'));
      }

      const demandData: CreateDemandDto = {
        offerType: data.demand.offerType,
        currency: currencyValue,
        potentialCustomerId: (data.demand.potentialCustomerId && data.demand.potentialCustomerId > 0) ? data.demand.potentialCustomerId : null,
        erpCustomerCode: data.demand.erpCustomerCode || null,
        deliveryDate: data.demand.deliveryDate || null,
        shippingAddressId: (data.demand.shippingAddressId && data.demand.shippingAddressId > 0) ? data.demand.shippingAddressId : null,
        representativeId: (data.demand.representativeId && data.demand.representativeId > 0) ? data.demand.representativeId : null,
        status: (data.demand.status && data.demand.status > 0) ? data.demand.status : null,
        description: data.demand.description || null,
        paymentTypeId: (data.demand.paymentTypeId && data.demand.paymentTypeId > 0) ? data.demand.paymentTypeId : null,
        documentSerialTypeId: (data.demand.documentSerialTypeId && data.demand.documentSerialTypeId > 0) ? data.demand.documentSerialTypeId : null,
        offerDate: data.demand.offerDate || null,
        offerNo: data.demand.offerNo || null,
        revisionNo: data.demand.revisionNo || null,
        revisionId: (data.demand.revisionId && data.demand.revisionId > 0) ? data.demand.revisionId : null,
      };

      const payload: DemandBulkCreateDto = {
        demand: demandData,
        lines: linesToSend,
        exchangeRates: exchangeRatesToSend,
      };

      const result = await updateMutation.mutateAsync({ id: demandId, data: payload });

      if (result.success && result.data) {
        toast.success(t('demand.update.success', 'Teklif Başarıyla Güncellendi'), {
          description: t('demand.update.successMessage', 'Teklif başarıyla güncellendi.'),
        });
      } else {
        throw new Error(result.message || t('demand.update.errorMessage', 'Teklif güncellenirken bir hata oluştu.'));
      }
    } catch (error: unknown) {
      let errorMessage = t('demand.update.errorMessage', 'Teklif güncellenirken bir hata oluştu.');
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
      toast.error(t('demand.update.error', 'Teklif Güncellenemedi'), {
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
      toast.error(t('demand.update.error', 'Form Hatalı'), {
        description: t('demand.update.validationError', 'Lütfen zorunlu alanları kontrol ediniz.'),
      });
      return;
    }
    const formData = form.getValues();
    await onSubmit(formData);
  };

  const handleStartApprovalFlow = (): void => {
    if (!demand) return;
    startApprovalFlow.mutate({
      entityId: demand.id,
      documentType: PricingRuleType.Demand,
      totalAmount: demand.grandTotal,
    });
  };

  if (isLoading || isLoadingExchangeRates || isLoadingLines) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 border border-zinc-300 dark:border-zinc-700/80 rounded-xl bg-white/50 dark:bg-card/50">
        <div className="w-10 h-10 border-4 border-muted border-t-pink-500 rounded-full animate-spin" />
        <span className="text-muted-foreground animate-pulse text-sm font-medium">
          {t('demand.loading', 'Yükleniyor...')}
        </span>
      </div>
    );
  }

  // Not Found Durumu
  if (!demand) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-lg font-medium text-muted-foreground mb-4">
          {t('demand.detail.notFound', 'Teklif bulunamadı')}
        </p>
        <Button variant="outline" onClick={() => navigate('/demands')}>
          {t('demand.backToDemands', 'Tekliflere Dön')}
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
                  {t('demand.detail.title', 'Teklif Detayı: {{offerNo}}', { offerNo: demand.offerNo || `#${demand.id}` })}
              </h2>
              <p className="text-muted-foreground text-sm">
                  {t('demand.detail.subtitle', 'Teklif detaylarını görüntüleyin ve düzenleyin.')}
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
                        {t('demand.header.title', 'Teklif Bilgileri')}
                    </h3>
                </div>
                <DemandHeaderForm 
                    exchangeRates={exchangeRates}
                    onExchangeRatesChange={setExchangeRates}
                    lines={lines}
                    onLinesChange={async () => {
                        const newCurrency = form.getValues('demand.currency');
                        if (newCurrency) {
                            await handleCurrencyChange(newCurrency);
                        }
                    }}
                    initialCurrency={demand?.currency}
                    revisionNo={demand?.revisionNo}
                />
            </div>

            <div className="space-y-1 pt-2">
              <DemandLineTable
                lines={lines}
                setLines={setLines}
                currency={watchedCurrency}
                exchangeRates={exchangeRates}
                pricingRules={pricingRules}
                userDiscountLimits={temporarySallerData}
                customerId={watchedCustomerId}
                erpCustomerCode={watchedErpCustomerCode}
                representativeId={watchedRepresentativeId}
              />
            </div>

            {/* 4. SECTION: SUMMARY */}
            <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-white/5">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-600">
                        <Calculator className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        {t('demand.summary.title', 'Teklif Özeti')}
                    </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="hidden md:block"></div>
                    <div className="bg-zinc-50/80 dark:bg-zinc-900/50 rounded-xl p-6 border border-zinc-200 dark:border-white/10 shadow-sm">
                         <DemandSummaryCard lines={lines} currency={watchedCurrency} />
                    </div>
                </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-200 dark:border-white/10">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/demands')}
                className="group"
              >
                <X className="mr-2 h-4 w-4" />
                {t('demand.cancel', 'İptal')}
              </Button>
              {demand?.status === 0 && (
                <Button 
                  type="button"
                  variant="secondary"
                  onClick={handleStartApprovalFlow}
                  disabled={startApprovalFlow.isPending || !demand}
                  className="h-10"
                >
                  {startApprovalFlow.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('demand.approval.sending', 'Gönderiliyor...')}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {t('demand.approval.sendForApproval', 'Onaya Gönder')}
                    </>
                  )}
                </Button>
              )}
              <Button type="submit" disabled={updateMutation.isPending} className="group bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white min-w-[140px]">
          <Save className="mr-2 h-4 w-4" />
          {updateMutation.isPending
            ? t('demand.saving', 'Kaydediliyor...')
            : t('demand.save', 'Kaydet')}
        </Button>
            </div>

          </div>
        </form>
      </FormProvider>
    </div>
  );
}