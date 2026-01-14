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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { useUsersForPricingRule } from '../api/pricing-rule-api';
import type { PricingRuleSalesmanFormState } from '../types/pricing-rule-types';

interface PricingRuleSalesmanTableProps {
  salesmen: PricingRuleSalesmanFormState[];
  setSalesmen: (salesmen: PricingRuleSalesmanFormState[]) => void;
}

export function PricingRuleSalesmanTable({
  salesmen,
  setSalesmen,
}: PricingRuleSalesmanTableProps): ReactElement {
  const { t } = useTranslation();
  const { data: users, isLoading } = useUsersForPricingRule();

  const handleAddSalesman = (salesmanId: number): void => {
    if (salesmen.some((s) => s.salesmanId === salesmanId)) {
      return;
    }

    const newSalesman: PricingRuleSalesmanFormState = {
      id: `temp-${Date.now()}`,
      salesmanId,
    };
    setSalesmen([...salesmen, newSalesman]);
  };

  const handleDeleteSalesman = (id: string): void => {
    setSalesmen(salesmen.filter((salesman) => salesman.id !== id));
  };

  const availableUsers = users?.filter(
    (user) => !salesmen.some((s) => s.salesmanId === user.id)
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">
          {t('common.loading', 'Yükleniyor...')}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {t('pricingRule.salesmen.title', 'Satışçılar')}
        </h3>
        {availableUsers.length > 0 && (
          <Select
            onValueChange={(value) => handleAddSalesman(parseInt(value))}
            value=""
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder={t('pricingRule.salesmen.add', 'Satışçı Ekle')} />
            </SelectTrigger>
            <SelectContent>
              {availableUsers.map((user) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {salesmen.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>{t('pricingRule.salesmen.empty', 'Henüz satışçı eklenmedi')}</p>
          <p className="text-sm mt-2">
            {t('pricingRule.salesmen.emptyDescription', 'Tüm satışçılar için geçerli olacaktır')}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t('pricingRule.salesmen.salesman', 'Satışçı')}
                </TableHead>
                <TableHead>{t('common.actions', 'İşlemler')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesmen.map((salesman) => {
                const user = users?.find((u) => u.id === salesman.salesmanId);
                return (
                  <TableRow key={salesman.id}>
                    <TableCell>
                      {user?.fullName || `ID: ${salesman.salesmanId}`}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSalesman(salesman.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
