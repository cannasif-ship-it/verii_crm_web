import { type ReactElement, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, RefreshCw, X } from 'lucide-react';
import { ApprovalFlowTable } from './ApprovalFlowTable';
import { ApprovalFlowForm } from './ApprovalFlowForm';
import { useCreateApprovalFlow } from '../hooks/useCreateApprovalFlow';
import { useUpdateApprovalFlow } from '../hooks/useUpdateApprovalFlow';
import type { ApprovalFlowDto } from '../types/approval-flow-types';
import type { ApprovalFlowFormSchema } from '../types/approval-flow-types';
import type { PagedFilter } from '@/types/api';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../utils/query-keys';

export function ApprovalFlowManagementPage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingApprovalFlow, setEditingApprovalFlow] = useState<ApprovalFlowDto | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20);
  const [sortBy, setSortBy] = useState('Id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<PagedFilter[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const createApprovalFlow = useCreateApprovalFlow();
  const updateApprovalFlow = useUpdateApprovalFlow();
  const queryClient = useQueryClient();

  useEffect(() => {
    setPageTitle(t('approvalFlow.menu', 'Onay Akışı Yönetimi'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  useEffect(() => {
    const newFilters: PagedFilter[] = [];
    if (searchTerm) {
      newFilters.push(
        { column: 'description', operator: 'contains', value: searchTerm }
      );
    }
    
    if (activeFilter === 'active') {
        newFilters.push({ column: 'IsActive', operator: 'eq', value: 'true' });
    } else if (activeFilter === 'inactive') {
        newFilters.push({ column: 'IsActive', operator: 'eq', value: 'false' });
    }
    
    setFilters(newFilters);
    setPageNumber(1);
  }, [searchTerm, activeFilter]);

  const handleAddClick = (): void => {
    setEditingApprovalFlow(null);
    setFormOpen(true);
  };

  const handleEdit = (approvalFlow: ApprovalFlowDto): void => {
    setEditingApprovalFlow(approvalFlow);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: ApprovalFlowFormSchema): Promise<void> => {
    if (editingApprovalFlow) {
      await updateApprovalFlow.mutateAsync({
        id: editingApprovalFlow.id,
        data: {
          documentType: data.documentType,
          description: data.description || undefined,
          isActive: data.isActive,
        },
      });
    } else {
      await createApprovalFlow.mutateAsync({
        documentType: data.documentType,
        description: data.description || undefined,
        isActive: data.isActive,
      });
    }
    setFormOpen(false);
    setEditingApprovalFlow(null);
  };

  const handleSortChange = (newSortBy: string, newSortDirection: 'asc' | 'desc'): void => {
    setSortBy(newSortBy);
    setSortDirection(newSortDirection);
    setPageNumber(1);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: queryKeys.list({ pageNumber, pageSize, sortBy, sortDirection, filters }) });
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {t('approvalFlow.menu', 'Onay Akışı Yönetimi')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('approvalFlow.description', 'Onay akışlarını yönetin ve düzenleyin')}
          </p>
        </div>
        <Button 
          onClick={handleAddClick}
          className="px-6 py-2 bg-gradient-to-r from-pink-600 to-orange-600 rounded-lg text-white text-sm font-bold shadow-lg shadow-pink-500/20 hover:scale-105 transition-transform border-0 hover:text-white"
        >
          <Plus size={18} className="mr-2" />
          {t('approvalFlow.addButton', 'Yeni Onay Akışı Ekle')}
        </Button>
      </div>

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
               {filter === 'all' ? t('common.all', 'Tümü') : filter === 'active' ? t('approvalFlow.active', 'Aktif') : t('approvalFlow.inactive', 'Pasif')}
             </Button>
           ))}
        </div>
      </div>

      <div className="bg-white/70 dark:bg-[#1a1025]/60 backdrop-blur-xl border border-white/60 dark:border-white/5 shadow-sm rounded-2xl p-6 transition-all duration-300">
        <ApprovalFlowTable
          onEdit={handleEdit}
          pageNumber={pageNumber}
          pageSize={pageSize}
          sortBy={sortBy}
          sortDirection={sortDirection}
          filters={filters}
          onPageChange={setPageNumber}
          onSortChange={handleSortChange}
        />
      </div>

      <ApprovalFlowForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        approvalFlow={editingApprovalFlow}
        isLoading={createApprovalFlow.isPending || updateApprovalFlow.isPending}
      />
    </div>
  );
}
