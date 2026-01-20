import { type ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores/ui-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { QuotationTable } from './QuotationTable';
import { Search, RefreshCw, Plus, X } from 'lucide-react';
import type { PagedFilter } from '@/types/api';

export function QuotationListPage(): ReactElement {
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
    setPageTitle(t('quotation.list.title', 'Teklif Listesi'));
    return () => setPageTitle(null);
  }, [t, setPageTitle]);

  useEffect(() => {
    const newFilters: PagedFilter[] = [];
    if (searchTerm) {
      newFilters.push(
        { column: 'OfferNo', operator: 'contains', value: searchTerm },
        { column: 'PotentialCustomerName', operator: 'contains', value: searchTerm }
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

  const handleRowClick = (quotationId: number): void => {
    navigate(`/quotations/${quotationId}`);
  };

  const clearSearch = (): void => {
    setSearchTerm('');
  };

  return (
    <div className="relative min-h-screen space-y-6 p-4 md:p-8 overflow-hidden">
      <div className="relative z-10 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t('quotation.list.title', 'Teklif Listesi')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('quotation.list.description', 'Tüm teklifleri görüntüleyin ve yönetin')}
            </p>
          </div>
          <Button onClick={() => navigate('/quotations/create')} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('quotation.list.createNew', 'Yeni Teklif Oluştur')}
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('quotation.list.searchPlaceholder', 'Teklif no veya müşteri adı ile ara...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setPageNumber(1);
            }}
            className="gap-2"
          >
            <RefreshCw size={16} className="opacity-70" />
            {t('common.refresh', 'Yenile')}
          </Button>
        </div>

        <div className="relative z-10 bg-white/50 dark:bg-card/30 backdrop-blur-xl border border-white/20 dark:border-border/50 rounded-2xl shadow-sm dark:shadow-2xl overflow-hidden">
          <QuotationTable
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
    </div>
  );
}
