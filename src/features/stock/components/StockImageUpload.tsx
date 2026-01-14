import { type ReactElement, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { useStockImageUpload } from '../hooks/useStockImageUpload';

interface StockImageUploadProps {
  stockId: number;
}

export function StockImageUpload({ stockId }: StockImageUploadProps): ReactElement {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [altTexts, setAltTexts] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const uploadImages = useStockImageUpload();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
      setAltTexts((prev) => [...prev, ...files.map(() => '')]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number): void => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setAltTexts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAltTextChange = (index: number, value: string): void => {
    const newAltTexts = [...altTexts];
    newAltTexts[index] = value;
    setAltTexts(newAltTexts);
  };

  const handleUpload = async (): Promise<void> => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      await uploadImages.mutateAsync({
        stockId,
        files: selectedFiles,
        altTexts: altTexts.length > 0 ? altTexts : undefined,
      });

      setSelectedFiles([]);
      setAltTexts([]);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
      setAltTexts((prev) => [...prev, ...files.map(() => '')]);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">
          {t('stock.images.upload', 'Görselleri buraya sürükleyin veya tıklayın')}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('stock.images.uploadHint', 'Çoklu dosya seçimi desteklenir')}
        </p>
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <Label>
            {t('stock.images.selectedFiles', 'Seçilen Dosyalar')}
          </Label>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 border rounded"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{file.name}</p>
                  <Input
                    type="text"
                    placeholder={t('stock.images.altText', 'Alt text (opsiyonel)')}
                    value={altTexts[index] || ''}
                    onChange={(e) => handleAltTextChange(index, e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            onClick={handleUpload}
            disabled={uploadImages.isPending || uploading}
            className="w-full"
          >
            {uploadImages.isPending || uploading
              ? t('common.loading', 'Yükleniyor...')
              : t('stock.images.uploadButton', 'Görselleri Yükle')}
          </Button>
        </div>
      )}
    </div>
  );
}
