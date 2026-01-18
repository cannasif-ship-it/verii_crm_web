import { type ReactElement, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { ErpCustomerTable } from './ErpCustomerTable';
import { useErpCustomers } from '@/services/hooks/useErpCustomers';

export function ErpCustomerManagementPage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const { data: customers, isLoading } = useErpCustomers(null);

  useEffect(() => {
    setPageTitle(t('erpCustomerManagement.menu', 'ERP Müşteri'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  return (
    // MAIN CONTAINER: Genişlik ve dikey boşluk ayarı
    <div className="w-full space-y-8 relative">
      
      {/* HEADER: Modern Tipografi */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 transition-colors">
            {t('erpCustomerManagement.menu', 'ERP Müşteri')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium transition-colors">
            {t('erpCustomerManagement.description', 'ERP sisteminden gelen müşteri listesi')}
          </p>
        </div>
      </div>

      {/* TABLE WRAPPER: Glassmorphism (Buzlu Cam) Efekti */}
      <div className="bg-white/70 dark:bg-[#1a1025]/60 backdrop-blur-xl border border-white/60 dark:border-white/5 shadow-sm rounded-2xl p-6 transition-all duration-300">
        <ErpCustomerTable customers={customers || []} isLoading={isLoading} />
      </div>
      
    </div>
  );
}