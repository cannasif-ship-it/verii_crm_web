import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { CariDto } from '@/services/erp-types';

interface ErpCustomerTableProps {
  customers: CariDto[];
  isLoading: boolean;
}

export function ErpCustomerTable({ customers, isLoading }: ErpCustomerTableProps): ReactElement {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[500px]">
        <div className="flex flex-col items-center gap-2">
           <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-current text-pink-500" />
           <div className="text-sm text-muted-foreground animate-pulse">
             {t('erpCustomerManagement.loading', 'Yükleniyor...')}
           </div>
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[500px]">
        <div className="text-muted-foreground bg-slate-50 dark:bg-white/5 px-8 py-6 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
          {t('erpCustomerManagement.noData', 'Müşteri bulunamadı')}
        </div>
      </div>
    );
  }

  const headStyle = `
    text-slate-500 dark:text-slate-400 
    font-bold text-xs uppercase tracking-wider 
    py-4 px-4 
    hover:text-pink-600 dark:hover:text-pink-400 
    transition-colors cursor-default 
    border-r border-slate-200 dark:border-white/10 last:border-r-0
    whitespace-nowrap
  `;

  const cellStyle = `
    text-slate-600 dark:text-slate-400 
    px-4 py-3 
    border-r border-slate-100 dark:border-white/5 last:border-r-0
  `;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white/40 dark:bg-[#1a1025]/40 backdrop-blur-sm min-h-[75vh] flex flex-col">
      <div className="flex-1 overflow-auto custom-scrollbar">
        <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-[#130822]/80 border-b border-slate-200 dark:border-white/10 sticky top-0 z-10 backdrop-blur-md">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className={headStyle}>{t('erpCustomerManagement.table.branchCode', 'Şube')}</TableHead>
              <TableHead className={headStyle}>{t('erpCustomerManagement.table.businessUnitCode', 'İş Birimi')}</TableHead>
              <TableHead className={headStyle}>{t('erpCustomerManagement.table.customerCode', 'Müşteri Kodu')}</TableHead>
              <TableHead className={headStyle}>{t('erpCustomerManagement.table.customerName', 'Müşteri Adı')}</TableHead>
              <TableHead className={headStyle}>{t('erpCustomerManagement.table.phone', 'Telefon')}</TableHead>
              <TableHead className={headStyle}>{t('erpCustomerManagement.table.city', 'Şehir')}</TableHead>
              <TableHead className={headStyle}>{t('erpCustomerManagement.table.district', 'İlçe')}</TableHead>
              <TableHead className={headStyle}>{t('erpCustomerManagement.table.address', 'Adres')}</TableHead>
              <TableHead className={headStyle}>{t('erpCustomerManagement.table.countryCode', 'Ülke')}</TableHead>
              <TableHead className={headStyle}>{t('erpCustomerManagement.table.email', 'E-posta')}</TableHead>
              <TableHead className={headStyle}>{t('erpCustomerManagement.table.website', 'Web Sitesi')}</TableHead>
              <TableHead className={headStyle}>{t('erpCustomerManagement.table.taxNumber', 'Vergi No')}</TableHead>
              <TableHead className={headStyle}>{t('erpCustomerManagement.table.taxOffice', 'Vergi Dairesi')}</TableHead>
              <TableHead className={headStyle}>{t('erpCustomerManagement.table.tcknNumber', 'TCKN')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer, index) => (
              <TableRow 
                key={`${customer.cariKod}-${customer.subeKodu}-${index}`}
                className="border-b border-slate-100 dark:border-white/5 transition-colors duration-200 hover:bg-pink-50/40 dark:hover:bg-pink-500/5 group last:border-0"
              >
                <TableCell className={`${cellStyle} font-medium`}>{customer.subeKodu}</TableCell>
                <TableCell className={cellStyle}>{customer.isletmeKodu}</TableCell>
                <TableCell className={`${cellStyle} font-semibold text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors`}>
                    {customer.cariKod}
                </TableCell>
                <TableCell className={`${cellStyle} text-slate-800 dark:text-slate-200 font-medium whitespace-nowrap`}>{customer.cariIsim || '-'}</TableCell>
                <TableCell className={`${cellStyle} whitespace-nowrap`}>{customer.cariTel || '-'}</TableCell>
                <TableCell className={cellStyle}>{customer.cariIl || '-'}</TableCell>
                <TableCell className={cellStyle}>{customer.cariIlce || '-'}</TableCell>
                <TableCell className={`${cellStyle} max-w-[250px] truncate`} title={customer.cariAdres || ''}>
                    {customer.cariAdres || '-'}
                </TableCell>
                <TableCell className={cellStyle}>{customer.ulkeKodu || '-'}</TableCell>
                <TableCell className={cellStyle}>{customer.email || '-'}</TableCell>
                <TableCell className={cellStyle}>{customer.web || '-'}</TableCell>
                <TableCell className={`${cellStyle} font-mono text-xs`}>{customer.vergiNumarasi || '-'}</TableCell>
                <TableCell className={cellStyle}>{customer.vergiDairesi || '-'}</TableCell>
                <TableCell className={`${cellStyle} font-mono text-xs`}>{customer.tcknNumber || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}