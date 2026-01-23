import { type ReactElement, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePricingRuleHeader } from '../hooks/usePricingRuleHeader';
import { useCreatePricingRuleHeader } from '../hooks/useCreatePricingRuleHeader';
import { useUpdatePricingRuleHeader } from '../hooks/useUpdatePricingRuleHeader';
import { PricingRuleHeaderForm } from './PricingRuleHeaderForm';
import { PricingRuleLineTable } from './PricingRuleLineTable';
import { PricingRuleSalesmanTable } from './PricingRuleSalesmanTable';
import { PricingRuleType, type PricingRuleHeaderCreateDto, type PricingRuleLineFormState, type PricingRuleSalesmanFormState } from '../types/pricing-rule-types';
import type { PricingRuleHeaderGetDto } from '../types/pricing-rule-types';

interface PricingRuleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  header?: PricingRuleHeaderGetDto | null;
}

export function PricingRuleForm({ open, onOpenChange, header }: PricingRuleFormProps): ReactElement {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'header' | 'lines' | 'salesmen'>('header');
  const [headerData, setHeaderData] = useState<PricingRuleHeaderCreateDto>({
    ruleType: PricingRuleType.Quotation,
    ruleCode: '',
    ruleName: '',
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerId: null,
    erpCustomerCode: null,
    branchCode: null,
    priceIncludesVat: false,
    isActive: true,
    lines: [],
    salesmen: [],
  });
  const [lines, setLines] = useState<PricingRuleLineFormState[]>([]);
  const [salesmen, setSalesmen] = useState<PricingRuleSalesmanFormState[]>([]);

  const { data: existingHeader, isLoading } = usePricingRuleHeader(header?.id || 0);
  const createMutation = useCreatePricingRuleHeader();
  const updateMutation = useUpdatePricingRuleHeader();

  useEffect(() => {
    if (existingHeader) {
      const headerFormData: PricingRuleHeaderCreateDto = {
        ruleType: existingHeader.ruleType,
        ruleCode: existingHeader.ruleCode,
        ruleName: existingHeader.ruleName,
        validFrom: existingHeader.validFrom.split('T')[0],
        validTo: existingHeader.validTo.split('T')[0],
        customerId: existingHeader.customerId,
        erpCustomerCode: existingHeader.erpCustomerCode,
        branchCode: existingHeader.branchCode,
        priceIncludesVat: existingHeader.priceIncludesVat,
        isActive: existingHeader.isActive,
        lines: [],
        salesmen: [],
      };
      setHeaderData(headerFormData);

      if (existingHeader.lines) {
        setLines(
          existingHeader.lines.map((line) => ({
            id: `existing-${line.id}`,
            stokCode: line.stokCode,
            minQuantity: line.minQuantity,
            maxQuantity: line.maxQuantity,
            fixedUnitPrice: line.fixedUnitPrice,
            currencyCode: line.currencyCode ? (typeof line.currencyCode === 'string' ? Number(line.currencyCode) || 1 : line.currencyCode) : 1,
            discountRate1: line.discountRate1,
            discountAmount1: line.discountAmount1,
            discountRate2: line.discountRate2,
            discountAmount2: line.discountAmount2,
            discountRate3: line.discountRate3,
            discountAmount3: line.discountAmount3,
            isEditing: false,
          }))
        );
      }

      if (existingHeader.salesmen) {
        setSalesmen(
          existingHeader.salesmen.map((salesman) => ({
            id: `existing-${salesman.id}`,
            salesmanId: salesman.salesmanId,
          }))
        );
      }
    } else {
      setHeaderData({
        ruleType: PricingRuleType.Quotation,
        ruleCode: '',
        ruleName: '',
        validFrom: new Date().toISOString().split('T')[0],
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        customerId: null,
        erpCustomerCode: null,
        branchCode: null,
        priceIncludesVat: false,
        isActive: true,
        lines: [],
        salesmen: [],
      });
      setLines([]);
      setSalesmen([]);
    }
  }, [existingHeader]);

  useEffect(() => {
    if (!open) {
      setActiveTab('header');
      setLines([]);
      setSalesmen([]);
    }
  }, [open]);

  const handleSubmit = async (): Promise<void> => {
    const validLines = lines.filter((line) => line.stokCode && line.stokCode.trim() !== '');

    if (validLines.length === 0) {
      toast.error(
        t('pricingRule.form.lines.required', 'En az 1 satır eklenmelidir'),
        {
          description: t('pricingRule.form.lines.requiredMessage', 'Lütfen en az bir satır ekleyin'),
        }
      );
      setActiveTab('lines');
      return;
    }

    const linesWithInvalidMinQuantity = validLines.filter((line) => 
      line.minQuantity < 0 || 
      isNaN(line.minQuantity) || 
      line.minQuantity === null || 
      line.minQuantity === undefined
    );
    
    if (linesWithInvalidMinQuantity.length > 0) {
      toast.error(
        t('pricingRule.form.lines.minQuantityInvalid', 'Geçersiz Min Miktar'),
        {
          description: t('pricingRule.form.lines.minQuantityInvalidMessage', 'Minimum miktar 0\'dan küçük olamaz'),
        }
      );
      setActiveTab('lines');
      return;
    }

    const linesWithInvalidCurrency = validLines.filter((line) => 
      !line.currencyCode || 
      line.currencyCode === undefined || 
      line.currencyCode === null
    );
    
    if (linesWithInvalidCurrency.length > 0) {
      toast.error(
        t('pricingRule.form.lines.currencyCodeRequired', 'Döviz Tipi Zorunlu'),
        {
          description: t('pricingRule.form.lines.currencyCodeRequiredMessage', 'Tüm satırlarda döviz tipi seçilmelidir'),
        }
      );
      setActiveTab('lines');
      return;
    }

    try {
      const payload: PricingRuleHeaderCreateDto = {
        ...headerData,
        lines: validLines.map(({ id, isEditing, ...line }) => ({
          ...line,
          pricingRuleHeaderId: 0,
          minQuantity: line.minQuantity ?? 0,
          currencyCode: typeof line.currencyCode === 'number' ? String(line.currencyCode) : (line.currencyCode ? String(line.currencyCode) : ''),
          discountRate1: line.discountRate1 ?? 0,
          discountAmount1: line.discountAmount1 ?? 0,
          discountRate2: line.discountRate2 ?? 0,
          discountAmount2: line.discountAmount2 ?? 0,
          discountRate3: line.discountRate3 ?? 0,
          discountAmount3: line.discountAmount3 ?? 0,
        })),
        salesmen: salesmen.map(({ id, ...salesman }) => ({
          ...salesman,
          pricingRuleHeaderId: 0,
        })),
      };

      if (header?.id) {
        const result = await updateMutation.mutateAsync({ id: header.id, data: payload });
        if (result) {
          toast.success(
            t('pricingRule.form.updateSuccess', 'Fiyat Kuralı Güncellendi'),
            {
              description: t('pricingRule.form.updateSuccessMessage', 'Fiyat kuralı başarıyla güncellendi'),
            }
          );
          onOpenChange(false);
        }
      } else {
        const result = await createMutation.mutateAsync(payload);
        if (result) {
          toast.success(
            t('pricingRule.form.createSuccess', 'Fiyat Kuralı Oluşturuldu'),
            {
              description: t('pricingRule.form.createSuccessMessage', 'Fiyat kuralı başarıyla oluşturuldu'),
            }
          );
          onOpenChange(false);
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('pricingRule.form.error', 'Bir hata oluştu');
      toast.error(
        t('pricingRule.form.error', 'Hata'),
        {
          description: errorMessage,
        }
      );
    }
  };

  if (isLoading && header?.id) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('common.loading', 'Yükleniyor...')}
            </DialogTitle>
            <DialogDescription>
              {t('common.loadingDescription', 'Veriler yükleniyor, lütfen bekleyin')}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>
            {header?.id
              ? t('pricingRule.form.edit', 'Fiyat Kuralı Düzenle')
              : t('pricingRule.form.create', 'Yeni Fiyat Kuralı')}
          </DialogTitle>
          <DialogDescription>
            {header?.id
              ? t('pricingRule.form.editDescription', 'Fiyat kuralı bilgilerini düzenleyin')
              : t('pricingRule.form.createDescription', 'Yeni fiyat kuralı bilgilerini girin')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col px-6 pb-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'header' | 'lines' | 'salesmen')} className="w-full flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-3 mb-4 flex-shrink-0">
              <TabsTrigger value="header">
                {t('pricingRule.form.tabs.header', 'Genel Bilgiler')}
              </TabsTrigger>
              <TabsTrigger value="lines">
                {t('pricingRule.form.tabs.lines', 'Satırlar')} ({lines.length})
              </TabsTrigger>
              <TabsTrigger value="salesmen">
                {t('pricingRule.form.tabs.salesmen', 'Satışçılar')} ({salesmen.length})
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto min-h-0">
              <TabsContent value="header" className="mt-0">
                <PricingRuleHeaderForm
                  header={headerData}
                  setHeader={setHeaderData}
                />
              </TabsContent>

              <TabsContent value="lines" className="mt-0">
                <PricingRuleLineTable
                  lines={lines}
                  setLines={setLines}
                  header={header || existingHeader || null}
                />
              </TabsContent>

              <TabsContent value="salesmen" className="mt-0">
                <PricingRuleSalesmanTable
                  salesmen={salesmen}
                  setSalesmen={setSalesmen}
                  header={header || existingHeader || null}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter className="px-6 pb-6 pt-4 border-t flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {t('common.cancel', 'İptal')}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending
              ? t('common.saving', 'Kaydediliyor...')
              : header?.id
                ? t('common.update', 'Güncelle')
                : t('common.create', 'Oluştur')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
