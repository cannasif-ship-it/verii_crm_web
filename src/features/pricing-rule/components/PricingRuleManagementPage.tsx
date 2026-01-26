import { type ReactElement, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { Plus } from 'lucide-react'; // İkon eklendi
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
    <div className="w-full space-y-8 relative">
      
      {/* Başlık ve Aksiyon Butonu */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 transition-colors">
            {t('pricingRule.list.title', 'Fiyat Kuralları')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium transition-colors">
            {t('pricingRule.list.description', 'Fiyat kurallarını yönetin ve düzenleyin')}
          </p>
        </div>
        
        <Button 
          onClick={handleAddClick}
          className="px-6 py-2 bg-gradient-to-r from-pink-600 to-orange-600 rounded-lg text-white text-sm font-bold shadow-lg shadow-pink-500/20 hover:scale-105 transition-transform border-0 hover:text-white"
        >
          <Plus size={18} className="mr-2" />
          {t('pricingRule.list.add', 'Yeni Kural Ekle')}
        </Button>
      </div>

      {/* Tablo Alanı: Glassmorphism / Buzlu Cam Efekti */}
      <div className="bg-white/70 dark:bg-[#1a1025]/60 backdrop-blur-xl border border-white/60 dark:border-white/5 shadow-sm rounded-2xl p-6 transition-all duration-300">
        <PricingRuleTable onEdit={handleEdit} />
      </div>

      {/* Form Dialog */}
      <PricingRuleForm
        open={formOpen}
        onOpenChange={handleFormClose}
        header={editingHeader}
      />
    </div>
  );
}