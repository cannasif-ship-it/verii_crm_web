import { type ReactElement, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { PricingRuleTable } from './PricingRuleTable';
import { PricingRuleForm } from './PricingRuleForm';
import type { PricingRuleHeaderGetDto } from '../types/pricing-rule-types';

export function PricingRuleManagementPage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingHeader, setEditingHeader] = useState<PricingRuleHeaderGetDto | null>(null);

  useEffect(() => {
    setPageTitle(t('pricingRule.list.title', 'Fiyat Kuralları'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  const handleAddClick = (): void => {
    setEditingHeader(null);
    setFormOpen(true);
  };

  const handleEdit = (header: PricingRuleHeaderGetDto): void => {
    setEditingHeader(header);
    setFormOpen(true);
  };

  const handleFormClose = (): void => {
    setFormOpen(false);
    setEditingHeader(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {t('pricingRule.list.title', 'Fiyat Kuralları')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('pricingRule.list.description', 'Fiyat kurallarını yönetin ve düzenleyin')}
          </p>
        </div>
        <Button onClick={handleAddClick}>
          {t('pricingRule.list.add', 'Yeni Kural Ekle')}
        </Button>
      </div>

      <div className="space-y-4">
        <PricingRuleTable onEdit={handleEdit} />
      </div>

      <PricingRuleForm
        open={formOpen}
        onOpenChange={handleFormClose}
        header={editingHeader}
      />
    </div>
  );
}
