import { type ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Star, Trash2, Image as ImageIcon } from 'lucide-react';
import { useStockImages } from '../hooks/useStockImages';
import { useStockImageDelete } from '../hooks/useStockImageDelete';
import { useStockImageSetPrimary } from '../hooks/useStockImageSetPrimary';
import { getImageUrl } from '../utils/image-url';
import type { StockImageDto } from '../types';

interface StockImageListProps {
  stockId: number;
}

export function StockImageList({ stockId }: StockImageListProps): ReactElement {
  const { t } = useTranslation();
  const { data: images, isLoading, isFetching } = useStockImages(stockId);
  const deleteImage = useStockImageDelete();
  const setPrimary = useStockImageSetPrimary();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<StockImageDto | null>(null);

  const handleDeleteClick = (image: StockImageDto): void => {
    setImageToDelete(image);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (imageToDelete) {
      await deleteImage.mutateAsync({
        id: imageToDelete.id,
        stockId,
      });
      setDeleteDialogOpen(false);
      setImageToDelete(null);
    }
  };

  const handleSetPrimary = async (image: StockImageDto): Promise<void> => {
    await setPrimary.mutateAsync({
      id: image.id,
      stockId,
    });
  };

  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">
          {t('common.loading', 'Yükleniyor...')}
        </div>
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>{t('stock.images.noImages', 'Henüz görsel yüklenmemiş')}</p>
      </div>
    );
  }

  const sortedImages = [...images].sort((a, b) => {
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    return a.sortOrder - b.sortOrder;
  });

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedImages.map((image) => (
          <div
            key={image.id}
            className="relative group border rounded-lg overflow-hidden"
          >
            {image.isPrimary && (
              <Badge
                className="absolute top-2 left-2 z-10"
                variant="default"
              >
                <Star className="h-3 w-3 mr-1" />
                {t('stock.images.primary', 'Ana')}
              </Badge>
            )}
            <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
              <img
                src={getImageUrl(image.filePath) || ''}
                alt={image.altText || image.stockName || 'Stock image'}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
            <div className="p-2 space-y-2">
              <Input
                type="text"
                value={image.altText || ''}
                readOnly
                className="text-xs"
                placeholder={t('stock.images.altText', 'Alt text')}
              />
              <div className="flex gap-1">
                {!image.isPrimary && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSetPrimary(image)}
                    disabled={setPrimary.isPending}
                  >
                    <Star className="h-3 w-3 mr-1" />
                    {t('stock.images.setPrimary', 'Ana Yap')}
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteClick(image)}
                  disabled={deleteImage.isPending}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('stock.images.deleteConfirm', 'Görseli Sil')}
            </DialogTitle>
            <DialogDescription>
              {t('stock.images.deleteConfirmMessage', 'Bu görseli silmek istediğinizden emin misiniz?')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteImage.isPending}
            >
              {t('common.cancel', 'İptal')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteImage.isPending}
            >
              {deleteImage.isPending
                ? t('common.loading', 'Yükleniyor...')
                : t('common.delete', 'Sil')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
