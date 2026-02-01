import { type ReactElement, useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { ErpCustomerTable } from './ErpCustomerTable';
import { useErpCustomers } from '@/services/hooks/useErpCustomers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw, X, Filter, Trash2 } from 'lucide-react';
import { 
  Building03Icon, 
  Tag01Icon, 
  UserCircleIcon, 
  MapsLocation01Icon, 
  Location01Icon, 
  Invoice01Icon 
} from 'hugeicons-react';
import { useQueryClient } from '@tanstack/react-query';
import type { CariDto } from '@/services/erp-types';


interface FilterState {
  cariKod: string;
  cariIsim: string;
  subeKodu: string;
  cariIl: string;
  cariIlce: string;
  vergiNumarasi: string;
}

export function ErpCustomerManagementPage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const { data: customers, isLoading } = useErpCustomers(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);


  const initialFilters: FilterState = {
    cariKod: '',
    cariIsim: '',
    subeKodu: '',
    cariIl: '',
    cariIlce: '',
    vergiNumarasi: ''
  };

  const [draftFilters, setDraftFilters] = useState<FilterState>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(initialFilters);
  
  const queryClient = useQueryClient();

  useEffect(() => {
    setPageTitle(t('erpCustomerManagement.menu'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);


  const filteredCustomers = useMemo<CariDto[]>(() => {
    if (!customers) return [];

    let result: CariDto[] = [...customers];


    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((c: CariDto) => 
        (c.cariIsim && c.cariIsim.toLowerCase().includes(lowerSearch)) ||
        (c.cariKod && c.cariKod.toLowerCase().includes(lowerSearch))
      );
    }

    if (activeFilter === 'inactive') {
        result = []; 
    }


    if (appliedFilters.cariKod) {
      result = result.filter((c: CariDto) => c.cariKod?.toLowerCase().startsWith(appliedFilters.cariKod.toLowerCase()));
    }
    if (appliedFilters.cariIsim) {
      result = result.filter((c: CariDto) => c.cariIsim?.toLowerCase().includes(appliedFilters.cariIsim.toLowerCase()));
    }
    if (appliedFilters.subeKodu) {
      result = result.filter((c: CariDto) => c.subeKodu?.toString().includes(appliedFilters.subeKodu));
    }
    if (appliedFilters.cariIl) {
      result = result.filter((c: CariDto) => c.cariIl?.toLowerCase().includes(appliedFilters.cariIl.toLowerCase()));
    }
    if (appliedFilters.cariIlce) {
      result = result.filter((c: CariDto) => c.cariIlce?.toLowerCase().includes(appliedFilters.cariIlce.toLowerCase()));
    }
    if (appliedFilters.vergiNumarasi) {
      result = result.filter((c: CariDto) => c.vergiNumarasi?.includes(appliedFilters.vergiNumarasi));
    }

    return result;
  }, [customers, searchTerm, activeFilter, appliedFilters]);

  const clearSearch = () => setSearchTerm('');

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setDraftFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyAdvancedFilters = () => setAppliedFilters(draftFilters);

  const clearAdvancedFilters = () => {
    setDraftFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['erpCustomers'] });
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const inputStyle = "h-10 pl-10 w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-pink-500 dark:focus-visible:border-pink-500 transition-colors duration-200 text-sm";
  const iconStyle = "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none";

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2 pt-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">
          {t('erpCustomerManagement.menu')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium transition-colors">
          {t('erpCustomerManagement.description')}
        </p>
      </div>

      <div className="bg-white/70 dark:bg-[#1a1025]/60 backdrop-blur-xl border border-white/60 dark:border-white/5 shadow-sm rounded-2xl p-4 sm:p-5 flex flex-col gap-5 transition-all duration-300">
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <div className="relative group w-full sm:w-72 lg:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
                    <Input
                        placeholder={t('erpCustomerManagement.placeholders.quickSearch')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-10 bg-white/50 dark:bg-card/50 border-slate-200 dark:border-white/10 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-pink-500 dark:focus-visible:border-pink-500 rounded-xl transition-all w-full"
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
                
                <div className="flex items-center gap-3">
                    <div 
                        className="h-10 w-10 flex items-center justify-center bg-white/50 dark:bg-card/50 border border-slate-200 dark:border-white/10 rounded-xl cursor-pointer hover:border-pink-500/30 hover:bg-pink-50/50 dark:hover:bg-pink-500/10 transition-all group shrink-0"
                        onClick={handleRefresh}
                    >
                        <RefreshCw 
                            size={18} 
                            className={`text-slate-500 dark:text-slate-400 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors ${isRefreshing ? 'animate-spin' : ''}`} 
                        />
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`h-10 flex-1 sm:flex-none gap-2 border-slate-200 dark:border-white/10 ${showFilters ? 'border-pink-500 text-pink-600 bg-pink-50 dark:bg-pink-500/10' : 'bg-white/50 dark:bg-white/5'}`}
                    >
                        <Filter size={16} />
                        {t('erpCustomerManagement.actions.detailedFilter')}
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-1 bg-slate-100/50 dark:bg-white/5 p-1 rounded-xl w-full lg:w-auto overflow-x-auto">
                {['all', 'active', 'inactive'].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`
                            flex-1 lg:flex-none px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap
                            ${activeFilter === filter 
                            ? 'bg-white dark:bg-[#1a1025] text-pink-600 dark:text-pink-400 shadow-sm border border-slate-200 dark:border-white/10' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}
                        `}
                    >
                        {filter === 'all' 
                            ? t('erpCustomerManagement.actions.all') 
                            : filter === 'active' 
                                ? t('erpCustomerManagement.actions.active') 
                                : t('erpCustomerManagement.actions.passive')}
                    </button>
                ))}
            </div>
          </div>

          {showFilters && (
            <div className="bg-slate-50/80 dark:bg-[#130a1d]/50 rounded-xl border border-slate-200 dark:border-white/10 p-5 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
     
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">
                            {t('erpCustomerManagement.filterLabels.branchCode')}
                        </label>
                        <div className="relative">
                            <Building03Icon size={18} className={iconStyle} />
                            <Input 
                                placeholder={t('erpCustomerManagement.placeholders.all')} 
                                value={draftFilters.subeKodu}
                                onChange={(e) => handleFilterChange('subeKodu', e.target.value)}
                                className={inputStyle}
                            />
                        </div>
                    </div>


                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">
                            {t('erpCustomerManagement.filterLabels.customerCode')}
                        </label>
                        <div className="relative">
                            <Tag01Icon size={18} className={iconStyle} />
                            <Input 
                                placeholder={t('erpCustomerManagement.placeholders.codeExample')} 
                                value={draftFilters.cariKod}
                                onChange={(e) => handleFilterChange('cariKod', e.target.value)}
                                className={inputStyle}
                            />
                        </div>
                    </div>


                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">
                            {t('erpCustomerManagement.filterLabels.customerName')}
                        </label>
                        <div className="relative">
                            <UserCircleIcon size={18} className={iconStyle} />
                            <Input 
                                placeholder={t('erpCustomerManagement.placeholders.nameExample')} 
                                value={draftFilters.cariIsim}
                                onChange={(e) => handleFilterChange('cariIsim', e.target.value)}
                                className={inputStyle}
                            />
                        </div>
                    </div>


                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">
                            {t('erpCustomerManagement.filterLabels.city')}
                        </label>
                        <div className="relative">
                            <MapsLocation01Icon size={18} className={iconStyle} />
                            <Input 
                                placeholder={t('erpCustomerManagement.placeholders.cityExample')} 
                                value={draftFilters.cariIl}
                                onChange={(e) => handleFilterChange('cariIl', e.target.value)}
                                className={inputStyle}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">
                            {t('erpCustomerManagement.filterLabels.district')}
                        </label>
                        <div className="relative">
                            <Location01Icon size={18} className={iconStyle} />
                            <Input 
                                placeholder={t('erpCustomerManagement.placeholders.districtExample')} 
                                value={draftFilters.cariIlce}
                                onChange={(e) => handleFilterChange('cariIlce', e.target.value)}
                                className={inputStyle}
                            />
                        </div>
                    </div>

                    {/* 6. Vergi No */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">
                            {t('erpCustomerManagement.filterLabels.taxNumber')}
                        </label>
                        <div className="relative">
                            <Invoice01Icon size={18} className={iconStyle} />
                            <Input 
                                placeholder={t('erpCustomerManagement.placeholders.taxExample')} 
                                value={draftFilters.vergiNumarasi}
                                onChange={(e) => handleFilterChange('vergiNumarasi', e.target.value)}
                                className={inputStyle}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-white/5">
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={clearAdvancedFilters}
                        className="text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full sm:w-auto"
                    >
                        <Trash2 size={14} className="mr-2" />
                        {t('erpCustomerManagement.actions.clear')}
                    </Button>
                    
                    <Button 
                        size="sm" 
                        onClick={applyAdvancedFilters}
                        className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white w-full sm:w-auto sm:min-w-[120px] shadow-md hover:shadow-lg transition-all border-0"
                    >
                        {t('erpCustomerManagement.actions.filter')}
                    </Button>
                </div>
            </div>
          )}
      </div>

      <div className="bg-white/70 dark:bg-[#1a1025]/60 backdrop-blur-xl border border-white/60 dark:border-white/5 shadow-sm rounded-2xl p-0 sm:p-1 transition-all duration-300 overflow-hidden">
        <ErpCustomerTable customers={filteredCustomers} isLoading={isLoading} />
      </div>
    </div>
  );
}