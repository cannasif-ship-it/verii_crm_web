import { type ReactElement, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, TriangleAlert, Layers, Plus, Search, RefreshCw, X } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ProductPricingGroupByTable } from './ProductPricingGroupByTable';
import { ProductPricingGroupByForm } from './ProductPricingGroupByForm';
import { useCreateProductPricingGroupBy } from '../hooks/useCreateProductPricingGroupBy';
import { useUpdateProductPricingGroupBy } from '../hooks/useUpdateProductPricingGroupBy';
import type { ProductPricingGroupByDto } from '../types/product-pricing-group-by-types';
import type { ProductPricingGroupByFormSchema } from '../types/product-pricing-group-by-types';
import type { PagedFilter } from '@/types/api';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../utils/query-keys';

export function ProductPricingGroupByManagementPage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProductPricingGroupBy, setEditingProductPricingGroupBy] = useState<ProductPricingGroupByDto | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20);
  const [sortBy, setSortBy] = useState('Id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const createProductPricingGroupBy = useCreateProductPricingGroupBy();
  const updateProductPricingGroupBy = useUpdateProductPricingGroupBy();
  const queryClient = useQueryClient();

  useEffect(() => {
    setPageTitle(t('productPricingGroupByManagement.title', 'Ürün Fiyatlandırma Grubu Yönetimi'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  useEffect(() => {
    const newFilters: PagedFilter[] = [];
    if (searchTerm) {
      newFilters.push(
        { column: 'erpGroupCode', operator: 'contains', value: searchTerm }
      );
    }
    setFilters(newFilters.length > 0 ? { filters: newFilters } : {});
    setPageNumber(1);
  }, [searchTerm]);

  const handleAddClick = (): void => {
    setEditingProductPricingGroupBy(null);
    setFormOpen(true);
  };

  const handleEdit = (productPricingGroupBy: ProductPricingGroupByDto): void => {
    setEditingProductPricingGroupBy(productPricingGroupBy);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: ProductPricingGroupByFormSchema): Promise<void> => {
    if (editingProductPricingGroupBy) {
      await updateProductPricingGroupBy.mutateAsync({
        id: editingProductPricingGroupBy.id,
        data: {
          erpGroupCode: data.erpGroupCode,
          currency: data.currency,
          listPrice: data.listPrice,
          costPrice: data.costPrice,
          discount1: data.discount1 || undefined,
          discount2: data.discount2 || undefined,
          discount3: data.discount3 || undefined,
        },
      });
    } else {
      await createProductPricingGroupBy.mutateAsync({
        erpGroupCode: data.erpGroupCode,
        currency: data.currency,
        listPrice: data.listPrice,
        costPrice: data.costPrice,
        discount1: data.discount1 || undefined,
        discount2: data.discount2 || undefined,
        discount3: data.discount3 || undefined,
      });
    }
    setFormOpen(false);
    setEditingProductPricingGroupBy(null);
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
    await queryClient.invalidateQueries({ queryKey: ['product-pricing-group-bys'] });
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const cardStyle = `
    bg-white/60 dark:bg-[#1a1025]/40 
    hover:bg-white/90 dark:hover:bg-[#1a1025]/80
    border border-white/60 dark:border-white/5 
    shadow-sm hover:shadow-md 
    backdrop-blur-md 
    transition-all duration-300 
    hover:border-pink-500/30 
    group relative overflow-hidden
  `;
  
  const glowStyle = "absolute inset-0 bg-gradient-to-r from-pink-50/0 to-orange-50/0 dark:from-pink-500/0 dark:to-orange-500/0 group-hover:from-pink-50/50 group-hover:to-orange-50/50 dark:group-hover:from-pink-500/5 dark:group-hover:to-orange-500/5 transition-all duration-500 pointer-events-none";

  const stats = [
    {
      title: t('productPricingGroupByManagement.stats.totalProducts', 'TOPLAM ÜRÜN'),
      value: '-',
      icon: Package,
      iconContainerClass: 'bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400 border-pink-100 dark:border-pink-500/20',
    },
    {
      title: t('productPricingGroupByManagement.stats.criticalStock', 'KRİTİK STOK'),
      value: '-',
      icon: TriangleAlert,
      iconContainerClass: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 border-orange-100 dark:border-orange-500/20',
    },
    {
      title: t('productPricingGroupByManagement.stats.categories', 'KATEGORİLER'),
      value: '-',
      icon: Layers,
      iconContainerClass: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-500/20',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {t('productPricingGroupByManagement.title', 'Ürün Fiyatlandırma Grubu Yönetimi')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('productPricingGroupByManagement.description', 'Ürün fiyatlandırma gruplarını yönetin ve düzenleyin')}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative group w-full md:w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
              <Input
                placeholder={t('productPricingGroupByManagement.search', 'Ara...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 bg-white/50 dark:bg-card/50 border-slate-200 dark:border-white/10 focus:border-pink-500/50 focus:ring-pink-500/20 rounded-xl transition-all"
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
              className="h-11 w-11 flex items-center justify-center bg-white/50 dark:bg-card/50 border border-slate-200 dark:border-white/10 rounded-xl cursor-pointer hover:border-pink-500/30 hover:bg-pink-50/50 dark:hover:bg-pink-500/10 transition-all group"
              onClick={handleRefresh}
            >
              <RefreshCw 
                size={20} 
                className={`text-slate-500 dark:text-slate-400 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors ${isRefreshing ? 'animate-spin' : ''}`} 
              />
            </div>
          </div>

          <Button 
            onClick={handleAddClick}
            className="w-full md:w-auto h-11 px-6 bg-gradient-to-r from-pink-600 to-orange-600 rounded-xl text-white text-sm font-bold shadow-lg shadow-pink-500/20 hover:scale-105 transition-transform border-0 hover:text-white"
          >
            <Plus size={18} className="mr-2" />
            {t('productPricingGroupByManagement.create', 'Yeni Fiyatlandırma Grubu')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className={cardStyle}>
            <div className={glowStyle} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg shadow-sm border ${stat.iconContainerClass}`}>
                 <stat.icon size={18} />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-slate-800 dark:text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-white/70 dark:bg-[#1a1025]/60 backdrop-blur-xl border border-white/60 dark:border-white/5 shadow-sm rounded-2xl p-6 transition-all duration-300">
        <ProductPricingGroupByTable
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

      <ProductPricingGroupByForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        productPricingGroupBy={editingProductPricingGroupBy}
        isLoading={createProductPricingGroupBy.isPending || updateProductPricingGroupBy.isPending}
      />
    </div>
  );
}
