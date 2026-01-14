import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import type { StockGetDto } from '../types';

interface StockBasicInfoProps {
  stock: StockGetDto;
}

export function StockBasicInfo({ stock }: StockBasicInfoProps): ReactElement {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {t('stock.detail.basicInfoReadonly', 'Temel bilgiler ERP sisteminden senkronize edilir ve değiştirilemez')}
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>
            {t('stock.detail.erpStockCode', 'ERP Stok Kodu')}
          </Label>
          <Input
            value={stock.erpStockCode || ''}
            readOnly
            disabled
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label>
            {t('stock.detail.stockName', 'Stok Adı')}
          </Label>
          <Input
            value={stock.stockName || ''}
            readOnly
            disabled
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label>
            {t('stock.detail.unit', 'Birim')}
          </Label>
          <Input
            value={stock.unit || '-'}
            readOnly
            disabled
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label>
            {t('stock.detail.ureticiKodu', 'Üretici Kodu')}
          </Label>
          <Input
            value={stock.ureticiKodu || '-'}
            readOnly
            disabled
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label>
            {t('stock.detail.grupKodu', 'Grup Kodu')}
          </Label>
          <Input
            value={stock.grupKodu || '-'}
            readOnly
            disabled
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label>
            {t('stock.detail.grupAdi', 'Grup Adı')}
          </Label>
          <Input
            value={stock.grupAdi || '-'}
            readOnly
            disabled
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label>
            {t('stock.detail.kod1', 'Kod 1')}
          </Label>
          <Input
            value={stock.kod1 || '-'}
            readOnly
            disabled
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label>
            {t('stock.detail.kod1Adi', 'Kod 1 Adı')}
          </Label>
          <Input
            value={stock.kod1Adi || '-'}
            readOnly
            disabled
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label>
            {t('stock.detail.kod2', 'Kod 2')}
          </Label>
          <Input
            value={stock.kod2 || '-'}
            readOnly
            disabled
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label>
            {t('stock.detail.kod2Adi', 'Kod 2 Adı')}
          </Label>
          <Input
            value={stock.kod2Adi || '-'}
            readOnly
            disabled
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label>
            {t('stock.detail.kod3', 'Kod 3')}
          </Label>
          <Input
            value={stock.kod3 || '-'}
            readOnly
            disabled
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label>
            {t('stock.detail.kod3Adi', 'Kod 3 Adı')}
          </Label>
          <Input
            value={stock.kod3Adi || '-'}
            readOnly
            disabled
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label>
            {t('stock.detail.kod4', 'Kod 4')}
          </Label>
          <Input
            value={stock.kod4 || '-'}
            readOnly
            disabled
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label>
            {t('stock.detail.kod4Adi', 'Kod 4 Adı')}
          </Label>
          <Input
            value={stock.kod4Adi || '-'}
            readOnly
            disabled
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label>
            {t('stock.detail.kod5', 'Kod 5')}
          </Label>
          <Input
            value={stock.kod5 || '-'}
            readOnly
            disabled
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label>
            {t('stock.detail.kod5Adi', 'Kod 5 Adı')}
          </Label>
          <Input
            value={stock.kod5Adi || '-'}
            readOnly
            disabled
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label>
            {t('stock.detail.branchCode', 'Şube Kodu')}
          </Label>
          <Input
            value={stock.branchCode || '-'}
            readOnly
            disabled
            className="bg-muted"
          />
        </div>

        {stock.createdAt && (
          <div className="space-y-2">
            <Label>
              {t('stock.detail.createdAt', 'Oluşturulma Tarihi')}
            </Label>
            <Input
              value={new Date(stock.createdAt).toLocaleString('tr-TR')}
              readOnly
              disabled
              className="bg-muted"
            />
          </div>
        )}

        {stock.updatedAt && (
          <div className="space-y-2">
            <Label>
              {t('stock.detail.updatedAt', 'Güncellenme Tarihi')}
            </Label>
            <Input
              value={new Date(stock.updatedAt).toLocaleString('tr-TR')}
              readOnly
              disabled
              className="bg-muted"
            />
          </div>
        )}
      </div>
    </div>
  );
}
