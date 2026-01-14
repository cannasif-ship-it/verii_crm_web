import { type ReactElement, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { ProductPricingTable } from './ProductPricingTable';
import { ProductPricingForm } from './ProductPricingForm';
import { useCreateProductPricing } from '../hooks/useCreateProductPricing';
import { useUpdateProductPricing } from '../hooks/useUpdateProductPricing';
import type { ProductPricingGetDto } from '../types/product-pricing-types';
import type { ProductPricingFormSchema } from '../types/product-pricing-types';

export function ProductPricingManagementPage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProductPricing, setEditingProductPricing] = useState<ProductPricingGetDto | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20);
  const [sortBy, setSortBy] = useState('Id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters] = useState<Record<string, unknown>>({});

  const createProductPricing = useCreateProductPricing();
  const updateProductPricing = useUpdateProductPricing();

  useEffect(() => {
    setPageTitle(t('productPricingManagement.title', 'Ürün Fiyatlandırma Yönetimi'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

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
            {t('productPricingManagement.title', 'Ürün Fiyatlandırma Yönetimi')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('productPricingManagement.description', 'Ürün fiyatlandırmalarını yönetin ve düzenleyin')}
          </p>
        </div>
        <Button onClick={handleAddClick}>
          {t('productPricingManagement.create', 'Yeni Fiyatlandırma')}
        </Button>
      </div>

      <div className="space-y-4">
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
        productPricing={editingProductPricing}
        isLoading={createProductPricing.isPending || updateProductPricing.isPending}
      />
    </div>
  );
}
