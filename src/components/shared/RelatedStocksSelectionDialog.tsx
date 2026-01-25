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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import type { StockRelationDto } from '@/features/stock/types';

interface RelatedStocksSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  relatedStocks: StockRelationDto[];
  onConfirm: (selectedStockIds: number[]) => void | Promise<void>;
}

export function RelatedStocksSelectionDialog({
  open,
  onOpenChange,
  relatedStocks,
  onConfirm,
}: RelatedStocksSelectionDialogProps): ReactElement {
  const { t } = useTranslation();
  const [selectedStockIds, setSelectedStockIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const mandatoryIds = new Set(
        relatedStocks.filter((stock) => stock.isMandatory).map((stock) => stock.relatedStockId)
      );
      setSelectedStockIds(mandatoryIds);
      setIsLoading(false);
    }
  }, [open, relatedStocks]);

  const handleToggleStock = (stockId: number, isMandatory: boolean): void => {
    if (isMandatory || isLoading) {
      return;
    }
    const newSelected = new Set(selectedStockIds);
    if (newSelected.has(stockId)) {
      newSelected.delete(stockId);
    } else {
      newSelected.add(stockId);
    }
    setSelectedStockIds(newSelected);
  };

  const handleConfirm = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await onConfirm(Array.from(selectedStockIds));
      onOpenChange(false);
    } catch (error) {
      console.error('Error confirming related stocks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const mandatoryStocks = relatedStocks.filter((stock) => stock.isMandatory);
  const optionalStocks = relatedStocks.filter((stock) => !stock.isMandatory);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isLoading && onOpenChange(isOpen)}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {t('relatedStocksSelectionDialog.title', 'Bağlı Stokları Seçin')}
          </DialogTitle>
          <DialogDescription>
            {t('relatedStocksSelectionDialog.description', 'Ana stok ile birlikte eklemek istediğiniz bağlı stokları seçin. Zorunlu stoklar otomatik olarak seçilidir.')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {mandatoryStocks.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                {t('relatedStocksSelectionDialog.mandatoryStocks', 'Zorunlu Stoklar')}
              </Label>
              <div className="space-y-2">
                {mandatoryStocks.map((stock) => (
                  <div
                    key={stock.id}
                    className="flex items-center justify-between p-3 rounded-md border bg-muted/30"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Checkbox checked={true} disabled />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-medium text-sm truncate">
                            {stock.relatedStockName || t('relatedStocksSelectionDialog.unknownStock', 'Bilinmeyen Stok')}
                          </div>
                          {stock.relatedStockCode && (
                            <span className="text-xs text-muted-foreground font-mono">
                              ({stock.relatedStockCode})
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t('relatedStocksSelectionDialog.quantity', 'Miktar')}: {stock.quantity}
                        </div>
                        {stock.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {stock.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant="default" className="ml-2 shrink-0">
                      {t('relatedStocksSelectionDialog.mandatory', 'Zorunlu')}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {optionalStocks.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                {t('relatedStocksSelectionDialog.optionalStocks', 'Opsiyonel Stoklar')}
              </Label>
              <div className="space-y-2">
                {optionalStocks.map((stock) => {
                  const isSelected = selectedStockIds.has(stock.relatedStockId);
                  return (
                    <div
                      key={stock.id}
                      className={`flex items-center justify-between p-3 rounded-md border transition-colors ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      } ${
                        isSelected ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => !isLoading && handleToggleStock(stock.relatedStockId, stock.isMandatory)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleStock(stock.relatedStockId, stock.isMandatory)}
                          onClick={(e) => e.stopPropagation()}
                          disabled={isLoading}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-medium text-sm truncate">
                              {stock.relatedStockName || t('relatedStocksSelectionDialog.unknownStock', 'Bilinmeyen Stok')}
                            </div>
                            {stock.relatedStockCode && (
                              <span className="text-xs text-muted-foreground font-mono">
                                ({stock.relatedStockCode})
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {t('relatedStocksSelectionDialog.quantity', 'Miktar')}: {stock.quantity}
                          </div>
                          {stock.description && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {stock.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {relatedStocks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {t('relatedStocksSelectionDialog.noRelatedStocks', 'Bağlı stok bulunamadı')}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {t('relatedStocksSelectionDialog.cancel', 'İptal')}
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('relatedStocksSelectionDialog.calculating', 'Hesaplanıyor...')}
              </>
            ) : (
              t('relatedStocksSelectionDialog.add', 'Ekle')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
