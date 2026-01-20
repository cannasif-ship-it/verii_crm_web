import { type ReactElement, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuotation } from '../api/quotation-api';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
    ArrowLeft, 
    FileText, 
    Calendar, 
    User, 
    Building2, 
    CreditCard, 
    Truck, 
    FileBox,
    Banknote,
    Hash
} from 'lucide-react';
import { formatCurrency } from '../utils/format-currency';
import { cn } from '@/lib/utils';

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

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  // Not Found State
  if (!quotation) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="p-6 bg-slate-50 dark:bg-zinc-900 rounded-full border border-slate-200 dark:border-white/10">
            <FileText className="h-12 w-12 text-slate-400" />
        </div>
        <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('quotation.detail.notFound', 'Teklif Bulunamadı')}</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Aradığınız teklif kaydı silinmiş veya mevcut değil.
            </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/quotations')} className="rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.backToQuotations', 'Tekliflere Dön')}
        </Button>
      </div>
    );
  }

  const currencyCode = quotation.currency || 'TRY';

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      
      {/* HEADER ACTION BAR */}
      <div className="flex items-center justify-between">
        <Button 
            variant="outline" 
            onClick={() => navigate('/quotations')}
            className="group h-10 px-4 rounded-xl border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-2 text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-white" />
          {t('common.back', 'Geri')}
        </Button>
        
        <div className="flex gap-3">
            {/* Buraya Yazdır, Düzenle, Onayla gibi butonlar gelebilir */}
            {/* <Button variant="secondary" className="rounded-xl">Yazdır</Button> */}
        </div>
      </div>

      {/* --- INFO CARDS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CARD 1: TEMEL BİLGİLER */}
        <Card className="border-none shadow-md bg-white/80 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200/50 dark:border-white/5">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-white/5">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-zinc-800 dark:text-zinc-100">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md text-blue-600 dark:text-blue-400">
                        <FileText className="h-4 w-4" />
                    </div>
                    {t('quotation.detail.quotationInfo', 'Teklif Künyesi')}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <InfoRow 
                    label={t('quotation.detail.offerNo', 'Teklif No')} 
                    value={quotation.offerNo} 
                    icon={Hash} 
                    highlight 
                />
                <InfoRow 
                    label={t('quotation.detail.offerDate', 'Teklif Tarihi')} 
                    value={formatDate(quotation.offerDate)} 
                    icon={Calendar} 
                />
                <InfoRow 
                    label={t('quotation.detail.deliveryDate', 'Teslimat Tarihi')} 
                    value={formatDate(quotation.deliveryDate)} 
                    icon={Truck} 
                />
                <InfoRow 
                    label={t('quotation.detail.currency', 'Para Birimi')} 
                    value={quotation.currency} 
                    icon={Banknote} 
                />
            </CardContent>
        </Card>

        {/* CARD 2: MÜŞTERİ & TEMSİLCİ */}
        <Card className="border-none shadow-md bg-white/80 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200/50 dark:border-white/5">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-white/5">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-zinc-800 dark:text-zinc-100">
                    <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-md text-orange-600 dark:text-orange-400">
                        <User className="h-4 w-4" />
                    </div>
                    {t('quotation.detail.parties', 'İlgili Kişiler')}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div className="space-y-1">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide flex items-center gap-1.5">
                        <Building2 className="w-3 h-3" /> {t('quotation.detail.customer', 'Müşteri')}
                    </span>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                        {quotation.potentialCustomerName || '-'}
                    </p>
                </div>
                <Separator className="bg-zinc-100 dark:bg-white/5" />
                <div className="space-y-1">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide flex items-center gap-1.5">
                        <User className="w-3 h-3" /> {t('quotation.detail.representative', 'Satış Temsilcisi')}
                    </span>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                        {quotation.representativeName || '-'}
                    </p>
                </div>
            </CardContent>
        </Card>

        {/* CARD 3: TUTARLAR */}
        <Card className="border-none shadow-md bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200/50 dark:border-white/5">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-white/5">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-zinc-800 dark:text-zinc-100">
                    <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-md text-green-600 dark:text-green-400">
                        <CreditCard className="h-4 w-4" />
                    </div>
                    {t('quotation.detail.financials', 'Finansal Özet')}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-500">{t('quotation.detail.total', 'Ara Toplam')}</span>
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
                        {formatCurrency(quotation.total, currencyCode)}
                    </span>
                </div>
                {/* İndirim, KDV gibi alanlar varsa buraya eklenebilir */}
                
                <Separator className="bg-zinc-200 dark:bg-white/10" />
                
                <div className="flex justify-between items-center pt-1">
                    <span className="text-base font-bold text-zinc-800 dark:text-white">{t('quotation.detail.grandTotal', 'Genel Toplam')}</span>
                    <Badge variant="outline" className="text-lg px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 font-bold">
                        {formatCurrency(quotation.grandTotal, currencyCode)}
                    </Badge>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* AÇIKLAMA ALANI (VARSA) */}
      {quotation.description && (
        <Card className="bg-zinc-50/50 dark:bg-zinc-900/30 border-dashed border-zinc-200 dark:border-white/10 shadow-none">
            <CardContent className="pt-6 flex gap-4">
                <FileBox className="h-5 w-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">{t('quotation.detail.description', 'Teklif Notu')}</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {quotation.description}
                    </p>
                </div>
            </CardContent>
        </Card>
      )}

      {/* --- LINES TABLE --- */}
      <Card className="border-none shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200 dark:border-white/5 overflow-hidden">
        <CardHeader className="bg-zinc-50/50 dark:bg-white/5 border-b border-zinc-100 dark:border-white/5 pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <div className="w-1.5 h-6 bg-pink-500 rounded-full" /> {/* Accent Bar */}
            {t('quotation.detail.lines', 'Teklif Satırları')}
            <Badge variant="secondary" className="ml-2 font-normal">
                {quotation.lines?.length || 0} {t('common.items', 'Kalem')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-zinc-100 dark:border-white/5 bg-zinc-50/30 dark:bg-zinc-900/50">
                  <TableHead className="w-[15%] font-semibold text-zinc-700 dark:text-zinc-300 pl-6">{t('quotation.detail.productCode', 'Ürün Kodu')}</TableHead>
                  <TableHead className="w-[35%] font-semibold text-zinc-700 dark:text-zinc-300">{t('quotation.detail.productName', 'Ürün Adı')}</TableHead>
                  <TableHead className="w-[10%] text-right font-semibold text-zinc-700 dark:text-zinc-300">{t('quotation.detail.quantity', 'Miktar')}</TableHead>
                  <TableHead className="w-[15%] text-right font-semibold text-zinc-700 dark:text-zinc-300">{t('quotation.detail.unitPrice', 'Birim Fiyat')}</TableHead>
                  <TableHead className="w-[15%] text-right font-semibold text-zinc-700 dark:text-zinc-300">{t('quotation.detail.lineTotal', 'Ara Toplam')}</TableHead>
                  <TableHead className="w-[10%] text-right font-semibold text-zinc-700 dark:text-zinc-300 pr-6">{t('quotation.detail.lineGrandTotal', 'Genel Toplam')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotation.lines && quotation.lines.length > 0 ? (
                  quotation.lines.map((line, index) => (
                    <TableRow 
                        key={line.id} 
                        className={cn(
                            "border-zinc-100 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors",
                            index % 2 === 0 ? "bg-white dark:bg-transparent" : "bg-zinc-50/30 dark:bg-white/[0.02]"
                        )}
                    >
                      <TableCell className="font-mono text-xs text-zinc-500 pl-6">
                        {line.productCode || '-'}
                      </TableCell>
                      <TableCell className="font-medium text-zinc-800 dark:text-zinc-200">
                        {line.productName}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <Badge variant="outline" className="bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono">
                            {line.quantity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-zinc-600 dark:text-zinc-300">
                        {formatCurrency(line.unitPrice, currencyCode)}
                      </TableCell>
                      <TableCell className="text-right text-zinc-600 dark:text-zinc-300">
                        {formatCurrency(line.lineTotal, currencyCode)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-zinc-900 dark:text-white pr-6">
                        {formatCurrency(line.lineGrandTotal, currencyCode)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileBox className="h-8 w-8 text-zinc-300" />
                        <p>{t('quotation.detail.noLines', 'Satır bulunamadı')}</p>
                      </div>
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

// --- YARDIMCI BİLEŞEN ---
function InfoRow({ 
    label, 
    value, 
    icon: Icon, 
    highlight = false 
}: { 
    label: string, 
    value?: string | null, 
    icon?: any,
    highlight?: boolean
}) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-500">
                {Icon && <Icon className="w-3.5 h-3.5 opacity-70" />}
                <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
            </div>
            <span className={cn(
                "text-sm font-medium truncate pl-4",
                highlight ? "text-pink-600 dark:text-pink-400 font-bold" : "text-zinc-900 dark:text-zinc-200",
                !value && "text-zinc-400 italic font-normal"
            )}>
                {value || '-'}
            </span>
        </div>
    )
}