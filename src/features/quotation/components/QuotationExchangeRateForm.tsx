import { type ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { useCurrencyOptions } from '@/services/hooks/useCurrencyOptions';
import type { QuotationExchangeRateFormState } from '../types/quotation-types';

interface QuotationExchangeRateFormProps {
  exchangeRates: QuotationExchangeRateFormState[];
  setExchangeRates: (rates: QuotationExchangeRateFormState[]) => void;
  baseCurrency: number;
}

export function QuotationExchangeRateForm({
  exchangeRates,
  setExchangeRates,
}: QuotationExchangeRateFormProps): ReactElement {
  const { t } = useTranslation();
  const { currencyOptions } = useCurrencyOptions();
  const [newDovizTipi, setNewDovizTipi] = useState<number | ''>('');
  const [newExchangeRate, setNewExchangeRate] = useState('');
  const [newExchangeRateDate, setNewExchangeRateDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [newIsOfficial, setNewIsOfficial] = useState(false);

  const handleAdd = (): void => {
    if (!newDovizTipi || !newExchangeRate || !newExchangeRateDate) return;

    const selectedCurrency = currencyOptions.find((opt) => opt.dovizTipi === newDovizTipi);
    if (!selectedCurrency) return;

    const existingRate = exchangeRates.find((er) => er.dovizTipi === newDovizTipi);
    if (existingRate) {
      return;
    }

    const newRate: QuotationExchangeRateFormState = {
      id: `temp-${Date.now()}`,
      currency: selectedCurrency.dovizIsmi || String(newDovizTipi),
      exchangeRate: parseFloat(newExchangeRate),
      exchangeRateDate: newExchangeRateDate,
      isOfficial: newIsOfficial,
      dovizTipi: newDovizTipi,
    };

    setExchangeRates([...exchangeRates, newRate]);
    setNewDovizTipi('');
    setNewExchangeRate('');
    setNewExchangeRateDate(new Date().toISOString().split('T')[0]);
    setNewIsOfficial(false);
  };

  const handleDelete = (id: string): void => {
    setExchangeRates(exchangeRates.filter((rate) => rate.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {t('quotation.exchangeRates.title', 'Döviz Kurları')}
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5 items-end">
        <div>
          <Label>{t('quotation.exchangeRates.currency', 'Para Birimi')}</Label>
          <Select
            value={newDovizTipi === '' ? undefined : String(newDovizTipi)}
            onValueChange={(value) => setNewDovizTipi(parseInt(value, 10))}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('quotation.exchangeRates.selectCurrency', 'Para Birimi Seç')} />
            </SelectTrigger>
            <SelectContent>
              {currencyOptions
                .filter((opt) => !exchangeRates.some((er) => er.dovizTipi === opt.dovizTipi))
                .map((opt) => (
                  <SelectItem key={opt.dovizTipi} value={String(opt.dovizTipi)}>
                    {opt.code} - {opt.label} {opt.kurDegeri ? `(${opt.kurDegeri})` : ''}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{t('quotation.exchangeRates.rate', 'Kur')}</Label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            value={newExchangeRate}
            onChange={(e) => setNewExchangeRate(e.target.value)}
            placeholder="1.00"
          />
        </div>
        <div>
          <Label>{t('quotation.exchangeRates.date', 'Kur Tarihi')}</Label>
          <Input
            type="date"
            value={newExchangeRateDate}
            onChange={(e) => setNewExchangeRateDate(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={newIsOfficial}
            onCheckedChange={setNewIsOfficial}
            id="isOfficial"
          />
          <Label htmlFor="isOfficial">
            {t('quotation.exchangeRates.isOfficial', 'Resmi Kur')}
          </Label>
        </div>
        <Button type="button" onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t('common.add', 'Ekle')}
        </Button>
      </div>

      {exchangeRates.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('quotation.exchangeRates.currency', 'Para Birimi')}</TableHead>
                <TableHead className="text-right">
                  {t('quotation.exchangeRates.rate', 'Kur')}
                </TableHead>
                <TableHead>{t('quotation.exchangeRates.date', 'Kur Tarihi')}</TableHead>
                <TableHead>{t('quotation.exchangeRates.isOfficial', 'Resmi Kur')}</TableHead>
                <TableHead>{t('common.actions', 'İşlemler')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exchangeRates.map((rate) => {
                const currencyCode = rate.currency || (rate.dovizTipi ? `DOVIZ_${rate.dovizTipi}` : '');
                return (
                <TableRow key={rate.id}>
                  <TableCell>{currencyCode}</TableCell>
                  <TableCell className="text-right">{rate.exchangeRate}</TableCell>
                  <TableCell>{rate.exchangeRateDate}</TableCell>
                  <TableCell>
                    {rate.isOfficial
                      ? t('common.yes', 'Evet')
                      : t('common.no', 'Hayır')}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(rate.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
