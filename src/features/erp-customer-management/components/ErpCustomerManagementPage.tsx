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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {t('erpCustomerManagement.menu', 'ERP Müşteri')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('erpCustomerManagement.description', 'ERP sisteminden gelen müşteri listesi')}
          </p>
        </div>
      </div>

      <ErpCustomerTable customers={customers || []} isLoading={isLoading} />
    </div>
  );
}
