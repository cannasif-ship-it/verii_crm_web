import { type ReactElement, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductPricingTable } from './ProductPricingTable';
import { ProductPricingForm } from './ProductPricingForm';
import { useCreateProductPricing } from '../hooks/useCreateProductPricing';
import { useUpdateProductPricing } from '../hooks/useUpdateProductPricing';
import { useDeleteProductPricing } from '../hooks/useDeleteProductPricing';
import type { ProductPricingGetDto } from '../types/product-pricing-types';
import type { ProductPricingFormSchema } from '../types/product-pricing-types';
import type { PagedFilter } from '@/types/api';

export function ProductPricingManagementPage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProductPricing, setEditingProductPricing] = useState<ProductPricingGetDto | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20);
  const [sortBy, setSortBy] = useState('Id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<PagedFilter[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const createProductPricing = useCreateProductPricing();
  const updateProductPricing = useUpdateProductPricing();
  const deleteProductPricing = useDeleteProductPricing();

  useEffect(() => {
    setPageTitle(t('productPricingManagement.title', 'Ürün Fiyatlandırma Yönetimi'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  useEffect(() => {
    const newFilters: PagedFilter[] = [];

    if (searchQuery) {
      newFilters.push({
        column: 'ErpProductCode',
        operator: 'contains',
        value: searchQuery,
      });
    }

    if (activeFilter === 'active') {
      newFilters.push({ column: 'IsDeleted', operator: 'eq', value: 'false' });
    } else if (activeFilter === 'critical') {
      newFilters.push({ column: 'IsCriticalStock', operator: 'eq', value: 'true' });
    } else if (activeFilter === 'archive') {
      newFilters.push({ column: 'IsDeleted', operator: 'eq', value: 'true' });
    }

    setFilters(newFilters);
    setPageNumber(1);
  }, [searchQuery, activeFilter]);

  const handleAddClick = (): void => {
    setEditingProductPricing(null);
    setFormOpen(true);
  };

  const handleEdit = (productPricing: ProductPricingGetDto): void => {
    setEditingProductPricing(productPricing);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: ProductPricingFormSchema): Promise<void> => {
    if (editingProductPricing) {
      await updateProductPricing.mutateAsync({
        id: editingProductPricing.id,
        data: {
          erpProductCode: data.erpProductCode,
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
      await createProductPricing.mutateAsync({
        erpProductCode: data.erpProductCode,
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
    setEditingProductPricing(null);
  };

  const handleDeleteClick = (id: number): void => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (itemToDelete) {
      await deleteProductPricing.mutateAsync(itemToDelete);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setFormOpen(false);
      setEditingProductPricing(null);
    }
  };

  const handleSortChange = (newSortBy: string, newSortDirection: 'asc' | 'desc'): void => {
    setSortBy(newSortBy);
    setSortDirection(newSortDirection);
    setPageNumber(1);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {t('productPricingManagement.title', 'Ürün Fiyatlandırma Yönetimi')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('productPricingManagement.description', 'Ürün fiyatlandırmalarını yönetin ve düzenleyin')}
          </p>
        </div>
        <Button 
          onClick={handleAddClick}
          className="px-6 py-2 bg-gradient-to-r from-pink-600 to-orange-600 rounded-lg text-white text-sm font-bold shadow-lg shadow-pink-500/20 hover:scale-105 transition-transform border-0 hover:text-white"
        >
          <Plus size={18} className="mr-2" />
          {t('productPricingManagement.create', 'Yeni Fiyatlandırma')}
        </Button>
      </div>

      <div className="bg-white/70 dark:bg-[#1a1025]/60 backdrop-blur-xl border border-white/60 dark:border-white/5 shadow-sm rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-pink-500 transition-colors" size={18} />
          <Input 
            className="pl-10 h-10 bg-white/50 dark:bg-[#0c0516]/50 border-slate-200 dark:border-white/5 focus:border-pink-500/50 dark:focus:border-pink-500/50 rounded-xl transition-all" 
            placeholder={t('productPricingManagement.searchPlaceholder', 'Ürün adı, SKU veya Kategori ara...')} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
           {['all', 'active', 'critical', 'archive'].map((filter) => (
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
               {t(`productPricingManagement.filter.${filter}`, filter === 'all' ? 'Tümü' : filter === 'active' ? 'Aktif' : filter === 'critical' ? 'Kritik Stok' : 'Arşiv')}
             </Button>
           ))}
        </div>
      </div>

      <div className="bg-white/70 dark:bg-[#1a1025]/60 backdrop-blur-xl border border-white/60 dark:border-white/5 shadow-sm rounded-2xl p-6 transition-all duration-300">
        <ProductPricingTable
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

      <ProductPricingForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        onDelete={handleDeleteClick}
        productPricing={editingProductPricing}
        isLoading={createProductPricing.isPending || updateProductPricing.isPending}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.deleteConfirmTitle', 'Silme Onayı')}</DialogTitle>
            <DialogDescription>
              {t('common.deleteConfirmMessage', 'Bu kaydı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t('common.cancel', 'İptal')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              {t('common.delete', 'Sil')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
