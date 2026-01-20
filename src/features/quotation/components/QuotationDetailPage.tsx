import { type ReactElement, useState, useEffect, useMemo, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useQuotation, useStartApprovalFlow, useQuotationExchangeRates, useQuotationLines, useUpdateQuotationBulk, usePriceRuleOfQuotation, useUserDiscountLimitsBySalesperson } from '../api/quotation-api';
import { useCustomerOptions } from '@/features/customer-management/hooks/useCustomerOptions';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send } from 'lucide-react';
import { createQuotationSchema, type CreateQuotationSchema } from '../schemas/quotation-schema';
import type { QuotationLineFormState, QuotationExchangeRateFormState, QuotationBulkCreateDto, CreateQuotationDto, PricingRuleLineGetDto, UserDiscountLimitDto } from '../types/quotation-types';
import { QuotationHeaderForm } from './QuotationHeaderForm';
import { QuotationLineTable } from './QuotationLineTable';
import { QuotationExchangeRateForm } from './QuotationExchangeRateForm';
import { QuotationSummaryCard } from './QuotationSummaryCard';
import { useQuotationCalculations } from '../hooks/useQuotationCalculations';
import { useExchangeRate } from '@/services/hooks/useExchangeRate';
import { useCurrencyOptions } from '@/services/hooks/useCurrencyOptions';
import { findExchangeRateByDovizTipi } from '../utils/price-conversion';
import { PricingRuleType } from '@/features/pricing-rule/types/pricing-rule-types';

