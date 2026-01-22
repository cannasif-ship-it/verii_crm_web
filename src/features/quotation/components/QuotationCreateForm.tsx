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
import { QuotationSummaryCard } from './QuotationSummaryCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calculator, Save, X, Layers } from 'lucide-react'; // Layers import edildi
import { createQuotationSchema, type CreateQuotationSchema } from '../schemas/quotation-schema';
import type { QuotationLineFormState, QuotationExchangeRateFormState, QuotationBulkCreateDto, CreateQuotationDto, PricingRuleLineGetDto, UserDiscountLimitDto } from '../types/quotation-types';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { useQuotationCalculations } from '../hooks/useQuotationCalculations';
import { useExchangeRate } from '@/services/hooks/useExchangeRate';
import { findExchangeRateByDovizTipi } from '../utils/price-conversion';

export function QuotationCreateForm(): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setPageTitle } = useUIStore();
  const user = useAuthStore((state) => state.user);
  
  // State tanımları
  const [lines, setLines] = useState<QuotationLineFormState[]>([]);
  const [exchangeRates, setExchangeRates] = useState<QuotationExchangeRateFormState[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRuleLineGetDto[]>([]);
  const [temporarySallerData, setTemporarySallerData] = useState<UserDiscountLimitDto[]>([]);
  
  const createMutation = useCreateQuotationBulk();
  const { data: customerOptions = [] } = useCustomerOptions();

  // Sayfa başlığı
  useEffect(() => {
    setPageTitle(t('quotation.create.title', 'Yeni Teklif Oluştur'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  // Form tanımlama
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

  // Watcher'lar
  const watchedCurrency = Number(form.watch('quotation.currency') ?? '2');
  const watchedCustomerId = form.watch('quotation.potentialCustomerId');
  const watchedErpCustomerCode = form.watch('quotation.erpCustomerCode');
  const watchedRepresentativeId = form.watch('quotation.representativeId');
  const watchedOfferDate = form.watch('quotation.offerDate');
  
  const { calculateLineTotals } = useQuotationCalculations();
  const { data: erpRates = [] } = useExchangeRate();

  // Müşteri Kodu tespiti
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

  // Fiyat kuralları verisi
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

  // İskonto limitleri verisi
  const { data: userDiscountLimitsData } = useUserDiscountLimitsBySalesperson(watchedRepresentativeId);

  useEffect(() => {
    if (watchedRepresentativeId && userDiscountLimitsData) {
      setTemporarySallerData(userDiscountLimitsData);
    } else {
      setTemporarySallerData([]);
    }
  }, [watchedRepresentativeId, userDiscountLimitsData]);

  // Submit işlemi
  const onSubmit = async (data: CreateQuotationSchema): Promise<void> => {
    if (lines.length === 0) {
      toast.error(t('quotation.create.error', 'Teklif Oluşturulamadı'), {
        description: t('quotation.lines.required', 'En az 1 satır eklenmelidir'),
      });
      return;
    }

    try {
      const linesToSend = lines.map((line) => {
        const { id, isEditing, ...lineData } = line;
        // Tip güvenliği için cast edip gereksiz alanları çıkarıyoruz
        const { relatedLines, ...cleanLineData } = lineData as QuotationLineFormState & { relatedLines?: unknown[] };
        
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
        : [];

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
        documentSerialTypeId: (data.quotation.documentSerialTypeId && data.quotation.documentSerialTypeId > 0) ? data.quotation.documentSerialTypeId : null,
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
        toast.success(t('quotation.create.success', 'Teklif Başarıyla Oluşturuldu'), {
          description: t('quotation.create.successMessage', 'Teklif onay sürecine gönderildi.'),
        });
        navigate(`/quotations/${result.data.id}`);
      } else {
        throw new Error(result.message || t('quotation.create.errorMessage', 'Teklif oluşturulurken bir hata oluştu.'));
      }
    } catch (error: unknown) {
      let errorMessage = t('quotation.create.errorMessage', 'Teklif oluşturulurken bir hata oluştu.');
      if (error instanceof Error) {
        errorMessage = error.message; 
      }
      toast.error(t('quotation.create.error', 'Teklif Oluşturulamadı'), {
        description: errorMessage,
        duration: 10000,
      });
    }
  };

  // Para birimi değişimi
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

  // Manuel Form Submit
  const handleFormSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const formData = form.getValues();

    if (!formData.quotation.paymentTypeId) {
      toast.error(t('quotation.create.error', 'Teklif Oluşturulamadı'), {
        description: t('quotation.create.paymentTypeRequired', 'Ödeme tipi seçilmelidir'),
      });
      return;
    }

    if (!formData.quotation.deliveryDate) {
      toast.error(t('quotation.create.error', 'Teklif Oluşturulamadı'), {
        description: t('quotation.create.deliveryDateRequired', 'Teslimat tarihi girilmelidir'),
      });
      return;
    }
    
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error(t('quotation.create.error', 'Teklif Oluşturulamadı'), {
        description: t('quotation.create.validationError', 'Lütfen form alanlarını kontrol ediniz.'),
      });
      return;
    }

    await onSubmit(formData);
  };

  return (
    <div className="w-full space-y-8 relative pb-10">
      <FormProvider {...form}>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          
          {/* HEADER (Geri Butonu ve Başlık) */}
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
              <h2 className="text-2xl font-bold tracking-tight">{t('quotation.create.title', 'Yeni Teklif Oluştur')}</h2>
              <p className="text-muted-foreground text-sm">
                {t('quotation.create.subtitle', 'Müşteri için yeni bir satış teklifi oluşturun.')}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {/* 1. SECTON: HEADER FORM */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-zinc-200 dark:border-white/5">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  {t('quotation.header.title', 'Teklif Bilgileri')}
                </h3>
              </div>
              
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

            {/* 2. SECTION: LINE TABLE */}
            <div className="space-y-1 pt-2">
              <QuotationLineTable
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

            {/* 3. SECTION: SUMMARY */}
            <div className="space-y-4 pt-4">
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
                  {/* Sol taraf notlar için ayrıldı */}
                </div>
                <div className="bg-zinc-50/80 dark:bg-zinc-900/50 rounded-xl p-6 border border-zinc-200 dark:border-white/10 shadow-sm">
                  <QuotationSummaryCard lines={lines} currency={watchedCurrency} />
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-200 dark:border-white/10">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="group"
              >
                <X className="mr-2 h-4 w-4" />
                {t('common.cancel', 'İptal')}
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="group bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white min-w-[140px]"
              >
                <Save className="mr-2 h-4 w-4" />
                {createMutation.isPending 
                  ? t('common.saving', 'Kaydediliyor...') 
                  : t('common.save', 'Teklifi Kaydet')
                }
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}