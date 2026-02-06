import { type ReactElement, useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { CariDto } from '@/services/erp-types';


interface ErpCustomerTableProps {
  customers: CariDto[];
  isLoading: boolean;
  visibleColumns: string[];
}

export const getColumnsConfig = (t: TFunction) => [
    { key: 'subeKodu', label: t('table.branchCode', 'Şube'), className: 'font-medium whitespace-nowrap' },
    { key: 'isletmeKodu', label: t('table.businessUnitCode', 'İş Birimi'), className: 'whitespace-nowrap' },
    { key: 'cariKod', label: t('table.customerCode', 'Müşteri Kodu'), className: 'font-semibold text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors whitespace-nowrap' },
    { key: 'cariIsim', label: t('table.customerName', 'Müşteri Adı'), className: 'text-slate-800 dark:text-slate-200 font-medium min-w-[200px]' },
    { key: 'cariTel', label: t('table.phone', 'Telefon'), className: 'whitespace-nowrap' },
    { key: 'email', label: t('table.email', 'E-posta'), className: 'min-w-[200px] break-all' },
    { key: 'cariIl', label: t('table.city', 'Şehir'), className: 'whitespace-nowrap' },
    { key: 'cariIlce', label: t('table.district', 'İlçe'), className: 'whitespace-nowrap' },
    { key: 'cariAdres', label: t('table.address', 'Adres'), className: 'min-w-[300px] leading-relaxed' },
    { key: 'ulkeKodu', label: t('table.countryCode', 'Ülke'), className: '' },
    { key: 'web', label: t('table.website', 'Web Sitesi'), className: 'text-blue-500 hover:underline min-w-[150px] break-all', isLink: true },
    { key: 'vergiNumarasi', label: t('table.taxNumber', 'Vergi No'), className: 'font-mono text-xs whitespace-nowrap' },
    { key: 'vergiDairesi', label: t('table.taxOffice', 'Vergi Dairesi'), className: 'whitespace-nowrap' },
    { key: 'tcknNumber', label: t('table.tcknNumber', 'TCKN'), className: 'font-mono text-xs whitespace-nowrap' },
];

export function ErpCustomerTable({ customers, isLoading, visibleColumns }: ErpCustomerTableProps): ReactElement {
  const { t } = useTranslation('erp-customer-management');

  const [sortConfig, setSortConfig] = useState<{ key: keyof CariDto | string; direction: 'asc' | 'desc' } | null>(null);
  
  const allColumns = getColumnsConfig(t);

  // Drag to Scroll Logic
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.clientX);
    setScrollLeft(scrollRef.current.scrollLeft);
    setStartY(e.clientY);
    setScrollTop(scrollRef.current.scrollTop);
    scrollRef.current.style.cursor = 'grabbing';
    scrollRef.current.style.userSelect = 'none';
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab';
      scrollRef.current.style.removeProperty('user-select');
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.clientX;
    const y = e.clientY;
    const walkX = (x - startX) * 2; // Increased scroll speed
    const walkY = (y - startY) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walkX;
    scrollRef.current.scrollTop = scrollTop - walkY;
  };

  const sortedCustomers = useMemo(() => {
    if (!sortConfig) return customers;

    return [...customers].sort((a: CariDto, b: CariDto) => {
      const key = sortConfig.key as keyof CariDto;
      
      const aValue = a[key] ? String(a[key]).toLowerCase() : '';
      const bValue = b[key] ? String(b[key]).toLowerCase() : '';

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [customers, sortConfig]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
           <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-current text-pink-500" />
           <span className="text-sm font-medium text-muted-foreground animate-pulse">
             {t('loading', 'Yükleniyor...')}
           </span>
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[500px]">
        <div className="text-muted-foreground bg-slate-50 dark:bg-white/5 px-8 py-6 rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-sm font-medium">
          {t('noData', 'Müşteri bulunamadı')}
        </div>
      </div>
    );
  }

  const headStyle = `
    text-slate-500 dark:text-slate-400 
    font-bold text-xs uppercase tracking-wider 
    py-4 px-5 
    hover:text-pink-600 dark:hover:text-pink-400 
    transition-colors cursor-pointer select-none
    border-r border-slate-200 dark:border-white/[0.03] last:border-r-0
    whitespace-nowrap bg-slate-50/90 dark:bg-[#130822]/90
    text-left
  `;

  const cellStyle = `
    text-slate-600 dark:text-slate-400 
    px-5 py-4
    border-r border-slate-100 dark:border-white/[0.03] last:border-r-0
    text-sm align-top
  `;

  return (
    <div className="flex flex-col gap-4 h-full">
        <div className="rounded-xl border border-white/5 dark:border-white/10 overflow-hidden bg-white/40 dark:bg-[#1a1025]/40 backdrop-blur-sm h-full flex flex-col shadow-sm">
            <div 
                ref={scrollRef}
                className="flex-1 overflow-auto w-full cursor-grab active:cursor-grabbing border border-white/5 rounded-2xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseUpOrLeave}
                onMouseUp={handleMouseUpOrLeave}
                onMouseMove={handleMouseMove}
            >
                <Table className="w-full min-w-[1200px]">
                    <TableHeader className="bg-[#151025] sticky top-0 z-10 shadow-sm">
                        <TableRow className="hover:bg-transparent border-b border-slate-200 dark:border-white/10">
                            {allColumns.filter(col => visibleColumns.includes(col.key)).map((col) => (
                                <TableHead 
                                    key={col.key} 
                                    className={headStyle}
                                    onClick={() => handleSort(col.key)}
                                >
                                    <div className="flex items-center gap-2">
                                        {col.label}
                                        {sortConfig?.key === col.key ? (
                                            sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-pink-500" /> : <ArrowDown size={14} className="text-pink-500" />
                                        ) : (
                                            <ArrowUpDown size={14} className="opacity-30 group-hover:opacity-100" />
                                        )}
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedCustomers.map((customer: CariDto, index: number) => (
                        <TableRow 
                            key={`${customer.cariKod}-${index}`}
                            className="border-b border-slate-100 dark:border-white/5 transition-colors duration-200 hover:bg-pink-50/40 dark:hover:bg-pink-500/5 group last:border-0"
                        >
                            {allColumns.filter(col => visibleColumns.includes(col.key)).map((col) => {
                                const cellKey = col.key as keyof CariDto;
                                return (
                                    <TableCell key={col.key} className={`${cellStyle} ${col.className}`}>
                                        {col.isLink && customer[cellKey] ? (
                                            <a href={String(customer[cellKey])} target="_blank" rel="noreferrer">{customer[cellKey]}</a>
                                        ) : (
                                            customer[cellKey] || '-'
                                        )}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    </div>
  );
}