export function QuotationDetailPage(): ReactElement {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setPageTitle } = useUIStore();
  const quotationId = id ? parseInt(id, 10) : 0;

  const { data: quotation, isLoading } = useQuotation(quotationId);
  const { data: exchangeRatesData = [], isLoading: isLoadingExchangeRates } = useQuotationExchangeRates(quotationId);
  const { data: linesData = [], isLoading: isLoadingLines } = useQuotationLines(quotationId);
  const updateMutation = useUpdateQuotationBulk();
  const startApprovalFlow = useStartApprovalFlow();
  const { data: customerOptions = [] } = useCustomerOptions();

  const [lines, setLines] = useState<QuotationLineFormState[]>([]);
  const [exchangeRates, setExchangeRates] = useState<QuotationExchangeRateFormState[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRuleLineGetDto[]>([]);
  const [temporarySallerData, setTemporarySallerData] = useState<UserDiscountLimitDto[]>([]);
  const linesInitializedRef = useRef(false);
  const exchangeRatesInitializedRef = useRef(false);
  const formInitializedRef = useRef(false);

  const form = useForm<CreateQuotationSchema>({
    resolver: zodResolver(createQuotationSchema),
    defaultValues: {
      quotation: {
        offerType: 'Domestic',
        currency: '',
        offerDate: new Date().toISOString().split('T')[0],
        representativeId: null,
      },
    },
  });

  useEffect(() => {
    if (quotation) {
      setPageTitle(
        t('quotation.detail.title', 'Teklif Detayı: {{offerNo}}', {
          offerNo: quotation.offerNo || `#${quotation.id}`,
        })
      );
    } else {
      setPageTitle(t('quotation.detail.title', 'Teklif Detayı'));
    }
    return () => {
      setPageTitle(null);
    };
  }, [quotation, t, setPageTitle]);

  useEffect(() => {
    if (quotation && !formInitializedRef.current) {
      form.reset({
        quotation: {
          offerType: (quotation.offerType === 'Domestic' || quotation.offerType === 'Export' ? quotation.offerType : 'Domestic'),
          currency: quotation.currency || '',
          offerDate: quotation.offerDate ? quotation.offerDate.split('T')[0] : new Date().toISOString().split('T')[0],
          potentialCustomerId: quotation.potentialCustomerId || null,
          erpCustomerCode: quotation.erpCustomerCode || null,
          deliveryDate: quotation.deliveryDate ? quotation.deliveryDate.split('T')[0] : null,
          shippingAddressId: quotation.shippingAddressId || null,
          representativeId: quotation.representativeId || null,
          status: quotation.status || null,
          description: quotation.description || null,
          paymentTypeId: quotation.paymentTypeId || null,
          offerNo: quotation.offerNo || null,
          revisionNo: quotation.revisionNo || null,
          revisionId: quotation.revisionId || null,
        },
      });
      formInitializedRef.current = true;
    }
  }, [quotation, form]);

  useEffect(() => {
    if (linesData && linesData.length > 0 && !linesInitializedRef.current) {
      const formattedLines: QuotationLineFormState[] = linesData.map((line, index) => ({
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

  const { calculateLineTotals } = useQuotationCalculations();
  const { data: erpRates = [] } = useExchangeRate();
  const { currencyOptions: currencyOptionsForExchangeRates } = useCurrencyOptions();

  useEffect(() => {
    if (exchangeRatesData && exchangeRatesData.length > 0 && !exchangeRatesInitializedRef.current && currencyOptionsForExchangeRates.length > 0) {
      const formattedExchangeRates: QuotationExchangeRateFormState[] = exchangeRatesData.map((rate) => {
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

  const watchedCurrency = Number(form.watch('quotation.currency') ?? '2');
  const watchedCustomerId = form.watch('quotation.potentialCustomerId');
  const watchedErpCustomerCode = form.watch('quotation.erpCustomerCode');
  const watchedRepresentativeId = form.watch('quotation.representativeId');
  const watchedOfferDate = form.watch('quotation.offerDate');

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
        t('quotation.update.error', 'Teklif Güncellenemedi'),
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
          quotationId: quotationId,
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
              quotationId: quotationId,
              isOfficial: rate.isOfficial ?? true,
            };
          })
        : undefined;

      const currencyValue = typeof data.quotation.currency === 'string' 
        ? data.quotation.currency 
        : String(data.quotation.currency);
      
      if (!currencyValue || currencyValue === '0') {
        throw new Error(t('quotation.update.invalidCurrency', 'Geçerli bir para birimi seçilmelidir'));
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

      const result = await updateMutation.mutateAsync({ id: quotationId, data: payload });

      if (result.success && result.data) {
        toast.success(
          t('quotation.update.success', 'Teklif Başarıyla Güncellendi'),
          {
            description: t('quotation.update.successMessage', 'Teklif başarıyla güncellendi.'),
          }
        );
      } else {
        throw new Error(result.message || t('quotation.update.errorMessage', 'Teklif güncellenirken bir hata oluştu.'));
      }
    } catch (error: unknown) {
      let errorMessage = t('quotation.update.errorMessage', 'Teklif güncellenirken bir hata oluştu.');
      
      if (error instanceof Error) {
        try {
          const parsedError = JSON.parse(error.message);
          if (parsedError && typeof parsedError === 'object') {
            if (parsedError.errors && typeof parsedError.errors === 'object') {
              const validationErrors = Object.entries(parsedError.errors)
                .map(([key, value]) => {
                  if (Array.isArray(value)) {
                    return `${key}: ${value.join(', ')}`;
                  }
                  return `${key}: ${String(value)}`;
                })
                .join('\n');
              errorMessage = validationErrors;
            } else if (parsedError.message) {
              errorMessage = parsedError.message;
            } else if (parsedError.exceptionMessage) {
              errorMessage = parsedError.exceptionMessage;
            }
          } else {
            errorMessage = error.message;
          }
        } catch {
          errorMessage = error.message;
        }
      }
      
      toast.error(
        t('quotation.update.error', 'Teklif Güncellenemedi'),
        {
          description: errorMessage,
          duration: 10000,
        }
      );
    }
  };

  const handleCurrencyChange = async (newCurrency: string): Promise<void> => {
    if (lines.length === 0) {
      return;
    }

    const oldCurrency = watchedCurrency;
    const newCurrencyNum = Number(newCurrency);

    if (oldCurrency === newCurrencyNum) {
      return;
    }

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
      const errors = form.formState.errors;
      const errorFields = Object.keys(errors);
      if (errorFields.length > 0) {
        const firstError = errors[errorFields[0] as keyof typeof errors];
        const errorMessage = firstError?.message || t('quotation.update.validationError', 'Lütfen form alanlarını kontrol ediniz.');
        toast.error(
          t('quotation.update.error', 'Teklif Güncellenemedi'),
          {
            description: errorMessage,
          }
        );
      }
      return;
    }

    const formData = form.getValues();
    await onSubmit(formData);
  };

  const handleStartApprovalFlow = (): void => {
    if (!quotation) {
      return;
    }

    startApprovalFlow.mutate({
      entityId: quotation.id,
      documentType: PricingRuleType.Quotation,
      totalAmount: quotation.grandTotal,
    });
  };

  if (isLoading || isLoadingExchangeRates || isLoadingLines) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 border border-zinc-300 dark:border-zinc-700/80 rounded-xl bg-white/50 dark:bg-card/50">
        <div className="w-10 h-10 border-4 border-muted border-t-pink-500 rounded-full animate-spin" />
        <span className="text-muted-foreground animate-pulse text-sm font-medium">
          {t('common.loading', 'Yükleniyor...')}
        </span>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-lg font-medium text-muted-foreground mb-4">
          {t('quotation.detail.notFound', 'Teklif bulunamadı')}
        </p>
        <Button variant="outline" onClick={() => navigate('/quotations')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back', 'Geri')}
        </Button>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="flex items-center justify-end">
          <Button 
            type="button"
            onClick={handleStartApprovalFlow}
            disabled={startApprovalFlow.isPending || !quotation}
          >
            <Send className="h-4 w-4 mr-2" />
            {t('quotation.approval.sendForApproval', 'Onaya Gönder')}
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">
              {t('quotation.detail.title', 'Teklif Detayı: {{offerNo}}', {
                offerNo: quotation.offerNo || `#${quotation.id}`,
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {t('quotation.header.title', 'Teklif Bilgileri')}
              </h3>
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
                initialCurrency={quotation?.currency}
              />
            </div>

            <div className="space-y-1 pt-2 border-t">
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

            {watchedCurrency !== 2 && watchedCurrency !== 1 && (
              <div className="space-y-1 pt-2 border-t">
                <QuotationExchangeRateForm
                  exchangeRates={exchangeRates}
                  setExchangeRates={setExchangeRates}
                  baseCurrency={watchedCurrency}
                />
              </div>
            )}

            <div className="pt-2 border-t">
              <QuotationSummaryCard lines={lines} currency={watchedCurrency} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/quotations')}
            size="lg"
          >
            {t('common.cancel', 'İptal')}
          </Button>
          <Button type="submit" disabled={updateMutation.isPending} size="lg">
            {updateMutation.isPending
              ? t('common.saving', 'Kaydediliyor...')
              : t('common.save', 'Kaydet')}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
