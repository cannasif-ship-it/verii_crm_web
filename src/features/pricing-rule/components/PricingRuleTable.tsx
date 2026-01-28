import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePricingRuleHeaders } from '../hooks/usePricingRuleHeaders';
import { PricingRuleType, type PricingRuleHeaderGetDto } from '../types/pricing-rule-types';
import type { PagedFilter } from '@/types/api';
// İkonlar
import { 
  Edit2, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Building2,
  FileText,
  List,
  ShoppingCart
} from 'lucide-react';

interface PricingRuleTableProps {
  onEdit: (header: PricingRuleHeaderGetDto) => void;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: PagedFilter[];
  onPageChange?: (page: number) => void;
  onSortChange?: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
}

export function PricingRuleTable({ 
  onEdit,
  pageNumber = 1,
  pageSize = 20,
  sortBy,
  sortDirection,
  filters
}: PricingRuleTableProps): ReactElement {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = usePricingRuleHeaders({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    filters
  });

  // Kural Tipi Etiketi ve İkonu
  const getRuleTypeConfig = (type: PricingRuleType) => {
    switch (type) {
      case PricingRuleType.Demand:
        return { 
          label: t('pricingRule.ruleType.demand', 'Talep'), 
          className: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
          icon: List
        };
      case PricingRuleType.Quotation:
        return { 
          label: t('pricingRule.ruleType.quotation', 'Teklif'), 
          className: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20',
          icon: FileText
        };
      case PricingRuleType.Order:
        return { 
          label: t('pricingRule.ruleType.order', 'Sipariş'), 
          className: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
          icon: ShoppingCart
        };
      default:
        return { 
          label: t('pricingRule.ruleType.unknown', 'Bilinmiyor'), 
          className: 'bg-slate-50 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/20',
          icon: TrendingUp
        };
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString(i18n.language);
    } catch {
      return dateString;
    }
  };

  const isValid = (header: PricingRuleHeaderGetDto): boolean => {
    const now = new Date();
    const from = new Date(header.validFrom);
    const to = new Date(header.validTo);
    return header.isActive && from <= now && to >= now;
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
           <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-current text-pink-500" />
           <div className="text-sm text-muted-foreground animate-pulse">
             {t('pricingRule.loading', 'Yükleniyor...')}
           </div>
        </div>
      </div>
    );
  }

  const headers = data?.data || [];

  // Empty State
  if (headers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-4">
        <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-full">
            <TrendingUp className="h-8 w-8 opacity-50" />
        </div>
        <div className="text-center">
            <p className="text-lg font-medium text-slate-600 dark:text-slate-300">{t('pricingRule.list.empty', 'Henüz fiyat kuralı tanımlanmamış')}</p>
            <p className="text-sm text-slate-400 mt-1">Yeni bir kural ekleyerek başlayabilirsiniz.</p>
        </div>
      </div>
    );
  }

  // --- Ortak Stiller ---
  const headStyle = "cursor-pointer select-none text-slate-500 dark:text-slate-400 font-semibold py-4 text-xs uppercase tracking-wider";

  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white/50 dark:bg-transparent overflow-x-auto">
      <Table>
        <TableHeader className="bg-slate-50/50 dark:bg-white/5">
          <TableRow className="border-b border-slate-200 dark:border-white/10 hover:bg-transparent">
            <TableHead className={headStyle}>{t('pricingRule.table.ruleCode', 'Kural Kodu')}</TableHead>
            <TableHead className={headStyle}>{t('pricingRule.table.ruleName', 'Kural Adı')}</TableHead>
            <TableHead className={headStyle}>{t('pricingRule.table.ruleType', 'Kural Tipi')}</TableHead>
            <TableHead className={headStyle}>{t('pricingRule.table.validFrom', 'Başlangıç')}</TableHead>
            <TableHead className={headStyle}>{t('pricingRule.table.validTo', 'Bitiş')}</TableHead>
            <TableHead className={headStyle}>{t('pricingRule.table.customer', 'Müşteri')}</TableHead>
            <TableHead className={headStyle}>{t('pricingRule.table.status', 'Durum')}</TableHead>
            <TableHead className={`text-right ${headStyle}`}>{t('pricingRule.table.actions', 'İşlemler')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {headers.map((header, index) => {
            const ruleTypeConfig = getRuleTypeConfig(header.ruleType);
            const RuleIcon = ruleTypeConfig.icon;
            const isRuleValid = isValid(header);

            return (
              <TableRow 
                key={header.id || `rule-${index}`}
                className="group border-b border-slate-100 dark:border-white/5 transition-colors hover:bg-pink-50/40 dark:hover:bg-pink-500/5"
              >
                <TableCell className="font-medium text-slate-700 dark:text-slate-300">
                    <span className="font-mono text-xs bg-slate-100 dark:bg-white/10 px-2 py-1 rounded">{header.ruleCode}</span>
                </TableCell>
                
                <TableCell className="font-medium text-slate-900 dark:text-white">
                    {header.ruleName}
                </TableCell>
                
                <TableCell>
                  <Badge variant="outline" className={`gap-1.5 pl-2 pr-2.5 py-0.5 ${ruleTypeConfig.className}`}>
                    <RuleIcon size={12} />
                    {ruleTypeConfig.label}
                  </Badge>
                </TableCell>
                
                <TableCell className="text-slate-600 dark:text-slate-400 text-xs">
                    <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-400" />
                        {formatDate(header.validFrom)}
                    </div>
                </TableCell>
                
                <TableCell className="text-slate-600 dark:text-slate-400 text-xs">
                    <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-400" />
                        {formatDate(header.validTo)}
                    </div>
                </TableCell>
                
                <TableCell className="text-slate-600 dark:text-slate-400 text-xs">
                    {(header.customerName || header.erpCustomerCode) ? (
                        <div className="flex items-center gap-1.5">
                            <Building2 size={12} className="text-slate-400" />
                            <span className="truncate max-w-[150px]" title={header.customerName ?? header.erpCustomerCode ?? undefined}>
                                {header.customerName || header.erpCustomerCode}
                            </span>
                        </div>
                    ) : (
                        <span className="text-slate-400 italic">-</span>
                    )}
                </TableCell>
                
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`gap-1.5 pl-1.5 pr-2.5 py-0.5 border ${
                        isRuleValid 
                            ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20' 
                            : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20'
                    }`}
                  >
                    {isRuleValid ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {isRuleValid ? t('pricingRule.status.active', 'Aktif') : t('pricingRule.status.inactive', 'Pasif')}
                  </Badge>
                </TableCell>
                
                <TableCell className="text-right">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                        onClick={() => onEdit(header)}
                    >
                        <Edit2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}