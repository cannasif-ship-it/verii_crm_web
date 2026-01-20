import { type ReactElement, useState, useEffect, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCreateQuotationBulk, usePriceRuleOfQuotation, useUserDiscountLimitsBySalesperson } from '../api/quotation-api';
import { useCustomerOptions } from '@/features/customer-management/hooks/useCustomerOptions';
import { QuotationHeaderForm } from './QuotationHeaderForm';
import { QuotationLineTable } from './QuotationLineTable';
import { QuotationExchangeRateForm } from './QuotationExchangeRateForm';
import { QuotationSummaryCard } from './QuotationSummaryCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileText, Save, X, ArrowLeft, Layers, Calculator, Banknote } from 'lucide-react';
import { createQuotationSchema, type CreateQuotationSchema } from '../schemas/quotation-schema';
import type { QuotationLineFormState, QuotationExchangeRateFormState, QuotationBulkCreateDto, CreateQuotationDto, PricingRuleLineGetDto, UserDiscountLimitDto } from '../types/quotation-types';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { useQuotationCalculations } from '../hooks/useQuotationCalculations';
import { useCurrencyOptions } from '@/services/hooks/useCurrencyOptions';
import { useExchangeRate } from '@/services/hooks/useExchangeRate';
import { findExchangeRateByDovizTipi } from '../utils/price-conversion';
import { cn } from '@/lib/utils';

