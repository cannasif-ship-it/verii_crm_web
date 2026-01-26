import { type ReactElement, useState, useEffect, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCreateDemandBulk } from '../hooks/useCreateDemandBulk';
import { usePriceRuleOfDemand } from '../hooks/usePriceRuleOfDemand';
import { useUserDiscountLimitsBySalesperson } from '../hooks/useUserDiscountLimitsBySalesperson';
import { useCustomerOptions } from '@/features/customer-management/hooks/useCustomerOptions';
import { DemandHeaderForm } from './DemandHeaderForm';
import { DemandLineTable } from './DemandLineTable';
import { DemandSummaryCard } from './DemandSummaryCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calculator, Save, X, Layers } from 'lucide-react';
import { createDemandSchema, type CreateDemandSchema } from '../schemas/demand-schema';
import type { DemandLineFormState, DemandExchangeRateFormState, DemandBulkCreateDto, CreateDemandDto, PricingRuleLineGetDto, UserDiscountLimitDto } from '../types/demand-types';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { useDemandCalculations } from '../hooks/useDemandCalculations';
import { useExchangeRate } from '@/services/hooks/useExchangeRate';
import { findExchangeRateByDovizTipi } from '../utils/price-conversion';

export function DemandCreateForm(): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setPageTitle } = useUIStore();
  const user = useAuthStore((state) => state.user);
  
  const [lines, setLines] = useState<DemandLineFormState[]>([]);
  const [exchangeRates, setExchangeRates] = useState<DemandExchangeRateFormState[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRuleLineGetDto[]>([]);
  const [temporarySallerData, setTemporarySallerData] = useState<UserDiscountLimitDto[]>([]);
  
  const createMutation = useCreateDemandBulk();
  const { data: customerOptions = [] } = useCustomerOptions();

  useEffect(() => {
    setPageTitle(t('demand.create.title', 'Yeni Teklif Oluştur'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  const form = useForm<CreateDemandSchema>({
    resolver: zodResolver(createDemandSchema),
    defaultValues: {
      demand: {
        offerType: 'Domestic',
        currency: '',
        offerDate: new Date().toISOString().split('T')[0],
        representativeId: user?.id || null,
      },
    },
  });

  const watchedCurrency = Number(form.watch('demand.currency') ?? '2');
  const watchedCustomerId = form.watch('demand.potentialCustomerId');
  const watchedErpCustomerCode = form.watch('demand.erpCustomerCode');
  const watchedRepresentativeId = form.watch('demand.representativeId');
  const watchedOfferDate = form.watch('demand.offerDate');
  
  const { calculateLineTotals } = useDemandCalculations();
  const { data: erpRates = [] } = useExchangeRate();

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

  const onSubmit = async (data: CreateDemandSchema): Promise<void> => {
    if (lines.length === 0) {
      toast.error(t('demand.create.error', 'Teklif Oluşturulamadı'), {
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
          demandId: 0,
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
              demandId: 0,
              isOfficial: rate.isOfficial ?? true,
            };
          })
        : [];

      const currencyValue = typeof data.demand.currency === 'string' 
        ? data.demand.currency 
        : String(data.demand.currency);
      
      if (!currencyValue || currencyValue === '0') {
        throw new Error(t('demand.create.invalidCurrency', 'Geçerli bir para birimi seçilmelidir'));
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

      const result = await createMutation.mutateAsync(payload);

      if (result.success && result.data) {
        toast.success(t('demand.create.success', 'Teklif Başarıyla Oluşturuldu'), {
          description: t('demand.create.successMessage', 'Teklif onay sürecine gönderildi.'),
        });
        navigate(`/demands/${result.data.id}`);
      } else {
        throw new Error(result.message || t('demand.create.errorMessage', 'Teklif oluşturulurken bir hata oluştu.'));
      }
    } catch (error: unknown) {
      let errorMessage = t('demand.create.errorMessage', 'Teklif oluşturulurken bir hata oluştu.');
      if (error instanceof Error) {
        errorMessage = error.message; 
      }
      toast.error(t('demand.create.error', 'Teklif Oluşturulamadı'), {
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
          
          const updatedLine = {
            ...line,
            unitPrice: newUnitPrice,
          };
          return calculateLineTotals(updatedLine);
        }
        return line;
      })
    );
    setLines(updatedLines);
  };

  const handleFormSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const formData = form.getValues();

    if (!formData.demand.paymentTypeId) {
      toast.error(t('demand.create.error', 'Teklif Oluşturulamadı'), {
        description: t('demand.create.paymentTypeRequired', 'Ödeme tipi seçilmelidir'),
      });
      return;
    }

    if (!formData.demand.deliveryDate) {
      toast.error(t('demand.create.error', 'Teklif Oluşturulamadı'), {
        description: t('demand.create.deliveryDateRequired', 'Teslimat tarihi girilmelidir'),
      });
      return;
    }
    
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error(t('demand.create.error', 'Teklif Oluşturulamadı'), {
        description: t('demand.create.validationError', 'Lütfen form alanlarını kontrol ediniz.'),
      });
      return;
    }

    await onSubmit(formData);
  };

  return (
    <div className="w-full space-y-8 relative pb-10">
      <FormProvider {...form}>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="flex items-center gap-5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
              className="group h-12 w-12 rounded-2xl bg-white/80 dark:bg-zinc-900/50 border-zinc-200 dark:border-white/10 shadow-sm hover:border-pink-500/50 hover:shadow-pink-500/20 transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5 text-zinc-500 group-hover:text-pink-600 transition-colors" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{t('demand.create.title', 'Yeni Teklif Oluştur')}</h2>
              <p className="text-muted-foreground text-sm">
                {t('demand.create.subtitle', 'Müşteri için yeni bir satış teklifi oluşturun.')}
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
              />
            </div>

            {/* 2. SECTION: LINE TABLE */}
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
                <div className="hidden md:block">
                  {/* Sol taraf notlar için ayrıldı */}
                </div>
                <div className="bg-zinc-50/80 dark:bg-zinc-900/50 rounded-xl p-6 border border-zinc-200 dark:border-white/10 shadow-sm">
                  <DemandSummaryCard lines={lines} currency={watchedCurrency} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-200 dark:border-white/10">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="group"
              >
                <X className="mr-2 h-4 w-4" />
                {t('demand.cancel', 'İptal')}
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="group bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white min-w-[140px]"
              >
                <Save className="mr-2 h-4 w-4" />
                {createMutation.isPending 
                  ? t('demand.saving', 'Kaydediliyor...') 
                  : t('demand.save', 'Teklifi Kaydet')
                }
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}