import { type ReactElement, useState } from 'react';
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
import { useCustomersForPricingRule } from '../hooks/useCustomersForPricingRule';
import { CustomerSelectDialog, type CustomerSelectionResult } from '@/components/shared';
import { PricingRuleType, type PricingRuleHeaderCreateDto } from '../types/pricing-rule-types';
import { Button } from '@/components/ui/button';
// İkonlar
import { 
  Search, 
  X, 
  List, 
  Hash, 
  Type, 
  Calendar, 
  Building2, 
  Percent, 
  Activity 
} from 'lucide-react';

interface PricingRuleHeaderFormProps {
  header: PricingRuleHeaderCreateDto;
  setHeader: (header: PricingRuleHeaderCreateDto) => void;
}

// --- TASARIM SABİTLERİ (Diğer formlarla uyumlu) ---
const INPUT_STYLE = `
  h-11 rounded-lg
  bg-slate-50 dark:bg-[#0c0516] 
  border border-slate-200 dark:border-white/10 
  text-slate-900 dark:text-white text-sm
  placeholder:text-slate-400 dark:placeholder:text-slate-600 
  
  focus-visible:ring-0 focus-visible:ring-offset-0 
  
  /* LIGHT MODE FOCUS */
  focus:bg-white 
  focus:border-pink-500 
  focus:shadow-[0_0_0_3px_rgba(236,72,153,0.15)] 

  /* DARK MODE FOCUS */
  dark:focus:bg-[#0c0516] 
  dark:focus:border-pink-500/60 
  dark:focus:shadow-[0_0_0_3px_rgba(236,72,153,0.1)]

  transition-all duration-200
`;

const LABEL_STYLE = "text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold ml-1 mb-1.5 block flex items-center gap-1.5";

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

  const selectedCustomer = customers?.find((c) => c.id === header.customerId);
  const displayValue = selectedCustomer
    ? selectedCustomer.name
    : header.erpCustomerCode
      ? `ERP: ${header.erpCustomerCode}`
      : '';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Kural Temel Bilgileri */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-0">
          <Label htmlFor="ruleType" className={LABEL_STYLE}>
            <List size={12} className="text-pink-500" />
            {t('pricingRule.header.ruleType', 'Kural Tipi')} *
          </Label>
          <Select
            value={header.ruleType?.toString()}
            onValueChange={(value) => handleChange('ruleType', parseInt(value) as PricingRuleType)}
          >
            <SelectTrigger id="ruleType" className={INPUT_STYLE}>
              <SelectValue placeholder={t('pricingRule.header.ruleTypePlaceholder', 'Kural tipi seçin')} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#1a1025] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white shadow-xl">
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

        <div className="space-y-0">
          <Label htmlFor="ruleCode" className={LABEL_STYLE}>
            <Hash size={12} className="text-pink-500" />
            {t('pricingRule.header.ruleCode', 'Kural Kodu')} *
          </Label>
          <Input
            id="ruleCode"
            value={header.ruleCode}
            onChange={(e) => handleChange('ruleCode', e.target.value)}
            placeholder={t('pricingRule.header.ruleCodePlaceholder', 'Kural kodu girin')}
            maxLength={50}
            className={INPUT_STYLE}
          />
        </div>

        <div className="space-y-0 md:col-span-2">
          <Label htmlFor="ruleName" className={LABEL_STYLE}>
            <Type size={12} className="text-pink-500" />
            {t('pricingRule.header.ruleName', 'Kural Adı')} *
          </Label>
          <Input
            id="ruleName"
            value={header.ruleName}
            onChange={(e) => handleChange('ruleName', e.target.value)}
            placeholder={t('pricingRule.header.ruleNamePlaceholder', 'Kural adı girin')}
            maxLength={250}
            className={INPUT_STYLE}
          />
        </div>
      </div>

      {/* 2. Tarih ve Müşteri */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-0">
          <Label htmlFor="validFrom" className={LABEL_STYLE}>
            <Calendar size={12} className="text-pink-500" />
            {t('pricingRule.header.validFrom', 'Geçerlilik Başlangıç')} *
          </Label>
          <Input
            id="validFrom"
            type="date"
            value={header.validFrom}
            onChange={(e) => handleChange('validFrom', e.target.value)}
            className={INPUT_STYLE}
          />
        </div>

        <div className="space-y-0">
          <Label htmlFor="validTo" className={LABEL_STYLE}>
            <Calendar size={12} className="text-pink-500" />
            {t('pricingRule.header.validTo', 'Geçerlilik Bitiş')} *
          </Label>
          <Input
            id="validTo"
            type="date"
            value={header.validTo}
            onChange={(e) => handleChange('validTo', e.target.value)}
            className={INPUT_STYLE}
          />
        </div>

        <div className="space-y-0 md:col-span-2">
          <Label htmlFor="customerId" className={LABEL_STYLE}>
            <Building2 size={12} className="text-pink-500" />
            {t('pricingRule.header.customer', 'Müşteri')}
          </Label>
          <div className="flex gap-2">
            <Input
              id="customerId"
              readOnly
              value={displayValue}
              placeholder={t('pricingRule.header.customerPlaceholder', 'Müşteri seçin (Opsiyonel)')}
              className={`${INPUT_STYLE} flex-1`}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"
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
                className="h-11 w-11 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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
      </div>

      {/* 3. Diğer Ayarlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="space-y-0">
          <Label htmlFor="branchCode" className={LABEL_STYLE}>
            <Building2 size={12} className="text-pink-500" />
            {t('pricingRule.header.branchCode', 'Şube Kodu')}
          </Label>
          <Input
            id="branchCode"
            type="number"
            value={header.branchCode || ''}
            onChange={(e) => handleChange('branchCode', e.target.value ? parseInt(e.target.value) : null)}
            placeholder={t('pricingRule.header.branchCodePlaceholder', 'Şube kodu (Opsiyonel)')}
            className={INPUT_STYLE}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#0c0516] transition-colors h-full">
          <Label htmlFor="priceIncludesVat" className="cursor-pointer flex items-center gap-2 font-semibold text-sm text-slate-700 dark:text-slate-300">
            <Percent size={16} className="text-pink-500" />
            {t('pricingRule.header.priceIncludesVat', 'KDV Dahil')}
          </Label>
          <Switch
            id="priceIncludesVat"
            checked={header.priceIncludesVat}
            onCheckedChange={(checked) => handleChange('priceIncludesVat', checked)}
            className="data-[state=checked]:bg-pink-600"
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#0c0516] transition-colors h-full">
          <Label htmlFor="isActive" className="cursor-pointer flex items-center gap-2 font-semibold text-sm text-slate-700 dark:text-slate-300">
            <Activity size={16} className="text-pink-500" />
            {t('pricingRule.header.isActive', 'Aktif')}
          </Label>
          <Switch
            id="isActive"
            checked={header.isActive}
            onCheckedChange={(checked) => handleChange('isActive', checked)}
            className="data-[state=checked]:bg-green-500"
          />
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