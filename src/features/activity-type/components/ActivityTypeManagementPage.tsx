import { type ReactElement, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useUIStore } from '@/stores/ui-store';
import { Plus, Search, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQueryClient } from '@tanstack/react-query';
import { ActivityTypeTable } from './ActivityTypeTable';
import { ActivityTypeForm } from './ActivityTypeForm';
import { useCreateActivityType } from '../hooks/useCreateActivityType';
import { useUpdateActivityType } from '../hooks/useUpdateActivityType';
import { useActivityTypeList } from '../hooks/useActivityTypeList';
import type { ActivityTypeDto, ActivityTypeFormData } from '../types/activity-type-types';

export function ActivityTypeManagementPage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingActivityType, setEditingActivityType] = useState<ActivityTypeDto | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const queryClient = useQueryClient();
  const createActivityType = useCreateActivityType();
  const updateActivityType = useUpdateActivityType();

  const { data: apiResponse, isLoading } = useActivityTypeList({ pageNumber: 1, pageSize: 1000 });

  // Handle API response which might be wrapped in a data property or be the array directly
  const allActivityTypes = useMemo(() => {
    if (!apiResponse) return [];
    if (Array.isArray(apiResponse)) return apiResponse;
    if ((apiResponse as any).data && Array.isArray((apiResponse as any).data)) return (apiResponse as any).data;
    return [];
  }, [apiResponse]);

  useEffect(() => {
    setPageTitle(t('activityType.title', 'Aktivite Tipi Yönetimi'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setFormOpen(true);
      setEditingActivityType(null);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filteredActivityTypes = useMemo<ActivityTypeDto[]>(() => {
    if (!allActivityTypes) return [];

    let result: ActivityTypeDto[] = [...allActivityTypes];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((item) => 
        (item.name && item.name.toLowerCase().includes(lowerSearch)) ||
        (item.description && item.description.toLowerCase().includes(lowerSearch))
      );
    }

    return result;
  }, [allActivityTypes, searchTerm]);

  const clearSearch = () => setSearchTerm('');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['activityTypes'] });
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleAddClick = () => {
    setEditingActivityType(null);
    setFormOpen(true);
  };

  const handleEdit = (activityType: ActivityTypeDto) => {
    setEditingActivityType(activityType);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: ActivityTypeFormData) => {
    try {
      if (editingActivityType) {
        await updateActivityType.mutateAsync({
          id: editingActivityType.id,
          data: data,
        });
      } else {
        await createActivityType.mutateAsync(data);
      }
      setFormOpen(false);
      setEditingActivityType(null);
    } catch (error) {
      console.error('Failed to save activity type:', error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white/70 dark:bg-[#1a1025]/60 backdrop-blur-xl border border-white/60 dark:border-white/5 shadow-sm rounded-2xl p-4 transition-all duration-300">
          
          {/* Search Bar */}
          <div className="relative w-full sm:w-[320px] group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-pink-500 transition-colors duration-300" />
            <Input
              placeholder={t('activityType.search', 'Aktivite tipi ara...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-white/50 dark:bg-[#130822]/50 border-slate-200 dark:border-white/10 focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/10 rounded-xl transition-all duration-300"
            />
            {searchTerm && (
              <button 
                onClick={clearSearch}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
             <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                className={`h-11 w-11 rounded-xl border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#130822]/50 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-600 dark:text-slate-300 transition-all duration-300 ${isRefreshing ? 'animate-spin' : ''}`}
                title={t('common.refresh', 'Yenile')}
             >
               <RefreshCw size={18} />
             </Button>

             <Button 
               onClick={handleAddClick}
               className="h-11 flex-1 sm:flex-none bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
             >
               <Plus className="mr-2 h-4 w-4" />
               {t('activityType.add', 'Yeni Tip Ekle')}
             </Button>
          </div>
      </div>

      {/* Table Section */}
      <div className="bg-white/70 dark:bg-[#1a1025]/60 backdrop-blur-xl border border-white/60 dark:border-white/5 shadow-sm rounded-2xl p-6 transition-all duration-300">
        <ActivityTypeTable
          activityTypes={filteredActivityTypes}
          isLoading={isLoading}
          onEdit={handleEdit}
        />
      </div>

      <ActivityTypeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        activityType={editingActivityType}
        isLoading={createActivityType.isPending || updateActivityType.isPending}
      />
    </div>
  );
}
