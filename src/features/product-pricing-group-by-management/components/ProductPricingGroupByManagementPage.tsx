import { type ReactElement, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { ProductPricingGroupByTable } from './ProductPricingGroupByTable';
import { ProductPricingGroupByForm } from './ProductPricingGroupByForm';
import { useCreateProductPricingGroupBy } from '../hooks/useCreateProductPricingGroupBy';
import { useUpdateProductPricingGroupBy } from '../hooks/useUpdateProductPricingGroupBy';
import type { ProductPricingGroupByDto } from '../types/product-pricing-group-by-types';
import type { ProductPricingGroupByFormSchema } from '../types/product-pricing-group-by-types';

export function ProductPricingGroupByManagementPage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProductPricingGroupBy, setEditingProductPricingGroupBy] = useState<ProductPricingGroupByDto | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20);
  const [sortBy, setSortBy] = useState('Id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters] = useState<Record<string, unknown>>({});

  const createProductPricingGroupBy = useCreateProductPricingGroupBy();
  const updateProductPricingGroupBy = useUpdateProductPricingGroupBy();

  useEffect(() => {
    setPageTitle(t('productPricingGroupByManagement.title', 'Ürün Fiyatlandırma Grubu Yönetimi'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {t('productPricingGroupByManagement.title', 'Ürün Fiyatlandırma Grubu Yönetimi')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('productPricingGroupByManagement.description', 'Ürün fiyatlandırma gruplarını yönetin ve düzenleyin')}
          </p>
        </div>
        <Button onClick={handleAddClick}>
          {t('productPricingGroupByManagement.create', 'Yeni Fiyatlandırma Grubu')}
        </Button>
      </div>

      <div className="space-y-4">
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
