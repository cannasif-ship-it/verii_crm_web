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
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">
          {t('common.loading', 'Yükleniyor...')}
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">
          {t('erpCustomerManagement.noData', 'Müşteri bulunamadı')}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              {t('erpCustomerManagement.table.branchCode', 'Şube Kodu')}
            </TableHead>
            <TableHead>
              {t('erpCustomerManagement.table.businessUnitCode', 'İş Birimi Kodu')}
            </TableHead>
            <TableHead>
              {t('erpCustomerManagement.table.customerCode', 'Müşteri Kodu')}
            </TableHead>
            <TableHead>
              {t('erpCustomerManagement.table.customerName', 'Müşteri Adı')}
            </TableHead>
            <TableHead>
              {t('erpCustomerManagement.table.phone', 'Telefon')}
            </TableHead>
            <TableHead>
              {t('erpCustomerManagement.table.city', 'Şehir')}
            </TableHead>
            <TableHead>
              {t('erpCustomerManagement.table.district', 'İlçe')}
            </TableHead>
            <TableHead>
              {t('erpCustomerManagement.table.address', 'Adres')}
            </TableHead>
            <TableHead>
              {t('erpCustomerManagement.table.countryCode', 'Ülke Kodu')}
            </TableHead>
            <TableHead>
              {t('erpCustomerManagement.table.email', 'E-posta')}
            </TableHead>
            <TableHead>
              {t('erpCustomerManagement.table.website', 'Web Sitesi')}
            </TableHead>
            <TableHead>
              {t('erpCustomerManagement.table.taxNumber', 'Vergi Numarası')}
            </TableHead>
            <TableHead>
              {t('erpCustomerManagement.table.taxOffice', 'Vergi Dairesi')}
            </TableHead>
            <TableHead>
              {t('erpCustomerManagement.table.tcknNumber', 'TCKN Numarası')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer, index) => (
            <TableRow 
              key={`${customer.cariKod}-${customer.subeKodu}-${index}`}
              className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}
            >
              <TableCell>{customer.subeKodu}</TableCell>
              <TableCell>{customer.isletmeKodu}</TableCell>
              <TableCell className="font-medium">{customer.cariKod}</TableCell>
              <TableCell>{customer.cariIsim || '-'}</TableCell>
              <TableCell>{customer.cariTel || '-'}</TableCell>
              <TableCell>{customer.cariIl || '-'}</TableCell>
              <TableCell>{customer.cariIlce || '-'}</TableCell>
              <TableCell>{customer.cariAdres || '-'}</TableCell>
              <TableCell>{customer.ulkeKodu || '-'}</TableCell>
              <TableCell>{customer.email || '-'}</TableCell>
              <TableCell>{customer.web || '-'}</TableCell>
              <TableCell>{customer.vergiNumarasi || '-'}</TableCell>
              <TableCell>{customer.vergiDairesi || '-'}</TableCell>
              <TableCell>{customer.tcknNumber || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
