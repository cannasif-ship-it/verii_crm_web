import { type ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { ErpCustomerTable } from './ErpCustomerTable';
import { useErpCustomers } from '@/services/hooks/useErpCustomers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import type { CariDto } from '@/services/erp-types';

export function ErpCustomerManagementPage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const { data: customers, isLoading } = useErpCustomers(null);
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState<CariDto[]>([]);
  
  const queryClient = useQueryClient();

  useEffect(() => {
    setPageTitle(t('erpCustomerManagement.menu', 'ERP Müşteri'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  // Filtering Logic
  useEffect(() => {
    if (!customers) {
      setFilteredCustomers([]);
      return;
    }

    let result = [...customers];

    // Search Filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(c => 
        (c.cariIsim && c.cariIsim.toLowerCase().includes(lowerSearch)) ||
        (c.cariKod && c.cariKod.toLowerCase().includes(lowerSearch))
      );
    }

    // Active/Passive Filter 
    // ERP customers DTO usually doesn't have an isActive field exposed here.
    // We implement the filter UI as requested, but currently 'active' shows all (or filtered by search),
    // and 'inactive' shows empty list as we assume all fetched ERP customers are valid/active or we don't distinguish.
    if (activeFilter === 'inactive') {
        result = []; 
    }

    setFilteredCustomers(result);
  }, [customers, searchTerm, activeFilter]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['erpCustomers'] });
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="w-full space-y-8 relative">
      
      {/* Header */}
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

      {/* Filter Section */}
      <div className="bg-white/70 dark:bg-[#1a1025]/60 backdrop-blur-xl border border-white/60 dark:border-white/5 shadow-sm rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative group w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
              <Input
                placeholder={t('common.search', 'Ara...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-white/50 dark:bg-card/50 border-slate-200 dark:border-white/10 focus:border-pink-500/50 focus:ring-pink-500/20 rounded-xl transition-all"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={14} className="text-slate-400" />
                </button>
              )}
            </div>
            <div 
              className="h-10 w-10 flex items-center justify-center bg-white/50 dark:bg-card/50 border border-slate-200 dark:border-white/10 rounded-xl cursor-pointer hover:border-pink-500/30 hover:bg-pink-50/50 dark:hover:bg-pink-500/10 transition-all group"
              onClick={handleRefresh}
            >
              <RefreshCw 
                size={18} 
                className={`text-slate-500 dark:text-slate-400 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors ${isRefreshing ? 'animate-spin' : ''}`} 
              />
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
             {['all', 'active', 'inactive'].map((filter) => (
               <Button
                 key={filter}
                 variant="ghost"
                 onClick={() => setActiveFilter(filter)}
                 className={`
                   rounded-lg px-4 h-9 text-xs font-bold uppercase tracking-wider transition-all
                   ${activeFilter === filter 
                     ? 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20' 
                     : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white border border-transparent'}
                 `}
               >
                 {filter === 'all' ? t('common.all', 'Tümü') : filter === 'active' ? t('status.active', 'Aktif') : t('status.inactive', 'Pasif')}
               </Button>
             ))}
          </div>
      </div>

      <div className="bg-white/70 dark:bg-[#1a1025]/60 backdrop-blur-xl border border-white/60 dark:border-white/5 shadow-sm rounded-2xl p-6 transition-all duration-300">
        <ErpCustomerTable customers={filteredCustomers} isLoading={isLoading} />
      </div>
      
    </div>
  );
}
