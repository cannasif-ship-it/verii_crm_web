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
        <div className="flex flex-col items-center gap-3">
           <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-current text-pink-500" />
           <span className="text-sm font-medium text-muted-foreground animate-pulse">
             {t('erpCustomerManagement.loading', 'Yükleniyor...')}
           </span>
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[500px]">
        <div className="text-muted-foreground bg-slate-50 dark:bg-white/5 px-8 py-6 rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-sm font-medium">
          {t('erpCustomerManagement.noData', 'Müşteri bulunamadı')}
        </div>
      </div>
    );
  }

  // Başlıklar tek satır kalsın, alta geçmesin
  const headStyle = `
    text-slate-500 dark:text-slate-400 
    font-bold text-xs uppercase tracking-wider 
    py-5 px-5 
    hover:text-pink-600 dark:hover:text-pink-400 
    transition-colors cursor-default 
    border-r border-slate-200 dark:border-white/[0.03] last:border-r-0
    whitespace-nowrap bg-slate-50/90 dark:bg-[#130822]/90
    text-left
  `;

  // Hücrelerde 'whitespace-nowrap' kaldırdık, böylece metin aşağıya akar (wrap olur).
  // 'align-top' ekledik ki çok satırlı verilerde yazı yukarıda dursun, ortada kalmasın.
  const cellStyle = `
    text-slate-600 dark:text-slate-400 
    px-5 py-4
    border-r border-slate-100 dark:border-white/[0.03] last:border-r-0
    text-sm align-top
  `;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white/40 dark:bg-[#1a1025]/40 backdrop-blur-sm min-h-[75vh] flex flex-col shadow-sm">
      <div className="flex-1 overflow-auto custom-scrollbar">
        <Table>
          <TableHeader className="sticky top-0 z-20 shadow-sm">
            <TableRow className="hover:bg-transparent border-b border-slate-200 dark:border-white/10">
              <TableHead className={headStyle}>{t('erpCustomerManagement.table.branchCode', 'Şube')}</TableHead>
              <TableHead className={headStyle}>{t('erpCustomerManagement.table.businessUnitCode', 'İş Birimi')}</TableHead>
              <TableHead className={headStyle}>{t('erpCustomerManagement.table.customerCode', 'Müşteri Kodu')}</TableHead>
              <TableHead className={headStyle}>{t('erpCustomerManagement.table.customerName', 'Müşteri Adı')}</TableHead>
              <TableHead className={headStyle}>{t('erpCustomerManagement.table.phone', 'Telefon')}</TableHead>
              <TableHead className={headStyle}>{t('erpCustomerManagement.table.email', 'E-posta')}</TableHead>
              <TableHead className={headStyle}>{t('erpCustomerManagement.table.city', 'Şehir')}</TableHead>
              <TableHead className={headStyle}>{t('erpCustomerManagement.table.district', 'İlçe')}</TableHead>
              <TableHead className={headStyle}>{t('erpCustomerManagement.table.address', 'Adres')}</TableHead>
              <TableHead className={headStyle}>{t('erpCustomerManagement.table.countryCode', 'Ülke')}</TableHead>
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
                <TableCell className={`${cellStyle} font-medium whitespace-nowrap`}>{customer.subeKodu}</TableCell>
                <TableCell className={`${cellStyle} whitespace-nowrap`}>{customer.isletmeKodu}</TableCell>
                <TableCell className={`${cellStyle} font-semibold text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors whitespace-nowrap`}>
                    {customer.cariKod}
                </TableCell>
                {/* Müşteri adı uzun olabilir, minimum genişlik verip wrap olmasını sağladık */}
                <TableCell className={`${cellStyle} text-slate-800 dark:text-slate-200 font-medium min-w-[200px]`}>
                    {customer.cariIsim || '-'}
                </TableCell>
                <TableCell className={`${cellStyle} whitespace-nowrap`}>{customer.cariTel || '-'}</TableCell>
                
                {/* E-posta alanı artık kesilmeyecek (min-w arttırıldı ve wrap aktif) */}
                <TableCell className={`${cellStyle} min-w-[200px] break-all`}>
                    {customer.email || '-'}
                </TableCell>
                
                <TableCell className={`${cellStyle} whitespace-nowrap`}>{customer.cariIl || '-'}</TableCell>
                <TableCell className={`${cellStyle} whitespace-nowrap`}>{customer.cariIlce || '-'}</TableCell>
                
                {/* Adres alanı için truncate kaldırıldı, genişlik arttırıldı */}
                <TableCell className={`${cellStyle} min-w-[300px] leading-relaxed`}>
                    {customer.cariAdres || '-'}
                </TableCell>
                
                <TableCell className={cellStyle}>{customer.ulkeKodu || '-'}</TableCell>
                <TableCell className={`${cellStyle} text-blue-500 hover:underline min-w-[150px] break-all`}>
                    {customer.web ? <a href={customer.web} target="_blank" rel="noreferrer">{customer.web}</a> : '-'}
                </TableCell>
                <TableCell className={`${cellStyle} font-mono text-xs whitespace-nowrap`}>{customer.vergiNumarasi || '-'}</TableCell>
                <TableCell className={`${cellStyle} whitespace-nowrap`}>{customer.vergiDairesi || '-'}</TableCell>
                <TableCell className={`${cellStyle} font-mono text-xs whitespace-nowrap`}>{customer.tcknNumber || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}