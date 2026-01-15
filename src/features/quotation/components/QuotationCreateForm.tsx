import { type ReactElement, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCreateQuotationBulk, usePriceRuleOfQuotation } from '../api/quotation-api';
import { useCustomerOptions } from '@/features/customer-management/hooks/useCustomerOptions';
import { QuotationHeaderForm } from './QuotationHeaderForm';
import { QuotationLineTable } from './QuotationLineTable';
import { QuotationExchangeRateForm } from './QuotationExchangeRateForm';
import { QuotationSummaryCard } from './QuotationSummaryCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createQuotationSchema, type CreateQuotationSchema } from '../schemas/quotation-schema';
import type { QuotationLineFormState, QuotationExchangeRateFormState, QuotationBulkCreateDto, CreateQuotationDto, PricingRuleLineGetDto } from '../types/quotation-types';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { useEffect, useMemo } from 'react';
import { useQuotationCalculations } from '../hooks/useQuotationCalculations';
import { useCurrencyOptions } from '@/services/hooks/useCurrencyOptions';
import { useExchangeRate } from '@/services/hooks/useExchangeRate';
import { findExchangeRateByDovizTipi } from '../utils/price-conversion';

export function QuotationCreateForm(): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setPageTitle } = useUIStore();
  const user = useAuthStore((state) => state.user);
  const [lines, setLines] = useState<QuotationLineFormState[]>([]);
  const [exchangeRates, setExchangeRates] = useState<QuotationExchangeRateFormState[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRuleLineGetDto[]>([]);
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
        t('quotation.create.error', 'Teklif Oluşturulamadı'),
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
        const errorMessage = firstError?.message || t('quotation.create.validationError', 'Lütfen form alanlarını kontrol ediniz.');
        toast.error(
          t('quotation.create.error', 'Teklif Oluşturulamadı'),
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

  return (
    <FormProvider {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">{t('quotation.create.title', 'Yeni Teklif Oluştur')}</CardTitle>
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
              />
            </div>

            <div className="space-y-1 pt-2 border-t">
              <QuotationLineTable
                lines={lines}
                setLines={setLines}
                currency={watchedCurrency}
                exchangeRates={exchangeRates}
                pricingRules={pricingRules}
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
            onClick={() => navigate(-1)}
            size="lg"
          >
            {t('common.cancel', 'İptal')}
          </Button>
          <Button type="submit" disabled={createMutation.isPending} size="lg">
            {createMutation.isPending
              ? t('common.saving', 'Kaydediliyor...')
              : t('common.save', 'Kaydet')}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
