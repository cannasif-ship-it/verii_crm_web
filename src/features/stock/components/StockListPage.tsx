import { type ReactElement, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores/ui-store';
import { Input } from '@/components/ui/input';
import { StockTable } from './StockTable';
import type { PagedFilter } from '@/types/api';

export function StockListPage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const navigate = useNavigate();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20);
  const [sortBy, setSortBy] = useState('Id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  useEffect(() => {
    setPageTitle(t('stock.list.title', 'Stok Yönetimi'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  useEffect(() => {
    const newFilters: PagedFilter[] = [];
    if (searchTerm) {
      newFilters.push(
        { column: 'stockName', operator: 'contains', value: searchTerm },
        { column: 'erpStockCode', operator: 'contains', value: searchTerm }
      );
    }
    setFilters(newFilters.length > 0 ? { filters: newFilters } : {});
    setPageNumber(1);
  }, [searchTerm]);

  const handleSortChange = (newSortBy: string, newSortDirection: 'asc' | 'desc'): void => {
    setSortBy(newSortBy);
    setSortDirection(newSortDirection);
    setPageNumber(1);
  };

  const handleRowClick = (stockId: number): void => {
    navigate(`/stocks/${stockId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {t('stock.list.title', 'Stok Yönetimi')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('stock.list.description', 'Stokları görüntüleyin ve yönetin')}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            {t('stock.list.syncedFromErp', 'Stoklar ERP sisteminden otomatik olarak senkronize edilir')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder={t('stock.list.search', 'Stok adı veya ERP kodu ile ara...')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="space-y-4">
        <StockTable
          pageNumber={pageNumber}
          pageSize={pageSize}
          sortBy={sortBy}
          sortDirection={sortDirection}
          filters={filters}
          onPageChange={setPageNumber}
          onSortChange={handleSortChange}
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
}
