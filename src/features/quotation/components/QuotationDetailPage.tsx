import { type ReactElement, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuotation } from '../api/quotation-api';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { formatCurrency } from '../utils/format-currency';

export function QuotationDetailPage(): ReactElement {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setPageTitle } = useUIStore();
  const quotationId = id ? parseInt(id, 10) : 0;

  const { data: quotation, isLoading } = useQuotation(quotationId);

  useEffect(() => {
    if (quotation) {
      setPageTitle(
        t('quotation.detail.title', 'Teklif Detayı: {{offerNo}}', {
          offerNo: quotation.offerNo || `#${quotation.id}`,
        })
      );
    } else {
      setPageTitle(t('quotation.detail.title', 'Teklif Detayı'));
    }
    return () => {
      setPageTitle(null);
    };
  }, [quotation, t, setPageTitle]);

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-lg font-medium text-muted-foreground mb-4">
          {t('quotation.detail.notFound', 'Teklif bulunamadı')}
        </p>
        <Button variant="outline" onClick={() => navigate('/quotations/create')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back', 'Geri')}
        </Button>
      </div>
    );
  }

  const currencyCode = quotation.currency || 'TRY';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/quotations/create')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back', 'Geri')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('quotation.detail.quotationInfo', 'Teklif Bilgileri')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('quotation.detail.offerNo', 'Teklif No')}
              </p>
              <p className="text-sm">{quotation.offerNo || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('quotation.detail.customer', 'Müşteri')}
              </p>
              <p className="text-sm">{quotation.potentialCustomerName || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('quotation.detail.representative', 'Temsilci')}
              </p>
              <p className="text-sm">{quotation.representativeName || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('quotation.detail.currency', 'Para Birimi')}
              </p>
              <p className="text-sm">{quotation.currency}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('quotation.detail.offerDate', 'Teklif Tarihi')}
              </p>
              <p className="text-sm">{formatDate(quotation.offerDate)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('quotation.detail.deliveryDate', 'Teslimat Tarihi')}
              </p>
              <p className="text-sm">{formatDate(quotation.deliveryDate)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('quotation.detail.total', 'Toplam')}
              </p>
              <p className="text-sm font-semibold">
                {formatCurrency(quotation.total, currencyCode)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('quotation.detail.grandTotal', 'Genel Toplam')}
              </p>
              <p className="text-sm font-semibold">
                {formatCurrency(quotation.grandTotal, currencyCode)}
              </p>
            </div>
          </div>
          {quotation.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('quotation.detail.description', 'Açıklama')}
              </p>
              <p className="text-sm">{quotation.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('quotation.detail.lines', 'Teklif Satırları')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('quotation.detail.productCode', 'Ürün Kodu')}</TableHead>
                  <TableHead>{t('quotation.detail.productName', 'Ürün Adı')}</TableHead>
                  <TableHead className="text-right">
                    {t('quotation.detail.quantity', 'Miktar')}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('quotation.detail.unitPrice', 'Birim Fiyat')}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('quotation.detail.lineTotal', 'Satır Toplamı')}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('quotation.detail.lineGrandTotal', 'Satır Genel Toplamı')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotation.lines && quotation.lines.length > 0 ? (
                  quotation.lines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>{line.productCode || '-'}</TableCell>
                      <TableCell>{line.productName}</TableCell>
                      <TableCell className="text-right">{line.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(line.unitPrice, currencyCode)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(line.lineTotal, currencyCode)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(line.lineGrandTotal, currencyCode)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      {t('quotation.detail.noLines', 'Satır bulunamadı')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
