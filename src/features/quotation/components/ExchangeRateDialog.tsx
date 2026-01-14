import { type ReactElement, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useExchangeRate } from '@/services/hooks/useExchangeRate';
import { DollarSign, Edit2, Check, X } from 'lucide-react';
import type { QuotationExchangeRateFormState } from '../types/quotation-types';

interface ExchangeRateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exchangeRates: QuotationExchangeRateFormState[];
  onSave: (rates: QuotationExchangeRateFormState[]) => void;
}

export function ExchangeRateDialog({
  open,
  onOpenChange,
  exchangeRates,
  onSave,
}: ExchangeRateDialogProps): ReactElement {
  const { t } = useTranslation();
  const { data: erpRates = [], isLoading } = useExchangeRate();
  const [localRates, setLocalRates] = useState<QuotationExchangeRateFormState[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (open && erpRates.length > 0) {
      const mappedRates: QuotationExchangeRateFormState[] = erpRates.map((rate, index) => {
        const existing = exchangeRates.find((er) => er.dovizTipi === rate.dovizTipi);
        return {
          id: existing?.id || `temp-${rate.dovizTipi}-${index}`,
          currency: existing?.currency || rate.dovizIsmi || String(rate.dovizTipi),
          exchangeRate: existing?.exchangeRate || rate.kurDegeri || 0,
          exchangeRateDate: existing?.exchangeRateDate || new Date().toISOString().split('T')[0],
          isOfficial: existing?.isOfficial ?? (rate.kurDegeri !== null && existing === undefined),
          dovizTipi: rate.dovizTipi,
        };
      });
      setLocalRates(mappedRates);
    }
  }, [open, erpRates, exchangeRates]);

  const handleRateChange = (id: string, value: number): void => {
    setLocalRates((prev) =>
      prev.map((rate) => {
        if (rate.id === id) {
          const originalRate = erpRates.find((er) => er.dovizTipi === rate.dovizTipi);
          const isChanged = originalRate?.kurDegeri !== value;
          return {
            ...rate,
            exchangeRate: value,
            isOfficial: !isChanged && originalRate?.kurDegeri !== null,
          };
        }
        return rate;
      })
    );
  };

  const handleSave = (): void => {
    onSave(localRates);
    onOpenChange(false);
  };

  const handleCancel = (): void => {
    setLocalRates([]);
    setEditingId(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t('quotation.exchangeRates.dialog.title', 'Döviz Kurları')}
          </DialogTitle>
          <DialogDescription>
            {t('quotation.exchangeRates.dialog.description', 'Kur değerlerini görüntüleyin ve gerekirse düzenleyin. Değiştirilen kurlar resmi kur olarak işaretlenmeyecektir.')}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">
              {t('common.loading', 'Yükleniyor...')}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('quotation.exchangeRates.currency', 'Para Birimi')}</TableHead>
                  <TableHead className="text-right">
                    {t('quotation.exchangeRates.rate', 'Kur Değeri')}
                  </TableHead>
                  <TableHead className="text-center">
                    {t('quotation.exchangeRates.status', 'Durum')}
                  </TableHead>
                  <TableHead className="text-center">
                    {t('common.actions', 'İşlemler')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localRates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      {t('quotation.exchangeRates.empty', 'Kur bulunamadı')}
                    </TableCell>
                  </TableRow>
                ) : (
                  localRates.map((rate) => {
                    const erpRate = erpRates.find((er) => er.dovizTipi === rate.dovizTipi);
                    const currencyCode = erpRate?.dovizIsmi || `DOVIZ_${rate.dovizTipi}`;
                    return (
                    <TableRow key={rate.id}>
                      <TableCell className="font-medium">{currencyCode}</TableCell>
                      <TableCell className="text-right">
                        {editingId === rate.id ? (
                          <Input
                            type="number"
                            step="0.0001"
                            min="0"
                            value={rate.exchangeRate}
                            onChange={(e) => handleRateChange(rate.id, parseFloat(e.target.value) || 0)}
                            className="w-32 ml-auto"
                            autoFocus
                          />
                        ) : (
                          <span className="font-semibold">{rate.exchangeRate.toFixed(4)}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {rate.isOfficial ? (
                          <Badge variant="default" className="bg-green-600">
                            {t('quotation.exchangeRates.official', 'Resmi')}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-orange-600">
                            {t('quotation.exchangeRates.custom', 'Özel')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingId === rate.id ? (
                          <div className="flex gap-2 justify-center">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingId(null)}
                              className="h-8 w-8 p-0"
                              title={t('common.save', 'Kaydet')}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const originalRate = erpRates.find((er) => er.dovizTipi === rate.dovizTipi);
                                handleRateChange(rate.id, originalRate?.kurDegeri || 0);
                                setEditingId(null);
                              }}
                              className="h-8 w-8 p-0"
                              title={t('common.cancel', 'İptal')}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingId(rate.id)}
                            className="h-8 w-8 p-0"
                            title={t('common.edit', 'Düzenle')}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            {t('common.cancel', 'İptal')}
          </Button>
          <Button type="button" onClick={handleSave} disabled={isLoading}>
            {t('common.save', 'Kaydet')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
