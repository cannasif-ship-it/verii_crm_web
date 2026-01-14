import { type ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { pricingRuleLineSchema } from '../schemas/pricing-rule-schema';
import type { PricingRuleLineFormState } from '../types/pricing-rule-types';
import { ProductSelectDialog, type ProductSelectionResult } from '@/components/shared';
import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useCurrencyOptions } from '@/services/hooks/useCurrencyOptions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PricingRuleLineFormProps {
  line: PricingRuleLineFormState;
  onSave: (line: PricingRuleLineFormState) => void;
  onCancel: () => void;
}

export function PricingRuleLineForm({
  line,
  onSave,
  onCancel,
}: PricingRuleLineFormProps): ReactElement {
  const { t } = useTranslation();
  const { currencyOptions } = useCurrencyOptions();
  const [productDialogOpen, setProductDialogOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(pricingRuleLineSchema),
    defaultValues: {
      ...line,
      minQuantity: line.minQuantity ?? 0,
      currencyCode: line.currencyCode || 'TRY',
      discountRate1: line.discountRate1 ?? 0,
      discountAmount1: line.discountAmount1 ?? 0,
      discountRate2: line.discountRate2 ?? 0,
      discountAmount2: line.discountAmount2 ?? 0,
      discountRate3: line.discountRate3 ?? 0,
      discountAmount3: line.discountAmount3 ?? 0,
    },
  });

  const handleSubmit = (data: unknown): void => {
    const formData = data as PricingRuleLineFormState;
    if (!formData.stokCode || formData.stokCode.trim() === '') {
      form.setError('stokCode', {
        type: 'manual',
        message: t('pricingRule.lines.stokCodeRequired', 'Stok kodu zorunludur'),
      });
      return;
    }

    if (formData.minQuantity < 0 || isNaN(formData.minQuantity) || formData.minQuantity === null || formData.minQuantity === undefined) {
      form.setError('minQuantity', {
        type: 'manual',
        message: t('pricingRule.lines.minQuantityMin', 'Minimum miktar 0\'dan küçük olamaz'),
      });
      return;
    }

    const savedData: PricingRuleLineFormState = {
      ...formData,
      id: line.id,
      minQuantity: formData.minQuantity ?? 0,
      currencyCode: formData.currencyCode || 'TRY',
      discountRate1: formData.discountRate1 ?? 0,
      discountAmount1: formData.discountAmount1 ?? 0,
      discountRate2: formData.discountRate2 ?? 0,
      discountAmount2: formData.discountAmount2 ?? 0,
      discountRate3: formData.discountRate3 ?? 0,
      discountAmount3: formData.discountAmount3 ?? 0,
    };

    onSave(savedData);
  };

  const handleProductSelect = (product: ProductSelectionResult): void => {
    form.setValue('stokCode', product.code);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 p-4 border rounded bg-card">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stokCode">
            {t('pricingRule.lines.stokCode', 'Stok Kodu')} *
          </Label>
          <div className="flex gap-2">
            <Input
              id="stokCode"
              {...form.register('stokCode')}
              readOnly
              placeholder={t('pricingRule.lines.stokCodePlaceholder', 'Ürün kodu')}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setProductDialogOpen(true)}
              title={t('pricingRule.lines.selectProduct', 'Ürün Seç')}
            >
              <Search className="h-4 w-4" />
            </Button>
            {form.watch('stokCode') && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  form.setValue('stokCode', '');
                  form.setValue('fixedUnitPrice', null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {form.formState.errors.stokCode && (
            <p className="text-sm text-destructive">
              {form.formState.errors.stokCode.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="minQuantity">
            {t('pricingRule.lines.minQuantity', 'Min Miktar')} *
          </Label>
          <Input
            id="minQuantity"
            type="number"
            step="0.01"
            min="0"
            {...form.register('minQuantity', { 
              valueAsNumber: true,
              setValueAs: (v: string) => v === '' ? 0 : parseFloat(v) || 0,
            })}
          />
          {form.formState.errors.minQuantity && (
            <p className="text-sm text-destructive">
              {form.formState.errors.minQuantity.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxQuantity">
            {t('pricingRule.lines.maxQuantity', 'Max Miktar')}
          </Label>
          <Input
            id="maxQuantity"
            type="number"
            step="0.01"
            min="0"
            {...form.register('maxQuantity', {
              valueAsNumber: true,
              setValueAs: (v: string) => (v === '' ? null : parseFloat(v)),
            })}
          />
          {form.formState.errors.maxQuantity && (
            <p className="text-sm text-destructive">
              {form.formState.errors.maxQuantity.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fixedUnitPrice">
            {t('pricingRule.lines.fixedUnitPrice', 'Sabit Birim Fiyat')}
          </Label>
          <Input
            id="fixedUnitPrice"
            type="number"
            step="0.01"
            min="0"
            {...form.register('fixedUnitPrice', {
              valueAsNumber: true,
              setValueAs: (v: string) => (v === '' ? null : parseFloat(v)),
            })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currencyCode">
            {t('pricingRule.lines.currencyCode', 'Para Birimi')}
          </Label>
          <Select
            value={form.watch('currencyCode') || 'TRY'}
            onValueChange={(value) => form.setValue('currencyCode', value)}
          >
            <SelectTrigger id="currencyCode">
              <SelectValue placeholder={t('pricingRule.lines.selectCurrency', 'Para birimi seçin')} />
            </SelectTrigger>
            <SelectContent>
              {currencyOptions.map((currency) => {
                const currencyValue = currency.code || currency.label || 'TRY';
                return (
                  <SelectItem key={currency.dovizTipi} value={currencyValue}>
                    {currency.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="discountRate1">
            {t('pricingRule.lines.discount1Rate', 'İndirim Oranı 1')} (%)
          </Label>
          <Input
            id="discountRate1"
            type="number"
            step="0.01"
            min="0"
            max="100"
            {...form.register('discountRate1', { 
              valueAsNumber: true,
              setValueAs: (v: string) => v === '' ? 0 : parseFloat(v) || 0,
            })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="discountAmount1">
            {t('pricingRule.lines.discount1Amount', 'İndirim Tutarı 1')}
          </Label>
          <Input
            id="discountAmount1"
            type="number"
            step="0.01"
            min="0"
            {...form.register('discountAmount1', { 
              valueAsNumber: true,
              setValueAs: (v: string) => v === '' ? 0 : parseFloat(v) || 0,
            })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="discountRate2">
            {t('pricingRule.lines.discount2Rate', 'İndirim Oranı 2')} (%)
          </Label>
          <Input
            id="discountRate2"
            type="number"
            step="0.01"
            min="0"
            max="100"
            {...form.register('discountRate2', { 
              valueAsNumber: true,
              setValueAs: (v: string) => v === '' ? 0 : parseFloat(v) || 0,
            })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="discountAmount2">
            {t('pricingRule.lines.discount2Amount', 'İndirim Tutarı 2')}
          </Label>
          <Input
            id="discountAmount2"
            type="number"
            step="0.01"
            min="0"
            {...form.register('discountAmount2', { 
              valueAsNumber: true,
              setValueAs: (v: string) => v === '' ? 0 : parseFloat(v) || 0,
            })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="discountRate3">
            {t('pricingRule.lines.discount3Rate', 'İndirim Oranı 3')} (%)
          </Label>
          <Input
            id="discountRate3"
            type="number"
            step="0.01"
            min="0"
            max="100"
            {...form.register('discountRate3', { 
              valueAsNumber: true,
              setValueAs: (v: string) => v === '' ? 0 : parseFloat(v) || 0,
            })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="discountAmount3">
            {t('pricingRule.lines.discount3Amount', 'İndirim Tutarı 3')}
          </Label>
          <Input
            id="discountAmount3"
            type="number"
            step="0.01"
            min="0"
            {...form.register('discountAmount3', { 
              valueAsNumber: true,
              setValueAs: (v: string) => v === '' ? 0 : parseFloat(v) || 0,
            })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel', 'İptal')}
        </Button>
        <Button 
          type="submit"
          disabled={!form.watch('stokCode') || form.watch('stokCode').trim() === ''}
        >
          {t('common.save', 'Kaydet')}
        </Button>
      </div>

      <ProductSelectDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        onSelect={handleProductSelect}
      />
    </form>
  );
}
