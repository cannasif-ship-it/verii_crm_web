import { type ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useStockRelations } from '../hooks/useStockRelations';
import { useStockRelationDelete } from '../hooks/useStockRelationDelete';
import type { StockRelationDto } from '../types';

interface StockRelationListProps {
  stockId: number;
}

export function StockRelationList({ stockId }: StockRelationListProps): ReactElement {
  const { t } = useTranslation();
  const { data: relations, isLoading } = useStockRelations(stockId);
  const deleteRelation = useStockRelationDelete();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [relationToDelete, setRelationToDelete] = useState<StockRelationDto | null>(null);

  const handleDeleteClick = (relation: StockRelationDto): void => {
    setRelationToDelete(relation);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (relationToDelete) {
      await deleteRelation.mutateAsync({
        id: relationToDelete.id,
        stockId,
      });
      setDeleteDialogOpen(false);
      setRelationToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="text-muted-foreground">
        {t('common.loading', 'Yükleniyor...')}
      </div>
    );
  }

  if (!relations || relations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{t('stock.relations.noRelations', 'Henüz bağlı stok eklenmemiş')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                {t('stock.relations.stockCode', 'Stok Kodu')}
              </TableHead>
              <TableHead>
                {t('stock.relations.stockName', 'Stok Adı')}
              </TableHead>
              <TableHead>
                {t('stock.relations.quantity', 'Miktar')}
              </TableHead>
              <TableHead>
                {t('stock.relations.isMandatory', 'Zorunlu')}
              </TableHead>
              <TableHead className="text-right">
                {t('stock.relations.actions', 'İşlemler')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {relations.map((relation) => (
              <TableRow key={relation.id}>
                <TableCell className="font-mono">
                  {relation.relatedStockCode || '-'}
                </TableCell>
                <TableCell className="font-medium">
                  {relation.relatedStockName || '-'}
                </TableCell>
                <TableCell>{relation.quantity}</TableCell>
                <TableCell>
                  {relation.isMandatory ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {t('stock.relations.mandatory', 'Zorunlu')}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      {t('stock.relations.optional', 'Opsiyonel')}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(relation)}
                    disabled={deleteRelation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {t('stock.relations.delete', 'Sil')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('stock.relations.deleteConfirm', 'Bağlı Stok Sil')}
            </DialogTitle>
            <DialogDescription>
              {t('stock.relations.deleteConfirmMessage', '{{name}} bağlı stokunu silmek istediğinizden emin misiniz?', {
                name: relationToDelete?.relatedStockName || '',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteRelation.isPending}
            >
              {t('common.cancel', 'İptal')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteRelation.isPending}
            >
              {deleteRelation.isPending
                ? t('common.loading', 'Yükleniyor...')
                : t('common.delete', 'Sil')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
