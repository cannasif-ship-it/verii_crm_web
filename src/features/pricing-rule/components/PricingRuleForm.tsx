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
// İkonlar
import { 
  FileText, 
  List, 
  Users, 
  Save, 
  X, 
  Loader2,
  Tag
} from 'lucide-react';

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
        <DialogContent className="max-w-6xl max-h-[90vh] flex items-center justify-center bg-white dark:bg-[#130822] border border-slate-100 dark:border-white/10">
           <div className="flex flex-col items-center gap-4">
             <div className="relative">
               <div className="h-12 w-12 animate-spin rounded-full border-b-4 border-pink-500" />
               <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border-pink-500 opacity-20" />
             </div>
             <div className="text-sm font-medium text-slate-500 animate-pulse">
               {t('pricingRule.loadingDescription', 'Veriler yükleniyor...')}
             </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col p-0 bg-white dark:bg-[#130822] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white shadow-2xl shadow-slate-200/50 dark:shadow-black/50 sm:rounded-2xl overflow-hidden transition-colors duration-300">
        
        {/* HEADER: Sabit */}
        <DialogHeader className="px-6 py-5 bg-white/80 dark:bg-[#130822]/90 backdrop-blur-md border-b border-slate-100 dark:border-white/5 flex-shrink-0 flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 border border-pink-500/10 flex items-center justify-center text-pink-500 shrink-0">
               <Tag size={20} />
             </div>
             <div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                  {header?.id
                    ? t('pricingRule.form.edit', 'Fiyat Kuralı Düzenle')
                    : t('pricingRule.form.create', 'Yeni Fiyat Kuralı')}
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                  {header?.id
                    ? t('pricingRule.form.editDescription', 'Fiyat kuralı bilgilerini düzenleyin')
                    : t('pricingRule.form.createDescription', 'Yeni fiyat kuralı bilgilerini girin')}
                </DialogDescription>
             </div>
          </div>
        </DialogHeader>

        {/* BODY: İçerik Alanı */}
        <div className="flex-1 min-h-0 flex flex-col">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'header' | 'lines' | 'salesmen')} className="w-full flex-1 flex flex-col min-h-0">
            
            {/* Tabs Listesi - Sabit */}
            <div className="px-6 pt-4 pb-2 bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                <TabsList className="bg-slate-200/50 dark:bg-white/10 p-1 rounded-lg h-auto grid grid-cols-3 w-full max-w-md">
                  <TabsTrigger value="header" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-[#1a1025] data-[state=active]:text-pink-600 dark:data-[state=active]:text-pink-400 data-[state=active]:shadow-sm py-2 text-xs font-medium transition-all">
                    <FileText size={14} className="mr-2" />
                    {t('pricingRule.form.tabs.header', 'Genel Bilgiler')}
                  </TabsTrigger>
                  <TabsTrigger value="lines" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-[#1a1025] data-[state=active]:text-pink-600 dark:data-[state=active]:text-pink-400 data-[state=active]:shadow-sm py-2 text-xs font-medium transition-all">
                    <List size={14} className="mr-2" />
                    {t('pricingRule.form.tabs.lines', 'Satırlar')} 
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-[10px]">{lines.length}</span>
                  </TabsTrigger>
                  <TabsTrigger value="salesmen" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-[#1a1025] data-[state=active]:text-pink-600 dark:data-[state=active]:text-pink-400 data-[state=active]:shadow-sm py-2 text-xs font-medium transition-all">
                    <Users size={14} className="mr-2" />
                    {t('pricingRule.form.tabs.salesmen', 'Satışçılar')}
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-[10px]">{salesmen.length}</span>
                  </TabsTrigger>
                </TabsList>
            </div>

            {/* Tab İçerikleri - Kaydırılabilir */}
            <div className="flex-1 overflow-y-auto min-h-0 p-6 custom-scrollbar bg-slate-50/30 dark:bg-transparent">
              <TabsContent value="header" className="mt-0 h-full">
                <PricingRuleHeaderForm
                  header={headerData}
                  setHeader={setHeaderData}
                />
              </TabsContent>

              <TabsContent value="lines" className="mt-0 h-full">
                <PricingRuleLineTable
                  lines={lines}
                  setLines={setLines}
                  header={header || existingHeader || null}
                />
              </TabsContent>

              <TabsContent value="salesmen" className="mt-0 h-full">
                <PricingRuleSalesmanTable
                  salesmen={salesmen}
                  setSalesmen={setSalesmen}
                  header={header || existingHeader || null}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* FOOTER: Sabit */}
        <DialogFooter className="px-6 py-4 bg-white/80 dark:bg-[#130822]/90 backdrop-blur-md border-t border-slate-100 dark:border-white/5 flex-shrink-0 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createMutation.isPending || updateMutation.isPending}
            className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
          >
            <X size={16} className="mr-2" />
            {t('pricingRule.form.cancel', 'İptal')}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
            className="bg-gradient-to-r from-pink-600 to-orange-600 text-white font-bold border-0 hover:shadow-lg hover:shadow-pink-500/20 transition-all transform active:scale-95 px-6"
          >
            {createMutation.isPending || updateMutation.isPending ? (
                <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    {t('pricingRule.form.saving', 'Kaydediliyor...')}
                </>
            ) : (
                <>
                    <Save size={16} className="mr-2" />
                    {header?.id ? t('pricingRule.form.update', 'Güncelle') : t('pricingRule.form.createButton', 'Oluştur')}
                </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}