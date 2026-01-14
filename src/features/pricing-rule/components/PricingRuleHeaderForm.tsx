import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCustomersForPricingRule } from '../api/pricing-rule-api';
import { CustomerSelectDialog, type CustomerSelectionResult } from '@/components/shared';
import { PricingRuleType, type PricingRuleHeaderCreateDto } from '../types/pricing-rule-types';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface PricingRuleHeaderFormProps {
  header: PricingRuleHeaderCreateDto;
  setHeader: (header: PricingRuleHeaderCreateDto) => void;
}

export function PricingRuleHeaderForm({ header, setHeader }: PricingRuleHeaderFormProps): ReactElement {
  const { t } = useTranslation();
  const { data: customers } = useCustomersForPricingRule();
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);

  const handleChange = (field: keyof PricingRuleHeaderCreateDto, value: unknown): void => {
    setHeader({ ...header, [field]: value });
  };

  const handleCustomerSelect = (result: CustomerSelectionResult): void => {
    if (result.customerId) {
      handleChange('customerId', result.customerId);
      handleChange('erpCustomerCode', null);
    } else if (result.erpCustomerCode) {
      handleChange('customerId', null);
      handleChange('erpCustomerCode', result.erpCustomerCode);
    }
  };

  const selectedCustomer = customers.find((c) => c.id === header.customerId);
  const displayValue = selectedCustomer
    ? selectedCustomer.name
    : header.erpCustomerCode
      ? `ERP: ${header.erpCustomerCode}`
      : '';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ruleType">
            {t('pricingRule.header.ruleType', 'Kural Tipi')} *
          </Label>
          <Select
            value={header.ruleType?.toString()}
            onValueChange={(value) => handleChange('ruleType', parseInt(value) as PricingRuleType)}
          >
            <SelectTrigger id="ruleType">
              <SelectValue placeholder={t('pricingRule.header.ruleTypePlaceholder', 'Kural tipi seçin')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PricingRuleType.Demand.toString()}>
                {t('pricingRule.ruleType.demand', 'Talep')}
              </SelectItem>
              <SelectItem value={PricingRuleType.Quotation.toString()}>
                {t('pricingRule.ruleType.quotation', 'Teklif')}
              </SelectItem>
              <SelectItem value={PricingRuleType.Order.toString()}>
                {t('pricingRule.ruleType.order', 'Sipariş')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ruleCode">
            {t('pricingRule.header.ruleCode', 'Kural Kodu')} *
          </Label>
          <Input
            id="ruleCode"
            value={header.ruleCode}
            onChange={(e) => handleChange('ruleCode', e.target.value)}
            placeholder={t('pricingRule.header.ruleCodePlaceholder', 'Kural kodu girin')}
            maxLength={50}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="ruleName">
            {t('pricingRule.header.ruleName', 'Kural Adı')} *
          </Label>
          <Input
            id="ruleName"
            value={header.ruleName}
            onChange={(e) => handleChange('ruleName', e.target.value)}
            placeholder={t('pricingRule.header.ruleNamePlaceholder', 'Kural adı girin')}
            maxLength={250}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="validFrom">
            {t('pricingRule.header.validFrom', 'Geçerlilik Başlangıç')} *
          </Label>
          <Input
            id="validFrom"
            type="date"
            value={header.validFrom}
            onChange={(e) => handleChange('validFrom', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="validTo">
            {t('pricingRule.header.validTo', 'Geçerlilik Bitiş')} *
          </Label>
          <Input
            id="validTo"
            type="date"
            value={header.validTo}
            onChange={(e) => handleChange('validTo', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerId">
            {t('pricingRule.header.customer', 'Müşteri')}
          </Label>
          <div className="flex gap-2">
            <Input
              id="customerId"
              readOnly
              value={displayValue}
              placeholder={t('pricingRule.header.customerPlaceholder', 'Müşteri seçin (Opsiyonel)')}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setCustomerDialogOpen(true)}
              title={t('pricingRule.header.selectCustomer', 'Müşteri Seç')}
            >
              <Search className="h-4 w-4" />
            </Button>
            {(header.customerId || header.erpCustomerCode) && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  handleChange('customerId', null);
                  handleChange('erpCustomerCode', null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="branchCode">
            {t('pricingRule.header.branchCode', 'Şube Kodu')}
          </Label>
          <Input
            id="branchCode"
            type="number"
            value={header.branchCode || ''}
            onChange={(e) => handleChange('branchCode', e.target.value ? parseInt(e.target.value) : null)}
            placeholder={t('pricingRule.header.branchCodePlaceholder', 'Şube kodu (Opsiyonel)')}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="priceIncludesVat">
              {t('pricingRule.header.priceIncludesVat', 'KDV Dahil')}
            </Label>
            <Switch
              id="priceIncludesVat"
              checked={header.priceIncludesVat}
              onCheckedChange={(checked) => handleChange('priceIncludesVat', checked)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">
              {t('pricingRule.header.isActive', 'Aktif')}
            </Label>
            <Switch
              id="isActive"
              checked={header.isActive}
              onCheckedChange={(checked) => handleChange('isActive', checked)}
            />
          </div>
        </div>
      </div>

      <CustomerSelectDialog
        open={customerDialogOpen}
        onOpenChange={setCustomerDialogOpen}
        onSelect={handleCustomerSelect}
      />
    </div>
  );
}