export function QuotationCreateForm(): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setPageTitle } = useUIStore();
  const user = useAuthStore((state) => state.user);
  const [lines, setLines] = useState<QuotationLineFormState[]>([]);
  const [exchangeRates, setExchangeRates] = useState<QuotationExchangeRateFormState[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRuleLineGetDto[]>([]);
  const [temporarySallerData, setTemporarySallerData] = useState<UserDiscountLimitDto[]>([]);
  const createMutation = useCreateQuotationBulk();
  const { data: customerOptions = [] } = useCustomerOptions();

  useEffect(() => {
    setPageTitle(t('quotation.create.title', 'Yeni Teklif Oluştur'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  const form = useForm<CreateQuotationSchema>({
    resolver: zodResolver(createQuotationSchema),
    defaultValues: {
      quotation: {
        offerType: 'Domestic',
        currency: '',
        offerDate: new Date().toISOString().split('T')[0],
        representativeId: user?.id || null,
      },
    },
  });

  const watchedCurrency = Number(form.watch('quotation.currency') ?? '2');
  const watchedCustomerId = form.watch('quotation.potentialCustomerId');
  const watchedErpCustomerCode = form.watch('quotation.erpCustomerCode');
  const watchedRepresentativeId = form.watch('quotation.representativeId');
  const watchedOfferDate = form.watch('quotation.offerDate');
  const { calculateLineTotals } = useQuotationCalculations();
  const { currencyOptions } = useCurrencyOptions();
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

  const { data: pricingRulesData } = usePriceRuleOfQuotation(
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

  const onSubmit = async (data: CreateQuotationSchema): Promise<void> => {
    if (lines.length === 0) {
      toast.error(
        t('quotation.create.error', 'Teklif Oluşturulamadı'),
        {
          description: t('quotation.lines.required', 'En az 1 satır eklenmelidir'),
        }
      );
      return;
    }

    try {
      const linesToSend = lines.map((line) => {
        const { id, isEditing, ...lineData } = line;
        const { relatedLines, ...cleanLineData } = lineData as QuotationLineFormState & { relatedLines?: QuotationLineFormState[] };
        return {
          ...cleanLineData,
          quotationId: 0,
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
              quotationId: 0,
              isOfficial: rate.isOfficial ?? true,
            };
          })
        : undefined;

      const currencyValue = typeof data.quotation.currency === 'string' 
        ? data.quotation.currency 
        : String(data.quotation.currency);
      
      if (!currencyValue || currencyValue === '0') {
        throw new Error(t('quotation.create.invalidCurrency', 'Geçerli bir para birimi seçilmelidir'));
      }

      const quotationData: CreateQuotationDto = {
        offerType: data.quotation.offerType,
        currency: currencyValue,
        potentialCustomerId: (data.quotation.potentialCustomerId && data.quotation.potentialCustomerId > 0) ? data.quotation.potentialCustomerId : null,
        erpCustomerCode: data.quotation.erpCustomerCode || null,
        deliveryDate: data.quotation.deliveryDate || null,
        shippingAddressId: (data.quotation.shippingAddressId && data.quotation.shippingAddressId > 0) ? data.quotation.shippingAddressId : null,
        representativeId: (data.quotation.representativeId && data.quotation.representativeId > 0) ? data.quotation.representativeId : null,
        status: (data.quotation.status && data.quotation.status > 0) ? data.quotation.status : null,
        description: data.quotation.description || null,
        paymentTypeId: (data.quotation.paymentTypeId && data.quotation.paymentTypeId > 0) ? data.quotation.paymentTypeId : null,
        offerDate: data.quotation.offerDate || null,
        offerNo: data.quotation.offerNo || null,
        revisionNo: data.quotation.revisionNo || null,
        revisionId: (data.quotation.revisionId && data.quotation.revisionId > 0) ? data.quotation.revisionId : null,
      };

      const payload: QuotationBulkCreateDto = {
        quotation: quotationData,
        lines: linesToSend,
        exchangeRates: exchangeRatesToSend,
      };

      const result = await createMutation.mutateAsync(payload);

      if (result.success && result.data) {
        toast.success(
          t('quotation.create.success', 'Teklif Başarıyla Oluşturuldu'),
          {
            description: t('quotation.create.successMessage', 'Teklif onay sürecine gönderildi.'),
          }
        );
        navigate(`/quotations/${result.data.id}`);
      } else {
        throw new Error(result.message || t('quotation.create.errorMessage', 'Teklif oluşturulurken bir hata oluştu.'));
      }
    } catch (error: unknown) {
      let errorMessage = t('quotation.create.errorMessage', 'Teklif oluşturulurken bir hata oluştu.');
      
      if (error instanceof Error) {
        // Hata mesajını ayrıştırma mantığı aynı kalacak
        errorMessage = error.message; 
      }
      
      toast.error(
        t('quotation.create.error', 'Teklif Oluşturulamadı'),
        {
          description: errorMessage,
          duration: 10000,
        }
      );
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
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error(
        t('quotation.create.error', 'Teklif Oluşturulamadı'),
        {
          description: t('quotation.create.validationError', 'Lütfen form alanlarını kontrol ediniz.'),
        }
      );
      return;
    }
    const formData = form.getValues();
    await onSubmit(formData);
  };

  return (
    <div className="w-full space-y-8 relative pb-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
            <Button
                variant="outline"
                size="icon"
                onClick={() => navigate(-1)}
                className="group h-12 w-12 rounded-2xl bg-white/80 dark:bg-zinc-900/50 border-zinc-200 dark:border-white/10 shadow-sm hover:border-pink-500/50 hover:shadow-pink-500/20 transition-all duration-300"
            >
                <ArrowLeft className="h-5 w-5 text-zinc-500 group-hover:text-pink-600 transition-colors" />
            </Button>
            
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                    <FileText className="w-8 h-8 text-pink-600" />
                    {t('quotation.create.title', 'Yeni Teklif Oluştur')}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium pl-1">
                    {t('quotation.create.subtitle', 'Müşteri için yeni bir satış teklifi hazırlayın.')}
                </p>
            </div>
        </div>

        {/* TOP ACTIONS */}
        <div className="flex gap-3">
            <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="h-11 px-6 rounded-xl border-zinc-300 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5"
            >
                {t('common.cancel', 'İptal')}
            </Button>
            <Button 
                type="submit" 
                onClick={handleFormSubmit}
                disabled={createMutation.isPending}
                className="h-11 px-8 bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-pink-500/25 transition-all hover:scale-105"
            >
                <Save className="mr-2 h-4 w-4" />
                {createMutation.isPending ? t('common.saving', 'Kaydediliyor...') : t('common.save', 'Kaydet')}
            </Button>
        </div>
      </div>

      {/* MAIN FORM CARD */}
      <div className="bg-white/80 dark:bg-[#1a1025]/80 backdrop-blur-xl border border-white/60 dark:border-white/5 shadow-sm rounded-2xl p-6 transition-all duration-300">
        <FormProvider {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-8">
            
            {/* 1. SECTION: HEADER INFO */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-white/5">
                    <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/20 text-pink-600">
                        <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        {t('quotation.header.title', 'Teklif Başlık Bilgileri')}
                    </h3>
                </div>
                
                <div className="bg-zinc-50/50 dark:bg-zinc-900/20 rounded-xl p-6 border border-zinc-100 dark:border-white/5">
                    <QuotationHeaderForm 
                        exchangeRates={exchangeRates}
                        onExchangeRatesChange={setExchangeRates}
                        lines={lines}
                        onLinesChange={async () => {
                            const newCurrency = form.getValues('quotation.currency');
                            if (newCurrency) {
                                await handleCurrencyChange(newCurrency);
                            }
                        }}
                    />
                </div>
            </div>

            {/* 2. SECTION: LINES (PRODUCTS) */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-white/5">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20 text-orange-600">
                        <Layers className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        {t('quotation.lines.title', 'Ürün Kalemleri')}
                    </h3>
                </div>

                <div className="bg-white dark:bg-zinc-900/40 rounded-xl border border-zinc-200 dark:border-white/10 shadow-sm overflow-hidden">
                    <QuotationLineTable
                        lines={lines}
                        setLines={setLines}
                        currency={watchedCurrency}
                        exchangeRates={exchangeRates}
                        pricingRules={pricingRules}
                        userDiscountLimits={temporarySallerData}
                    />
                </div>
            </div>

            {/* 3. SECTION: EXCHANGE RATES (CONDITIONAL) */}
            {watchedCurrency !== 2 && watchedCurrency !== 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                 <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-white/5">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600">
                        <Banknote className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        {t('quotation.exchangeRates.title', 'Döviz Kurları')}
                    </h3>
                </div>
                <div className="bg-blue-50/30 dark:bg-blue-900/5 rounded-xl p-6 border border-blue-100 dark:border-blue-900/20">
                    <QuotationExchangeRateForm
                        exchangeRates={exchangeRates}
                        setExchangeRates={setExchangeRates}
                        baseCurrency={watchedCurrency}
                    />
                </div>
              </div>
            )}

            {/* 4. SECTION: SUMMARY */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-white/5">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-600">
                        <Calculator className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        {t('quotation.summary.title', 'Teklif Özeti')}
                    </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="hidden md:block">
                        {/* Sol taraf boş veya notlar için kullanılabilir */}
                    </div>
                    <div className="bg-zinc-50/80 dark:bg-zinc-900/50 rounded-xl p-6 border border-zinc-200 dark:border-white/10 shadow-sm">
                        <QuotationSummaryCard lines={lines} currency={watchedCurrency} />
                    </div>
                </div>
            </div>

          </form>
        </FormProvider>
      </div>
    </div>
  );
}