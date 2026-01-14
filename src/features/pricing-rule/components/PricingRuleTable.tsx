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
import { usePricingRuleHeaders } from '../api/pricing-rule-api';
import { PricingRuleType, type PricingRuleHeaderGetDto } from '../types/pricing-rule-types';
import { Edit, TrendingUp } from 'lucide-react';

interface PricingRuleTableProps {
  onEdit: (header: PricingRuleHeaderGetDto) => void;
}

export function PricingRuleTable({ onEdit }: PricingRuleTableProps): ReactElement {
  const { t } = useTranslation();
  const { data, isLoading } = usePricingRuleHeaders();

  const getRuleTypeLabel = (type: PricingRuleType): string => {
    const labels: Record<PricingRuleType, string> = {
      [PricingRuleType.Demand]: t('pricingRule.ruleType.demand', 'Talep'),
      [PricingRuleType.Quotation]: t('pricingRule.ruleType.quotation', 'Teklif'),
      [PricingRuleType.Order]: t('pricingRule.ruleType.order', 'Sipariş'),
    };
    return labels[type] || t('pricingRule.ruleType.unknown', 'Bilinmiyor');
  };

  const getRuleTypeColor = (type: PricingRuleType): string => {
    const colors: Record<PricingRuleType, string> = {
      [PricingRuleType.Demand]: 'bg-blue-500',
      [PricingRuleType.Quotation]: 'bg-green-500',
      [PricingRuleType.Order]: 'bg-purple-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('tr-TR');
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">
          {t('common.loading', 'Yükleniyor...')}
        </div>
      </div>
    );
  }

  const headers = data?.data || [];

  if (headers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>{t('pricingRule.list.empty', 'Henüz fiyat kuralı tanımlanmamış')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('pricingRule.table.ruleCode', 'Kural Kodu')}</TableHead>
            <TableHead>{t('pricingRule.table.ruleName', 'Kural Adı')}</TableHead>
            <TableHead>{t('pricingRule.table.ruleType', 'Kural Tipi')}</TableHead>
            <TableHead>{t('pricingRule.table.validFrom', 'Geçerlilik Başlangıç')}</TableHead>
            <TableHead>{t('pricingRule.table.validTo', 'Geçerlilik Bitiş')}</TableHead>
            <TableHead>{t('pricingRule.table.customer', 'Müşteri')}</TableHead>
            <TableHead>{t('pricingRule.table.status', 'Durum')}</TableHead>
            <TableHead>{t('common.actions', 'İşlemler')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {headers.map((header) => (
            <TableRow key={header.id}>
              <TableCell className="font-medium">{header.ruleCode}</TableCell>
              <TableCell>{header.ruleName}</TableCell>
              <TableCell>
                <Badge className={getRuleTypeColor(header.ruleType)}>
                  {getRuleTypeLabel(header.ruleType)}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(header.validFrom)}</TableCell>
              <TableCell>{formatDate(header.validTo)}</TableCell>
              <TableCell>
                {header.customerName || header.erpCustomerCode || '-'}
              </TableCell>
              <TableCell>
                <Badge variant={isValid(header) ? 'default' : 'secondary'}>
                  {isValid(header)
                    ? t('pricingRule.status.active', 'Aktif')
                    : t('pricingRule.status.inactive', 'Pasif')}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(header)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t('common.edit', 'Düzenle')}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
